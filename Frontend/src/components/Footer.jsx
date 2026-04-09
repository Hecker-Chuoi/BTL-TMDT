import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-col">
            <h3>Về TechStore</h3>
            <p>Hệ thống bán lẻ đồ điện tử chính hãng uy tín nhất dành cho sinh viên và người đi làm.</p>
          </div>
          <div className="footer-col">
            <h3>Chính Sách</h3>
            <ul>
              <li><Link to="#">Chính sách bảo hành</Link></li>
              <li><Link to="#">Chính sách đổi trả</Link></li>
              <li><Link to="#">Hướng dẫn thanh toán</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Liên Hệ</h3>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> Hà Nội, Việt Nam</li>
              <li><i className="fas fa-phone"></i> 1900 1234</li>
              <li><i className="fas fa-envelope"></i> support@techstore.vn</li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #555', paddingTop: '15px', fontSize: '14px' }}>
          © 2026 TechStore. 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
