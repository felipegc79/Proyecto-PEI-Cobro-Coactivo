import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IndicadorAsignacion from '../Shared/IndicadorAsignacion';
import { FileText, Mail, Send } from 'lucide-react';

const EmbargoView = ({ userName }) => {
    const [activeMainTab, setActiveMainTab] = useState('embargo'); // 'embargo' | 'levantamiento'
    const [bienes, setBienes] = useState({
        salarios: { fecha: '', empresa: '', valor: '' },
        bancarios: { fecha: '', entidad: '', saldo: '' },
        bienes: { tipo: 'Inmueble', antiguedad: '', avaluado: '' }
    });
    const pdfRef = useRef(null);
    const levantamientoPdfRef = useRef(null);

    const [mockPagados] = useState([
        { id: 1, consecutivo: 'CC-2023-102', nombre: 'MARIA AMPARO ORTIZ DAVID', identificacion: '43059073', telefono: '31229111078', predio: '01-02-0000', matricula: '001-123', fechaPago: '2021-07-02' },
        { id: 2, consecutivo: 'CC-2024-055', nombre: 'Empresa XYZ', identificacion: '900987654', telefono: '3001112233', predio: '03-04-5555', matricula: '002-444', fechaPago: '2024-03-15' },
    ]);
    const [selectedParaLevantamiento, setSelectedParaLevantamiento] = useState(null);

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

    const handleGenerarLevantamiento = (proceso) => {
        setSelectedParaLevantamiento(proceso);
        setTimeout(() => {
            if (levantamientoPdfRef.current) {
                levantamientoPdfRef.current.style.position = 'absolute';
                levantamientoPdfRef.current.style.top = '0px';
                levantamientoPdfRef.current.style.left = '0px';
                levantamientoPdfRef.current.style.zIndex = '9999';

                html2canvas(levantamientoPdfRef.current, { scale: 2 }).then((canvas) => {
                    const imgData = canvas.toDataURL('image/jpeg', 0.98);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Resolucion_Levantamiento_${proceso.identificacion}.pdf`);

                    levantamientoPdfRef.current.style.top = '-10000px';
                    levantamientoPdfRef.current.style.left = '-10000px';
                    levantamientoPdfRef.current.style.zIndex = '-1';
                    setSelectedParaLevantamiento(null);
                });
            }
        }, 500);
    };

    const handleEnviarCorreoLevantamiento = (proceso) => {
        alert(`Resolución de Levantamiento enviada al correo registrado de ${proceso.nombre}`);
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

            <IndicadorAsignacion area="Fiscalización / Medidas" funcionario={userName || "Dra. Leticia Torres"} />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeMainTab === 'embargo' ? '' : 'btn-outline'}`}
                    onClick={() => setActiveMainTab('embargo')}
                    style={{ padding: '0.75rem 1.5rem', flex: 1 }}
                >
                    Solicitud de Embargo
                </button>
                <button
                    className={`btn ${activeMainTab === 'levantamiento' ? '' : 'btn-outline'}`}
                    onClick={() => setActiveMainTab('levantamiento')}
                    style={{ padding: '0.75rem 1.5rem', flex: 1 }}
                >
                    Levantamiento de Medidas (100% Pagados)
                </button>
            </div>

            {activeMainTab === 'embargo' && (
                <>
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
                </>
            )}

            {activeMainTab === 'levantamiento' && (
                <div className="card">
                    <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Procesos con Obligación Pagada al 100%
                    </h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                        Los siguientes procesos han cumplido con el total de la obligación y son aptos para el levantamiento de medidas cautelares.
                    </p>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#efefef', borderBottom: '2px solid #ccc' }}>
                                <th style={{ padding: '1rem' }}>Consecutivo</th>
                                <th style={{ padding: '1rem' }}>Contribuyente</th>
                                <th style={{ padding: '1rem' }}>Identificación</th>
                                <th style={{ padding: '1rem' }}>Matrícula Inmobiliaria</th>
                                <th style={{ padding: '1rem' }}>Fecha de Pago Total</th>
                                <th style={{ padding: '1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockPagados.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.consecutivo}</td>
                                    <td style={{ padding: '1rem' }}>{p.nombre}</td>
                                    <td style={{ padding: '1rem' }}>{p.identificacion}</td>
                                    <td style={{ padding: '1rem' }}>{p.matricula}</td>
                                    <td style={{ padding: '1rem' }}>{p.fechaPago}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleGenerarLevantamiento(p)}>
                                                <FileText size={14} /> Generar Resolución
                                            </button>
                                            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEnviarCorreoLevantamiento(p)}>
                                                <Send size={14} /> Enviar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                        <div ref={levantamientoPdfRef} style={{ padding: '60px 80px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: 'white', width: '800px', minHeight: '1100px' }}>
                            {selectedParaLevantamiento && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '80px', height: '80px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[Escudo]</div>
                                            <div>
                                                <h1 style={{ margin: 0, fontSize: '24px' }}>ALCALDÍA</h1>
                                                <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>ANDES</h1>
                                                <p style={{ margin: 0, fontSize: '10px' }}>Alianza por el Desarrollo Humano</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ background: '#333', color: 'white', padding: '10px', display: 'inline-block' }}>
                                                <strong>Alianza por la Transparencia</strong>
                                                <br />Secretaría de Hacienda
                                            </div>
                                            <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>130-05-05-3661</p>
                                        </div>
                                    </div>

                                    <p style={{ marginBottom: '30px' }}>Andes, de {new Date().toLocaleDateString('es-CO')}</p>
                                    
                                    <p style={{ margin: 0 }}>Señora</p>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedParaLevantamiento.nombre}</p>
                                    <p style={{ margin: 0 }}>N° DE IDENTIFICACION: {selectedParaLevantamiento.identificacion}</p>
                                    <p style={{ margin: 0 }}>TELEFONO: {selectedParaLevantamiento.telefono}</p>

                                    <div style={{ marginTop: '50px', marginBottom: '30px' }}>
                                        <p><strong>ASUNTO: Contestación de Solicitud de levantamiento de medida cautelar de embargo.</strong></p>
                                    </div>

                                    <p style={{ textAlign: 'justify', lineHeight: '1.5' }}>
                                        El día {new Date().toLocaleDateString('es-CO')} en el despacho de la Secretaría de Hacienda del Municipio de Andes Antioquia, en la dirección Calle Arboleda Nro 49a 39, se hizo verbalmente una solicitud en la cual se requiere a este despacho para que realice los trámites pertinentes para realizar el levantamiento de medida cautelar de embargo por concepto impuesto predial (Predio {selectedParaLevantamiento.predio}, Matrícula {selectedParaLevantamiento.matricula}), habiendo verificado el pago total de la obligación el día {selectedParaLevantamiento.fechaPago}.
                                    </p>

                                    <p style={{ textAlign: 'justify', lineHeight: '1.5', marginTop: '20px' }}>
                                        La Secretaría de Hacienda del Municipio de Andes, le informa, que ante la Oficina de Registro e Instrumento Públicos se llevó a cabo el trámite de levantamiento de medida cautelar de embargo el día {new Date().toLocaleDateString('es-CO')}, mediante el oficio N° 130-05-05-3660 del {new Date().toLocaleDateString('es-CO')}.
                                    </p>

                                    <div style={{ marginTop: '50px' }}>
                                        <p style={{ margin: 0 }}><strong>ANEXOS</strong></p>
                                        <ul style={{ marginTop: '10px' }}>
                                            <li>Copia del oficio N° 130-05-05-3660 del {new Date().toLocaleDateString('es-CO')}</li>
                                        </ul>
                                    </div>

                                    <div style={{ marginTop: '60px' }}>
                                        <p style={{ margin: 0 }}>Atentamente</p>
                                        
                                        <div style={{ marginTop: '60px', borderTop: '1px solid #000', width: '300px', paddingTop: '5px' }}>
                                            <p style={{ margin: 0 }}><strong>VALENTINA MUNERA CAÑAS</strong></p>
                                            <p style={{ margin: 0 }}>SECRETARIA DE HACIENDA</p>
                                        </div>

                                        <div style={{ marginTop: '40px', fontSize: '10px' }}>
                                            <p style={{ margin: 0 }}>PROYECTA: GLORIA YASMIN GUTIERREZ CORREA</p>
                                            <p style={{ margin: 0 }}>CARGO: ABOGADA COBRO COACTIVO</p>
                                        </div>
                                    </div>

                                    <div style={{ position: 'absolute', bottom: '60px', right: '80px', fontSize: '10px', textAlign: 'right', borderLeft: '1px solid #000', paddingLeft: '10px' }}>
                                        <p style={{ margin: 0 }}>Calle Arboleda N° 49A - 39 | Palacio Municipal</p>
                                        <p style={{ margin: 0 }}>hacienda@andes-antioquia.gov.co</p>
                                        <p style={{ margin: 0 }}>Conmutador: 841 41 01 | Fax: 841 45 90</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EmbargoView;
