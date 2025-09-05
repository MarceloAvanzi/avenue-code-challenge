import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PersonController from '../../src/infrastructure/controllers/PersonController.js';
import PersonService from '../../src/application/PersonService.js';
import PersonRepository from '../../src/infrastructure/database/repositories/PersonRepository.js';

describe('PersonController Integration Tests', () => {
  let personController;
  let personService;
  let personRepository;
  let mockDb;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    
    personRepository = new PersonRepository(mockDb);
    personService = new PersonService(personRepository);
    personController = new PersonController(personService);

    mockReq = {
      body: {},
      query: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('Full Request-Response Flow', () => {
    it('should handle complete create person flow', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      mockReq.body = { firstName: 'John', lastName: 'Doe' };

      await personController.createPerson(mockReq, mockRes);

      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO person(first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name',
        ['John', 'Doe']
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });

    it('should handle complete get person by id flow', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      mockReq.params = { id: '1' };

      await personController.getById(mockReq, mockRes);

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, first_name, last_name FROM person WHERE id = $1',
        [1]
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });

    it('should handle complete list people flow with filters', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'John', last_name: 'Smith' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      mockReq.query = { firstName: 'John', lastName: '' };

      await personController.listPeople(mockReq, mockRes);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        ['john', null]
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ firstName: 'John', lastName: 'Doe' }),
          expect.objectContaining({ firstName: 'John', lastName: 'Smith' })
        ])
      );
    });
  });
});