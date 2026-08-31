-- Migración: 004_create_unidad_medida
-- Descripción: Crea el catálogo de unidades de medida para insumos.
-- Estados para softdelete (eliminado lógico)

CREATE TABLE unidad_de_medida (
  id_unidad INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: activa, 0: inactiva',
  PRIMARY KEY (id_unidad)
);
