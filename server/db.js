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

async function connectDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users
        (
            id
            SERIAL
            PRIMARY
            KEY,
            name
            VARCHAR
        (
            255
        ) NOT NULL,
            email VARCHAR
        (
            255
        ) UNIQUE NOT NULL,
            password VARCHAR
        (
            255
        ) NOT NULL,
            role VARCHAR
        (
            50
        ) DEFAULT 'user',
            team_name VARCHAR
        (
            255
        ) DEFAULT 'Без Тим'
            );

        CREATE TABLE IF NOT EXISTS teams
        (
            id
            SERIAL
            PRIMARY
            KEY,
            name
            VARCHAR
        (
            255
        ) UNIQUE NOT NULL
            );

        CREATE TABLE IF NOT EXISTS tasks
        (
            id
            SERIAL
            PRIMARY
            KEY,
            title
            VARCHAR
        (
            255
        ) NOT NULL,
            description TEXT,
            status VARCHAR
        (
            50
        ) DEFAULT 'todo',
            assigned_to VARCHAR
        (
            255
        ),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

        CREATE TABLE IF NOT EXISTS activity_logs
        (
            id
            SERIAL
            PRIMARY
            KEY,
            task_id
            INTEGER,
            user_name
            VARCHAR
        (
            255
        ),
            action VARCHAR
        (
            255
        ),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY
        (
            task_id
        ) REFERENCES tasks
        (
            id
        )
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
        run: async (sql, params = []) => {
            await pool.query(adaptSql(sql), params);
        },
        exec: async (sql) => {
            await pool.query(sql);
        }
    };

    const res = await dbWrapper.get("SELECT COUNT(*) as count FROM users");
    if (parseInt(res.count) === 0) {
        await dbWrapper.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Админ', 'admin@finki.ukim.mk', 'admin123', 'admin']
        );
    }

    console.log("Успешно поврзување со PostgreSQL базата.");
    return dbWrapper;
}

module.exports = connectDB;