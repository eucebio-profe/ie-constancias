const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ie_constancias',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
pool.getConnection()
    .then(conn => {
        console.log('✅ Conexión a MySQL establecida correctamente');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a MySQL:', err.message);
        console.log('💡 Asegúrate de que MySQL esté corriendo y las credenciales sean correctas');
    });

module.exports = pool;
