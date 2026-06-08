import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatMoney, getDB, getUserWithEmail } from '../utils/mockData';

const tabs = [
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'shipping', label: 'Đang giao hàng' },
    { id: 'delivered', label: 'Đã giao' },
    { id: 'return_pending', label: 'Chờ hoàn' },
    { id: 'returned', label: 'Đã hoàn' },
    { id: 'unreviewed', label: 'Chưa đánh giá' }
];

const statusMeta = {
    PENDING: { label: 'Chờ xác nhận', color: '#ad6800', bg: '#fff7e6' },
    CONFIRMED: { label: 'Đang giao hàng', color: '#0958d9', bg: '#e8f4ff' },
    SHIPPING: { label: 'Đang giao hàng', color: '#0958d9', bg: '#e8f4ff' },
    DELIVERING: { label: 'Đang giao hàng', color: '#0958d9', bg: '#e8f4ff' },
    DELIVERED: { label: 'Đã giao', color: '#237804', bg: '#f6ffed' },
    RETURN_PENDING: { label: 'Chờ hoàn', color: '#9e1068', bg: '#fff0f6' },
    RETURNED: { label: 'Đã hoàn', color: '#595959', bg: '#f5f5f5' },
    REFUNDED: { label: 'Đã hoàn', color: '#595959', bg: '#f5f5f5' },
    CANCELLED: { label: 'Đã hủy', color: '#a8071a', bg: '#fff1f0' }
};

const getLocalArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
};

const getStatusMeta = (status) => statusMeta[status] || { label: status || 'Không xác định', color: '#555', bg: '#f5f5f5' };

const getTabForOrder = (order) => {
    if (order.status === 'PENDING') return 'pending';
    if (['CONFIRMED', 'SHIPPING', 'DELIVERING'].includes(order.status)) return 'shipping';
    if (['RETURN_PENDING'].includes(order.status)) return 'return_pending';
    if (['RETURNED', 'REFUNDED'].includes(order.status)) return 'returned';
    if (['DELIVERED', 'COMPLETED'].includes(order.status)) return 'delivered';
    return 'pending';
};

const UserOrders = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [orders, setOrders] = useState(() => getLocalArray('orders'));
    const orderItems = useMemo(() => getLocalArray('order_items'), []);
    const reviews = useMemo(() => getLocalArray('productReviews'), []);
    const products = useMemo(() => getDB(), []);

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const user = currentUser ? getUserWithEmail(currentUser.email) : null;

    if (!currentUser || !user) {
        navigate('/login');
        return null;
    }

    const getOrderItems = (orderId) => orderItems.filter(item => item.order_id === orderId);

    const hasUnreviewedItems = (order) => {
        if (!['DELIVERED', 'COMPLETED'].includes(order.status)) return false;
        return getOrderItems(order.id).some(item =>
            !reviews.some(review => review.user_id === user.id && review.product_id === item.product_id)
        );
    };

    const userOrders = orders
        .filter(order => order.user_id === user.id)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const counts = tabs.reduce((acc, tab) => {
        acc[tab.id] = tab.id === 'unreviewed'
            ? userOrders.filter(hasUnreviewedItems).length
            : userOrders.filter(order => getTabForOrder(order) === tab.id).length;
        return acc;
    }, {});

    const visibleOrders = activeTab === 'unreviewed'
        ? userOrders.filter(hasUnreviewedItems)
        : userOrders.filter(order => getTabForOrder(order) === activeTab);

    const updateOrderStatus = (orderId, status) => {
        const updatedOrders = orders.map(order =>
            order.id === orderId
                ? { ...order, status, updated_at: new Date().toISOString() }
                : order
        );
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        // Dispatch event to notify other components about order update
        window.dispatchEvent(new Event('ordersUpdated'));
    };

    const getProductImage = (productId) => {
        const product = products.find(item => item.id === productId);
        const image = product?.images?.find(item => item.is_main) || product?.images?.[0];
        return image?.image_url || 'https://placehold.co/64x64?text=No+Image';
    };

    return (
        <div className="container" style={{ marginTop: '30px', marginBottom: '60px' }}>
            <h2 style={{ marginBottom: '20px', borderLeft: '5px solid var(--primary-color)', paddingLeft: '10px' }}>Đơn hàng của tôi</h2>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', marginBottom: '18px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 14px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            background: activeTab === tab.id ? 'var(--primary-color)' : '#f3f5f7',
                            color: activeTab === tab.id ? 'white' : '#333',
                            fontWeight: activeTab === tab.id ? 'bold' : '500'
                        }}
                    >
                        {tab.label} ({counts[tab.id] || 0})
                    </button>
                ))}
            </div>

            {visibleOrders.length === 0 ? (
                <div style={{ background: 'white', padding: '32px', borderRadius: '8px', textAlign: 'center', color: '#666', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                    Không có đơn hàng trong mục này.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {visibleOrders.map(order => {
                        const meta = getStatusMeta(order.status);
                        const items = getOrderItems(order.id);

                        return (
                            <div key={order.id} style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '16px 18px', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <strong>Đơn hàng #{order.id}</strong>
                                        <div style={{ color: '#777', fontSize: '13px', marginTop: '4px' }}>
                                            {order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : ''}
                                        </div>
                                    </div>
                                    <span style={{ height: 'fit-content', padding: '6px 10px', borderRadius: '4px', background: meta.bg, color: meta.color, fontWeight: 'bold', fontSize: '13px' }}>
                                        {meta.label}
                                    </span>
                                </div>

                                <div style={{ padding: '14px 18px' }}>
                                    {items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f4f4f4' }}>
                                            <img src={getProductImage(item.product_id)} alt={item.product_name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Link to={`/product/${item.product_id}`} style={{ color: '#222', textDecoration: 'none', fontWeight: 'bold' }}>{item.product_name}</Link>
                                                <div style={{ color: '#777', fontSize: '13px', marginTop: '6px' }}>Số lượng: {item.quantity}</div>
                                            </div>
                                            <div style={{ color: 'var(--secondary-color)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoney(item.price || 0)}</div>
                                        </div>
                                    ))}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '14px' }}>
                                        <div style={{ color: '#666', fontSize: '14px' }}>
                                            Thanh toán: <strong>{order.payment_method}</strong> · {order.payment_status || 'UNPAID'}
                                        </div>
                                        <div style={{ fontSize: '18px', color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                                            {formatMoney(order.total_amount || 0)}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                                        <Link to={`/order-status/${order.id}`} style={{ padding: '9px 12px', background: '#f0f0f0', color: '#333', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                            Chi tiết
                                        </Link>
                                        {['CONFIRMED', 'SHIPPING', 'DELIVERING'].includes(order.status) && (
                                            <button type="button" onClick={() => updateOrderStatus(order.id, 'DELIVERED')} style={{ padding: '9px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Đã nhận hàng
                                            </button>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <button type="button" onClick={() => updateOrderStatus(order.id, 'RETURN_PENDING')} style={{ padding: '9px 12px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Yêu cầu hoàn
                                            </button>
                                        )}
                                        {activeTab === 'unreviewed' && (
                                            <Link to={`/product/${items.find(item => !reviews.some(review => review.user_id === user.id && review.product_id === item.product_id))?.product_id || items[0]?.product_id}`} style={{ padding: '9px 12px', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                                Đánh giá
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserOrders;
