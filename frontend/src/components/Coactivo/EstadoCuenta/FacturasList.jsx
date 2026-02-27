import React from 'react';
import FacturaCard from './FacturaCard';

const FacturasList = ({ facturas, seleccionadas, onSelect }) => {
    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Estado de Cuenta: Obligaciones en Mora
            </h3>

            {/* Contenedor con scroll vertical para evitar layout sucio */}
            <div
                className="scroll-container"
                style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem'
                }}
            >
                {facturas.map(factura => (
                    <FacturaCard
                        key={factura.id}
                        factura={factura}
                        isSelected={seleccionadas.includes(factura.id)}
                        onSelect={onSelect}
                    />
                ))}
                {facturas.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                        No hay facturas en mora para el contribuyente.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FacturasList;
