-- Migración: 013_create_registro_actividad
-- Descripción: Crea la tabla de bitácora/registro de actividad.
-- NOTA (pendiente, ya identificado en documentación): 
-- 1) No tiene FK reales a ordenes_de_servicio ni usuarios (solo índices).
-- 2) No tiene campo de fecha/hora, indispensable para que funcione 
--    como auditoría real.
-- 3) El propósito exacto de "estado_disponibilidad" sigue sin confirmar 
--    (hay datos de prueba inconsistentes como 'efef' o 'NOT NULL' como 
--    texto literal). Revisar antes de usarla en producción.
-- Se deja igual que el dump actual para reconstrucción fiel.

CREATE TABLE registro_actividad (
  id_registro INT(11) NOT NULL AUTO_INCREMENT,
  id_orden INT(11) NOT NULL,
  id_usuario INT(11) NOT NULL,
  estado_disponibilidad VARCHAR(40) DEFAULT NULL,
  PRIMARY KEY (id_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
