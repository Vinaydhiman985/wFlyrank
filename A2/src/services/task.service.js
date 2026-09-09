const taskRepository = require('../repositories/task.repository');

function parseId(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new Error('Invalid task id');
    }
    return parsedId;
}

async function createTask(title) {
    if (typeof title !== 'string' || title.trim() === '') {
        throw new Error('Title is required');
    }

    return await taskRepository.createTask(title.trim());
}

exports.getAllTasks = async () => await taskRepository.getAllTasks();

exports.getTaskById = async (id) => {
    const parsedId = parseId(id);
    return await taskRepository.getTaskById(parsedId);
};

exports.createTask = createTask;

exports.updateTask = async (id, title, done) => {
    const parsedId = parseId(id);
    return await taskRepository.updateTask(parsedId, title, done);
};

exports.deleteTask = async (id) => {
    const parsedId = parseId(id);
    return await taskRepository.deleteTask(parsedId);
};
