import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Mail, Lock, ArrowRight, LayoutDashboard} from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 1. Праќаме барање до бекендот
            const res = await axios.post('/api/login', {
                email,
                password
            });

            const userData = res.data;

            // 2. Го зачувуваме корисникот во Local Storage за да знаеме кој е најавен
            localStorage.setItem('user', JSON.stringify(userData));

            // 3. Рутирање според улогата (Role-Based Access)
            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/user');
            }

        } catch (err) {
            // Ако бекендот врати грешка (пр. 401 Unauthorized)
            setError(err.response?.data || "Грешка при најава. Проверете ги податоците.");
        }
    };

    return (
        <div className="login-container">
            <Link to="/" className="login-logo">
                <LayoutDashboard className="logo-icon" size={28}/>
                <span>NVD<span className="text-blue">Tracker</span></span>
            </Link>

            <div className="login-card">
                <div className="login-header">
                    <h2>Добредојдовте назад</h2>
                    <p>Најавете се во вашиот работен простор</p>
                </div>

                {/* Приказ на грешка ако згрешиш лозинка */}
                {error && <div style={{
                    color: '#ef4444',
                    marginBottom: '15px',
                    textAlign: 'center',
                    fontSize: '14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '10px',
                    borderRadius: '8px'
                }}>{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Е-маил адреса</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20}/>
                            <input
                                type="email"
                                placeholder="ime.prezime@finki.ukim.mk"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label>Лозинка</label>
                            <Link to="/reset-password" className="forgot-password">Заборавена лозинка?</Link>
                        </div>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20}/>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn">
                        Најави се <ArrowRight size={20}/>
                    </button>
                </form>

                <p style={{textAlign: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '14px'}}>
                    Немате профил? <Link to="/register" style={{color: '#3b82f6', textDecoration: 'none'}}>Регистрирајте
                    се</Link>
                </p>

            </div>
        </div>
    );
};

export default Login;
