import db from '../DatabaseConnection.js';

async function seed() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS person (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL
      );
    `);

    await db.query("TRUNCATE TABLE person RESTART IDENTITY CASCADE;")

    await db.query(`INSERT INTO person (first_name, last_name) VALUES 
    ('Mickey', 'Mouse'),
    ('Donald', 'Duck'),
    ('Minnie', 'Mouse'),
    ('Daisy', 'Duck'),
    ('Pluto', 'Dog'),
    ('Chip', 'Chipmuck'),
    ('Dale', 'Chipmuck'),
    ('Olive', 'Oil'),
    ('Bruce', 'Wayne'),
    ('Peter', 'Parker'),
    ('Clark', 'Kent'),
    ('Loise', 'Lane'),
    ('Luke', 'Skywalker');
  `)

    console.log("Seed executed successfully");
  } catch (error) {
    console.error("Seed failed: ", error.message);
  } finally {
    await db.close();
  }
}

seed();