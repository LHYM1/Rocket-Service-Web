import { jest } from '@jest/globals';
import { setupOrdersMocks, mockResponse } from './helpers/mockDb.js';

const { usuariosController, usuarios, db } = await setupOrdersMocks();
const {
  listarUsuario,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  restaurarUsuario,
  listarUsuariosSinMoto,
  listarTecnicosSinOrden,
  listarClientesConMoto
} = usuariosController;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('listarUsuario', () => {
  test('devuelve la lista de usuarios', async () => {
    const req = {};
    const res = mockResponse();
    ordenes_de_servicio.findAll.mockResolvedValue([{ id_usuario: 1 }]);

    await listarUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id_usuario: 1 }]);
  });

  test('devuelve 500 si falla la consulta', async () => {
    const req = {};
    const res = mockResponse();
    ordenes_de_servicio.findAll.mockRejectedValue(new Error('fallo'));

    await listarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});


describe('obtenerUsuario', () => {
    test('devuelve 200 si el usuario existe', async () => {
        const req = { params: { id: 1 }};
        const res = mockResponse();
        usuarios.findById.mockResolvedValue({ id_usuario: 1 }); 

        await obtenerUsuario(req, res);

        expect(res.json).toHaveBeenCalledWith({ id_usuario: 1 });
    });

    test ('devuelve 404 si el usuario no existe', async () => {
        const req = { params: { id: 99 }};
        const res = mockResponse();
        usuarios.findById.mockResolvedValue(undefined);
        
        await obtenerUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalled();
    })

    test('devuleve 500 si no hay conexión con la base de datos', async () => {
        const req = { params: { id: 1}};
        const res = mockResponse();
        usuarios.findById.mockRejectedValue(new Error('fallo la consulta'));

        await obtenerUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();
    })
})

// Crear usuario
describe('crearUsuario', () => {
  const datosValidos = {
    nombre: 'Carlos', apellido: 'Pinzón', correo_usuario: 'pinz@gmail.com'
  };

  test('devuelve 400 si faltan datos', async () => {
    const req = { body: { nombre: 'Carlos' } };
    const res = mockResponse();

    await crearUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  // correo duplicado
  test('devuelve 409 si el correo ya existe', async () => {
    const req = { body: datosValidos };
    const res = mockResponse();
    db.query.mockResolvedValue([[{ total: 1 }]]) // Simula que ya existe un usuario con ese correo

    await crearUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Ya existe un usuario con ese correo electrónico"})

    // usuario creado con éxito
    test('devuelve 201 si el usuario se crea correctamente', async () => {
      const req = { body: datosValidos };
      const res = mockResponse();
      db.query.mockResolvedValue([[{ total: 0 }]]); // Simula que no existe un usuario con ese correo
      usuarios.create.mockResolvedValue({ id_usuario: 48 }); 
      usuarios.findById.mockResolvedValue(null) // Simula que no hay usuario con ese correo

      await crearUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario creado correctamente" });
    });
  })

  test('crea el usuario y devuelve 200 en caso de éxito', async () => {
    const req = { body: datosValidos };
    const res = mockResponse();
    db.query.mockResolvedValue({ id: 48 });
    usuarios.create.mockResolvedValue(10);

    await crearUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Usuario creado exitosamente",
      id_usuario: 48
    });
  });

  test('devuelve 500 si falla la inserción', async () => {
    const req = { body: datosValidos };
    const res = mockResponse();
    db.query.mockResolvedValue([[{ total: 0}]]); 
    usuarios.create.mockRejectedValue(new Error('Insert fallido'));

    await crearOrden(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear el usuario' });
  });
});


