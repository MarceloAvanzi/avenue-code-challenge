import Person from '../domain/Person.js'

export default class PersonService {

  constructor(personRepository) {
    this.personRepository = personRepository;
  }

  async insert(firstName, lastName) {
    const person = new Person(null, firstName, lastName);
    return await this.personRepository.create(person);
  }

  async findPeople(firstName = '', lastName = '') {
    return await this.personRepository.findByFilter({ firstName, lastName })
  }

  async getById(id) {
    return await this.personRepository.findById(id);
  }
}