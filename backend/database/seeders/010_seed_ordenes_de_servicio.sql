-- Seeder: 010_seed_ordenes_de_servicio
-- NOTA: la orden id_orden=5 tiene fecha_finalizacion_estimada = '0000-00-00', 
-- una fecha inválida (dato de prueba defectuoso). Revisar/corregir antes de 
-- usar como demo definitivo, ya que puede causar errores según el modo SQL 
-- estricto de MySQL.
INSERT INTO ordenes_de_servicio (id_orden, id_moto, id_usuario, id_tecnico_asignado, id_tipo_servicio, id_estado_de_servicio, fecha_de_creacion, fecha_finalizacion_estimada, descripcion_del_problema) VALUES
(1, 1, 2, '5', 2, 1, '2025-10-11', '2025-10-16', 'A veces la batería se descarga\n muy rápido.'),
(2, 2, 3, '6', 1, 2, '2025-07-11', '2025-08-11', 'Al cambiar de segunda a tercera siento un golpe \n fuerte en la caja'),
(3, 3, 4, '25', 3, 5, '2025-06-12', '2025-06-20', 'la moto se recalienta y se enciende el testigo de temperatura'),
(4, 4, 9, '7', 4, 3, '2025-10-11', '2025-10-11', 'La motocicleta no enciende, el motor de arranque \ngira con lentitud y se escucha un clic repetitivo al intentar arrancar.'),
(5, 5, 10, '7', 5, 5, '2025-10-20', NULL, 'La motocicleta presenta una inestabilidad \n severa al tomar curvas, se siente flotante o rebota excesivamente después de pasar por baches.'),
(6, 6, 4, '13', 6, 1, '2025-11-30', NULL, 'Se detecta un bajo rendimiento general en la frenada\n , con una distancia de detención más larga de lo normal.'),
(7, 7, 9, '5', 7, 4, '2025-12-01', NULL, 'Se detecta un bajo rendimiento general en la frenada\n , con una distancia de detención más larga de lo normal. El cliente reporta que la motocicleta estuvo detenida por un\n período prolongado (más de '),
(8, 8, 8, '5', 8, 1, '2025-12-01', '2025-12-02', 'El cliente desea instalar un sistema de escape deportivo para mejorar el\n rendimiento y el flujo de gases'),
(9, 9, 11, '7', 9, 1, '2025-12-03', '2025-12-03', 'Las llanta delantera de la motocicleta\n se encuentra desalineada con respecto a la llanta trasera'),
(10, 10, 12, '13', 10, 5, '2025-12-03', '2025-12-04', 'El interior del motor \ncontiene residuos de polvo'),
(12, 22, 1, '5', 1, 4, '2026-06-28', '2026-06-28', 'la moto se recalienta '),
(14, 22, 1, '5', 1, 4, '2026-06-28', '2026-06-28', NULL),
(15, 4, 9, '5', 6, 1, '2026-06-28', '2026-06-28', 'espejo derecho roto.'),
(16, 4, 9, '27', 4, 5, '2026-06-29', '2026-06-29', 'cadena suelta.'),
(18, 26, 28, '27', 1, 2, '2026-07-02', '2026-07-02', 'La batería se descarga muy rápido.');
