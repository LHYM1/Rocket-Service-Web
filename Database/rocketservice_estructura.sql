-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-09-2026 a las 18:45:26
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
-- Base de datos: `rocketservice`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `Descripcion` text DEFAULT 'Aceites de motor, grasas y liquidos que aseguran el buen funcionamiento.',
  `estado` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clasificacion_de_usuarios`
--

CREATE TABLE `clasificacion_de_usuarios` (
  `id_tipo_usuario` int(11) NOT NULL,
  `categoria_usuario` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_de_orden_de_servicio`
--

CREATE TABLE `estado_de_orden_de_servicio` (
  `id_estado_de_servicio` int(11) NOT NULL,
  `nombre_estado` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_danos`
--

CREATE TABLE `imagenes_danos` (
  `id_imagen` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `url_imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos`
--

CREATE TABLE `insumos` (
  `id_insumo` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_unidad` int(11) NOT NULL,
  `nombre_insumo` varchar(100) NOT NULL,
  `cantidad_disponible` int(11) NOT NULL DEFAULT 0,
  `precio_unitario` int(11) NOT NULL DEFAULT 0,
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelo`
--

CREATE TABLE `modelo` (
  `id_modelo` int(10) NOT NULL,
  `nombre` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `motocicleta`
--

CREATE TABLE `motocicleta` (
  `id_moto` int(10) NOT NULL,
  `placa` varchar(10) NOT NULL,
  `id_modelo` int(10) NOT NULL,
  `kilometraje_actual` decimal(10,2) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_de_servicio`
--

CREATE TABLE `ordenes_de_servicio` (
  `id_orden` int(11) NOT NULL,
  `codigo_orden` varchar(20) NOT NULL,
  `id_moto` int(10) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `id_tipo_servicio` int(11) DEFAULT NULL,
  `id_estado_de_servicio` int(11) NOT NULL,
  `fecha_de_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_finalizacion_estimada` datetime NOT NULL,
  `descripcion_del_problema` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_actividad`
--

CREATE TABLE `registro_actividad` (
  `id_registro` int(11) NOT NULL,
  `codigo_registro` varchar(20) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `estado_disponibilidad` varchar(40) DEFAULT 'NOT NULL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_servicio`
--

CREATE TABLE `tipo_servicio` (
  `id_tipo_servicio` int(11) NOT NULL,
  `nombre_servicio` varchar(45) NOT NULL,
  `descripcion_servicio` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidad_de_medida`
--

CREATE TABLE `unidad_de_medida` (
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `simbolo` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `fk_imagen_orden_idx` (`id_orden`);

--
-- Indices de la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD PRIMARY KEY (`id_insumo`),
  ADD UNIQUE KEY `unique_nombre_insumo` (`nombre_insumo`),
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
  ADD UNIQUE KEY `codigo_orden` (`codigo_orden`),
  ADD KEY `fK_relacion_id_moto` (`id_moto`),
  ADD KEY `fk_relacion_id_usuario` (`id_usuario`),
  ADD KEY `relacion_tipo_servicio_fk` (`id_tipo_servicio`),
  ADD KEY `fk_relacion_estado_servicio` (`id_estado_de_servicio`),
  ADD KEY `fk_tecnico` (`id_tecnico_asignado`);

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
  ADD UNIQUE KEY `unique_correo` (`correo_usuario`),
  ADD KEY `fk_relacion_id_tipo_usuario` (`id_tipo_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clasificacion_de_usuarios`
--
ALTER TABLE `clasificacion_de_usuarios`
  MODIFY `id_tipo_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_de_orden_de_servicio`
--
ALTER TABLE `estado_de_orden_de_servicio`
  MODIFY `id_estado_de_servicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `imagenes_danos`
--
ALTER TABLE `imagenes_danos`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `insumos`
--
ALTER TABLE `insumos`
  MODIFY `id_insumo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `insumos_usados_en_servicio`
--
ALTER TABLE `insumos_usados_en_servicio`
  MODIFY `id_insumos_orden` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `modelo`
--
ALTER TABLE `modelo`
  MODIFY `id_modelo` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `motocicleta`
--
ALTER TABLE `motocicleta`
  MODIFY `id_moto` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenes_de_servicio`
--
ALTER TABLE `ordenes_de_servicio`
  MODIFY `id_orden` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_servicio`
--
ALTER TABLE `tipo_servicio`
  MODIFY `id_tipo_servicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `unidad_de_medida`
--
ALTER TABLE `unidad_de_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `imagenes_danos`
--
ALTER TABLE `imagenes_danos`
  ADD CONSTRAINT `fk_imagen_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_de_servicio` (`id_orden`);

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
  ADD CONSTRAINT `fk_moto_modelo` FOREIGN KEY (`id_modelo`) REFERENCES `modelo` (`id_modelo`),
  ADD CONSTRAINT `fk_moto_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_de_servicio`
--
ALTER TABLE `ordenes_de_servicio`
  ADD CONSTRAINT `fK_relacion_id_moto` FOREIGN KEY (`id_moto`) REFERENCES `motocicleta` (`id_moto`),
  ADD CONSTRAINT `fk_relacion_estado_servicio` FOREIGN KEY (`id_estado_de_servicio`) REFERENCES `estado_de_orden_de_servicio` (`id_estado_de_servicio`),
  ADD CONSTRAINT `fk_relacion_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_tecnico` FOREIGN KEY (`id_tecnico_asignado`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `relacion_tipo_servicio_fk` FOREIGN KEY (`id_tipo_servicio`) REFERENCES `tipo_servicio` (`id_tipo_servicio`);

--
-- Filtros para la tabla `registro_actividad`
--
ALTER TABLE `registro_actividad`
  ADD CONSTRAINT `fk_registro_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_de_servicio` (`id_orden`),
  ADD CONSTRAINT `fk_registro_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_tipo` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `clasificacion_de_usuarios` (`id_tipo_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
