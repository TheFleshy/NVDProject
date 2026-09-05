import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {LayoutDashboard, LogOut,  Target,  UsersRound, Columns} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import './AdminDashboard.css';

const UserDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [columns, setColumns] = useState([]); // НОВО: Состојба за динамични колони
    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};

    const fetchData = async () => {
        try {
            const tasksRes = await axios.get('http://localhost:5000/api/tasks');
            setTasks(tasksRes.data);
            const usersRes = await axios.get('http://localhost:5000/api/users');
            setUsers(usersRes.data);
            const colsRes = await axios.get('http://localhost:5000/api/columns');
            setColumns(colsRes.data);
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

    const myTasks = tasks.filter(t => t.assigned_to === loggedInUser.name);
    const currentUserData = users.find(u => u.email === loggedInUser.email);
    const myTeamName = currentUserData?.team_name || 'Без Тим';
    const myTeamMembers = users.filter(u => (u.team_name || 'Без Тим') === myTeamName && u.role !== 'admin');

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
                    <span className="nav-item active" style={{cursor: 'default', display: 'block'}}>🏠 Почетна</span>
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

                <div className="stats-row">
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper blue"><Target size={24}/></div>
                        <div className="stat-info"><span className="stat-label">Вкупно Мои Задачи</span><span
                            className="stat-value">{myTasks.length}</span></div>
                    </div>
                </div>

                {/* ДИНАМИЧНА KANBAN ТАБЛА */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>

                    {columns.map((column, i) => {
                        // Ги филтрираме задачите за ТЕКОВНАТА колона
                        const columnTasks = myTasks.filter(t => t.status === column.status_value);

                        return (
                            <div key={column.id} className="glass-card" style={{
                                padding: '20px',
                                borderColor: i === 0 ? 'rgba(59, 130, 246, 0.3)' : i === columns.length - 1 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'
                            }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    color: i === 0 ? '#60a5fa' : i === columns.length - 1 ? '#4ade80' : '#facc15',
                                    marginBottom: '15px'
                                }}>
                                    <Columns size={16}/> {column.name}
                                </h3>

                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                    {columnTasks.length === 0 ?
                                        <p className="text-muted" style={{fontSize: '13px'}}>Нема
                                            задачи.</p> : columnTasks.map(task => (
                                            <div key={task.id} style={{
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '15px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                opacity: task.status === 'done' ? 0.7 : 1
                                            }}>
                                                <p style={{
                                                    margin: '0 0 5px 0',
                                                    fontSize: '14px',
                                                    textDecoration: task.status === 'done' ? 'line-through' : 'none'
                                                }}>Име: <strong>{task.title}</strong></p>
                                                <p style={{
                                                    margin: '0 0 15px 0',
                                                    fontSize: '12px',
                                                    color: '#94a3b8'
                                                }}>Опис: {task.description}</p>

                                                {/* ПАЃАЧКО МЕНИ ЗА УПРАВУВАЊЕ СО СТАТУС */}
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <span
                                                        style={{fontSize: '12px', color: '#64748b'}}>Помести во:</span>
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                        className="glass-select"
                                                        style={{
                                                            flex: 1,
                                                            padding: '6px 10px',
                                                            fontSize: '12px',
                                                            minWidth: '0'
                                                        }}
                                                    >
                                                        {columns.map(col => (
                                                            <option key={col.id}
                                                                    value={col.status_value}>{col.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ПРЕГЛЕД НА ТИМОТ */}
                <section className="glass-card" style={{marginBottom: '30px'}}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        paddingBottom: '15px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '10px'}}><UsersRound
                            className="text-glow-purple" size={18}/> Колеги од мојот тим: <span
                            style={{color: '#c084fc'}}>{myTeamName}</span></h3>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {teamStats.length === 0 ?
                            <p className="text-muted">Нема други членови во овој тим.</p> : teamStats.map((member) => (
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
                                            <div
                                                className={`user-initials bg-color-${member.colorIndex}`}>{member.name.substring(0, 2).toUpperCase()}</div>
                                            <span style={{
                                                fontWeight: '600',
                                                color: '#f8fafc',
                                                fontSize: '14px'
                                            }}>{member.name} {member.email === loggedInUser.email ? '(Ти)' : ''}</span>
                                        </div>
                                        <span
                                            className={`task-percent text-color-${member.colorIndex}`}>{member.percentage}%</span>
                                    </div>
                                    <div className="progress-bar-bg" style={{marginBottom: '8px'}}>
                                        <div className={`progress-bar-fill fill-color-${member.colorIndex}`}
                                             style={{width: `${member.percentage}%`}}></div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
export default UserDashboard;