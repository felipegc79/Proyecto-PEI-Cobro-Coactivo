import React, { useState } from 'react';

const FacturaCard = ({ factura, isSelected, onSelect }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalPreview, setModalPreview] = useState(false);
    const [modalDetalle, setModalDetalle] = useState(false);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    return (
        <div className="card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `6px solid var(--color-primary)`,
            marginBottom: '1rem',
            padding: '1rem',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(factura.id, e.target.checked)}
                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                        Obligación #{factura.id} ({factura.fuente})
                    </span>
                    <span style={{ color: 'var(--color-text-light)' }}>
                        Periodo: {factura.periodo} | Estado: <strong style={{ color: '#d32f2f' }}>{factura.estado}</strong>
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
                    $ {factura.valor.toLocaleString('es-CO')}
                </div>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={toggleDropdown}
                        className="btn btn-outline"
                        style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                    >
                        &#8942;
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '45px',
                            backgroundColor: 'var(--color-white)',
                            boxShadow: 'var(--shadow-md)',
                            borderRadius: 'var(--radius-sm)',
                            zIndex: 10,
                            minWidth: '150px',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <button
                                className="dropdown-item"
                                style={{ padding: '0.75rem 1rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                                onClick={() => { setModalPreview(true); setDropdownOpen(false); }}
                            >
                                Previsualizar Factura
                            </button>
                            <button
                                className="dropdown-item"
                                style={{ padding: '0.75rem 1rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                                onClick={() => { setModalDetalle(true); setDropdownOpen(false); }}
                            >
                                Ver Detalle
                            </button>
                            <button
                                className="dropdown-item"
                                style={{ padding: '0.75rem 1rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#d32f2f' }}
                                onClick={() => setDropdownOpen(false)}
                            >
                                Cerrar Menú
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Previsualización de Factura */}
            {modalPreview && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button onClick={() => setModalPreview(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>

                        <div style={{ border: '1px solid #ccc', padding: '2rem', marginTop: '1rem', fontFamily: 'monospace' }}>
                            <h2 style={{ textAlign: 'center', margin: 0 }}>FACTURA OFICIAL</h2>
                            <h3 style={{ textAlign: 'center', fontWeight: 'normal', margin: '5px 0 20px 0' }}>Superintendencia de Transporte</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <div><strong>Obligación:</strong> #{factura.id}</div>
                                <div><strong>Fecha Emisión:</strong> 10/01/{factura.periodo}</div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <p><strong>Concepto Central:</strong> {factura.fuente} - Periodo {factura.periodo}</p>
                                <p><strong>Estado:</strong> {factura.estado}</p>
                            </div>
                            <div style={{ borderTop: '2px solid #000', paddingTop: '1rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                <h2>TOTAL ADEUDADO:</h2>
                                <h2>$ {factura.valor.toLocaleString('es-CO')}</h2>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '3rem', color: '#888' }}>
                                <p>|| || || | || || | || | || || || ||</p>
                                <p style={{ fontSize: '0.8rem' }}>(415)770999800041(8020)00000{factura.valor}(96)20261231</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalles y Desglose */}
            {modalDetalle && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '700px', position: 'relative' }}>
                        <button onClick={() => setModalDetalle(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>

                        <h2 style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                            Detalle de la Deuda - {factura.id}
                        </h2>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f3f4f6' }}>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #e5e7eb' }}>Concepto Detallado</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #e5e7eb' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Capital Inicial ({factura.fuente})</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>$ {(factura.valor * 0.7).toLocaleString('es-CO')}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Intereses de Mora Acumulados</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>$ {(factura.valor * 0.25).toLocaleString('es-CO')}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Sanciones / Costas del Proceso</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>$ {(factura.valor * 0.05).toLocaleString('es-CO')}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem' }}>TOTAL LÍQUIDO</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#d32f2f' }}>$ {factura.valor.toLocaleString('es-CO')}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div style={{ textAlign: 'right' }}>
                            <button className="btn btn-outline" onClick={() => setModalDetalle(false)}>Cerrar Detalle</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacturaCard;
