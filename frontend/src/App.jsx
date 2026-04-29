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

const STORAGE_KEY = 'coactivo_procesos_v5';

// ─── DATOS FIJOS (determinísticos) para los 50 procesos iniciales ───
const NOMBRES_FIJOS = [
    'Juan Perez','Maria Gomez','Pedro Rodriguez','Diana Lopez','Carlos Martinez',
    'Empresa Soluciones S.A.S','Ana Fernandez','Luis Garcia','Empresa Transporte S.A.S','Carmen Torres',
    'Jorge Ramirez','Empresa Logística S.A.S','Patricia Morales','Andres Herrera','Empresa Comercial S.A.S',
    'Sandra Diaz','Felipe Castillo','Empresa Sistemas S.A.S','Laura Vargas','Miguel Ortiz',
    'Empresa Constructora S.A.S','Rosa Mendoza','David Suarez','Empresa Ingeniería S.A.S','Gloria Rios',
    'Ricardo Parra','Empresa Consultoría S.A.S','Lucia Navarro','Oscar Delgado','Empresa Alimentos S.A.S',
    'Isabel Castro','Fernando Rojas','Empresa Textil S.A.S','Monica Guerrero','Alejandro Vega',
    'Empresa Servicios S.A.S','Teresa Salazar','Hector Pineda','Empresa Tecnología S.A.S','Claudia Ruiz',
    'Eduardo Molina','Empresa Minería S.A.S','Paola Cárdenas','Gabriel Soto','Empresa Agroindustrial S.A.S',
    'Natalia Ospina','Roberto Acosta','Empresa Petrolera S.A.S','Valentina Mejia','Empresa Turismo S.A.S'
];
const IDS_FIJOS = [
    '10234567','10345678','10456789','10567890','10678901',
    '900100200','10789012','10890123','900200300','10901234',
    '11012345','900300400','11123456','11234567','900400500',
    '11345678','11456789','900500600','11567890','11678901',
    '900600700','11789012','11890123','900700800','11901234',
    '12012345','900800900','12123456','12234567','900901000',
    '12345678','12456789','901001100','12567890','12678901',
    '901101200','12789012','12890123','901201300','12901234',
    '13012345','901301400','13123456','13234567','901401500',
    '13345678','13456789','901501600','13567890','901601700'
];
const OBLIGACIONES_FIJAS = [
    'F001','F002','F003','F004','F005','F006','F007','F008','F009','F010',
    'F011','F012','F013','F014','F015','F016','F017','F018','F019','F020',
    'F021','F022','F023','F024','F025','F026','F027','F028','F029','F030',
    'F031','F032','F033','F034','F035','F036','F037','F038','F039','F040',
    'F041','F042','F043','F044','F045','F046','F047','F048','F049','F050'
];
const VALORES_FIJOS = [
    35000,120000,2500000,75000,1800000,15000,980000,3100000,45000,650000,
    2200000,30000,1500000,88000,2800000,42000,1350000,3500000,62000,920000,
    2100000,28000,1650000,2950000,55000,780000,1200000,38000,1450000,3200000,
    48000,1100000,2600000,72000,1900000,3800000,52000,850000,2400000,60000,
    1750000,2700000,40000,1050000,3000000,68000,1600000,2350000,33000,1400000
];
const ESTADOS_FIJOS = [
    'APERTURADO','EN NOTIFICACION','EN EJECUCION','EN MORA','CERRADO',
    'APERTURADO','EN DEFENSA DEL CONTRIBUYENTE','EN LEVANTAMIENTO DE EMBARGO','APERTURADO','EN NOTIFICACION',
    'EN EJECUCION','APERTURADO','EN MORA','EN NOTIFICACION','CERRADO',
    'APERTURADO','EN EJECUCION','PENDIENTE CIERRE','EN NOTIFICACION','EN MORA',
    'CERRADO','APERTURADO','EN LEVANTAMIENTO DE EMBARGO','EN DEFENSA DEL CONTRIBUYENTE','EN NOTIFICACION',
    'EN EJECUCION','APERTURADO','EN MORA','EN NOTIFICACION','CERRADO',
    'APERTURADO','EN EJECUCION','PENDIENTE CIERRE','EN NOTIFICACION','EN MORA',
    'CERRADO','APERTURADO','EN DEFENSA DEL CONTRIBUYENTE','EN LEVANTAMIENTO DE EMBARGO','EN NOTIFICACION',
    'EN EJECUCION','APERTURADO','EN MORA','EN NOTIFICACION','CERRADO',
    'APERTURADO','EN EJECUCION','EN DEFENSA DEL CONTRIBUYENTE','EN NOTIFICACION','APERTURADO'
];
const FECHAS_FIJAS = [
    '2021-03-15','2022-07-10','2023-01-20','2020-11-05','2024-02-18',
    '2019-06-01','2023-09-12','2022-04-25','2024-08-03','2021-12-08',
    '2020-05-14','2025-01-22','2023-06-30','2022-10-17','2019-08-20',
    '2024-04-11','2021-07-28','2020-02-09','2023-11-05','2022-01-14',
    '2019-10-30','2025-03-18','2020-09-22','2021-01-07','2024-06-15',
    '2023-03-25','2025-07-01','2022-08-19','2021-05-03','2019-12-12',
    '2024-10-08','2023-04-14','2020-07-27','2022-06-02','2021-09-16',
    '2019-04-05','2025-02-28','2020-12-20','2021-08-11','2024-01-25',
    '2023-07-18','2025-05-10','2022-03-06','2021-04-22','2019-07-15',
    '2024-09-30','2023-02-13','2020-06-18','2022-11-09','2025-06-05'
];
const ABOGADOS_FIJOS = ["Carlos Rodríguez","Ana Martínez","Luis Fernández","María Gómez"];
const ASIGNACIONES_FIJAS = [0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1];

function generarProcesosIniciales() {
    return Array.from({ length: 50 }).map((_, i) => {
        const valor = VALORES_FIJOS[i];
        let cuantia = 'Pequeña';
        if (valor > 50000 && valor <= 2000000) cuantia = 'Mediana';
        if (valor > 2000000) cuantia = 'Grande';

        const fechaInicio = FECHAS_FIJAS[i];
        const dateInicio = new Date(fechaInicio);
        const today = new Date();
        const diffYears = Math.abs(today - dateInicio) / (1000 * 60 * 60 * 24 * 365.25);
        let prescripcion = 'Vigente';
        if (diffYears > 4.5 && diffYears <= 5) prescripcion = 'Por Prescribir';
        if (diffYears > 5) prescripcion = 'Prescrita';

        const estado = ESTADOS_FIJOS[i];
        return {
            id: i.toString(),
            identificacion: IDS_FIJOS[i],
            nombre: NOMBRES_FIJOS[i],
            numObligacion: OBLIGACIONES_FIJAS[i],
            consecutivo: `CC-${fechaInicio.substring(0,4)}-${(1000 + i).toString()}`,
            estadoProceso: estado,
            estado: estado,
            fechaInicio: fechaInicio,
            valor: valor,
            cuantia: cuantia,
            prescripcion: prescripcion,
            funcionarioAsignado: ABOGADOS_FIJOS[ASIGNACIONES_FIJAS[i]],
            pdfUrl: null,
            notificaciones: { telefonica: [], personal: [], electronico: [] }
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
        const confirmReset = window.confirm("¿Estás seguro de que deseas resetear la base de datos? Se restaurarán los 50 procesos iniciales por defecto.");
        if (confirmReset) {
            const nuevos = generarProcesosIniciales();
            setProcesosCoactivos(nuevos);
            alert("Base de datos reseteada con éxito. Se han restaurado los 50 procesos iniciales fijos.");
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
                    <Route index element={<DashboardView procesosExternos={procesosFiltrados} setProcesosExternos={setProcesosCoactivos} userRole={auth.role} userName={auth.username} />} />
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
                    <Route path="defensa" element={<DefensaView procesosExternos={procesosFiltrados} setProcesosExternos={updateProcessInSeguimiento} userName={auth.username} />} />
                    <Route path="ejecucion" element={<EjecucionView procesosExternos={procesosFiltrados} userRole={auth.role} userName={auth.username} />} />
                    <Route path="cierre" element={<CierreView procesosExternos={procesosCoactivos} setProcesosExternos={setProcesosCoactivos} userRole={auth.role} userName={auth.username} />} />
                    <Route path="carga-masiva" element={<CargaMasivaView procesosExternos={procesosCoactivos} setProcesosExternos={setProcesosCoactivos} onResetDatabase={handleResetDatabase} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
