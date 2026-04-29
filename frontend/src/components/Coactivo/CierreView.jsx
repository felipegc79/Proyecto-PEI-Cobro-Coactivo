import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IndicadorAsignacion from '../Shared/IndicadorAsignacion';

const CierreView = ({ procesosExternos = [], setProcesosExternos, userRole = 'Administrador', userName }) => {
    const [motivo, setMotivo] = useState('');
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [showBandeja, setShowBandeja] = useState(false);

    const pazYSalvoRef = useRef(null);
    const actoAdminRef = useRef(null);

    // Procesos pendientes de aprobación de cierre
    const procesosPendientesCierre = procesosExternos.filter(p => p.estadoProceso === 'PENDIENTE CIERRE');

    const handleGenerarPazYSalvo = () => {
        if (pazYSalvoRef.current) {
            pazYSalvoRef.current.style.position = 'absolute';
            pazYSalvoRef.current.style.top = '0px';
            pazYSalvoRef.current.style.left = '0px';
            pazYSalvoRef.current.style.zIndex = '9999';
            html2canvas(pazYSalvoRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Paz_y_Salvo.pdf`);
                pazYSalvoRef.current.style.top = '-10000px';
                pazYSalvoRef.current.style.left = '-10000px';
                pazYSalvoRef.current.style.zIndex = '-1';
                alert('✓ Paz y Salvo generado.\n✓ Notificación automática enviada al contribuyente.');
            });
        }
    };

    const handleProponerCierre = () => {
        if (!procesoSeleccionado || !motivo) {
            alert('Seleccione un proceso y un motivo de cierre.');
            return;
        }
        if (setProcesosExternos) {
            setProcesosExternos(prev => prev.map(p =>
                p.id === procesoSeleccionado.id
                    ? { ...p, estadoProceso: 'PENDIENTE CIERRE', estado: 'PENDIENTE CIERRE', motivoCierre: motivo, propuestoPor: userName, fechaPropuestaCierre: new Date().toISOString() }
                    : p
            ));
        }
        alert(`✓ Propuesta de cierre enviada.\nEl Secretario de Hacienda debe aprobar o rechazar el cierre del proceso ${procesoSeleccionado.consecutivo}.`);
        setProcesoSeleccionado(null);
        setMotivo('');
    };

    const handleAprobarCierre = (proceso) => {
        if (setProcesosExternos) {
            setProcesosExternos(prev => prev.map(p =>
                p.id === proceso.id
                    ? { ...p, estadoProceso: 'CERRADO', estado: 'CERRADO', fechaCierre: new Date().toISOString(), aprobadoPor: userName }
                    : p
            ));
        }
        alert(`✅ Cierre APROBADO.\nEl proceso ${proceso.consecutivo} ha pasado a estado CERRADO.`);
    };

    const handleRechazarCierre = (proceso) => {
        const razon = window.prompt(`Ingrese el motivo del rechazo para el proceso ${proceso.consecutivo}:`);
        if (razon === null) return;
        if (setProcesosExternos) {
            setProcesosExternos(prev => prev.map(p =>
                p.id === proceso.id
                    ? { ...p, estadoProceso: 'EN EJECUCION', estado: 'EN EJECUCION', motivoCierre: null, razonRechazo: razon }
                    : p
            ));
        }
        alert(`❌ Cierre RECHAZADO.\nEl proceso ${proceso.consecutivo} regresa a EN EJECUCION.\nMotivo: ${razon}`);
    };

    const procesosBusqueda = procesosExternos.filter(p =>
        ['APERTURADO','EN NOTIFICACION','EN EJECUCION','EN MORA'].includes(p.estadoProceso) &&
        (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.consecutivo.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const motivoLabel = {
        cancelacion_total: '1. Cancelación Total de Deuda',
        excepciones_probadas: '2. Fallo por Excepciones Probadas',
        cartera_irrecuperable: '3. Cartera Irrecuperable (Comité)',
        fallo_judicial: '4. Orden / Fallo Judicial',
        comite_sostenibilidad: '5. Dado de baja - Comité de Sostenibilidad',
    };

    return (
        <div>
            <h1 className="page-title">Cierre Normativo del Proceso</h1>
            <p className="page-subtitle">Paso final: Archivo documental y gestión de cierres con aprobación del Secretario de Hacienda.</p>

            <IndicadorAsignacion area="Comité de Cartera / Cierres" funcionario={userName || "Dr. Felipe Guzmán"} />

            {/* Bandeja de Aprobación — solo Administrador/Secretario */}
            {userRole === 'Administrador' && (
                <div className="card" style={{ marginBottom: '2rem', border: '2px solid #f59e0b', backgroundColor: '#fffbeb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#92400e' }}>
                            🔔 Bandeja de Aprobación del Secretario de Hacienda
                            {procesosPendientesCierre.length > 0 && (
                                <span style={{ marginLeft: '0.75rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '12px', padding: '0.15rem 0.6rem', fontSize: '0.85rem' }}>
                                    {procesosPendientesCierre.length}
                                </span>
                            )}
                        </h3>
                        <button className="btn btn-outline" onClick={() => setShowBandeja(!showBandeja)} style={{ fontSize: '0.85rem', color: '#92400e', borderColor: '#92400e' }}>
                            {showBandeja ? 'Ocultar' : 'Ver pendientes'}
                        </button>
                    </div>

                    {showBandeja && (
                        procesosPendientesCierre.length === 0 ? (
                            <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>No hay propuestas de cierre pendientes.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fef3c7', borderBottom: '2px solid #fcd34d' }}>
                                        <th style={{ padding: '0.75rem' }}>Consecutivo</th>
                                        <th style={{ padding: '0.75rem' }}>Deudor</th>
                                        <th style={{ padding: '0.75rem' }}>Motivo</th>
                                        <th style={{ padding: '0.75rem' }}>Propuesto por</th>
                                        <th style={{ padding: '0.75rem' }}>Fecha</th>
                                        <th style={{ padding: '0.75rem' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {procesosPendientesCierre.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #fde68a' }}>
                                            <td style={{ padding: '0.75rem', color: '#4338ca', fontWeight: 'bold' }}>{p.consecutivo}</td>
                                            <td style={{ padding: '0.75rem' }}>{p.nombre}</td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{motivoLabel[p.motivoCierre] || p.motivoCierre}</td>
                                            <td style={{ padding: '0.75rem' }}>{p.propuestoPor || '—'}</td>
                                            <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{p.fechaPropuestaCierre ? new Date(p.fechaPropuestaCierre).toLocaleDateString('es-CO') : '—'}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn"
                                                        onClick={() => handleAprobarCierre(p)}
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', backgroundColor: '#059669', border: 'none' }}
                                                    >
                                                        ✅ Aprobar
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => handleRechazarCierre(p)}
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', color: '#dc2626', borderColor: '#dc2626' }}
                                                    >
                                                        ❌ Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            )}

            {/* Propuesta de Cierre — Abogado */}
            <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    {userRole === 'Administrador' ? 'Proponer Cierre de Proceso' : 'Proponer Cierre (requiere aprobación del Secretario)'}
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Buscar Proceso</label>
                    <input
                        type="text"
                        className="p-2"
                        placeholder="Nombre o consecutivo..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{ width: '100%', maxWidth: '500px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    {busqueda && (
                        <div style={{ marginTop: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                            {procesosBusqueda.length === 0 ? (
                                <p style={{ padding: '0.75rem', color: '#6b7280' }}>Sin resultados.</p>
                            ) : procesosBusqueda.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => { setProcesoSeleccionado(p); setBusqueda(''); }}
                                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <span><strong>{p.consecutivo}</strong> — {p.nombre}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.estadoProceso}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {procesoSeleccionado && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{procesoSeleccionado.consecutivo}</strong> — {procesoSeleccionado.nombre}
                                <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>{procesoSeleccionado.estadoProceso}</span>
                            </div>
                            <button onClick={() => setProcesoSeleccionado(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Motivo Administrativo del Cierre</label>
                    <select value={motivo} onChange={e => setMotivo(e.target.value)} className="p-3" style={{ width: '100%', maxWidth: '600px', fontSize: '1.05rem' }}>
                        <option value="">-- Seleccionar el Criterio de Cierre --</option>
                        <option value="cancelacion_total">1. Cancelación Total de Deuda (Obligación extinta por recaudo)</option>
                        <option value="excepciones_probadas">2. Fallo por Excepciones Probadas a favor del deudor</option>
                        <option value="cartera_irrecuperable">3. Cancelación Parcial Administrativa - Cartera irrecuperable (Aval Comité)</option>
                        <option value="fallo_judicial">4. Orden / Fallo Judicial Extremo</option>
                        <option value="comite_sostenibilidad">5. Dado de baja - Comité de Sostenibilidad</option>
                    </select>
                </div>

                {motivo === 'cancelacion_total' && (
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f1f8e9', border: '1px solid #c5e1a5', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: '#33691e', marginTop: 0 }}>✓ Deuda Saldada Exitosamente</h4>
                        <p style={{ color: '#558b2f' }}>El sistema detecta que se cruzó el pago al 100% (incluyendo costas e intereses). Ahora procede la emisión formal del Paz y Salvo.</p>
                        <button className="btn btn-outline" style={{ backgroundColor: 'white' }} onClick={handleGenerarPazYSalvo}>
                            Generar Paz y Salvo (PDF y Notificación)
                        </button>
                    </div>
                )}

                {motivo === 'cartera_irrecuperable' && (
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: '#e65100', marginTop: 0 }}>⚠ Alerta de Castigo de Cartera</h4>
                        <p style={{ color: '#ef6c00' }}>Se requiere la previa anexión y aval del acta del <strong>Comité de Cartera</strong> del municipio.</p>
                        <div style={{ marginTop: '1rem' }}>
                            <input type="file" /> <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>Adjuntar Acta del Comité</span>
                        </div>
                    </div>
                )}

                {motivo === 'comite_sostenibilidad' && (
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: '#5b21b6', marginTop: 0 }}>📋 Dado de Baja — Comité de Sostenibilidad</h4>
                        <p style={{ color: '#6d28d9' }}>Esta acción requiere aprobación formal del Secretario de Hacienda antes de ser efectiva.</p>
                        <div style={{ marginTop: '1rem' }}>
                            <input type="file" /> <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>Adjuntar Acta del Comité de Sostenibilidad</span>
                        </div>
                    </div>
                )}

                {motivo && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <strong>⚠ Flujo de Aprobación:</strong> Al proponer el cierre, el proceso pasará a estado <strong>PENDIENTE CIERRE</strong> y quedará en la bandeja del Secretario de Hacienda para su aprobación definitiva.
                        </div>
                        <button
                            className="btn"
                            style={{ padding: '0.75rem 2rem', backgroundColor: '#f59e0b', border: 'none', color: 'white' }}
                            onClick={handleProponerCierre}
                            disabled={!procesoSeleccionado}
                        >
                            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📤</span>
                            Proponer Cierre (Enviar a Aprobación)
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden Templates for PDFs */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                <div ref={pazYSalvoRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#000', backgroundColor: 'white', width: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ margin: 0, textDecoration: 'underline' }}>CERTIFICADO DE PAZ Y SALVO</h1>
                        <h3 style={{ margin: '5px 0 0 0', fontWeight: 'normal' }}>JURISDICCIÓN COACTIVA - SECRETARÍA DE HACIENDA</h3>
                    </div>
                    <p style={{ textAlign: 'right', marginBottom: '30px' }}><strong>Fecha de Expedición:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                    <p style={{ textAlign: 'justify', lineHeight: '1.8' }}>
                        El Funcionario de Cobro Coactivo hace constar que el (la) señor(a) / contribuyente <strong>{procesoSeleccionado?.nombre || 'Contribuyente'}</strong>, identificado(a) con cédula / NIT <strong>{procesoSeleccionado?.identificacion || '—'}</strong>, se encuentra a la fecha <strong>A PAZ Y SALVO</strong> por concepto de obligaciones pecuniarias relacionadas al proceso coactivo con la Entidad.
                    </p>
                    <div style={{ marginTop: '100px', width: '300px', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center' }}>
                        <strong>Firma Oficial Recaudador</strong><br />División Administrativa
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CierreView;
