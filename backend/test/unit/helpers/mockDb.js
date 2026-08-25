import { jest } from '@jest/globals';

export const setupOrdersMocks = async () => {
  jest.unstable_mockModule('../../../src/modules/orders/orders.model.js', () => ({
    default: {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTecnico: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateRevision: jest.fn(),
      updateEstado: jest.fn(),
      updateEstadoByTecnico: jest.fn()
    }
  }));

  jest.unstable_mockModule('../../../src/config/db.js', () => ({
    default: {
      query: jest.fn()
    }
  }));


  // importación de controldor y modelo ordenes
  const controller = await import('../../../src/modules/orders/orders.controller.js');
  const ordenes_de_servicio = (await import('../../../src/modules/orders/orders.model.js')).
  default;

  // Importación de la base de datos
  const db = (await import('../../../src/config/db.js')).default;

  return { controller, ordenes_de_servicio, db };
};

/**
 * Mocks para las pruebas del módulo de usuarios.
 * Usar en: test/unit/users.controller.test.js
 * 
 */
export const setupUsuariosMocks = async () => {
  jest.unstable_mockModule('../../../src/modules/users/usuarios.model.js', () => ({
    default: {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }));

  jest.unstable_mockModule('../../../src/config/db.js', () => ({
    default: {
      query: jest.fn()
    }
  }));

  // importación de controldor y modelo usuarios
  const usuariosController = await import('../../../src/modules/users/usuarios.controller.js');
  const usuarios = (await import('../../../src/modules/users/usuarios.model.js')).default;
  
  // Importación de la base de datos
  const db = (await import('../../../src/config/db.js')).default;

  return { usuariosController, usuarios, db };
};  

/**
 * Helper para simular el objeto "res" de Express en cualquier test.
 */
export const mockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});