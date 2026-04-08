import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCartKey, removeLoggedInUser } from '../utils/mockData';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    setCurrentUser(user);
    updateCartCount(); // Re-check the custom cart immediately after auth change
  }, [location]);

  const handleLogout = () => {
    if (currentUser) {
      removeLoggedInUser(currentUser.email);
    }
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
    updateCartCount();
    window.dispatchEvent(new Event('cartUpdated')); // Force other listeners (if any) to sync
    navigate('/login');
  };

  const updateCartCount = () => {
    try {
      const cartKey = getCartKey();
      if (!cartKey) {
        setCartCount(0);
        return;
      }
      const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
      const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    // Listen to custom cart update event
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query) {
      navigate(`/shop?q=${query}`);
    }
  };

  return (
    <header>
      <div className="container header-content">
        <Link to="/" className="logo-container">
          {/* Logo placeholder since logo.png might not exist in React public dir yet */}
          <img src="/logo.png" alt="TechStore Logo" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="logo-text">TechStore</div>
        </Link>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <input type="text" name="search" placeholder="Tìm kiếm laptop, điện thoại..." />
          <button type="submit"><i className="fas fa-search"></i></button>
        </form>
        
        <div className="header-actions">
          <Link to="/cart" className="cart-icon">
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">{cartCount}</span>
          </Link>
          {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--primary-color)' }}>
                      <i className="fas fa-user-circle" style={{ marginRight: '5px' }}></i>
                      {currentUser.name}
                  </span>
                  <button onClick={handleLogout} className="login-btn" style={{ background: '#e74c3c', border: 'none', cursor: 'pointer', padding: '8px 15px' }}>Đăng xuất</button>
              </div>
          ) : (
              <Link to="/login" className="login-btn">Đăng nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
