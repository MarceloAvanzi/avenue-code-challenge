import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PersonRepository from '../../src/infrastructure/database/repositories/PersonRepository.js';
import Person from '../../src/domain/Person.js';

describe('PersonRepository', () => {
  let personRepository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    
    personRepository = new PersonRepository(mockDb);
    
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a person successfully', async () => {
      const inputPerson = new Person(null, 'John', 'Doe');
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.create(inputPerson);

      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO person(first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name',
        ['John', 'Doe']
      );
      expect(result).toBeInstanceOf(Person);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should handle special characters in names', async () => {
      const inputPerson = new Person(null, "O'Connor", "D'Angelo");
      const dbResult = [{ id: 2, first_name: "O'Connor", last_name: "D'Angelo" }];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.create(inputPerson);

      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO person(first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name',
        ["O'Connor", "D'Angelo"]
      );
      expect(result.firstName).toBe("O'Connor");
      expect(result.lastName).toBe("D'Angelo");
    });
  });

  describe('findByFilter', () => {
    it('should find people with both firstName and lastName filters', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'John', last_name: 'Doe' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.findByFilter({ 
        firstName: 'John', 
        lastName: 'Doe' 
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        ['john', 'doe']
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Person);
      expect(result[0].firstName).toBe('John');
      expect(result[0].lastName).toBe('Doe');
    });

    it('should find people with only firstName filter', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'John', last_name: 'Smith' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.findByFilter({ 
        firstName: 'John', 
        lastName: '' 
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        ['john', null]
      );
      expect(result).toHaveLength(2);
    });

    it('should find people with only lastName filter', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 3, first_name: 'Jane', last_name: 'Doe' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.findByFilter({ 
        firstName: '', 
        lastName: 'Doe' 
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        [null, 'doe']
      );
      expect(result).toHaveLength(2);
    });

    it('should find all people with empty filters', async () => {
      const dbResult = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.findByFilter({ 
        firstName: '', 
        lastName: '' 
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        [null, null]
      );
      expect(result).toHaveLength(2);
    });

    it('should handle case insensitive search', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      await personRepository.findByFilter({ 
        firstName: 'JOHN', 
        lastName: 'DOE' 
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, first_name, last_name'),
        ['john', 'doe']
      );
    });
  });

  describe('findById', () => {
    it('should find person by id successfully', async () => {
      const dbResult = [{ id: 1, first_name: 'John', last_name: 'Doe' }];
      mockDb.query.mockResolvedValue(dbResult);

      const result = await personRepository.findById(1);

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, first_name, last_name FROM person WHERE id = $1',
        [1]
      );
      expect(result).toBeInstanceOf(Person);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should return null when person not found', async () => {
      mockDb.query.mockResolvedValue([]);

      const result = await personRepository.findById(999);

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, first_name, last_name FROM person WHERE id = $1',
        [999]
      );
      expect(result).toBeNull();
    });
  });
});