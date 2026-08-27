-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 26-08-2026 a las 23:47:30
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `rocketService`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `Descripcion` text DEFAULT 'Aceites de motor, grasas y liquidos que aseguran el buen funcionamiento.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `Descripcion`) VALUES
(1, 'Lubricante', 'Aceites de motor, grasas y líquidos que aseguran el buen funcionamiento.'),
(2, 'Sistema electrico', 'Baterias, luces, sensores, cableado y sistema de encendido'),
(3, 'Filtracion', 'Filtros de aire, aceite y combustible elementos y carcasas asociadas'),
(4, 'sistema de frenos', 'Discos, pastillas, bombas y componentes del sistema de frenos.'),
(5, 'Suspencion', 'Amortiguadores, Horquillas, barras de suspencion, aceites de suspencion.'),
(6, 'Transmision', 'Cadenas, piñones, coronas, kits de arrastre, embragues, discos de cloche y cajas de cambios.'),
(7, 'Motor y partes', 'Pistones, anillos, \nválvulas, culatas, cilindros, cigüeñales y empaquetaduras (juntas).'),
(8, 'Carrocería y Chasis', 'Carenados, guardabarros, tanques de combustible, \nasientos, espejos, manillares y defensas.'),
(9, 'Ruedas y Llantas', 'Neumáticos, rines, llantas y válvulas.'),
(10, 'Instrumentación', 'Velocímetros, tacómetros e indicadores de combustible.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clasificacion_de_usuarios`
--

CREATE TABLE `clasificacion_de_usuarios` (
  `id_tipo_usuario` int(11) NOT NULL,
  `categoria_usuario` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clasificacion_de_usuarios`
--

INSERT INTO `clasificacion_de_usuarios` (`id_tipo_usuario`, `categoria_usuario`) VALUES
(1, 'Cliente'),
(2, 'Técnico'),
(3, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_de_orden_de_servicio`
--

CREATE TABLE `estado_de_orden_de_servicio` (
  `id_estado_de_servicio` int(11) NOT NULL,
  `nombre_estado` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_de_orden_de_servicio`
--

INSERT INTO `estado_de_orden_de_servicio` (`id_estado_de_servicio`, `nombre_estado`) VALUES
(1, 'ASIGNADA'),
(2, 'EN REVISIÓN'),
(3, 'FINALIZADA'),
(4, 'CANCELADA'),
(5, 'EN PROCESO'),
(6, 'ESPERANDO REPUESTOS'),
(7, 'PAUSADA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_danos`
--

CREATE TABLE `imagenes_danos` (
  `id_imagen` int(11) NOT NULL,
  `id_orden` varchar(20) NOT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `tipo_evidencia` enum('ingreso','entrega') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagenes_danos`
--

INSERT INTO `imagenes_danos` (`id_imagen`, `id_orden`, `url_imagen`, `tipo_evidencia`) VALUES
(1, '1', '', 'ingreso'),
(2, '2', '', 'ingreso'),
(3, '3', '', 'ingreso'),
(4, '4', '', 'ingreso'),
(5, '5', '', 'ingreso'),
(6, '6', '', 'ingreso'),
(7, '7', '', 'ingreso'),
(8, '8', '', 'ingreso'),
(9, '9', '', 'ingreso'),
(10, '10', '', 'ingreso'),
(12, '10', '', 'ingreso'),
(14, '2', '/uploads/1782353293777.jpg', 'ingreso'),
(15, '3', '/uploads/1782404068502.jpg', 'ingreso'),
(16, '3', '/uploads/1782404081736.jpg', 'ingreso'),
(17, '9', '/uploads/1782420472884.jpg', 'ingreso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos`
--

CREATE TABLE `insumos` (
  `id_insumo` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_unidad` int(11) NOT NULL,
  `nombre_insumo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `insumos`
--

INSERT INTO `insumos` (`id_insumo`, `id_categoria`, `id_unidad`, `nombre_insumo`) VALUES
(1, 2, 13, 'Alambre de cobre para bobinado'),
(2, 2, 2, 'Manguera de Combustible Universal'),
(3, 2, 3, 'Cable Eléctrico 18 AWG'),
(4, 1, 4, 'Aceite de Motor 20W50'),
(5, 4, 5, 'Pastillas de Freno Delanteras'),
(6, 2, 6, 'Cinta Aislante Eléctrica'),
(7, 2, 7, 'Soldadura de Estaño y Plomo 60/40'),
(8, 4, 8, 'Líquido de Frenos DOT 4'),
(9, 7, 9, 'Pistón Estándar'),
(10, 1, 10, 'Retén de Aceite de Suspensión Delantera');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos_usados_en_servicio`
--

CREATE TABLE `insumos_usados_en_servicio` (
  `id_insumos_orden` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `id_insumo` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `insumos_usados_en_servicio`
--

INSERT INTO `insumos_usados_en_servicio` (`id_insumos_orden`, `id_orden`, `id_insumo`, `cantidad`) VALUES
(1, 1, 1, 2),
(2, 1, 3, 10),
(3, 1, 6, 1),
(4, 1, 7, 5),
(5, 2, 4, 1),
(6, 2, 8, 5),
(7, 2, 5, 2),
(9, 3, 4, 1),
(10, 4, 1, 3),
(27, 10, 2, 4),
(31, 10, 1, 2),
(32, 6, 1, 2),
(33, 9, 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelo`
--

CREATE TABLE `modelo` (
  `id_modelo` int(10) NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelo`
--

INSERT INTO `modelo` (`id_modelo`, `nombre`) VALUES
(1, 'KTM Duke 200'),
(2, 'KTM Duke 150'),
(3, 'KTM Duke 200'),
(4, 'KTM Duke 390'),
(5, 'KTM Duke 160'),
(6, 'KTM Duke 125'),
(7, 'KTM DUKE 390'),
(8, 'KTM Duke 390'),
(9, 'KTM Duke 125'),
(10, 'KTM Duke 160'),
(19, 'KTM DUKE 1000'),
(20, 'KTM DUKE 1200'),
(23, 'KTM DUKE 400'),
(24, 'KTM DUKE 250');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `motocicleta`
--

CREATE TABLE `motocicleta` (
  `id_moto` int(10) NOT NULL,
  `placa` varchar(10) NOT NULL,
  `id_modelo` int(10) NOT NULL,
  `kilometraje_actual` decimal(10,2) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `motocicleta`
--

INSERT INTO `motocicleta` (`id_moto`, `placa`, `id_modelo`, `kilometraje_actual`, `id_usuario`) VALUES
(1, 'COZ 89B', 1, 8420.00, 2),
(2, 'H09 45', 6, 1573.00, 3),
(3, 'ETY 45P', 3, 32145.00, 4),
(4, 'URT 48M', 2, 50205.00, 9),
(5, 'LRT 64K', 4, 128900.00, 10),
(6, 'MNQ 90D', 5, 225000.00, 4),
(7, 'ABC 01E', 6, 8903.00, 9),
(8, 'DEF 02F', 7, 185000.00, 8),
(9, 'GHI 03G', 8, 3000.00, 11),
(10, 'JKL 04H', 9, 452108.00, 12),
(22, 'JTR 235', 24, 200.00, 1),
(24, 'SNE 232', 1, 1000.00, 1),
(25, 'RET 126', 1, 2000.00, 1),
(26, 'SDT 456', 1, 2880.00, 28),
(28, 'HTR 28T', 2, 1500.00, 16);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_de_servicio`
--

CREATE TABLE `ordenes_de_servicio` (
  `id_orden` int(11) NOT NULL,
  `id_moto` int(10) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_tecnico_asignado` varchar(20) NOT NULL,
  `id_tipo_servicio` int(11) NOT NULL,
  `id_estado_de_servicio` int(11) NOT NULL,
  `fecha_de_creacion` date NOT NULL,
  `fecha_finalizacion_estimada` date DEFAULT NULL,
  `descripcion_del_problema` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes_de_servicio`
--

INSERT INTO `ordenes_de_servicio` (`id_orden`, `id_moto`, `id_usuario`, `id_tecnico_asignado`, `id_tipo_servicio`, `id_estado_de_servicio`, `fecha_de_creacion`, `fecha_finalizacion_estimada`, `descripcion_del_problema`) VALUES
(1, 1, 2, '5', 2, 1, '2025-10-11', '2025-10-16', 'A veces la batería se descarga\n muy rápido.'),
(2, 2, 3, '6', 1, 2, '2025-07-11', '2025-08-11', 'Al cambiar de segunda a tercera siento un golpe \n fuerte en la caja'),
(3, 3, 4, '25', 3, 5, '2025-06-12', '2025-06-20', 'la moto se recalienta y se enciende el testigo de temperatura'),
(4, 4, 9, '7', 4, 3, '2025-10-11', '2025-10-11', 'La motocicleta no enciende, el motor de arranque \ngira con lentitud y se escucha un clic repetitivo al intentar arrancar.'),
(5, 5, 10, '7', 5, 5, '2025-10-20', '0000-00-00', 'La motocicleta presenta una inestabilidad \n severa al tomar curvas, se siente flotante o rebota excesivamente después de pasar por baches.'),
(6, 6, 4, '13', 6, 1, '2025-11-30', '0000-00-00', 'Se detecta un bajo rendimiento general en la frenada\n , con una distancia de detención más larga de lo normal.'),
(7, 7, 9, '5', 7, 4, '2025-12-01', '0000-00-00', 'Se detecta un bajo rendimiento general en la frenada\n , con una distancia de detención más larga de lo normal. El cliente reporta que la motocicleta estuvo detenida por un\n período prolongado (más de '),
(8, 8, 8, '3', 8, 1, '2025-12-01', '2025-12-02', 'El cliente desea instalar un sistema de escape deportivo para mejorar el\n rendimiento y el flujo de gases'),
(9, 9, 11, '3', 9, 1, '2025-12-03', '2025-12-03', 'Las llanta delantera de la motocicleta\n se encuentra desalineada con respecto a la llanta trasera'),
(10, 10, 12, '13', 10, 5, '2025-12-03', '2025-12-04', 'El interior del motor \ncontiene residuos de polvo'),
(12, 22, 1, '5', 1, 4, '2026-06-28', '2026-06-28', 'la moto se recalienta '),
(14, 22, 1, '5', 1, 4, '2026-06-28', '2026-06-28', NULL),
(15, 4, 9, '5', 6, 1, '2026-06-28', '2026-06-28', 'espejo derecho roto.'),
(16, 4, 9, '27', 4, 5, '2026-06-29', '2026-06-29', 'cadena suelta.'),
(18, 26, 28, '27', 1, 2, '2026-07-02', '2026-07-02', 'La batería se descarga muy rápido.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_actividad`
--

CREATE TABLE `registro_actividad` (
  `id_registro` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `estado_disponibilidad` varchar(40) DEFAULT 'NOT NULL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registro_actividad`
--

INSERT INTO `registro_actividad` (`id_registro`, `id_orden`, `id_usuario`, `estado_disponibilidad`) VALUES
(1, 1, 5, 'Disponible'),
(2, 3, 7, 'Fuera de jornada'),
(3, 4, 7, 'Fuera de jornada'),
(4, 5, 8, 'Fuera de jornada'),
(5, 6, 0, 'efef'),
(6, 8, 5, 'NOT NULL'),
(7, 9, 0, 'NOT NULL'),
(8, 10, 13, 'Realizando servicio'),
(9, 2, 6, 'Disponible'),
(10, 1, 5, 'Disponible'),
(23, 6, 7, 'Fuera de jornada'),
(24, 10, 6, 'Disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_servicio`
--

CREATE TABLE `tipo_servicio` (
  `id_tipo_servicio` int(11) NOT NULL,
  `nombre_servicio` varchar(45) NOT NULL,
  `descripcion_servicio` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_servicio`
--

INSERT INTO `tipo_servicio` (`id_tipo_servicio`, `nombre_servicio`, `descripcion_servicio`) VALUES
(1, 'Mantenimiento preventivo', 'Incluye cambio de aceite, revisión de frenos,\n  ajuste de cadena, limpieza de filtro de aire, revisión de luces, llantas .'),
(2, 'Diagnóstico', 'Se hace con pruebas visuales, mecánicas y a veces con escáner\n  en motos de inyección electrónica.'),
(3, 'Reparación', 'Puede ser desde un cambio de batería hasta abrir motor,  caja de cambios, frenos o sistema eléctrico.'),
(4, 'Ajuste \nde Válvulas y Carburación', 'Servicio de precisión que incluye la regulación de las holguras de las válvulas \n(para un mejor desempeño del motor).'),
(5, 'Diagnóstico  y Reparación de Suspensión', 'Desarme, inspección, cambio de retenedores, guardapolvos \ny aceite de barras (suspensión delantera).'),
(6, 'Mantenimiento del Sistema de Frenos', 'Cambio de pastillas/bandas, purgado completo del sistema,\n reemplazo del líquido de frenos.'),
(7, 'Revisión y carga de batería', 'Mantenimiento eléctrico especializado en la batería, incluyendo pruebas \nde amperaje, verificación del estado de carga.'),
(8, 'Instalación de Sistemas de Escape', 'Retiro del sistema de escape de fábrica e instalación de un sistema \nde alto rendimiento.'),
(9, 'Alineación y Balanceo de Ruedas', 'Balanceo de Ruedas	Ajuste de la tensión de los radios, alineación de la rueda y \nbalanceo dinámico para garantizar una rodadura suave.'),
(10, 'Limpieza Ultrasónica de Componentes', 'Limpieza profunda de piezas de precisión como \ninyectores, carburadores o cuerpos de aceleración, para eliminar residuos y óxido.'),
(13, 'mantenimiento', 'reparación de frenos'),
(17, 'Mantenimiento preventivoo', '....');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidad_de_medida`
--

CREATE TABLE `unidad_de_medida` (
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unidad_de_medida`
--

INSERT INTO `unidad_de_medida` (`id_unidad`, `nombre`) VALUES
(1, 'kilogramo(s)'),
(2, 'centrimetro(s)'),
(3, 'metro(s)'),
(4, 'galon(es)'),
(5, 'juego(s)'),
(6, 'rollo(s)'),
(7, 'gramo(s)'),
(8, 'litro(s)'),
(9, 'unidad(s)'),
(10, 'pulgada(s)'),
(12, 'udud'),
(13, 'Jua');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `correo_usuario` varchar(50) NOT NULL,
  `telefono_usuario` varchar(15) NOT NULL,
  `contrasena` varchar(80) NOT NULL,
  `id_tipo_usuario` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: pendiente, 2: activo, 3: inactivo',
  `token_registro` varchar(64) DEFAULT NULL,
  `token_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `correo_usuario`, `telefono_usuario`, `contrasena`, `id_tipo_usuario`, `estado`, `token_registro`, `token_expiracion`) VALUES
(1, 'Juan', 'Pére', 'juanperez@gmail.com', '321242892', '$2b$10$/lFCL4Z3guXHD5vgStbhzOcReQjH3iIcWahbNDxAWQy7ZWoyne67G', 1, 1, NULL, NULL),
(2, 'Carlos ', 'Castañeda', 'carloscasta@gmail.com', '3282428952', '$2b$10$6oDdZF/n1IRogOcH3/x.X.zZ7eqlpm/n/8Ae6kYO1gVdB6ByhRnG.', 1, 1, NULL, NULL),
(3, 'Luis', 'Suarez', 'luis@gmail.com', '3146788926', '$2b$10$Gxh/OEG9jYIGxqx1k9hJ0e18QfLeFxQdMb1SmdEjq8kbhEdLwvkeG', 1, 1, NULL, NULL),
(4, 'Andrés', 'Ortiz perez', 'andres@gmail.com', '3257896545', '$2b$10$YFwVr7j0YOFmgtsrtgXsd.k.1WNEKJya8gpDyJHdf2QirEWKcLGgK', 1, 1, NULL, NULL),
(5, 'Juan', 'Cortez', 'juancortez@gmail.com', '3238956894', '$2b$10$dGdEUAVW6/5svJd9zNgxV.1VZdk80a0f8cb0Iq3WtrVaCirhYVDTi', 2, 1, NULL, NULL),
(6, 'Miguel ', 'Valencia', 'migue@gmail.com', '3287895689', '$2b$10$ONmuqXX6DA4U0XxOJPlwAOBWwCpMIqxeOG.8AkJE86zsd0s3deQ4O', 2, 1, NULL, NULL),
(7, 'Felipe', 'Ruiz', 'feli@gmail.com', '3137895689', '$2b$10$7zyfaKppn/QI7ytnyJu0BeMFTBUG.FW6ZpYGi454sVyCVCMLyi9sy', 2, 1, NULL, NULL),
(8, 'Camilo ', 'Sánchez', 'camilosanchez@gmail.com', '3215675413', '$2b$10$isicPNSq4CNYcECJfYdVEOomVTjrWge//m8U5qOM2QGGeyFfQ3Emy', 2, 1, NULL, NULL),
(9, 'Armando', 'Espinoza', 'armandoespinoza@gmail.com', '3215089413', '$2b$10$pwqXNLMy8CDLlDqHaAAjq.WQS.vvLlUyfcLv12YuVcBM4F1IeRYXa', 1, 1, NULL, NULL),
(10, 'José', 'Garcia', 'josegarcia@gmail.com', '3175067413', '$2b$10$jAMGSz9iRcZazslMRR0AAevNMLUF3QyqCsbrWPXcX0O7tkae16t3O', 1, 1, NULL, NULL),
(11, 'Alberto', 'Huertas', 'albert@gmail.com', '3246787645', '$2b$10$5e7x1TmMzxC0yY8P7bjloe/VeTizBeFs7ybnrGul5VXeMcM8rhORu', 1, 1, NULL, NULL),
(12, 'Tomas', 'Alba', 'tomasalba@gmail.com', '3143206387', '$2b$10$rjg2JVV2DKvFKxizmp6Gqu/E6gcofmb5SJU0DwdB4Y1S7123iGlka', 1, 1, NULL, NULL),
(13, 'Nicolas', 'Benitez', 'nicolasbenitez.com', '3202457856', '$2b$10$4Nohj7RNtfKincqZhchvPOivq.QSTW88XahdzD.4ZyAWxCc3t.JnC', 2, 1, NULL, NULL),
(14, 'Juan', 'Vargas', 'juanlilipaz09@gmail.com', '3345689', '$2b$10$K/UCOWEnKE/8OiTiJqqGOu9/uP0ZU0fVDM0YN4Iwzw/li5ICoiUzC', 3, 1, NULL, NULL),
(16, 'Carlos', 'Perez', 'carlosp@gmail.com', '34567543', '$2b$10$9a5dxRwbZbeTQHxsrXRWpebSAWAhRIbGkBYEspIVUXQB546cbx2o2', 1, 1, NULL, NULL),
(19, 'Juan', 'Huertas', 'j@gmail.com', '3246785423', '$2b$10$WLll/tM1QUpgeHAMstBY7.ftCyeuOEZnxqLrgst06MjH5NP2D0PKG', 1, 1, NULL, NULL),
(20, 'Nicolas', 'Florez', 'nicolas@gmail.com', '3226786545', '$2b$10$EMmpBxOsom73t624/GA8MO6UH6FpROXCQvIdSRj2CpbTB44Z2gKcC', 3, 1, NULL, NULL),
(21, 'Kevin', 'Vargas', 'kevin@gmail.com', '3226786545', '$2b$10$EfS5w9gnnLPjXNSSVFwu2eWZCvhPvUazTY7BYCUEaNz8pQnxBlCb.', 3, 1, NULL, NULL),
(23, 'Carlos', 'Pedroza', 'c@gmail.com', '3212429867', '$2b$10$d.fk2HIBQ57E87bvIZBx8O2GBQoyFYxF4AHitkrpwpiuOfo81gxiO', 2, 1, NULL, NULL),
(24, 'Aurelio', 'Prueba', 'aurelio@prueba.com', '3001234567', '$2b$10$kYTe4AvqsY1ycNjZ9eXTc.XstlHXnjgFGQ8qo4xBIivy5JGRgRAg.', 2, 1, NULL, NULL),
(25, 'Bernal', 'Torres', 'juan@gmail.com', '1234585213', '$2b$10$BUwSSfMvT3Mp9qP4bVMgBeTfYe8Vv.3.3Kli9UKvDO21QRXHMU/3G', 2, 1, NULL, NULL),
(26, 'Cristian', 'Barón', 'cristianbaron@gmail.com', '3213457653', '$2b$10$PGKmYjIEDPoDOlPcI8G4G.c.x2V0fpy2oQFBoCRxTSlXUCxKpNorq', 2, 1, NULL, NULL),
(27, 'Yeison', 'Puentes', 'yeison@gmail.com', '3212583692', '$2b$10$AJN/g4olbS4F754RXShWne92lIfgHrZuVSmz5vmFLAj9NzeawiQrS', 2, 1, NULL, NULL),
(28, 'Alison', 'Sánchez', 'alison@gmail.com', '3212582325', '1234', 1, 1, NULL, NULL),
(29, 'Juan', 'Hernández', 'juanhernandez@gmail.com', '3212428926', '$2b$10$6pI3w.onuroe1kXe.b3Nh.VZv/Y47FUt3R0mX4/zJPm6uz.b3tEf.', 2, 1, NULL, NULL),
(30, 'Andrés', 'Ochoa', 'andresochoa@gmail.com', '3212436754', '$2b$10$VIGmPcwotsxiOW.dP0/ZeeaJxZxrf5RrfLmjJisLkE5O6OErnUuFu', 2, 1, NULL, NULL),
(33, 'Andrés', 'Ochoa', 'andreochoa@gmail.com', '3212457867', '$2b$10$qEyzh3jJ/o2AumVAnJFU.u31IC.LNUVSYVBLDpIWOD6C9GVu5YrQi', 2, 1, NULL, NULL),
(37, 'Andres', 'Ochoa', 'ochoa@gmail.com', '3212428926', '$2b$10$R8Zeks9n1GwkyK5qryCXYeJjWpZTWosS5LHr.BnK36OKoVQLvzL4i', 2, 1, NULL, NULL),
(39, 'Andres', 'Ochoa', 'o@gmail.com', '3212428926', '$2b$10$Z2nRZhCvHJBZov8tSiU.VONGTWH/N/DxayMGfG1pPRKhaDMQ9593q', 2, 1, NULL, NULL),
(40, 'Juan', 'Alba', 'alba@gmail.com', '3212437856', '$2b$10$uXC0sYQCzEmxEFZ6TjaPduelkbvnKlsGy2xM/35DIIAh4bggeyAGK', 2, 1, NULL, NULL),
(41, 'Carlos ', 'Cuesta', 'juan123@gmail.com', '3256786534', '$2b$10$jVvAVXuGC2vcl1LlAMcPdu60gSusyQeYm4EtSe4/yZFiCwVJGFKaS', 2, 1, NULL, NULL),
(42, 'Juan', 'Pinto', 'pinto@gmail.com', '3212428926', '$2b$10$Z9CqC7A/9FSy3P4ZWZZ68.jA7BrukZMDsJpQsi7gZexrmh/EwkHOS', 2, 1, NULL, NULL),
(43, 'Juan', 'Ochoa', 'alisonv@gmail.com', '3212428926', '$2b$10$d.Un3kOm27LR11iirvMOtewkZEG.0x..EEB/MdVkSy0ZZyYKNLsIy', 2, 1, NULL, NULL),
(44, 'Juan', 'Ochoa', 'alisonh@gmail.com', '3212428926', '$2b$10$qTQsOIAPoCUCnDv56ZK5..EwPaVXr.5HnjKP6HD06yaxw.8RDjL1O', 2, 1, NULL, NULL),
(45, 'Juan', 'Ochoa', 'alison123@gmail.com', '3212428926', '$2b$10$sPPZuPPKtagFLJVCy.BlOubYPivv7V6CR6aEJwTULcjZ5r1nhegfu', 2, 1, NULL, NULL),
(46, 'Juan', 'Puentes', 'juanpuentes@gmail.com', '3254547856', '$2b$10$L0EnTkS8YibPMPaJOt7HVOHpzP3pHV9CbwYdPPU5GkYreFgNKmiH2', 2, 1, NULL, NULL),
(47, 'Andrés', 'Pinto', 'andrepinto@gmail.com', '3214567899', '$2b$10$HuB5wLGt3eCZsuc6mDy/4.psUhJ3XinSJM9iMkSt0evrTK8B6utwy', 2, 1, NULL, NULL),
(48, 'pedro ', 'morales', 'pedro@gmail.com', '3212345678', '$2b$10$QHlHKAAZ4qjCZlzvwAU6uenTgXrq/gk6PmePIJuwLnql6yPJ9CBty', 1, 1, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `clasificacion_de_usuarios`
--
ALTER TABLE `clasificacion_de_usuarios`
  ADD PRIMARY KEY (`id_tipo_usuario`);

--
-- Indices de la tabla `estado_de_orden_de_servicio`
--
ALTER TABLE `estado_de_orden_de_servicio`
  ADD PRIMARY KEY (`id_estado_de_servicio`);

--
-- Indices de la tabla `imagenes_danos`
--
ALTER TABLE `imagenes_danos`
  ADD PRIMARY KEY (`id_imagen`);

--
-- Indices de la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD PRIMARY KEY (`id_insumo`),
  ADD KEY `fk_relacion_categoria` (`id_categoria`),
  ADD KEY `relacion_medida_fk` (`id_unidad`);

--
-- Indices de la tabla `insumos_usados_en_servicio`
--
ALTER TABLE `insumos_usados_en_servicio`
  ADD PRIMARY KEY (`id_insumos_orden`),
  ADD KEY `fk_relacion_orden` (`id_orden`),
  ADD KEY `fk_relacion_insumo` (`id_insumo`);

--
-- Indices de la tabla `modelo`
--
ALTER TABLE `modelo`
  ADD PRIMARY KEY (`id_modelo`);

--
-- Indices de la tabla `motocicleta`
--
ALTER TABLE `motocicleta`
  ADD PRIMARY KEY (`id_moto`),
  ADD UNIQUE KEY `placa` (`placa`),
  ADD KEY `fk_relacion_modelo` (`id_modelo`),
  ADD KEY `fk_moto_usuario` (`id_usuario`);

--
-- Indices de la tabla `ordenes_de_servicio`
--
ALTER TABLE `ordenes_de_servicio`
  ADD PRIMARY KEY (`id_orden`),
  ADD KEY `fK_relacion_id_moto` (`id_moto`),
  ADD KEY `fk_relacion_id_usuario` (`id_usuario`),
  ADD KEY `relacion_tipo_servicio_fk` (`id_tipo_servicio`),
  ADD KEY `fk_relacion_estado_servicio` (`id_estado_de_servicio`);

--
-- Indices de la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  ADD PRIMARY KEY (`id_registro`),
  ADD KEY `fk_relacion_id_de_orden` (`id_orden`),
  ADD KEY `fk_relacion_con_id_usuario` (`id_usuario`);

--
-- Indices de la tabla `tipo_servicio`
--
ALTER TABLE `tipo_servicio`
  ADD PRIMARY KEY (`id_tipo_servicio`);

--
-- Indices de la tabla `unidad_de_medida`
--
ALTER TABLE `unidad_de_medida`
  ADD PRIMARY KEY (`id_unidad`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `UQ_email` (`correo_usuario`),
  ADD KEY `fk_relacion_id_tipo_usuario` (`id_tipo_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `clasificacion_de_usuarios`
--
ALTER TABLE `clasificacion_de_usuarios`
  MODIFY `id_tipo_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `estado_de_orden_de_servicio`
--
ALTER TABLE `estado_de_orden_de_servicio`
  MODIFY `id_estado_de_servicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `imagenes_danos`
--
ALTER TABLE `imagenes_danos`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `insumos`
--
ALTER TABLE `insumos`
  MODIFY `id_insumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `insumos_usados_en_servicio`
--
ALTER TABLE `insumos_usados_en_servicio`
  MODIFY `id_insumos_orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `modelo`
--
ALTER TABLE `modelo`
  MODIFY `id_modelo` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `motocicleta`
--
ALTER TABLE `motocicleta`
  MODIFY `id_moto` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `ordenes_de_servicio`
--
ALTER TABLE `ordenes_de_servicio`
  MODIFY `id_orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `tipo_servicio`
--
ALTER TABLE `tipo_servicio`
  MODIFY `id_tipo_servicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `unidad_de_medida`
--
ALTER TABLE `unidad_de_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD CONSTRAINT `fk_relacion_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `relacion_medida_fk` FOREIGN KEY (`id_unidad`) REFERENCES `unidad_de_medida` (`id_unidad`);

--
-- Filtros para la tabla `insumos_usados_en_servicio`
--
ALTER TABLE `insumos_usados_en_servicio`
  ADD CONSTRAINT `fk_relacion_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumos` (`id_insumo`),
  ADD CONSTRAINT `fk_relacion_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_de_servicio` (`id_orden`);

--
-- Filtros para la tabla `motocicleta`
--
ALTER TABLE `motocicleta`
  ADD CONSTRAINT `fk_moto_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_de_servicio`
--
ALTER TABLE `ordenes_de_servicio`
  ADD CONSTRAINT `fK_relacion_id_moto` FOREIGN KEY (`id_moto`) REFERENCES `motocicleta` (`id_moto`),
  ADD CONSTRAINT `fk_relacion_estado_servicio` FOREIGN KEY (`id_estado_de_servicio`) REFERENCES `estado_de_orden_de_servicio` (`id_estado_de_servicio`),
  ADD CONSTRAINT `fk_relacion_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `relacion_tipo_servicio_fk` FOREIGN KEY (`id_tipo_servicio`) REFERENCES `tipo_servicio` (`id_tipo_servicio`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
