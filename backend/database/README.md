# Base de datos RocketService — Migraciones, Seeders y Backups

Este paquete se generó reconstruyendo el dump real de la base de datos
(`rocketService.sql`, exportado el 26/08/2026) en tres partes separadas,
siguiendo buenas prácticas de organización de base de datos.

## Estructura

```
database/
  ├── migrations/   → Estructura (CREATE TABLE), numerada según el orden
  │                   real de dependencias entre tablas (FK).
  ├── seeders/       → Datos iniciales/de prueba (INSERT), en el mismo
  │                    orden y numeración que las migraciones.
  └── backups/       → Copia íntegra del dump original, con fecha en
                       el nombre del archivo.
```

## Orden de ejecución de las migraciones

```
001_create_categoria
002_create_clasificacion_usuarios
003_create_estado_orden_servicio
004_create_unidad_medida
005_create_usuarios                      (depende de 002)
006_create_modelo
007_create_insumos                       (depende de 001, 004)
008_create_tipo_servicio
009_create_motocicleta                   (depende de 005, 006)
010_create_ordenes_de_servicio           (depende de 003, 005, 008, 009)
011_create_imagenes_danos
012_create_insumos_usados_en_servicio    (depende de 007, 010)
013_create_registro_actividad
```

Los seeders siguen exactamente el mismo orden y numeración.

## Cómo reconstruir la base de datos desde cero

```bash
mysql -u tu_usuario -p -e "CREATE DATABASE rocketService"
for f in database/migrations/*.sql; do
  mysql -u tu_usuario -p rocketService < "$f"
done
for f in database/seeders/*.sql; do
  mysql -u tu_usuario -p rocketService < "$f"
done
```

O, más simple para verificar rápido que todo funciona igual que el dump
original, puedes seguir usando directamente `backups/rocketService_backup_2026-08-26.sql`
completo en phpMyAdmin (Importar).

## Reglas para seguir manteniendo esto ordenado

1. **Nunca edites un archivo de migración ya ejecutado.** Si necesitas
   cambiar algo (agregar columna, corregir tipo de dato), crea un archivo
   **nuevo** con el siguiente número (ej. `014_alter_...sql`).
2. **Nunca mezcles `CREATE`/`ALTER` con `INSERT`** en el mismo archivo.
   Estructura → `migrations/`. Datos → `seeders/`.
3. **Genera un backup nuevo** (exportar desde phpMyAdmin) cada vez que
   hagas un cambio importante o antes de una entrega, nombrándolo con la
   fecha: `rocketService_backup_YYYY-MM-DD.sql`.

## Notas importantes detectadas al reconstruir (pendientes, no corregidas aquí)

Estas migraciones reflejan **fielmente el estado actual** de tu base de
datos, incluyendo sus inconsistencias ya identificadas en la documentación.
No se corrigieron aquí a propósito, para que la reconstrucción sea 100%
fiel al dump. Cuando quieras aplicar las mejoras ya definidas, se hacen
como migraciones **nuevas** (`014_...`, `015_...`, etc.), nunca editando
las existentes:

| # | Problema | Dónde |
|---|---|---|
| 1 | `id_tecnico_asignado` es `VARCHAR(20)`, debería ser `INT` con FK a `usuarios` | `ordenes_de_servicio` |
| 2 | `id_orden` es `VARCHAR(20)`, sin FK real a `ordenes_de_servicio` | `imagenes_danos` |
| 3 | No tiene FK reales a `ordenes_de_servicio` ni `usuarios` (solo índices sin restricción) | `registro_actividad` |
| 4 | No tiene campo de fecha/hora, indispensable para auditoría | `registro_actividad` |
| 5 | Falta campo `estado` (activo/inactivo) para softdelete | `categoria`, `unidad_de_medida`, `modelo`, `tipo_servicio` |
| 6 | Falta campo de stock (`stock_disponible`) | `insumos` |
| 7 | Falta `costo_mano_obra` | `tipo_servicio` |
| 8 | Falta `precio_unitario` y snapshot de precio al usarse | `insumos`, `insumos_usados_en_servicio` |
| 9 | No existe la tabla de tokens dedicada (actualmente `token_registro`/`token_expiracion` viven directo en `usuarios`, funcional pero no permite historial de tokens) | — |
| 10 | No existe tabla `calificacion_servicio` | — |
| 11 | Datos de prueba con problemas: contraseña sin cifrar (`usuarios.id_usuario=28`), correo mal formado (`id_usuario=13`), correos duplicados de "Andrés Ochoa", `estado_disponibilidad` con valores basura (`'efef'`, `'NOT NULL'` como texto literal), fecha inválida `0000-00-00` en una orden | `usuarios`, `registro_actividad`, `ordenes_de_servicio` |

Cuando quieras, seguimos con las migraciones de mejora (014 en adelante)
aplicando lo que ya definimos en la documentación.
