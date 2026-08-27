-- Migración: 007_create_insumos
-- Descripción: Crea el catálogo de insumos del taller.
-- Depende de: 001_create_categoria, 004_create_unidad_medida

CREATE TABLE insumos (
  id_insumo INT(11) NOT NULL AUTO_INCREMENT,
  id_categoria INT(11) NOT NULL,
  id_unidad INT(11) NOT NULL,
  nombre_insumo VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_insumo),
  KEY fk_relacion_categoria (id_categoria),
  KEY relacion_medida_fk (id_unidad),
  CONSTRAINT fk_relacion_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
  CONSTRAINT relacion_medida_fk FOREIGN KEY (id_unidad) REFERENCES unidad_de_medida (id_unidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
