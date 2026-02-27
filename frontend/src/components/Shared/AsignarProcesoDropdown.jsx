import React, { useState } from 'react';

const AsignarProcesoDropdown = () => {
    const [selectedArea, setSelectedArea] = useState('');

    const handleAssign = (e) => {
        const value = e.target.value;
        setSelectedArea(value);

        if (value) {
            // Simulate sending email notification
            alert(`Simulación: Se ha enviado una notificación por correo a ${value} asignando el proceso.`);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="asignar-area" style={{ fontWeight: '500', color: 'inherit' }}>
                Asignar Proceso a:
            </label>
            <select
                id="asignar-area"
                value={selectedArea}
                onChange={handleAssign}
                style={{ width: '200px', padding: '0.5rem', color: 'var(--color-text)' }}
            >
                <option value="">-- Seleccionar --</option>
                <option value="Dirección Jurídica">Dirección Jurídica</option>
                <option value="Recaudos">Recaudos</option>
                <option value="Fiscalización">Fiscalización</option>
                <option value="Comité de Cartera">Comité de Cartera</option>
            </select>
        </div>
    );
};

export default AsignarProcesoDropdown;
