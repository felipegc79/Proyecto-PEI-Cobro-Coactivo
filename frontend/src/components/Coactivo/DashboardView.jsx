import React, { useState, useEffect } from 'react';

const DashboardView = ({ procesosExternos = [] }) => {
    const [filtroMes, setFiltroMes] = useState('Todos');
    const [filtroAno, setFiltroAno] = useState('Todos'); // El mock de App usa años dinámicos
    const [modalData, setModalData] = useState(null);

    // Filtrar los procesos por el año y mes seleccionado (simulado para este dashboard si se desea, o usar todos si es "Todos")
    const procesosFiltrados = procesosExternos.filter(p => {
        const pYear = p.fechaInicio.substring(0, 4);
        const pMonth = parseInt(p.fechaInicio.substring(5, 7), 10);
        
        if (filtroAno !== 'Todos' && pYear !== filtroAno) return false;
        
        if (filtroMes !== 'Todos') {
            const monthMap = {
                Enero: 1, Febrero: 2, Marzo: 3, Abril: 4, Mayo: 5, Junio: 6,
                Julio: 7, Agosto: 8, Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12
            };
            if (pMonth !== monthMap[filtroMes]) return false;
        }
        return true;
    });

    const sumValores = (procesos) => procesos.reduce((acc, p) => acc + p.valor, 0);

    const procesosActivos = procesosFiltrados.filter(p => ['APERTURADO', 'EN NOTIFICACION', 'EN EJECUCION', 'EN MORA'].includes(p.estadoProceso));
    const procesosLevantamiento = procesosFiltrados.filter(p => p.estadoProceso === 'EN LEVANTAMIENTO DE EMBARGO');
    const procesosCerrados = procesosFiltrados.filter(p => p.estadoProceso === 'CERRADO');
    const procesosEnMora = procesosFiltrados.filter(p => p.estadoProceso === 'EN MORA');
    const procesosDefensa = procesosFiltrados.filter(p => p.estadoProceso === 'EN DEFENSA DEL CONTRIBUYENTE');

    // Próximos a prescripción: deudas entre 4.5 y 5 años
    const today = new Date();
    const procesosProxPrescripcion = procesosFiltrados.filter(p => {
        if (!p.fechaInicio) return false;
        const diffTime = Math.abs(today - new Date(p.fechaInicio));
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        return diffYears > 4.5 && diffYears <= 5;
    });

    // Catalogación automática de cuantía
    const calcCuantia = (valor) => {
        if (valor < 50000) return 'Pequeña';
        if (valor <= 2000000) return 'Mediana';
        return 'Grande';
    };

    const currentData = {
        kpis: [
            { label: 'Total Procesos', value: procesosFiltrados.length, dinero: `$ ${sumValores(procesosFiltrados).toLocaleString('es-CO')}`, bg: '#eef2ff', color: '#4f46e5', icon: '📋', rawLabel: null },
            { label: 'Aperturado', value: procesosFiltrados.filter(p => p.estadoProceso === 'APERTURADO').length, dinero: `$ ${sumValores(procesosFiltrados.filter(p => p.estadoProceso === 'APERTURADO')).toLocaleString('es-CO')}`, bg: '#eff6ff', color: '#3b82f6', icon: '📂', rawLabel: 'APERTURADO' },
            { label: 'En Notificación', value: procesosFiltrados.filter(p => p.estadoProceso === 'EN NOTIFICACION').length, dinero: `$ ${sumValores(procesosFiltrados.filter(p => p.estadoProceso === 'EN NOTIFICACION')).toLocaleString('es-CO')}`, bg: '#fffbeb', color: '#d97706', icon: '📨', rawLabel: 'EN NOTIFICACION' },
            { label: 'En Ejecución', value: procesosFiltrados.filter(p => p.estadoProceso === 'EN EJECUCION').length, dinero: `$ ${sumValores(procesosFiltrados.filter(p => p.estadoProceso === 'EN EJECUCION')).toLocaleString('es-CO')}`, bg: '#f5f3ff', color: '#8b5cf6', icon: '⚙️', rawLabel: 'EN EJECUCION' },
            { label: 'En Mora', value: procesosEnMora.length, dinero: `$ ${sumValores(procesosEnMora).toLocaleString('es-CO')}`, bg: '#fff1f2', color: '#be123c', icon: '🔴', rawLabel: 'EN MORA' },
            { label: 'En Defensa Contribuyente', value: procesosDefensa.length, dinero: `$ ${sumValores(procesosDefensa).toLocaleString('es-CO')}`, bg: '#f5f3ff', color: '#7c3aed', icon: '🛡️', rawLabel: 'EN DEFENSA DEL CONTRIBUYENTE' },
            { label: 'Levantamiento Embargo', value: procesosLevantamiento.length, dinero: `$ ${sumValores(procesosLevantamiento).toLocaleString('es-CO')}`, bg: '#ecfeff', color: '#06b6d4', icon: '⚖️', rawLabel: 'EN LEVANTAMIENTO DE EMBARGO' },
            { label: 'Pendiente Cierre', value: procesosFiltrados.filter(p => p.estadoProceso === 'PENDIENTE CIERRE').length, dinero: `$ ${sumValores(procesosFiltrados.filter(p => p.estadoProceso === 'PENDIENTE CIERRE')).toLocaleString('es-CO')}`, bg: '#fefce8', color: '#a16207', icon: '⏳', rawLabel: 'PENDIENTE CIERRE' },
            { label: 'Cerrado', value: procesosCerrados.length, dinero: `$ ${sumValores(procesosCerrados).toLocaleString('es-CO')}`, bg: '#ecfdf5', color: '#10b981', icon: '✅', rawLabel: 'CERRADO' },
        ],
        kpisExtra: [
            { label: 'Próximos a Prescribir', value: procesosProxPrescripcion.length, dinero: `$ ${sumValores(procesosProxPrescripcion).toLocaleString('es-CO')}`, bg: '#fefce8', color: '#a16207', icon: '⏳', rawLabel: '_PRESCRIPCION' },
        ],
        sincronizacion: [
            { label: 'Cartera Grande (>$2M)', count: procesosFiltrados.filter(p => calcCuantia(p.valor) === 'Grande').length, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Cartera Mediana ($50k-$2M)', count: procesosFiltrados.filter(p => calcCuantia(p.valor) === 'Mediana').length, color: '#d97706', bg: '#fffbeb' },
            { label: 'Cartera Pequeña (<$50k)', count: procesosFiltrados.filter(p => calcCuantia(p.valor) === 'Pequeña').length, color: '#059669', bg: '#ecfdf5' },
        ],
        chartData: [
            { estado: 'Aperturado', rawEstado: 'APERTURADO', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'APERTURADO').length, color: '#3b82f6' },
            { estado: 'En Notificac.', rawEstado: 'EN NOTIFICACION', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'EN NOTIFICACION').length, color: '#f59e0b' },
            { estado: 'En Ejecución', rawEstado: 'EN EJECUCION', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'EN EJECUCION').length, color: '#8b5cf6' },
            { estado: 'En Mora', rawEstado: 'EN MORA', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'EN MORA').length, color: '#ef4444' },
            { estado: 'En Defensa', rawEstado: 'EN DEFENSA DEL CONTRIBUYENTE', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'EN DEFENSA DEL CONTRIBUYENTE').length, color: '#7c3aed' },
            { estado: 'Levantamiento', rawEstado: 'EN LEVANTAMIENTO DE EMBARGO', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'EN LEVANTAMIENTO DE EMBARGO').length, color: '#06b6d4' },
            { estado: 'Cerrado', rawEstado: 'CERRADO', conteo: procesosFiltrados.filter(p => p.estadoProceso === 'CERRADO').length, color: '#10b981' }
        ]
    };

    const kpis = currentData.kpis;
    const kpisExtra = currentData.kpisExtra;
    const sincronizacion = currentData.sincronizacion;
    const chartData = currentData.chartData;
    const maxValue = Math.max(...chartData.map(d => d.conteo), 1);

    const generateTableData = (title, count, rawEstado) => {
        // En lugar de generar al azar, usamos los datos reales si corresponden al título
        let datosAUsar = procesosFiltrados;
        
        if (title.includes('Total')) datosAUsar = procesosFiltrados;
        else if (title.includes('Activos')) datosAUsar = procesosActivos;
        else if (title.includes('Levantamiento')) datosAUsar = procesosLevantamiento;
        else if (title.includes('Cerrados')) datosAUsar = procesosCerrados;
        else if (title.includes('Estado:')) {
            if (rawEstado) {
                datosAUsar = procesosFiltrados.filter(p => p.estadoProceso === rawEstado);
            } else {
                let estadoName = title.replace('Estado: ', '').toUpperCase();
                estadoName = estadoName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "");
                datosAUsar = procesosFiltrados.filter(p => p.estadoProceso.includes(estadoName));
            }
        } else {
            // Notificaciones Recientes (mock)
            datosAUsar = [];
        }

        return datosAUsar.map(p => ({
            id: p.consecutivo,
            deudor: p.nombre,
            estado: p.estadoProceso,
            fecha: p.fechaInicio,
            valor: `$ ${p.valor.toLocaleString('es-CO')}`
        }));
    };

    const handleItemClick = (title, count, rawEstado = null) => {
        const dataRows = generateTableData(title, Math.min(count, 100), rawEstado); // Límite de 100 para no sobrecargar el navegador
        setModalData({ title, count, rows: dataRows });
    };

    const closeModal = () => setModalData(null);

    const exportToCSV = () => {
        const headers = ["Nombre", "Identificacion", "Obligacion", "Estado", "Fecha Inicio", "Valor", "Cuantia", "Prescripcion"];
        const rows = procesosFiltrados.map(p => [
            `"${p.nombre}"`, 
            p.identificacion, 
            p.numObligacion, 
            p.estadoProceso, 
            p.fechaInicio, 
            `"${p.valor.toLocaleString('es-CO')}"`, 
            p.cuantia, 
            p.prescripcion
        ]);
        
        const BOM = "\uFEFF";
        let csvContent = BOM + headers.join(";") + "\n" 
            + rows.map(e => e.join(";")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "resumen_general.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [filtroMasaRazonSocial, setFiltroMasaRazonSocial] = useState('');
    const [filtroMasaCedula, setFiltroMasaCedula] = useState('');
    const [filtroMasaEstado, setFiltroMasaEstado] = useState('');

    const procesosTablaFiltrados = procesosFiltrados.filter(p => {
        const matchRazon = p.nombre.toLowerCase().includes(filtroMasaRazonSocial.toLowerCase());
        const matchCedula = p.identificacion.toLowerCase().includes(filtroMasaCedula.toLowerCase());
        const matchEstado = filtroMasaEstado === '' || p.estadoProceso === filtroMasaEstado;
        return matchRazon && matchCedula && matchEstado;
    });

    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
    const registrosActuales = procesosTablaFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);
    const totalPaginas = Math.ceil(procesosTablaFiltrados.length / registrosPorPagina) || 1;

    useEffect(() => {
        setPaginaActual(1);
    }, [filtroMasaRazonSocial, filtroMasaCedula, filtroMasaEstado, procesosFiltrados]);

    return (
        <div style={{ position: 'relative' }}>
            {/* Modal */}
            {modalData && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            <h2 style={{ margin: 0, color: 'var(--color-primary, #0f766e)', fontSize: '1.25rem' }}>
                                Datos: {modalData.title} <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>({modalData.count} registros {modalData.count > 100 ? '- mostrando primeros 100' : ''})</span>
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999'
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '0.75rem', color: '#475569' }}>ID Proceso</th>
                                        <th style={{ padding: '0.75rem', color: '#475569' }}>Deudor</th>
                                        <th style={{ padding: '0.75rem', color: '#475569' }}>Estado / Concepto</th>
                                        <th style={{ padding: '0.75rem', color: '#475569' }}>Fecha</th>
                                        <th style={{ padding: '0.75rem', color: '#475569' }}>Valor Adeudado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalData.rows.length > 0 ? modalData.rows.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.75rem', color: '#334155' }}>{row.id}</td>
                                            <td style={{ padding: '0.75rem', color: '#334155', fontWeight: '500' }}>{row.deudor}</td>
                                            <td style={{ padding: '0.75rem', color: '#334155' }}>{row.estado}</td>
                                            <td style={{ padding: '0.75rem', color: '#334155' }}>{row.fecha}</td>
                                            <td style={{ padding: '0.75rem', color: '#334155' }}>{row.valor}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No hay datos para mostrar</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: '0.5rem 1.5rem', backgroundColor: 'var(--color-primary, #0f766e)',
                                    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Tablero de Control - Cobro Coactivo</h1>
                    <p className="page-subtitle">Monitoreo general del estado de los procesos y cartera.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Año</label>
                        <select
                            className="p-2"
                            style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'white' }}
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                        >
                            <option value="Todos">Todos los años</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                            <option value="2019">2019</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Mes</label>
                        <select
                            className="p-2"
                            style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'white' }}
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                        >
                            <option value="Todos">Todos los meses</option>
                            <option value="Enero">Enero</option>
                            <option value="Febrero">Febrero</option>
                            <option value="Marzo">Marzo</option>
                            <option value="Abril">Abril</option>
                            <option value="Mayo">Mayo</option>
                            <option value="Junio">Junio</option>
                            <option value="Julio">Julio</option>
                            <option value="Agosto">Agosto</option>
                            <option value="Septiembre">Septiembre</option>
                            <option value="Octubre">Octubre</option>
                            <option value="Noviembre">Noviembre</option>
                            <option value="Diciembre">Diciembre</option>
                        </select>
                    </div>
                    
                    <button className="btn" onClick={exportToCSV} style={{ backgroundColor: '#10b981', border: 'none', height: '40px', display: 'flex', alignItems: 'center' }}>
                        ⬇ Descargar CSV
                    </button>
                </div>
            </div>

            {/* KPI Total — encabezado */}
            <div
                className="card"
                onClick={() => handleItemClick(kpis[0].label, kpis[0].value)}
                style={{
                    backgroundColor: kpis[0].bg, padding: '1.2rem 2rem', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', marginBottom: '1rem'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            >
                <span style={{ fontSize: '2rem' }}>{kpis[0].icon}</span>
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: kpis[0].color, textTransform: 'uppercase' }}>{kpis[0].label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
                        <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: kpis[0].color }}>{kpis[0].value}</span>
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: kpis[0].color, opacity: 0.8 }}>{kpis[0].dinero}</span>
                    </div>
                </div>
            </div>

            {/* KPIs por Estado — los 8 estados */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                {kpis.slice(1).map((kpi, idx) => (
                    <div
                        key={idx}
                        className="card"
                        onClick={() => handleItemClick(`Estado: ${kpi.label}`, kpi.value, kpi.rawLabel)}
                        style={{
                            backgroundColor: kpi.bg, padding: '1rem', border: `1px solid ${kpi.color}22`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    >
                        <span style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{kpi.icon}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: kpi.color, textTransform: 'uppercase', marginBottom: '0.3rem', textAlign: 'center', lineHeight: '1.2' }}>
                            {kpi.label}
                        </span>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: kpi.color, lineHeight: '1.1' }}>
                            {kpi.value}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: kpi.color, opacity: 0.8 }}>
                            {kpi.dinero}
                        </span>
                    </div>
                ))}
            </div>

            {/* Indicador especial: Próximos a Prescribir + Sincronización de Cartera */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '2rem' }}>
                {/* Prescripción */}
                {kpisExtra.map((kpi, idx) => (
                    <div
                        key={idx}
                        className="card"
                        onClick={() => handleItemClick(kpi.label, kpi.value)}
                        style={{
                            backgroundColor: kpi.bg, padding: '1.2rem 1.5rem', border: `2px solid ${kpi.color}44`,
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    >
                        <span style={{ fontSize: '2rem' }}>{kpi.icon}</span>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: kpi.color, textTransform: 'uppercase' }}>{kpi.label}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: kpi.color, lineHeight: '1.2' }}>{kpi.value} procesos</div>
                            <div style={{ fontSize: '0.8rem', color: kpi.color, opacity: 0.8 }}>{kpi.dinero}</div>
                        </div>
                    </div>
                ))}

                {/* Sincronización de Cartera */}
                <div className="card" style={{ padding: '1.2rem 1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-primary)', fontSize: '0.95rem' }}>📊 Catalogación de Cartera</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {sincronizacion.map((s, idx) => (
                            <div key={idx} style={{ flex: 1, backgroundColor: s.bg, padding: '0.6rem 0.8rem', borderRadius: '8px', border: `1px solid ${s.color}44`, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: s.color }}>{s.count}</div>
                                <div style={{ fontSize: '0.7rem', color: '#4b5563', fontWeight: '600', marginTop: '0.1rem' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Gráfico de Barras CSS puro */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Procesos por Estado</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        {chartData.map((data, idx) => {
                            const heightPercentage = (data.conteo / maxValue) * 100;
                            return (
                                <div
                                    key={idx}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                                >
                                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{data.conteo}</div>
                                    <div
                                        onClick={() => handleItemClick(`Estado: ${data.estado}`, data.conteo, data.rawEstado)}
                                        style={{
                                            width: '60%',
                                            height: `${heightPercentage}%`,
                                            background: `linear-gradient(to right, ${data.color}bb 0%, ${data.color} 50%, ${data.color}bb 100%)`,
                                            position: 'relative',
                                            boxShadow: 'inset -2px -5px 10px rgba(0,0,0,0.15), 5px 5px 10px rgba(0,0,0,0.1)',
                                            transition: 'height 0.3s ease, filter 0.2s',
                                            borderBottomLeftRadius: '5px',
                                            borderBottomRightRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                        title={`Ver ${data.conteo} procesos de ${data.estado}`}
                                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px', /* Half of the height to perfectly sit on top */
                                            left: 0,
                                            width: '100%',
                                            height: '20px',
                                            backgroundColor: data.color,
                                            borderRadius: '50%', /* Makes it elliptical */
                                            boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.3)',
                                            zIndex: 2
                                        }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                        {chartData.map((data, idx) => (
                            <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', fontWeight: '500' }}>
                                {data.estado}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lista de alertas recientes */}
                <div className="card" style={{ maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Notificaciones Recientes (Últimos 50)</h3>
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {procesosExternos.slice(0, 50).map((p, idx) => (
                            <div
                                key={idx}
                                style={{ padding: '0.8rem', borderLeft: '4px solid #3b82f6', backgroundColor: '#f8fafc', borderRadius: '4px' }}
                            >
                                <p style={{ margin: 0, fontWeight: '500', fontSize: '0.85rem' }}>{p.consecutivo} - {p.nombre}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.estadoProceso}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.fechaInicio}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filtros para la Tabla General */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Buscar en el Listado General</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nombre / Razón Social</label>
                        <input 
                            type="text" 
                            className="p-2 mt-1" 
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="Buscar por nombre..."
                            value={filtroMasaRazonSocial}
                            onChange={(e) => setFiltroMasaRazonSocial(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Identificación</label>
                        <input 
                            type="text" 
                            className="p-2 mt-1" 
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                            placeholder="Buscar por identificación..."
                            value={filtroMasaCedula}
                            onChange={(e) => setFiltroMasaCedula(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Estado del Proceso</label>
                        <select 
                            className="p-2 mt-1" 
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                            value={filtroMasaEstado}
                            onChange={(e) => setFiltroMasaEstado(e.target.value)}
                        >
                            <option value="">Todos los Estados</option>
                            <option value="APERTURADO">APERTURADO</option>
                            <option value="EN NOTIFICACION">EN NOTIFICACION</option>
                            <option value="EN EJECUCION">EN EJECUCION</option>
                            <option value="EN DEFENSA DEL CONTRIBUYENTE">EN DEFENSA DEL CONTRIBUYENTE</option>
                            <option value="EN MORA">EN MORA</option>
                            <option value="EN LEVANTAMIENTO DE EMBARGO">EN LEVANTAMIENTO DE EMBARGO</option>
                            <option value="PENDIENTE CIERRE">PENDIENTE CIERRE</option>
                            <option value="CERRADO">CERRADO</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla General de Procesos */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Listado General de Procesos (Todos los estados)</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fafafa', borderRadius: 'var(--radius-sm)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                                <th style={{ padding: '1rem' }}>Nombre</th>
                                <th style={{ padding: '1rem' }}>Identificación</th>
                                <th style={{ padding: '1rem' }}>Obligación</th>
                                <th style={{ padding: '1rem' }}>Cuantía</th>
                                <th style={{ padding: '1rem' }}>Prescripción</th>
                                <th style={{ padding: '1rem' }}>Estado</th>
                                <th style={{ padding: '1rem' }}>Fecha Inicio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrosActuales.map((proceso, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{proceso.nombre}</td>
                                    <td style={{ padding: '1rem' }}>{proceso.identificacion}</td>
                                    <td style={{ padding: '1rem' }}>{proceso.numObligacion}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {(() => {
                                            const cuantiaCalc = proceso.valor < 50000 ? 'Pequeña' : proceso.valor <= 2000000 ? 'Mediana' : 'Grande';
                                            const bgC = cuantiaCalc === 'Grande' ? '#fee2e2' : cuantiaCalc === 'Mediana' ? '#fef3c7' : '#ecfdf5';
                                            const clrC = cuantiaCalc === 'Grande' ? '#991b1b' : cuantiaCalc === 'Mediana' ? '#92400e' : '#065f46';
                                            return <span style={{ backgroundColor: bgC, color: clrC, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{cuantiaCalc}</span>;
                                        })()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            backgroundColor: proceso.prescripcion === 'Prescrita' ? '#f3f4f6' : proceso.prescripcion === 'Por Prescribir' ? '#fee2e2' : '#ecfdf5',
                                            color: proceso.prescripcion === 'Prescrita' ? '#374151' : proceso.prescripcion === 'Por Prescribir' ? '#dc2626' : '#059669',
                                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>{proceso.prescripcion}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>
                                        <span style={{ 
                                            color: proceso.estadoProceso === 'APERTURADO' ? '#3b82f6' :
                                                    proceso.estadoProceso === 'EN NOTIFICACION' ? '#f59e0b' :
                                                    proceso.estadoProceso === 'EN EJECUCION' ? '#8b5cf6' :
                                                    proceso.estadoProceso === 'EN MORA' ? '#ef4444' :
                                                    proceso.estadoProceso === 'EN LEVANTAMIENTO DE EMBARGO' ? '#06b6d4' :
                                                    '#10b981'
                                        }}>
                                            {proceso.estadoProceso}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{proceso.fechaInicio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación UI */}
                {totalPaginas > 1 && (
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
                )}
            </div>
        </div>
    );
};

export default DashboardView;

