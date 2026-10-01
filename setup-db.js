const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Cargar .env manualmente
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
            process.env[key.trim()] = value;
        }
    }
});

async function setupDatabase() {
    let connection;
    try {
        console.log('Conectando a MySQL...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Conectado a MySQL');

        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        // Eliminar comentarios
        const lines = schemaSQL.split('\n');
        const cleanLines = lines.filter(line => !line.trim().startsWith('--'));
        const cleanSQL = cleanLines.join('\n');

        // Dividir por ; al final de línea (manejo de sentencias multi-línea)
        const statements = [];
        let currentStatement = '';

        for (const line of cleanLines) {
            currentStatement += line + '\n';
            if (line.trim().endsWith(';')) {
                const trimmed = currentStatement.trim();
                if (trimmed.length > 0) {
                    statements.push(trimmed);
                }
                currentStatement = '';
            }
        }

        // Agregar la última sentencia si no termina con ;
        const lastTrimmed = currentStatement.trim();
        if (lastTrimmed.length > 0) {
            statements.push(lastTrimmed);
        }

        console.log('Ejecutando ' + statements.length + ' sentencias SQL...');

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                await connection.query(statement);
                console.log('  [' + (i + 1) + '/' + statements.length + '] OK');
            } catch (err) {
                if (err.code === 'ER_DB_CREATE_EXISTS' || err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
                    console.log('  [' + (i + 1) + '/' + statements.length + '] Ya existe (omitido)');
                } else {
                    console.error('  [' + (i + 1) + '/' + statements.length + '] Error: ' + err.message);
                }
            }
        }

        console.log('\nBase de datos lista!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
