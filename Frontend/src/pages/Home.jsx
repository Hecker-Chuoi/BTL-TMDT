import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDB, getMainImage, formatMoney, addToCart, getFlashSale, getFlashSaleDiscountForProduct } from '../utils/mockData';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flashSale, setFlashSaleData] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    // Load flash sale config
    const flashSaleConfig = getFlashSale();
    setFlashSaleData(flashSaleConfig);

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

  const slides = [
    "https://placehold.co/1200x400/0056b3/white?text=Back+to+School+-+Giam+Gia+30%25",
    "https://placehold.co/1200x400/ff4757/white?text=Flash+Sale+Cuoi+Tuan+-+Giam+50%25",
    "https://placehold.co/1200x400/2d3436/white?text=San+Pham+Moi+-+Dat+Truoc+Ngay"
  ];

  useEffect(() => {
    // Load products
    const dbData = getDB();
    setProducts(dbData);

    // Auto-slide
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const moveSlide = (direction) => {
    setCurrentSlide(prev => {
      let next = prev + direction;
      if (next < 0) next = slides.length - 1;
      if (next >= slides.length) next = 0;
      return next;
    });
  };

  // Split data
  const flashSaleData = products.slice(0, 2); // get first 2 for flash sale
  
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
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star"></i>
        <i className="fas fa-star-half-alt"></i> 
        <span style={{ color: '#777', fontSize: '12px', marginLeft: '5px' }}>(42 đánh giá)</span>
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
      <section className="hero-slider container">
        <div className="slider-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((imgUrl, index) => (
            <div className="slide" key={index}>
              <img src={imgUrl} alt={`Banner ${index + 1}`} />
            </div>
          ))}
        </div>
        
        <button className="slider-btn prev" onClick={() => moveSlide(-1)}><i className="fas fa-chevron-left"></i></button>
        <button className="slider-btn next" onClick={() => moveSlide(1)}><i className="fas fa-chevron-right"></i></button>
        
        <div className="slider-dots">
          {slides.map((_, index) => (
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

      <section className="flash-sale container">
        <h2 className="section-title"><i className="fas fa-bolt" style={{ color: 'red' }}></i> Flash Sale</h2>
        <div className="countdown" id="countdown" style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>{countdown}</div>
        <div className="product-grid">
          {flashSale && flashSale.product_ids.length > 0 ? 
            products
              .filter(p => flashSale.product_ids.includes(p.id))
              .map(p => <ProductCard key={p.id} product={p} />) 
            : 
            <p>Đang tải dữ liệu...</p>
          }
        </div>
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
    </div>
  );
};

export default Home;
