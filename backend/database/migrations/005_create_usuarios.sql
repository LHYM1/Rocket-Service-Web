-- Migración: 005_create_usuarios
-- Descripción: Crea la tabla de usuarios (Administrador, Técnico, Cliente).
-- Depende de: 002_create_clasificacion_usuarios
-- NOTA: en el dump original esta FK solo existía como índice, sin restricción
-- (CONSTRAINT) real. Se agrega aquí la restricción porque el índice 
-- fk_relacion_id_tipo_usuario ya indicaba esa intención; verifica que no 
-- rompa datos existentes con id_tipo_usuario inválido antes de ejecutar 
-- en producción.

CREATE TABLE usuarios (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  correo_usuario VARCHAR(50) NOT NULL,
  telefono_usuario VARCHAR(15) NOT NULL,
  contrasena VARCHAR(80) NOT NULL,
  id_tipo_usuario INT(11) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: pendiente, 2: activo, 3: inactivo',
  token_registro VARCHAR(64) DEFAULT NULL,
  token_expiracion DATETIME DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY UQ_email (correo_usuario),
  KEY fk_relacion_id_tipo_usuario (id_tipo_usuario),
  CONSTRAINT fk_usuarios_tipo_usuario FOREIGN KEY (id_tipo_usuario) REFERENCES clasificacion_de_usuarios (id_tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
