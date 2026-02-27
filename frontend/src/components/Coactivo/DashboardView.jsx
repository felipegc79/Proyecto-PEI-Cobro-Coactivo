import React, { useState } from 'react';

const DashboardView = () => {
    const [filtroMes, setFiltroMes] = useState('Todos');
    const [filtroAno, setFiltroAno] = useState('2026');

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
                { label: 'Total Procesos', value: Math.floor(342 * multiplier), bg: '#eef2ff', color: '#4f46e5' },
                { label: 'Procesos Abiertos', value: Math.floor(156 * multiplier), bg: '#f0fdf4', color: '#16a34a' },
                { label: 'En Reclamación', value: Math.floor(45 * multiplier), bg: '#fffbeb', color: '#d97706' },
                { label: 'Procesos Cerrados', value: Math.floor(141 * multiplier), bg: '#f3f4f6', color: '#4b5563' }
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

    return (
        <div>
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
                    <div key={idx} className="card" style={{ backgroundColor: kpi.bg, padding: '1.5rem', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: kpi.color, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            {kpi.label}
                        </span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: kpi.color }}>
                            {kpi.value}
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
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{data.conteo}</div>
                                    <div style={{
                                        width: '60%',
                                        height: `${heightPercentage}%`,
                                        background: `linear-gradient(to right, ${data.color}bb 0%, ${data.color} 50%, ${data.color}bb 100%)`,
                                        position: 'relative',
                                        boxShadow: 'inset -2px -5px 10px rgba(0,0,0,0.15), 5px 5px 10px rgba(0,0,0,0.1)',
                                        transition: 'height 0.3s ease',
                                        borderBottomLeftRadius: '5px',
                                        borderBottomRightRadius: '5px'
                                    }}>
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
                        <div style={{ padding: '1rem', borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb', borderRadius: '4px' }}>
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>45 procesos próximos a prescripción</p>
                            <span style={{ fontSize: '0.8rem', color: '#d97706' }}>Hace 2 horas</span>
                        </div>
                        <div style={{ padding: '1rem', borderLeft: '4px solid #10b981', backgroundColor: '#ecfdf5', borderRadius: '4px' }}>
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '0.9rem' }}>8 acuerdos de pago liquidados hoy</p>
                            <span style={{ fontSize: '0.8rem', color: '#059669' }}>Hace 5 horas</span>
                        </div>
                        <div style={{ padding: '1rem', borderLeft: '4px solid #6366f1', backgroundColor: '#eef2ff', borderRadius: '4px' }}>
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
