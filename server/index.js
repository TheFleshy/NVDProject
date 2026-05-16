const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

connectDB().then(database => {
    db = database;
    console.log("Успешно поврзано со SQLite базата!");
}).catch(err => {
    console.error("Грешка при поврзување со базата:", err);
});

// 1. Земи ги сите задачи
app.get('/api/tasks', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM tasks ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

// 2. Креирај нова задача
app.post('/api/tasks', async (req, res) => {
    const {title, description, assigned_to} = req.body;
    try {
        const result = await db.run(
            'INSERT INTO tasks (title, description, assigned_to) VALUES (?, ?, ?)',
            [title, description, assigned_to]
        );

        // КЛУЧНО ЗА АСИСТЕНТОТ: Запиши во лог дека е креирана задача
        await db.run(
            'INSERT INTO activity_logs (task_id, user_name, action) VALUES (?, ?, ?)',
            [result.lastID, assigned_to || 'Sistem', `Ја креираше задачата: "${title}"`]
        );

        res.json({message: 'Задачата е успешно креирана!', taskId: result.lastID});
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

// 3. Ажурирај статус на задача (Кога ја влечат на Kanban таблата)
app.put('/api/tasks/:id', async (req, res) => {
    const {id} = req.params;
    const {status, user_name} = req.body; // user_name е кој ја менува во моментот
    try {
        // Земи го насловот на задачата за поубав лог
        const task = await db.get('SELECT title FROM tasks WHERE id = ?', [id]);

        if (!task) return res.status(404).send('Задачата не е пронајдена');

        // Смени статус во база
        await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

        // КЛУЧНО ЗА АСИСТЕНТОТ: Запиши кој што сработил!
        await db.run(
            'INSERT INTO activity_logs (task_id, user_name, action) VALUES (?, ?, ?)',
            [id, user_name, `Го смени статусот на "${task.title}" во [${status.toUpperCase()}]`]
        );

        res.json({message: 'Статусот е ажуриран и промената е запишана!'});
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

// 4. Земи ги сите активности (Ова е делот каде асистентот ќе гледа прогрес)
app.get('/api/activity-logs', async (req, res) => {
    try {
        const logs = await db.all('SELECT * FROM activity_logs ORDER BY created_at DESC');
        res.json(logs);
    } catch (err) {
        res.status(500).send('Серверска грешка');
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Serverot raboti na port ${PORT}`));