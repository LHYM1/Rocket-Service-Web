-- Migración: 004_create_unidad_medida
-- Descripción: Crea el catálogo de unidades de medida para insumos.

CREATE TABLE unidad_de_medida (
  id_unidad INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_unidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
