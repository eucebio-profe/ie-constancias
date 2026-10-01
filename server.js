const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const { generarConstanciaPDF } = require('./services/pdfService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== RUTAS DE LA API =====

// Obtener información de la institución
app.get('/api/institucion', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM instituciones LIMIT 1');
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró información de la institución' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener institución:', error);
        res.status(500).json({ error: 'Error al obtener información de la institución' });
    }
});

// Buscar estudiante por documento
app.get('/api/estudiantes/buscar', async (req, res) => {
    try {
        const { documento } = req.query;
        if (!documento) {
            return res.status(400).json({ error: 'El número de documento es requerido' });
        }

        const [rows] = await pool.query(`
            SELECT 
                e.*,
                m.id as matricula_id,
                m.anio_escolar,
                m.seccion,
                m.estado as estado_matricula,
                m.fecha_matricula,
                g.nombre as grado_nombre,
                g.nivel_id,
                n.nombre as nivel_nombre
            FROM estudiantes e
            LEFT JOIN matriculas m ON e.id = m.estudiante_id AND m.estado = 'activo'
            LEFT JOIN grados g ON m.grado_id = g.id
            LEFT JOIN niveles n ON g.nivel_id = n.id
            WHERE e.numero_documento = ?
        `, [documento]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró ningún estudiante con ese documento' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al buscar estudiante:', error);
        res.status(500).json({ error: 'Error al buscar estudiante' });
    }
});

// Obtener todos los estudiantes (con paginación)
app.get('/api/estudiantes', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(`
            SELECT 
                e.*,
                g.nombre as grado_nombre,
                n.nombre as nivel_nombre,
                m.anio_escolar,
                m.seccion
            FROM estudiantes e
            LEFT JOIN matriculas m ON e.id = m.estudiante_id AND m.estado = 'activo'
            LEFT JOIN grados g ON m.grado_id = g.id
            LEFT JOIN niveles n ON g.nivel_id = n.id
            ORDER BY e.apellido_paterno, e.apellido_materno
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [countRows] = await pool.query('SELECT COUNT(*) as total FROM estudiantes');
        const total = countRows[0].total;

        res.json({
            estudiantes: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
});

// Generar constancia de estudio
app.post('/api/constancias/generar', async (req, res) => {
    try {
        const { estudiante_id, motivo } = req.body;

        if (!estudiante_id) {
            return res.status(400).json({ error: 'El ID del estudiante es requerido' });
        }

        // Obtener datos del estudiante con matrícula activa
        const [estudiantes] = await pool.query(`
            SELECT 
                e.*,
                m.id as matricula_id,
                m.anio_escolar,
                m.seccion,
                m.estado as estado_matricula,
                g.nombre as grado_nombre,
                g.nivel_id,
                n.nombre as nivel_nombre
            FROM estudiantes e
            INNER JOIN matriculas m ON e.id = m.estudiante_id AND m.estado = 'activo'
            INNER JOIN grados g ON m.grado_id = g.id
            INNER JOIN niveles n ON g.nivel_id = n.id
            WHERE e.id = ?
        `, [estudiante_id]);

        if (estudiantes.length === 0) {
            return res.status(404).json({ error: 'No se encontró el estudiante o no tiene matrícula activa' });
        }

        const estudiante = estudiantes[0];

        // Obtener información de la institución
        const [instituciones] = await pool.query('SELECT * FROM instituciones LIMIT 1');
        const institucion = instituciones[0];

        // Generar código único de constancia
        const codigoConstancia = `C-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Crear objetos con la estructura correcta para el PDF
        const matriculaData = {
            anio_escolar: estudiante.anio_escolar,
            seccion: estudiante.seccion,
            estado: estudiante.estado_matricula
        };

        const gradoData = {
            nombre: estudiante.grado_nombre,
            nivel_nombre: estudiante.nivel_nombre
        };

        // Generar PDF
        const pdfResult = await generarConstanciaPDF(
            estudiante,
            matriculaData,
            gradoData,
            institucion,
            codigoConstancia
        );

        // Guardar registro en la base de datos
        await pool.query(
            'INSERT INTO constancias (matricula_id, codigo_constancia, motivo, emitido_por, archivo_path) VALUES (?, ?, ?, ?, ?)',
            [estudiante.matricula_id, codigoConstancia, motivo || 'Solicitud de constancia', 'Sistema de Constancias', pdfResult.rutaArchivo]
        );

        res.json({
            success: true,
            mensaje: 'Constancia generada exitosamente',
            codigo: codigoConstancia,
            pdf: pdfResult.rutaArchivo
        });

    } catch (error) {
        console.error('Error al generar constancia:', error);
        res.status(500).json({ error: 'Error al generar la constancia' });
    }
});

// Descargar constancia por código
app.get('/api/constancias/descargar/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM constancias WHERE codigo_constancia = ?',
            [codigo]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Constancia no encontrada' });
        }

        // Incrementar contador de descargas
        await pool.query(
            'UPDATE constancias SET descargas = descargas + 1 WHERE codigo_constancia = ?',
            [codigo]
        );

        res.json({
            success: true,
            constancia: rows[0]
        });
    } catch (error) {
        console.error('Error al descargar constancia:', error);
        res.status(500).json({ error: 'Error al descargar la constancia' });
    }
});

// Obtener estadísticas
app.get('/api/estadisticas', async (req, res) => {
    try {
        const [totalEstudiantes] = await pool.query('SELECT COUNT(*) as total FROM estudiantes');
        const [totalMatriculas] = await pool.query("SELECT COUNT(*) as total FROM matriculas WHERE estado = 'activo'");
        const [totalConstancias] = await pool.query('SELECT COUNT(*) as total FROM constancias');

        res.json({
            totalEstudiantes: totalEstudiantes[0].total,
            totalMatriculasActivas: totalMatriculas[0].total,
            totalConstanciasEmitidas: totalConstancias[0].total
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Ruta principal - servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎓 Sistema de Constancias - Institución Educativa     ║
║                                                          ║
║   ✅ Servidor corriendo en: http://localhost:${PORT}        ║
║   📁 API disponible en: http://localhost:${PORT}/api        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
});
