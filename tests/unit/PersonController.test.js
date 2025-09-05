import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PersonController from '../../src/infrastructure/controllers/PersonController.js';
import Person from '../../src/domain/Person.js';

describe('PersonController', () => {
  let personController;
  let mockPersonService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPersonService = {
      insert: jest.fn(),
      findPeople: jest.fn(),
      getById: jest.fn()
    };

    mockReq = {
      body: {},
      query: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    personController = new PersonController(mockPersonService);
  });

  describe('createPerson', () => {
    it('should create person successfully', async () => {
      const newPerson = new Person(1, 'John', 'Doe');
      mockReq.body = { firstName: 'John', lastName: 'Doe' };
      mockPersonService.insert.mockResolvedValue(newPerson);

      await personController.createPerson(mockReq, mockRes);

      expect(mockPersonService.insert).toHaveBeenCalledWith('John', 'Doe');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newPerson);
    });

    it('should return 400 when firstName is missing', async () => {
      mockReq.body = { lastName: 'Doe' };

      await personController.createPerson(mockReq, mockRes);

      expect(mockPersonService.insert).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'firstName and lastName are required'
      });
    });

    it('should return 400 when lastName is missing', async () => {
      mockReq.body = { firstName: 'John' };

      await personController.createPerson(mockReq, mockRes);

      expect(mockPersonService.insert).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'firstName and lastName are required'
      });
    });

    it('should return 400 when both names are missing', async () => {
      mockReq.body = {};

      await personController.createPerson(mockReq, mockRes);

      expect(mockPersonService.insert).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'firstName and lastName are required'
      });
    });
  });

  describe('listPeople', () => {
    it('should list people with filters', async () => {
      const people = [new Person(1, 'John', 'Doe')];
      mockReq.query = { firstName: 'John', lastName: 'Doe' };
      mockPersonService.findPeople.mockResolvedValue(people);

      await personController.listPeople(mockReq, mockRes);

      expect(mockPersonService.findPeople).toHaveBeenCalledWith('John', 'Doe');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(people);
    });

    it('should list people without filters', async () => {
      const people = [
        new Person(1, 'John', 'Doe'),
        new Person(2, 'Jane', 'Smith')
      ];
      mockReq.query = {};
      mockPersonService.findPeople.mockResolvedValue(people);

      await personController.listPeople(mockReq, mockRes);

      expect(mockPersonService.findPeople).toHaveBeenCalledWith(undefined, undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(people);
    });
  });

  describe('getById', () => {
    it('should get person by id successfully', async () => {
      const person = new Person(1, 'John', 'Doe');
      mockReq.params = { id: '1' };
      mockPersonService.getById.mockResolvedValue(person);

      await personController.getById(mockReq, mockRes);

      expect(mockPersonService.getById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(person);
    });

    it('should return 404 when person not found', async () => {
      mockReq.params = { id: '999' };
      mockPersonService.getById.mockResolvedValue(null);

      await personController.getById(mockReq, mockRes);

      expect(mockPersonService.getById).toHaveBeenCalledWith(999);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Person not found' });
    });
  });

  describe('Router initialization', () => {
    it('should have router property', () => {
      expect(personController.router).toBeDefined();
    });
  });
});