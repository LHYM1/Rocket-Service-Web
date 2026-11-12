// cypress/support/datos.js
export const decodificarJwt = (t) =>
  JSON.parse(
    decodeURIComponent(
      atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
  );

export const ORDEN = (o = {}) => ({
  id_orden: 1, codigo_orden: 'ORD-001', nombre_cliente: 'Ana Ruiz', id_usuario: 900002, id_moto: 1,
  placa_moto: 'ABC 12D', nombre_modelo: 'DUKE 200', nombre_tecnico: 'Tecnico QA', id_tecnico_asignado: 900001,
  nombre_servicio: 'CAMBIO DE ACEITE', id_tipo_servicio: 1, nombre_estado: 'ASIGNADA', id_estado_de_servicio: 1,
  fecha_de_creacion: '2026-11-01T10:00:00.000Z', fecha_finalizacion_estimada: '2026-11-20T10:00:00.000Z',
  descripcion_del_problema: 'Ruido en el motor', motivo_rechazo: null, ...o,
});

export const USUARIOS = [
  { id_usuario: 11, nombre: 'Laura', apellido: 'Gómez', correo_usuario: 'laura@gmail.com', telefono_usuario: '3001112233', categoria_usuario: 'Cliente', id_tipo_usuario: 1, estado: 2 },
  { id_usuario: 12, nombre: '', apellido: '', correo_usuario: 'tec.pendiente@gmail.com', telefono_usuario: null, categoria_usuario: 'Técnico', id_tipo_usuario: 2, estado: 1 },
  { id_usuario: 13, nombre: 'Mario', apellido: 'Pérez', correo_usuario: 'mario@gmail.com', telefono_usuario: '3004445566', categoria_usuario: 'Técnico', id_tipo_usuario: 2, estado: 2 },
  { id_usuario: 14, nombre: 'Sofía', apellido: 'Rojas', correo_usuario: 'sofia@gmail.com', telefono_usuario: '3007778899', categoria_usuario: 'Cliente', id_tipo_usuario: 1, estado: 0 },
];

export const TIPOS_USUARIO = [
  { id_tipo_usuario: 1, categoria_usuario: 'Cliente' },
  { id_tipo_usuario: 2, categoria_usuario: 'Técnico' },
  { id_tipo_usuario: 3, categoria_usuario: 'Administrador' },
];

export const CATEGORIAS = [
  { id_categoria: 1, nombre: 'LUBRICANTES', descripcion: 'Aceites', estado: 1, total_insumos: 2 },
  { id_categoria: 2, nombre: 'FRENOS', descripcion: 'Pastillas', estado: 1, total_insumos: 1 },
];

export const UNIDADES = [
  { id_unidad: 1, nombre: 'LITRO', simbolo: 'L' },
  { id_unidad: 2, nombre: 'UNIDAD', simbolo: 'UND' },
];

export const INSUMOS = [
  { id_insumo: 1, categoria: 'LUBRICANTES', id_categoria: 1, unidad_de_medida: 'LITRO', id_unidad: 1, simbolo_unidad: 'L', nombre_insumo: 'ACEITE 20W50', cantidad_disponible: 10, precio_unitario: 25000, estado: true },
  { id_insumo: 2, categoria: 'FRENOS', id_categoria: 2, unidad_de_medida: 'UNIDAD', id_unidad: 2, simbolo_unidad: 'UND', nombre_insumo: 'BUJIA', cantidad_disponible: 0, precio_unitario: 8000, estado: false },
  { id_insumo: 3, categoria: 'FRENOS', id_categoria: 2, unidad_de_medida: 'UNIDAD', id_unidad: 2, simbolo_unidad: 'UND', nombre_insumo: 'PASTILLAS', cantidad_disponible: 4, precio_unitario: 30000, estado: true },
];

export const TIPOS_SERVICIO = [
  { id_tipo_servicio: 1, nombre_servicio: 'CAMBIO DE ACEITE', descripcion_servicio: 'Aceite y filtro', estado: 1 },
  { id_tipo_servicio: 2, nombre_servicio: 'AJUSTE DE FRENOS', descripcion_servicio: null, estado: 0 },
];

export const MOTOS = [
  { id_moto: 1, placa: 'ABC 12D', kilometraje_actual: 2000, id_modelo: 1, id_usuario: 7, estado: 1, nombre_usuario: 'Ana', apellido_usuario: 'Ruiz', nombre_modelo: 'DUKE 200' },
  { id_moto: 2, placa: 'XYZ 98K', kilometraje_actual: 15000, id_modelo: 2, id_usuario: 8, estado: 0, nombre_usuario: 'Luis', apellido_usuario: 'Mora', nombre_modelo: 'NKD 125' },
];

export const MODELOS = [
  { id_modelo: 1, nombre: 'DUKE 200', estado: 1, total_motos: 1 },
  { id_modelo: 2, nombre: 'NKD 125', estado: 0, total_motos: 0 },
];