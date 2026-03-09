import React, { useState } from 'react';

const DashboardView = () => {
    const [filtroMes, setFiltroMes] = useState('Todos');
    const [filtroAno, setFiltroAno] = useState('2026');
    const [modalData, setModalData] = useState(null);

    // Dynamic data based on filters
    const getMockData = (ano, mes) => {
        let multiplier = 1;
        if (ano === '2025') multiplier *= 0.8;
        if (ano === '2024') multiplier *= 0.5;

        if (mes !== 'Todos') {
            // Cada mes debe representar una fracción realista del total anual (aprox 8% - 14%)
            const monthMap = {
                Enero: 0.11, Febrero: 0.09, Marzo: 0.13, Abril: 0.10,
                Mayo: 0.085, Junio: 0.12, Julio: 0.095, Agosto: 0.105,
                Septiembre: 0.115, Octubre: 0.08, Noviembre: 0.125, Diciembre: 0.14
            };
            multiplier *= (monthMap[mes] || 1);
        }

        return {
            kpis: [
                { label: 'Total Procesos', value: Math.floor(342 * multiplier), dinero: `$ ${(Math.floor(342 * multiplier) * 4500000).toLocaleString('de-DE')}`, bg: '#eef2ff', color: '#4f46e5' },
                { label: 'Procesos Abiertos', value: Math.floor(156 * multiplier), dinero: `$ ${(Math.floor(156 * multiplier) * 4500000).toLocaleString('de-DE')}`, bg: '#f0fdf4', color: '#16a34a' },
                { label: 'En Reclamación', value: Math.floor(45 * multiplier), dinero: `$ ${(Math.floor(45 * multiplier) * 4500000).toLocaleString('de-DE')}`, bg: '#fffbeb', color: '#d97706' },
                { label: 'Procesos Cerrados', value: Math.floor(141 * multiplier), dinero: `$ ${(Math.floor(141 * multiplier) * 4500000).toLocaleString('de-DE')}`, bg: '#f3f4f6', color: '#4b5563' }
            ],
            chartData: [
                { estado: 'Apertura', conteo: Math.floor(80 * multiplier), color: '#6366f1' },
                { estado: 'Embargo', conteo: Math.floor(45 * multiplier), color: '#ec4899' },
                { estado: 'Defensa', conteo: Math.floor(31 * multiplier), color: '#f59e0b' },
                { estado: 'Ejecución', conteo: Math.floor(186 * multiplier), color: '#10b981' }
            ]
        };
    };

    const currentData = getMockData(filtroAno, filtroMes);
    const kpis = currentData.kpis;
    const chartData = currentData.chartData;
    const maxValue = Math.max(...chartData.map(d => d.conteo), 1);

    const generateTableData = (title, count) => {
        const data = [];
        const nombres = ['Juan Pérez', 'María Gómez', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Laura García', 'Marta Sánchez', 'Jorge Díaz'];
        for (let i = 0; i < count; i++) {
            let estadoAleatorio;
            if (title === 'Total Procesos') {
                const estados = ['Abierto', 'En reclamación', 'Cerrado'];
                estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];
            } else {
                estadoAleatorio = title.includes('Notificaci') || title.includes('procesos') || title.includes('Acuerdos') ? 'Reportado' : title.replace('Estado: ', '');
            }

            data.push({
                id: `PRC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                deudor: nombres[Math.floor(Math.random() * nombres.length)],
                estado: estadoAleatorio,
                fecha: `2026-0${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 28) + 1}`,
                valor: `$ ${Math.floor(Math.random() * 5000000 + 500000).toLocaleString('de-DE')}`
            });
        }
        return data;
    };

    const handleItemClick = (title, count) => {
        const dataRows = generateTableData(title, Math.min(count, 100)); // Límite de 100 para no sobrecargar el navegador
        setModalData({ title, count, rows: dataRows });
    };

    const closeModal = () => setModalData(null);

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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Año</label>
                        <select
                            className="p-2"
                            style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'white' }}
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
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
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {kpis.map((kpi, idx) => (
                    <div
                        key={idx}
                        className="card"
                        onClick={() => handleItemClick(kpi.label, kpi.value)}
                        style={{
                            backgroundColor: kpi.bg, padding: '1.5rem', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
                            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                    >
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: kpi.color, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            {kpi.label}
                        </span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: kpi.color, lineHeight: '1.2' }}>
                            {kpi.value}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: kpi.color, opacity: 0.85 }}>
                            {kpi.dinero}
                        </span>
                    </div>
                ))}
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
                                        onClick={() => handleItemClick(`Estado: ${data.estado}`, data.conteo)}
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
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Notificaciones Recientes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div
                            onClick={() => handleItemClick('Procesos próximos a prescripción', 45)}
                            style={{ padding: '1rem', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fffbeb'}
                        >
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>45 procesos próximos a prescripción</p>
                            <span style={{ fontSize: '0.8rem', color: '#d97706' }}>Hace 2 horas</span>
                        </div>
                        <div
                            onClick={() => handleItemClick('Acuerdos de pago liquidados hoy', 8)}
                            style={{ padding: '1rem', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                        >
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>8 acuerdos de pago liquidados hoy</p>
                            <span style={{ fontSize: '0.8rem', color: '#059669' }}>Hace 5 horas</span>
                        </div>
                        <div
                            onClick={() => handleItemClick('Nueva sincronización de cartera completada', 1)}
                            style={{ padding: '1rem', borderLeft: '4px solid #6366f1', backgroundColor: '#eef2ff', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eef2ff'}
                        >
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>Nueva sincronización de cartera completada</p>
                            <span style={{ fontSize: '0.8rem', color: '#4f46e5' }}>Ayer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;

