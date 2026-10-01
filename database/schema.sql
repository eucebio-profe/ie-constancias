-- =====================================================
-- Base de datos para Institución Educativa - Constancias
-- =====================================================

CREATE DATABASE IF NOT EXISTS ie_constancias
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ie_constancias;

-- Tabla de Instituciones Educativas
CREATE TABLE IF NOT EXISTS instituciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo_modular VARCHAR(20) UNIQUE,
    direccion VARCHAR(300),
    distrito VARCHAR(100),
    provincia VARCHAR(100),
    departamento VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    logo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Niveles educativos
CREATE TABLE IF NOT EXISTS niveles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Primaria, Secundaria
    descripcion VARCHAR(200)
) ENGINE=InnoDB;

-- Tabla de Grados
CREATE TABLE IF NOT EXISTS grados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nivel_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL, -- 1ro, 2do, etc.
    descripcion VARCHAR(100),
    FOREIGN KEY (nivel_id) REFERENCES niveles(id)
) ENGINE=InnoDB;

-- Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(10) NOT NULL DEFAULT 'DNI',
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    fecha_nacimiento DATE,
    genero ENUM('M', 'F'),
    direccion VARCHAR(300),
    telefono VARCHAR(20),
    email VARCHAR(100),
    institucion_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (institucion_id) REFERENCES instituciones(id)
) ENGINE=InnoDB;

-- Tabla de Matrículas
CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    grado_id INT NOT NULL,
    anio_escolar INT NOT NULL,
    seccion VARCHAR(5),
    estado ENUM('activo', 'retirado', 'trasladado', 'egresado') DEFAULT 'activo',
    fecha_matricula DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (grado_id) REFERENCES grados(id),
    UNIQUE KEY unique_matricula (estudiante_id, grado_id, anio_escolar)
) ENGINE=InnoDB;

-- Tabla de Constancias generadas
CREATE TABLE IF NOT EXISTS constancias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula_id INT NOT NULL,
    codigo_constancia VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(200),
    emitido_por VARCHAR(150),
    archivo_path VARCHAR(255),
    descargas INT DEFAULT 0,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id)
) ENGINE=InnoDB;

-- =====================================================
-- Datos de ejemplo
-- =====================================================

INSERT INTO instituciones (nombre, codigo_modular, direccion, distrito, provincia, departamento, telefono, email)
VALUES (
    'Institución Educativa San José',
    '1234567',
    'Av. Principal 123',
    'San Juan de Miraflores',
    'Lima',
    'Lima',
    '01-2345678',
    'info@iesanjose.edu.pe'
);

INSERT INTO niveles (nombre, descripcion) VALUES
('Primaria', 'Educación Primaria'),
('Secundaria', 'Educación Secundaria');

INSERT INTO grados (nivel_id, nombre, descripcion) VALUES
(1, '1ro', '1er Grado de Primaria'),
(1, '2do', '2do Grado de Primaria'),
(1, '3ro', '3er Grado de Primaria'),
(1, '4to', '4to Grado de Primaria'),
(1, '5to', '5to Grado de Primaria'),
(1, '6to', '6to Grado de Primaria'),
(2, '1ro', '1er Grado de Secundaria'),
(2, '2do', '2do Grado de Secundaria'),
(2, '3ro', '3er Grado de Secundaria'),
(2, '4to', '4to Grado de Secundaria'),
(2, '5to', '5to Grado de Secundaria');

-- Estudiantes de ejemplo
INSERT INTO estudiantes (tipo_documento, numero_documento, apellido_paterno, apellido_materno, nombres, fecha_nacimiento, genero, direccion, institucion_id) VALUES
('DNI', '12345678', 'García', 'López', 'María Fernanda', '2012-03-15', 'F', 'Jr. Los Pinos 456', 1),
('DNI', '23456789', 'Rodríguez', 'Pérez', 'José Luis', '2011-07-22', 'M', 'Av. Central 789', 1),
('DNI', '34567890', 'Martínez', 'Sánchez', 'Ana Sofía', '2010-11-08', 'F', 'Calle Lima 321', 1),
('DNI', '45678901', 'López', 'Gómez', 'Carlos Alberto', '2009-05-30', 'M', 'Jr. Arequipa 654', 1),
('DNI', '56789012', 'Pérez', 'Torres', 'Valentina', '2013-01-12', 'F', 'Av. Brasil 987', 1);

-- Matrículas de ejemplo
INSERT INTO matriculas (estudiante_id, grado_id, anio_escolar, seccion, estado, fecha_matricula) VALUES
(1, 1, 2024, 'A', 'activo', '2024-03-01'),
(2, 2, 2024, 'A', 'activo', '2024-03-01'),
(3, 3, 2024, 'B', 'activo', '2024-03-01'),
(4, 4, 2024, 'A', 'activo', '2024-03-01'),
(5, 1, 2024, 'B', 'activo', '2024-03-01');
