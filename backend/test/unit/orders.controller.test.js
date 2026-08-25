import { jest } from '@jest/globals';
import { setupOrdersMocks, mockResponse } from './helpers/mockDb.js';

const { controller, ordenes_de_servicio, db } = await setupOrdersMocks();
const {
  terminarRevision,
  crearOrden,
  actualizarEstadoOrden,
  actualizarEstadoPorTecnico,
  listarOrden,
  obtenerOrden,
  actualizarOrden,
  eliminarOrden,
  listarMisOrdenes
} = controller;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('terminarRevision', () => {
  test('devuelve 400 si faltan campos obligatorios', async () => {
    const req = { body: { id_tipo_servicio: '1' } };
    const res = mockResponse();

    await terminarRevision(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(ordenes_de_servicio.updateRevision).not.toHaveBeenCalled();
  });

  test('devuelve 404 si la orden no existe', async () => {
    const req = { params: { id: 99 }, body: { id_tipo_servicio: '1', descripcion_del_problema: 'x' } };
    const res = mockResponse();
    ordenes_de_servicio.updateRevision.mockResolvedValue(false);

    await terminarRevision(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('devuelve 200 si la revisión se completa', async () => {
    const req = { params: { id: 5 }, body: { id_tipo_servicio: '1', descripcion_del_problema: 'x' } };
    const res = mockResponse();
    ordenes_de_servicio.updateRevision.mockResolvedValue(true);

    await terminarRevision(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Revisión completada correctamente" });
  });
});

describe('crearOrden', () => {
  const datosValidos = {
    id_moto: 1, id_usuario: 2, id_tecnico_asignado: 3,
    id_estado_de_servicio: 1, fecha_finalizacion_estimada: '2026-01-01'
  };

  test('devuelve 400 si faltan datos', async () => {
    const req = { body: { id_moto: 1 } };
    const res = mockResponse();

    await crearOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('crea la orden y devuelve 201 con código autogenerado', async () => {
    const req = { body: datosValidos };
    const res = mockResponse();
    db.query.mockResolvedValue([[{ total: 4 }]]);
    ordenes_de_servicio.create.mockResolvedValue(10);

    await crearOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Orden creada correctamente",
      codigo_orden: 'ORD-005'
    });
  });

  test('devuelve 500 si falla la consulta de conteo', async () => {
    const req = { body: datosValidos };
    const res = mockResponse();
    db.query.mockRejectedValue(new Error('Conexión perdida'));

    await crearOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('devuelve 500 si falla la inserción en el modelo', async () => {
    const req = { body: datosValidos };
    const res = mockResponse();
    db.query.mockResolvedValue([[{ total: 0 }]]);
    ordenes_de_servicio.create.mockRejectedValue(new Error('Insert fallido'));

    await crearOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insert fallido' });
  });
});

describe('actualizarEstadoOrden', () => {
  test('devuelve 404 si la orden no existe', async () => {
    const req = { params: { id: 1 }, body: { id_estado_de_servicio: 2 } };
    const res = mockResponse();
    ordenes_de_servicio.updateEstado.mockResolvedValue(false);

    await actualizarEstadoOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('devuelve 200 si se actualiza correctamente', async () => {
    const req = { params: { id: 1 }, body: { id_estado_de_servicio: 2 } };
    const res = mockResponse();
    ordenes_de_servicio.updateEstado.mockResolvedValue(true);

    await actualizarEstadoOrden(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Estado actualizado correctamente" });
  });
});

describe('actualizarEstadoPorTecnico', () => {
  // NOTA: el controlador actual no valida si "actualizado" es false, por lo que siempre responde 200. Esto podría cambiar en el futuro.
  test('responde 200 aunque no se haya actualizado ninguna fila (comportamiento actual)', async () => {
    const req = { params: { idTecnico: 3 }, body: { id_estado_de_servicio: 2 } };
    const res = mockResponse();
    ordenes_de_servicio.updateEstadoByTecnico.mockResolvedValue(false);

    await actualizarEstadoPorTecnico(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Estado actualizado" });
  });
});

describe('listarOrden', () => {
  test('devuelve la lista de órdenes', async () => {
    const req = {};
    const res = mockResponse();
    ordenes_de_servicio.findAll.mockResolvedValue([{ id_orden: 1 }]);

    await listarOrden(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id_orden: 1 }]);
  });

  test('devuelve 500 si falla la consulta', async () => {
    const req = {};
    const res = mockResponse();
    ordenes_de_servicio.findAll.mockRejectedValue(new Error('fallo'));

    await listarOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('obtenerOrden', () => {
  test('devuelve 404 si no existe la orden', async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();
    ordenes_de_servicio.findById.mockResolvedValue(undefined);

    await obtenerOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('devuelve la orden si existe', async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();
    ordenes_de_servicio.findById.mockResolvedValue({ id_orden: 1 });

    await obtenerOrden(req, res);

    expect(res.json).toHaveBeenCalledWith({ id_orden: 1 });
  });
});

describe('actualizarOrden', () => {
  test('devuelve 404 si no existe la orden', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = mockResponse();
    ordenes_de_servicio.update.mockResolvedValue(false);

    await actualizarOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('devuelve 200 si se actualiza correctamente', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = mockResponse();
    ordenes_de_servicio.update.mockResolvedValue(true);

    await actualizarOrden(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Orden actualizada correctamente" });
  });
});

describe('eliminarOrden', () => {
  test('devuelve 404 si no existe la orden', async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();
    ordenes_de_servicio.delete.mockResolvedValue(false);

    await eliminarOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('devuelve 200 si es cancelada correctamente', async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();
    ordenes_de_servicio.delete.mockResolvedValue(true);

    await eliminarOrden(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Orden eliminada" });
  });
});

describe('listarMisOrdenes', () => {
  test('devuelve las órdenes del técnico autenticado', async () => {
    const req = { user: { id: 7 } };
    const res = mockResponse();
    ordenes_de_servicio.findByTecnico.mockResolvedValue([{ id_orden: 1 }]);

    await listarMisOrdenes(req, res);

    expect(ordenes_de_servicio.findByTecnico).toHaveBeenCalledWith(7);
    expect(res.json).toHaveBeenCalledWith([{ id_orden: 1 }]);
  });

  test('devuelve 500 si falla la consulta', async () => {
    const req = { user: { id: 7 } };
    const res = mockResponse();
    ordenes_de_servicio.findByTecnico.mockRejectedValue(new Error('fallo'));

    await listarMisOrdenes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});