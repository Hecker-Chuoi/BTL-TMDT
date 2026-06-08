import React, { useState, useEffect } from 'react';
import { getCoupons } from '../utils/mockData';

const CouponList = () => {
  const [applicableCoupons, setApplicableCoupons] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadApplicableCoupons();

    // Lắng nghe event từ cùng tab (khi Admin tạo/sửa coupon)
    const handleCouponUpdate = () => loadApplicableCoupons();
    window.addEventListener('couponsUpdated', handleCouponUpdate);

    // Lắng nghe StorageEvent để đồng bộ qua tab khác (Admin tab riêng)
    const handleStorageChange = (e) => {
      if (e.key === 'coupons') loadApplicableCoupons();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('couponsUpdated', handleCouponUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadApplicableCoupons = () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      setIsLoggedIn(!!currentUser);

      if (!currentUser) {
        setApplicableCoupons([]);
        return;
      }

      // Lấy id của user hiện tại từ danh sách users
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === currentUser.email);

      const coupons = getCoupons();
      const now = new Date();

      const applicable = coupons.filter(coupon => {
        // 1. Kiểm tra trạng thái
        if (coupon.status !== 'ACTIVE') return false;

        // 2. Kiểm tra thời hạn
        if (coupon.start_date && now < new Date(coupon.start_date)) return false;
        if (coupon.end_date && now >= new Date(coupon.end_date)) return false;

        // 3. Kiểm tra đối tượng áp dụng
        // target_type === 'all'   → áp dụng cho tất cả
        // target_type === 'users' → chỉ áp dụng cho user_ids cụ thể
        if (coupon.target_type === 'all') return true;

        if (coupon.target_type === 'users') {
          if (!user) return false;
          return Array.isArray(coupon.user_ids) && coupon.user_ids.includes(user.id);
        }

        return false;
      });

      setApplicableCoupons(applicable);
    } catch (error) {
      console.error('Error loading applicable coupons:', error);
      setApplicableCoupons([]);
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code).catch(() => {
      // fallback cho môi trường không hỗ trợ clipboard API
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (coupon) => {
    if (coupon.discount_type === 'percent') {
      return `Giảm ${coupon.discount_value}%`;
    }
    return `Giảm ${coupon.discount_value.toLocaleString('vi-VN')}đ`;
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const diff = new Date(endDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getScopeLabel = (coupon) => {
    if (coupon.scope_type === 'all') return 'Tất cả sản phẩm';
    if (coupon.scope_type === 'products' && coupon.product_ids?.length > 0)
      return `${coupon.product_ids.length} sản phẩm chọn lọc`;
    return 'Tất cả sản phẩm';
  };

  // Chưa đăng nhập → không render gì cả
  if (!isLoggedIn) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Coupon Icon */}
      <button
        onClick={() => setShowDropdown(prev => !prev)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: 'var(--primary-color)',
          position: 'relative',
          padding: '5px',
        }}
        title="Mã giảm giá của tôi"
      >
        <i className="fas fa-ticket-alt"></i>
        {applicableCoupons.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-8px',
            backgroundColor: '#27ae60',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            {applicableCoupons.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          minWidth: '360px',
          maxHeight: '480px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '10px',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
            borderRadius: '10px 10px 0 0',
          }}>
            <i className="fas fa-ticket-alt" style={{ color: '#27ae60', fontSize: '16px' }}></i>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#222' }}>
              Mã giảm giá của tôi
              {applicableCoupons.length > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: '#27ae60',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1px 8px',
                  fontSize: '12px',
                }}>
                  {applicableCoupons.length}
                </span>
              )}
            </h4>
          </div>

          {/* Content */}
          {applicableCoupons.length === 0 ? (
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: '#aaa',
            }}>
              <i className="fas fa-tags" style={{ fontSize: '36px', marginBottom: '12px', display: 'block', color: '#ddd' }}></i>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#999', marginBottom: '6px' }}>
                Không có mã giảm giá nào
              </div>
              <div style={{ fontSize: '12px', color: '#bbb' }}>
                Hiện tại chưa có ưu đãi dành cho bạn
              </div>
            </div>
          ) : (
            <div style={{ padding: '12px' }}>
              {applicableCoupons.map((coupon) => {
                const daysLeft = getDaysLeft(coupon.end_date);
                const isAboutToExpire = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
                const isExpiredSoon = daysLeft !== null && daysLeft <= 0;

                return (
                  <div
                    key={coupon.id}
                    style={{
                      border: `1.5px dashed ${isAboutToExpire ? '#fa8c16' : '#27ae60'}`,
                      borderRadius: '8px',
                      marginBottom: '10px',
                      overflow: 'hidden',
                      background: isAboutToExpire ? '#fffbe6' : '#f6ffed',
                    }}
                  >
                    {/* Coupon header stripe */}
                    <div style={{
                      background: isAboutToExpire ? '#fa8c16' : '#27ae60',
                      color: 'white',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span>
                        {coupon.target_type === 'users'
                          ? '🎁 Ưu đãi riêng cho bạn'
                          : '🎟️ Ưu đãi toàn cửa hàng'}
                      </span>
                      {daysLeft !== null && (
                        <span style={{ opacity: 0.9 }}>
                          {isExpiredSoon
                            ? 'Đã hết hạn'
                            : daysLeft === 0
                            ? 'Hết hạn hôm nay!'
                            : isAboutToExpire
                            ? `⚠️ Còn ${daysLeft} ngày`
                            : `Còn ${daysLeft} ngày`}
                        </span>
                      )}
                    </div>

                    {/* Coupon body */}
                    <div style={{ padding: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        {/* Left info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#e74c3c',
                            marginBottom: '4px',
                            lineHeight: 1.2,
                          }}>
                            {formatDiscount(coupon)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                            <i className="fas fa-box-open" style={{ marginRight: '4px', color: '#888' }}></i>
                            {getScopeLabel(coupon)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }}></i>
                            HSD: {coupon.end_date
                              ? new Date(coupon.end_date).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}
                          </div>
                        </div>

                        {/* Right: code + copy */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{
                            background: 'white',
                            border: '1px dashed #ccc',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#333',
                            letterSpacing: '1px',
                            marginBottom: '6px',
                          }}>
                            {coupon.code}
                          </div>
                          <button
                            onClick={() => handleCopyCoupon(coupon.code)}
                            style={{
                              width: '100%',
                              padding: '5px 10px',
                              backgroundColor: copiedCode === coupon.code ? '#27ae60' : '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              transition: 'background-color 0.3s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'center',
                            }}
                          >
                            {copiedCode === coupon.code
                              ? <><i className="fas fa-check"></i> Đã copy</>
                              : <><i className="fas fa-copy"></i> Copy</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid #eee',
            backgroundColor: '#fafafa',
            fontSize: '12px',
            color: '#888',
            textAlign: 'center',
            borderRadius: '0 0 10px 10px',
          }}>
            <i className="fas fa-shopping-cart" style={{ marginRight: '5px' }}></i>
            Dán mã tại trang thanh toán để được giảm giá
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
