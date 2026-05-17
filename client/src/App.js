import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import RoleManagement from './pages/RoleManagement';


// Овие остануваат како "placeholders" додека не ги дизајнираме
// const Login = () => (
//     <div className="login-page" style={{textAlign: 'center', padding: '100px 20px', color: 'white'}}>
//         <h2>Најави се во системот</h2>
//         <div style={{marginTop: '30px'}}>
//             <Link to="/admin" className="btn-primary" style={{marginRight: '15px'}}>Најави се како Админ (Тест)</Link>
//             <Link to="/user" className="btn-secondary">Најави се како Корисник (Тест)</Link>
//         </div>
//     </div>
// );

// const AdminDashboard = () => (
//     <h2 style={{textAlign: 'center', marginTop: '100px', color: 'white'}}>
//         Добредојде Админ! (Тука ќе бидат тимовите и логовите)
//     </h2>
// );

// const UserDashboard = () => (
//     <h2 style={{textAlign: 'center', marginTop: '100px', color: 'white'}}>
//         Добредојде Корисник! (Тука ќе биде твојата табла)
//     </h2>
// );

function App() {
    return (
        <Router>
            {/* Рутирањето одлучува која страница да се прикаже според линкот */}
            <div className="content">
                <Routes>
                    <Route path="/" element={<Landing/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminDashboard/>}/>
                    <Route path="/user" element={<UserDashboard/>}/>
                    <Route path="/roles" element={<RoleManagement />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;