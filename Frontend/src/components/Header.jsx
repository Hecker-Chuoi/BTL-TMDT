import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCartKey, removeLoggedInUser, getSearchSuggestions } from '../utils/mockData';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    const query = searchInput.trim();
    if (query) {
      setShowSuggestions(false);
      setSearchInput('');
      setSuggestions([]);
      navigate(`/shop?q=${query}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    const results = getSearchSuggestions(value, 3);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSearchInputFocus = () => {
    const results = getSearchSuggestions(searchInput, 3);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    navigate(`/product/${product.id}`);
    setSearchInput('');
    setSuggestions([]);
  };

  const handleKeywordClick = (keyword) => {
    setSearchInput(keyword);
    const results = getSearchSuggestions(keyword, 3);
    setSuggestions(results);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <header>
      <div className="container header-content">
        <Link to="/" className="logo-container">
          {/* Logo placeholder since logo.png might not exist in React public dir yet */}
          <img src="/logo.png" alt="TechStore Logo" className="logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="logo-text">TechStore</div>
        </Link>
        
        <form className="search-bar" onSubmit={handleSearch} style={{ position: 'relative' }}>
          <input 
            type="text" 
            value={searchInput}
            onChange={handleSearchChange}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchBlur}
            placeholder="Tìm kiếm laptop, điện thoại..." 
            autoComplete="off"
          />
          <button type="submit"><i className="fas fa-search"></i></button>
          
          {showSuggestions && (suggestions.keywords?.length > 0 || suggestions.products?.length > 0) && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              maxHeight: '400px',
              overflowY: 'auto',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              {/* Keywords section */}
              {suggestions.keywords?.length > 0 && (
                <>
                  {suggestions.keywords.map((keyword, idx) => (
                    <div
                      key={`keyword-${idx}`}
                      onClick={() => handleKeywordClick(keyword)}
                      style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#666',
                        fontSize: '13px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <span>{keyword}</span>
                      <i className="fas fa-arrow-right" style={{ fontSize: '11px', color: '#999' }}></i>
                    </div>
                  ))}
                </>
              )}
              
              {/* Products section */}
              {suggestions.products?.length > 0 && (
                <>
                  <div style={{
                    padding: '10px 15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#333',
                    background: '#f5f5f5',
                    borderBottom: '1px solid #eee'
                  }}>
                    Sản phẩm đề xuất
                  </div>
                  {suggestions.products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <img 
                        src={product.images?.[0]?.image_url || 'https://placehold.co/40x40'} 
                        alt={product.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '13px' }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#e74c3c' }}>
                          {product.price.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
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
