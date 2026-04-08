import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatMoney, getCartKey, getFlashSaleDiscountForProduct } from '../utils/mockData';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartKey, setCartKey] = useState(null);
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherMessage, setVoucherMessage] = useState({ text: "", type: "" });
    const [discountAmount, setDiscountAmount] = useState(0);
    
    // Form Checkout States
    const [receiverName, setReceiverName] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [city, setCity] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD"); // COD or ONLINE (QR)

    const navigate = useNavigate();

    const validVouchers = {
        "SINHVIENIT": { type: "percent", value: 10 },
        "GIAM50K": { type: "fixed", value: 50000 },
        "FREESHIP": { type: "fixed", value: 30000 }
    };

    useEffect(() => {
        const key = getCartKey();
        setCartKey(key);
        if (key) {
            const items = JSON.parse(localStorage.getItem(key)) || [];
            setCartItems(items);
        }
    }, []);

    const handleRemoveItem = (id) => {
        if (!cartKey) return;
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Calculate subtotal with flash sale discount
    const subTotal = cartItems.reduce((acc, item) => {
        const flashSaleDiscount = getFlashSaleDiscountForProduct(item.id);
        const itemPrice = flashSaleDiscount > 0 
            ? Math.floor(item.price * (100 - flashSaleDiscount) / 100) 
            : item.price;
        return acc + itemPrice * item.quantity;
    }, 0);

    // Recalculate discount if cart changes
    useEffect(() => {
        if (voucherMessage.type === "success" && voucherCode.trim() !== "") {
            const voucherObj = validVouchers[voucherCode.trim().toUpperCase()];
            if (voucherObj) {
                if (voucherObj.type === "percent") {
                    setDiscountAmount((subTotal * voucherObj.value) / 100);
                } else if (voucherObj.type === "fixed") {
                    setDiscountAmount(voucherObj.value);
                }
            }
        }
    }, [subTotal, voucherMessage, voucherCode]);

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

        if (validVouchers[inputCode]) {
            const voucherObj = validVouchers[inputCode];
            setVoucherMessage({ text: `✔️ Áp dụng thành công mã ${inputCode}!`, type: "success" });
            if (voucherObj.type === "percent") {
                setDiscountAmount((subTotal * voucherObj.value) / 100);
            } else if (voucherObj.type === "fixed") {
                setDiscountAmount(voucherObj.value);
            }
        } else {
            setVoucherMessage({ text: "❌ Mã giảm giá không hợp lệ hoặc đã hết hạn!", type: "error" });
            setDiscountAmount(0);
        }
    };

    const processCheckout = () => {
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
        const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
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
            payment_status: paymentMethod === 'ONLINE' ? 'PAID' : 'UNPAID',
            address_snapshot: JSON.stringify(newAddress),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // 3. Tạo Order Items
        const orderItemsList = JSON.parse(localStorage.getItem('order_items')) || [];
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
        const paymentsList = JSON.parse(localStorage.getItem('payments')) || [];
        paymentsList.push({
            id: Date.now() + 3,
            order_id: orderId,
            amount: finalTotal,
            method: paymentMethod,
            status: paymentMethod === 'ONLINE' ? 'SUCCESS' : 'PENDING',
            transaction_code: paymentMethod === 'ONLINE' ? `TXN${Date.now()}` : null,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('payments', JSON.stringify(paymentsList));

        if (paymentMethod === 'ONLINE') {
            alert("Đã nhận thanh toán qua mã QR. Đặt hàng thành công!");
        } else {
            alert("Đặt hàng thành công! Đơn hàng của bạn sẽ sớm được giao (COD).");
        }

        // 5. Xóa giỏ hàng
        localStorage.removeItem(cartKey);
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        navigate('/');
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
                    <h3 style={{ marginBottom: '15px' }}>Thông tin giao hàng</h3>
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
                            <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} style={{ marginRight: '10px' }} />
                            <span>Quét mã QR thanh toán (Momo/ZaloPay/Banking)</span>
                        </label>
                        
                        {paymentMethod === 'ONLINE' && (
                            <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                <img src="https://placehold.co/150x150?text=QR+CODE" alt="Mã QR Thanh Toán" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                                <p style={{ fontSize: '13px', color: '#555', marginTop: '10px' }}>Vui lòng quét mã QR để thanh toán. Hệ thống sẽ xác nhận tự động.</p>
                            </div>
                        )}
                    </div>

                    <button onClick={processCheckout} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--secondary-color)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                        {paymentMethod === 'ONLINE' ? 'Đã Thanh Toán & Đặt Hàng' : 'Xác nhận Đặt hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
