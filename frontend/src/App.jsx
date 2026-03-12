import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import AperturaView from './components/Coactivo/AperturaView';
import EmbargoView from './components/Coactivo/EmbargoView';
import DefensaView from './components/Coactivo/DefensaView';
import EjecucionView from './components/Coactivo/EjecucionView';
import CierreView from './components/Coactivo/CierreView';
import DashboardView from './components/Coactivo/DashboardView';
import SeguimientoView from './components/Coactivo/SeguimientoView';
import './index.css';

function App() {
    const [procesosCoactivos, setProcesosCoactivos] = useState([
        {
            id: '1',
            nombre: 'Juan Pérez',
            identificacion: '12345678',
            consecutivo: 'CC-2024-001',
            estado: 'Aceptado',
            pdfUrl: null,
            areaResponsable: 'Jurídica',
            funcionarioAsignado: 'Carlos Rodríguez',
            notificaciones: {
                telefonica: [
                    { id: Date.now() + 1, fecha: '2024-03-10', hora: '10:00 AM', observacion: 'No contestó', adjuntos: [] }
                ],
                personal: [],
                electronico: []
            }
        },
        {
            id: '2',
            nombre: 'Empresa SOL S.A.S',
            identificacion: '900123456',
            consecutivo: 'CC-2024-002',
            estado: 'Aceptado',
            pdfUrl: null,
            areaResponsable: 'Recaudos',
            funcionarioAsignado: 'Ana Martínez',
            notificaciones: {
                telefonica: [],
                personal: [],
                electronico: []
            }
        }
    ]);

    const addProcessToSeguimiento = (newProcess) => {
        setProcesosCoactivos(prev => [newProcess, ...prev]);
    };

    const updateProcessInSeguimiento = (updatedProcess) => {
        setProcesosCoactivos(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p));
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<DashboardView />} />
                    <Route path="apertura" element={<AperturaView onAddProcess={addProcessToSeguimiento} />} />
                    <Route path="seguimiento" element={
                        <SeguimientoView 
                            procesosExternos={procesosCoactivos} 
                            setProcesosExternos={updateProcessInSeguimiento} 
                        />
                    } />
                    <Route path="embargo" element={<EmbargoView />} />
                    <Route path="defensa" element={<DefensaView />} />
                    <Route path="ejecucion" element={<EjecucionView />} />
                    <Route path="cierre" element={<CierreView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
