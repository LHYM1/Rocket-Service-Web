-- Migración: 002_create_clasificacion_usuarios
-- Descripción: Crea el catálogo de roles del sistema (Cliente, Técnico, Administrador).

CREATE TABLE clasificacion_de_usuarios (
  id_tipo_usuario INT(11) NOT NULL AUTO_INCREMENT,
  categoria_usuario VARCHAR(40) DEFAULT NULL,
  PRIMARY KEY (id_tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
