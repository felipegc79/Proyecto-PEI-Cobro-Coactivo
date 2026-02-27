import React from 'react';

const BotonesAccion = ({ onAprobar, onRechazar, onGenerarPDF }) => {
    return (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', justifyContent: 'center' }}>
            <button
                className="btn btn-outline"
                onClick={onRechazar}
                style={{ color: '#d32f2f', borderColor: '#d32f2f' }}
            >
                Rechazar Mandamiento
            </button>
            <button
                className="btn btn-outline"
                onClick={onGenerarPDF}
            >
                Previsualizar PDF
            </button>
            <button
                className="btn"
                onClick={onAprobar}
            >
                Aprobar Mandamiento
            </button>
        </div>
    );
};

export default BotonesAccion;
