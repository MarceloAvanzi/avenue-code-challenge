import express from "express";

export default class PersonController {
  constructor(personService) {
    this.personService = personService;
    this.router = express.Router();

    this.router.post('/create', this.createPerson.bind(this));
    this.router.post('/list', this.listPeople.bind(this));
    this.router.get('/:id', this.getById.bind(this));
  }

  async listPeople(req, res) {
    try {
      const { firstName, lastName } = req.query;
      const people = await this.personService.findPeople(firstName, lastName);

      res.status(200).json(people);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createPerson(req, res) {
    try {
      const { firstName, lastName } = req.body;
      if (!firstName || !lastName) return res.status(400).json({ error: 'firstName and lastName are required' })

      const person = await this.personService.insert(firstName, lastName);

      res.status(201).json(person);
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const person = await this.personService.getById(Number(id));
      if (!person) return res.status(404).json({ error: 'Person not found' })

      res.status(200).json(person);
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}