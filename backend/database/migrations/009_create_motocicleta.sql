-- Migración: 009_create_motocicleta
-- Descripción: Crea la tabla de motocicletas registradas por cliente.
-- Depende de: 006_create_modelo, 005_create_usuarios
-- NOTA: en el dump original, fk_relacion_modelo existía solo como índice, 
-- sin restricción real. Se agrega aquí la restricción; verifica integridad 
-- de datos existentes antes de ejecutar en producción.

CREATE TABLE motocicleta (
  id_moto INT(10) NOT NULL AUTO_INCREMENT,
  placa VARCHAR(10) NOT NULL,
  id_modelo INT(10) NOT NULL,
  kilometraje_actual DECIMAL(10,2) NOT NULL,
  id_usuario INT(11) NOT NULL,
  PRIMARY KEY (id_moto),
  UNIQUE KEY placa (placa),
  KEY fk_relacion_modelo (id_modelo),
  KEY fk_moto_usuario (id_usuario),
  CONSTRAINT fk_moto_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_relacion_modelo FOREIGN KEY (id_modelo) REFERENCES modelo (id_modelo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
