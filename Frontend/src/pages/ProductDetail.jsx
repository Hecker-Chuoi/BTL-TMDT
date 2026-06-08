import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDB, getMainImage, formatMoney, getCartKey, getFlashSaleDiscountForProduct } from '../utils/mockData';

const ProductDetail = () => {
    const { id } = useParams();
    const productId = parseInt(id);
    const [product, setProduct] = useState(null);
    const [mainImageUrl, setMainImageUrl] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeInfoTab, setActiveInfoTab] = useState('specs');
    const [collapsedSpecGroups, setCollapsedSpecGroups] = useState({});
    
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [userPurchaseData, setUserPurchaseData] = useState({
        isLoggedIn: false,
        hasPurchased: false,
        canReview: false,
        existingReview: null
    });

    useEffect(() => {
        const products = getDB();
        const found = products.find(p => p.id === productId);
        if (found) {
            setProduct(found);
            setMainImageUrl(getMainImage(found));
            const specGroups = found.specGroups?.length
                ? found.specGroups
                : (found.specs || []).length
                    ? [{ title: 'Thông số kỹ thuật', items: found.specs }]
                    : [];
            const collapsedGroups = specGroups.reduce((acc, group, groupIndex) => {
                acc[`${group.title || 'group'}-${groupIndex}`] = true;
                return acc;
            }, {});
            setCollapsedSpecGroups(collapsedGroups);
        }
        
        loadReviewsAndEligibility();
    }, [productId]);

    const loadReviewsAndEligibility = () => {
        const allReviews = JSON.parse(localStorage.getItem('productReviews')) || [];
        const productRelatedReviews = allReviews.filter(r => r.product_id === productId);
        setReviews(productRelatedReviews);

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userDb = users.find(u => u.email === currentUser.email);
            const userId = userDb ? userDb.id : null;

            if (userId) {
                const previousReview = productRelatedReviews.find(r => r.user_id === userId);
                
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                const orderItems = JSON.parse(localStorage.getItem('order_items')) || [];
                
                let latestPurchaseDate = null;
                const userOrders = orders.filter(o => o.user_id === userId && o.status !== 'CANCELLED');
                userOrders.forEach(order => {
                    const matchedItems = orderItems.filter(item => item.order_id === order.id && item.product_id === productId);
                    if (matchedItems.length > 0) {
                        const orderDate = new Date(order.created_at);
                        if (!latestPurchaseDate || orderDate > latestPurchaseDate) {
                            latestPurchaseDate = orderDate;
                        }
                    }
                });

                let canReview = false;
                // Kiểm tra xem user đã submit review chưa - nếu có review thì không cho edit lại
                if (previousReview) {
                    // User có review rồi - không thể edit lại
                    canReview = false;
                } else if (latestPurchaseDate) {
                    // User chưa có review, kiểm tra có trong 1 tháng mua không
                    const oneMonthLater = new Date(latestPurchaseDate);
                    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                    if (new Date() < oneMonthLater) {
                        canReview = true;
                    }
                }

                setUserPurchaseData({
                    isLoggedIn: true,
                    hasPurchased: !!latestPurchaseDate,
                    canReview: canReview,
                    existingReview: previousReview || null
                });

                if (previousReview) {
                    setRating(previousReview.rating);
                    setComment(previousReview.comment);
                } else {
                    setRating(5);
                    setComment("");
                }
            }
        } else {
            setUserPurchaseData({ isLoggedIn: false, hasPurchased: false, canReview: false, existingReview: null });
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        const cartKey = getCartKey();
        if (!cartKey) {
            alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
            return;
        }

        let cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
        const exist = cartItems.find(i => i.id === product.id);
        if (exist) {
            exist.quantity += quantity;
        } else {
            cartItems.push({ ...product, quantity });
        }
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        window.dispatchEvent(new Event('cartUpdated'));
        alert("Đã thêm vào giỏ hàng!");
    };

    const handleSubmitReview = () => {
        if (!userPurchaseData.isLoggedIn) {
            alert("Vui lòng đăng nhập để đánh giá!");
            return;
        }
        if (!userPurchaseData.hasPurchased) {
            alert("Chỉ những khách hàng đã mua sản phẩm này mới có quyền đánh giá!");
            return;
        }
        if (!userPurchaseData.canReview) {
            alert("Rất tiếc! Bạn chỉ có thể đánh giá hoặc sửa đánh giá trong vòng 1 tháng sau khi mua hàng.");
            return;
        }
        if (!comment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá!");
            return;
        }

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userDb = users.find(u => u.email === currentUser.email);
        const userId = userDb ? userDb.id : Date.now(); 

        const allReviews = JSON.parse(localStorage.getItem('productReviews')) || [];
        
        if (userPurchaseData.existingReview) {
            const idx = allReviews.findIndex(r => r.id === userPurchaseData.existingReview.id);
            if (idx > -1) {
                allReviews[idx].rating = rating;
                allReviews[idx].comment = comment.trim();
                // Không cập nhật lại created_at để giữ nguyên ngày đánh giá gốc, hoặc có thể cập nhật tùy ý. System đang giữ nguyên logic schema.
                // Thêm updated_at nếu có, nhưng hiện chưa có trong schema cho review.
            }
        } else {
            const newReview = {
                id: Date.now(),
                user_id: userId,
                product_id: productId,
                rating: rating,
                comment: comment.trim(),
                created_at: new Date().toISOString()
            };
            allReviews.push(newReview);
        }

        localStorage.setItem('productReviews', JSON.stringify(allReviews));
        loadReviewsAndEligibility();
        if (userPurchaseData.existingReview) {
            alert("Đã cập nhật đánh giá thành công!");
        } else {
            alert("Cảm ơn bạn đã đánh giá sản phẩm!");
        }
    };

    // Calculate average rating
    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
    };

    const getSpecGroups = () => {
        if (!product?.specs || product.specs.length === 0) return [];

        if (product.specGroups && product.specGroups.length > 0) {
            return product.specGroups;
        }

        return [{
            title: 'Thông số kỹ thuật',
            items: product.specs.map(spec => ({
                label: spec.spec_key,
                value: spec.spec_value
            }))
        }];
    };

    const getSpecGroupKey = (group, groupIndex) => `${group.title || 'group'}-${groupIndex}`;

    const toggleSpecGroup = (groupKey) => {
        setCollapsedSpecGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey]
        }));
    };

    const renderProductDescription = () => {
        if (!product.description) {
            return <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>;
        }

        const description = product.description.trim();
        if (description.startsWith('<')) {
            return <div dangerouslySetInnerHTML={{ __html: description }} />;
        }

        return description.split('\n').filter(Boolean).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ));
    };

    const getPlainDescription = () => {
        if (!product.description) return 'Chưa có mô tả chi tiết cho sản phẩm này.';
        return product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    if (!product) return <h3 style={{ textAlign: 'center', margin: '50px 0' }}>Sản phẩm không tồn tại!</h3>;

    const discountPercent = getFlashSaleDiscountForProduct(product.id);
    const salePrice = discountPercent > 0 ? Math.floor(product.price * (100 - discountPercent) / 100) : product.price;
    const savedAmount = product.price - salePrice;
    const avgRating = getAverageRating();

    return (
        <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <img src={mainImageUrl} alt={product.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '15px', transition: '0.3s' }} />
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {product.images?.map(img => (
                            <img 
                                key={img.id} 
                                src={img.image_url} 
                                alt="thumb"
                                onClick={() => setMainImageUrl(img.image_url)}
                                style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }} 
                            />
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: '300px', paddingLeft: '20px', position: 'relative' }}>
                    {discountPercent > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            zIndex: 10
                        }}>
                            -{discountPercent}%
                        </div>
                    )}
                    
                    <div style={{ color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>
                        Thương hiệu: {product.brand_id === 1 ? 'Apple' : product.brand_id === 2 ? 'MSI' : product.brand_id === 3 ? 'Corsair' : 'Asus'}
                    </div>
                    
                    <h1 style={{ color: 'var(--text-color)', marginBottom: '15px', fontSize: '26px' }}>{product.name}</h1>
                    
                    {discountPercent > 0 ? (
                        <div>
                            <div style={{ color: '#999', fontSize: '18px', textDecoration: 'line-through', marginBottom: '5px' }}>
                                {formatMoney(product.price)}
                            </div>
                            <div style={{ color: '#e74c3c', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
                                {formatMoney(salePrice)}
                            </div>
                            <div style={{ color: '#27ae60', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
                                Tiết kiệm: {formatMoney(savedAmount)}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--secondary-color)', fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
                            {formatMoney(product.price)}
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid var(--primary-color)' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '15px' }}>Đặc điểm nổi bật:</h4>
                        <p style={{ color: '#444', lineHeight: 1.6, fontSize: '14px' }}>{getPlainDescription()}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                        <span style={{ fontWeight: 'bold' }}>Số lượng:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                            <input 
                                type="number" 
                                value={quantity} 
                                min="1" 
                                max={product.stock || 10} 
                                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                style={{ width: '60px', padding: '10px', border: 'none', textAlign: 'center', outline: 'none' }} 
                            />
                        </div>
                        <span style={{ color: '#777', fontSize: '14px' }}>(Còn {product.stock || 0} sản phẩm)</span>
                    </div>

                    <button onClick={handleAddToCart} style={{ padding: '15px 30px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', width: '100%', boxShadow: '0 4px 6px rgba(0,86,179,0.2)' }}>
                        <i className="fas fa-cart-plus" style={{ marginRight: '8px' }}></i> THÊM VÀO GIỎ HÀNG
                    </button>
                    
                </div>
            </div>

            <section className="product-info-tabs">
                <div id="tab-spec" className="detail-tabs col2">
                    <button
                        type="button"
                        id="specification"
                        className={`detail-tab-link ${activeInfoTab === 'specs' ? 'current' : ''}`}
                        onClick={() => setActiveInfoTab('specs')}
                    >
                        Thông số kỹ thuật
                    </button>
                    <button
                        type="button"
                        className={`detail-tab-link ${activeInfoTab === 'description' ? 'current' : ''}`}
                        onClick={() => setActiveInfoTab('description')}
                    >
                        Thông tin sản phẩm
                    </button>
                </div>

                <div className={`specifications tab-content ${activeInfoTab === 'specs' ? 'current' : ''}`} id="tab-1">
                    {getSpecGroups().length > 0 ? (
                        <div className="specification-item">
                            {getSpecGroups().map((group, groupIndex) => {
                                const groupKey = getSpecGroupKey(group, groupIndex);
                                const isCollapsed = !!collapsedSpecGroups[groupKey];

                                return (
                                    <div className="box-specifi" key={groupKey}>
                                        <button
                                            type="button"
                                            className={`spec-group-title ${isCollapsed ? '' : 'active'}`}
                                            onClick={() => toggleSpecGroup(groupKey)}
                                            aria-expanded={!isCollapsed}
                                            aria-controls={`spec-group-${groupIndex}`}
                                        >
                                            <h3>{group.title}</h3>
                                            <i className="fas fa-chevron-down"></i>
                                        </button>
                                        {!isCollapsed && (
                                            <ul className="text-specifi active" id={`spec-group-${groupIndex}`}>
                                                {(group.items || []).map((item, itemIndex) => (
                                                    <li key={`${item.label}-${itemIndex}`}>
                                                        <aside>
                                                            <strong>{item.label}:</strong>
                                                        </aside>
                                                        <aside>
                                                            <span>{item.value}</span>
                                                        </aside>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="empty-info">Chưa có thông số kỹ thuật cho sản phẩm này.</p>
                    )}
                </div>

                <div className={`description tab-content ${activeInfoTab === 'description' ? 'current' : ''}`} id="tab-2">
                    <div className="text-detail expand">
                        {renderProductDescription()}
                    </div>
                </div>
            </section>

            <div style={{ marginTop: '50px', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid var(--bg-color)' }}>
                    <div>
                        <h2 style={{ marginBottom: '5px' }}>Đánh giá & Nhận xét</h2>
                    </div>
                    {reviews.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>{avgRating}</div>
                            <div>
                                <div style={{ display: 'flex', gap: '3px', marginBottom: '5px' }}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <i key={i} className={i < Math.round(parseFloat(avgRating)) ? "fas fa-star" : "far fa-star"} style={{ color: i < Math.round(parseFloat(avgRating)) ? "#f39c12" : "#ccc", fontSize: '16px' }}></i>
                                    ))}
                                </div>
                                <div style={{ fontSize: '13px', color: '#666' }}>({reviews.length} đánh giá)</div>
                            </div>
                        </div>
                    )}
                </div>
                
                {userPurchaseData.canReview ? (
                    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid var(--primary-color)' }}>
                        <h4 style={{ marginBottom: '10px' }}>{userPurchaseData.existingReview ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá của bạn"}</h4>
                        {userPurchaseData.existingReview && <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>* Đây là lần cuối cùng bạn có thể sửa đổi đánh giá này. Sau khi cập nhật, bạn không thể sửa lại nữa.</p>}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', marginRight: '15px' }}>Chất lượng:</label>
                            <select value={rating} onChange={e => setRating(parseInt(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}>
                                <option value="5">⭐⭐⭐⭐⭐ (Tuyệt vời)</option>
                                <option value="4">⭐⭐⭐⭐ (Tốt)</option>
                                <option value="3">⭐⭐⭐ (Bình thường)</option>
                                <option value="2">⭐⭐ (Kém)</option>
                                <option value="1">⭐ (Quá tệ)</option>
                            </select>
                        </div>
                        <textarea 
                            rows="4" 
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..." 
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '15px', outline: 'none' }}
                        ></textarea>
                        <button onClick={handleSubmitReview} style={{ padding: '10px 25px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {userPurchaseData.existingReview ? "Cập Nhật Đánh Giá" : "Gửi Đánh Giá"}
                        </button>
                    </div>
                ) : (
                    <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ffeeba' }}>
                        {!userPurchaseData.isLoggedIn ? "Vui lòng đăng nhập và mua sản phẩm để có thể để lại đánh giá." :
                         !userPurchaseData.hasPurchased ? "Chỉ khách hàng đã trải nghiệm và mua sản phẩm này mới có thể viết đánh giá." :
                         "Thời hạn viết hoặc sửa đánh giá (1 tháng kể từ ngày mua) đã kết thúc."}
                    </div>
                )}

                <div>
                    {reviews.length === 0 ? (
                        <p style={{ color: '#777', fontStyle: 'italic' }}>Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét sản phẩm này!</p>
                    ) : (
                        [...reviews].reverse().map(review => {
                            const allUsers = JSON.parse(localStorage.getItem('users')) || [];
                            const userObj = allUsers.find(u => u.id === review.user_id);
                            const displayName = userObj ? (userObj.full_name || userObj.email) : "Khách hàng vô danh";
                            // Fallback format cho những dữ liệu cũ không có created_at
                            const dateDisplay = review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : (review.date || '');

                            return (
                            <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#ddd', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#555' }}>
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{displayName}</div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>{dateDisplay}</div>
                                    </div>
                                </div>
                                <div style={{ margin: '10px 0' }}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"} style={{ color: i < review.rating ? "#f39c12" : "#ccc" }}></i>
                                    ))}
                                </div>
                                <p style={{ color: '#333', lineHeight: 1.5 }}>{review.comment || review.text}</p>
                            </div>
                        )})
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
