import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import AperturaView from './components/Coactivo/AperturaView';
import EmbargoView from './components/Coactivo/EmbargoView';
import DefensaView from './components/Coactivo/DefensaView';
import EjecucionView from './components/Coactivo/EjecucionView';
import CierreView from './components/Coactivo/CierreView';
import DashboardView from './components/Coactivo/DashboardView';
import SeguimientoView from './components/Coactivo/SeguimientoView';
import CargaMasivaView from './components/Coactivo/CargaMasivaView';
import LoginView from './components/Auth/LoginView';
import './index.css';

const STORAGE_KEY = 'coactivo_procesos_v4';

function generarProcesosIniciales() {
    return Array.from({ length: 50 }).map((_, i) => {
        const year = 2019 + Math.floor(Math.random() * 7);
        let month = Math.floor(Math.random() * 12) + 1;
        if (year === 2026) month = Math.floor(Math.random() * 2) + 1;
        const isCompany = Math.random() > 0.6;
        const id = isCompany ? `900${Math.floor(100000 + Math.random() * 900000)}` : `${Math.floor(10000000 + Math.random() * 90000000)}`;
        const name = isCompany ? `Empresa ${['Soluciones', 'Transporte', 'Logística', 'Comercial', 'Sistemas'][Math.floor(Math.random() * 5)]} S.A.S` : `${['Juan', 'Maria', 'Pedro', 'Diana', 'Carlos'][Math.floor(Math.random() * 5)]} ${['Perez', 'Gomez', 'Rodriguez', 'Lopez'][Math.floor(Math.random() * 4)]}`;

        const valor = Math.floor(Math.random() * 3000000) + 1000;
        let cuantia = 'Pequeña';
        if (valor > 50000 && valor <= 2000000) cuantia = 'Media';
        if (valor > 2000000) cuantia = 'Grande';

        const today = new Date();
        const dateInicio = new Date(year, month - 1, 1);
        const diffTime = Math.abs(today - dateInicio);
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        let prescripcion = 'Vigente';
        if (diffYears > 4.5 && diffYears <= 5) prescripcion = 'Por Prescribir';
        if (diffYears > 5) prescripcion = 'Prescrita';

        const estadosDisponibles = [
            'APERTURADO',
            'EN NOTIFICACION',
            'EN EJECUCION',
            'EN MORA',
            'EN LEVANTAMIENTO DE EMBARGO',
            'CERRADO'
        ];

        const abogadosDisponibles = ["Carlos Rodríguez", "Ana Martínez", "Luis Fernández", "María Gómez"];

        return {
            id: i.toString(),
            identificacion: id,
            nombre: name,
            numObligacion: `F00${Math.floor(1 + Math.random() * 900)}`,
            consecutivo: `CC-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
            estadoProceso: estadosDisponibles[Math.floor(Math.random() * estadosDisponibles.length)],
            estado: estadosDisponibles[Math.floor(Math.random() * estadosDisponibles.length)], // Para retrocompatibilidad
            fechaInicio: `${year}-${month.toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
            valor: valor,
            cuantia: cuantia,
            prescripcion: prescripcion,
            funcionarioAsignado: abogadosDisponibles[Math.floor(Math.random() * abogadosDisponibles.length)],
            pdfUrl: null,
            notificaciones: {
                telefonica: [],
                personal: [],
                electronico: []
            }
        };
    });
}

function cargarProcesos() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Error al cargar procesos desde localStorage:', e);
    }
    // Si no hay datos guardados o hubo error, generar nuevos y guardar
    const nuevos = generarProcesosIniciales();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
    return nuevos;
}

function App() {
    const [auth, setAuth] = useState({ isAuthenticated: false, role: null, username: null });
    const [procesosCoactivos, setProcesosCoactivos] = useState(cargarProcesos);

    // Persistir procesos en localStorage cada vez que cambien
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(procesosCoactivos));
    }, [procesosCoactivos]);

    const addProcessToSeguimiento = (newProcess) => {
        setProcesosCoactivos(prev => [newProcess, ...prev]);
    };

    const updateProcessInSeguimiento = (updatedProcess) => {
        setProcesosCoactivos(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p));
    };

    const handleLogin = (role, username) => {
        setAuth({ isAuthenticated: true, role, username });
    };

    const handleLogout = () => {
        setAuth({ isAuthenticated: false, role: null, username: null });
    };

    const handleResetDatabase = () => {
        const confirmReset = window.confirm("¿Estás seguro de que deseas resetear la base de datos? Se perderán todos los datos cargados y se generarán los 50 procesos iniciales.");
        if (confirmReset) {
            const nuevos = generarProcesosIniciales();
            setProcesosCoactivos(nuevos);
            alert("Base de datos reseteada con éxito. Ahora hay 50 procesos iniciales.");
        }
    };

    if (!auth.isAuthenticated) {
        return <LoginView onLogin={handleLogin} />;
    }

    const procesosFiltrados = auth.role === 'Abogado' 
        ? procesosCoactivos.filter(p => p.funcionarioAsignado === auth.username)
        : procesosCoactivos;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout username={auth.username} role={auth.role} onLogout={handleLogout} />}>
                    <Route index element={<DashboardView procesosExternos={procesosFiltrados} />} />
                    <Route path="apertura" element={<AperturaView procesosExternos={procesosFiltrados} setProcesosExternos={setProcesosCoactivos} onAddProcess={addProcessToSeguimiento} userName={auth.username} />} />
                    <Route path="seguimiento" element={
                        <SeguimientoView 
                            procesosExternos={procesosFiltrados} 
                            setProcesosExternos={updateProcessInSeguimiento} 
                            userRole={auth.role}
                            userName={auth.username}
                        />
                    } />
                    <Route path="embargo" element={<EmbargoView procesosExternos={procesosFiltrados} userName={auth.username} />} />
                    <Route path="defensa" element={<DefensaView procesosExternos={procesosFiltrados} userName={auth.username} />} />
                    <Route path="ejecucion" element={<EjecucionView procesosExternos={procesosFiltrados} userRole={auth.role} userName={auth.username} />} />
                    <Route path="cierre" element={<CierreView procesosExternos={procesosFiltrados} userName={auth.username} />} />
                    <Route path="carga-masiva" element={<CargaMasivaView procesosExternos={procesosCoactivos} setProcesosExternos={setProcesosCoactivos} onResetDatabase={handleResetDatabase} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
