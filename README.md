# 🎓 Sistema de Constancias de Estudio - Institución Educativa

Sistema web para la generación de constancias de estudio en PDF para estudiantes matriculados.

## 📋 Características

- ✅ Base de datos MySQL para gestión de estudiantes y matrículas
- ✅ Búsqueda de estudiantes por número de documento
- ✅ Generación automática de constancias de estudio en PDF
- ✅ Código único de verificación para cada constancia
- ✅ Interfaz web moderna y responsive
- ✅ Estadísticas en tiempo real

## 🚀 Instalación

### Requisitos Previos

- [Node.js](https://nodejs.org/) v16 o superior
- [MySQL](https://www.mysql.com/) v5.7 o superior
- [npm](https://www.npmjs.com/) (incluido con Node.js)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   cd ie-constancias
   npm install
   ```

3. **Configurar la base de datos**
   
   Crear la base de datos ejecutando el script SQL:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   
   O manualmente en MySQL:
   ```sql
   SOURCE database/schema.sql;
   ```

4. **Configurar variables de entorno**
   
   Editar el archivo `.env` con tus credenciales:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=ie_constancias
   PORT=3000
   ```

5. **Iniciar el servidor**
   ```bash
   npm start
   ```
   
   Para desarrollo con recarga automática:
   ```bash
   npm run dev
   ```

6. **Acceder al sistema**
   
   Abrir en el navegador: http://localhost:3000

## 📁 Estructura del Proyecto

```
ie-constancias/
├── config/
│   └── db.js              # Configuración de conexión MySQL
├── database/
│   └── schema.sql         # Script de base de datos
├── public/
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos CSS
│   ├── app.js             # Lógica del frontend
│   └── pdfs/              # PDFs generados (se crea automáticamente)
├── services/
│   └── pdfService.js      # Servicio de generación de PDF
├── server.js              # Servidor Express
├── package.json           # Dependencias del proyecto
├── .env                   # Variables de entorno
└── README.md              # Este archivo
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/institucion` | Obtener información de la IE |
| GET | `/api/estudiantes` | Listar estudiantes (paginado) |
| GET | `/api/estudiantes/buscar?documento={doc}` | Buscar estudiante por documento |
| POST | `/api/constancias/generar` | Generar nueva constancia |
| GET | `/api/constancias/descargar/{codigo}` | Descargar constancia |
| GET | `/api/estadisticas` | Obtener estadísticas del sistema |

## 📝 Uso

1. **Buscar estudiante**: Ingrese el número de documento y presione "Buscar"
2. **Verificar información**: Revise los datos del estudiante encontrado
3. **Generar constancia**: Presione "Generar Constancia PDF"
4. **Descargar**: Descargue el PDF generado

## 🔧 Personalización

### Datos de la Institución
Editar la tabla `instituciones` en la base de datos con los datos reales de su IE.

### Diseño del PDF
Modificar `services/pdfService.js` para personalizar el diseño de la constancia.

### Niveles y Grados
Agregar más niveles y grados en las tablas correspondientes del schema SQL.

## 📄 Licencia

Este proyecto es de uso educativo y puede ser modificado según las necesidades de su institución.

## 🤝 Soporte

Para problemas o sugerencias, revisar la documentación o crear un issue en el repositorio.
