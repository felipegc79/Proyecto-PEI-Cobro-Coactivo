import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

const IndicadorAsignacion = ({ area = 'Jurídica', funcionario = 'Funcionario Asignado' }) => {
    return (
        <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center', 
            padding: '0.6rem 1.2rem', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#3b82f6" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Área Responsable</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{area}</strong>
                </div>
            </div>
            
            <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="#6366f1" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Funcionario</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{funcionario}</strong>
                </div>
            </div>
        </div>
    );
};

export default IndicadorAsignacion;
