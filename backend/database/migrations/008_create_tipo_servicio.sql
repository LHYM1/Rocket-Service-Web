-- Migración: 008_create_tipo_servicio
-- Descripción: Crea el catálogo de tipos de servicio ofrecidos por el taller.

CREATE TABLE tipo_servicio (
  id_tipo_servicio INT(11) NOT NULL AUTO_INCREMENT,
  nombre_servicio VARCHAR(45) NOT NULL,
  descripcion_servicio VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (id_tipo_servicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
