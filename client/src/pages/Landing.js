import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {LayoutDashboard, Users, Activity, ArrowUp} from 'lucide-react';
import './Landing.css';
import './LandingSections.css';

// ── TEAM PROGRESS SECTION ─────────────────────────────
const TeamProgressSection = () => {
    const members = [
        {initials: "АП", name: "Ана Петрова", done: 12, total: 14, color: "#7c6fcd"},
        {initials: "СИ", name: "Стефан Илиев", done: 8, total: 13, color: "#3b82f6"},
        {initials: "ЕС", name: "Елена Стојановска", done: 6, total: 10, color: "#10b981"},
        {initials: "МН", name: "Марко Николов", done: 10, total: 11, color: "#f59e0b"},
    ];

    return (
        <section className="team-section">
            <div className="section-header">
                <span className="section-badge">Team Tracking</span>
                <h2 className="section-title">Гледај го напредокот на секој член</h2>
                <p className="section-subtitle">
                    Во реално време — кој работи на што, колку е завршено и кој е следниот чекор.
                </p>
            </div>

            <div className="team-grid">
                <div className="member-list">
                    {members.map((m) => {
                        const pct = Math.round((m.done / m.total) * 100);
                        return (
                            <div className="member-row" key={m.initials}>
                                <div className="member-avatar" style={{background: m.color + "22", color: m.color}}>
                                    {m.initials}
                                </div>
                                <div className="member-info">
                                    <div className="member-name-row">
                                        <span className="member-name">{m.name}</span>
                                        <span className="member-count">{m.done}/{m.total} задачи</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{width: pct + "%", background: m.color}}/>
                                    </div>
                                </div>
                                {/* ПОПРАВЕНО: Тука беше згрешена заградата */}
                                <span className="member-pct" style={{color: m.color}}>{pct}%</span>
                            </div>
                        );
                    })}
                </div>

                <div className="mini-kanban">
                    <div className="kanban-col todo">
                        <span className="col-label">To Do</span>
                        <div className="mini-task">Редизајн на профил страна</div>
                        <div className="mini-task">SEO оптимизација</div>
                    </div>
                    <div className="kanban-col inprogress">
                        <span className="col-label">In Progress</span>
                        <div className="mini-task">API за плаќање</div>
                        <div className="mini-task">Unit тестови</div>
                    </div>
                    <div className="kanban-col done">
                        <span className="col-label">Done ✓</span>
                        <div className="mini-task">Landing дизајн</div>
                        <div className="mini-task">Auth систем</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ── ACTIVITY FEED SECTION ─────────────────────────────
const ActivityFeedSection = () => {
    const logs = [
        {
            icon: "✓",
            name: "Ана Петрова",
            action: "ја заврши задачата",
            task: "Landing дизајн",
            time: "пред 2 мин",
            color: "#10b981"
        },
        {
            icon: "→",
            name: "Стефан Илиев",
            action: "ја помести во Review",
            task: "API за плаќање",
            time: "пред 15 мин",
            color: "#7c6fcd"
        },
        {
            icon: "✎",
            name: "Елена Стојановска",
            action: "коментираше на",
            task: "Unit тестови",
            time: "пред 1 час",
            color: "#f59e0b"
        },
        {
            icon: "+",
            name: "Марко Николов",
            action: "создаде задача",
            task: "SEO оптимизација",
            time: "пред 2 часа",
            color: "#3b82f6"
        },
        {
            icon: "✓",
            name: "Ана Петрова",
            action: "ја заврши задачата",
            task: "Auth систем",
            time: "пред 3 часа",
            color: "#10b981"
        },
    ];

    return (
        <section className="activity-section">
            <div className="section-header">
                <span className="section-badge">Activity Log</span>
                <h2 className="section-title">Секоја акција е забележана</h2>
                <p className="section-subtitle">
                    Целосна историја — кој, што и кога. Никогаш нема да прашаш „кој го направи ова?".
                </p>
            </div>

            <div className="feed-container">
                <div className="feed-window">
                    <div className="feed-topbar">
                        <div className="dot red"/>
                        <div className="dot yellow"/>
                        <div className="dot green"/>
                        <span className="feed-title">Activity Feed — во живо</span>
                    </div>
                    <div className="feed-list">
                        {logs.map((log, i) => (
                            <div className="feed-item" key={i} style={{animationDelay: i * 0.1 + "s"}}>
                                <div className="feed-icon" style={{background: log.color + "22", color: log.color}}>
                                    {log.icon}
                                </div>
                                <div className="feed-text">
                                    <span className="feed-name">{log.name}</span>
                                    <span className="feed-action"> {log.action} </span>
                                    <span className="feed-task">„{log.task}"</span>
                                </div>
                                <span className="feed-time">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// // ── STATS SECTION ─────────────────────────────────────
// const StatsSection = () => (
//     <section className="stats-section">
//         <div className="stats-grid">
//             <div className="stat-card">
//                 <span className="stat-number">500+</span>
//                 <span className="stat-label">Задачи следени</span>
//             </div>
//             <div className="stat-card">
//                 <span className="stat-number">5</span>
//                 <span className="stat-label">Члена во тим</span>
//             </div>
//             <div className="stat-card">
//                 <span className="stat-number">98%</span>
//                 <span className="stat-label">Точност на следење</span>
//             </div>
//             <div className="stat-card">
//                 <span className="stat-number">24/7</span>
//                 <span className="stat-label">Real-time ажурирање</span>
//             </div>
//         </div>
//     </section>
// );

// ── BOTTOM CTA SECTION ────────────────────────────────
const BottomCTA = () => (
    <section className="bottom-cta">
        <h2 className="cta-title">Подготвен да го организираш тимот?</h2>
        <p className="cta-sub">Без хаос. Без изгубени задачи. Само резултати.</p>
        <Link to="/login" className="cta-btn">Започни →</Link>
    </section>
);

// ── MAIN LANDING COMPONENT ────────────────────────────
const Landing = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="landing-container">
            {/* Навигација */}
            <nav className="navbar">
                <div className="logo">
                    <LayoutDashboard className="logo-icon"/>
                    <span>NVD<span className="text-blue">Tracker</span></span>
                </div>
                <div className="nav-links">
                    <a href="#features" className="nav-link">Карактеристики</a>
                    <a href="#team" className="nav-link">За тимови</a>
                    <a href="#activity" className="nav-link">Activity Log</a>
                    <Link to="/login" className="btn-primary">Започни</Link>
                </div>
            </nav>

            {/* Hero */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1>
                        Менаџирајте со проектите <br/>
                        <span className="gradient-text">брзо и едноставно.</span>
                    </h1>
                    <p>
                        Напреден систем за следење на задачи, менаџирање тимови и анализа на прогресот.
                        Создаден за брзи и ефикасни работни текови.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/login" className="btn-primary large">Отвори работен простор</Link>
                        <a href="#features" className="btn-secondary large">Дознај повеќе</a>
                    </div>
                </div>
            </header>

            {/* Feature картички */}
            <section id="features" className="features-section">
                <div className="feature-card">
                    <div className="icon-wrapper blue">
                        <Activity size={32}/>
                    </div>
                    <h3>Activity Tracking</h3>
                    <p>Следете го секој чекор. Знајте точно кој, што и кога сработил преку детални логови.</p>
                </div>
                <div className="feature-card">
                    <div className="icon-wrapper purple">
                        <LayoutDashboard size={32}/>
                    </div>
                    <h3>Kanban Табли</h3>
                    <p>Визуелизирајте го прогресот. Преместувајте задачи од To-Do до Done со леснотија.</p>
                </div>
                <div className="feature-card">
                    <div className="icon-wrapper green">
                        <Users size={32}/>
                    </div>
                    <h3>Тимска Работа</h3>
                    <p>Креирајте тимови, доделувајте задачи и зголемете ја продуктивноста на секој член.</p>
                </div>
            </section>

            {/* Team Progress */}
            <section id="team">
                <TeamProgressSection/>
            </section>

            {/* Activity Feed */}
            <section id="activity">
                <ActivityFeedSection/>
            </section>

            {/*/!* Stats  *!/*/}
            {/*<StatsSection/>*/}

            {/* Bottom CTA */}
            <BottomCTA/>

            {/* Scroll To Top Копче */}
            <button
                className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
                onClick={scrollToTop}
                title="Врати се најгоре"
            >
                <ArrowUp size={20}/>
            </button>
        </div>
    );
};

export default Landing;