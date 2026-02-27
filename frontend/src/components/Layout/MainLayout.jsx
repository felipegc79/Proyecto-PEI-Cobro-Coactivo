import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AsignarProcesoDropdown from '../Shared/AsignarProcesoDropdown';
import logo from '../../logo-ada.png';

const MainLayout = () => {
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
                        <span style={{ fontSize: '0.9rem' }}>Usuario:<br /><strong>admin_coactivo</strong></span>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            AC
                        </div>
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
