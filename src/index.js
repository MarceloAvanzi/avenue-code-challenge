import express from 'express';
import PersonRepository from './infrastructure/database/repositories/PersonRepository.js';
import PersonService from './application/PersonService.js';
import PersonController from './infrastructure/controllers/PersonController.js';

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const personRepository = new PersonRepository();
const personService = new PersonService(personRepository);
const personController = new PersonController(personService);

app.use('/person', personController.router)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});