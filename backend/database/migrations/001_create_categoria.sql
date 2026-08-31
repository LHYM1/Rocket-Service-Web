-- Migración: 001_create_categoria
-- Descripción: Crea el catálogo de categorías de insumos.
-- Estados: 1 = Activa y 0 = inactiva

CREATE TABLE categoria (
  id_categoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  Descripcion TEXT DEFAULT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: activa, 0: inactiva',
  PRIMARY KEY (id_categoria)
) 
