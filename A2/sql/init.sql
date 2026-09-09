CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    done BOOLEAN DEFAULT FALSE
);

INSERT INTO tasks (title, done)
SELECT 'Learn Express', FALSE
WHERE NOT EXISTS (SELECT 1 FROM tasks);

INSERT INTO tasks (title, done)
SELECT 'Learn PostgreSQL', FALSE
WHERE (SELECT COUNT(*) FROM tasks) = 1;

INSERT INTO tasks (title, done)
SELECT 'Complete FlyRank Assignment', TRUE
WHERE (SELECT COUNT(*) FROM tasks) = 2;
