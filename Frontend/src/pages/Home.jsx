import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDB, getMainImage, formatMoney, addToCart, getFlashSale, getFlashSaleDiscountForProduct, getBannerSettings, getFlashSaleItemsPerPage } from '../utils/mockData';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flashSale, setFlashSaleData] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [banners, setBanners] = useState([]);
  const [currentFlashSalePage, setCurrentFlashSalePage] = useState(0);
  const [flashSaleItemsPerPage, setFlashSaleItemsPerPage] = useState(4);

  // Load initial data and countdown
  useEffect(() => {
    // Load flash sale config
    const flashSaleConfig = getFlashSale();
    setFlashSaleData(flashSaleConfig);

    // Load banner settings
    const bannerSettings = getBannerSettings();
    setBanners(bannerSettings);

    // Load flash sale items per page setting
    const itemsPerPage = getFlashSaleItemsPerPage();
    setFlashSaleItemsPerPage(itemsPerPage);

    // Update countdown
    const updateCountdown = () => {
      const endTime = new Date(flashSaleConfig.end_time);
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        setCountdown('Flash Sale đã kết thúc');
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`Kết thúc sau: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  // Load products and setup auto-slide
  useEffect(() => {
    const dbData = getDB();
    setProducts(dbData);

    // Auto-slide
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (banners.length || 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const moveSlide = (direction) => {
    setCurrentSlide(prev => {
      let next = prev + direction;
      if (next < 0) next = banners.length - 1;
      if (next >= banners.length) next = 0;
      return next;
    });
  };

  const moveFlashSalePage = (direction) => {
    if (!flashSale || !flashSale.product_ids || flashSale.product_ids.length === 0) return;
    
    const totalPages = Math.ceil(flashSale.product_ids.length / flashSaleItemsPerPage);
    setCurrentFlashSalePage(prev => {
      let next = prev + direction;
      if (next < 0) next = totalPages - 1;
      if (next >= totalPages) next = 0;
      return next;
    });
  };

  // Get average rating for a product
  const getAverageRating = (productId) => {
    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || [];
    const productReviews = allReviews.filter(r => r.product_id === productId);
    if (productReviews.length === 0) return 0;
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return totalRating / productReviews.length;
  };

  // Get top 4 laptops with highest rating
  const laptopsData = products
    .filter(p => p.category_id === 1)
    .map(p => ({
      ...p,
      avgRating: getAverageRating(p.id)
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 4);

  // Reusable product card rendering
  const ProductCard = ({ product }) => {
    const discountPercent = getFlashSaleDiscountForProduct(product.id);
    const isFlashSale = discountPercent > 0;
    const salePrice = isFlashSale ? Math.floor(product.price * (100 - discountPercent) / 100) : product.price;
    const savedAmount = product.price - salePrice;

    // Get rating data
    const allReviews = JSON.parse(localStorage.getItem('productReviews')) || [];
    const productReviews = allReviews.filter(r => r.product_id === product.id);
    const hasReviews = productReviews.length > 0;
    const avgRating = hasReviews ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length) : 0;

    return (
    <div className="product-card" style={{ position: 'relative' }}>
      {isFlashSale && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 10
        }}>
          -{discountPercent}%
        </div>
      )}
      <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <img src={getMainImage(product)} alt={product.name} />
        <div className="product-title" style={{ transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color='var(--primary-color)'} onMouseOut={e => e.target.style.color='inherit'}>
            {product.name}
        </div>
      </Link>
      <div>
        {isFlashSale ? (
          <div>
            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', marginRight: '8px' }}>
              {formatMoney(product.price)}
            </span>
            <span className="price" style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(salePrice)}</span>
          </div>
        ) : (
          <span className="price">{formatMoney(product.price)}</span>
        )}
        {isFlashSale && (
          <div style={{ fontSize: '12px', color: '#27ae60', fontWeight: 'bold', marginTop: '4px' }}>
            Tiết kiệm: {formatMoney(savedAmount)}
          </div>
        )}
      </div>
      <div style={{ color: '#f39c12', fontSize: '13px', margin: '8px 0' }}>
        {avgRating > 0 ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className={i < Math.round(avgRating) ? "fas fa-star" : "far fa-star"} style={{ color: i < Math.round(avgRating) ? "#f39c12" : "#ccc" }}></i>
            ))}
            <span style={{ color: '#777', fontSize: '12px', marginLeft: '5px' }}>({productReviews.length} đánh giá)</span>
          </>
        ) : (
          <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>Chưa có đánh giá</span>
        )}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: product.stock > 0 ? '#27ae60' : '#e74c3c' }}>
        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
      </div>
      <button 
        className="add-to-cart-btn" 
        onClick={() => product.stock > 0 && addToCart(product.id)}
        disabled={product.stock === 0}
        style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
      >
        <i className="fas fa-cart-plus"></i> {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
      </button>
    </div>
    );
  };

  return (
    <div>
      {/* Banner Carousel */}
      <section className="hero-slider container">
        <div className="slider-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {banners.length > 0 ? (
            banners.map((banner, index) => (
              <Link 
                key={banner.id || index} 
                to={`/product/${banner.product_id}`}
                style={{ display: 'block', textDecoration: 'none', minWidth: '100%' }}
              >
                <div className="slide">
                  <img src={banner.image_url} alt={`Banner ${index + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </Link>
            ))
          ) : (
            <div className="slide">
              <img src="https://placehold.co/1200x400/ddd/999?text=No+Banners" alt="No Banners" />
            </div>
          )}
        </div>
        
        <button className="slider-btn prev" onClick={() => moveSlide(-1)}><i className="fas fa-chevron-left"></i></button>
        <button className="slider-btn next" onClick={() => moveSlide(1)}><i className="fas fa-chevron-right"></i></button>
        
        <div className="slider-dots">
          {banners.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </section>

      <section className="categories">
        <Link to="/shop?cat=1" className="category-item">
          <i className="fas fa-laptop"></i>
          <p>Laptop</p>
        </Link>
        <Link to="/shop?cat=2" className="category-item">
          <i className="fas fa-microchip"></i>
          <p>Linh Kiện PC</p>
        </Link>
      </section>

      <section className="container">
        <h2 className="section-title">Laptop Nổi Bật</h2>
        <div className="product-grid">
          {laptopsData.length > 0 ? laptopsData.map(p => <ProductCard key={p.id} product={p} />) : <p>Đang tải dữ liệu...</p>}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
          <Link to="/shop" style={{ padding: '10px 30px', border: '2px solid var(--primary-color)', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold', borderRadius: '25px', transition: '0.3s', display: 'inline-block' }}>
            Xem tất cả sản phẩm <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      <section className="flash-sale container">
        <h2 className="section-title"><i className="fas fa-bolt" style={{ color: 'red' }}></i> Flash Sale</h2>
        <div className="countdown" id="countdown" style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>{countdown}</div>
        
        <div style={{ position: 'relative', marginTop: '20px' }}>
          <div className="product-grid">
            {flashSale && flashSale.product_ids && flashSale.product_ids.length > 0 ? 
              products
                .filter(p => flashSale.product_ids.includes(p.id))
                .slice(currentFlashSalePage * flashSaleItemsPerPage, (currentFlashSalePage + 1) * flashSaleItemsPerPage)
                .map(p => <ProductCard key={p.id} product={p} showRating={false} />) 
              : 
              <p>Đang tải dữ liệu...</p>
            }
          </div>

          {flashSale && flashSale.product_ids && flashSale.product_ids.length > flashSaleItemsPerPage && (
            <>
              <button 
                className="slider-btn prev"
                onClick={() => moveFlashSalePage(-1)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button 
                className="slider-btn next"
                onClick={() => moveFlashSalePage(1)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              {/* <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  Trang {currentFlashSalePage + 1} / {Math.ceil(flashSale.product_ids.length / flashSaleItemsPerPage)}
                </span>
              </div> */}
            </>
          )}
        </div>
      </section>

      
    </div>
  );
};

export default Home;
