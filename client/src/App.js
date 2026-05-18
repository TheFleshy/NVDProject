import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import RoleManagement from './pages/RoleManagement';




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