import React, { useState } from 'react';
import { FileText, Phone, Mail, User, Search, Eye, Trash2, Plus, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

const SeguimientoView = ({ procesosExternos, setProcesosExternos }) => {
    const [filtroRazonSocial, setFiltroRazonSocial] = useState('');
    const [filtroCedula, setFiltroCedula] = useState('');
    const [filtroConsecutivo, setFiltroConsecutivo] = useState('');
    const [selectedProceso, setSelectedProceso] = useState(null);
    const [activeTab, setActiveTab] = useState('telefonica');

    // Usar procesos externos sincronizados desde App.jsx
    const procesos = procesosExternos || [];

    const handleVerMandamiento = (proceso) => {
        if (proceso.pdfUrl && proceso.pdfUrl !== '#') {
            window.open(proceso.pdfUrl, '_blank');
            return;
        }

        // Simulación si no hay URL real (para datos de prueba estáticos)
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("MANDAMIENTO DE PAGO (SIMULACIÓN)", 20, 20);
        doc.setFontSize(12);
        doc.text(`Consecutivo: ${proceso.consecutivo}`, 20, 40);
        doc.text(`Deudor: ${proceso.nombre}`, 20, 50);
        doc.text(`Identificación: ${proceso.identificacion}`, 20, 60);
        doc.text(`Estado: ${proceso.estado}`, 20, 70);
        doc.text("Este es el documento generado en el módulo de Apertura.", 20, 90);
        
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const procesosFiltrados = procesos.filter(p => 
        p.nombre.toLowerCase().includes(filtroRazonSocial.toLowerCase()) &&
        p.identificacion.includes(filtroCedula) &&
        p.consecutivo.toLowerCase().includes(filtroConsecutivo.toLowerCase())
    );

    const handleOpenNotificaciones = (proceso) => {
        setSelectedProceso(JSON.parse(JSON.stringify(proceso))); // Clone for local editing
    };

    const handleAddRecord = () => {
        const newRecord = {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            observacion: '',
            adjuntos: [],
            // Specific fields for tabs
            transportadora: '',
            direccion: '',
            guia: '',
            emailDestino: ''
        };

        const updated = { ...selectedProceso };
        if (activeTab === 'telefonica') updated.notificaciones.telefonica.push(newRecord);
        else if (activeTab === 'personal') updated.notificaciones.personal.push(newRecord);
        else if (activeTab === 'email') updated.notificaciones.electronico.push(newRecord);
        
        setSelectedProceso(updated);
    };

    const handleDeleteRecord = (id) => {
        const updated = { ...selectedProceso };
        if (activeTab === 'telefonica') updated.notificaciones.telefonica = updated.notificaciones.telefonica.filter(r => r.id !== id);
        else if (activeTab === 'personal') updated.notificaciones.personal = updated.notificaciones.personal.filter(r => r.id !== id);
        else if (activeTab === 'email') updated.notificaciones.electronico = updated.notificaciones.electronico.filter(r => r.id !== id);
        setSelectedProceso(updated);
    };

    const handleFileChange = (recordId, files) => {
        const updated = { ...selectedProceso };
        const recordType = activeTab === 'telefonica' ? 'telefonica' : (activeTab === 'personal' ? 'personal' : 'electronico');
        const records = updated.notificaciones[recordType];
        const recordIndex = records.findIndex(r => r.id === recordId);
        
        if (recordIndex !== -1) {
            const newAdjuntos = Array.from(files).map(f => ({
                name: f.name,
                type: f.type,
                url: URL.createObjectURL(f)
            }));
            records[recordIndex].adjuntos = [...records[recordIndex].adjuntos, ...newAdjuntos];
            setSelectedProceso(updated);
        }
    };

    const removeAdjunto = (recordId, adjuntoIndex) => {
        const updated = { ...selectedProceso };
        const recordType = activeTab === 'telefonica' ? 'telefonica' : (activeTab === 'personal' ? 'personal' : 'electronico');
        const records = updated.notificaciones[recordType];
        const recordIndex = records.findIndex(r => r.id === recordId);
        
        if (recordIndex !== -1) {
            records[recordIndex].adjuntos.splice(adjuntoIndex, 1);
            setSelectedProceso(updated);
        }
    };

    const handleSaveNotificaciones = () => {
        if (setProcesosExternos) {
            setProcesosExternos(selectedProceso);
        }
        alert('¡Registros guardados exitosamente!');
        setSelectedProceso(null);
    };

    const renderTabContent = () => {
        if (!selectedProceso) return null;

        const records = activeTab === 'telefonica' 
            ? selectedProceso.notificaciones.telefonica 
            : (activeTab === 'personal' ? selectedProceso.notificaciones.personal : selectedProceso.notificaciones.electronico);

        return (
            <div className="tab-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>
                        {activeTab === 'telefonica' ? 'Llamadas Telefónicas' : (activeTab === 'personal' ? 'Correo Certificado / Personal' : 'Correo Electrónico')}
                    </h4>
                    <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={handleAddRecord}>
                        <Plus size={14} /> Añadir Registro
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {records.map((n) => (
                        <div key={n.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>Fecha</label>
                                        <div style={{ fontWeight: '500' }}>{n.fecha}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>Hora</label>
                                        <div style={{ fontWeight: '500' }}>{n.hora}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteRecord(n.id)}
                                    style={{ color: 'crimson', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {activeTab === 'personal' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.8rem' }}>Transportadora</label>
                                        <input 
                                            type="text" 
                                            className="p-1" 
                                            value={n.transportadora}
                                            onChange={(e) => {
                                                const updated = { ...selectedProceso };
                                                const index = updated.notificaciones.personal.findIndex(r => r.id === n.id);
                                                updated.notificaciones.personal[index].transportadora = e.target.value;
                                                setSelectedProceso(updated);
                                            }}
                                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.8rem' }}>Número de Guía</label>
                                        <input 
                                            type="text" 
                                            className="p-1" 
                                            value={n.guia}
                                            onChange={(e) => {
                                                const updated = { ...selectedProceso };
                                                const index = updated.notificaciones.personal.findIndex(r => r.id === n.id);
                                                updated.notificaciones.personal[index].guia = e.target.value;
                                                setSelectedProceso(updated);
                                            }}
                                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.8rem' }}>Dirección</label>
                                        <input 
                                            type="text" 
                                            className="p-1" 
                                            value={n.direccion}
                                            onChange={(e) => {
                                                const updated = { ...selectedProceso };
                                                const index = updated.notificaciones.personal.findIndex(r => r.id === n.id);
                                                updated.notificaciones.personal[index].direccion = e.target.value;
                                                setSelectedProceso(updated);
                                            }}
                                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'email' && (
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Correo de Destino</label>
                                    <input 
                                        type="email" 
                                        className="p-1" 
                                        value={n.emailDestino}
                                        onChange={(e) => {
                                            const updated = { ...selectedProceso };
                                            const index = updated.notificaciones.electronico.findIndex(r => r.id === n.id);
                                            updated.notificaciones.electronico[index].emailDestino = e.target.value;
                                            setSelectedProceso(updated);
                                        }}
                                        style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                    />
                                </div>
                            )}

                            <label style={{ fontSize: '0.8rem' }}>Observaciones</label>
                            <textarea 
                                className="p-2" 
                                placeholder="Escriba aquí..."
                                style={{ width: '100%', height: '60px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
                                value={n.observacion}
                                onChange={(e) => {
                                    const updated = { ...selectedProceso };
                                    const type = activeTab === 'telefonica' ? 'telefonica' : (activeTab === 'personal' ? 'personal' : 'electronico');
                                    const index = updated.notificaciones[type].findIndex(r => r.id === n.id);
                                    updated.notificaciones[type][index].observacion = e.target.value;
                                    setSelectedProceso(updated);
                                }}
                            />

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                    Adjuntar Archivos ({activeTab === 'telefonica' ? 'Audio MP3' : 'PNG, JPEG, PDF'})
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input 
                                        type="file" 
                                        multiple
                                        accept={activeTab === 'telefonica' ? ".mp3" : ".png, .jpg, .jpeg, .pdf"}
                                        onChange={(e) => handleFileChange(n.id, e.target.files)}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {n.adjuntos.map((adj, idx) => (
                                            <div key={idx} style={{ 
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                                padding: '0.3rem 0.5rem', background: '#f0f9ff', border: '1px solid #bae6fd',
                                                borderRadius: '4px', fontSize: '0.8rem'
                                            }}>
                                                <FileText size={14} style={{ color: '#0284c7' }} />
                                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {adj.name}
                                                </span>
                                                <button 
                                                    onClick={() => removeAdjunto(n.id, idx)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {records.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', border: '2px dashed #e5e7eb', color: '#9ca3af' }}>
                            No hay registros. Haga clic en "Añadir Registro" para comenzar.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title">Seguimiento de Procesos</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: '#6b7280' }}>Área: </span>
                        <strong style={{ color: '#1f2937' }}>Seguimiento y Control</strong>
                    </div>
                    <div style={{ width: '1px', height: '20px', background: '#d1d5db' }}></div>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: '#6b7280' }}>Funcionario: </span>
                        <strong style={{ color: '#1f2937' }}>Admin Seguimiento</strong>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    Buscador de Procesos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Razón Social / Nombre</label>
                        <input 
                            type="text" 
                            className="p-2" 
                            placeholder="Buscar..." 
                            value={filtroRazonSocial}
                            onChange={(e) => setFiltroRazonSocial(e.target.value)}
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Cédula / NIT</label>
                        <input 
                            type="text" 
                            className="p-2" 
                            placeholder="Buscar..." 
                            value={filtroCedula}
                            onChange={(e) => setFiltroCedula(e.target.value)}
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Consecutivo del Proceso</label>
                        <input 
                            type="text" 
                            className="p-2" 
                            placeholder="CC-XXXX-XXX" 
                            value={filtroConsecutivo}
                            onChange={(e) => setFiltroConsecutivo(e.target.value)}
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Search size={18} /> Buscar
                    </button>
                </div>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                            <th style={{ padding: '1rem' }}>Nombre</th>
                            <th style={{ padding: '1rem' }}>Identificación</th>
                            <th style={{ padding: '1rem' }}>Consecutivo</th>
                            <th style={{ padding: '1rem' }}>Estado</th>
                            <th style={{ padding: '1rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {procesosFiltrados.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem' }}>{p.nombre}</td>
                                <td style={{ padding: '1rem' }}>{p.identificacion}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        {p.consecutivo}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ color: '#059669', fontWeight: 'bold' }}>{p.estado}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            className="btn btn-outline" 
                                            onClick={() => handleVerMandamiento(p)}
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        >
                                            <FileText size={14} /> Ver Mandamiento
                                        </button>
                                        <button 
                                            className="btn" 
                                            onClick={() => handleOpenNotificaciones(p)}
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        >
                                            <Mail size={14} /> Notificaciones
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedProceso && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 1000 
                }}>
                    <div className="card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button 
                            onClick={() => setSelectedProceso(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                        >
                            &times;
                        </button>
                        <h2 style={{ marginBottom: '0.5rem' }}>Registro de Notificaciones</h2>
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Nombre</span>
                                    <div style={{ fontWeight: 'bold' }}>{selectedProceso.nombre}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Identificación</span>
                                    <div style={{ fontWeight: 'bold' }}>{selectedProceso.identificacion}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Consecutivo</span>
                                    <div style={{ color: '#4338ca', fontWeight: 'bold' }}>{selectedProceso.consecutivo}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                            <button 
                                onClick={() => setActiveTab('telefonica')}
                                style={{ 
                                    padding: '0.75rem 1.5rem', border: 'none', borderBottom: activeTab === 'telefonica' ? '3px solid var(--color-primary)' : 'none',
                                    background: 'none', cursor: 'pointer', fontWeight: activeTab === 'telefonica' ? 'bold' : 'normal',
                                    color: activeTab === 'telefonica' ? 'var(--color-primary)' : '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Phone size={18} /> Telefónica
                            </button>
                            <button 
                                onClick={() => setActiveTab('personal')}
                                style={{ 
                                    padding: '0.75rem 1.5rem', border: 'none', borderBottom: activeTab === 'personal' ? '3px solid var(--color-primary)' : 'none',
                                    background: 'none', cursor: 'pointer', fontWeight: activeTab === 'personal' ? 'bold' : 'normal',
                                    color: activeTab === 'personal' ? 'var(--color-primary)' : '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <User size={18} /> Personal / Correo Certificado
                            </button>
                            <button 
                                onClick={() => setActiveTab('email')}
                                style={{ 
                                    padding: '0.75rem 1.5rem', border: 'none', borderBottom: activeTab === 'email' ? '3px solid var(--color-primary)' : 'none',
                                    background: 'none', cursor: 'pointer', fontWeight: activeTab === 'email' ? 'bold' : 'normal',
                                    color: activeTab === 'email' ? 'var(--color-primary)' : '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Mail size={18} /> Correo Electrónico
                            </button>
                        </div>

                        <div style={{ padding: '1rem 0' }}>
                            {renderTabContent()}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setSelectedProceso(null)}>Cerrar</button>
                            <button className="btn" onClick={handleSaveNotificaciones}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeguimientoView;
