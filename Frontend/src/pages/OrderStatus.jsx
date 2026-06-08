import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { formatMoney } from '../utils/mockData';

const statusLabels = {
    PENDING: 'Đang chờ xử lý',
    PAID: 'Đã thanh toán',
    UNPAID: 'Chưa thanh toán',
    SUCCESS: 'Thành công',
    CANCELLED: 'Đã hủy'
};

const getStatusLabel = (status) => statusLabels[status] || status || 'Không xác định';

const getLocalArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
};

const OrderStatus = () => {
    const { orderId } = useParams();
    const { state } = useLocation();
    const numericOrderId = Number(orderId);
    const orders = getLocalArray('orders');
    const payments = getLocalArray('payments');
    const orderItems = getLocalArray('order_items');

    const order = orders.find(item => item.id === numericOrderId);
    const payment = payments.find(item => item.order_id === numericOrderId);
    const items = orderItems.filter(item => item.order_id === numericOrderId);
    const paymentUrl = state?.paymentUrl || payment?.payment_url || null;
    const shouldRedirect = Boolean(state?.autoRedirect && paymentUrl);

    let address = {};
    try {
        address = order?.address_snapshot ? JSON.parse(order.address_snapshot) : {};
    } catch {
        address = {};
    }

    useEffect(() => {
        if (!shouldRedirect) return undefined;
        const timer = setTimeout(() => {
            window.location.href = paymentUrl;
        }, 1800);

        return () => clearTimeout(timer);
    }, [paymentUrl, shouldRedirect]);

    if (!order) {
        return (
            <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
                <div style={{ background: 'white', padding: '28px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginBottom: '12px' }}>Không tìm thấy đơn hàng</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Đơn hàng #{orderId} không tồn tại trong dữ liệu hiện tại.</p>
                    <Link to="/cart" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Quay lại giỏ hàng</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '40px', marginBottom: '60px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', borderBottom: '1px solid #eee', paddingBottom: '18px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ marginBottom: '8px' }}>Tình trạng đơn hàng</h2>
                        <div style={{ color: '#666' }}>Mã đơn hàng: <strong>#{order.id}</strong></div>
                    </div>
                    <div style={{ padding: '8px 14px', background: '#fff7e6', color: '#ad6800', borderRadius: '4px', fontWeight: 'bold', height: 'fit-content' }}>
                        {getStatusLabel(order.status)}
                    </div>
                </div>

                {shouldRedirect && (
                    <div style={{ padding: '14px', background: '#e8f4ff', border: '1px solid #91caff', borderRadius: '6px', marginBottom: '20px', color: '#0958d9' }}>
                        Đơn hàng VNPAY đang ở trạng thái pending. Hệ thống sẽ chuyển bạn sang cổng thanh toán VNPAY.
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <div style={{ color: '#777', fontSize: '13px', marginBottom: '4px' }}>Tổng thanh toán</div>
                        <strong style={{ color: 'var(--secondary-color)', fontSize: '20px' }}>{formatMoney(order.total_amount)}</strong>
                    </div>
                    <div>
                        <div style={{ color: '#777', fontSize: '13px', marginBottom: '4px' }}>Phương thức</div>
                        <strong>{order.payment_method}</strong>
                    </div>
                    <div>
                        <div style={{ color: '#777', fontSize: '13px', marginBottom: '4px' }}>Trạng thái thanh toán</div>
                        <strong>{getStatusLabel(payment?.status || order.payment_status)}</strong>
                    </div>
                    <div>
                        <div style={{ color: '#777', fontSize: '13px', marginBottom: '4px' }}>Ngày tạo</div>
                        <strong>{new Date(order.created_at).toLocaleString('vi-VN')}</strong>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '18px', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Thông tin giao hàng</h3>
                    <div style={{ lineHeight: 1.7, color: '#444' }}>
                        <div><strong>{address.receiver_name}</strong> | {address.phone}</div>
                        <div>{address.address_line}, {address.city}</div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '18px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Sản phẩm</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid #f2f2f2' }}>
                                <span>{item.product_name}</span>
                                <strong>x{item.quantity}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                    {paymentUrl && (
                        <a href={paymentUrl} style={{ padding: '10px 16px', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                            Tiếp tục thanh toán VNPAY
                        </a>
                    )}
                    <Link to="/" style={{ padding: '10px 16px', background: '#f0f0f0', color: '#333', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus;
