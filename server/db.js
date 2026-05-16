const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function connectDB() {
    const db = await open({
        // Базата ќе се чува во фајл со име database.sqlite внатре во server папката
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Автоматски креирај ги табелите при првото пуштање
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             title TEXT NOT NULL,
                                             description TEXT,
                                             status TEXT DEFAULT 'todo',
                                             assigned_to TEXT,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     task_id INTEGER,
                                                     user_name TEXT,
                                                     action TEXT,
                                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                     FOREIGN KEY (task_id) REFERENCES tasks(id)
            );
    `);

    // Вметни една тест задача ако базата е празна
    const count = await db.get("SELECT COUNT(*) as count FROM tasks");
    if (count.count === 0) {
        await db.run(
            "INSERT INTO tasks (title, description, status, assigned_to) VALUES (?, ?, ?, ?)",
            ['Поставување на архитектура', 'Креирање на Node.js и React структура во WebStorm', 'in_progress', 'Andrej']
        );
    }

    return db;
}

module.exports = connectDB;