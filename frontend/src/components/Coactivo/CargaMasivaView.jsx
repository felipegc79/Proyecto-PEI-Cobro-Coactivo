import React from 'react';

const CargaMasivaView = () => {
    return (
        <div>
            <h1 className="page-title" style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
                Cargar Excel a Base de Datos
            </h1>

            <div className="card" style={{ padding: '0', display: 'flex', justifyContent: 'center', backgroundColor: 'transparent', boxShadow: 'none' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '800px',
                    border: '2px dashed #b0bec5',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    padding: '4rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {/* Mockup Icon for Excel / File */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <svg width="60" height="80" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', color: '#37474f', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Arrastra tu archivo Excel aquí
                    </h2>
                    <p style={{ color: '#78909c', marginBottom: '2rem', fontSize: '1rem' }}>
                        o haz clic para seleccionar desde tu ordenador
                    </p>

                    <button style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        padding: '0.8rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-primary-dark)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                        onClick={() => alert('Abrir selector de archivos...')}
                    >
                        Seleccionar Archivo
                    </button>

                    <div style={{ fontSize: '0.85rem', color: '#90a4ae' }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>Formatos soportados: .xlsx, .csv</p>
                        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-primary)' }}>Tamaño máximo permitido: 500 MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CargaMasivaView;
