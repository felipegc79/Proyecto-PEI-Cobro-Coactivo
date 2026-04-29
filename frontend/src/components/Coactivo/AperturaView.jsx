import React, { useState, useRef } from 'react';
import BuscadorDeudor from './BuscadorDeudor';
import FacturasList from './EstadoCuenta/FacturasList';
import MandamientoPreview, { MandamientoPDFContent } from './GeneracionMandamiento/MandamientoPreview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IndicadorAsignacion from '../Shared/IndicadorAsignacion';
import FichaTecnicaModal from './EstadoCuenta/FichaTecnicaModal';
import { Search } from 'lucide-react';

// ─── Base de datos simulada de contribuyentes (para búsqueda predictiva) ───
const DB_CONTRIBUYENTES = [
    { identificacion: '21302454', nombre: 'Maria Gomez', obligaciones: [{ num: 'PR-2026-001', concepto: 'Impuesto Predial', valor: 450000 }, { num: 'IC-2026-042', concepto: 'Industria y Comercio', valor: 890000 }] },
    { identificacion: '10234567', nombre: 'Juan Perez', obligaciones: [{ num: 'F001', concepto: 'Predial', valor: 35000 }, { num: 'F051', concepto: 'Industria y Comercio', valor: 120000 }] },
    { identificacion: '10456789', nombre: 'Pedro Rodriguez', obligaciones: [{ num: 'F003', concepto: 'Predial', valor: 2500000 }, { num: 'F052', concepto: 'Valorización', valor: 800000 }] },
    { identificacion: '10567890', nombre: 'Diana Lopez', obligaciones: [{ num: 'F004', concepto: 'Industria y Comercio', valor: 75000 }] },
    { identificacion: '10678901', nombre: 'Carlos Martinez', obligaciones: [{ num: 'F005', concepto: 'Predial', valor: 1800000 }, { num: 'F053', concepto: 'Alumbrado Público', valor: 45000 }] },
    { identificacion: '900100200', nombre: 'Empresa Soluciones S.A.S', obligaciones: [{ num: 'F006', concepto: 'Industria y Comercio', valor: 15000 }] },
    { identificacion: '10789012', nombre: 'Ana Fernandez', obligaciones: [{ num: 'F007', concepto: 'Predial', valor: 980000 }, { num: 'F054', concepto: 'Industria y Comercio', valor: 320000 }] },
    { identificacion: '10890123', nombre: 'Luis Garcia', obligaciones: [{ num: 'F008', concepto: 'Predial', valor: 3100000 }] },
    { identificacion: '900200300', nombre: 'Empresa Transporte S.A.S', obligaciones: [{ num: 'F009', concepto: 'Industria y Comercio', valor: 45000 }, { num: 'F055', concepto: 'Multas', valor: 250000 }] },
    { identificacion: '10901234', nombre: 'Carmen Torres', obligaciones: [{ num: 'F010', concepto: 'Predial', valor: 650000 }] },
    { identificacion: '11012345', nombre: 'Jorge Ramirez', obligaciones: [{ num: 'F011', concepto: 'Predial', valor: 2200000 }, { num: 'F056', concepto: 'Industria y Comercio', valor: 150000 }] },
    { identificacion: '900300400', nombre: 'Empresa Logística S.A.S', obligaciones: [{ num: 'F012', concepto: 'Industria y Comercio', valor: 30000 }] },
    { identificacion: '11123456', nombre: 'Patricia Morales', obligaciones: [{ num: 'F013', concepto: 'Predial', valor: 1500000 }] },
    { identificacion: '11234567', nombre: 'Andres Herrera', obligaciones: [{ num: 'F014', concepto: 'Predial', valor: 88000 }, { num: 'F057', concepto: 'Valorización', valor: 420000 }] },
    { identificacion: '900400500', nombre: 'Empresa Comercial S.A.S', obligaciones: [{ num: 'F015', concepto: 'Industria y Comercio', valor: 2800000 }] },
];

const AperturaView = ({ procesosExternos, setProcesosExternos, onAddProcess, userName }) => {
    const [deudorActual, setDeudorActual] = useState(null);
    const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]);
    const [mandamientoGenerado, setMandamientoGenerado] = useState(false);
    const [consecutivoProceso, setConsecutivoProceso] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showFichaTecnica, setShowFichaTecnica] = useState(false);
    const [showNuevoProcesoModal, setShowNuevoProcesoModal] = useState(false);
    const [nuevoProcesoForm, setNuevoProcesoForm] = useState({
        nombre: '',
        identificacion: '',
        numObligacion: '',
        valor: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        areaResponsable: 'Jurídica',
        funcionarioAsignado: userName || '',
    });
    // Predictive search state
    const [searchId, setSearchId] = useState('');
    const [foundContribuyente, setFoundContribuyente] = useState(null);
    const [searchError, setSearchError] = useState('');
    const pdfRef = useRef(null);

    // We remove the static mockFacturas from here and derive it dynamically later

    const handleSelectFactura = (facturaId, isSelected) => {
        if (isSelected) {
            setFacturasSeleccionadas([...facturasSeleccionadas, facturaId]);
        } else {
            setFacturasSeleccionadas(facturasSeleccionadas.filter(id => id !== facturaId));
        }
    };

    const procesarMandamiento = () => {
        if (facturasSeleccionadas.length === 0) {
            alert("Debe seleccionar al menos una factura para generar el mandamiento.");
            return;
        }

        if (pdfRef.current) {
            pdfRef.current.style.position = 'absolute';
            pdfRef.current.style.top = '0px';
            pdfRef.current.style.left = '0px';
            pdfRef.current.style.zIndex = '9999';

            setTimeout(() => {
                html2canvas(pdfRef.current, { 
                    scale: 2, useCORS: true, allowTaint: true, logging: false
                }).then((canvas) => {
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    let heightLeft = imgHeight;
                    let position = 0;
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                    while (heightLeft > 0) {
                        position = position - pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                        heightLeft -= pdfHeight;
                    }

                    const blob = pdf.output('blob');
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Mandamiento_Pago_${deudorActual.identificacion}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    pdfRef.current.style.top = '-10000px';
                    pdfRef.current.style.left = '-10000px';
                    pdfRef.current.style.zIndex = '-1';
                    setMandamientoGenerado(true);

                    // Transición automática: APERTURADO -> EN NOTIFICACION
                    if (setProcesosExternos && deudorActual.estadoProceso === 'APERTURADO') {
                        setProcesosExternos(prev => prev.map(p =>
                            p.id === deudorActual.id
                                ? { ...p, estadoProceso: 'EN NOTIFICACION', estado: 'EN NOTIFICACION' }
                                : p
                        ));
                        setDeudorActual(prev => ({ ...prev, estadoProceso: 'EN NOTIFICACION', estado: 'EN NOTIFICACION' }));
                    }
                }).catch(err => {
                    console.error("Error generating PDF:", err);
                    alert("Hubo un error al generar el PDF. Por favor intente de nuevo.");
                });
            }, 500);
        }
    };

    const onAprobar = () => {
        const nuevoConsecutivo = `CC-${new Date().getFullYear()}-${Math.floor(Math.random() * 8999) + 1000}`;
        setConsecutivoProceso(nuevoConsecutivo);
        
        // Sincronizar con el estado global (Seguimiento de Procesos)
        if (onAddProcess) {
            onAddProcess({
                id: Date.now().toString(),
                nombre: deudorActual.nombre,
                identificacion: deudorActual.identificacion,
                consecutivo: nuevoConsecutivo,
                estado: 'Aceptado',
                pdfUrl: pdfUrl,
                areaResponsable: 'Seguimiento y Control',
                funcionarioAsignado: 'Admin Seguimiento',
                notificaciones: {
                    telefonica: [],
                    personal: [],
                    electronico: []
                }
            });
        }
        
        alert(`Mandamiento Aprobado. Consecutivo generado: ${nuevoConsecutivo}. Sincronizado con Seguimiento de Procesos.`);
    };

    const onRechazar = () => {
        alert("Mandamiento Rechazado. Se requiere revisión.");
        setMandamientoGenerado(false);
    };

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;

    // Filtros de tabla
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroIdentificacion, setFiltroIdentificacion] = useState('');
    const [filtroObligacion, setFiltroObligacion] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    const mockProcesos = (procesosExternos || []).filter(p => p.estadoProceso === 'APERTURADO');

    // Filtros adicionales
    const [filtroCuantia, setFiltroCuantia] = useState('');
    const [filtroPrescripcion, setFiltroPrescripcion] = useState('');

    // Filtrado lógico
    const procesosFiltrados = mockProcesos.filter(p => {
        return p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
            p.identificacion.includes(filtroIdentificacion) &&
            p.numObligacion.toLowerCase().includes(filtroObligacion.toLowerCase()) &&
            (filtroCuantia === '' || p.cuantia === filtroCuantia) &&
            (filtroPrescripcion === '' || p.prescripcion === filtroPrescripcion) &&
            p.fechaInicio.includes(filtroFecha);
    });

    // Paginación lógica
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const registrosActuales = procesosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);
    const totalPaginas = Math.ceil(procesosFiltrados.length / registrosPorPagina) || 1;

    const onVerObligaciones = (proceso) => {
        setDeudorActual(proceso);
        setFacturasSeleccionadas([]);
        setMandamientoGenerado(false);
        setConsecutivoProceso(null);
        setPdfUrl(null);
    };

    // Crear nuevo proceso manualmente
    const handleCrearNuevoProceso = (e) => {
        e.preventDefault();
        const { nombre, identificacion, numObligacion, valor, fechaInicio, areaResponsable, funcionarioAsignado } = nuevoProcesoForm;
        if (!nombre || !identificacion || !numObligacion || !valor) {
            alert('Complete los campos obligatorios.');
            return;
        }
        const valorNum = parseFloat(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
        const cuantia = valorNum < 50000 ? 'Pequeña' : valorNum <= 2000000 ? 'Mediana' : 'Grande';
        const today2 = new Date();
        const diffTime = Math.abs(today2 - new Date(fechaInicio));
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        const prescripcion = diffYears > 5 ? 'Prescrita' : diffYears > 4.5 ? 'Por Prescribir' : 'Vigente';
        const nuevoConsecutivo = `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const nuevoProceso = {
            id: Date.now().toString(),
            identificacion,
            nombre,
            numObligacion,
            consecutivo: nuevoConsecutivo,
            estadoProceso: 'APERTURADO',
            estado: 'APERTURADO',
            fechaInicio,
            valor: valorNum,
            cuantia,
            prescripcion,
            areaResponsable: areaResponsable || 'Jurídica',
            funcionarioAsignado: funcionarioAsignado || userName || 'Sin Asignar',
            pdfUrl: null,
            notificaciones: { telefonica: [], personal: [], electronico: [] }
        };
        if (onAddProcess) onAddProcess(nuevoProceso);
        setShowNuevoProcesoModal(false);
        setNuevoProcesoForm({ nombre: '', identificacion: '', numObligacion: '', valor: '', fechaInicio: new Date().toISOString().split('T')[0], areaResponsable: 'Jurídica', funcionarioAsignado: userName || '' });
        alert(`Proceso creado exitosamente.\nConsecutivo: ${nuevoConsecutivo}\nEstado: APERTURADO`);
    };

    const facturasDelDeudor = deudorActual ? [
        { 
            id: deudorActual.numObligacion, 
            fuente: deudorActual.numObligacion.includes('F0') ? 'Predial' : 'ICA', 
            periodo: '2026-1', 
            valor: deudorActual.valor, 
            mora: true, 
            estado: 'En mora' 
        }
    ] : [];

    const onUploadExcel = () => {
        alert("Apertura del modal para carga masiva de archivos .xlsx / .csv (Asignar Órdenes)");
    };

    const exportToCSV = () => {
        const headers = ["Nombre", "Identificacion", "Obligacion", "Estado", "Fecha Inicio", "Valor", "Cuantia", "Prescripcion"];
        const rows = procesosFiltrados.map(p => [
            `"${p.nombre}"`, 
            p.identificacion, 
            p.numObligacion, 
            p.estadoProceso, 
            p.fechaInicio, 
            `"${p.valor.toLocaleString('es-CO')}"`, 
            p.cuantia, 
            p.prescripcion
        ]);
        
        // Use semicolon separator for Spanish Excel and add UTF-8 BOM for correct character encoding
        const BOM = "\uFEFF";
        let csvContent = BOM + headers.join(";") + "\n" 
            + rows.map(e => e.join(";")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "cartera_filtrada.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title">Apertura del Proceso Coactivo</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" onClick={() => setShowNuevoProcesoModal(true)} style={{ backgroundColor: '#4f46e5', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ➕ Crear Nuevo Proceso
                    </button>
                    <button className="btn" onClick={exportToCSV} style={{ backgroundColor: '#10b981', border: 'none' }}>
                        ⬇ Exportar CSV
                    </button>
                </div>
            </div>

            <p className="page-subtitle">
                Identifique al contribuyente, seleccione las obligaciones en mora y genere el Mandamiento de Pago.
            </p>

            <IndicadorAsignacion area="Jurídica - Apertura" funcionario={userName || "Carlos López (Abogado Asignado)"} />

            {!deudorActual ? (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Listado de Procesos Susceptibles de Cobro
                    </h3>


                    {/* Filtros UI */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nombre</label>
                            <input type="text" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Buscar..." value={filtroNombre} onChange={e => { setFiltroNombre(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Identificación</label>
                            <input type="text" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Buscar..." value={filtroIdentificacion} onChange={e => { setFiltroIdentificacion(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Obligación</label>
                            <input type="text" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Buscar..." value={filtroObligacion} onChange={e => { setFiltroObligacion(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cuantía</label>
                            <select className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} value={filtroCuantia} onChange={e => { setFiltroCuantia(e.target.value); setPaginaActual(1); }}>
                                <option value="">Todas</option>
                                <option value="Pequeña">Pequeña (&lt;$50k)</option>
                                <option value="Media">Media ($51k-$2M)</option>
                                <option value="Grande">Grande (&gt;$2M)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Prescripción</label>
                            <select className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} value={filtroPrescripcion} onChange={e => { setFiltroPrescripcion(e.target.value); setPaginaActual(1); }}>
                                <option value="">Todas</option>
                                <option value="Vigente">Vigente</option>
                                <option value="Por Prescribir">Por Prescribir (Riesgo)</option>
                                <option value="Prescrita">Prescrita</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Fecha de Inicio</label>
                            <input type="date" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} value={filtroFecha} onChange={e => { setFiltroFecha(e.target.value); setPaginaActual(1); }} />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fafafa', borderRadius: 'var(--radius-sm)' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                                    <th style={{ padding: '1rem' }}>Nombre</th>
                                    <th style={{ padding: '1rem' }}>Identificación</th>
                                    <th style={{ padding: '1rem' }}>Obligación</th>
                                    <th style={{ padding: '1rem' }}>Cuantía</th>
                                    <th style={{ padding: '1rem' }}>Prescripción</th>
                                    <th style={{ padding: '1rem' }}>Estado</th>
                                    <th style={{ padding: '1rem' }}>Fecha Inicio</th>
                                    <th style={{ padding: '1rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosActuales.map((proceso, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{proceso.nombre}</td>
                                        <td style={{ padding: '1rem' }}>{proceso.identificacion}</td>
                                        <td style={{ padding: '1rem' }}>{proceso.numObligacion}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                backgroundColor: proceso.cuantia === 'Grande' ? '#fee2e2' : proceso.cuantia === 'Media' ? '#fef3c7' : '#ecfdf5',
                                                color: proceso.cuantia === 'Grande' ? '#991b1b' : proceso.cuantia === 'Media' ? '#92400e' : '#065f46',
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                            }}>{proceso.cuantia}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                backgroundColor: proceso.prescripcion === 'Prescrita' ? '#f3f4f6' : proceso.prescripcion === 'Por Prescribir' ? '#fee2e2' : '#ecfdf5',
                                                color: proceso.prescripcion === 'Prescrita' ? '#374151' : proceso.prescripcion === 'Por Prescribir' ? '#dc2626' : '#059669',
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                            }}>{proceso.prescripcion}</span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>
                                            <span style={{ 
                                                color: proceso.estadoProceso === 'APERTURADO' ? '#3b82f6' :
                                                       proceso.estadoProceso === 'EN NOTIFICACION' ? '#f59e0b' :
                                                       proceso.estadoProceso === 'EN EJECUCION' ? '#8b5cf6' :
                                                       proceso.estadoProceso === 'EN MORA' ? '#ef4444' :
                                                       proceso.estadoProceso === 'EN LEVANTAMIENTO DE EMBARGO' ? '#06b6d4' :
                                                       '#10b981'
                                            }}>
                                                {proceso.estadoProceso}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{proceso.fechaInicio}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => onVerObligaciones(proceso)}
                                                disabled={proceso.estadoProceso !== 'APERTURADO'}
                                                style={{
                                                    fontSize: '0.85rem', padding: '0.4rem 0.8rem',
                                                    opacity: proceso.estadoProceso !== 'APERTURADO' ? 0.45 : 1,
                                                    cursor: proceso.estadoProceso !== 'APERTURADO' ? 'not-allowed' : 'pointer'
                                                }}
                                                title={proceso.estadoProceso !== 'APERTURADO' ? 'Solo disponible para procesos APERTURADOS' : 'Generar Mandamiento'}
                                            >
                                                Ver
                                            </button>
                                            <button
                                                className="btn"
                                                onClick={() => { setDeudorActual(proceso); setShowFichaTecnica(true); }}
                                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', backgroundColor: '#059669', border: 'none' }}
                                                title="Ficha Técnica"
                                            >
                                                Ficha
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación UI */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            className="btn btn-outline"
                            disabled={paginaActual === 1}
                            onClick={() => setPaginaActual(paginaActual - 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Ant.
                        </button>
                        <span style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Página {paginaActual} de {totalPaginas}</span>
                        <button
                            className="btn btn-outline"
                            disabled={paginaActual === totalPaginas}
                            onClick={() => setPaginaActual(paginaActual + 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Sig.
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem', borderBottom: '1px solid #c7d2fe', paddingBottom: '0.5rem' }}>
                            Información del Deudor y Estado del Proceso
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Identificación</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{deudorActual.identificacion}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nombre/Razón Social</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{deudorActual.nombre}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Estado del Proceso</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: deudorActual.estadoProceso === 'En Embargo' ? 'crimson' : '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: deudorActual.estadoProceso === 'En Embargo' ? 'crimson' : '#059669', display: 'inline-block' }}></span>
                                    {deudorActual.estadoProceso}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fecha Inicio</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{deudorActual.fechaInicio}</p>
                            </div>
                        </div>
                    </div>

                    <FacturasList
                        facturas={facturasDelDeudor}
                        seleccionadas={facturasSeleccionadas}
                        onSelect={handleSelectFactura}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '2rem' }}>
                        <button className="btn btn-outline" onClick={() => setDeudorActual(null)} style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderColor: '#4b5563', color: '#4b5563' }}>
                            Volver al Listado
                        </button>
                        <button className="btn" onClick={procesarMandamiento} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                            Generar Mandamiento
                        </button>
                    </div>
                </>
            )}

            {deudorActual && (
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                    <MandamientoPDFContent
                        ref={pdfRef}
                        deudor={deudorActual}
                        facturas={facturasDelDeudor.filter(f => facturasSeleccionadas.includes(f.id))}
                        resolucionNum={`RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`}
                        totalDeuda={facturasDelDeudor.filter(f => facturasSeleccionadas.includes(f.id)).reduce((a, b) => a + b.valor, 0)}
                        fechaFormat={`${new Date().getDate()} de ${new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date())} de ${new Date().getFullYear()}`}
                    />
                </div>
            )}

            {mandamientoGenerado && deudorActual && (
                <div className="card" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-primary)' }}>¡Mandamiento de Pago Generado Exitosamente!</h3>
                    <p>El documento ha sido descargado en su dispositivo (PDF).</p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {!consecutivoProceso ? (
                            <>
                                <button className="btn btn-outline" style={{ color: '#d32f2f', borderColor: '#d32f2f' }} onClick={onRechazar}>Rechazar Acto</button>
                                <button className="btn" onClick={onAprobar}>Aprobar (Notificar Multicanal)</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                    <strong>Trámite Aprobado:</strong> El proceso tiene asignado el consecutivo <strong>{consecutivoProceso}</strong>
                                </div>
                                <button className="btn btn-outline" onClick={() => {
                                    if (pdfUrl) {
                                        window.open(pdfUrl, '_blank');
                                    } else {
                                        alert("El documento no está disponible para visualización.");
                                    }
                                }}>
                                    Ver Mandamiento Generado
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ocultamiento de módulos inactivos */}
            {false && (
                <div className="card">
                    <h3>Historial de Procesos Previos</h3>
                    <p>Módulo en construcción...</p>
                </div>
            )}
            {/* Modal Ficha Técnica */}
            {showFichaTecnica && (
                <FichaTecnicaModal 
                    deudor={deudorActual} 
                    facturas={facturasDelDeudor} 
                    onClose={() => { setShowFichaTecnica(false); setDeudorActual(null); }} 
                />
            )}

            {/* Modal Crear Nuevo Proceso — con Buscador Predictivo */}
            {showNuevoProcesoModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card" style={{ width: '620px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Crear Nuevo Proceso</h2>
                            <button onClick={() => { setShowNuevoProcesoModal(false); setFoundContribuyente(null); setSearchId(''); setSearchError(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>El proceso quedará automáticamente en estado <strong>APERTURADO</strong>.</p>

                        {/* Buscador Predictivo por Cédula/NIT */}
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4338ca', display: 'block', marginBottom: '0.5rem' }}>
                                🔍 Buscar Contribuyente por Cédula / NIT
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="p-2"
                                    value={searchId}
                                    onChange={e => { setSearchId(e.target.value); setSearchError(''); }}
                                    placeholder="Ingrese Cédula o NIT..."
                                    style={{ flex: 1, border: '1px solid #a5b4fc', borderRadius: '4px' }}
                                />
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        if (!searchId.trim()) { setSearchError('Ingrese un número de identificación.'); return; }
                                        const found = DB_CONTRIBUYENTES.find(c => c.identificacion === searchId.trim());
                                        if (found) {
                                            setFoundContribuyente(found);
                                            setSearchError('');
                                            const firstObl = found.obligaciones[0];
                                            setNuevoProcesoForm(prev => ({
                                                ...prev,
                                                identificacion: found.identificacion,
                                                nombre: found.nombre,
                                                numObligacion: firstObl.num,
                                                valor: firstObl.valor,
                                            }));
                                        } else {
                                            setFoundContribuyente(null);
                                            setSearchError('Contribuyente no encontrado en la base de datos. Puede ingresar los datos manualmente.');
                                        }
                                    }}
                                    style={{ backgroundColor: '#4338ca', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem' }}
                                >
                                    <Search size={16} /> Buscar
                                </button>
                            </div>
                            {searchError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>{searchError}</p>}
                            {foundContribuyente && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px' }}>
                                    <p style={{ margin: 0, color: '#065f46', fontSize: '0.85rem' }}>
                                        ✅ <strong>{foundContribuyente.nombre}</strong> — {foundContribuyente.obligaciones.length} obligación(es) encontrada(s)
                                    </p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleCrearNuevoProceso} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Identificación — readonly si se encontró */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Identificación / NIT *</label>
                                    <input type="text" className="p-2" value={nuevoProcesoForm.identificacion} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, identificacion: e.target.value})} required readOnly={!!foundContribuyente} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem', backgroundColor: foundContribuyente ? '#f3f4f6' : 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nombre / Razón Social *</label>
                                    <input type="text" className="p-2" value={nuevoProcesoForm.nombre} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, nombre: e.target.value})} required readOnly={!!foundContribuyente} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem', backgroundColor: foundContribuyente ? '#f3f4f6' : 'white' }} />
                                </div>
                            </div>

                            {/* Obligación — Dropdown si hay múltiples */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Número de Obligación *</label>
                                    {foundContribuyente && foundContribuyente.obligaciones.length > 1 ? (
                                        <select
                                            className="p-2"
                                            value={nuevoProcesoForm.numObligacion}
                                            onChange={e => {
                                                const obl = foundContribuyente.obligaciones.find(o => o.num === e.target.value);
                                                setNuevoProcesoForm({...nuevoProcesoForm, numObligacion: e.target.value, valor: obl ? obl.valor : '' });
                                            }}
                                            required
                                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }}
                                        >
                                            {foundContribuyente.obligaciones.map(o => (
                                                <option key={o.num} value={o.num}>{o.num} — {o.concepto} ($ {o.valor.toLocaleString('es-CO')})</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input type="text" className="p-2" value={nuevoProcesoForm.numObligacion} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, numObligacion: e.target.value})} required readOnly={!!foundContribuyente} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem', backgroundColor: foundContribuyente ? '#f3f4f6' : 'white' }} />
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Valor de la Obligación *</label>
                                    <input type="number" className="p-2" value={nuevoProcesoForm.valor} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, valor: e.target.value})} required readOnly={!!foundContribuyente} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem', backgroundColor: foundContribuyente ? '#f3f4f6' : 'white' }} placeholder="$ 0" />
                                </div>
                            </div>

                            {/* Fecha + Área + Funcionario — siempre manuales */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Fecha de Inicio</label>
                                    <input type="date" className="p-2" value={nuevoProcesoForm.fechaInicio} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, fechaInicio: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Área Responsable</label>
                                    <select className="p-2" value={nuevoProcesoForm.areaResponsable} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, areaResponsable: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }}>
                                        <option value="Jurídica">Jurídica</option>
                                        <option value="Hacienda">Hacienda</option>
                                        <option value="Fiscal">Fiscal</option>
                                        <option value="Cartera">Cartera</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nombre del Funcionario</label>
                                <input type="text" className="p-2" value={nuevoProcesoForm.funcionarioAsignado} onChange={e => setNuevoProcesoForm({...nuevoProcesoForm, funcionarioAsignado: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }} placeholder={userName || 'Funcionario asignado'} />
                            </div>
                            <button type="submit" className="btn" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#4f46e5', border: 'none' }}>Crear Proceso (APERTURADO)</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AperturaView;
