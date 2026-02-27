import React, { useState } from 'react';

const BuscadorDeudor = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    // Mock Database from Jan 2024 to Feb 2026
    const mockDatabase = Array.from({ length: 50 }).map((_, i) => {
        const year = 2024 + Math.floor(Math.random() * 3); // 2024, 2025, 2026
        let month = Math.floor(Math.random() * 12) + 1;
        if (year === 2026) month = Math.floor(Math.random() * 2) + 1; // max Feb 2026
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`;

        const isCompany = Math.random() > 0.6;
        const id = isCompany ? `900${Math.floor(100000 + Math.random() * 900000)}` : `${Math.floor(10000000 + Math.random() * 90000000)}`;
        const name = isCompany ? `Empresa ${['Soluciones', 'Transporte', 'Logística', 'Comercial', 'Andina'][Math.floor(Math.random() * 5)]} S.A.S` : `${['Juan', 'Maria', 'Pedro', 'Diana', 'Carlos'][Math.floor(Math.random() * 5)]} ${['Perez', 'Gomez', 'Rodriguez', 'Lopez'][Math.floor(Math.random() * 4)]}`;

        return {
            id: i.toString(),
            identificacion: id,
            nombre: name,
            direccion: `Calle ${Math.floor(Math.random() * 100) + 1} # ${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}`,
            ciudad: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'][Math.floor(Math.random() * 5)],
            estadoProceso: Math.random() > 0.5 ? 'En Embargo' : 'Apertura',
            fechaInicio: dateStr
        };
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            console.log('Buscando deudor con RUT o Nombre:', query);
            const found = mockDatabase.find(d => d.identificacion === query || d.nombre.toLowerCase().includes(query.toLowerCase()));

            if (found) {
                onSearch(found);
            } else {
                // Return a generic one if not found in random DB, to not block the user
                onSearch({
                    id: '999',
                    identificacion: query,
                    nombre: query.includes('9') ? 'Empresa Ficticia S.A.S' : 'Deudor Ficticio',
                    direccion: 'Avenida Siempre Viva 123',
                    ciudad: 'Bogotá',
                    estadoProceso: 'Apertura',
                    fechaInicio: '2025-01-10'
                });
            }
        }
    };

    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                Buscador de Contribuyentes
            </h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Buscar por identificación o nombre..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn" style={{ padding: '0.75rem 1.5rem' }}>
                    Consultar Deudor
                </button>
            </form>
        </div>
    );
};

export default BuscadorDeudor;
