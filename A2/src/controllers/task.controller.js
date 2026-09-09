const taskService = require('../services/task.service');

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await taskService.getAllTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const task = await taskService.createTask(title);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, done } = req.body;

        if (title === undefined || done === undefined) {
            return res.status(400).json({ error: 'Title and done are required' });
        }

        const task = await taskService.updateTask(req.params.id, title, done);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deleted = await taskService.deleteTask(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
