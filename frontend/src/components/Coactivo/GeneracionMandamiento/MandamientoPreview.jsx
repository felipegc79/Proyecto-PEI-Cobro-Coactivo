import React, { useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const MandamientoPDFContent = React.forwardRef(({ deudor, facturas, resolucionNum, totalDeuda, fechaFormat }, ref) => {
    return (
        <div ref={ref} style={{ padding: '60px', fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.5', color: '#000', backgroundColor: 'white', width: '800px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontWeight: '900', fontSize: '36px', letterSpacing: '-2px', fontStyle: 'italic', lineHeight: '1' }}>ST</div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', borderTop: '2px solid black', paddingTop: '2px' }}>SuperTransporte</div>
                </div>
                <div style={{ fontSize: '9px', textAlign: 'right', lineHeight: '1.2' }}>
                    <strong>Portal Web:</strong> www.supertransporte.gov.co<br />
                    <strong>Sede Administrativa:</strong> Diagonal 25G No. 95A-85, Bogotá, D.C.<br />
                    <strong>PBX:</strong> 352 67 00<br />
                    <strong>Correspondencia:</strong> Diagonal 25G No. 95A-85, Bogotá, D.C.<br />
                    <strong>Línea Atención al Ciudadano:</strong> 01 8000 915615
                </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '15px' }}>SUPERINTENDENCIA DE TRANSPORTE<br />JURISDICCIÓN COACTIVA</p>
                <p style={{ margin: '20px 0 0 0', fontSize: '14px' }}>Mandamiento de Pago No {resolucionNum}<br />Bogotá, D.C. {fechaFormat}.</p>
            </div>

            {/* Body */}
            <div>
                <p style={{ textAlign: 'justify', marginBottom: '30px' }}>
                    Por el cual se libra mandamiento de pago a favor de la Superintendencia de Transporte y en contra de la sociedad <strong>{deudor.nombre.toUpperCase()}</strong>, identificada con Nit. <strong>{deudor.identificacion}</strong>.
                </p>

                <div style={{ marginBottom: '30px', paddingLeft: '20px' }}>
                    Resolución No: 17086 del 14/12/2021<br />
                    Obligación: {facturas.map(f => f.id).join(', ')}<br />
                    Fecha Ejecutoria: 1/02/2022<br />
                    Valor de la obligación: <strong>$ {totalDeuda.toLocaleString('es-CO')}</strong>
                </div>

                <p style={{ textAlign: 'justify', marginBottom: '30px' }}>
                    Acto Administrativo que presta mérito ejecutivo de conformidad con el artículo 98 y 99 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo – C.P.A.C.A. (Ley 1437 del 2011), el artículo 828 del Estatuto Tributario, y la Ley 1066 del 29 de julio de 2006; en concordancia con la Resolución 1871 del 13 de junio de 2022 por medio de la cual se adopta el Manual de Gestión de Recaudo de Cartera de la Superintendencia de Transporte; previo a los anteriores antecedentes.
                </p>

                <p style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>MANDAMIENTO EJECUTIVO</p>

                <p style={{ textAlign: 'justify', marginBottom: '15px' }}>
                    <strong>ARTÍCULO PRIMERO:</strong> Librar Mandamiento de pago por la vía administrativa de cobro ejecutivo por Jurisdicción Coactiva a favor de la Superintendencia de Transporte y en contra de la sociedad <strong>{deudor.nombre.toUpperCase()}</strong>, identificada con Nit. <strong>{deudor.identificacion}</strong>, por las siguientes sumas de dinero:
                </p>
                <div style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                    Resolución No: 17086 del 14/12/2021<br />
                    Obligación: {facturas.map(f => f.id).join(', ')}<br />
                    Fecha Ejecutoria: 1/02/2022<br />
                    Valor de la obligación: <strong>$ {totalDeuda.toLocaleString('es-CO')}</strong>
                </div>
                <div style={{ paddingLeft: '40px', marginBottom: '30px', fontStyle: 'italic', fontWeight: 'bold' }}>
                    ➢ más los intereses que sigan causando hasta cuando se efectúe el pago
                </div>

                <p style={{ textAlign: 'justify', marginBottom: '30px' }}>
                    <strong>ARTICULO SEGUNDO:</strong> Notifíquese a la sociedad <strong>{deudor.nombre.toUpperCase()}</strong>, identificada con Nit. <strong>{deudor.identificacion}</strong>, por intermedio del Grupo de notificaciones de la Entidad a la dirección electrónica <u><span style={{ color: '#0563c1' }}>notificaciones@{deudor.identificacion}.com.co</span></u> de conformidad con lo dispuesto en el artículo 8 de la ley 2213 del 13 de junio de 2022, y el artículo 826 del Estatuto Tributario, para que dentro del término de quince (15) días siguientes a la notificación del presente acto, pague la suma que se cobra más los intereses causados. El pago deberá realizarse accediendo al aplicativo Consola Taux, bajo las modalidades, PSE o descargue de cupón para pago en punto físico.
                </p>

                <p style={{ textAlign: 'justify', marginBottom: '30px' }}>
                    <strong>ARTÍCULO TERCERO:</strong> Contra el presente acto, podrán interponerse las excepciones consagradas en el artículo 831 del Estatuto Tributario Nacional dentro de los quince (15) días siguientes a la notificación del Mandamiento, expresando los hechos en que se funde.
                </p>

                <p style={{ textAlign: 'justify', marginBottom: '40px' }}>
                    <strong>ARTICULO CUARTO:</strong> Líbrense los oficios correspondientes.
                </p>

                <p style={{ textAlign: 'center', marginBottom: '60px', fontWeight: 'bold' }}>NOTIFÍQUESE Y CUMPLASE</p>

                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '40px', marginBottom: '10px', transform: 'rotate(-5deg)' }}>J. Samir A.</div>
                    <strong>Jhohan Samir Abdlah Rubiano</strong><br />
                    Coordinador Grupo Cobro por Jurisdicción Coactiva
                </div>

                <div style={{ fontSize: '10px', color: '#555' }}>
                    <p style={{ margin: '2px 0' }}>Proyectó: John J Riascos U</p>
                    <p style={{ margin: '2px 0' }}>Referencia Interna: https://supertransporte.gov.co/documentos/Mandamiento_{deudor.identificacion}.docx</p>
                </div>
            </div>
        </div>
    );
});

const MandamientoPreview = () => {
    // This file was overridden. It is no longer used directly in this generic way.
    // We will render it directly inside AperturaView as a hidden element to generate PDF.
    return null;
}

export { MandamientoPDFContent };
export default MandamientoPreview;
