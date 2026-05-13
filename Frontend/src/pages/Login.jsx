import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addLoggedInUser } from '../utils/mockData';

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
    const [regPhone, setRegPhone] = useState('');
    const [regErrors, setRegErrors] = useState({});

    // Validate full name
    const validateFullName = (name) => {
        if (!name.trim()) {
            return 'Họ và tên không được để trống';
        }
        if (name.trim().length < 3) {
            return 'Họ và tên phải ít nhất 3 kí tự';
        }
        return '';
    };

    // Validate password
    const validatePassword = (password) => {
        if (!password) {
            return 'Mật khẩu không được để trống';
        }
        if (password.length < 8) {
            return 'Mật khẩu phải ít nhất 8 kí tự';
        }
        if (!/[a-z]/.test(password)) {
            return 'Mật khẩu phải chứa ít nhất một chữ cái thường (a-z)';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Mật khẩu phải chứa ít nhất một chữ cái hoa (A-Z)';
        }
        if (!/[0-9]/.test(password)) {
            return 'Mật khẩu phải chứa ít nhất một chữ số (0-9)';
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'Mật khẩu phải chứa ít nhất một kí tự đặc biệt (!@#$%^&*...)';
        }
        return '';
    };

    // Validate phone
    const validatePhone = (phone) => {
        if (phone.trim() === '') {
            return 'Số điện thoại không được để trống';
        }
        if (!/^[0-9]{10,11}$/.test(phone)) {
            return 'Số điện thoại phải là 10-11 chữ số';
        }
        if (!phone.startsWith('0')) {
            return 'Số điện thoại phải bắt đầu bằng 0';
        }
        return '';
    };

    const handleLogin = (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === loginEmail && u.password === loginPassword);

        if (user) {
            addLoggedInUser(user);
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
        const errors = {};

        // Validate full name
        const nameError = validateFullName(regName);
        if (nameError) {
            errors.fullName = nameError;
        }

        // Validate password
        const passwordError = validatePassword(regPassword);
        if (passwordError) {
            errors.password = passwordError;
        }

        // Validate email
        if (!regEmail.trim()) {
            errors.email = 'Email không được để trống';
        }

        // Validate phone
        const phoneError = validatePhone(regPhone);
        if (phoneError) {
            errors.phone = phoneError;
        }

        setRegErrors(errors);

        // If there are errors, stop registration
        if (Object.keys(errors).length > 0) {
            return;
        }

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
            phone: regPhone,
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
        setRegPhone('');
        setRegErrors({});
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
                            <input 
                                type="text" 
                                value={regName} 
                                onChange={e => setRegName(e.target.value)} 
                                placeholder="VD: Nguyễn Văn A" 
                                required 
                                style={{ borderColor: regErrors.fullName ? '#e74c3c' : '' }}
                            />
                            {regErrors.fullName && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{regErrors.fullName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={regEmail} 
                                onChange={e => setRegEmail(e.target.value)} 
                                placeholder="Nhập email" 
                                required 
                                style={{ borderColor: regErrors.email ? '#e74c3c' : '' }}
                            />
                            {regErrors.email && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{regErrors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input 
                                type="password" 
                                value={regPassword} 
                                onChange={e => setRegPassword(e.target.value)} 
                                placeholder="Tạo mật khẩu (ít nhất 8 kí tự, gồm chữ hoa, chữ thường, số, kí tự đặc biệt)" 
                                required 
                                style={{ borderColor: regErrors.password ? '#e74c3c' : '' }}
                            />
                            {regErrors.password && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{regErrors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="tel" 
                                value={regPhone} 
                                onChange={e => setRegPhone(e.target.value)} 
                                placeholder="VD: 0901234567" 
                                style={{ borderColor: regErrors.phone ? '#e74c3c' : '' }}
                            />
                            {regErrors.phone && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{regErrors.phone}</span>}
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
