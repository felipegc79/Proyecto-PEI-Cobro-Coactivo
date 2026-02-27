import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import AperturaView from './components/Coactivo/AperturaView';
import EmbargoView from './components/Coactivo/EmbargoView';
import DefensaView from './components/Coactivo/DefensaView';
import EjecucionView from './components/Coactivo/EjecucionView';
import CierreView from './components/Coactivo/CierreView';
import DashboardView from './components/Coactivo/DashboardView';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<DashboardView />} />
                    <Route path="apertura" element={<AperturaView />} />
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
