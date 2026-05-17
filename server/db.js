const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function connectDB() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             email TEXT UNIQUE NOT NULL,
                                             password TEXT NOT NULL,
                                             role TEXT DEFAULT 'user'
        );

        -- НОВО: Табела за Тимови
        CREATE TABLE IF NOT EXISTS teams (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT UNIQUE NOT NULL
        );

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

    // ТРИК: Безбедно додавање на нова колона во users ако веќе постои табелата
    try {
        await db.exec(`ALTER TABLE users ADD COLUMN team_name TEXT DEFAULT 'Без Тим'`);
    } catch (err) {
        // Ако колоната веќе постои, SQLite фрла грешка, ја игнорираме за да не паѓа серверот
    }

    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    if (userCount.count === 0) {
        await db.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Асистент', 'admin@finki.ukim.mk', 'admin123', 'admin']
        );
    }

    return db;
}

module.exports = connectDB;