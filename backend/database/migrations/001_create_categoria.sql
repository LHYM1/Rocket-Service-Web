-- Migración: 001_create_categoria
-- Descripción: Crea el catálogo de categorías de insumos.

CREATE TABLE categoria (
  id_categoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(20) NOT NULL,
  Descripcion TEXT DEFAULT 'Aceites de motor, grasas y liquidos que aseguran el buen funcionamiento.',
  PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
