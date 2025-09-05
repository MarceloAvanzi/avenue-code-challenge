import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PersonService from '../../src/application/PersonService.js';
import PersonRepository from '../../src/infrastructure/database/repositories/PersonRepository.js';
import Person from '../../src/domain/Person.js';

describe('PersonService Integration Tests', () => {
  let personService;
  let personRepository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    
    personRepository = new PersonRepository(mockDb);
    personService = new PersonService(personRepository);
    
    jest.clearAllMocks();
  });

  describe('Complete Person Workflow', () => {
    it('should create and retrieve a person successfully', async () => {
      const createDbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      const findDbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];

      mockDb.query
        .mockResolvedValueOnce(createDbResult)
        .mockResolvedValueOnce(findDbResult);

      const createdPerson = await personService.insert('John', 'Doe');
      expect(createdPerson).toBeInstanceOf(Person);
      expect(createdPerson.id).toBe(1);
      expect(createdPerson.firstName).toBe('John');
      expect(createdPerson.lastName).toBe('Doe');

      const retrievedPerson = await personService.getById(1);
      expect(retrievedPerson).toBeInstanceOf(Person);
      expect(retrievedPerson.id).toBe(1);
      expect(retrievedPerson.firstName).toBe('John');
      expect(retrievedPerson.lastName).toBe('Doe');

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(mockDb.query).toHaveBeenNthCalledWith(1,
        'INSERT INTO person(first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name',
        ['John', 'Doe']
      );
      expect(mockDb.query).toHaveBeenNthCalledWith(2,
        'SELECT id, first_name, last_name FROM person WHERE id = $1',
        [1]
      );
    });

    it('should create multiple people and search by filters', async () => {
      const createResults = [
        [{ id: 1, first_name: 'John', last_name: 'Doe' }],
        [{ id: 2, first_name: 'Jane', last_name: 'Doe' }],
        [{ id: 3, first_name: 'John', last_name: 'Smith' }]
      ];

      const searchByFirstNameResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 3, first_name: 'John', last_name: 'Smith' }
      ];

      const searchByLastNameResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Doe' }
      ];

      mockDb.query
        .mockResolvedValueOnce(createResults[0])
        .mockResolvedValueOnce(createResults[1])
        .mockResolvedValueOnce(createResults[2])
        .mockResolvedValueOnce(searchByFirstNameResult)
        .mockResolvedValueOnce(searchByLastNameResult);

      await personService.insert('John', 'Doe');
      await personService.insert('Jane', 'Doe');
      await personService.insert('John', 'Smith');

      const johnResults = await personService.findPeople('John', '');
      expect(johnResults).toHaveLength(2);
      expect(johnResults.every(p => p.firstName === 'John')).toBe(true);

      const doeResults = await personService.findPeople('', 'Doe');
      expect(doeResults).toHaveLength(2);
      expect(doeResults.every(p => p.lastName === 'Doe')).toBe(true);

      expect(mockDb.query).toHaveBeenCalledTimes(5);
    });

    it('should handle cascading errors from repository to service', async () => {
      const error = new Error('Database connection lost');
      mockDb.query.mockRejectedValue(error);

      await expect(personService.insert('John', 'Doe')).rejects.toThrow('Database connection lost');
      await expect(personService.getById(1)).rejects.toThrow('Database connection lost');
      await expect(personService.findPeople('John')).rejects.toThrow('Database connection lost');
    });
  });
});