const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const PDF_DIR = path.join(__dirname, '..', 'public', 'pdfs');

// Crear directorio si no existe
if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
}

function generarConstanciaPDF(estudiante, matricula, grado, institucion, codigoConstancia) {
    return new Promise((resolve, reject) => {
        const nombreArchivo = `constancia_${codigoConstancia}.pdf`;
        const rutaArchivo = path.join(PDF_DIR, nombreArchivo);

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 60, right: 60 }
        });

        const stream = fs.createWriteStream(rutaArchivo);
        doc.pipe(stream);

        // ===== ENCABEZADO =====
        // Línea superior decorativa
        doc.rect(50, 40, 515, 3).fill('#1a5276');

        // Título de la institución
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a5276')
            .text(institucion.nombre.toUpperCase(), { align: 'center' });
        doc.fontSize(8).font('Helvetica').fillColor('#555555')
            .text(institucion.direccion || '', { align: 'center' });
        doc.text(`Teléfono: ${institucion.telefono || 'N/A'} | Email: ${institucion.email || 'N/A'}`, { align: 'center' });

        doc.moveDown(2);

        // Línea decorativa bajo el encabezado
        doc.rect(150, doc.y, 270, 1).fill('#1a5276');
        doc.moveDown(1);

        // ===== TÍTULO DEL DOCUMENTO =====
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a5276')
            .text('CONSTANCIA DE ESTUDIO', { align: 'characterSpacing', characterSpacing: 2 });
        
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#666666')
            .text(`Código: ${codigoConstancia}`, { align: 'right' });
        
        doc.moveDown(2);

        // Línea separadora
        doc.rect(60, doc.y, 450, 0.5).fill('#cccccc');
        doc.moveDown(1);

        // ===== CUERPO DE LA CONSTANCIA =====
        doc.fontSize(11).font('Helvetica').fillColor('#333333');

        const textoPrincipal = `Por medio de la presente, se deja constancia que el/la estudiante `;

        doc.text(textoPrincipal, { align: 'justify' });
        
        doc.moveDown(1);

        // Datos del estudiante destacados
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a5276');
        doc.text(`${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`, 
            { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').fillColor('#666666');
        doc.text(`${estudiante.tipo_documento}: ${estudiante.numero_documento}`, { align: 'center' });

        doc.moveDown(1.5);

        doc.fontSize(11).font('Helvetica').fillColor('#333333');
        
        const anioTexto = matricula.anio_escolar ? `durante el año escolar ${matricula.anio_escolar}` : 'en el año escolar en curso';
        const seccionTexto = matricula.seccion ? ` sección "${matricula.seccion}"` : '';
        
        const cuerpoTexto = `se encuentra debidamente matriculado/a en esta institución educativa ${anioTexto}, cursando el grado de ${grado.nombre} de ${grado.nivel_nombre}${seccionTexto}, con estado "${matricula.estado}" en el sistema académico de la institución.`;

        doc.text(cuerpoTexto, { align: 'justify', indent: 0 });

        doc.moveDown(2);

        // ===== INFORMACIÓN ADICIONAL =====
        doc.fontSize(11).font('Helvetica').fillColor('#333333');
        doc.text('Esta constancia se expide a solicitud del interesado(a) y/o apoderado(a) para los fines que estime conveniente.', { align: 'justify' });

        doc.moveDown(2);

        // Fecha de emisión
        const fecha = new Date();
        const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = fecha.toLocaleDateString('es-PE', opcionesFecha);
        
        doc.fontSize(11).font('Helvetica').fillColor('#333333');
        doc.text(`Lima, ${fechaFormateada}`, { align: 'left' });

        doc.moveDown(4);

        // ===== FIRMAS =====
        const firmaY = doc.y;
        
        // Línea de firma izquierda
        doc.moveTo(80, firmaY).lineTo(250, firmaY).lineWidth(0.5).strokeColor('#333333').stroke();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333')
            .text('DIRECTOR/A', { align: 'center', width: 170, indent: 0 });
        doc.fontSize(8).font('Helvetica').fillColor('#666666')
            .text(institucion.nombre, { align: 'center', width: 170, indent: 0 });

        // Línea de firma derecha
        doc.moveTo(350, firmaY).lineTo(520, firmaY).lineWidth(0.5).strokeColor('#333333').stroke();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333')
            .text('SECRETARIA ACADÉMICA', { align: 'center', width: 170, indent: 350, absoluteX: 350 });
        doc.fontSize(8).font('Helvetica').fillColor('#666666')
            .text(institucion.nombre, { align: 'center', width: 170, indent: 350, absoluteX: 350 });

        doc.moveDown(3);

        // ===== PIE DE PÁGINA =====
        // Línea inferior decorativa
        const pageHeight = doc.page.height;
        doc.rect(50, pageHeight - 60, 515, 3).fill('#1a5276');

        doc.fontSize(7).font('Helvetica').fillColor('#888888')
            .text(`Documento generado electrónicamente | Código de verificación: ${codigoConstancia}`, 
                { align: 'center', absoluteY: pageHeight - 50 });

        doc.fontSize(7).font('Helvetica').fillColor('#888888')
            .text(`Fecha de generación: ${fecha.toLocaleString('es-PE')} | Este documento es válido con la firma y sello de la institución`, 
                { align: 'center', absoluteY: pageHeight - 40 });

        doc.end();

        stream.on('finish', () => {
            resolve({
                nombreArchivo,
                rutaArchivo: `/pdfs/${nombreArchivo}`,
                rutaFisica: rutaArchivo
            });
        });

        stream.on('error', reject);
    });
}

module.exports = { generarConstanciaPDF };
