-- Migración: 006_create_modelo
-- Descripción: Crea el catálogo de modelos de motocicleta.
-- Estado: 1 = activo 2 = inactivo

CREATE TABLE modelo (
  id_modelo INT(10) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: activo, 0: inactivo',
  PRIMARY KEY (id_modelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
