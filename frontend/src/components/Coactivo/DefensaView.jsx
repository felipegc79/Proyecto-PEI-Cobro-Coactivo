import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import IndicadorAsignacion from '../Shared/IndicadorAsignacion';

const DefensaView = ({ userName, setProcesosExternos, procesosExternos = [] }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const procesoRouteState = location.state?.procesoPreseleccionado || null;

    const [procesoVinculado, setProcesoVinculado] = useState(procesoRouteState);
    const [estadoPruebas, setEstadoPruebas] = useState('');
    
    // Panel de búsqueda y validación
    const [busqueda, setBusqueda] = useState('');
    const [resultadoBusqueda, setResultadoBusqueda] = useState(null);

    const handleBuscarProceso = () => {
        const found = procesosExternos.find(p => p.consecutivo.toUpperCase() === busqueda.toUpperCase() || p.identificacion === busqueda);
        if (found) {
            setResultadoBusqueda(found);
        } else {
            alert('No se encontró ningún proceso con ese consecutivo o identificación.');
            setResultadoBusqueda(null);
        }
    };

    const handleVincular = (proceso) => {
        setProcesoVinculado(proceso);
        setResultadoBusqueda(null);
        setBusqueda('');
    };

    useEffect(() => {
        if (procesoRouteState) {
            setProcesoVinculado(procesoRouteState);
        }
    }, [procesoRouteState]);

    const handleValidarPruebas = () => {
        alert("Pruebas Aceptadas: El proceso se suspende para su eventual cierre/archivamiento.");
        setEstadoPruebas('validas');
        if (procesoVinculado && setProcesosExternos) {
            const updated = { ...procesoVinculado, estadoProceso: 'CERRADO', estado: 'CERRADO' };
            setProcesosExternos(updated);
        }
    };

    const handleRechazarPruebas = () => {
        alert("Pruebas Rechazadas: El proceso se bloquea temporalmente en esta fase y retoma hacia la Ejecución de Medidas.");
        setEstadoPruebas('rechazadas');
        if (procesoVinculado && setProcesosExternos) {
            const updated = { ...procesoVinculado, estadoProceso: 'EN EJECUCION', estado: 'EN EJECUCION' };
            setProcesosExternos(updated);
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
            <h1 className="page-title">Defensa del Deudor</h1>
            <p className="page-subtitle">Recepción de excepciones formales y evaluación de pruebas aportadas.</p>

            <IndicadorAsignacion area="Dirección Jurídica" funcionario={userName} />

            <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
                <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid #c7d2fe', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Validacion de Expedientes</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Buscar por Consecutivo o Identificación</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <input 
                                type="text" 
                                className="p-2" 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                                placeholder="Ej. CC-2026-1025 o 43059073" 
                                style={{ flex: 1, border: '1px solid #ccc', borderRadius: '4px' }} 
                            />
                            <button className="btn" onClick={handleBuscarProceso} style={{ backgroundColor: '#2563eb' }}>
                                <Search size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {resultadoBusqueda && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #2563eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>Resultado:</strong> {resultadoBusqueda.consecutivo} - {resultadoBusqueda.nombre}
                        </div>
                        <button className="btn" onClick={() => handleVincular(resultadoBusqueda)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            Vincular para Defensa
                        </button>
                    </div>
                )}
            </div>

            {procesoVinculado && (
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                    <p style={{ margin: 0, color: '#0369a1' }}><strong>Proceso en Evaluación:</strong> {procesoVinculado.consecutivo} - {procesoVinculado.nombre} (ID: {procesoVinculado.identificacion})</p>
                </div>
            )}

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
