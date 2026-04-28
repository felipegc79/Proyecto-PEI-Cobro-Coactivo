import React from 'react';

const FichaTecnicaModal = ({ deudor, facturas, onClose }) => {
    if (!deudor) return null;

    const fechaActual = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Mock data based on the image structure
    const valorLiquidacion = deudor.valor || 1127508;
    const facturado = Math.floor(valorLiquidacion * 0.25);
    const pagado = 0;
    const saldo = valorLiquidacion - facturado;

    const seccionHeaderStyle = {
        backgroundColor: '#047857', // Dark green
        color: 'white',
        padding: '0.3rem 0.5rem',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        marginTop: '1.5rem',
        marginBottom: '0.5rem'
    };

    const tableHeaderStyle = {
        borderBottom: '1px solid #10b981',
        padding: '0.4rem',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        color: '#374151'
    };

    const tdStyle = {
        padding: '0.4rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        borderBottom: '1px solid #e5e7eb'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: '8px',
                width: '100%', maxWidth: '1000px', maxHeight: '95vh',
                overflowY: 'auto', padding: '2rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
                
                <div style={{ borderBottom: '2px solid #10b981', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ color: '#047857', margin: 0, fontSize: '1.5rem', textTransform: 'uppercase' }}>
                            ESTADO DE CUENTA {deudor.numObligacion?.includes('F0') ? 'IMPUESTO PREDIAL' : 'INDUSTRIA Y COMERCIO'}
                        </h2>
                        <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            <div><strong>Contribuyente</strong></div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{deudor.nombre}</div>
                            <div><strong>CC/NIT</strong> {deudor.identificacion}</div>
                            <div style={{ color: '#6b7280' }}>{fechaActual}</div>
                        </div>
                    </div>
                </div>

                {/* I. INFORMACION GENERAL */}
                <div style={seccionHeaderStyle}>I. INFORMACIÓN GENERAL</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.8rem', backgroundColor: '#f9fafb', padding: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <div>
                        <div><strong>CC / NIT:</strong> {deudor.identificacion}</div>
                        <div><strong>FICHA ANTERIOR:</strong> null</div>
                        <div><strong>MATRÍCULA:</strong> {Math.floor(Math.random() * 90000) + 10000}</div>
                        <div><strong>DIRECCIÓN:</strong> CR 49 # 51 - 60</div>
                    </div>
                    <div>
                        <div><strong>SECTOR:</strong> RURAL</div>
                        <div><strong>ESTRATO:</strong> SIN ASIGNAR</div>
                        <div><strong>AVALÚO:</strong> ${(valorLiquidacion * 100).toLocaleString()}</div>
                    </div>
                    <div>
                        <div><strong>DERECHO:</strong> 100%</div>
                        <div><strong>ÚLTIMA RES.:</strong> ACTUALIZACIÓN ANUAL</div>
                        <div><strong>EXENCIÓN:</strong> SIN EXENCIÓN</div>
                        <div><strong>DESTINO ECONÓMICO:</strong> HABITACIONAL / COMERCIAL</div>
                    </div>
                </div>

                {/* II. DETALLE LIQUIDACION */}
                <div style={seccionHeaderStyle}>II. DETALLE LIQUIDACIÓN</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <thead>
                        <tr>
                            <th style={{...tableHeaderStyle, textAlign: 'left'}}>Liquidación</th>
                            <th style={tableHeaderStyle}>Periodo</th>
                            <th style={tableHeaderStyle}>Valor</th>
                            <th style={tableHeaderStyle}>Facturado</th>
                            <th style={tableHeaderStyle}>Pagado</th>
                            <th style={tableHeaderStyle}>Saldo liquidación</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{...tdStyle, textAlign: 'left'}}>Liquidacion Actual</td>
                            <td style={tdStyle}>2026-1</td>
                            <td style={tdStyle}>${valorLiquidacion.toLocaleString()}</td>
                            <td style={tdStyle}>${facturado.toLocaleString()}</td>
                            <td style={tdStyle}>${pagado.toLocaleString()}</td>
                            <td style={tdStyle}>${saldo.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                {/* III. DETALLE FACTURACION Y PAGO MINIMO */}
                <div style={seccionHeaderStyle}>III. DETALLE FACTURACIÓN Y PAGO MÍNIMO</div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.5rem' }}>
                    Periodo 2026-1
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                    <thead>
                        <tr>
                            <th style={{...tableHeaderStyle, textAlign: 'left'}}>Concepto</th>
                            <th style={tableHeaderStyle}>Periodo</th>
                            <th style={tableHeaderStyle}>Vigencia Actual</th>
                            <th style={tableHeaderStyle}>Vigencias Ant</th>
                            <th style={tableHeaderStyle}>Recargos</th>
                            <th style={tableHeaderStyle}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{...tdStyle, textAlign: 'left'}}>IMPUESTO PRINCIPAL</td>
                            <td style={tdStyle}>2026-1</td>
                            <td style={tdStyle}>${(facturado * 0.8).toLocaleString()}</td>
                            <td style={tdStyle}>$0</td>
                            <td style={tdStyle}>$0</td>
                            <td style={tdStyle}>${(facturado * 0.8).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{...tdStyle, textAlign: 'left'}}>SOBRETASA / OTROS</td>
                            <td style={tdStyle}>2026-1</td>
                            <td style={tdStyle}>${(facturado * 0.2).toLocaleString()}</td>
                            <td style={tdStyle}>$0</td>
                            <td style={tdStyle}>$5.517</td>
                            <td style={tdStyle}>${((facturado * 0.2) + 5517).toLocaleString()}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
                            <td colSpan="5" style={{...tdStyle, textAlign: 'right'}}>Total</td>
                            <td style={tdStyle}>${(facturado + 5517).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                {/* PAGO MINIMO Y PERIODOS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <table style={{ borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
                                <th colSpan="2" style={{ padding: '0.3rem', fontSize: '0.8rem' }}>PAGO MÍNIMO</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.8rem' }}>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Referencia</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>19709729</td></tr>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Valor</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>${(facturado + 5517).toLocaleString()}</td></tr>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Pagar antes de</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>31/03/2026</td></tr>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Estado</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>Pago oportuno</td></tr>
                        </tbody>
                    </table>

                    <table style={{ borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#9ca3af', color: 'white' }}>
                                <th colSpan="2" style={{ padding: '0.3rem', fontSize: '0.8rem' }}>ÚLTIMO PERIODO FACTURADO</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.8rem' }}>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Periodo</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>2026-1</td></tr>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Fecha Inicio</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>01/01/2026</td></tr>
                            <tr><td style={{ padding: '0.3rem', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Fecha fin</td><td style={{ padding: '0.3rem', textAlign: 'right' }}>30/04/2026</td></tr>
                        </tbody>
                    </table>
                    
                    <table style={{ borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#9ca3af', color: 'white' }}>
                                <th style={{ padding: '0.3rem', fontSize: '0.8rem' }}>TASA E.A. TRIMESTRE</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                            <tr><td style={{ padding: '1rem', fontWeight: 'bold' }}>Tasa 2.5%</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* IIII. PAGOS REALIZADOS */}
                <div style={seccionHeaderStyle}>IIII. PAGOS REALIZADOS</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr>
                            <th style={{...tableHeaderStyle, textAlign: 'left'}}>Tipo</th>
                            <th style={tableHeaderStyle}>Comprobante</th>
                            <th style={tableHeaderStyle}>Consecutivo</th>
                            <th style={tableHeaderStyle}>Ref Abonada</th>
                            <th style={tableHeaderStyle}>Fecha de Pago</th>
                            <th style={tableHeaderStyle}>Valor Pagado</th>
                            <th style={tableHeaderStyle}>Forma de pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{...tdStyle, textAlign: 'left'}}>Factura</td>
                            <td style={tdStyle}>1984776</td>
                            <td style={tdStyle}>19681122</td>
                            <td style={tdStyle}>0</td>
                            <td style={tdStyle}>27/01/2025</td>
                            <td style={tdStyle}>$153.203</td>
                            <td style={tdStyle}>Mensual</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ textAlign: 'right', marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ marginRight: '1rem' }}>Cerrar</button>
                    <button onClick={() => window.print()} className="btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Imprimir Ficha Técnica
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FichaTecnicaModal;
