import { describe, it, expect } from '@jest/globals';
import Person from '../../src/domain/Person.js';

describe('Person Domain Model', () => {
  describe('Constructor', () => {
    it('should create a person with all properties', () => {
      const person = new Person(1, 'John', 'Doe');

      expect(person.id).toBe(1);
      expect(person.firstName).toBe('John');
      expect(person.lastName).toBe('Doe');
    });

    it('should create a person with null id', () => {
      const person = new Person(null, 'Jane', 'Smith');

      expect(person.id).toBeNull();
      expect(person.firstName).toBe('Jane');
      expect(person.lastName).toBe('Smith');
    });

    it('should handle empty string names', () => {
      const person = new Person(1, '', '');

      expect(person.id).toBe(1);
      expect(person.firstName).toBe('');
      expect(person.lastName).toBe('');
    });
  });
});
