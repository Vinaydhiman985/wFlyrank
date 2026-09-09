const Database = require('better-sqlite3');
const path = require('path');

// SQLite database create ya open karo
const db = new Database(path.join(__dirname, '../tasks.db'));

// Table create karo agar nahi bani hai
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

// Check karo ki table khali hai ya nahi
const checkEmpty = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (checkEmpty.count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Learn Node.js', 0);
  insert.run('Setup SQLite', 1);
  insert.run('Complete A2 Assignment', 0);
  console.log('Database seeded with 3 example tasks.');
}

module.exports = db;