-- Migración: 010_create_ordenes_de_servicio
-- Descripción: Crea la tabla principal de órdenes de servicio.
-- Depende de: 009_create_motocicleta, 005_create_usuarios, 
--             008_create_tipo_servicio, 003_create_estado_orden_servicio
-- NOTA (pendiente, ya identificado en documentación): id_tecnico_asignado 
-- es VARCHAR(20) y debería ser INT con FK a usuarios.id_usuario. Se deja 
-- igual que el dump actual para reconstrucción fiel; corregir en una 
-- migración posterior (ver sección de mejoras).

CREATE TABLE ordenes_de_servicio (
  id_orden INT(11) NOT NULL AUTO_INCREMENT,
  id_moto INT(10) NOT NULL,
  id_usuario INT(11) NOT NULL,
  id_tecnico_asignado VARCHAR(20) NOT NULL,
  id_tipo_servicio INT(11) NOT NULL,
  id_estado_de_servicio INT(11) NOT NULL,
  fecha_de_creacion DATE NOT NULL,
  fecha_finalizacion_estimada DATE DEFAULT NULL,
  descripcion_del_problema VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (id_orden),
  KEY fK_relacion_id_moto (id_moto),
  KEY fk_relacion_id_usuario (id_usuario),
  KEY relacion_tipo_servicio_fk (id_tipo_servicio),
  KEY fk_relacion_estado_servicio (id_estado_de_servicio),
  CONSTRAINT fK_relacion_id_moto FOREIGN KEY (id_moto) REFERENCES motocicleta (id_moto),
  CONSTRAINT fk_relacion_estado_servicio FOREIGN KEY (id_estado_de_servicio) REFERENCES estado_de_orden_de_servicio (id_estado_de_servicio),
  CONSTRAINT fk_relacion_id_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT relacion_tipo_servicio_fk FOREIGN KEY (id_tipo_servicio) REFERENCES tipo_servicio (id_tipo_servicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
