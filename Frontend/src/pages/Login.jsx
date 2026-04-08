import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLoginTab, setIsLoginTab] = useState(true);
    const navigate = useNavigate();

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === loginEmail && u.password === loginPassword);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify({ name: user.full_name, email: user.email, role: user.role }));
            alert('Đăng nhập thành công!');

            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            alert('Email hoặc mật khẩu không chính xác!');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(u => u.email === regEmail)) {
            alert('Email này đã được sử dụng!');
            return;
        }

        const newUser = {
            id: Date.now(),
            email: regEmail,
            password: regPassword,
            full_name: regName,
            role: "USER",
            status: "ACTIVE",
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Đăng ký thành công!');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setIsLoginTab(true); // Switch to login tab
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="auth-container">
                <div className="auth-header">
                    <i className="fas fa-store" style={{ fontSize: '40px', color: 'var(--primary-color)', marginBottom: '10px' }}></i>
                    <h2>TechStore</h2>
                </div>

                <div className="tabs">
                    <div className={`tab ${isLoginTab ? 'active' : ''}`} onClick={() => setIsLoginTab(true)}>Đăng nhập</div>
                    <div className={`tab ${!isLoginTab ? 'active' : ''}`} onClick={() => setIsLoginTab(false)}>Đăng ký</div>
                </div>

                {isLoginTab ? (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Nhập email của bạn" required />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
                        </div>
                        <button type="submit" className="btn-auth">Đăng Nhập</button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="VD: Nguyễn Văn A" required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Nhập email" required />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Tạo mật khẩu" required />
                        </div>
                        <button type="submit" className="btn-auth">Đăng Ký Tài Khoản</button>
                    </form>
                )}

                <Link to="/" className="back-home"><i className="fas fa-arrow-left"></i> Quay lại trang chủ</Link>
            </div>
        </div>
    );
};

export default Login;
