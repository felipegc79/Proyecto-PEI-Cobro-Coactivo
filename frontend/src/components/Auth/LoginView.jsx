import React, { useState } from 'react';
import logo from '../../logo-ada.png';

const LoginView = ({ onLogin }) => {
    const [view, setView] = useState('login'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Campos de Registro
    const [regData, setRegData] = useState({
        nombreCompleto: '',
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '',
        correoElectronico: '',
        razonSocial: '',
        rol: 'Abogado'
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert('Por favor ingrese usuario y contraseña');
            return;
        }

        // Recuperar usuarios registrados de localStorage
        const users = JSON.parse(localStorage.getItem('coactivo_users') || '[]');
        const foundUser = users.find(u => u.username === username);

        if (foundUser) {
            onLogin(foundUser.rol, foundUser.nombreCompleto || username);
        } else if (username.includes('admin')) {
            onLogin('Administrador', username);
        } else {
            onLogin('Abogado', username);
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        const { nombreCompleto, tipoIdentificacion, numeroIdentificacion, correoElectronico, razonSocial, rol } = regData;
        if (!nombreCompleto || !numeroIdentificacion || !correoElectronico) {
            alert('Por favor complete los campos obligatorios.');
            return;
        }

        // Crear usuario dinamico (primer nombre + ultimos 3 numeros de id)
        const primerNombre = nombreCompleto.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const ultimosDigitos = numeroIdentificacion.slice(-3);
        const dynamicUsername = `${primerNombre}${ultimosDigitos}`;
        
        // Guardar en localStorage
        const users = JSON.parse(localStorage.getItem('coactivo_users') || '[]');
        users.push({ username: dynamicUsername, rol: rol, nombreCompleto: nombreCompleto });
        localStorage.setItem('coactivo_users', JSON.stringify(users));

        // Mensaje de aprobacion pendiente
        alert(`Su usuario dinámico generado es: ${dynamicUsername}\nContraseña temporal asignada: 123456\n\nSe ha enviado un correo electrónico al administrador (luisfelipegc79@gmail.com) del aplicativo para la aprobación del usuario.`);

        // Simular que el admin aprueba despues de 4 segundos
        setTimeout(() => {
            alert(`¡Notificación del Sistema!\n\nEl administrador ha aprobado la creación de su usuario.\nAhora tiene acceso al sistema con el usuario: ${dynamicUsername} y rol: ${rol}`);
            setUsername(dynamicUsername);
            setPassword('123456');
            setView('login');
        }, 4000);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.8rem 1rem',
        border: '1px solid #dcdde1',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box'
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#f5f7fa',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem',
            boxSizing: 'border-box'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <img src={logo} alt="Logo ADA" style={{ height: '80px', marginBottom: '2rem' }} />
                
                {view === 'login' ? (
                    <>
                        <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Iniciar Sesión</h2>
                        <p style={{ color: '#7f8c8d', marginBottom: '2rem', fontSize: '0.9rem' }}>Sistema de Cobro Coactivo</p>

                        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Usuario (ej: admin o abogado)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '1rem',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-primary-dark)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                            >
                                Entrar al Sistema
                            </button>
                        </form>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                            ¿No tienes cuenta? <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setView('register')}>Regístrate aquí</span>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Registro de Usuario</h2>
                        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Solicitar acceso al sistema</p>

                        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>Nombre Completo *</label>
                                <input type="text" style={inputStyle} value={regData.nombreCompleto} onChange={e => setRegData({...regData, nombreCompleto: e.target.value})} required />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>Tipo ID</label>
                                    <select style={inputStyle} value={regData.tipoIdentificacion} onChange={e => setRegData({...regData, tipoIdentificacion: e.target.value})}>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="NIT">NIT</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                    </select>
                                </div>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>Número de Identificación *</label>
                                    <input type="text" style={inputStyle} value={regData.numeroIdentificacion} onChange={e => setRegData({...regData, numeroIdentificacion: e.target.value})} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>Correo Electrónico *</label>
                                <input type="email" style={inputStyle} value={regData.correoElectronico} onChange={e => setRegData({...regData, correoElectronico: e.target.value})} required />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>Razón Social (Opcional)</label>
                                <input type="text" style={inputStyle} value={regData.razonSocial} onChange={e => setRegData({...regData, razonSocial: e.target.value})} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#333' }}>Rol Solicitado</label>
                                <select style={inputStyle} value={regData.rol} onChange={e => setRegData({...regData, rol: e.target.value})}>
                                    <option value="Abogado">Abogado / Funcionario</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginTop: '1rem',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                Registrar Usuario
                            </button>
                        </form>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                            ¿Ya tienes cuenta? <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setView('login')}>Vuelve al Login</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginView;
