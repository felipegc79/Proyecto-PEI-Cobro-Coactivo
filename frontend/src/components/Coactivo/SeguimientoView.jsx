import React, { useState } from 'react';
import { FileText, Phone, Mail, User, Search, Eye, Trash2, Plus, X, CheckSquare, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';

const SeguimientoView = ({ procesosExternos, setProcesosExternos, userRole = 'Administrador', userName = '' }) => {
    const navigate = useNavigate();
    const [filtroRazonSocial, setFiltroRazonSocial] = useState('');
    const [filtroCedula, setFiltroCedula] = useState('');
    const [filtroConsecutivo, setFiltroConsecutivo] = useState('');
    const [selectedProceso, setSelectedProceso] = useState(null);
    const [activeTab, setActiveTab] = useState('telefonica');
    
    // Novedades: Selección múltiple, Asignaciones
    const [selectedForMassAction, setSelectedForMassAction] = useState([]);
    const [assignedLawyers, setAssignedLawyers] = useState({});
    const [showMassNotifyModal, setShowMassNotifyModal] = useState(false);
    const [massNotifyTemplate, setMassNotifyTemplate] = useState('Estimado {Nombre}, NIT {NIT}, le notificamos del proceso {Radicado}.');
    const [massNotifyType, setMassNotifyType] = useState('email');
    const [massNotifyResults, setMassNotifyResults] = useState(null); // { sent, failed: [{id,nombre,error}] }

    const [abogadosDisponibles, setAbogadosDisponibles] = useState(["Carlos Rodríguez", "Ana Martínez", "Luis Fernández", "María Gómez"]);
    const [showAddLawyerModal, setShowAddLawyerModal] = useState(false);
    const [regData, setRegData] = useState({
        nombreCompleto: '',
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '',
        correoElectronico: '',
        razonSocial: '',
        rol: 'Abogado'
    });

    React.useEffect(() => {
        const users = JSON.parse(localStorage.getItem('coactivo_users') || '[]');
        const lawyers = users.filter(u => u.rol !== 'Administrador').map(u => u.nombreCompleto || u.username);
        const combined = Array.from(new Set([...["Carlos Rodríguez", "Ana Martínez", "Luis Fernández", "María Gómez"], ...lawyers]));
        setAbogadosDisponibles(combined);
    }, []);

    // Usar procesos externos sincronizados desde App.jsx
    const procesos = procesosExternos || [];

    const handleVerMandamiento = (proceso) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(24);
        doc.setFont(undefined, 'bolditalic');
        doc.text("ST", 20, 20);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("SuperTransporte", 20, 25);
        doc.setLineWidth(0.5);
        doc.line(20, 27, 50, 27); // underline
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text("Portal Web: www.supertransporte.gov.co", 190, 15, { align: "right" });
        doc.text("Sede Administrativa: Diagonal 25G No. 95A-85, Bogotá, D.C.", 190, 19, { align: "right" });
        doc.text("PBX: 352 67 00", 190, 23, { align: "right" });
        doc.text("Correspondencia: Diagonal 25G No. 95A-85, Bogotá, D.C.", 190, 27, { align: "right" });
        doc.text("Línea Atención al Ciudadano: 01 8000 915615", 190, 31, { align: "right" });
        doc.line(20, 35, 190, 35);
        
        // Title
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text("SUPERINTENDENCIA DE TRANSPORTE", 105, 50, { align: "center" });
        doc.text("JURISDICCIÓN COACTIVA", 105, 56, { align: "center" });
        
        doc.text(`Mandamiento de Pago No ${proceso.consecutivo || 'RES-2026-7104'}`, 105, 68, { align: "center" });
        doc.text(`Bogotá, D.C. ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 74, { align: "center" });
        
        // Body text
        doc.setFontSize(11);
        const text1 = `Por el cual se libra mandamiento de pago a favor de la Superintendencia de Transporte y en contra de la sociedad ${proceso.nombre}, identificada con Nit. ${proceso.identificacion}.`;
        const lines1 = doc.splitTextToSize(text1, 170);
        doc.text(lines1, 20, 90);
        
        // Info block
        doc.text(`Resolución No: 17086 del 14/12/2021`, 30, 110);
        doc.text(`Obligación: ${proceso.numObligacion || 'F001'}`, 30, 116);
        doc.text(`Fecha Ejecutoria: ${proceso.fechaInicio || '1/02/2022'}`, 30, 122);
        doc.setFont(undefined, 'bold');
        doc.text(`Valor de la obligación: $ ${proceso.valor ? proceso.valor.toLocaleString('es-CO') : '1.500.000'}`, 30, 128);
        doc.setFont(undefined, 'normal');
        
        const text2 = "Acto Administrativo que presta mérito ejecutivo de conformidad con el artículo 98 y 99 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo – C.P.A.C.A. (Ley 1437 del 2011), el artículo 828 del Estatuto Tributario, y la Ley 1066 del 29 de julio de 2006; en concordancia con la Resolución 1871 del 13 de junio de 2022 por medio de la cual se adopta el Manual de Gestión de Recaudo de Cartera de la Superintendencia de Transporte; previo a los anteriores antecedentes.";
        const lines2 = doc.splitTextToSize(text2, 170);
        doc.text(lines2, 20, 145);
        
        doc.setFont(undefined, 'bold');
        doc.text("MANDAMIENTO EJECUTIVO", 105, 180, { align: "center" });
        
        const art1 = `ARTÍCULO PRIMERO: Librar Mandamiento de pago por la vía administrativa de cobro ejecutivo por Jurisdicción Coactiva a favor de la Superintendencia de Transporte y en contra de la sociedad ${proceso.nombre}, identificada con Nit. ${proceso.identificacion}, por las siguientes sumas de dinero:`;
        const linesArt1 = doc.splitTextToSize(art1, 170);
        doc.text(linesArt1, 20, 195);
        
        doc.setFont(undefined, 'normal');
        doc.text(`Resolución No: 17086 del 14/12/2021`, 30, 215);
        doc.text(`Obligación: ${proceso.numObligacion || 'F001'}`, 30, 221);
        doc.text(`Fecha Ejecutoria: ${proceso.fechaInicio || '1/02/2022'}`, 30, 227);
        doc.text(`Valor de la obligación: $ ${proceso.valor ? proceso.valor.toLocaleString('es-CO') : '1.500.000'}`, 30, 233);
        
        doc.setFont(undefined, 'bolditalic');
        doc.text("> más los intereses que sigan causando hasta cuando se efectúe el pago", 30, 245);
        
        doc.addPage();
        doc.setFont(undefined, 'normal');
        let currentY = 30;
        
        const art2 = `ARTICULO SEGUNDO: Notifíquese a la sociedad ${proceso.nombre}, identificada con Nit. ${proceso.identificacion}, por intermedio del Grupo de notificaciones de la Entidad a la dirección electrónica notificaciones@${proceso.identificacion}.com.co de conformidad con lo dispuesto en el artículo 8 de la ley 2213 del 13 de junio de 2022, y el artículo 826 del Estatuto Tributario, para que dentro del término de quince (15) días siguientes a la notificación del presente acto, pague la suma que se cobra más los intereses causados. El pago deberá realizarse accediendo al aplicativo Consola Taux, bajo las modalidades, PSE o descargue de cupón para pago en punto físico.`;
        const linesArt2 = doc.splitTextToSize(art2, 170);
        doc.text(linesArt2, 20, currentY);
        
        currentY += (linesArt2.length * 6) + 10; // Espaciado dinámico basado en líneas del artículo 2
        
        const art3 = `ARTÍCULO TERCERO: Contra el presente acto, podrán interponerse las excepciones consagradas en el artículo 831 del Estatuto Tributario Nacional dentro de los quince (15) días siguientes a la notificación del Mandamiento, expresando los hechos en que se funde.`;
        const linesArt3 = doc.splitTextToSize(art3, 170);
        doc.text(linesArt3, 20, currentY);
        
        currentY += (linesArt3.length * 6) + 10; // Espaciado dinámico basado en líneas del artículo 3
        
        const art4 = `ARTICULO CUARTO: Líbrense los oficios correspondientes.`;
        doc.text(art4, 20, currentY);
        
        currentY += 20;
        
        doc.setFont(undefined, 'bold');
        doc.text("NOTIFÍQUESE Y CÚMPLASE", 105, currentY, { align: "center" });
        
        currentY += 30;
        
        // Signature
        doc.setFont("times", "italic");
        doc.setFontSize(32);
        doc.text("J. Samir A.", 105, currentY, { align: "center" });
        
        currentY += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Jhohan Samir Abdlah Rubiano", 105, currentY, { align: "center" });
        doc.setFont(undefined, "normal");
        doc.text("Coordinador Grupo Cobro por Jurisdicción Coactiva", 105, currentY + 5, { align: "center" });
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Proyectó: John J Riascos U", 20, 200);
        doc.text(`Referencia Interna: https://supertransporte.gov.co/documentos/Mandamiento_${proceso.identificacion}.docx`, 20, 205);
        
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Opción de descarga automática (comentada por si el usuario sólo quiere ver y luego descargar desde el visor)
        // doc.save(`Mandamiento_${proceso.identificacion}.pdf`);
    };

    const procesosFiltrados = procesos.filter(p => {
        const matchesFilters = p.nombre.toLowerCase().includes(filtroRazonSocial.toLowerCase()) &&
            p.identificacion.includes(filtroCedula) &&
            p.consecutivo.toLowerCase().includes(filtroConsecutivo.toLowerCase());
            
        if (userRole === 'Abogado') {
             // Abogados solo ven los casos que tienen asignados (su userName debe coincidir con el funcionarioAsignado)
             if (p.funcionarioAsignado !== userName) {
                 return false;
             }
        }
        return matchesFilters;
    });

    const handleSelectForMassAction = (id) => {
        if (selectedForMassAction.includes(id)) {
            setSelectedForMassAction(selectedForMassAction.filter(selectedId => selectedId !== id));
        } else {
            setSelectedForMassAction([...selectedForMassAction, id]);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedForMassAction(procesosFiltrados.map(p => p.id));
        } else {
            setSelectedForMassAction([]);
        }
    };

    const handleLawyerChange = (id, newLawyer) => {
        setAssignedLawyers(prev => ({ ...prev, [id]: newLawyer }));
    };

    const handleSaveAssignments = () => {
        let count = 0;
        procesos.forEach(p => {
            if (assignedLawyers[p.id] && assignedLawyers[p.id] !== p.funcionarioAsignado) {
                const updatedProcess = { ...p, funcionarioAsignado: assignedLawyers[p.id] };
                if (setProcesosExternos) setProcesosExternos(updatedProcess);
                count++;
            }
        });
        alert(`Se han guardado los cambios de asignación para ${count} expediente(s).`);
        setAssignedLawyers({});
    };

    const handleExecuteMassNotify = () => {
        if (selectedForMassAction.length === 0) return;
        
        const ERRORES_POSIBLES = [
            'Buzón lleno - rebote permanente (550)',
            'Dirección de correo no existe (551)',
            'Número de teléfono inválido',
            'WhatsApp no registrado en este número',
            'Tiempo de espera agotado (timeout)',
            'Cuenta suspendida por el proveedor',
        ];

        const selected = procesosFiltrados.filter(p => selectedForMassAction.includes(p.id));
        const failed = selected
            .filter(() => Math.random() < 0.2)
            .map(p => ({ id: p.consecutivo, nombre: p.nombre, error: ERRORES_POSIBLES[Math.floor(Math.random() * ERRORES_POSIBLES.length)] }));
        const sent = selected.length - failed.length;

        setMassNotifyResults({ sent, failed });
        setShowMassNotifyModal(false);
        setSelectedForMassAction([]);
    };

    const handleRegisterLawyer = (e) => {
        e.preventDefault();
        const { nombreCompleto, tipoIdentificacion, numeroIdentificacion, correoElectronico, razonSocial, rol } = regData;
        if (!nombreCompleto || !numeroIdentificacion || !correoElectronico) {
            alert('Por favor complete los campos obligatorios.');
            return;
        }

        const primerNombre = nombreCompleto.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const ultimosDigitos = numeroIdentificacion.slice(-3);
        const dynamicUsername = `${primerNombre}${ultimosDigitos}`;
        
        const users = JSON.parse(localStorage.getItem('coactivo_users') || '[]');
        users.push({ username: dynamicUsername, rol: rol, nombreCompleto: nombreCompleto });
        localStorage.setItem('coactivo_users', JSON.stringify(users));

        setAbogadosDisponibles(prev => Array.from(new Set([...prev, nombreCompleto])));
        setShowAddLawyerModal(false);
        setRegData({ nombreCompleto: '', tipoIdentificacion: 'CC', numeroIdentificacion: '', correoElectronico: '', razonSocial: '', rol: 'Abogado' });
        alert(`Abogado registrado y sincronizado exitosamente.\nUsuario: ${dynamicUsername}\nContraseña temporal: 123456`);
    };

    const handleGenerarNotificacionPersonal = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("ALCALDÍA MUNICIPAL", 105, 20, null, null, "center");
        doc.setFontSize(14);
        doc.text("Secretaría de Hacienda", 105, 30, null, null, "center");
        
        doc.setFontSize(12);
        doc.text(`193- ${Math.floor(Math.random() * 90000) + 10000}`, 20, 50);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 60);
        
        doc.text(`Señor (a): ${selectedProceso.nombre}`, 20, 80);
        doc.text(`CC/ NIT: ${selectedProceso.identificacion}`, 20, 90);
        doc.text(`Dirección: Registrada en expediente`, 20, 100);
        
        doc.setFont(undefined, 'bold');
        const refText = `REFERENCIA: Citación a notificación personal proceso coactivo administrativo No ${selectedProceso.consecutivo}`;
        const refLines = doc.splitTextToSize(refText, 170);
        doc.text(refLines, 20, 120);
        
        doc.setFont(undefined, 'normal');
        doc.rect(20, 132, 170, 20);
        doc.text("ACTO ADMINISTRATIVO", 22, 139);
        doc.text("3603", 22, 146);
        doc.line(75, 132, 75, 152); // Línea divisoria de la tabla
        doc.setFontSize(10);
        const asuntoText = "ASUNTO: POR LA CUAL SE LIBRA MANDAMIENTO DE PAGO Y SE ORDENA EMBARGO DE LOS BIENES DEL DEUDOR.";
        const asuntoLines = doc.splitTextToSize(asuntoText, 110);
        doc.text(asuntoLines, 78, 139);
        doc.setFontSize(12);
        
        doc.text("Sírvase comparecer ante este Despacho, en horas hábiles de Oficina, dentro de los diez (10)", 20, 160);
        doc.text("días siguientes a la fecha de recibo la presente comunicación, para efectos de la", 20, 166);
        doc.text(`notificación personal de mandamiento de pago, librado dentro del proceso de la`, 20, 172);
        doc.text(`referencia con resolución N. ° ${selectedProceso.consecutivo}`, 20, 178);

        doc.text("Se le advierte que, de no comparecer dentro del término fijado, el Mandamiento de Pago", 20, 190);
        doc.text("se le notificará por correo certificado.", 20, 196);
        
        doc.text("NOTA: Para efectos de la notificación personal deberá acreditar la calidad con la que actúa.", 20, 208);
        doc.text("Si usted ya realizó el pago de esta obligación, favor hacer caso omiso de este comunicado.", 20, 220);
        
        doc.text("Cordialmente,", 20, 240);
        
        // Firma simulada con curvas y trazos
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.line(25, 255, 25, 245); // D palo
        doc.ellipse(30, 250, 4, 5); // D bucle
        doc.line(34, 255, 42, 255); // Trazo conector
        doc.ellipse(47, 250, 5, 5); // O bucle
        doc.line(52, 250, 60, 255); // Trazo
        doc.ellipse(65, 250, 5, 5); // A bucle
        doc.line(70, 245, 70, 255); // A palo
        doc.line(30, 256, 75, 256); // Subrayado irregular
        
        doc.text("DANIELA OROZCO ARCILA", 20, 265);
        doc.text("Subdirector de Ejecuciones Fiscales", 20, 270);
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Aprobó: Daniela Orozco Arcila. / Subdirectora Administrativa de Ejecuciones Fiscales", 20, 280);
        doc.text("Elaboró: Luisa Monsalve. / Contratista.", 20, 284);
        
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const handleOpenNotificaciones = (proceso) => {
        setSelectedProceso(JSON.parse(JSON.stringify(proceso))); // Clone for local editing
    };

    const handleAddRecord = () => {
        const newRecord = {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            observacion: '',
            adjuntos: [],
            canal: activeTab, // telefonica, personal, email, whatsapp, sms
            transportadora: '',
            direccion: '',
            guia: '',
            emailDestino: '',
            telefonoDestino: '',
        };

        const updated = { ...selectedProceso };
        const notifs = updated.notificaciones;
        if (activeTab === 'telefonica') notifs.telefonica.push(newRecord);
        else if (activeTab === 'personal') notifs.personal.push(newRecord);
        else if (activeTab === 'email') notifs.electronico.push(newRecord);
        else if (activeTab === 'whatsapp') { notifs.whatsapp = notifs.whatsapp || []; notifs.whatsapp.push(newRecord); }
        else if (activeTab === 'sms') { notifs.sms = notifs.sms || []; notifs.sms.push(newRecord); }
        setSelectedProceso(updated);
    };

    const handleDeleteRecord = (id) => {
        const updated = { ...selectedProceso };
        const notifs = updated.notificaciones;
        if (activeTab === 'telefonica') notifs.telefonica = notifs.telefonica.filter(r => r.id !== id);
        else if (activeTab === 'personal') notifs.personal = notifs.personal.filter(r => r.id !== id);
        else if (activeTab === 'email') notifs.electronico = notifs.electronico.filter(r => r.id !== id);
        else if (activeTab === 'whatsapp') notifs.whatsapp = (notifs.whatsapp || []).filter(r => r.id !== id);
        else if (activeTab === 'sms') notifs.sms = (notifs.sms || []).filter(r => r.id !== id);
        setSelectedProceso(updated);
    };

    const handleFileChange = (recordId, files) => {
        const updated = { ...selectedProceso };
        const notifs = updated.notificaciones;
        let records;
        if (activeTab === 'telefonica') records = notifs.telefonica;
        else if (activeTab === 'personal') records = notifs.personal;
        else if (activeTab === 'email') records = notifs.electronico;
        else if (activeTab === 'whatsapp') { notifs.whatsapp = notifs.whatsapp || []; records = notifs.whatsapp; }
        else { notifs.sms = notifs.sms || []; records = notifs.sms; }
        const recordIndex = records.findIndex(r => r.id === recordId);
        
        if (recordIndex !== -1) {
            const newAdjuntos = Array.from(files).map(f => ({
                name: f.name,
                type: f.type,
                url: URL.createObjectURL(f)
            }));
            records[recordIndex].adjuntos = [...records[recordIndex].adjuntos, ...newAdjuntos];
            setSelectedProceso(updated);
        }
    };

    const removeAdjunto = (recordId, adjuntoIndex) => {
        const updated = { ...selectedProceso };
        const notifs = updated.notificaciones;
        let records;
        if (activeTab === 'telefonica') records = notifs.telefonica;
        else if (activeTab === 'personal') records = notifs.personal;
        else if (activeTab === 'email') records = notifs.electronico;
        else if (activeTab === 'whatsapp') records = notifs.whatsapp || [];
        else records = notifs.sms || [];
        const recordIndex = records.findIndex(r => r.id === recordId);
        if (recordIndex !== -1) {
            records[recordIndex].adjuntos.splice(adjuntoIndex, 1);
            setSelectedProceso(updated);
        }
    };

    const handleSaveNotificaciones = () => {
        if (setProcesosExternos) {
            setProcesosExternos(selectedProceso);
        }
        alert('¡Registros guardados exitosamente!');
        setSelectedProceso(null);
    };

    const renderTabContent = () => {
        if (!selectedProceso) return null;
        const notifs = selectedProceso.notificaciones;

        const records = activeTab === 'telefonica' 
            ? notifs.telefonica 
            : activeTab === 'personal' ? notifs.personal 
            : activeTab === 'email' ? notifs.electronico
            : activeTab === 'whatsapp' ? (notifs.whatsapp || [])
            : activeTab === 'sms' ? (notifs.sms || [])
            : [];

        if (activeTab === 'formatoPersonal') {
            return (
                <div className="tab-pane" style={{ padding: '2rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>193 - {Math.floor(Math.random() * 90000) + 10000}</div>
                            <div style={{ marginTop: '0.5rem' }}>Marinilla, {new Date().toLocaleDateString('es-CO')}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold' }}>Secretaría de Hacienda</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Marinilla</div>
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>NIT 890983716-1</div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <div>Señor (a): <span style={{ fontWeight: 'bold' }}>{selectedProceso.nombre.toUpperCase()}</span></div>
                        <div>CC/ NIT: {selectedProceso.identificacion}</div>
                        <div>Dirección: Registrada en expediente</div>
                        <div>Contacto: No registrado</div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>
                        REFERENCIA: Citación a notificación personal proceso coactivo administrativo No {selectedProceso.consecutivo}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', border: '1px solid #000' }}>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #000', padding: '0.5rem', fontWeight: 'bold', width: '30%' }}>ACTO ADMINISTRATIVO<br/>3603<br/>{new Date().toLocaleDateString('es-CO')}</td>
                                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>ASUNTO</span><br/>
                                    POR LA CUAL SE LIBRA MANDAMIENTO DE PAGO Y SE ORDENA EMBARGO DE LOS BIENES DEL DEUDOR.
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'justify', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                        Sírvase comparecer ante este Despacho, (Calle 30 # 30-13 Parque Principal), en horas hábiles de Oficina,
                        dentro de los diez (10) días siguientes a la fecha de recibo la presente comunicación, para efectos de la
                        notificación personal de mandamiento de pago, N. ° 3603 de {new Date().toLocaleDateString('es-CO')}, librado dentro del proceso de la
                        referencia con resolución N. ° {selectedProceso.consecutivo}
                    </div>
                    
                    <div style={{ textAlign: 'justify', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                        Se le advierte que, de no comparecer dentro del término fijado, el Mandamiento de Pago se le notificará por
                        correo certificado, conforme lo dispuesto en el Artículo 826 del Estatuto Tributario Nacional en concordancia
                        con su artículo 565, y el artículo 22 del Decreto 053 de 2019.
                    </div>
                    
                    <div style={{ textAlign: 'justify', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                        NOTA: Para efectos de la notificación personal deberá acreditar la calidad con la que actúa. (Propietario, representante legal, apoderado).
                        <br/><br/>
                        Si usted ya realizó el pago de esta obligación, favor hacer caso omiso de este comunicado.
                    </div>

                    <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                        Cordialmente,<br/><br/><br/>
                        ___________________________<br/>
                        <span style={{ fontWeight: 'bold' }}>DANIELA OROZCO ARCILA</span><br/>
                        Subdirector de Ejecuciones Fiscales
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <button className="btn" onClick={handleGenerarNotificacionPersonal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} /> Descargar PDF Oficial
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="tab-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>
                        {activeTab === 'telefonica' ? '📞 Llamadas Telefónicas' 
                        : activeTab === 'personal' ? '📬 Correo Certificado / Personal'
                        : activeTab === 'email' ? '📧 Correo Electrónico'
                        : activeTab === 'whatsapp' ? '💬 WhatsApp'
                        : '📱 Mensaje de Texto (SMS)'}
                    </h4>
                    <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={handleAddRecord}>
                        <Plus size={14} /> Añadir Registro
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {records.map((n) => (
                        <div key={n.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>Fecha</label>
                                        <div style={{ fontWeight: '500' }}>{n.fecha}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#666' }}>Hora</label>
                                        <div style={{ fontWeight: '500' }}>{n.hora}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteRecord(n.id)}
                                    style={{ color: 'crimson', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                                {activeTab === 'personal' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.8rem' }}>Transportadora</label>
                                            <input 
                                                type="text" 
                                                className="p-1" 
                                                value={n.transportadora}
                                                onChange={(e) => {
                                                    const updated = { ...selectedProceso };
                                                    const index = updated.notificaciones.personal.findIndex(r => r.id === n.id);
                                                    updated.notificaciones.personal[index].transportadora = e.target.value;
                                                    setSelectedProceso(updated);
                                                }}
                                                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.8rem' }}>Número de Guía</label>
                                            <input 
                                                type="text" 
                                                className="p-1" 
                                                value={n.guia}
                                                onChange={(e) => {
                                                    const updated = { ...selectedProceso };
                                                    const index = updated.notificaciones.personal.findIndex(r => r.id === n.id);
                                                    updated.notificaciones.personal[index].guia = e.target.value;
                                                    setSelectedProceso(updated);
                                                }}
                                                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                            />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.8rem' }}>Dirección</label>
                                            <input 
                                                type="text" 
                                                className="p-1" 
                                                value={n.direccion}
                                                onChange={(e) => {
                                                    const updated = { ...selectedProceso };
                                                    const index = updated.notificaciones.personal.findIndex(r => r.id === n.id);
                                                    updated.notificaciones.personal[index].direccion = e.target.value;
                                                    setSelectedProceso(updated);
                                                }}
                                                style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                            />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <button className="btn btn-outline" onClick={handleGenerarNotificacionPersonal} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                                                <FileText size={18} /> Generar Carta de Notificación Personal (PDF)
                                            </button>
                                        </div>
                                    </div>
                                )}

                            {(activeTab === 'whatsapp' || activeTab === 'sms') && (
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Número de Teléfono / WhatsApp</label>
                                    <input 
                                        type="tel" 
                                        className="p-1" 
                                        value={n.telefonoDestino || ''}
                                        onChange={(e) => {
                                            const updated = { ...selectedProceso };
                                            const notifs2 = updated.notificaciones;
                                            const arr = activeTab === 'whatsapp' ? (notifs2.whatsapp || []) : (notifs2.sms || []);
                                            const idx2 = arr.findIndex(r => r.id === n.id);
                                            if (idx2 !== -1) arr[idx2].telefonoDestino = e.target.value;
                                            setSelectedProceso(updated);
                                        }}
                                        style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                        placeholder="+57 300 000 0000"
                                    />
                                </div>
                            )}
                            {activeTab === 'email' && (
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Correo de Destino</label>
                                    <input 
                                        type="email" 
                                        className="p-1" 
                                        value={n.emailDestino || ''}
                                        onChange={(e) => {
                                            const updated = { ...selectedProceso };
                                            const index = updated.notificaciones.electronico.findIndex(r => r.id === n.id);
                                            if (index !== -1) updated.notificaciones.electronico[index].emailDestino = e.target.value;
                                            setSelectedProceso(updated);
                                        }}
                                        style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
                                    />
                                </div>
                            )}

                            <label style={{ fontSize: '0.8rem' }}>Observaciones</label>
                            <textarea 
                                className="p-2" 
                                placeholder="Escriba aquí..."
                                style={{ width: '100%', height: '60px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}
                                value={n.observacion}
                                onChange={(e) => {
                                    const updated = { ...selectedProceso };
                                    const notifs3 = updated.notificaciones;
                                    let arr3;
                                    if (activeTab === 'telefonica') arr3 = notifs3.telefonica;
                                    else if (activeTab === 'personal') arr3 = notifs3.personal;
                                    else if (activeTab === 'email') arr3 = notifs3.electronico;
                                    else if (activeTab === 'whatsapp') arr3 = notifs3.whatsapp || [];
                                    else arr3 = notifs3.sms || [];
                                    const idx3 = arr3.findIndex(r => r.id === n.id);
                                    if (idx3 !== -1) arr3[idx3].observacion = e.target.value;
                                    setSelectedProceso(updated);
                                }}
                            />

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                    Adjuntar Archivos ({activeTab === 'telefonica' ? 'Audio MP3, WAV' : activeTab === 'whatsapp' || activeTab === 'sms' ? 'Captura de pantalla (PNG, JPEG)' : 'PNG, JPEG, PDF'})
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input 
                                        type="file" 
                                        multiple
                                        accept={activeTab === 'telefonica' ? '.mp3,.wav,.ogg' : activeTab === 'whatsapp' || activeTab === 'sms' ? '.png,.jpg,.jpeg' : '.png,.jpg,.jpeg,.pdf'}
                                        onChange={(e) => handleFileChange(n.id, e.target.files)}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {n.adjuntos.map((adj, idx) => (
                                            <div key={idx} style={{ 
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                                padding: '0.3rem 0.5rem', background: '#f0f9ff', border: '1px solid #bae6fd',
                                                borderRadius: '4px', fontSize: '0.8rem'
                                            }}>
                                                <FileText size={14} style={{ color: '#0284c7' }} />
                                                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {adj.name}
                                                </span>
                                                <button 
                                                    onClick={() => removeAdjunto(n.id, idx)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {records.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', border: '2px dashed #e5e7eb', color: '#9ca3af' }}>
                            No hay registros. Haga clic en "Añadir Registro" para comenzar.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title">Seguimiento de Procesos</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: '#6b7280' }}>Área: </span>
                        <strong style={{ color: '#1f2937' }}>Seguimiento y Control</strong>
                    </div>
                    <div style={{ width: '1px', height: '20px', background: '#d1d5db' }}></div>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: '#6b7280' }}>Funcionario: </span>
                        <strong style={{ color: '#1f2937' }}>{userName || 'Admin Seguimiento'}</strong>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    Buscador de Procesos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Razón Social / Nombre</label>
                        <input 
                            type="text" 
                            className="p-2" 
                            placeholder="Buscar..." 
                            value={filtroRazonSocial}
                            onChange={(e) => setFiltroRazonSocial(e.target.value)}
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Cédula / NIT</label>
                        <input 
                            type="text" 
                            className="p-2" 
                            placeholder="Buscar..." 
                            value={filtroCedula}
                            onChange={(e) => setFiltroCedula(e.target.value)}
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Consecutivo del Proceso</label>
                        <input 
                            type="text" 
                            className="p-2" 
                            placeholder="CC-XXXX-XXX" 
                            value={filtroConsecutivo}
                            onChange={(e) => setFiltroConsecutivo(e.target.value)}
                            style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Search size={18} /> Buscar
                    </button>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--color-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0e7ff', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ transform: 'scale(1.2)', cursor: 'pointer', margin: 0 }} onChange={handleSelectAll} checked={selectedForMassAction.length > 0 && selectedForMassAction.length === procesosFiltrados.length} />
                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-primary)' }}>Seleccionar todos</span>
                        </label>
                        {selectedForMassAction.length > 0 && (
                            <button className="btn" onClick={() => setShowMassNotifyModal(true)} style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                <Send size={16} /> Notificar Masivamente ({selectedForMassAction.length})
                            </button>
                        )}
                    </div>
                    {userRole === 'Administrador' && (
                        <button className="btn btn-outline" onClick={() => setShowAddLawyerModal(true)} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} /> Agregar Nuevo Abogado
                        </button>
                    )}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#efefef' }}>
                            <th style={{ padding: '1rem', width: '50px', textAlign: 'center' }}></th>
                            <th style={{ padding: '1rem' }}>Nombre</th>
                            <th style={{ padding: '1rem' }}>Identificación</th>
                            <th style={{ padding: '1rem' }}>Consecutivo</th>
                            <th style={{ padding: '1rem' }}>Estado</th>
                            <th style={{ padding: '1rem' }}>Expediente Asignado a</th>
                            <th style={{ padding: '1rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {procesosFiltrados.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedForMassAction.includes(p.id)}
                                        onChange={() => handleSelectForMassAction(p.id)}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>{p.nombre}</td>
                                <td style={{ padding: '1rem' }}>{p.identificacion}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        {p.consecutivo}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {(() => {
                                        let estadoLabel = p.estadoProceso || p.estado;
                                        let estadoColor = '#059669';
                                        
                                        if (estadoLabel === 'EN DEFENSA DEL CONTRIBUYENTE') {
                                            if (p.fechaDefensa) {
                                                const diffTime = Math.abs(new Date() - new Date(p.fechaDefensa));
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                if (diffDays > 5) {
                                                    estadoLabel = 'Vencido - Defensa';
                                                    estadoColor = '#ef4444';
                                                } else {
                                                    estadoLabel = 'Pausado (En Defensa)';
                                                    estadoColor = '#f59e0b';
                                                }
                                            } else {
                                                estadoLabel = 'Pausado (En Defensa)';
                                                estadoColor = '#f59e0b';
                                            }
                                        }

                                        return (
                                            <span style={{ color: estadoColor, fontWeight: 'bold' }}>{estadoLabel}</span>
                                        );
                                    })()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <select 
                                        value={assignedLawyers[p.id] || p.funcionarioAsignado || ''}
                                        onChange={(e) => handleLawyerChange(p.id, e.target.value)}
                                        disabled={userRole === 'Abogado'}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.4rem', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '4px',
                                            backgroundColor: userRole === 'Abogado' ? '#f3f4f6' : '#fff',
                                            cursor: userRole === 'Abogado' ? 'not-allowed' : 'pointer',
                                            color: userRole === 'Abogado' ? '#6b7280' : '#000'
                                        }}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {abogadosDisponibles.map(ab => <option key={ab} value={ab}>{ab}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button 
                                            className="btn btn-outline" 
                                            onClick={() => handleVerMandamiento(p)}
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        >
                                            <FileText size={14} /> Ver Mandamiento
                                        </button>
                                        <button 
                                            className="btn" 
                                            onClick={() => handleOpenNotificaciones(p)}
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                        >
                                            <Mail size={14} /> Notificaciones
                                        </button>
                                        <button 
                                            className="btn" 
                                            onClick={() => navigate('/embargo', { state: { procesoPreseleccionado: p } })}
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#10b981', color: 'white', border: 'none' }}
                                        >
                                            <CheckSquare size={14} /> Embargos y Medidas
                                        </button>
                                        <button 
                                            className="btn" 
                                            onClick={() => {
                                                const updated = { ...p, estadoProceso: 'EN DEFENSA DEL CONTRIBUYENTE', estado: 'EN DEFENSA DEL CONTRIBUYENTE', fechaDefensa: new Date().toISOString() };
                                                setProcesosExternos(updated);
                                                navigate('/defensa', { state: { procesoPreseleccionado: updated } });
                                            }}
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none' }}
                                        >
                                            <Search size={14} /> Defensa del Contribuyente
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '1rem', background: '#f9fafb', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {selectedForMassAction.length > 0 && (
                            <button className="btn" onClick={() => setShowMassNotifyModal(true)} style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Send size={18} /> Notificar Masivamente ({selectedForMassAction.length})
                            </button>
                        )}
                    </div>
                    {userRole === 'Administrador' && Object.keys(assignedLawyers).length > 0 && (
                        <button className="btn" onClick={handleSaveAssignments} style={{ backgroundColor: '#10b981' }}>
                            Guardar Cambios de Asignación
                        </button>
                    )}
                </div>
            </div>

            {selectedProceso && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 1000 
                }}>
                    <div className="card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button 
                            onClick={() => setSelectedProceso(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
                        >
                            &times;
                        </button>
                        <h2 style={{ marginBottom: '0.5rem' }}>Registro de Notificaciones</h2>
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Nombre</span>
                                    <div style={{ fontWeight: 'bold' }}>{selectedProceso.nombre}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Identificación</span>
                                    <div style={{ fontWeight: 'bold' }}>{selectedProceso.identificacion}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Consecutivo</span>
                                    <div style={{ color: '#4338ca', fontWeight: 'bold' }}>{selectedProceso.consecutivo}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            {[
                                { key: 'telefonica', icon: '📞', label: 'Telefónica' },
                                { key: 'personal', icon: '📬', label: 'Correo Certificado' },
                                { key: 'email', icon: '📧', label: 'Email' },
                                { key: 'whatsapp', icon: '💬', label: 'WhatsApp' },
                                { key: 'sms', icon: '📱', label: 'SMS' },
                                { key: 'formatoPersonal', icon: '📄', label: 'Formato Notif.' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        padding: '0.75rem 1.2rem', border: 'none',
                                        borderBottom: activeTab === tab.key ? '3px solid var(--color-primary)' : 'none',
                                        background: 'none', cursor: 'pointer',
                                        fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                                        color: activeTab === tab.key ? 'var(--color-primary)' : '#666',
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: '1rem 0' }}>
                            {renderTabContent()}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setSelectedProceso(null)}>Cerrar</button>
                            {activeTab === 'personal' ? (
                                <button className="btn" onClick={handleSaveNotificaciones} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>Guardar y enviar a Courier</button>
                            ) : (
                                <button className="btn" onClick={handleSaveNotificaciones}>Guardar Cambios</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Notificación Masiva */}
            {showMassNotifyModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '600px', maxWidth: '90vw' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Notificación Masiva</h2>
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Se enviará a {selectedForMassAction.length} expedientes seleccionados.</p>
                        
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Canal de Envío</label>
                            <select className="p-2" value={massNotifyType} onChange={e => setMassNotifyType(e.target.value)} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <option value="email">Correo Electrónico</option>
                                <option value="sms">SMS</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Plantilla Dinámica</label>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>Use variables: {'{Nombre}'}, {'{NIT}'}, {'{Radicado}'}</p>
                            <textarea 
                                className="p-2" 
                                value={massNotifyTemplate} 
                                onChange={e => setMassNotifyTemplate(e.target.value)} 
                                style={{ width: '100%', height: '100px', border: '1px solid #ccc', borderRadius: '4px' }} 
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowMassNotifyModal(false)}>Cancelar</button>
                            <button className="btn" onClick={handleExecuteMassNotify} style={{ backgroundColor: '#2563eb' }}>
                                Enviar Notificaciones
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Resultados Notificación Masiva */}
            {massNotifyResults && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
                    <div className="card" style={{ width: '650px', maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>📊 Resultado de Notificación Masiva</h2>
                            <button onClick={() => setMassNotifyResults(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{massNotifyResults.sent}</div>
                                <div style={{ color: '#065f46', fontWeight: '600' }}>✅ Enviados exitosamente</div>
                            </div>
                            <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{massNotifyResults.failed.length}</div>
                                <div style={{ color: '#991b1b', fontWeight: '600' }}>❌ Fallidos / Rebotados</div>
                            </div>
                        </div>
                        {massNotifyResults.failed.length > 0 && (
                            <>
                                <h3 style={{ margin: '0 0 0.75rem 0', color: '#dc2626', fontSize: '1rem' }}>Detalle de Registros Fallidos</h3>
                                <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Consecutivo</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nombre</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Error Técnico</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {massNotifyResults.failed.map((f, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #fee2e2' }}>
                                                    <td style={{ padding: '0.75rem', color: '#4338ca', fontWeight: 'bold' }}>{f.id}</td>
                                                    <td style={{ padding: '0.75rem' }}>{f.nombre}</td>
                                                    <td style={{ padding: '0.75rem', color: '#dc2626', fontSize: '0.8rem' }}>{f.error}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button className="btn" onClick={() => setMassNotifyResults(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
            {showAddLawyerModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Registro de Nuevo Abogado</h2>
                            <button onClick={() => setShowAddLawyerModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleRegisterLawyer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nombre Completo *</label>
                                <input type="text" className="p-2" value={regData.nombreCompleto} onChange={e => setRegData({...regData, nombreCompleto: e.target.value})} required style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Tipo ID</label>
                                    <select className="p-2" value={regData.tipoIdentificacion} onChange={e => setRegData({...regData, tipoIdentificacion: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }}>
                                        <option value="CC">Cédula</option>
                                        <option value="NIT">NIT</option>
                                    </select>
                                </div>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Número *</label>
                                    <input type="text" className="p-2" value={regData.numeroIdentificacion} onChange={e => setRegData({...regData, numeroIdentificacion: e.target.value})} required style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Correo Electrónico *</label>
                                <input type="email" className="p-2" value={regData.correoElectronico} onChange={e => setRegData({...regData, correoElectronico: e.target.value})} required style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Razón Social (Opcional)</label>
                                <input type="text" className="p-2" value={regData.razonSocial} onChange={e => setRegData({...regData, razonSocial: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Rol</label>
                                <select className="p-2" value={regData.rol} onChange={e => setRegData({...regData, rol: e.target.value})} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.3rem' }}>
                                    <option value="Abogado">Abogado / Funcionario</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                            <button type="submit" className="btn" style={{ marginTop: '1rem', width: '100%' }}>Registrar Abogado</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeguimientoView;
