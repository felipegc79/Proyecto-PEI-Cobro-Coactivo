import React, { useState, useRef } from 'react';
import BuscadorDeudor from './BuscadorDeudor';
import FacturasList from './EstadoCuenta/FacturasList';
import MandamientoPreview, { MandamientoPDFContent } from './GeneracionMandamiento/MandamientoPreview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const AperturaView = () => {
    const [deudorActual, setDeudorActual] = useState(null);
    const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]);
    const [mandamientoGenerado, setMandamientoGenerado] = useState(false);
    const pdfRef = useRef(null);

    const mockFacturas = [
        { id: 'F001', fuente: 'Predial', periodo: '2022', valor: 1500000, mora: true, estado: 'En mora' },
        { id: 'F002', fuente: 'Predial', periodo: '2023', valor: 1600000, mora: true, estado: 'En mora' },
        { id: 'F003', fuente: 'ICA', periodo: '2023', valor: 850000, mora: true, estado: 'En mora' },
    ];

    const handleSelectFactura = (facturaId, isSelected) => {
        if (isSelected) {
            setFacturasSeleccionadas([...facturasSeleccionadas, facturaId]);
        } else {
            setFacturasSeleccionadas(facturasSeleccionadas.filter(id => id !== facturaId));
        }
    };

    const procesarMandamiento = () => {
        if (facturasSeleccionadas.length === 0) {
            alert("Debe seleccionar al menos una factura para generar el mandamiento.");
            return;
        }

        if (pdfRef.current) {
            pdfRef.current.style.position = 'absolute';
            pdfRef.current.style.top = '0px';
            pdfRef.current.style.left = '0px';
            pdfRef.current.style.zIndex = '9999';

            html2canvas(pdfRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft > 0) {
                    position = position - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }

                pdf.save(`Mandamiento_Pago_${deudorActual.identificacion}.pdf`);

                pdfRef.current.style.top = '-10000px';
                pdfRef.current.style.left = '-10000px';
                pdfRef.current.style.zIndex = '-1';
                setMandamientoGenerado(true);
            });
        }
    };

    const onAprobar = () => {
        alert("Mandamiento Aprobado. Iniciando notificación al deudor (Multicanal)...");
    };

    const onRechazar = () => {
        alert("Mandamiento Rechazado. Se requiere revisión.");
        setMandamientoGenerado(false);
    };

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 5;

    // Filtros de tabla
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroIdentificacion, setFiltroIdentificacion] = useState('');
    const [filtroObligacion, setFiltroObligacion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    // Generador de datos simulados para la tabla (50 registros)
    const mockProcesos = useRef(Array.from({ length: 50 }).map((_, i) => {
        const year = 2024 + Math.floor(Math.random() * 3);
        let month = Math.floor(Math.random() * 12) + 1;
        if (year === 2026) month = Math.floor(Math.random() * 2) + 1;
        const isCompany = Math.random() > 0.6;
        const id = isCompany ? `900${Math.floor(100000 + Math.random() * 900000)}` : `${Math.floor(10000000 + Math.random() * 90000000)}`;
        const name = isCompany ? `Empresa ${['Soluciones', 'Transporte', 'Logística', 'Comercial', 'Sistemas'][Math.floor(Math.random() * 5)]} S.A.S` : `${['Juan', 'Maria', 'Pedro', 'Diana', 'Carlos'][Math.floor(Math.random() * 5)]} ${['Perez', 'Gomez', 'Rodriguez', 'Lopez'][Math.floor(Math.random() * 4)]}`;

        return {
            id: i.toString(),
            identificacion: id,
            nombre: name,
            numObligacion: `F00${Math.floor(1 + Math.random() * 900)}`,
            estadoProceso: Math.random() > 0.5 ? 'En mora activa' : 'Apertura',
            fechaInicio: `${year}-${month.toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`
        };
    })).current;

    // Filtrado lógico
    const procesosFiltrados = mockProcesos.filter(p => {
        return p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
            p.identificacion.includes(filtroIdentificacion) &&
            p.numObligacion.toLowerCase().includes(filtroObligacion.toLowerCase()) &&
            (filtroEstado === '' || p.estadoProceso === filtroEstado) &&
            p.fechaInicio.includes(filtroFecha);
    });

    // Paginación lógica
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const registrosActuales = procesosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);
    const totalPaginas = Math.ceil(procesosFiltrados.length / registrosPorPagina) || 1;

    const onVerObligaciones = (proceso) => {
        setDeudorActual(proceso);
        setFacturasSeleccionadas([]);
        setMandamientoGenerado(false);
    };

    const onUploadExcel = () => {
        alert("Apertura del modal para carga masiva de archivos .xlsx / .csv (Asignar Órdenes)");
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title">Apertura del Proceso Coactivo</h1>
            </div>

            <p className="page-subtitle">
                Identifique al contribuyente, seleccione las obligaciones en mora y genere el Mandamiento de Pago.
            </p>

            {!deudorActual ? (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Listado de Procesos Susceptibles de Cobro
                    </h3>

                    {/* Filtros UI */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nombre del Deudor / Razón Social</label>
                            <input type="text" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Buscar..." value={filtroNombre} onChange={e => { setFiltroNombre(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Número de Identificación</label>
                            <input type="text" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Buscar..." value={filtroIdentificacion} onChange={e => { setFiltroIdentificacion(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Número Obligación</label>
                            <input type="text" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Buscar..." value={filtroObligacion} onChange={e => { setFiltroObligacion(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Estado del Proceso</label>
                            <select className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPaginaActual(1); }}>
                                <option value="">Todos</option>
                                <option value="Apertura">Apertura</option>
                                <option value="En mora activa">En mora activa</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Fecha de Inicio</label>
                            <input type="date" className="p-2" style={{ border: '1px solid #ccc', borderRadius: '4px' }} value={filtroFecha} onChange={e => { setFiltroFecha(e.target.value); setPaginaActual(1); }} />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fafafa', borderRadius: 'var(--radius-sm)' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                                    <th style={{ padding: '1rem' }}>Nombre del Deudor / Razón Social</th>
                                    <th style={{ padding: '1rem' }}>Número de Identificación</th>
                                    <th style={{ padding: '1rem' }}>Número Obligación</th>
                                    <th style={{ padding: '1rem' }}>Estado del Proceso</th>
                                    <th style={{ padding: '1rem' }}>Fecha de Inicio</th>
                                    <th style={{ padding: '1rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosActuales.map((proceso, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{proceso.nombre}</td>
                                        <td style={{ padding: '1rem' }}>{proceso.identificacion}</td>
                                        <td style={{ padding: '1rem' }}>{proceso.numObligacion}</td>
                                        <td style={{ padding: '1rem', color: proceso.estadoProceso === 'En mora activa' ? '#d32f2f' : '#f59e0b', fontWeight: '600' }}>
                                            {proceso.estadoProceso}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{proceso.fechaInicio}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => onVerObligaciones(proceso)}
                                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                Ver Obligaciones en Mora
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación UI */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            className="btn btn-outline"
                            disabled={paginaActual === 1}
                            onClick={() => setPaginaActual(paginaActual - 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Ant.
                        </button>
                        <span style={{ fontWeight: '500', color: 'var(--color-text-light)' }}>Página {paginaActual} de {totalPaginas}</span>
                        <button
                            className="btn btn-outline"
                            disabled={paginaActual === totalPaginas}
                            onClick={() => setPaginaActual(paginaActual + 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Sig.
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem', borderBottom: '1px solid #c7d2fe', paddingBottom: '0.5rem' }}>
                            Información del Deudor y Estado del Proceso
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Identificación</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{deudorActual.identificacion}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nombre/Razón Social</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{deudorActual.nombre}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Estado del Proceso</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold', color: deudorActual.estadoProceso === 'En Embargo' ? 'crimson' : '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: deudorActual.estadoProceso === 'En Embargo' ? 'crimson' : '#059669', display: 'inline-block' }}></span>
                                    {deudorActual.estadoProceso}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#4f46e5', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fecha Inicio</p>
                                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 'bold' }}>{deudorActual.fechaInicio}</p>
                            </div>
                        </div>
                    </div>

                    <FacturasList
                        facturas={mockFacturas}
                        seleccionadas={facturasSeleccionadas}
                        onSelect={handleSelectFactura}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '2rem' }}>
                        <button className="btn btn-outline" onClick={() => setDeudorActual(null)} style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderColor: '#4b5563', color: '#4b5563' }}>
                            Volver al Listado
                        </button>
                        <button className="btn" onClick={procesarMandamiento} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                            Generar Borrador Mandamiento
                        </button>
                    </div>
                </>
            )}

            {deudorActual && (
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', zIndex: -1 }}>
                    <MandamientoPDFContent
                        ref={pdfRef}
                        deudor={deudorActual}
                        facturas={mockFacturas.filter(f => facturasSeleccionadas.includes(f.id))}
                        resolucionNum={`RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`}
                        totalDeuda={mockFacturas.filter(f => facturasSeleccionadas.includes(f.id)).reduce((a, b) => a + b.valor, 0)}
                        fechaFormat={`${new Date().getDate()} de ${new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date())} de ${new Date().getFullYear()}`}
                    />
                </div>
            )}

            {mandamientoGenerado && deudorActual && (
                <div className="card" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-primary)' }}>¡Mandamiento de Pago Generado Exitosamente!</h3>
                    <p>El documento ha sido descargado en su dispositivo (PDF).</p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-outline" style={{ color: '#d32f2f', borderColor: '#d32f2f' }} onClick={onRechazar}>Rechazar Acto</button>
                        <button className="btn" onClick={onAprobar}>Aprobar (Notificar Multicanal)</button>
                    </div>
                </div>
            )}

            {/* Ocultamiento de módulos inactivos */}
            {false && (
                <div className="card">
                    <h3>Historial de Procesos Previos</h3>
                    <p>Módulo en construcción...</p>
                </div>
            )}
        </div>
    );
};

export default AperturaView;
