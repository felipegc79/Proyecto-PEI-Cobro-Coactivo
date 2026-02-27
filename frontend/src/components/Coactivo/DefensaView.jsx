import React, { useState } from 'react';

const DefensaView = () => {
    const [estadoPruebas, setEstadoPruebas] = useState('');

    const handleValidarPruebas = () => {
        alert("Pruebas Aceptadas: El proceso se suspende para su eventual cierre/archivamiento.");
        setEstadoPruebas('validas');
    };

    const handleRechazarPruebas = () => {
        alert("Pruebas Rechazadas: El proceso se bloquea temporalmente en esta fase y retoma hacia la Ejecución de Medidas.");
        setEstadoPruebas('rechazadas');
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
            <h1 className="page-title">Defensa del Deudor</h1>
            <p className="page-subtitle">Recepción de excepciones formales y evaluación de pruebas aportadas.</p>

            <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    Recepción de Excepciones (Recursos)
                </h3>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
                    Interfáz administrativa para cargar los recursos, documentos respaldatorios, impugnaciones o pruebas formales entregadas por el contribuyente para oponerse al remate.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: '500' }}>Detalle de las Excepciones / Alegatos</label>
                    <textarea className="mt-2" rows={5} placeholder="Describa aquí el resumen de las excepciones expuestas por el deudor..."></textarea>
                </div>

                <div>
                    <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Cargar Documentos de Evidencia (Con Tipificación)</label>
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
                                            <option value="Derecho de Petición">Derecho de Petición</option>
                                            <option value="Recurso de Reconsideración">Recurso de Reconsideración</option>
                                            <option value="Comprobante de Pago Previo">Comprobante de Pago Previo</option>
                                            <option value="Otro Soporte">Otro Soporte</option>
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
            </div>

            <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem 2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Evaluación de Excepciones (Bifurcación del Proceso)</h3>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                    La Autoridad Competente debe determinar la validez de las pruebas aportadas para decidir si el proceso cesa o continúa la vía ejecutiva normal.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <button className="btn" style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', backgroundColor: '#2e7d32' }} onClick={handleValidarPruebas}>
                        ✓ Pruebas Válidas (Finalizar Proceso)
                    </button>
                    <button className="btn" style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', backgroundColor: '#d32f2f' }} onClick={handleRechazarPruebas}>
                        ✕ Pruebas Rechazadas (Continuar Vía Coactiva)
                    </button>
                </div>

                {estadoPruebas === 'validas' && (
                    <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#e8f5e9', color: '#1b5e20', borderRadius: 'var(--radius-md)', border: '1px solid #c8e6c9', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>✓</div>
                        <div>
                            <h4 style={{ color: '#1b5e20', margin: '0 0 0.25rem 0' }}>Resolución: Pruebas Aceptadas</h4>
                            Las pruebas han sido consideradas como válidas. El proceso coactivo actual queda detenido y puede proceder a la pestaña de Cierre y emisión de Paz y Salvo.
                        </div>
                    </div>
                )}

                {estadoPruebas === 'rechazadas' && (
                    <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#ffebee', color: '#b71c1c', borderRadius: 'var(--radius-md)', border: '1px solid #ffcdd2', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>✕</div>
                        <div>
                            <h4 style={{ color: '#b71c1c', margin: '0 0 0.25rem 0' }}>Resolución: Pruebas Denegadas</h4>
                            Las pruebas ingresadas han sido rechazadas porque no son concluyentes o no aplican. El proceso se reanuda y continúa su curso hacia la etapa de <strong>Ejecución (Gestión de Recaudo).</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default DefensaView;
