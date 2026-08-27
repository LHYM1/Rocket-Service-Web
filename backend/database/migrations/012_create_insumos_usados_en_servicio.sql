-- Migración: 012_create_insumos_usados_en_servicio
-- Descripción: Crea la tabla de insumos consumidos por orden de servicio.
-- Depende de: 010_create_ordenes_de_servicio, 007_create_insumos

CREATE TABLE insumos_usados_en_servicio (
  id_insumos_orden INT(11) NOT NULL AUTO_INCREMENT,
  id_orden INT(11) NOT NULL,
  id_insumo INT(11) NOT NULL,
  cantidad INT(11) NOT NULL,
  PRIMARY KEY (id_insumos_orden),
  KEY fk_relacion_orden (id_orden),
  KEY fk_relacion_insumo (id_insumo),
  CONSTRAINT fk_relacion_insumo FOREIGN KEY (id_insumo) REFERENCES insumos (id_insumo),
  CONSTRAINT fk_relacion_orden FOREIGN KEY (id_orden) REFERENCES ordenes_de_servicio (id_orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
