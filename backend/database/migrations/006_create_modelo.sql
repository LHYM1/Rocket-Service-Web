-- Migración: 006_create_modelo
-- Descripción: Crea el catálogo de modelos de motocicleta.

CREATE TABLE modelo (
  id_modelo INT(10) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(20) NOT NULL,
  PRIMARY KEY (id_modelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
