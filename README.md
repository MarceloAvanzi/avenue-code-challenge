# Avenue Code Challenge

A Node.js REST API built with Express and PostgreSQL, following clean architecture principles.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js and Yarn

### Running the Project

1. **Start the database**
   ```bash
   docker compose up -d
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Seed the database**
   ```bash
   yarn seed
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

The API will be available at `http://localhost:3000`

### Testing

Run all tests:
```bash
yarn test
```

## Project Structure

- `src/domain/` - Domain entities and business logic
- `src/application/` - Application services and use cases
- `src/infrastructure/` - Controllers, database, and external dependencies
- `tests/` - Test files organized by type (unit, integration, e2e)
