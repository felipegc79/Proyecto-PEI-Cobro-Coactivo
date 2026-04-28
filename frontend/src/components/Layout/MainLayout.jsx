import React from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import AsignarProcesoDropdown from '../Shared/AsignarProcesoDropdown';
import logo from '../../logo-ada.png';

const MainLayout = ({ username, role, onLogout }) => {
    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <header className="app-header" style={{
                backgroundColor: 'var(--color-sidebar)',
                minHeight: '110px',
                padding: '0 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 10
            }}>
                <div className="branding" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={logo} alt="ADA" style={{ height: '100px', objectFit: 'contain' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Header Actions */}
                    <AsignarProcesoDropdown />
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', textAlign: 'right' }}>
                            Usuario: <strong>{username}</strong><br />
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{role}</span>
                        </span>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {username ? username.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <button 
                            onClick={onLogout}
                            style={{ 
                                background: 'none', 
                                border: '1px solid rgba(255,255,255,0.3)', 
                                color: 'white', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginLeft: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                gap: '0.5rem',
                                transition: 'background-color 0.2s',
                                fontSize: '0.85rem'
                            }}
                            title="Cerrar Sesión"
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <LogOut size={16} />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="app-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <Sidebar />
                <main className="main-content" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
