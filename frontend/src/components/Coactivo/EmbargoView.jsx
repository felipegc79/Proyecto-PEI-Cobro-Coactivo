import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const EmbargoView = () => {
    const [bienes, setBienes] = useState({
        salarios: { fecha: '', empresa: '', valor: '' },
        bancarios: { fecha: '', entidad: '', saldo: '' },
        bienes: { tipo: 'Inmueble', antiguedad: '', avaluado: '' }
    });

    const pdfRef = useRef(null);

    const handleGenerarSolicitud = () => {
        if (pdfRef.current) {
            pdfRef.current.style.position = 'absolute';
            pdfRef.current.style.top = '0px';
            pdfRef.current.style.left = '0px';
            pdfRef.current.style.zIndex = '9999';

            html2canvas(pdfRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Solicitud_Embargo.pdf`);

                pdfRef.current.style.top = '-10000px';
                pdfRef.current.style.left = '-10000px';
                pdfRef.current.style.zIndex = '-1';
            });
        }
    };

    const [archivosCargados, setArchivosCargados] = useState([]);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const nuevosArchivos = files.map(file => ({
            id: Date.now() + Math.random(),
            file,
            nombre: file.name,
            tipo: ''
        }));
        setArchivosCargados([...archivosCargados, ...nuevosArchivos]);
    };

    const handleCambiarTipoArchivo = (id, tipo) => {
        setArchivosCargados(archivosCargados.map(a => a.id === id ? { ...a, tipo } : a));
    };

    const handleEliminarArchivo = (id) => {
        setArchivosCargados(archivosCargados.filter(a => a.id !== id));
    };

    return (
        <div>
            <h1 className="page-title">Embargo y Medidas Cautelares</h1>
            <p className="page-subtitle">Formulario de identificación de bienes y solicitud de medidas preventivas.</p>

            <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    1. Identificación de Bienes
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Salarios</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label>Fecha Consulta</label>
                            <input type="date" value={bienes.salarios.fecha} onChange={e => setBienes({ ...bienes, salarios: { ...bienes.salarios, fecha: e.target.value } })} className="mt-2" />
                        </div>
                        <div>
                            <label>Empresa Laboral</label>
                            <input type="text" placeholder="Razón Social" value={bienes.salarios.empresa} onChange={e => setBienes({ ...bienes, salarios: { ...bienes.salarios, empresa: e.target.value } })} className="mt-2" />
                        </div>
                        <div>
                            <label>Valor Devengado / Salario</label>
                            <input type="number" placeholder="$" value={bienes.salarios.valor} onChange={e => setBienes({ ...bienes, salarios: { ...bienes.salarios, valor: e.target.value } })} className="mt-2" />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Cuentas Bancarias</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label>Fecha Consulta</label>
                            <input type="date" className="mt-2" value={bienes.bancarios.fecha} onChange={e => setBienes({ ...bienes, bancarios: { ...bienes.bancarios, fecha: e.target.value } })} />
                        </div>
                        <div>
                            <label>Entidad Financiera</label>
                            <input type="text" placeholder="Ej. Bancolombia" className="mt-2" value={bienes.bancarios.entidad} onChange={e => setBienes({ ...bienes, bancarios: { ...bienes.bancarios, entidad: e.target.value } })} />
                        </div>
                        <div>
                            <label>Saldo en Cuenta</label>
                            <input type="number" placeholder="$" className="mt-2" value={bienes.bancarios.saldo} onChange={e => setBienes({ ...bienes, bancarios: { ...bienes.bancarios, saldo: e.target.value } })} />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Bienes (Muebles / Inmuebles)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                        <div>
                            <label>Tipo de Bien</label>
                            <select className="mt-2" value={bienes.bienes.tipo} onChange={e => setBienes({ ...bienes, bienes: { ...bienes.bienes, tipo: e.target.value } })}>
                                <option>Inmueble</option>
                                <option>Vehículo</option>
                                <option>Terreno</option>
                            </select>
                        </div>
                        <div>
                            <label>Antigüedad (Años)</label>
                            <input type="number" placeholder="Ej. 5" className="mt-2" value={bienes.bienes.antiguedad} onChange={e => setBienes({ ...bienes, bienes: { ...bienes.bienes, antiguedad: e.target.value } })} />
                        </div>
                        <div>
                            <label>Valor Avaluado</label>
                            <input type="number" placeholder="$" className="mt-2" value={bienes.bienes.avaluado} onChange={e => setBienes({ ...bienes, bienes: { ...bienes.bienes, avaluado: e.target.value } })} />
                        </div>
                    </div>
                </div>
            </div>


            <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    2. Carga de Soportes (Con Tipificación)
                </h3>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                    Adjunte los certificados que respaldan la identificación de estos bienes, y seleccione su clasificación correspondiente.
                </p>
                <div style={{ padding: '1.5rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fafafa', textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                    <input type="file" multiple onChange={handleFileUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    <p style={{ color: 'var(--color-text)', margin: 0, fontWeight: '500' }}>Arrastre sus archivos aquí o haga clic para seleccionar</p>
                </div>

                {archivosCargados.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Archivos a Cargar</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {archivosCargados.map(archivo => (
                                <div key={archivo.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                        {archivo.nombre}
                                    </div>
                                    <select
                                        value={archivo.tipo}
                                        onChange={(e) => handleCambiarTipoArchivo(archivo.id, e.target.value)}
                                        style={{ width: '250px' }}
                                    >
                                        <option value="">-- Seleccionar Tipo --</option>
                                        <option value="Certificado Bancario">Certificado Bancario</option>
                                        <option value="Certificado de Libertad y Tradición">Certificado de Libertad y Tradición</option>
                                        <option value="Certificado Salarial">Certificado Salarial</option>
                                        <option value="Otro Sorteo">Otro Soporte</option>
                                    </select>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleEliminarArchivo(archivo.id)}
                                        style={{ color: 'crimson', borderColor: 'crimson', padding: '0.4rem 0.8rem' }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                <div ref={pdfRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#000', backgroundColor: 'white', width: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                        <h2 style={{ margin: 0 }}>SOLICITUD DE EMBARGO Y MEDIDAS CAUTELARES</h2>
                        <p style={{ margin: '5px 0 0 0' }}>JURISDICCIÓN COACTIVA</p>
                    </div>

                    <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-CO')}</p>

                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '30px' }}>1. Información de Salarios</h3>
                    <p><strong>Fecha Consulta:</strong> {bienes.salarios.fecha || 'N/A'}</p>
                    <p><strong>Empresa Laboral:</strong> {bienes.salarios.empresa || 'N/A'}</p>
                    <p><strong>Valor Devengado:</strong> {bienes.salarios.valor ? `$ ${Number(bienes.salarios.valor).toLocaleString('es-CO')}` : 'N/A'}</p>

                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '30px' }}>2. Cuentas Bancarias</h3>
                    <p><strong>Entidad Financiera:</strong> {bienes.bancarios.entidad || 'N/A'}</p>
                    <p><strong>Saldo en Cuenta:</strong> {bienes.bancarios.saldo ? `$ ${Number(bienes.bancarios.saldo).toLocaleString('es-CO')}` : 'N/A'}</p>

                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '30px' }}>3. Bienes</h3>
                    <p><strong>Tipo de Bien:</strong> {bienes.bienes.tipo}</p>
                    <p><strong>Antigüedad:</strong> {bienes.bienes.antiguedad ? `${bienes.bienes.antiguedad} años` : 'N/A'}</p>
                    <p><strong>Valor Avaluado:</strong> {bienes.bienes.avaluado ? `$ ${Number(bienes.bienes.avaluado).toLocaleString('es-CO')}` : 'N/A'}</p>

                    <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '30px' }}>4. Soportes Adjuntos</h3>
                    <ul>
                        {archivosCargados.length > 0 ? archivosCargados.map(a => (
                            <li key={a.id}>{a.tipo || 'Sin clasificar'}: {a.nombre}</li>
                        )) : <li>No se adjuntaron soportes.</li>}
                    </ul>

                    <div style={{ marginTop: '50px', borderTop: '1px solid #000', width: '250px', textAlign: 'center', paddingTop: '10px' }}>
                        Firma Funcionario Ejecutor
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn" onClick={handleGenerarSolicitud} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                    Generar Solicitud de Embargo (PDF)
                </button>
            </div>
        </div>
    );
};
export default EmbargoView;
