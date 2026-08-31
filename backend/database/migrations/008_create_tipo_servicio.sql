-- Migración: 008_create_tipo_servicio
-- Descripción: Crea el catálogo de tipos de servicio ofrecidos por el taller.
-- Estado: 1 = activo 0 = inactivo


CREATE TABLE tipo_servicio (
  id_tipo_servicio INT(11) NOT NULL AUTO_INCREMENT,
  nombre_servicio VARCHAR(45) NOT NULL,
  descripcion_servicio VARCHAR(200) DEFAULT NULL,
  costo_mano_obra DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: activo, 0: inactivo',
  PRIMARY KEY (id_tipo_servicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
