import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const CargaMasivaView = ({ procesosExternos = [], setProcesosExternos, onResetDatabase }) => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            let rows = [];

            // Strip BOM character
            const stripBOM = (str) => str.replace(/^\uFEFF/, '');

            if (file.name.toLowerCase().endsWith('.csv')) {
                let content = stripBOM(event.target.result);
                content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
                const lines = content.split('\n');
                const firstLine = lines[0] || '';
                
                // Detect delimiter
                const semiCount = (firstLine.match(/;/g) || []).length;
                const commaCount = (firstLine.match(/,/g) || []).length;
                const tabCount = (firstLine.match(/\t/g) || []).length;
                let delimiter = ';';
                if (tabCount > semiCount && tabCount > commaCount) delimiter = '\t';
                else if (commaCount > semiCount) delimiter = ',';
                
                console.log('[CargaMasiva] Delimiter detected:', JSON.stringify(delimiter), 'Lines:', lines.length);
                
                rows = lines.map(line => {
                    let result = [];
                    let inQuotes = false;
                    let current = '';
                    for (let i = 0; i < line.length; i++) {
                        let c = line[i];
                        if (c === '"') {
                            inQuotes = !inQuotes;
                        } else if (c === delimiter && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += c;
                        }
                    }
                    result.push(current.trim());
                    return result;
                });

                // Case-insensitive header detection
                if (rows.length > 0 && rows[0][0] && rows[0][0].toLowerCase().includes('nombre')) {
                    console.log('[CargaMasiva] Header detected and removed:', rows[0].join(' | '));
                    rows.shift();
                }
            } else {
                // Parse .xlsx/.xls
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const excelRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
                
                rows = excelRows.map(row => {
                    const r = Array.isArray(row) ? row : [];
                    return Array.from({ length: 8 }, (_, i) => r[i] != null ? String(r[i]) : '');
                });

                if (rows.length > 0 && rows[0][0] && rows[0][0].toLowerCase().includes('nombre')) {
                    rows.shift();
                }
            }

            // Filter empty rows
            const validRows = rows.filter(row => {
                if (!Array.isArray(row)) return false;
                return row.some(cell => cell && String(cell).trim() !== '');
            });

            console.log('[CargaMasiva] Valid rows after filtering:', validRows.length);
            if (validRows.length > 0) {
                console.log('[CargaMasiva] First row columns:', validRows[0].length, '=> ', validRows[0].map((v,i) => `[${i}]=${v}`).join(' | '));
            }

            // Normalize function for key comparison
            const norm = (val) => {
                let s = String(val || '');
                s = s.replace(/"/g, '');
                s = s.replace(/\s+/g, '');
                s = s.replace(/\.0$/, '');
                s = s.toUpperCase();
                return s;
            };

            // Build lookup from existing processes
            const existingLookup = {};
            procesosExternos.forEach(p => {
                const k = norm(p.identificacion) + '||' + norm(p.numObligacion);
                existingLookup[k] = true;
            });

            console.log('[CargaMasiva] Existing keys count:', Object.keys(existingLookup).length);
            if (procesosExternos.length > 0) {
                const p0 = procesosExternos[0];
                console.log('[CargaMasiva] First existing key:', norm(p0.identificacion) + '||' + norm(p0.numObligacion));
            }

            // Excel date serial conversion + format normalization
            const parseDate = (val) => {
                const str = String(val || '').replace(/"/g, '').trim();
                
                // Excel serial number
                const num = Number(str);
                if (!isNaN(num) && num > 40000 && num < 60000) {
                    const d = new Date((num - 25569) * 86400 * 1000);
                    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                }
                
                // DD/MM/YYYY or D/M/YYYY format
                const slashParts = str.split('/');
                if (slashParts.length === 3) {
                    const day = slashParts[0].padStart(2, '0');
                    const month = slashParts[1].padStart(2, '0');
                    const year = slashParts[2];
                    if (year.length === 4) {
                        return `${year}-${month}-${day}`;
                    }
                }
                
                // Already YYYY-MM-DD
                return str;
            };

            let duplicados = 0;
            let nuevos = [];
            const addedKeys = new Set();
            let debugFileKey1 = '';
            let debugExistKey1 = '';

            if (procesosExternos.length > 0) {
                const p = procesosExternos[0];
                debugExistKey1 = norm(p.identificacion) + '||' + norm(p.numObligacion);
            }

            validRows.forEach((row, idx) => {
                // Pad to 8 columns
                while (row.length < 8) row.push('');

                const rawId = String(row[1] || '').replace(/"/g, '').trim();
                const rawObl = String(row[2] || '').replace(/"/g, '').trim();
                const identificacion = norm(rawId);
                const obligacion = norm(rawObl);

                if (!identificacion) return;

                const key = identificacion + '||' + obligacion;

                if (idx === 0) {
                    debugFileKey1 = key;
                    console.log('[CargaMasiva] First file key:', key, '| Exists?', !!existingLookup[key]);
                }

                if (existingLookup[key] || addedKeys.has(key)) {
                    duplicados++;
                } else {
                    const nombre = String(row[0] || '').replace(/"/g, '').trim();
                    const estado = String(row[3] || '').replace(/"/g, '').trim();
                    const fecha = parseDate(row[4]);
                    const valorStr = String(row[5] || '').replace(/"/g, '').replace(/\./g, '').replace(/,/g, '').trim();
                    const valor = parseFloat(valorStr) || 0;
                    const cuantia = String(row[6] || '').replace(/"/g, '').trim();
                    const prescripcion = String(row[7] || '').replace(/"/g, '').trim();

                    nuevos.push({
                        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                        identificacion: rawId,
                        nombre: nombre,
                        numObligacion: rawObl,
                        consecutivo: `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                        estadoProceso: estado || 'APERTURADO',
                        estado: estado || 'APERTURADO',
                        fechaInicio: fecha,
                        valor: valor,
                        cuantia: cuantia || 'Media',
                        prescripcion: prescripcion || 'Vigente',
                        funcionarioAsignado: "Sin Asignar",
                        pdfUrl: null,
                        notificaciones: { telefonica: [], personal: [], electronico: [] }
                    });
                    addedKeys.add(key);
                }
            });

            console.log('[CargaMasiva] Result => Duplicados:', duplicados, '| Nuevos:', nuevos.length);

            setTimeout(() => {
                setLoading(false);
                if (nuevos.length > 0 && setProcesosExternos) {
                    setProcesosExternos(prev => [...nuevos, ...prev]);
                }
                
                let msj = `Archivo procesado con exito!\n\n`;
                msj += `Filas leidas del archivo: ${validRows.length}\n`;
                msj += `Procesos actuales en sistema: ${procesosExternos.length}\n\n`;
                
                if (duplicados > 0) {
                    msj += `Se ignoraron ${duplicados} filas duplicadas (ya existen).\n`;
                }
                if (nuevos.length > 0) {
                    msj += `Se subieron y sincronizaron ${nuevos.length} nuevos procesos.\n`;
                } else if (duplicados > 0 && nuevos.length === 0) {
                    msj += `No se agregaron nuevos procesos a la base de datos.\n`;
                }
                
                // Show diagnostic when ALL rows are treated as new (unexpected)
                if (duplicados === 0 && nuevos.length === validRows.length && procesosExternos.length > 0) {
                    msj += `\n--- Diagnostico ---\n`;
                    msj += `Clave archivo fila 1: [${debugFileKey1}]\n`;
                    msj += `Clave sistema reg 1: [${debugExistKey1}]\n`;
                    msj += `Coinciden: ${debugFileKey1 === debugExistKey1 ? 'SI' : 'NO'}`;
                }
                
                alert(msj);
                e.target.value = null;
            }, 1500);
        };

        if (file.name.toLowerCase().endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["Nombre", "Identificacion", "Obligacion", "Estado", "Fecha Inicio", "Valor", "Cuantia", "Prescripcion"];
        const BOM = "\uFEFF";
        let csvContent = BOM + headers.join(";") + "\n";
        
        // Fila de ejemplo
        csvContent += '"Ejemplo S.A.S";123456789;F001;APERTURADO;2026-01-01;"1.500.000";Media;Vigente\n';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_actualizacion_masiva.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
                <h1 className="page-title" style={{ color: '#2c3e50', fontSize: '1.5rem', margin: 0 }}>
                    Actualización Masiva de Información (Cámara de Comercio)
                </h1>
                {onResetDatabase && (
                    <button 
                        onClick={onResetDatabase}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.95rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        title="Restaurar a los 50 procesos iniciales"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <polyline points="3 3 3 8 8 8"></polyline>
                        </svg>
                        Resetear Base de Datos
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '0', display: 'flex', justifyContent: 'center', backgroundColor: 'transparent', boxShadow: 'none' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    border: '2px dashed #b0bec5',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    padding: '4rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {/* Mockup Icon for Excel / File */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <svg width="60" height="80" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', color: '#37474f', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Arrastra tu archivo Excel aquí
                    </h2>
                    <p style={{ color: '#78909c', marginBottom: '2rem', fontSize: '1rem' }}>
                        o haz clic para seleccionar desde tu ordenador
                    </p>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".xlsx, .csv"
                        onChange={handleFileSelect}
                    />

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button style={{
                            backgroundColor: 'white',
                            color: 'var(--color-primary)',
                            border: '2px solid var(--color-primary)',
                            borderRadius: '24px',
                            padding: '0.8rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                            onClick={handleDownloadTemplate}
                        >
                            Descargar Plantilla
                        </button>
                        <button style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            padding: '0.8rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            opacity: loading ? 0.7 : 1
                        }}
                            onMouseOver={(e) => { if(!loading) e.target.style.backgroundColor = 'var(--color-primary-dark)' }}
                            onMouseOut={(e) => { if(!loading) e.target.style.backgroundColor = 'var(--color-primary)' }}
                            onClick={() => fileInputRef.current.click()}
                            disabled={loading}
                        >
                            {loading ? 'Procesando y Sincronizando...' : 'Seleccionar Archivo'}
                        </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#90a4ae' }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>Formatos soportados: .xlsx, .csv</p>
                        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-primary)' }}>Tamaño máximo permitido: 500 MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CargaMasivaView;
