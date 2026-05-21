import React, { useState, useEffect } from 'react';
import { getFlashSale, getFlashSaleDiscountForProduct, getCartKey } from '../utils/mockData';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkFlashSaleNotifications();
    // Check every 30 seconds for new flash sale items in cart
    const interval = setInterval(checkFlashSaleNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkFlashSaleNotifications = () => {
    try {
      const cartKey = getCartKey();
      if (!cartKey) return;

      const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
      const flashSale = getFlashSale();
      
      if (!flashSale || !flashSale.product_ids) return;

      // Find cart items that are in flash sale
      const flashSaleItems = cartItems.filter(item => 
        flashSale.product_ids.includes(item.id)
      );

      if (flashSaleItems.length > 0) {
        const newNotifications = flashSaleItems.map(item => {
          const discount = getFlashSaleDiscountForProduct(item.id);
          const salePrice = Math.floor(item.price * (100 - discount) / 100);
          const savedAmount = item.price - salePrice;
          
          return {
            id: item.id,
            productName: item.name,
            discount: discount,
            originalPrice: item.price,
            salePrice: salePrice,
            savedAmount: savedAmount,
            timestamp: Date.now()
          };
        });

        setNotifications(newNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const dismissNotification = (productId) => {
    setNotifications(notifications.filter(n => n.id !== productId));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: 'var(--primary-color)',
          position: 'relative'
        }}
        title="Thông báo"
      >
        <i className="fas fa-bell"></i>
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-8px',
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {notifications.length}
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
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '350px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '10px'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px'
            }}>
              <i className="fas fa-check-circle" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
              Không có thông báo
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                  Flash Sale 🔥 ({notifications.length})
                </h4>
                {notifications.length > 0 && (
                  <button
                    onClick={dismissAllNotifications}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#fffbf0',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5e6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fffbf0'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notif.productName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        <span style={{ textDecoration: 'line-through', marginRight: '8px', color: '#999' }}>
                          {notif.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                          {notif.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#27ae60',
                        fontWeight: 'bold'
                      }}>
                        💰 Tiết kiệm: {notif.savedAmount.toLocaleString('vi-VN')}đ (-{notif.discount}%)
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        fontSize: '16px',
                        marginLeft: '10px'
                      }}
                      title="Đóng"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div style={{
                  padding: '12px 15px',
                  backgroundColor: '#f5f5f5',
                  borderTop: '1px solid #eee',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                  Những sản phẩm này đang trong Flash Sale!
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
