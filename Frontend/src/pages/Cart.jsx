import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatMoney, getCartKey, getFlashSaleDiscountForProduct, getUserAddresses, getDefaultAddress, addAddress, getCoupons } from '../utils/mockData';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartKey, setCartKey] = useState(null);
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherMessage, setVoucherMessage] = useState({ text: "", type: "" });
    const [discountAmount, setDiscountAmount] = useState(0);
    
    // Address Management States
    const [userId, setUserId] = useState(null);
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
        receiver_name: '',
        phone: '',
        address_line: '',
        city: '',
        district: '',
        ward: '',
        is_default: false
    });
    
    // Form Checkout States
    const [receiverName, setReceiverName] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [city, setCity] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const VNPAY_CREATE_PAYMENT_URL = '/api/payment/vnpay/create';

    const getLocalArray = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn(`Invalid localStorage JSON for ${key}. Resetting to empty array.`, error);
            localStorage.setItem(key, JSON.stringify([]));
            return [];
        }
    };

    const getCurrentUserId = () => {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(u => u.email === currentUser?.email)?.id || null;
    };

    useEffect(() => {
        const key = getCartKey();
        setCartKey(key);
        if (key) {
            const items = JSON.parse(localStorage.getItem(key)) || [];
            setCartItems(items);

            // Load user addresses
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (currentUser) {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userDb = users.find(u => u.email === currentUser.email);
                if (userDb) {
                    setUserId(userDb.id);
                    
                    // Load user addresses
                    const addresses = getUserAddresses(userDb.id);
                    setUserAddresses(addresses);

                    // Load default address
                    const defaultAddr = getDefaultAddress(userDb.id);
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id);
                        setReceiverName(defaultAddr.receiver_name);
                        setPhone(defaultAddr.phone);
                        setAddressLine(defaultAddr.address_line);
                        setCity(defaultAddr.city);
                    }
                }
            }
        }
    }, []);

    const handleRemoveItem = (id) => {
        if (!cartKey) return;
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleSelectAddress = (addressId) => {
        const selected = userAddresses.find(addr => addr.id === addressId);
        if (selected) {
            setSelectedAddressId(addressId);
            setReceiverName(selected.receiver_name);
            setPhone(selected.phone);
            setAddressLine(selected.address_line);
            setCity(selected.city);
            setShowAddressModal(false);
        }
    };

    const handleAddNewAddress = (e) => {
        e.preventDefault();
        if (!userId) return;

        if (!newAddressForm.receiver_name || !newAddressForm.phone || !newAddressForm.address_line || !newAddressForm.city) {
            alert("Vui lòng nhập đầy đủ thông tin địa chỉ!");
            return;
        }

        // Add new address
        addAddress(userId, newAddressForm);
        
        // Reload addresses
        const addresses = getUserAddresses(userId);
        setUserAddresses(addresses);
        
        // Select the newly created address
        const newAddr = addresses[addresses.length - 1];
        if (newAddr) {
            setSelectedAddressId(newAddr.id);
            setReceiverName(newAddr.receiver_name);
            setPhone(newAddr.phone);
            setAddressLine(newAddr.address_line);
            setCity(newAddr.city);
        }

        // Reset form
        setNewAddressForm({
            receiver_name: '',
            phone: '',
            address_line: '',
            city: '',
            district: '',
            ward: '',
            is_default: false
        });
        setIsCreatingNewAddress(false);
        setShowAddressModal(false);
        alert("Thêm địa chỉ thành công!");
    };

    // Calculate subtotal with flash sale discount
    const subTotal = cartItems.reduce((acc, item) => {
        const flashSaleDiscount = getFlashSaleDiscountForProduct(item.id);
        const itemPrice = flashSaleDiscount > 0 
            ? Math.floor(item.price * (100 - flashSaleDiscount) / 100) 
            : item.price;
        return acc + itemPrice * item.quantity;
    }, 0);

    const getCouponBaseAmount = (coupon) => {
        if (coupon.scope_type !== 'products') return subTotal;
        const productIds = coupon.product_ids || [];
        return cartItems.reduce((acc, item) => {
            if (!productIds.includes(item.id)) return acc;
            const flashSaleDiscount = getFlashSaleDiscountForProduct(item.id);
            const itemPrice = flashSaleDiscount > 0
                ? Math.floor(item.price * (100 - flashSaleDiscount) / 100)
                : item.price;
            return acc + itemPrice * item.quantity;
        }, 0);
    };

    const calculateCouponDiscount = (coupon) => {
        const baseAmount = getCouponBaseAmount(coupon);
        if (baseAmount <= 0) return 0;
        if (coupon.discount_type === "percent") {
            return Math.floor((baseAmount * Number(coupon.discount_value || 0)) / 100);
        }
        return Math.min(Number(coupon.discount_value || 0), baseAmount);
    };

    const findUsableCoupon = (code) => {
        const now = new Date();
        const currentUserId = getCurrentUserId();
        const coupon = getCoupons().find(item => item.code?.toUpperCase() === code);
        if (!coupon || coupon.status === 'INACTIVE') return null;
        if (coupon.start_date && now < new Date(coupon.start_date)) return null;
        if (coupon.end_date && now > new Date(coupon.end_date)) return null;
        if (coupon.target_type === 'users' && !(coupon.user_ids || []).includes(currentUserId)) return null;
        if (coupon.scope_type === 'products' && getCouponBaseAmount(coupon) <= 0) return null;
        return coupon;
    };

    // Recalculate discount if cart changes
    useEffect(() => {
        if (voucherMessage.type === "success" && voucherCode.trim() !== "") {
            const coupon = findUsableCoupon(voucherCode.trim().toUpperCase());
            setDiscountAmount(coupon ? calculateCouponDiscount(coupon) : 0);
        }
    }, [subTotal, voucherMessage, voucherCode, cartItems]);

    let finalTotal = subTotal - discountAmount;
    if (finalTotal < 0) finalTotal = 0;

    const handleApplyVoucher = () => {
        if (cartItems.length === 0) {
            alert("Giỏ hàng trống, không thể áp dụng mã!");
            return;
        }

        const inputCode = voucherCode.trim().toUpperCase();
        if (!inputCode) {
            setVoucherMessage({ text: "Vui lòng nhập mã giảm giá!", type: "error" });
            setDiscountAmount(0);
            return;
        }

        const coupon = findUsableCoupon(inputCode);
        if (coupon) {
            setVoucherMessage({ text: `✔️ Áp dụng thành công mã ${inputCode}!`, type: "success" });
            setDiscountAmount(calculateCouponDiscount(coupon));
        } else {
            setVoucherMessage({ text: "❌ Mã giảm giá không hợp lệ hoặc đã hết hạn!", type: "error" });
            setDiscountAmount(0);
        }
    };

    const processCheckout = async () => {
        if (isSubmitting) return;
        if (!cartKey) {
            alert("Vui lòng đăng nhập để đặt hàng!");
            navigate('/login');
            return;
        }
        if (cartItems.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }
        if (!receiverName || !phone || !addressLine || !city) {
            alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
            return;
        }

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userDb = users.find(u => u.email === currentUser.email);
        const userId = userDb ? userDb.id : Date.now();
        setIsSubmitting(true);

        // 1. Tạo Address
        const newAddress = {
            id: Date.now(),
            user_id: userId,
            receiver_name: receiverName,
            phone: phone,
            address_line: addressLine,
            city: city,
            district: '',
            ward: '',
            is_default: true,
            created_at: new Date().toISOString()
        };
        const addresses = getLocalArray('addresses');
        addresses.push(newAddress);
        localStorage.setItem('addresses', JSON.stringify(addresses));

        // 2. Tạo Order
        const orderId = Date.now() + 1;
        const newOrder = {
            id: orderId,
            user_id: userId,
            total_amount: finalTotal,
            status: 'PENDING',
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'VNPAY' ? 'PENDING' : 'UNPAID',
            address_snapshot: JSON.stringify(newAddress),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const orders = getLocalArray('orders');
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // 3. Tạo Order Items
        const orderItemsList = getLocalArray('order_items');
        cartItems.forEach((item, index) => {
            orderItemsList.push({
                id: Date.now() + 10 + index,
                order_id: orderId,
                product_id: item.id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity
            });
        });
        localStorage.setItem('order_items', JSON.stringify(orderItemsList));

        // 4. Tạo Payment
        const paymentsList = getLocalArray('payments');
        paymentsList.push({
            id: Date.now() + 3,
            order_id: orderId,
            amount: finalTotal,
            method: paymentMethod,
            status: 'PENDING',
            transaction_code: null,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('payments', JSON.stringify(paymentsList));

        if (paymentMethod === 'VNPAY') {
            try {
                const response = await fetch(VNPAY_CREATE_PAYMENT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: Math.round(finalTotal),
                        orderId: String(orderId),
                        orderInfo: `Thanh toan don hang ${orderId}`,
                        language: 'vn'
                    })
                });

                if (!response.ok) {
                    throw new Error(`VNPAY create payment failed: ${response.status}`);
                }

                const data = await response.json();
                if (!data?.paymentUrl) {
                    throw new Error(data?.message || 'Khong nhan duoc paymentUrl tu VNPAY');
                }

                const paymentUrl = data.paymentUrl;
                sessionStorage.setItem('pendingVnPayOrderId', String(data.orderId || orderId));
                const updatedPayments = getLocalArray('payments').map(payment =>
                    payment.order_id === orderId
                        ? { ...payment, payment_url: paymentUrl, backend_order_id: data.orderId || String(orderId) }
                        : payment
                );
                localStorage.setItem('payments', JSON.stringify(updatedPayments));

                localStorage.removeItem(cartKey);
                setCartItems([]);
                window.dispatchEvent(new Event('cartUpdated'));
                navigate(`/order-status/${orderId}`, {
                    state: {
                        orderId,
                        paymentUrl,
                        autoRedirect: true
                    }
                });
                return;
            } catch (error) {
                console.error(error);
                alert("Khong the khoi tao thanh toan VNPAY. Vui long thu lai hoac chon COD.");
                setIsSubmitting(false);
                return;
            }
        }

        if (paymentMethod === 'ONLINE') {
            alert("Đã nhận thanh toán qua mã QR. Đặt hàng thành công!");
        } else {
            alert("Đặt hàng thành công! Đơn hàng của bạn sẽ sớm được giao (COD).");
        }

        // 5. Xóa giỏ hàng
        localStorage.removeItem(cartKey);
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        navigate(`/order-status/${orderId}`, {
            state: {
                orderId,
                autoRedirect: false
            }
        });
    };

    return (
        <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
            <h2 style={{ marginBottom: '20px', borderLeft: '5px solid var(--primary-color)', paddingLeft: '10px' }}>Giỏ hàng của bạn</h2>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '10px' }}>Sản phẩm</th>
                                <th style={{ padding: '10px' }}>Đơn giá</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Số lượng</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!cartKey ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', fontSize: '16px' }}>
                                        Bạn cần <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'underline' }}>Đăng nhập</Link> để xem và sử dụng giỏ hàng.
                                    </td>
                                </tr>
                            ) : cartItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', fontSize: '16px' }}>Giỏ hàng trống</td>
                                </tr>
                            ) : (
                                cartItems.map(item => {
                                    const flashSaleDiscount = getFlashSaleDiscountForProduct(item.id);
                                    const itemPrice = flashSaleDiscount > 0 
                                        ? Math.floor(item.price * (100 - flashSaleDiscount) / 100) 
                                        : item.price;
                                    const savedAmount = item.price - itemPrice;

                                    return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px 10px' }}>{item.name}</td>
                                        <td style={{ padding: '15px 10px' }}>
                                            {flashSaleDiscount > 0 ? (
                                                <div>
                                                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                                                        {formatMoney(item.price)}
                                                    </span>
                                                    <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                                        {formatMoney(itemPrice)}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#27ae60' }}>
                                                        Tiết kiệm: {formatMoney(savedAmount)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{formatMoney(item.price)}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveItem(item.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Xóa sản phẩm">
                                                <i className="fas fa-trash-alt"></i> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <div style={{ fontSize: '16px', color: '#555', marginBottom: '5px' }}>Tạm tính: {formatMoney(subTotal)}</div>
                        <div style={{ fontSize: '16px', color: '#27ae60', marginBottom: '10px' }}>Giảm giá: -{formatMoney(discountAmount)}</div>
                        <div style={{ fontSize: '22px', color: 'var(--secondary-color)', fontWeight: 'bold' }}>Tổng thanh toán: {formatMoney(finalTotal)}</div>
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: '20px', borderBottom: '2px dashed #eee', paddingBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}><i className="fas fa-ticket-alt" style={{ color: 'var(--secondary-color)' }}></i> Mã giảm giá</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={voucherCode}
                                onChange={e => setVoucherCode(e.target.value)}
                                placeholder="Nhập mã (VD: SINHVIENIT)" 
                                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase' }} 
                            />
                            <button onClick={handleApplyVoucher} style={{ padding: '10px 15px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Áp dụng</button>
                        </div>
                        {voucherMessage.text && (
                            <div style={{ fontSize: '13px', marginTop: '8px', fontWeight: 'bold', color: voucherMessage.type === 'error' ? '#c0392b' : '#27ae60' }}>
                                {voucherMessage.text}
                            </div>
                        )}
                    </div>
                    <h3 style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Thông tin giao hàng
                        <button 
                            onClick={() => setShowAddressModal(true)}
                            style={{
                                padding: '5px 15px',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            <i className="fas fa-map-marker-alt"></i> Chọn địa chỉ khác
                        </button>
                    </h3>

                    {selectedAddressId && (
                        <div style={{
                            padding: '12px',
                            background: '#e8f5e9',
                            border: '1px solid #4caf50',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            fontSize: '13px',
                            color: '#2e7d32'
                        }}>
                            <i className="fas fa-check-circle"></i> Đang sử dụng địa chỉ mặc định
                        </div>
                    )}

                    <div style={{ opacity: 0.7, marginBottom: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>{receiverName}</strong> | {phone}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                            {addressLine}, {city}
                        </div>
                    </div>

                    <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="Họ và tên người nhận" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Tỉnh / Thành phố" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <textarea value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="Địa chỉ chi tiết (Số nhà, đường...)" style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', height: '60px' }}></textarea>
                    
                    <h3 style={{ marginBottom: '15px', borderTop: '2px dashed #eee', paddingTop: '20px' }}>Phương thức thanh toán</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                            <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ marginRight: '10px' }} />
                            <span>Thanh toán khi nhận hàng (COD)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} style={{ marginRight: '10px' }} />
                            <span>Thanh toán qua VNPAY</span>
                        </label>
                        
                        {paymentMethod === 'VNPAY' && (
                            <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>Bạn sẽ được chuyển sang cổng thanh toán VNPAY. Sau khi thanh toán, VNPAY sẽ gọi http://localhost:8080/api/payment/vnpay/return và backend trả về kết quả theo VnPayPaymentResult.</p>
                            </div>
                        )}
                    </div>

                    <button disabled={isSubmitting} onClick={processCheckout} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--secondary-color)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting ? 'Đang xử lý...' : paymentMethod === 'VNPAY' ? 'Thanh toán VNPAY' : 'Xác nhận Đặt hàng'}
                    </button>
                </div>
            </div>

            {/* Address Selection Modal */}
            {showAddressModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Chọn địa chỉ giao hàng</h3>
                            <button 
                                onClick={() => {
                                    setShowAddressModal(false);
                                    setIsCreatingNewAddress(false);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#999'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {!isCreatingNewAddress ? (
                            <>
                                {userAddresses.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h4 style={{ marginBottom: '15px', color: '#333' }}>Địa chỉ đã lưu</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {userAddresses.map(addr => (
                                                <div 
                                                    key={addr.id}
                                                    onClick={() => handleSelectAddress(addr.id)}
                                                    style={{
                                                        padding: '15px',
                                                        border: selectedAddressId === addr.id ? '2px solid var(--primary-color)' : '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        background: selectedAddressId === addr.id ? '#f0f8ff' : '#fff',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                                                {addr.receiver_name} | {addr.phone}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                                {addr.address_line}, {addr.city}
                                                            </div>
                                                        </div>
                                                        {addr.is_default && (
                                                            <span style={{
                                                                background: '#4caf50',
                                                                color: 'white',
                                                                padding: '3px 8px',
                                                                borderRadius: '3px',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />
                                    </div>
                                )}

                                <button 
                                    onClick={() => setIsCreatingNewAddress(true)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--primary-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <i className="fas fa-plus"></i> Thêm địa chỉ mới
                                </button>

                                <button 
                                    onClick={() => {
                                        setShowAddressModal(false);
                                        setIsCreatingNewAddress(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#f0f0f0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleAddNewAddress}>
                                <h4 style={{ marginBottom: '15px', color: '#333' }}>Thêm địa chỉ mới</h4>
                                
                                <input 
                                    type="text"
                                    placeholder="Tên người nhận"
                                    value={newAddressForm.receiver_name}
                                    onChange={e => setNewAddressForm({ ...newAddressForm, receiver_name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                                
                                <input 
                                    type="tel"
                                    placeholder="Số điện thoại"
                                    value={newAddressForm.phone}
                                    onChange={e => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                                
                                <input 
                                    type="text"
                                    placeholder="Tỉnh / Thành phố"
                                    value={newAddressForm.city}
                                    onChange={e => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                                
                                <textarea 
                                    placeholder="Địa chỉ chi tiết (Số nhà, đường...)"
                                    value={newAddressForm.address_line}
                                    onChange={e => setNewAddressForm({ ...newAddressForm, address_line: e.target.value })}
                                    style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', height: '60px' }}
                                />

                                <button 
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <i className="fas fa-check"></i> Lưu địa chỉ
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingNewAddress(false);
                                        setNewAddressForm({
                                            receiver_name: '',
                                            phone: '',
                                            address_line: '',
                                            city: '',
                                            district: '',
                                            ward: '',
                                            is_default: false
                                        });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#f0f0f0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Hủy
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
