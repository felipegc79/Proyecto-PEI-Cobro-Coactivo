import React from 'react';
import { NavLink } from 'react-router-dom';
const navItems = [
    { path: '/', label: 'Resumen General' },
    { path: '/apertura', label: 'Apertura del Proceso' },
    { path: '/embargo', label: 'Embargo y Medidas' },
    { path: '/defensa', label: 'Defensa del Deudor' },
    { path: '/ejecucion', label: 'Ejecución' },
    { path: '/cierre', label: 'Cierre del Proceso' },
];

const Sidebar = () => {
    return (
        <aside style={{
            width: '260px',
            backgroundColor: 'var(--color-sidebar)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ padding: '2rem 0' }}>
                <h3 style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.85rem',
                    padding: '0 1.5rem',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Cobro Coactivo
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {navItems.map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
