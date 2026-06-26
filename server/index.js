const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

connectDB().then(async (database) => {
    db = database;
    console.log("Успешно поврзано со SQLite базата!");

    // --- НОВО: Креирање табела за динамични Kanban колони ---
    try {
        await db.run(`
            CREATE TABLE IF NOT EXISTS kanban_columns
            (
                id
                INTEGER
                PRIMARY
                KEY
                AUTOINCREMENT,
                name
                TEXT
                UNIQUE,
                status_value
                TEXT
                UNIQUE
            )
        `);

        // Проверка дали има колони, ако нема стави ги основните 3
        const colCount = await db.get('SELECT count(*) as count FROM kanban_columns');
        if (colCount.count === 0) {
            await db.run("INSERT INTO kanban_columns (name, status_value) VALUES ('TODO', 'todo'), ('IN PROGRESS', 'in_progress'), ('DONE', 'done')");
            console.log("Креирани се основните 3 Kanban колони.");
        }
    } catch (err) {
        console.error("Грешка при сетирање на колоните:", err);
    }

}).catch(err => {
    console.error("Грешка при поврзување со базата:", err);
});

// --- НОВИ РУТИ ЗА KANBAN КОЛОНИ ---

app.get('/api/columns', async (req, res) => {
    try {
        const columns = await db.all('SELECT * FROM kanban_columns ORDER BY id ASC');
        res.json(columns);
    } catch (err) {
        res.status(500).send('Грешка при влечење колони');
    }
});

app.post('/api/columns', async (req, res) => {
    const {name} = req.body;
    // Генерираме ID вредност од името (пр. "QA Review" станува "qa_review")
    const status_value = name.trim().toLowerCase().replace(/\s+/g, '_');

    try {
        await db.run('INSERT INTO kanban_columns (name, status_value) VALUES (?, ?)', [name, status_value]);
        res.status(201).json({message: 'Колоната е успешно додадена!'});
    } catch (err) {
        res.status(500).send('Грешка при креирање колона (можеби името веќе постои).');
    }
});

// Избриши колона (Само за Админ)
app.delete('/api/columns/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const column = await db.get('SELECT * FROM kanban_columns WHERE id = ?', [id]);
        if (!column) return res.status(404).send('Колоната не е пронајдена');

        // ЗАШТИТА: Не дозволувај бришење на основните 3 колони!
        if (['todo', 'in_progress', 'done'].includes(column.status_value)) {
            return res.status(403).send('Забрането: Основните колони не можат да се избришат!');
        }

        // ПАМЕТЕН ПОТЕГ: Пред да ја избришеме колоната, ги враќаме сите нејзини задачи во 'TODO'
        await db.run('UPDATE tasks SET status = ? WHERE status = ?', ['todo', column.status_value]);

        // На крај, ја бришеме самата колона
        await db.run('DELETE FROM kanban_columns WHERE id = ?', [id]);
        res.json({message: 'Колоната е избришана, задачите се преместени во TODO!'});
    } catch (err) {
        res.status(500).send('Грешка при бришење на колоната');
    }
});


// --- РУТИ ЗА ЗАДАЧИ И ЛОГОВИ ---

app.get('/api/tasks', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM tasks ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

app.post('/api/tasks', async (req, res) => {
    const {title, description, assigned_to, created_by} = req.body;
    try {
        const result = await db.run(
            'INSERT INTO tasks (title, description, assigned_to) VALUES (?, ?, ?)',
            [title, description, assigned_to]
        );
        await db.run(
            'INSERT INTO activity_logs (task_id, user_name, action) VALUES (?, ?, ?)',
            [result.lastID, created_by || 'Админ', `Ја додели задачата: "${title}" на ${assigned_to}`]
        );
        res.json({message: 'Задачата е успешно креирана!', taskId: result.lastID});
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const {id} = req.params;
    const {status, user_name} = req.body;
    try {
        const task = await db.get('SELECT title FROM tasks WHERE id = ?', [id]);
        if (!task) return res.status(404).send('Задачата не е пронајдена');

        await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        await db.run(
            'INSERT INTO activity_logs (task_id, user_name, action) VALUES (?, ?, ?)',
            [id, user_name, `Го смени статусот на "${task.title}" во [${status.toUpperCase()}]`]
        );
        res.json({message: 'Статусот е ажуриран и промената е запишана!'});
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const task = await db.get('SELECT title FROM tasks WHERE id = ?', [id]);
        if (!task) return res.status(404).send('Задачата не е пронајдена');

        await db.run('DELETE FROM activity_logs WHERE task_id = ?', [id]);
        await db.run('DELETE FROM tasks WHERE id = ?', [id]);
        await db.run(
            'INSERT INTO activity_logs (task_id, user_name, action) VALUES (?, ?, ?)',
            [null, 'Админ', `Ја избриша задачата: "${task.title}"`]
        );
        res.json({message: 'Задачата е избришана!'});
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

app.get('/api/activity-logs', async (req, res) => {
    try {
        const logs = await db.all('SELECT * FROM activity_logs ORDER BY created_at DESC');
        res.json(logs);
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

// --- РУТИ ЗА КОРИСНИЦИ (АВТЕНТИКАЦИЈА И УЛОГИ) ---

app.post('/api/register', async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const result = await db.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, 'user']
        );
        res.status(201).json({message: 'Корисникот е успешно креиран!', id: result.lastID});
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).send('Овој е-маил веќе постои во системот.');
        }
        res.status(500).send('Серверска грешка при регистрација');
    }
});

app.post('/api/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (!user) {
            return res.status(401).send('Погрешен е-маил или лозинка');
        }
        res.json({id: user.id, name: user.name, email: user.email, role: user.role});
    } catch (err) {
        res.status(500).send('Серверска грешка при најава');
    }
});

app.put('/api/users/:id/role', async (req, res) => {
    const {id} = req.params;
    const {role} = req.body;
    try {
        await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({message: 'Улогата е успешно ажурирана!'});
    } catch (err) {
        res.status(500).send('Грешка при ажурирање на улога');
    }
});

// --- РУТИ ЗА ТИМОВИ ---

app.post('/api/teams', async (req, res) => {
    const {name} = req.body;
    try {
        const result = await db.run('INSERT INTO teams (name) VALUES (?)', [name]);
        res.json({message: 'Тимот е успешно креиран!', id: result.lastID});
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(400).send('Ова име на тим веќе постои.');
        }
        res.status(500).send('Грешка при креирање тим');
    }
});

app.get('/api/teams', async (req, res) => {
    try {
        const teams = await db.all('SELECT * FROM teams');
        res.json(teams);
    } catch (err) {
        res.status(500).send('Грешка при влечење тимови');
    }
});

app.put('/api/users/:id/team', async (req, res) => {
    const {id} = req.params;
    const {team_name} = req.body;
    try {
        await db.run('UPDATE users SET team_name = ? WHERE id = ?', [team_name, id]);
        res.json({message: 'Корисникот е додаден во тимот!'});
    } catch (err) {
        res.status(500).send('Грешка при ажурирање тим на корисник');
    }
});

app.delete('/api/teams/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const team = await db.get('SELECT name FROM teams WHERE id = ?', [id]);
        if (!team) return res.status(404).send('Тимот не е пронајден');

        await db.run('UPDATE users SET team_name = ? WHERE team_name = ?', ['Без Тим', team.name]);
        await db.run('DELETE FROM teams WHERE id = ?', [id]);

        res.json({message: 'Тимот е избришан и корисниците се ажурирани!'});
    } catch (err) {
        res.status(500).send('Грешка при бришење на тим');
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await db.all('SELECT id, name, email, role, team_name FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).send('Грешка при влечење корисници');
    }
});

// 14. Избриши корисник (Само Главен Админ)
app.delete('/api/users/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const user = await db.get('SELECT email FROM users WHERE id = ?', [id]);
        if (user && user.email === 'admin@finki.ukim.mk') {
            return res.status(403).send('Забрането: Главниот администратор не може да се избрише!');
        }

        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.json({message: 'Корисникот е успешно избришан!'});
    } catch (err) {
        res.status(500).send('Грешка при бришење на корисник');
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Serverot raboti na port ${PORT}`));