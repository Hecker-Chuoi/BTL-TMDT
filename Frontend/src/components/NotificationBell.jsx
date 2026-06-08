import React, { useState, useEffect, useRef } from 'react';
import { getFlashSale, getFlashSaleDiscountForProduct, getCartKey } from '../utils/mockData';

const NOTIF_STORAGE_KEY = 'orderNotifications_unread';

const NotificationBell = () => {
  const [flashSaleNotifications, setFlashSaleNotifications] = useState([]);

  // Tải thông báo đơn hàng chưa đọc từ localStorage để giữ qua reload
  const [orderNotifications, setOrderNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showDropdown, setShowDropdown] = useState(false);

  // Lưu trạng thái đơn hàng trước đó để phát hiện thay đổi
  const [prevOrderStates, setPrevOrderStates] = useState(() => {
    try {
      const stored = localStorage.getItem('prevOrderStates');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Dùng ref để truy cập giá trị mới nhất trong các callback không re-render
  const prevOrderStatesRef = useRef(prevOrderStates);
  const orderNotificationsRef = useRef(orderNotifications);

  useEffect(() => {
    prevOrderStatesRef.current = prevOrderStates;
  }, [prevOrderStates]);

  useEffect(() => {
    orderNotificationsRef.current = orderNotifications;
    // Đồng bộ thông báo chưa đọc vào localStorage
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(orderNotifications));
  }, [orderNotifications]);

  const getLocalArray = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'PENDING':       'Chờ xác nhận',
      'CONFIRMED':     'Đã xác nhận',
      'SHIPPING':      'Đang chuẩn bị',
      'DELIVERING':    'Đang giao',
      'DELIVERED':     'Đã giao',
      'COMPLETED':     'Hoàn tất',
      'CANCELLED':     'Đã hủy',
      'RETURN_PENDING':'Chờ hoàn',
      'RETURNED':      'Đã hoàn',
      'REFUNDED':      'Đã hoàn tiền',
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING':       '#ad6800',
      'CONFIRMED':     '#1890ff',
      'SHIPPING':      '#faad14',
      'DELIVERING':    '#faad14',
      'DELIVERED':     '#52c41a',
      'COMPLETED':     '#52c41a',
      'CANCELLED':     '#f5222d',
      'RETURN_PENDING':'#9e1068',
      'RETURNED':      '#f5222d',
      'REFUNDED':      '#f5222d',
    };
    return colors[status] || '#666';
  };

  // ─── Kiểm tra thông báo flash sale ───────────────────────────────────────
  const checkFlashSaleNotifications = () => {
    try {
      const cartKey = getCartKey();
      if (!cartKey) { setFlashSaleNotifications([]); return; }

      const cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
      const flashSale = getFlashSale();

      if (!flashSale || !flashSale.product_ids) { setFlashSaleNotifications([]); return; }

      const flashSaleItems = cartItems.filter(item =>
        flashSale.product_ids.includes(item.id)
      );

      if (flashSaleItems.length > 0) {
        setFlashSaleNotifications(
          flashSaleItems.map(item => {
            const discount   = getFlashSaleDiscountForProduct(item.id);
            const salePrice  = Math.floor(item.price * (100 - discount) / 100);
            return {
              id: `flash_${item.id}`,
              type: 'flashSale',
              productName:   item.name,
              discount,
              originalPrice: item.price,
              salePrice,
              savedAmount:   item.price - salePrice,
              timestamp:     Date.now(),
            };
          })
        );
      } else {
        setFlashSaleNotifications([]);
      }
    } catch (error) {
      console.error('Error checking flash sale notifications:', error);
    }
  };

  // ─── Kiểm tra và tích lũy thông báo đơn hàng ────────────────────────────
  const checkOrderNotifications = () => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      if (!currentUser) {
        setOrderNotifications([]);
        setPrevOrderStates({});
        localStorage.setItem('prevOrderStates', JSON.stringify({}));
        return;
      }

      const orders = getLocalArray('orders');
      const users  = getLocalArray('users');
      const user   = users.find(u => u.email === currentUser.email);

      if (!user) {
        setOrderNotifications([]);
        setPrevOrderStates({});
        localStorage.setItem('prevOrderStates', JSON.stringify({}));
        return;
      }

      const userOrders = orders.filter(order => order.user_id === user.id);
      const currentPrevStates = prevOrderStatesRef.current;

      // Tìm những đơn hàng có trạng thái thay đổi
      const newChanges = [];
      userOrders.forEach(order => {
        const prevStatus = currentPrevStates[order.id];
        // Có trạng thái trước đó VÀ khác với trạng thái hiện tại
        if (prevStatus !== undefined && prevStatus !== order.status) {
          newChanges.push({
            id:             `order_${order.id}_${order.status}_${Date.now()}`,
            type:           'orderUpdate',
            orderId:        order.id,
            previousStatus: prevStatus,
            currentStatus:  order.status,
            statusLabel:    getStatusLabel(order.status),
            statusColor:    getStatusColor(order.status),
            timestamp:      Date.now(),
          });
        }
      });

      // Cập nhật prevOrderStates với trạng thái mới nhất
      const newPrevStates = {};
      userOrders.forEach(order => {
        newPrevStates[order.id] = order.status;
      });
      setPrevOrderStates(newPrevStates);
      localStorage.setItem('prevOrderStates', JSON.stringify(newPrevStates));

      // Nếu có thay đổi mới → tích lũy vào danh sách thông báo hiện tại
      if (newChanges.length > 0) {
        setOrderNotifications(prev => {
          // Loại bỏ thông báo cũ của cùng orderId nếu có, rồi thêm cái mới nhất
          const filteredPrev = prev.filter(n =>
            !newChanges.some(c => c.orderId === n.orderId)
          );
          return [...newChanges, ...filteredPrev];
        });
      }
    } catch (error) {
      console.error('Error checking order notifications:', error);
    }
  };

  useEffect(() => {
    // Chạy lần đầu
    checkFlashSaleNotifications();
    checkOrderNotifications();

    // Polling mỗi 30 giây
    const interval = setInterval(() => {
      checkFlashSaleNotifications();
      checkOrderNotifications();
    }, 30000);

    // Lắng nghe event từ cùng tab (Admin duyệt đơn trong cùng cửa sổ)
    const handleOrdersUpdated = () => {
      checkOrderNotifications();
    };
    window.addEventListener('ordersUpdated', handleOrdersUpdated);

    // Lắng nghe StorageEvent để đồng bộ qua các tab khác nhau
    // (Admin mở tab riêng, user mở tab riêng)
    const handleStorageChange = (e) => {
      if (e.key === 'orders') {
        checkOrderNotifications();
      }
      // Đồng bộ thông báo từ tab khác (nếu có)
      if (e.key === NOTIF_STORAGE_KEY && e.newValue) {
        try {
          setOrderNotifications(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Xử lý đóng thông báo ────────────────────────────────────────────────
  const dismissNotification = (id) => {
    setFlashSaleNotifications(prev => prev.filter(n => n.id !== id));
    setOrderNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAllNotifications = () => {
    setFlashSaleNotifications([]);
    setOrderNotifications([]);
  };

  const allNotifications = [...flashSaleNotifications, ...orderNotifications];
  const totalNotifications = allNotifications.length;

  // ─── Render ───────────────────────────────────────────────────────────────
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
          position: 'relative',
          padding: '5px',
        }}
        title="Thông báo"
      >
        <i className="fas fa-bell"></i>
        {totalNotifications > 0 && (
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
            fontWeight: 'bold',
          }}>
            {totalNotifications}
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
          minWidth: '380px',
          maxHeight: '500px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '10px',
        }}>
          {totalNotifications === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
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
                alignItems: 'center',
              }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                  Thông báo ({totalNotifications})
                </h4>
                <button
                  onClick={dismissAllNotifications}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textDecoration: 'underline',
                  }}
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Notification List */}
              <div>
                {/* Flash Sale Notifications */}
                {flashSaleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#fffbf0',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5e6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fffbf0'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: '#f39c12', fontWeight: 'bold', marginBottom: '4px' }}>
                        <i className="fas fa-fire" style={{ marginRight: '5px' }}></i>
                        Flash Sale 🔥
                      </div>
                      <div style={{
                        fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
                      <div style={{ fontSize: '11px', color: '#27ae60', fontWeight: 'bold' }}>
                        💰 Tiết kiệm: {notif.savedAmount.toLocaleString('vi-VN')}đ (-{notif.discount}%)
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px', marginLeft: '10px' }}
                      title="Đóng"
                    >✕</button>
                  </div>
                ))}

                {/* Order Update Notifications */}
                {orderNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f0f7ff',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: '#1890ff', fontWeight: 'bold', marginBottom: '4px' }}>
                        <i className="fas fa-box" style={{ marginRight: '5px' }}></i>
                        Cập nhật đơn hàng
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                        Đơn hàng #{notif.orderId}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                        Trạng thái:{' '}
                        <span style={{ color: notif.statusColor, fontWeight: 'bold' }}>
                          {notif.statusLabel}
                        </span>
                      </div>
                      {notif.previousStatus && (
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          Trước: {getStatusLabel(notif.previousStatus)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px', marginLeft: '10px' }}
                      title="Đóng"
                    >✕</button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#f5f5f5',
                borderTop: '1px solid #eee',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                {flashSaleNotifications.length > 0 && orderNotifications.length > 0
                  ? 'Có Flash Sale và cập nhật đơn hàng!'
                  : flashSaleNotifications.length > 0
                  ? 'Những sản phẩm này đang trong Flash Sale!'
                  : 'Đơn hàng của bạn có cập nhật mới!'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
