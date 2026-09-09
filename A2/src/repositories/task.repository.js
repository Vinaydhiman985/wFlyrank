const db = require('../database/db'); // Tumhara naya SQLite db connection

exports.getAllTasks = async () => {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    // SQLite me boolean 0/1 hota hai, usko wapas true/false me convert kar rahe hain
    return tasks.map(task => ({
        ...task,
        done: task.done === 1
    }));
};

exports.getTaskById = async (id) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return null;
    return { ...task, done: task.done === 1 };
};

exports.createTask = async (title) => {
    const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)');
    const info = stmt.run(title);
    
    return {
        id: info.lastInsertRowid,
        title,
        done: false
    };
};

exports.updateTask = async (id, title, done) => {
    const stmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
    const info = stmt.run(title, done ? 1 : 0, id);
    
    if (info.changes === 0) return null; // Task nahi mila
    
    return this.getTaskById(id); // Update hone ke baad naya task return karo
};

exports.deleteTask = async (id) => {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const info = stmt.run(id);
    
    return info.changes > 0; // True return karega agar delete hua, warna false
};