-- Migración: 003_create_estado_orden_servicio
-- Descripción: Crea el catálogo de estados posibles de una orden de servicio.

CREATE TABLE estado_de_orden_de_servicio (
  id_estado_de_servicio INT(11) NOT NULL AUTO_INCREMENT,
  nombre_estado VARCHAR(40) NOT NULL,
  PRIMARY KEY (id_estado_de_servicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
