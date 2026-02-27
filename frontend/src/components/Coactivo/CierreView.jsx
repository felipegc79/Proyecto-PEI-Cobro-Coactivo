import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const CierreView = () => {
    const [motivo, setMotivo] = useState('');

    const pazYSalvoRef = useRef(null);
    const actoAdminRef = useRef(null);

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
                alert('✓ Paz y Salvo Tributario generado vía PDF.\n✓ Se ha enviado una notificación automática con el documento adjunto al correo oficial del contribuyente.');
            });
        }
    };

    const handleCierre = () => {
        if (actoAdminRef.current) {
            actoAdminRef.current.style.position = 'absolute';
            actoAdminRef.current.style.top = '0px';
            actoAdminRef.current.style.left = '0px';
            actoAdminRef.current.style.zIndex = '9999';

            html2canvas(actoAdminRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Acto_Administrativo_Cierre.pdf`);

                actoAdminRef.current.style.top = '-10000px';
                actoAdminRef.current.style.left = '-10000px';
                actoAdminRef.current.style.zIndex = '-1';
                alert('Expediente cerrado exitosamente. Acto Administrativo de Cierre descargado.');
            });
        }
    };

    return (
        <div>
            <h1 className="page-title">Cierre Normativo del Proceso</h1>
            <p className="page-subtitle">Paso final: Archivo documental y eventual generación de certificados para deudores solventes o cartera depurada.</p>

            <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    Motivo y Selección de Cierre
                </h3>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Defina el Motivo Administrativo del Cierre</label>
                    <select
                        value={motivo}
                        onChange={e => setMotivo(e.target.value)}
                        className="p-3"
                        style={{ width: '100%', maxWidth: '600px', fontSize: '1.05rem' }}
                    >
                        <option value="">-- Seleccionar el Criterio de Cierre --</option>
                        <option value="cancelacion_total">1. Cancelación Total de Deuda (Obligación extinta por recaudo)</option>
                        <option value="excepciones_probadas">2. Fallo por Excepciones Probadas a favor del deudor</option>
                        <option value="cartera_irrecuperable">3. Cancelación Parcial Administrativa - Cartera certificada irrecuperable (Aval Comité)</option>
                        <option value="fallo_judicial">4. Orden / Fallo Judicial Extremo</option>
                    </select>
                </div>

                {motivo === 'cancelacion_total' && (
                    <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f1f8e9', border: '1px solid #c5e1a5', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: '#33691e', marginTop: 0 }}>✓ Deuda Saldada Exitosamente</h4>
                        <p style={{ color: '#558b2f' }}>
                            El sistema detecta que se cruzó el pago al 100% (incluyendo costas e intereses). Ahora procede la emisión formal del Paz y Salvo.
                        </p>
                        <div style={{ marginTop: '1.5rem' }}>
                            <button
                                className="btn btn-outline"
                                style={{ backgroundColor: 'white' }}
                                onClick={handleGenerarPazYSalvo}
                            >
                                Generar Paz y Salvo (PDF y Notificación)
                            </button>
                        </div>
                    </div>
                )}

                {motivo === 'cartera_irrecuperable' && (
                    <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: '#e65100', marginTop: 0 }}>⚠ Alerta de Castigo de Cartera</h4>
                        <p style={{ color: '#ef6c00' }}>
                            Se requiere la previa anexión y aval del acta del **Comité de Cartera** del municipio reconociendo formalmente la baja y prescripción de los montos incobrables.
                        </p>
                        <div style={{ marginTop: '1rem' }}>
                            <input type="file" /> <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>Adjuntar Acta del Comité</span>
                        </div>
                    </div>
                )}

                {motivo && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Archivo Documental y Consecutivo</h4>
                        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                            Opción para generar el acto de resolución ejecutora final, dándole muerte al caso y emitiendo una boleta de remisión para el archivo consultivo.
                        </p>
                        <button className="btn" style={{ padding: '0.75rem 2rem' }} onClick={handleCierre}>
                            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🗄️</span>
                            Generar Acto Administrativo (Cruce y Archivo de Expediente)
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden Templates for PDFs */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                <div ref={pazYSalvoRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#000', backgroundColor: 'white', width: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ margin: 0, textDecoration: 'underline' }}>CERTIFICADO DE PAZ Y SALVO</h1>
                        <h3 style={{ margin: '5px 0 0 0', fontWeight: 'normal' }}>JURISDICCIÓN COACTIVA - SUPERTRANSPORTE</h3>
                    </div>

                    <p style={{ textAlign: 'right', marginBottom: '30px' }}>
                        <strong>Fecha de Expedición:</strong> {new Date().toLocaleDateString('es-CO')}
                    </p>

                    <p style={{ textAlign: 'justify', lineHeight: '1.8' }}>
                        El Funcionario de Cobro Coactivo hace constar que el (la) señor(a) / contribuyente <strong>Juan Pérez</strong>, identificado(a) con cédula / NIT <strong>900123456</strong>, se encuentra a la fecha <strong>A PAZ Y SALVO</strong> por concepto de obligaciones pecuniarias, deudas, impuestos, multas e intereses moratorios relacionados al proceso coactivo con la Entidad.
                    </p>

                    <p style={{ textAlign: 'justify', lineHeight: '1.8', marginTop: '20px' }}>
                        La presente certificación se expide a solicitud de la parte interesada, en virtud del cruce total de cartera validado en los sistemas de información financiera de la Entidad.
                    </p>

                    <div style={{ marginTop: '100px', width: '300px', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center' }}>
                        <strong>Firma Oficial Recaudador</strong><br />
                        División Administrativa
                    </div>
                </div>

                <div ref={actoAdminRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#000', backgroundColor: 'white', lineHeight: '1.6', width: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ margin: 0 }}>RESOLUCIÓN DE TERMINACIÓN Y ARCHIVO</h2>
                        <h4 style={{ margin: '5px 0 0 0', fontWeight: 'normal' }}>AUTO ADMINISTRATIVO DE CIERRE DE EXPEDIENTE Nº {new Date().getFullYear()}-00543</h4>
                    </div>

                    <p><strong>FECHA:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                    <p><strong>SUJETO PASIVO:</strong> Juan Pérez (Ejemplo)</p>

                    <h3 style={{ marginTop: '30px' }}>CONSIDERANDO:</h3>
                    <p style={{ textAlign: 'justify' }}>
                        Que a través del proceso coactivo iniciado contra el deudor de la referencia, se adelantaron las gestiones pertinentes para lograr el recaudo de la cartera encomendada, finalizando, acorde a los comprobantes de ingreso, en la extinción total o parcial justificada de las obligaciones en mora objeto del mandamiento.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>RESUELVE:</h3>
                    <p style={{ textAlign: 'justify' }}>
                        <strong>ARTÍCULO PRIMERO.</strong> Declarar la terminación del procedimiento administrativo de cobro coactivo seguido en contra del contribuyente referido.
                    </p>
                    <p style={{ textAlign: 'justify' }}>
                        <strong>ARTÍCULO SEGUNDO.</strong> Ordenar el levantamiento de las medidas cautelares practicadas (si fuesen aplicables) y el desglose de los títulos que no hayan sido aplicados.
                    </p>
                    <p style={{ textAlign: 'justify' }}>
                        <strong>ARTÍCULO TERCERO.</strong> Ordenar el ARCHIVO DEFINITIVO de las diligencias.
                    </p>

                    <div style={{ marginTop: '80px', width: '250px', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center', margin: '80px auto 0 auto' }}>
                        <strong>Firma Funcionario Ejecutor</strong><br />
                        Juez de Jurisdicción Coactiva
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CierreView;
