-- Migración: 011_create_imagenes_danos
-- Descripción: Crea la tabla de evidencias fotográficas (ingreso/entrega).
-- NOTA (pendiente, ya identificado en documentación): id_orden es 
-- VARCHAR(20) sin FK real a ordenes_de_servicio. Se deja igual que el 
-- dump actual para reconstrucción fiel; corregir en migración posterior.

CREATE TABLE imagenes_danos (
  id_imagen INT(11) NOT NULL AUTO_INCREMENT,
  id_orden VARCHAR(20) NOT NULL,
  url_imagen VARCHAR(255) DEFAULT NULL,
  tipo_evidencia ENUM('ingreso','entrega') NOT NULL,
  PRIMARY KEY (id_imagen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
