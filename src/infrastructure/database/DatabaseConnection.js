import { Pool } from "pg";

class DatabaseConnection {
  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'app',
      password: 'app',
      database: 'maindb'
    });
  }

  async query(sql, params) {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async close() {
    await this.pool.end();
  }
}

const db =  new DatabaseConnection();
export default db;