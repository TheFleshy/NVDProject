import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {Mail, Lock, User, ArrowRight, LayoutDashboard} from 'lucide-react';
import './Login.css'; // Го користиме истиот CSS од Login за да изгледаат исто

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/register', {
                name,
                email,
                password
            });
            alert("Успешна регистрација! Сега најавете се.");
            navigate('/login'); // После успешна регистрација, го праќаме на Login
        } catch (err) {
            setError(err.response?.data || "Грешка при регистрација");
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
                    <h2>Креирајте профил</h2>
                    <p>Придружете се на тимот</p>
                </div>

                {error && <div style={{
                    color: '#ef4444',
                    marginBottom: '15px',
                    textAlign: 'center',
                    fontSize: '14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '10px',
                    borderRadius: '8px'
                }}>{error}</div>}

                <form onSubmit={handleRegister} className="login-form">
                    <div className="input-group">
                        <label>Име и Презиме</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={20}/>
                            <input
                                type="text"
                                placeholder="Пр. Андреј"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                        <label>Лозинка</label>
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
                        Регистрирај се <ArrowRight size={20}/>
                    </button>
                </form>

                <p style={{textAlign: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '14px'}}>
                    Веќе имате профил? <Link to="/login" style={{color: '#3b82f6', textDecoration: 'none'}}>Најавете се
                    тука</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;