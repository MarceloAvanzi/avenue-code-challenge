import { describe, it, expect, beforeAll, beforeEach, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import PersonRepository from '../../src/infrastructure/database/repositories/PersonRepository.js';
import PersonService from '../../src/application/PersonService.js';
import PersonController from '../../src/infrastructure/controllers/PersonController.js';

describe('Person API E2E Tests', () => {
  let app;
  let server;
  let mockDb;
  
  beforeAll(() => {
    mockDb = {
      query: jest.fn()
    };

    app = express();
    app.use(express.json());

    const personRepository = new PersonRepository(mockDb);
    const personService = new PersonService(personRepository);
    const personController = new PersonController(personService);

    app.use('/person', personController.router);

    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
      res.status(500).json({ error: err.message });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('POST /person/create', () => {
    it('should create a person successfully', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .post('/person/create')
        .send({ firstName: 'John', lastName: 'Doe' })
        .expect(201);

      expect(response.body).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO person(first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name',
        ['John', 'Doe']
      );
    });

    it('should return 400 when firstName is missing', async () => {
      const response = await request(app)
        .post('/person/create')
        .send({ lastName: 'Doe' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'firstName and lastName are required'
      });

      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it('should return 400 when lastName is missing', async () => {
      const response = await request(app)
        .post('/person/create')
        .send({ firstName: 'John' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'firstName and lastName are required'
      });

      expect(mockDb.query).not.toHaveBeenCalled();
    });

    it('should return 400 when both names are missing', async () => {
      const response = await request(app)
        .post('/person/create')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'firstName and lastName are required'
      });
    });

    it('should handle special characters in names', async () => {
      const dbResult = [{ id: 1, first_name: "José María", last_name: "O'Connor" }];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .post('/person/create')
        .send({ firstName: "José María", lastName: "O'Connor" })
        .expect(201);

      expect(response.body.firstName).toBe("José María");
      expect(response.body.lastName).toBe("O'Connor");
    });
  });

  describe('GET /person/:id', () => {
    it('should get person by id successfully', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .get('/person/1')
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, first_name, last_name FROM person WHERE id = $1',
        [1]
      );
    });

    it('should return 404 when person not found', async () => {
      mockDb.query.mockResolvedValue([]);

      const response = await request(app)
        .get('/person/999')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Person not found'
      });
    });
  });

  describe('POST /person/list', () => {
    it('should list all people when no filters provided', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .post('/person/list')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual([
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' }
      ]);
    });

    it('should filter people by firstName', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 3, first_name: 'John', last_name: 'Smith' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .post('/person/list?firstName=John')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(person => person.firstName === 'John')).toBe(true);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        ['john', null]
      );
    });

    it('should filter people by lastName', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Doe' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .post('/person/list?lastName=Doe')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(person => person.lastName === 'Doe')).toBe(true);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        [null, 'doe']
      );
    });

    it('should filter people by both firstName and lastName', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      const response = await request(app)
        .post('/person/list?firstName=John&lastName=Doe')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        ['john', 'doe']
      );
    });

    it('should return empty array when no matches found', async () => {
      mockDb.query.mockResolvedValue([]);

      const response = await request(app)
        .post('/person/list?firstName=NonExistent')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Complete User Scenario', () => {
    it('should support complete CRUD workflow', async () => {
      const createDbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValueOnce(createDbResult);

      const createResponse = await request(app)
        .post('/person/create')
        .send({ firstName: 'John', lastName: 'Doe' })
        .expect(201);

      expect(createResponse.body.id).toBe(1);

      const getDbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValueOnce(getDbResult);

      const getResponse = await request(app)
        .get('/person/1')
        .expect(200);

      expect(getResponse.body).toEqual(createResponse.body);

      const searchDbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValueOnce(searchDbResult);

      const searchResponse = await request(app)
        .post('/person/list?firstName=John')
        .expect(200);

      expect(searchResponse.body).toContainEqual(createResponse.body);
    });
  });
});