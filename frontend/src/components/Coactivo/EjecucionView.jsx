import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const EjecucionView = () => {
    const [opcion, setOpcion] = useState('A');
    const [amortizacionParams, setAmortizacionParams] = useState({
        deudaTotal: 5000000,
        cuotaInicial: 1500000,
        tasaMora: 2.5,
        plazo: 6
    });
    const [tablaAmortizacion, setTablaAmortizacion] = useState([]);

    // PDF Refs
    const reciboPdfRef = useRef(null);
    const comprobantePdfRef = useRef(null);

    // Archivos Option B
    const [archivosAdjudicacion, setArchivosAdjudicacion] = useState([]);

    const handleGenerarRecibo = () => {
        if (reciboPdfRef.current) {
            reciboPdfRef.current.style.position = 'absolute';
            reciboPdfRef.current.style.top = '0px';
            reciboPdfRef.current.style.left = '0px';
            reciboPdfRef.current.style.zIndex = '9999';

            html2canvas(reciboPdfRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Recibo_de_Pago_Acuerdo.pdf`);

                reciboPdfRef.current.style.top = '-10000px';
                reciboPdfRef.current.style.left = '-10000px';
                reciboPdfRef.current.style.zIndex = '-1';
            });
        }
    };

    const handleGenerarComprobante = () => {
        if (comprobantePdfRef.current) {
            comprobantePdfRef.current.style.position = 'absolute';
            comprobantePdfRef.current.style.top = '0px';
            comprobantePdfRef.current.style.left = '0px';
            comprobantePdfRef.current.style.zIndex = '9999';

            html2canvas(comprobantePdfRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Comprobante_Ingreso.pdf`);

                comprobantePdfRef.current.style.top = '-10000px';
                comprobantePdfRef.current.style.left = '-10000px';
                comprobantePdfRef.current.style.zIndex = '-1';
            });
        }
    };

    const calcularTabla = () => {
        let saldo = parseFloat(amortizacionParams.deudaTotal) - parseFloat(amortizacionParams.cuotaInicial);
        if (saldo <= 0) {
            alert('La cuota inicial cubre o excede la deuda total. No hay saldo a financiar.');
            setTablaAmortizacion([]);
            return;
        }

        const cuotaCapital = saldo / parseInt(amortizacionParams.plazo);
        const tasaDecimal = parseFloat(amortizacionParams.tasaMora) / 100;

        let tempTable = [];
        let fecha = new Date();

        for (let i = 1; i <= parseInt(amortizacionParams.plazo); i++) {
            fecha.setMonth(fecha.getMonth() + 1);
            const interesMes = saldo * tasaDecimal;
            const totalCuota = cuotaCapital + interesMes;

            tempTable.push({
                numero: i,
                vencimiento: fecha.toISOString().split('T')[0],
                abonoCapital: cuotaCapital,
                intereses: interesMes,
                total: totalCuota,
                estado: 'Al día'
            });

            saldo -= cuotaCapital;
        }
        setTablaAmortizacion(tempTable);
    };

    const handleUploadB = (e) => {
        const files = Array.from(e.target.files);
        const nuevos = files.map(file => ({ id: Date.now() + Math.random(), file, nombre: file.name, tipo: '' }));
        setArchivosAdjudicacion([...archivosAdjudicacion, ...nuevos]);
    };

    const handleCambiarTipoB = (id, tipo) => {
        setArchivosAdjudicacion(archivosAdjudicacion.map(a => a.id === id ? { ...a, tipo } : a));
    };

    const handleEliminarArchivoB = (id) => {
        setArchivosAdjudicacion(archivosAdjudicacion.filter(a => a.id !== id));
    };

    const handleRegistrarAdjudicacion = () => {
        if (archivosAdjudicacion.length === 0) {
            alert("Por favor cargue los documentos de adjudicación antes de registrar el procedimiento.");
            return;
        }
        alert("Procedimiento de adjudicación registrado exitosamente en el expediente. El proceso pasa a fase de liquidación final.");
    };

    return (
        <div>
            <h1 className="page-title">Ejecución y Recuperación de Cartera</h1>
            <p className="page-subtitle">Seleccione el escenario a aplicar para la fase ejecutiva y el recaudo final.</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <button
                    className={`btn ${opcion === 'A' ? '' : 'btn-outline'}`}
                    onClick={() => setOpcion('A')}
                    style={{ padding: '0.75rem 1.5rem', flex: 1 }}
                >
                    Opción A: Acuerdos de Pago
                </button>
                <button
                    className={`btn ${opcion === 'B' ? '' : 'btn-outline'}`}
                    onClick={() => setOpcion('B')}
                    style={{ padding: '0.75rem 1.5rem', flex: 1 }}
                >
                    Opción B: Subasta / Adjudicación
                </button>
                <button
                    className={`btn ${opcion === 'C' ? '' : 'btn-outline'}`}
                    onClick={() => setOpcion('C')}
                    style={{ padding: '0.75rem 1.5rem', flex: 1 }}
                >
                    Opción C: Aplicación de Pagos
                </button>
            </div>

            {opcion === 'A' && (
                <div className="card">
                    <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Resolución de Acuerdo de Pago y Amortización
                    </h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                        Generación de la facilidad de pago con firma del contribuyente. (Se requiere un abono inicial estándar del 10%).
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ fontWeight: '500' }}>Deuda Total a Financiar ($)</label>
                            <input type="number" value={amortizacionParams.deudaTotal} onChange={e => setAmortizacionParams({ ...amortizacionParams, deudaTotal: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Plazo (Meses)</label>
                            <input type="number" value={amortizacionParams.plazo} onChange={e => setAmortizacionParams({ ...amortizacionParams, plazo: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Cuota Inicial Acordada ($)</label>
                            <input type="number" value={amortizacionParams.cuotaInicial} onChange={e => setAmortizacionParams({ ...amortizacionParams, cuotaInicial: e.target.value })} className="mt-2" />
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Tasa Interés Mora (%)</label>
                            <input type="number" step="0.1" value={amortizacionParams.tasaMora} onChange={e => setAmortizacionParams({ ...amortizacionParams, tasaMora: e.target.value })} className="mt-2" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" id="unificarCuotas" style={{ width: '18px', height: '18px' }} />
                        <label htmlFor="unificarCuotas" style={{ fontWeight: '500', cursor: 'pointer' }}>
                            Unificación de cuotas (Consolidar saldos pendientes en un único documento de pago)
                        </label>
                    </div>

                    <button className="btn btn-outline" onClick={calcularTabla}>
                        Calcular Tabla de Amortización
                    </button>

                    <div style={{ marginTop: '3rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Tabla de Amortización (Proyección Cuotas)</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fafafa', borderRadius: 'var(--radius-sm)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                                        <th style={{ padding: '1rem' }}>Cuota #</th>
                                        <th style={{ padding: '1rem' }}>Vencimiento</th>
                                        <th style={{ padding: '1rem' }}>Abono a Capital</th>
                                        <th style={{ padding: '1rem' }}>Adición Intereses</th>
                                        <th style={{ padding: '1rem' }}>Total Recibo</th>
                                        <th style={{ padding: '1rem' }}>Días Mora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablaAmortizacion.length > 0 ? tablaAmortizacion.map((fila, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1rem' }}>{fila.numero}</td>
                                            <td style={{ padding: '1rem' }}>{fila.vencimiento}</td>
                                            <td style={{ padding: '1rem' }}>$ {Math.round(fila.abonoCapital).toLocaleString('es-CO')}</td>
                                            <td style={{ padding: '1rem' }}>$ {Math.round(fila.intereses).toLocaleString('es-CO')}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>$ {Math.round(fila.total).toLocaleString('es-CO')}</td>
                                            <td style={{ padding: '1rem', color: 'var(--color-primary)' }}>{fila.estado}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                                Presione "Calcular Tabla" para generar la proyección.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'right', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <button className="btn" onClick={handleGenerarRecibo}>
                            Generar Recibo de Pago (Código Barras)
                        </button>
                    </div>

                    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                        <div ref={reciboPdfRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: 'white', width: '800px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
                                <h2>RECIBO DE PAGO - ACUERDO DE AMORTIZACIÓN</h2>
                                <p>JURISDICCIÓN COACTIVA - SUPERTRANSPORTE</p>
                            </div>
                            <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                            <p><strong>Deudor / Contribuyente:</strong> Juan Pérez (Ejemplo)</p>
                            <p><strong>Cuota Número:</strong> {tablaAmortizacion.length > 0 ? '1' : 'N/A'}</p>
                            <p><strong>Vencimiento:</strong> {tablaAmortizacion.length > 0 ? tablaAmortizacion[0].vencimiento : 'N/A'}</p>
                            <h3 style={{ marginTop: '20px' }}>Detalle:</h3>
                            <ul>
                                <li>Abono a Capital: $ {tablaAmortizacion.length > 0 ? Math.round(tablaAmortizacion[0].abonoCapital).toLocaleString('es-CO') : 0}</li>
                                <li>Intereses Corrientes/Mora: $ {tablaAmortizacion.length > 0 ? Math.round(tablaAmortizacion[0].intereses).toLocaleString('es-CO') : 0}</li>
                            </ul>
                            <h2 style={{ textAlign: 'right', marginTop: '20px' }}>Total a Pagar: $ {tablaAmortizacion.length > 0 ? Math.round(tablaAmortizacion[0].total).toLocaleString('es-CO') : 0}</h2>

                            <div style={{ marginTop: '40px', border: '1px solid #000', padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontFamily: 'monospace', fontSize: '24px', letterSpacing: '2px', marginBottom: '10px' }}>
                                    || || || | || || | || | || || || ||
                                </div>
                                <div style={{ fontSize: '10px' }}>(145) 1234567890 (8020) 0000000000000 (96) 20260324</div>
                                <p style={{ fontSize: '12px', marginTop: '10px' }}>Acérquese a cualquier entidad bancaria autorizada o pague vía PSE.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {opcion === 'B' && (
                <div className="card">
                    <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Subasta Pública y Adjudicación de Bienes Cautelados
                    </h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                        Espacio para legalizar y cargar los documentos que certifiquen de forma oficial que la entidad toma posesión del bien rematado, o de los recursos congelados en las cuentas embargadas.
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                            Cargar Providencias / Autos de Adjudicación
                        </label>
                        <div style={{ padding: '1.5rem', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fafafa', textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                            <input type="file" multiple onChange={handleUploadB} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                            <p style={{ color: 'var(--color-text)', margin: 0, fontWeight: '500' }}>Arrastre sus archivos aquí o haga clic para seleccionar</p>
                        </div>

                        {archivosAdjudicacion.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Archivos Adjuntos</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {archivosAdjudicacion.map(archivo => (
                                        <div key={archivo.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{archivo.nombre}</div>
                                            <select value={archivo.tipo} onChange={(e) => handleCambiarTipoB(archivo.id, e.target.value)} style={{ width: '250px' }}>
                                                <option value="">-- Seleccionar Tipo --</option>
                                                <option value="Auto de Adjudicación">Auto de Adjudicación</option>
                                                <option value="Providencia de Remate">Providencia de Remate</option>
                                                <option value="Acta de Secuestro">Acta de Secuestro</option>
                                                <option value="Otro">Otro Documento</option>
                                            </select>
                                            <button className="btn btn-outline" onClick={() => handleEliminarArchivoB(archivo.id)} style={{ color: 'crimson', borderColor: 'crimson', padding: '0.4rem 0.8rem' }}>Eliminar</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn" style={{ padding: '0.75rem 2rem' }} onClick={handleRegistrarAdjudicacion}>
                        Registrar Procedimiento de Adjudicación
                    </button>
                </div>
            )}

            {opcion === 'C' && (
                <div className="card">
                    <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Aplicación de Pagos a la Deuda
                    </h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
                        Área de Tesorería/Recaudo: Generación del comprobante de ingreso que liquida la obligación al conectar el dinero efectivo que entra (sea por consignación de subasta, descuento salarial, o secuestro bancario) con las facturas atrasadas.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ fontWeight: '500' }}>Volúmen de Ingreso Confirmado</label>
                            <input type="number" placeholder="$ Valor recabado" className="mt-2" />
                        </div>

                        <div>
                            <label style={{ fontWeight: '500' }}>Seleccionar Obligaciones a Saldar (Shift + Click)</label>
                            <select multiple style={{ height: '120px', width: '100%' }} className="mt-2">
                                <option>Factura F001 - P. Predial ($1,500,000)</option>
                                <option>Factura F002 - P. Predial ($1,600,000)</option>
                                <option>Obligación F003 - ICA ($850,000)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <button className="btn" style={{ padding: '0.75rem 2rem' }} onClick={handleGenerarComprobante}>
                            Generar Comprobante de Ingreso y Aplicar Pago
                        </button>
                    </div>

                    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                        <div ref={comprobantePdfRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: 'white', width: '800px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>COMPROBANTE DE INGRESO (C.I.)</h2>
                                    <p style={{ margin: '5px 0 0 0' }}>Área de Tesorería - Recaudo</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h3 style={{ margin: 0 }}>No. CI-{new Date().getFullYear()}-00892</h3>
                                    <p style={{ margin: '5px 0 0 0' }}>{new Date().toLocaleDateString('es-CO')}</p>
                                </div>
                            </div>

                            <p><strong>Recibido de:</strong> Tesorería Nacional / Remate Público</p>
                            <p><strong>Concepto:</strong> Cruce de Cartera por Adjudicación y/o Aplicación de Pagos Coactivos</p>

                            <h3 style={{ marginTop: '30px' }}>Obligaciones Saldadas Aplicadas:</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#eee' }}>
                                        <th style={{ border: '1px solid #000', padding: '8px' }}>Ref / Factura</th>
                                        <th style={{ border: '1px solid #000', padding: '8px' }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Factura F001 - P. Predial</td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$ 1,500,000</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>Obligación F003 - ICA</td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$ 850,000</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>TOTAL APLICADO</td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>$ 2,350,000</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-around' }}>
                                <div style={{ width: '200px', borderTop: '1px solid #000', textAlign: 'center', paddingTop: '10px' }}>Firma Tesorero</div>
                                <div style={{ width: '200px', borderTop: '1px solid #000', textAlign: 'center', paddingTop: '10px' }}>Firma Juez Ejecutor</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EjecucionView;
