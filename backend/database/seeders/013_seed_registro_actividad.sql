-- Seeder: 013_seed_registro_actividad
-- NOTA: hay valores de prueba inconsistentes en estado_disponibilidad 
-- ('efef', literal 'NOT NULL' como texto, id_usuario=0 en dos filas que 
-- no corresponde a ningún usuario real). Limpiar antes de usar como 
-- datos definitivos.
INSERT INTO registro_actividad (id_registro, id_orden, id_usuario, estado_disponibilidad) VALUES
(1, 1, 5, 'Disponible'),
(2, 3, 7, 'Fuera de jornada'),
(3, 4, 7, 'Fuera de jornada'),
(4, 5, 8, 'Fuera de jornada'),
(6, 8, 5, NULL),
(8, 10, 13, 'Realizando servicio'),
(9, 2, 6, 'Disponible'),
(10, 1, 5, 'Disponible'),
(23, 6, 7, 'Fuera de jornada'),
(24, 10, 6, 'Disponible');
