const {Pool} = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nvd_db',
    password: process.env.DB_PASS || 'supersecret',
    port: process.env.DB_PORT || 5432,
});

const adaptSql = (sql) => {
    let i = 1;
    return sql.replace(/\?/g, () => `$${i++}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDB(retries = 10, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await pool.query('SELECT 1');
            console.log("Базата е достапна.");
            return;
        } catch (err) {
            console.log(`Обид ${attempt}/${retries}: базата сеуште не е достапна (${err.code || err.message}). Чекам ${delayMs / 1000}s...`);
            await sleep(delayMs);
        }
    }
    throw new Error("Базата не стана достапна по повеќе обиди.");
}

async function connectDB() {
    await waitForDB();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users
        (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            team_name VARCHAR(255) DEFAULT 'Без Тим'
        );

        CREATE TABLE IF NOT EXISTS teams
        (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tasks
        (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'todo',
            assigned_to VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS activity_logs
        (
            id SERIAL PRIMARY KEY,
            task_id INTEGER,
            user_name VARCHAR(255),
            action VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        );

        CREATE TABLE IF NOT EXISTS kanban_columns
        (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE,
            status_value TEXT UNIQUE
        );
    `);

    const dbWrapper = {
        all: async (sql, params = []) => {
            const res = await pool.query(adaptSql(sql), params);
            return res.rows;
        },
        get: async (sql, params = []) => {
            const res = await pool.query(adaptSql(sql), params);
            return res.rows[0];
        },
        // run() враќа { lastID, rowCount } за да наликува на SQLite API-то
        // Секој INSERT каде ти треба lastID мора да завршува со "RETURNING id"
        run: async (sql, params = []) => {
            const res = await pool.query(adaptSql(sql), params);
            return {
                lastID: res.rows[0]?.id,
                rowCount: res.rowCount
            };
        },
        exec: async (sql) => {
            await pool.query(sql);
        }
    };

    // Сетирање на основниот админ, ако табелата е празна
    const userCountRes = await dbWrapper.get("SELECT COUNT(*) as count FROM users");
    if (parseInt(userCountRes.count) === 0) {
        await dbWrapper.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Админ', 'admin@finki.ukim.mk', 'admin123', 'admin']
        );
        console.log("Креиран е основниот администраторски корисник.");
    }

    // Сетирање на основните 3 Kanban колони, ако табелата е празна
    const colCountRes = await dbWrapper.get('SELECT COUNT(*) as count FROM kanban_columns');
    if (parseInt(colCountRes.count) === 0) {
        await dbWrapper.run(
            "INSERT INTO kanban_columns (name, status_value) VALUES ('TODO', 'todo'), ('IN PROGRESS', 'in_progress'), ('DONE', 'done')"
        );
        console.log("Креирани се основните 3 Kanban колони.");
    }

    console.log("Успешно поврзување со PostgreSQL базата.");
    return dbWrapper;
}

module.exports = connectDB;