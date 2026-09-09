# Task Manager API

A simple CRUD REST API built with Express.js and SQLite.

---

## Why SQLite?

SQLite is a lightweight relational database that stores all data in a single file. It requires no separate database server and is ideal for learning backend development and small projects.

---

## Tech Stack

- Node.js
- Express.js
- SQLite
- better-sqlite3

---

## Database

Database file:

```text
tasks.db
```

The application automatically:

- Creates the database if it does not exist.
- Creates the tasks table if it does not exist.
- Inserts three sample tasks only on the first run.

---

## Installation

Clone the repository.

```bash
git clone <your-repository-url>
```

Install dependencies.

```bash
npm install
```

Start the project.

```bash
npm run dev
```

Server runs on

```text
http://localhost:3000
```

---

## API Endpoints

### Get all tasks

```http
GET /tasks
```

### Get task by id

```http
GET /tasks/:id
```

### Create task

```http
POST /tasks
```

Body

```json
{
  "title": "Learn SQLite"
}
```

### Update task

```http
PUT /tasks/:id
```

### Delete task

```http
DELETE /tasks/:id
```

---

## Example SQL Query

```sql
SELECT * FROM tasks;
```

---

## Database Screenshot

(Add your DB Browser screenshot here.)

---

## Persistence

Data is stored inside tasks.db, so restarting the Node.js server does not delete existing tasks.
