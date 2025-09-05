import Person from '../../../domain/Person.js';
import db from '../DatabaseConnection.js';

export default class PersonRepository {
  constructor(database = db) {
    this.db = database;
  }

  async create(user) {
    const result = await this.db.query(
      'INSERT INTO person(first_name, last_name) VALUES ($1, $2) RETURNING id, first_name, last_name',
      [user.firstName, user.lastName]
    );
    const row = result[0];
    return new Person(row.id, row.first_name, row.last_name);
  }

  async findByFilter(filters) {
    const { firstName, lastName } = filters;

    const rows = await this.db.query(`
      SELECT id, first_name, last_name
      FROM person
      WHERE ($1::text IS NULL OR LOWER(first_name) = $1)
        AND ($2::text IS NULL OR LOWER(last_name) = $2)
    `,
      [
        firstName ? `${firstName.toLowerCase()}` : null,
        lastName ? `${lastName.toLowerCase()}` : null
      ]);

    return rows.map(r => new Person(r.id, r.first_name, r.last_name));
  }

  async findById(id) {
    const person = await this.db.query('SELECT id, first_name, last_name FROM person WHERE id = $1', [id]);
    if (person.length === 0) return null;

    return new Person(person[0].id, person[0].first_name, person[0].last_name);
  }
}