import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Activity,
    Plus,
    CheckCircle,
    LayoutDashboard,
    Target,
    Zap,
    Trash2,
    LogOut,
    UsersRound,
    Shield,
    Check,
    ArrowRight
} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {name: 'Админ'};

    const fetchData = async () => {
        try {
            const tasksRes = await axios.get('http://localhost:5000/api/tasks');
            setTasks(tasksRes.data);

            const logsRes = await axios.get('http://localhost:5000/api/activity-logs');
            setLogs(logsRes.data);

            const usersRes = await axios.get('http://localhost:5000/api/users');
            setUsers(usersRes.data);

            const teamsRes = await axios.get('http://localhost:5000/api/teams');
            setTeams(teamsRes.data);
        } catch (error) {
            console.error("Грешка при влечење податоци:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!title || !assignedTo) return;

        try {
            await axios.post('http://localhost:5000/api/tasks', {
                title,
                description,
                assigned_to: assignedTo,
                created_by: loggedInUser.name
            });
            setTitle('');
            setDescription('');
            setAssignedTo('');
            fetchData();
        } catch (error) {
            console.error("Грешка при креирање задача:", error);
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm("Дали сте сигурни дека сакате да ја избришете оваа задача?")) {
            try {
                await axios.delete(`http://localhost:5000/api/tasks/${id}`);
                fetchData();
            } catch (error) {
                console.error("Грешка при бришење:", error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;

    // --- ПАМЕТНО ГРУПИРАЊЕ ПО ТИМОВИ ---
    const allTeams = [...teams, {id: 'none', name: 'Без Тим'}];

    const teamsProgress = allTeams.map((team, index) => {
        const teamMembers = users.filter(u => (u.team_name || 'Без Тим') === team.name && u.role !== 'admin');

        let teamTotalTasks = 0;
        let teamDoneTasks = 0;

        const membersWithStats = teamMembers.map(member => {
            const memberTasks = tasks.filter(t => t.assigned_to === member.name);
            const total = memberTasks.length;
            const done = memberTasks.filter(t => t.status === 'done').length;
            teamTotalTasks += total;
            teamDoneTasks += done;
            return {...member, total, done};
        });

        return {
            ...team,
            members: membersWithStats,
            total: teamTotalTasks,
            done: teamDoneTasks,
            percentage: teamTotalTasks === 0 ? 0 : Math.round((teamDoneTasks / teamTotalTasks) * 100),
            colorIndex: index % 4
        };
    }).filter(team => team.members.length > 0);

    // --- ФУНКЦИЈА ЗА ПРЕСМЕТУВАЊЕ ВРЕМЕ ---
    const timeAgo = (dateString) => {

        const safeDateString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z';

        const date = new Date(safeDateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 0) return 'пред малку'; // Заштита од негативни секунди
        if (diffInSeconds < 60) return 'пред малку';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `пред ${diffInMinutes} мин`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `пред ${diffInHours} час${diffInHours > 1 ? 'а' : ''}`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `пред ${diffInDays} ден${diffInDays > 1 ? 'а' : ''}`;
    };

    // --- ФУНКЦИЈА ЗА ИКОНИ И БОИ СПОРЕД АКЦИЈАТА ---
    const getLogIconAndColor = (actionText) => {
        if (actionText.includes('DONE')) return {icon: <Check size={14}/>, colorClass: 'log-green'};
        if (actionText.includes('IN_PROGRESS')) return {icon: <ArrowRight size={14}/>, colorClass: 'log-purple'};
        if (actionText.includes('креира') || actionText.includes('додели')) return {
            icon: <Plus size={14}/>,
            colorClass: 'log-blue'
        };
        if (actionText.includes('избриша')) return {icon: <Trash2 size={14}/>, colorClass: 'log-red'};
        return {icon: <Activity size={14}/>, colorClass: 'log-gray'};
    };

    return (
        <div className="admin-layout">
            <div className="blob blob-blue"></div>
            <div className="blob blob-purple"></div>

            <aside className="glass-sidebar">
                <div className="sidebar-logo">
                    <LayoutDashboard className="text-glow-blue" size={24}/>
                    <h2>NVD <span className="text-gradient">Admin</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/" className="nav-item">🏠︎ Почетна</Link>
                    <Link to="/roles" className="nav-item"
                          style={{color: '#94a3b8', marginTop: '10px', display: 'block'}}>👥 Улоги и Тимови</Link>
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
                    <h1>Администраторски преглед</h1>
                    <p>Најавени сте како: <strong>{loggedInUser.name}</strong> <Shield size={14} style={{
                        display: 'inline',
                        color: '#c084fc',
                        marginBottom: '-2px'
                    }}/></p>
                </header>

                <div className="stats-row">
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper blue"><Target size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Вкупно Задачи</span>
                            <span className="stat-value">{totalTasks}</span>
                        </div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper yellow"><Activity size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Во Прогрес</span>
                            <span className="stat-value">{inProgressTasks}</span>
                        </div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon-wrapper green"><CheckCircle size={24}/></div>
                        <div className="stat-info">
                            <span className="stat-label">Завршени</span>
                            <span className="stat-value">{doneTasks}</span>
                        </div>
                    </div>
                </div>

                <div className="admin-grid">
                    <div className="left-column">

                        <section className="glass-card">
                            <h3><Plus className="text-glow-blue" size={18}/> Креирај Нова Задача</h3>
                            <form onSubmit={handleCreateTask} className="glass-form">
                                <div className="input-row">
                                    <input type="text" placeholder="Наслов на задачата..." value={title}
                                           onChange={(e) => setTitle(e.target.value)} required/>

                                    <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required
                                            className="glass-select">
                                        <option value="" disabled>-- Избери задолжен член --</option>
                                        {teamsProgress.map(team => (
                                            <optgroup key={team.id} label={`📂 ТИМ: ${team.name}`}>
                                                {team.members.map(user => (
                                                    <option key={user.id} value={user.name}>👤 {user.name}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <textarea placeholder="Детален опис..." value={description}
                                          onChange={(e) => setDescription(e.target.value)}/>
                                <button type="submit" className="btn-glass">Додели Задача <Zap size={16}/></button>
                            </form>
                        </section>

                        <section className="glass-card mt-4">
                            <h3><CheckCircle className="text-glow-green" size={18}/> Активни Задачи</h3>
                            <div className="task-list">
                                {tasks.length === 0 ?
                                    <p className="text-muted">Нема active задачи.</p> : tasks.map(task => (
                                        <div key={task.id} className="glass-task-row">
                                            <div className="task-info">
                                                <strong>{task.title}</strong>
                                                <span>👤 {task.assigned_to}</span>
                                            </div>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <span
                                                    className={`glass-badge ${task.status}`}>{task.status.toUpperCase()}</span>
                                                <button onClick={() => handleDeleteTask(task.id)} className="btn-delete"
                                                        title="Избриши">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                    </div>

                    <div className="right-column">

                        <section className="glass-card" style={{marginBottom: '30px'}}>
                            <h3><UsersRound className="text-glow-blue" size={18}/> Напредок по Тимови</h3>
                            <div className="team-progress-list">
                                {teamsProgress.length === 0 ? (
                                    <p className="text-muted">Сеуште нема тимови со членови.</p>
                                ) : (
                                    teamsProgress.map((team) => (
                                        <div key={team.id} className="team-group-card">
                                            <div className="team-group-header">
                                                <span className="team-name-title">📂 {team.name}</span>
                                                <span
                                                    className={`task-percent text-color-${team.colorIndex}`}>{team.percentage}% ({team.done}/{team.total})</span>
                                            </div>

                                            <div className="progress-bar-bg">
                                                <div className={`progress-bar-fill fill-color-${team.colorIndex}`}
                                                     style={{width: `${team.percentage}%`}}></div>
                                            </div>

                                            <div className="team-members-list">
                                                {team.members.map(member => (
                                                    <div key={member.id} className="member-mini-row">
                                                        <span className="member-name">👤 {member.name}</span>
                                                        <span
                                                            className="member-stats">{member.done}/{member.total} завршени</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="mac-window">
                            <div className="mac-header">
                                <div className="mac-dots">
                                    <span className="mac-dot dot-red"></span>
                                    <span className="mac-dot dot-yellow"></span>
                                    <span className="mac-dot dot-green"></span>
                                </div>
                                <span className="mac-title">Activity Feed — во живо</span>
                            </div>

                            <div className="mac-body real-log-list">
                                {logs.length === 0 ?
                                    <p className="text-muted">Сеуште нема активности.</p> : logs.map(log => {
                                        const {icon, colorClass} = getLogIconAndColor(log.action);
                                        return (
                                            <div key={log.id} className="feed-item">
                                                <div className={`feed-icon ${colorClass}`}>{icon}</div>
                                                <div className="feed-content">
                                                    <p>
                                                        <strong>{log.user_name}</strong> {log.action.replace('Го смени статусот на', 'го премести').replace('Ја додели задачата:', 'ја креираше задачата')}
                                                    </p>
                                                </div>
                                                <div className="feed-time">{timeAgo(log.created_at)}</div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;