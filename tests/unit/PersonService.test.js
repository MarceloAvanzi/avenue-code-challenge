import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PersonService from '../../src/application/PersonService.js';
import Person from '../../src/domain/Person.js';

describe('PersonService', () => {
  let personService;
  let mockPersonRepository;

  beforeEach(() => {
    mockPersonRepository = {
      create: jest.fn(),
      findByFilter: jest.fn(),
      findById: jest.fn()
    };
    personService = new PersonService(mockPersonRepository);
  });

  describe('insert', () => {
    it('should create a new person successfully', async () => {
      const expectedPerson = new Person(1, 'John', 'Doe');
      mockPersonRepository.create.mockResolvedValue(expectedPerson);

      const result = await personService.insert('John', 'Doe');

      expect(mockPersonRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: null,
          firstName: 'John',
          lastName: 'Doe'
        })
      );
      expect(result).toEqual(expectedPerson);
    });

    it('should pass person with null id to repository', async () => {
      const expectedPerson = new Person(2, 'Jane', 'Smith');
      mockPersonRepository.create.mockResolvedValue(expectedPerson);

      await personService.insert('Jane', 'Smith');

      const personArg = mockPersonRepository.create.mock.calls[0][0];
      expect(personArg).toBeInstanceOf(Person);
      expect(personArg.id).toBeNull();
      expect(personArg.firstName).toBe('Jane');
      expect(personArg.lastName).toBe('Smith');
    });
  });

  describe('findPeople', () => {
    it('should find people with both filters provided', async () => {
      const expectedPeople = [
        new Person(1, 'John', 'Doe'),
        new Person(2, 'John', 'Smith')
      ];
      mockPersonRepository.findByFilter.mockResolvedValue(expectedPeople);

      const result = await personService.findPeople('John', 'Doe');

      expect(mockPersonRepository.findByFilter).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(result).toEqual(expectedPeople);
    });

    it('should find people with only firstName filter', async () => {
      const expectedPeople = [new Person(1, 'John', 'Doe')];
      mockPersonRepository.findByFilter.mockResolvedValue(expectedPeople);

      const result = await personService.findPeople('John');

      expect(mockPersonRepository.findByFilter).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: ''
      });
      expect(result).toEqual(expectedPeople);
    });

    it('should find people with no filters (default empty strings)', async () => {
      const expectedPeople = [
        new Person(1, 'John', 'Doe'),
        new Person(2, 'Jane', 'Smith')
      ];
      mockPersonRepository.findByFilter.mockResolvedValue(expectedPeople);

      const result = await personService.findPeople();

      expect(mockPersonRepository.findByFilter).toHaveBeenCalledWith({
        firstName: '',
        lastName: ''
      });
      expect(result).toEqual(expectedPeople);
    });
  });

  describe('getById', () => {
    it('should find person by id successfully', async () => {
      const expectedPerson = new Person(1, 'John', 'Doe');
      mockPersonRepository.findById.mockResolvedValue(expectedPerson);

      const result = await personService.getById(1);

      expect(mockPersonRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedPerson);
    });

    it('should return null when person not found', async () => {
      mockPersonRepository.findById.mockResolvedValue(null);

      const result = await personService.getById(999);

      expect(mockPersonRepository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });
});