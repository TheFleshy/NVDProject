import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    // 1. Повлечи ги сите задачи од бекендот при вчитување на страницата
    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error("Грешка при земање на задачите:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // 2. Функција за испраќање на нова задача до бекендот
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return alert("Насловот е задолжителен!");

        try {
            await axios.post('http://localhost:5000/api/tasks', {
                title,
                description,
                assigned_to: assignedTo
            });

            // Исчисти ја формата и освежи ја листата
            setTitle('');
            setDescription('');
            setAssignedTo('');
            fetchTasks();
        } catch (error) {
            console.error("Грешка при креирање задача:", error);
        }
    };

    return (
        <div className="app-container">
            <header className="main-header">
                <h1>📊 Напреден Веб Дизајн - Проект Менаџер</h1>
                <p>Систем за следење задачи и тимски прогрес</p>
            </header>

            <div className="main-content">
                {/* ФОРМА ЗА ДОДАВАЊЕ ЗАДАЧА */}
                <section className="form-section">
                    <h2>Креирај Нова Задача</h2>
                    <form onSubmit={handleSubmit} className="task-form">
                        <div className="form-group">
                            <label>Наслов на задача:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Пр: Дизајн на база..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Опис:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Краток опис на обврските..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Задолжен студент (Кој работи):</label>
                            <input
                                type="text"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                placeholder="Име на колега..."
                            />
                        </div>
                        <button type="submit" className="submit-btn">Додај во Систем</button>
                    </form>
                </section>

                {/* ЛИСТА НА ЗАДАЧИ */}
                <section className="tasks-section">
                    <h2>Активни Задачи во Тимот</h2>
                    <div className="tasks-list">
                        {tasks.length === 0 ? <p>Нема пронајдено задачи.</p> : tasks.map(task => (
                            <div key={task.id} className={`task-card ${task.status}`}>
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <div className="task-meta">
                                    <span>👤 Одговорен: <strong>{task.assigned_to || 'Недоделено'}</strong></span>
                                    <span className="status-badge">{task.status.toUpperCase()}</span>
                                </div>
                                <small>Креирано на: {task.created_at}</small>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default App;