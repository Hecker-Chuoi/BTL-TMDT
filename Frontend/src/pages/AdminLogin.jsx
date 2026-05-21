import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addLoggedInUser } from '../utils/mockData';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                setError('Email hoặc mật khẩu không chính xác!');
                setLoading(false);
                return;
            }
            if (user.role !== 'ADMIN') {
                setError('Tài khoản này không có quyền truy cập trang quản trị. Vui lòng dùng trang đăng nhập thường.');
                setLoading(false);
                return;
            }

            addLoggedInUser(user);
            setLoading(false);
            navigate('/admin');
        }, 600);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Segoe UI', sans-serif"
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
                    }}>
                        <i className="fas fa-user-shield" style={{ fontSize: '28px', color: 'white' }}></i>
                    </div>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '700' }}>
                        TechStore Admin
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', fontSize: '14px' }}>
                        Cổng quản trị hệ thống
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Error message */}
                    {error && (
                        <div style={{
                            background: 'rgba(231,76,60,0.2)',
                            border: '1px solid rgba(231,76,60,0.5)',
                            color: '#ff6b6b',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>
                            EMAIL ADMIN
                        </label>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-envelope" style={{
                                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                color: 'rgba(255,255,255,0.3)', fontSize: '14px'
                            }}></i>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@gmail.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '13px 14px 13px 40px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#667eea'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>
                            MẬT KHẨU
                        </label>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-lock" style={{
                                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                color: 'rgba(255,255,255,0.3)', fontSize: '14px'
                            }}></i>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mật khẩu admin"
                                required
                                style={{
                                    width: '100%',
                                    padding: '13px 14px 13px 40px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#667eea'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? 'rgba(102,126,234,0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.5px',
                            transition: 'opacity 0.2s',
                            boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
                        }}
                    >
                        {loading ? (
                            <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Đang xác thực...</>
                        ) : (
                            <><i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>ĐĂNG NHẬP QUẢN TRỊ</>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '28px', textAlign: 'center' }}>
                    <Link to="/login" style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >
                        <i className="fas fa-arrow-left"></i> Đăng nhập trang khách hàng
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
