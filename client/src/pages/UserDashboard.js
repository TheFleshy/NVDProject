import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {LayoutDashboard, LogOut, Clock, Target, CheckCircle, Play, Check, RotateCcw, UsersRound} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import './AdminDashboard.css'; // Ги користиме истите стаклени стилови!

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};

    const fetchData = async () => {
        try {
            const tasksRes = await axios.get('http://localhost:5000/api/tasks');
            setTasks(tasksRes.data);

            const usersRes = await axios.get('http://localhost:5000/api/users');
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Грешка при влечење податоци:", error);
        }
    };

    useEffect(() => {
        if (!loggedInUser.email) {
            navigate('/login');
        } else {
            fetchData();
        }
    }, [navigate, loggedInUser.email]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, {
                status: newStatus,
                user_name: loggedInUser.name
            });
            fetchData();
        } catch (error) {
            console.error("Грешка при промена на статус:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Филтрирање на ЛИЧНИ задачи
    const myTasks = tasks.filter(t => t.assigned_to === loggedInUser.name);
    const todoTasks = myTasks.filter(t => t.status === 'todo');
    const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
    const doneTasks = myTasks.filter(t => t.status === 'done');

    // --- ЛОГИКА ЗА МОЈОТ ТИМ ---
    // 1. Го наоѓаме тековниот корисник во базата за да му го видиме тимот
    const currentUserData = users.find(u => u.email === loggedInUser.email);
    const myTeamName = currentUserData?.team_name || 'Без Тим';

    // 2. Ги наоѓаме сите други корисници (освен админите) кои се во истиот тим
    const myTeamMembers = users.filter(u =>
        (u.team_name || 'Без Тим') === myTeamName &&
        u.role !== 'admin'
    );

    // 3. Им ја пресметуваме статистиката
    const teamStats = myTeamMembers.map((member, index) => {
        const memberTasks = tasks.filter(t => t.assigned_to === member.name);
        const total = memberTasks.length;
        const done = memberTasks.filter(t => t.status === 'done').length;
        return {
            ...member,
            total,
            done,
            percentage: total === 0 ? 0 : Math.round((done / total) * 100),
            colorIndex: index % 4
        };
    });


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
                    <a href="/" className="nav-item active">🏠︎ Почетна</a>
                    <br/><br/>
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
                    <h1>Здраво, {loggedInUser.name}!</h1>
                    <p>Твојот личен работен простор.</p>
                </header>

                {/* ЛИЧНА СТАТИСТИКА */}
                <div className="stats-row">
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper blue"><Target size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Вкупно Мои Задачи</span>
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

                {/* KANBAN ТАБЛА */}
                <div
                    style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px'}}>

                    {/* TO DO КОЛОНА */}
                    <div className="glass-card" style={{padding: '20px', borderColor: 'rgba(59, 130, 246, 0.3)'}}>
                        <h3 style={{fontSize: '14px', color: '#60a5fa', marginBottom: '15px'}}><Clock size={16}/> TO DO
                        </h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            {todoTasks.map(task => (
                                <div key={task.id} style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <p style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '14px'
                                    }}>Име: <strong>{task.title}</strong></p>
                                    <p style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '12px',
                                        color: '#94a3b8'
                                    }}>Опис: {task.description}</p>
                                    <button
                                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#60a5fa',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        Започни <Play size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* IN PROGRESS КОЛОНА */}
                    <div className="glass-card" style={{padding: '20px', borderColor: 'rgba(234, 179, 8, 0.3)'}}>
                        <h3 style={{fontSize: '14px', color: '#facc15', marginBottom: '15px'}}><Play size={16}/> IN
                            PROGRESS</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            {inProgressTasks.map(task => (
                                <div key={task.id} style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <p style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '14px'
                                    }}>Име: <strong>{task.title}</strong></p>
                                    <p style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '12px',
                                        color: '#94a3b8'
                                    }}>Опис: {task.description}</p>
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'todo')}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: '#cbd5e1',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <RotateCcw size={14}/> Врати
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'done')}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                color: '#4ade80',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            Заврши <Check size={14}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DONE КОЛОНА */}
                    <div className="glass-card" style={{padding: '20px', borderColor: 'rgba(34, 197, 94, 0.3)'}}>
                        <h3 style={{fontSize: '14px', color: '#4ade80', marginBottom: '15px'}}><CheckCircle
                            size={16}/> DONE</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            {doneTasks.map(task => (
                                <div key={task.id} style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    opacity: 0.7
                                }}>
                                    <p style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '14px',
                                        textDecoration: 'line-through',
                                        color: '#94a3b8'
                                    }}>Име: {task.title}</p>
                                    <p style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '12px',
                                        color: '#64748b'
                                    }}>Опис: {task.description}</p>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            color: '#4ade80',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}><Check size={12}/> Завршено</span>
                                        <button
                                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                                            style={{
                                                padding: '6px 10px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: '#cbd5e1',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <RotateCcw size={12}/> Врати
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* НОВО: ПРЕГЛЕД НА ТИМОТ */}
                <section className="glass-card" style={{marginBottom: '30px'}}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        paddingBottom: '15px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <UsersRound className="text-glow-purple" size={18}/>
                            Колеги од мојот тим: <span style={{color: '#c084fc'}}>{myTeamName}</span>
                        </h3>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {teamStats.length === 0 ? (
                            <p className="text-muted">Нема други членови во овој тим.</p>
                        ) : (
                            teamStats.map((member) => (
                                <div key={member.id} style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '10px'
                                    }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div className={`user-initials bg-color-${member.colorIndex}`}>
                                                {member.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{fontWeight: '600', color: '#f8fafc', fontSize: '14px'}}>
                                                {member.name} {member.email === loggedInUser.email ? '(Ти)' : ''}
                                            </span>
                                        </div>
                                        <span className={`task-percent text-color-${member.colorIndex}`}>
                                            {member.percentage}%
                                        </span>
                                    </div>
                                    <div className="progress-bar-bg" style={{marginBottom: '8px'}}>
                                        <div className={`progress-bar-fill fill-color-${member.colorIndex}`}
                                             style={{width: `${member.percentage}%`}}></div>
                                    </div>
                                    <div style={{textAlign: 'right', fontSize: '11px', color: '#94a3b8'}}>
                                        {member.done} од {member.total} завршени
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default UserDashboard;