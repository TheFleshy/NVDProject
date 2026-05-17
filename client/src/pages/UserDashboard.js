import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {LayoutDashboard, CheckCircle, Clock, PlayCircle, LogOut, Target, Zap, RotateCcw} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();

    // НОВО: Читање на вистинскиот најавен корисник од Local Storage
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {name: 'Гостин'};
    const currentUser = loggedInUser.name;

    const fetchTasks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error("Грешка при влечење задачи:", error);
        }
    };

    useEffect(() => {
        // Ако нема најавен корисник, врати го на Login
        if (!localStorage.getItem('user')) {
            navigate('/login');
        } else {
            fetchTasks();
        }
    }, [navigate]);

    const updateTaskStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${id}`, {
                status: newStatus,
                user_name: currentUser // Сега бекендот ќе го запише вистинското име во логовите!
            });
            fetchTasks();
        } catch (error) {
            console.error("Грешка при промена на статус:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // НОВО: Филтрирај ги задачите САМО за најавениот корисник
    const myTasks = tasks.filter(t => t.assigned_to === currentUser);

    const todoTasks = myTasks.filter(t => t.status === 'todo');
    const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
    const doneTasks = myTasks.filter(t => t.status === 'done');

    return (
        <div className="admin-layout">
            <div className="blob blob-blue"></div>
            <div className="blob blob-purple"></div>

            <aside className="glass-sidebar">
                <div className="sidebar-logo">
                    <LayoutDashboard className="text-glow-blue" size={24}/>
                    <h2>NVD <span className="text-gradient">User</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/" className="nav-item">🏠︎ Почетна</Link>
                    <br/><br/>
                    {/* НОВО: Функционално копче за одјава */}
                    <button onClick={handleLogout} className="nav-item logout-link" style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '15px'
                    }}>
                        <LogOut size={16}/> Одјава
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>Здраво, {currentUser}! 👋</h1>
                    <p>Твојот личен работен простор за денешните задачи.</p>
                </header>

                <div className="stats-row">
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper blue"><Target size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Мои Задачи</span>
                            <span className="stat-value">{myTasks.length}</span>
                        </div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper yellow"><Clock size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Во Работа</span>
                            <span className="stat-value">{inProgressTasks.length}</span>
                        </div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper green"><CheckCircle size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Завршени</span>
                            <span className="stat-value">{doneTasks.length}</span>
                        </div>
                    </div>
                </div>

                <div className="user-kanban-grid">

                    {/* TO DO КОЛОНА */}
                    <div className="kanban-column">
                        <h3><Clock size={16} className="text-glow-blue"/> TO DO</h3>
                        <div className="column-content">
                            {todoTasks.map(task => (
                                <div key={task.id} className="glass-card task-mini-card">
                                    <h4><span className="taskname">Име: </span>{task.title}</h4>
                                    <p className="taskdesc">Опис: {task.description}</p>

                                    <div className="card-actions-row">
                                        <button onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                className="btn-action-small btn-blue full-width">
                                            Започни <Zap size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* IN PROGRESS КОЛОНА */}
                    <div className="kanban-column">
                        <h3><PlayCircle size={16} className="text-glow-yellow"/> IN PROGRESS</h3>
                        <div className="column-content">
                            {inProgressTasks.map(task => (
                                <div key={task.id} className="glass-card task-mini-card active-border">
                                    <h4><span className="taskname">Име: </span>{task.title}</h4>
                                    <p className="taskdesc">Опис: {task.description}</p>

                                    <div className="card-actions-row split-buttons">
                                        <button onClick={() => updateTaskStatus(task.id, 'todo')}
                                                className="btn-action-small btn-gray">
                                            <RotateCcw size={14}/> Врати
                                        </button>
                                        <button onClick={() => updateTaskStatus(task.id, 'done')}
                                                className="btn-action-small btn-green">
                                            Заврши <CheckCircle size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DONE КОЛОНА */}
                    <div className="kanban-column">
                        <h3><CheckCircle size={16} className="text-glow-green"/> DONE</h3>
                        <div className="column-content">
                            {doneTasks.map(task => (
                                <div key={task.id} className="glass-card task-mini-card done-opacity">
                                    <h4 className="strike-text"><span className="taskname">Име: </span>{task.title}</h4>
                                    <p className="strike-text taskdesc">Опис: {task.description}</p>

                                    <div className="card-actions-row space-between">
                                        <span className="done-tag"><CheckCircle size={14}/> Завршено</span>
                                        <button onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                className="btn-action-small btn-gray auto-width">
                                            <RotateCcw size={14}/> Врати
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default UserDashboard;