import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IndicadorAsignacion from '../Shared/IndicadorAsignacion';

const EjecucionView = ({ procesosExternos, userRole, userName }) => {
    const [opcion, setOpcion] = useState('A');
    const [viewAcuerdos, setViewAcuerdos] = useState('list'); // 'list' | 'detail'
    const [subTab, setSubTab] = useState('generales'); // 'generales' | 'aprobacion' | 'rechazados'
    const [filtroAcuerdosId, setFiltroAcuerdosId] = useState('');
    
    const [acuerdosMock, setAcuerdosMock] = useState(() => {
        return (procesosExternos || []).map((p, index) => ({
            id: p.id,
            consecutivo: p.consecutivo,
            identificacion: p.identificacion,
            nombre: p.nombre,
            estado: index % 3 === 0 ? 'Borrador' : (index % 3 === 1 ? 'Aprobado' : 'Rechazado'),
            cuotasVencidas: index % 5 === 0 ? 2 : 0,
            deudaTotal: p.valor || 5000000,
            cuotaInicial: (p.valor || 5000000) * 0.2,
            tasaMora: 2.5,
            plazo: 12
        }));
    });

    const [acuerdoActual, setAcuerdoActual] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tablaAmortizacion, setTablaAmortizacion] = useState([]);
    
    // Approval Status for dropdown
    const [nuevoEstadoAprobacion, setNuevoEstadoAprobacion] = useState('');

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

    // Calculate Amortization
    const calcularTabla = (deudaTotal, cuotaInicial, tasaMora, plazo) => {
        let saldo = parseFloat(deudaTotal) - parseFloat(cuotaInicial);
        if (saldo <= 0) {
            alert('La cuota inicial cubre o excede la deuda total. No hay saldo a financiar.');
            setTablaAmortizacion([]);
            return;
        }

        const cuotaCapital = saldo / parseInt(plazo);
        const tasaDecimal = parseFloat(tasaMora) / 100;

        let tempTable = [];
        let fecha = new Date();

        for (let i = 1; i <= parseInt(plazo); i++) {
            fecha.setMonth(fecha.getMonth() + 1);
            const interesMes = saldo * tasaDecimal;
            const totalCuota = cuotaCapital + interesMes;

            tempTable.push({
                numero: i,
                vencimiento: fecha.toISOString().split('T')[0],
                abonoCapital: cuotaCapital,
                intereses: interesMes,
                total: totalCuota,
                estado: 'Al día',
                fechaPago: '',
                valorPagado: 0,
                comprobante: ''
            });

            saldo -= cuotaCapital;
        }
        setTablaAmortizacion(tempTable);
    };

    // Toolbar Actions
    const handleCrear = () => {
        setAcuerdoActual({
            id: Date.now(),
            consecutivo: `AC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            identificacion: '',
            estado: 'Borrador',
            cuotasVencidas: 0,
            deudaTotal: '',
            cuotaInicial: '',
            tasaMora: 2.5,
            plazo: 12
        });
        setTablaAmortizacion([]);
        setIsEditing(true);
        setViewAcuerdos('detail');
    };

    const handleRetornar = () => {
        setViewAcuerdos('list');
        setAcuerdoActual(null);
    };

    const handleEditar = () => {
        if (acuerdoActual && (acuerdoActual.estado === 'Borrador' || acuerdoActual.estado === 'Rechazado')) {
            setIsEditing(true);
        }
    };

    const handleEliminar = () => {
        if (acuerdoActual && (acuerdoActual.estado === 'Borrador' || acuerdoActual.estado === 'Rechazado')) {
            if (window.confirm('¿Está seguro de eliminar este registro?')) {
                setAcuerdosMock(prev => prev.filter(a => a.id !== acuerdoActual.id));
                handleRetornar();
            }
        }
    };

    const handleGuardar = () => {
        if (!acuerdoActual) return;
        
        let nuevoEstado = acuerdoActual.estado;
        
        if (isEditing && !acuerdoActual.identificacion) {
            alert('Debe ingresar la identificación.');
            return;
        }
        
        if (nuevoEstadoAprobacion !== '') {
            nuevoEstado = nuevoEstadoAprobacion;
        } else if (acuerdoActual.estado !== 'Aprobado') {
            nuevoEstado = 'Borrador'; 
        }

        const actualizado = { ...acuerdoActual, estado: nuevoEstado };

        const existe = acuerdosMock.find(a => a.id === acuerdoActual.id);
        if (existe) {
            setAcuerdosMock(prev => prev.map(a => a.id === actualizado.id ? actualizado : a));
        } else {
            setAcuerdosMock(prev => [...prev, actualizado]);
        }
        
        setAcuerdoActual(actualizado);
        setIsEditing(false);
        setNuevoEstadoAprobacion('');
        
        if (nuevoEstado === 'Borrador') {
            alert('Acuerdo guardado exitosamente. Estado: Borrador.');
        } else if (nuevoEstado === 'Aprobado') {
            alert('Acuerdo Aprobado exitosamente.');
        } else if (nuevoEstado === 'Rechazado') {
            alert('Acuerdo Rechazado.');
        }
    };

    const abrirDetalle = (acuerdo) => {
        setAcuerdoActual(acuerdo);
        setIsEditing(false);
        setNuevoEstadoAprobacion('');
        if (acuerdo.deudaTotal && acuerdo.cuotaInicial) {
            calcularTabla(acuerdo.deudaTotal, acuerdo.cuotaInicial, acuerdo.tasaMora, acuerdo.plazo);
        } else {
            setTablaAmortizacion([]);
        }
        setViewAcuerdos('detail');
    };

    // Subasta Option B & C logic
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

    // Filtros de Listado
    let acuerdosFiltrados = acuerdosMock;
    if (subTab === 'generales') {
        acuerdosFiltrados = acuerdosMock.filter(a => a.estado === 'Aprobado' || a.estado === 'Cancelado');
    } else if (subTab === 'aprobacion') {
        acuerdosFiltrados = acuerdosMock.filter(a => a.estado === 'Borrador');
    } else if (subTab === 'rechazados') {
        acuerdosFiltrados = acuerdosMock.filter(a => a.estado === 'Rechazado');
    }

    if (filtroAcuerdosId) {
        acuerdosFiltrados = acuerdosFiltrados.filter(a => 
            a.consecutivo.includes(filtroAcuerdosId) || a.identificacion.includes(filtroAcuerdosId)
        );
    }

    return (
        <div>
            <h1 className="page-title">Ejecución y Recuperación de Cartera</h1>
            <p className="page-subtitle">Seleccione el escenario a aplicar para la fase ejecutiva y el recaudo final.</p>

            <IndicadorAsignacion area="Recaudos y Tesorería" funcionario={userName || "Lic. Marlene Santos"} />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <button
                    className={`btn ${opcion === 'A' ? '' : 'btn-outline'}`}
                    onClick={() => { setOpcion('A'); setViewAcuerdos('list'); }}
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

            {opcion === 'A' && viewAcuerdos === 'list' && (
                <div className="card">
                    {/* Tabs de Sub-Menú */}
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem' }}>
                        <button 
                            style={{ padding: '0.5rem 1rem', background: subTab === 'generales' ? 'var(--color-primary)' : 'transparent', color: subTab === 'generales' ? 'white' : 'var(--color-text)', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => setSubTab('generales')}
                        >
                            Consultas Generales
                        </button>
                        <button 
                            style={{ padding: '0.5rem 1rem', background: subTab === 'aprobacion' ? 'var(--color-primary)' : 'transparent', color: subTab === 'aprobacion' ? 'white' : 'var(--color-text)', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => setSubTab('aprobacion')}
                        >
                            Aprobación de Acuerdos
                        </button>
                        <button 
                            style={{ padding: '0.5rem 1rem', background: subTab === 'rechazados' ? 'var(--color-primary)' : 'transparent', color: subTab === 'rechazados' ? 'white' : 'var(--color-text)', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => setSubTab('rechazados')}
                        >
                            Historial Rechazados
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                        <h3>{subTab === 'generales' ? 'Acuerdos Aprobados y Vigentes' : subTab === 'aprobacion' ? 'Borradores Pendientes de Aprobación' : 'Acuerdos Rechazados'}</h3>
                        <button className="btn" onClick={handleCrear}>
                            ➕ Crear Nuevo Acuerdo
                        </button>
                    </div>

                    {/* Alertas de Incumplimiento */}
                    {subTab === 'generales' && acuerdosMock.filter(a => a.estado === 'Aprobado' && a.cuotasVencidas > 0).length > 0 && (
                        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                            <strong>¡Alerta de Incumplimiento!</strong> Hay {acuerdosMock.filter(a => a.estado === 'Aprobado' && a.cuotasVencidas > 0).length} acuerdo(s) con cuotas vencidas.
                        </div>
                    )}

                    {/* Buscador/Lupita */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <span style={{ position: 'absolute', top: '35px', left: '10px', fontSize: '1.2rem' }}>🔍</span>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Buscar por Consecutivo o Identificación</label>
                            <input 
                                type="text" 
                                className="p-2 mt-2" 
                                placeholder="Ej: AC-2024-001 o 12345678" 
                                value={filtroAcuerdosId}
                                onChange={e => setFiltroAcuerdosId(e.target.value)}
                                style={{ width: '100%', paddingLeft: '35px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#efefef', borderBottom: '2px solid #ccc' }}>
                                <th style={{ padding: '1rem' }}>Consecutivo</th>
                                <th style={{ padding: '1rem' }}>Identificación</th>
                                <th style={{ padding: '1rem' }}>Nombre</th>
                                <th style={{ padding: '1rem' }}>Estado</th>
                                <th style={{ padding: '1rem' }}>{subTab === 'aprobacion' ? 'Deuda a Financiar' : 'Alertas'}</th>
                                <th style={{ padding: '1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acuerdosFiltrados.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{a.consecutivo}</td>
                                    <td style={{ padding: '1rem' }}>{a.identificacion}</td>
                                    <td style={{ padding: '1rem' }}>{a.nombre || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                            backgroundColor: a.estado === 'Borrador' ? '#fef3c7' : a.estado === 'Aprobado' ? '#ecfdf5' : '#fee2e2',
                                            color: a.estado === 'Borrador' ? '#b45309' : a.estado === 'Aprobado' ? '#065f46' : '#991b1b'
                                        }}>
                                            {a.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {subTab === 'aprobacion' ? 
                                            `$ ${Number(a.deudaTotal).toLocaleString('es-CO')}` :
                                            (a.cuotasVencidas > 0 ? <span style={{ color: 'red', fontWeight: 'bold' }}>{a.cuotasVencidas} Cuota(s) Vencida(s)</span> : <span style={{ color: 'green' }}>Al día</span>)
                                        }
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }} onClick={() => abrirDetalle(a)}>
                                            {subTab === 'aprobacion' ? 'Revisar / Aprobar' : 'Ver Detalle'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {acuerdosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {opcion === 'A' && viewAcuerdos === 'detail' && acuerdoActual && (
                <div className="card">
                    {/* Barra de Herramientas (Toolbar) Superior */}
                    <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button title="Crear Nuevo" onClick={handleCrear} className="btn btn-outline" style={{ background: 'white', borderColor: '#ccc', color: '#333' }}>
                            ➕ Crear
                        </button>
                        <button title="Guardar" onClick={handleGuardar} className="btn btn-outline" style={{ background: 'white', borderColor: '#ccc', color: '#333' }} disabled={!isEditing && !nuevoEstadoAprobacion}>
                            💾 Guardar
                        </button>
                        <button title="Eliminar" onClick={handleEliminar} className="btn btn-outline" style={{ background: 'white', borderColor: '#ccc', color: '#d32f2f' }} disabled={acuerdoActual.estado !== 'Borrador' && acuerdoActual.estado !== 'Rechazado'}>
                            🗑️ Eliminar
                        </button>
                        <button title="Editar" onClick={handleEditar} className="btn btn-outline" style={{ background: 'white', borderColor: '#ccc', color: '#333' }} disabled={isEditing || (acuerdoActual.estado !== 'Borrador' && acuerdoActual.estado !== 'Rechazado')}>
                            ✏️ Editar
                        </button>
                        <button title="Retornar" onClick={handleRetornar} className="btn btn-outline" style={{ background: 'white', borderColor: '#ccc', color: '#333', marginLeft: 'auto' }}>
                            ⬅️ Retornar
                        </button>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>{acuerdoActual.estado === 'Borrador' && isEditing && !acuerdoActual.identificacion ? 'Crear Nuevo Acuerdo de Pago' : `Acuerdo: ${acuerdoActual.consecutivo} - Estado: ${acuerdoActual.estado}`}</h3>
                        
                        {/* Dropdown de Aprobación */}
                        {subTab === 'aprobacion' && !isEditing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eef2ff', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                                <label style={{ fontWeight: 'bold', color: '#3730a3' }}>Acción de Aprobación:</label>
                                <select 
                                    className="p-1" 
                                    style={{ borderRadius: '4px', border: '1px solid #a5b4fc', outline: 'none' }}
                                    value={nuevoEstadoAprobacion}
                                    onChange={(e) => setNuevoEstadoAprobacion(e.target.value)}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="Aprobado">Aprobar Acuerdo</option>
                                    <option value="Rechazado">Rechazar Acuerdo</option>
                                </select>
                                <button className="btn" style={{ padding: '0.4rem 1rem', background: '#4f46e5' }} onClick={handleGuardar} disabled={!nuevoEstadoAprobacion}>
                                    Confirmar
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ fontWeight: '500' }}>Identificación Contribuyente</label>
                            <input type="text" value={acuerdoActual.identificacion} onChange={e => setAcuerdoActual({ ...acuerdoActual, identificacion: e.target.value })} className="mt-2" disabled={!isEditing} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}/>
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Deuda Total a Financiar ($)</label>
                            <input type="number" value={acuerdoActual.deudaTotal} onChange={e => setAcuerdoActual({ ...acuerdoActual, deudaTotal: e.target.value })} className="mt-2" disabled={!isEditing} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}/>
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Plazo (Meses)</label>
                            <input type="number" value={acuerdoActual.plazo} onChange={e => setAcuerdoActual({ ...acuerdoActual, plazo: e.target.value })} className="mt-2" disabled={!isEditing} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}/>
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Cuota Inicial Acordada ($)</label>
                            <input type="number" value={acuerdoActual.cuotaInicial} onChange={e => setAcuerdoActual({ ...acuerdoActual, cuotaInicial: e.target.value })} className="mt-2" disabled={!isEditing} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}/>
                        </div>
                        <div>
                            <label style={{ fontWeight: '500' }}>Tasa Interés Mora (%)</label>
                            <input type="number" step="0.1" value={acuerdoActual.tasaMora} onChange={e => setAcuerdoActual({ ...acuerdoActual, tasaMora: e.target.value })} className="mt-2" disabled={!isEditing} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}/>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <button className="btn btn-outline" onClick={() => calcularTabla(acuerdoActual.deudaTotal, acuerdoActual.cuotaInicial, acuerdoActual.tasaMora, acuerdoActual.plazo)} disabled={!acuerdoActual.deudaTotal || !acuerdoActual.cuotaInicial}>
                            Generar / Recalcular Tabla de Amortización
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Tabla de Amortización (Proyección Cuotas)</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fafafa', borderRadius: 'var(--radius-sm)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                                        <th style={{ padding: '1rem' }}>Cuota #</th>
                                        <th style={{ padding: '1rem' }}>Vencimiento</th>
                                        <th style={{ padding: '1rem' }}>Total Cuota</th>
                                        {acuerdoActual.estado === 'Aprobado' && (
                                            <>
                                                <th style={{ padding: '1rem' }}>Fecha Real Pago</th>
                                                <th style={{ padding: '1rem' }}>Valor Pagado</th>
                                                <th style={{ padding: '1rem' }}>No. Comprobante</th>
                                            </>
                                        )}
                                        <th style={{ padding: '1rem' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablaAmortizacion.length > 0 ? tablaAmortizacion.map((fila, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1rem' }}>{fila.numero}</td>
                                            <td style={{ padding: '1rem' }}>{fila.vencimiento}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>$ {Math.round(fila.total).toLocaleString('es-CO')}</td>
                                            {acuerdoActual.estado === 'Aprobado' && (
                                                <>
                                                    <td style={{ padding: '1rem' }}>
                                                        <input type="date" className="p-1" style={{ border: '1px solid #ccc', borderRadius: '4px' }} defaultValue={fila.fechaPago} />
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <input type="number" className="p-1" style={{ width: '100px', border: '1px solid #ccc', borderRadius: '4px' }} defaultValue={fila.valorPagado} />
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <input type="text" className="p-1" style={{ width: '100px', border: '1px solid #ccc', borderRadius: '4px' }} defaultValue={fila.comprobante} />
                                                    </td>
                                                </>
                                            )}
                                            <td style={{ padding: '1rem', color: 'var(--color-primary)' }}>{fila.estado}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={acuerdoActual.estado === 'Aprobado' ? 7 : 4} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                                Presione "Generar / Recalcular Tabla" para ver la proyección.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {acuerdoActual.estado === 'Aprobado' && (
                        <div style={{ marginTop: '2.5rem', textAlign: 'right', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-outline" style={{ color: 'green', borderColor: 'green' }} onClick={() => alert('Pagos actualizados exitosamente.')}>
                                Actualizar Pagos
                            </button>
                            <button className="btn" onClick={handleGenerarRecibo}>
                                Generar Recibo de Pago (Código Barras)
                            </button>
                        </div>
                    )}
                    {acuerdoActual.estado === 'Borrador' && (
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <small style={{ color: '#888' }}>* Los recibos de pago solo se habilitan cuando el acuerdo es Aprobado.</small>
                        </div>
                    )}

                    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                        <div ref={reciboPdfRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: 'white', width: '800px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
                                <h2>RECIBO DE PAGO - ACUERDO DE AMORTIZACIÓN</h2>
                                <p>JURISDICCIÓN COACTIVA - SUPERTRANSPORTE</p>
                            </div>
                            <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                            <p><strong>Deudor / Contribuyente:</strong> {acuerdoActual.identificacion || 'N/A'}</p>
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
                                <div style={{ fontSize: '10px' }}>(145) {acuerdoActual.identificacion || '0000'} (8020) 0000000000000 (96) 20260324</div>
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
                            <input type="number" placeholder="$ Valor recabado" className="mt-2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}/>
                        </div>

                        <div>
                            <label style={{ fontWeight: '500' }}>Seleccionar Obligaciones a Saldar (Shift + Click)</label>
                            <select multiple style={{ height: '120px', width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} className="mt-2">
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
