import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {LayoutDashboard, Users, Shield, LogOut, Plus, UsersRound} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import './AdminDashboard.css';

const RoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]); // НОВО: Чување на тимовите
    const [newTeamName, setNewTeamName] = useState(''); // НОВО: За инпутот за нов тим

    const navigate = useNavigate();
    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        if (loggedInUser.role !== 'admin') {
            alert("🔒 Немате администраторски пристап до оваа страница!");
            navigate('/');
        } else {
            fetchUsers();
            fetchTeams(); // Ги влечеме и тимовите при пуштање
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Грешка при влечење корисници", error);
        }
    };

    // НОВО: Влечење тимови
    const fetchTeams = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/teams');
            setTeams(res.data);
        } catch (error) {
            console.error("Грешка при влечење тимови", error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/role`, {role: newRole});
            fetchUsers();
        } catch (error) {
            console.error("Грешка при промена на улога", error);
        }
    };

    // НОВО: Промена на тим на корисник
    const handleTeamChange = async (userId, newTeam) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${userId}/team`, {team_name: newTeam});
            fetchUsers();
        } catch (error) {
            console.error("Грешка при промена на тим", error);
        }
    };

    // НОВО: Креирање на нов тим во базата
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName) return;
        try {
            await axios.post('http://localhost:5000/api/teams', {name: newTeamName});
            setNewTeamName('');
            fetchTeams(); // Освежи ја листата на тимови
        } catch (error) {
            alert("Грешка! Можно е тимот со ова име веќе да постои.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                    <Link to="/admin" className="nav-item">← Назад во Табла</Link>

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
                    <h1>Управување со Корисници и Тимови</h1>
                    <p>Организирајте ги членовите во екипи и доделете привилегии.</p>
                </header>

                <div className="admin-grid" style={{gridTemplateColumns: '1fr', gap: '20px'}}>

                    {/* НОВО: Секција за креирање тимови */}
                    <section className="glass-card mt-4">
                        <h3><Plus className="text-glow-purple" size={18}/> Креирај Нов Тим</h3>
                        <form onSubmit={handleCreateTeam} className="glass-form"
                              style={{flexDirection: 'row', alignItems: 'center'}}>
                            <input
                                type="text"
                                placeholder="Внеси име на тим (пр. Frontend, Маркетинг)..."
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                required
                                style={{flex: 1}}
                            />
                            <button type="submit" className="btn-glass" style={{width: 'auto', padding: '14px 25px'}}>
                                Додај Тим <UsersRound size={16}/>
                            </button>
                        </form>
                    </section>

                    {/* Секција за корисници */}
                    <section className="glass-card">
                        <h3><Users className="text-glow-blue" size={18}/> Сите регистрирани профили</h3>
                        <div className="task-list" style={{maxHeight: '600px'}}>
                            {users.map(user => (
                                <div key={user.id} className="glass-task-row" style={{padding: '20px'}}>
                                    <div className="task-info">
                                        <strong>{user.name}</strong>
                                        <span>✉️ {user.email}</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>

                                        {/* Мени за ТИМ */}
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#94a3b8',
                                                textTransform: 'uppercase'
                                            }}>Сектор / Тим</span>
                                            <select
                                                className="glass-select"
                                                style={{minWidth: '150px', padding: '8px 15px'}}
                                                value={user.team_name || 'Без Тим'}
                                                onChange={(e) => handleTeamChange(user.id, e.target.value)}
                                            >
                                                <option value="Без Тим">Без Тим</option>
                                                {teams.map(t => (
                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Мени за УЛОГА */}
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#94a3b8',
                                                textTransform: 'uppercase'
                                            }}>Привилегија</span>
                                            {user.email === 'admin@finki.ukim.mk' ? (
                                                <span className="glass-badge done" style={{
                                                    padding: '8px 12px',
                                                    fontSize: '12px',
                                                    height: '37px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}><Shield size={12} style={{marginRight: '5px'}}/> ГЛАВЕН АДМИН</span>
                                            ) : (
                                                <select
                                                    className="glass-select"
                                                    style={{minWidth: '140px', padding: '8px 15px'}}
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="user">User </option>
                                                    <option value="admin">Admin </option>
                                                </select>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default RoleManagement;