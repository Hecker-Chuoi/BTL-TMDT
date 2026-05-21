import React, { useState, useEffect } from 'react';
import { getDB, setDB, getMainImage, formatMoney, dbBrands, getFlashSale, setFlashSale, getBannerSettings, setBannerSettings, getItemsPerPage, setItemsPerPage, getFlashSaleItemsPerPage, setFlashSaleItemsPerPage } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [products, setProducts] = useState(() => getDB());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [currentTab, setCurrentTab] = useState('products');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all'); // 'all' | '1' | '2'
    
    // Data state
    const [categories] = useState(() => JSON.parse(localStorage.getItem('categories')) || []);
    const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders')) || []);
    const [orderItems] = useState(() => JSON.parse(localStorage.getItem('order_items')) || []);
    const [payments] = useState(() => JSON.parse(localStorage.getItem('payments')) || []);
    const [customers] = useState(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.filter(user => user.role === 'USER');
    });
    const [reviews] = useState(() => JSON.parse(localStorage.getItem('productReviews')) || []);
    const [reviewProductFilter, setReviewProductFilter] = useState('all');
    const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

    // Interface settings state
    const [itemsPerPageValue, setItemsPerPageValue] = useState(() => String(getItemsPerPage()));
    const [flashSaleItemsPerPageValue, setFlashSaleItemsPerPageValue] = useState(() => String(getFlashSaleItemsPerPage()));
    const [bannerSettings, setBannerSettingsState] = useState(() => getBannerSettings());
    const [bannerFormData, setBannerFormData] = useState({
        image_url: '',
        product_id: '',
        display_order: ''
    });
    const [editingBannerId, setEditingBannerId] = useState(null);

    // Flash sale form state
    const [flashSaleDiscountPercent, setFlashSaleDiscountPercent] = useState(() => String(getFlashSale().discount_percent || 20));
    const [flashSaleStartTime, setFlashSaleStartTime] = useState(() => {
        const flashSaleData = getFlashSale();
        return flashSaleData.start_time ? flashSaleData.start_time.substring(0, 16) : '';
    });
    const [flashSaleEndTime, setFlashSaleEndTime] = useState(() => {
        const flashSaleData = getFlashSale();
        return flashSaleData.end_time ? flashSaleData.end_time.substring(0, 16) : '';
    });
    const [flashSaleSelectedProducts, setFlashSaleSelectedProducts] = useState(() => getFlashSale().product_ids || []);

    // Form state
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState('1'); 
    const [formBrand, setFormBrand] = useState('1');
    const [formPrice, setFormPrice] = useState('');
    const [formStock, setFormStock] = useState('10');
    const [formImg, setFormImg] = useState('');        // base64 data URL
    const [formImgPreview, setFormImgPreview] = useState(''); // for preview
    const [formDescription, setFormDescription] = useState('');
    const [formSpecs, setFormSpecs] = useState([
        { spec_key: '', spec_value: '' }
    ]);
    const [adminProfile] = useState(() => JSON.parse(sessionStorage.getItem('currentUser'))?.name || 'Admin');
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user || user.role !== 'ADMIN') {
            alert("Bạn không có quyền truy cập trang quản trị này!");
            navigate('/login');
            return;
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const handleDelete = (id) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            const updated = products.filter(p => p.id !== id);
            setProducts(updated);
            setDB(updated);
            
            // Adjust page if necessary
            if ((currentPage - 1) * itemsPerPage >= updated.length) {
                setCurrentPage(Math.max(1, currentPage - 1));
            }
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormCategory('1');
        setFormBrand('1');
        setFormPrice('');
        setFormStock('10');
        setFormImg('');
        setFormImgPreview('');
        setFormDescription('');
        setFormSpecs([{ spec_key: '', spec_value: '' }]);
        setEditingProductId(null);
    };

    const handleEditProduct = (product) => {
        setFormName(product.name);
        setFormCategory(String(product.category_id));
        setFormBrand(String(product.brand_id));
        setFormPrice(String(product.price));
        setFormStock(String(product.stock));
        setFormDescription(product.description || '');
        setFormSpecs(product.specs && product.specs.length > 0 ? product.specs : [{ spec_key: '', spec_value: '' }]);
        if (product.images && product.images.length > 0) {
            const mainImage = product.images.find(img => img.is_main) || product.images[0];
            setFormImgPreview(mainImage.image_url);
            setFormImg(mainImage.image_url);
        } else {
            setFormImg('');
            setFormImgPreview('');
        }
        setEditingProductId(product.id);
        setIsModalOpen(true);
    };

    const updateOrderStatus = (orderId, newStatus) => {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
    };

    const getCustomerById = (userId) => {
        return customers.find(customer => customer.id === userId) || null;
    };

    const getCustomerName = (userId) => {
        return getCustomerById(userId)?.full_name || 'Khách hàng không xác định';
    };

    const getProductNameById = (productId) => {
        return products.find(product => product.id === productId)?.name || `Sản phẩm #${productId}`;
    };

    const getOrderItemsByOrderId = (orderId) => {
        return orderItems.filter(item => item.order_id === orderId);
    };

    const getPaymentMethodLabel = (paymentMethod) => {
        return paymentMethod === 'ONLINE' ? 'Chuyển khoản (QR)' : 'Tiền mặt (COD)';
    };

    const getPaymentStatusMeta = (status) => {
        if (status === 'SUCCESS') {
            return { label: 'Thành công', background: '#27ae60' };
        }
        if (status === 'PENDING') {
            return { label: 'Chờ xử lý', background: '#f39c12' };
        }
        return { label: status || 'Không xác định', background: '#7f8c8d' };
    };

    const getOrderStatusMeta = (status) => {
        if (status === 'CONFIRMED') {
            return { label: 'Đã duyệt', background: '#27ae60' };
        }
        if (status === 'PENDING') {
            return { label: 'Chờ duyệt', background: '#f39c12' };
        }
        if (status === 'CANCELLED') {
            return { label: 'Đã hủy', background: '#e74c3c' };
        }
        return { label: status || 'Không xác định', background: '#7f8c8d' };
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) return 'N/A';
        return new Date(dateValue).toLocaleString('vi-VN');
    };

    const formatShortDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        return new Date(dateValue).toLocaleDateString('vi-VN');
    };

    const confirmedOrders = orders.filter(order => order.status === 'CONFIRMED');
    const pendingOrders = orders.filter(order => order.status === 'PENDING');
    const paymentHistory = [...payments].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const totalRevenue = confirmedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const successfulPaymentRevenue = payments
        .filter(payment => payment.status === 'SUCCESS')
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const pendingRevenue = pendingOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const todayRevenue = confirmedOrders
        .filter(order => {
            if (!order.created_at) return false;
            return new Date(order.created_at).toDateString() === new Date().toDateString();
        })
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const revenueByMethod = ['COD', 'ONLINE'].map(method => ({
        method,
        label: getPaymentMethodLabel(method),
        amount: confirmedOrders
            .filter(order => order.payment_method === method)
            .reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
        count: confirmedOrders.filter(order => order.payment_method === method).length
    }));
    const topSellingProducts = Object.values(
        orderItems.reduce((accumulator, item) => {
            if (!accumulator[item.product_id]) {
                accumulator[item.product_id] = {
                    product_id: item.product_id,
                    product_name: getProductNameById(item.product_id),
                    quantity: 0,
                    revenue: 0
                };
            }

            accumulator[item.product_id].quantity += Number(item.quantity || 0);
            accumulator[item.product_id].revenue += Number(item.price || 0) * Number(item.quantity || 0);
            return accumulator;
        }, {})
    )
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const filteredReviews = [...reviews]
        .filter(review => reviewProductFilter === 'all' || String(review.product_id) === reviewProductFilter)
        .filter(review => reviewRatingFilter === 'all' || String(review.rating) === reviewRatingFilter)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const averageReviewRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';
    const fiveStarReviews = reviews.filter(review => Number(review.rating) === 5).length;
    const lowRatingReviews = reviews.filter(review => Number(review.rating) <= 2).length;

    const handleFlashSaleSubmit = (e) => {
        e.preventDefault();
        
        if (flashSaleSelectedProducts.length === 0) {
            alert("Vui lòng chọn ít nhất 1 sản phẩm cho flash sale!");
            return;
        }

        const updatedFlashSale = {
            discount_percent: parseInt(flashSaleDiscountPercent),
            start_time: new Date(flashSaleStartTime).toISOString(),
            end_time: new Date(flashSaleEndTime).toISOString(),
            product_ids: flashSaleSelectedProducts
        };

        setFlashSale(updatedFlashSale);
        alert("Cập nhật Flash Sale thành công!");
    };

    // Interface Management Handlers
    const handleItemsPerPageChange = (e) => {
        e.preventDefault();
        const value = parseInt(itemsPerPageValue);
        if (value < 1) {
            alert("Số lượng sản phẩm phải lớn hơn 0!");
            return;
        }
        setItemsPerPage(value);
        alert("Cập nhật số sản phẩm trên trang thành công!");
    };

    const handleFlashSaleItemsPerPageChange = (e) => {
        e.preventDefault();
        const value = parseInt(flashSaleItemsPerPageValue);
        if (value < 1) {
            alert("Số lượng sản phẩm flash sale phải lớn hơn 0!");
            return;
        }
        setFlashSaleItemsPerPage(value);
        alert("Cập nhật số sản phẩm flash sale trên trang thành công!");
    };

    const handleBannerImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerFormData({ ...bannerFormData, image_url: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleBannerFormSubmit = (e) => {
        e.preventDefault();
        
        if (!bannerFormData.image_url || !bannerFormData.product_id || !bannerFormData.display_order) {
            alert("Vui lòng điền đầy đủ thông tin banner!");
            return;
        }

        let updatedBanners;
        if (editingBannerId) {
            updatedBanners = bannerSettings.map(b => 
                b.id === editingBannerId 
                    ? { ...b, ...bannerFormData, product_id: parseInt(bannerFormData.product_id), display_order: parseInt(bannerFormData.display_order) }
                    : b
            );
            alert("Cập nhật banner thành công!");
        } else {
            const newBanner = {
                id: Date.now(),
                image_url: bannerFormData.image_url,
                product_id: parseInt(bannerFormData.product_id),
                display_order: parseInt(bannerFormData.display_order)
            };
            updatedBanners = [...bannerSettings, newBanner];
            alert("Thêm banner thành công!");
        }

        // Sort by display_order
        updatedBanners.sort((a, b) => a.display_order - b.display_order);
        
        setBannerSettings(updatedBanners);
        setBannerSettingsState(updatedBanners);
        setBannerFormData({ image_url: '', product_id: '', display_order: '' });
        setEditingBannerId(null);
    };

    const handleEditBanner = (banner) => {
        setBannerFormData({
            image_url: banner.image_url,
            product_id: String(banner.product_id),
            display_order: String(banner.display_order)
        });
        setEditingBannerId(banner.id);
    };

    const handleDeleteBanner = (bannerId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
            const updated = bannerSettings.filter(b => b.id !== bannerId);
            setBannerSettingsState(updated);
            setBannerSettings(updated);
            alert("Xóa banner thành công!");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormImg(reader.result);      // base64 data URL
            setFormImgPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingProductId) {
            // Edit mode
            const updated = products.map(p => {
                if (p.id === editingProductId) {
                    return {
                        ...p,
                        name: formName,
                        category_id: parseInt(formCategory),
                        brand_id: parseInt(formBrand),
                        price: parseInt(formPrice),
                        stock: parseInt(formStock),
                        description: formDescription,
                        images: [
                            {
                                id: p.images && p.images[0] ? p.images[0].id : Date.now(),
                                image_url: formImg || 'https://placehold.co/300x200?text=No+Image',
                                is_main: true
                            }
                        ],
                        specs: formSpecs.filter(s => s.spec_key && s.spec_value) 
                    };
                }
                return p;
            });
            setProducts(updated);
            setDB(updated);
            resetForm();
            setIsModalOpen(false);
            alert("Cập nhật sản phẩm thành công!");
        } else {
            // Add new mode
            const newProduct = {
                id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                name: formName,
                category_id: parseInt(formCategory),
                brand_id: parseInt(formBrand),
                price: parseInt(formPrice),
                stock: parseInt(formStock),
                description: formDescription,
                status: "ACTIVE",
                images: [
                    {
                        id: Date.now(),
                        image_url: formImg || 'https://placehold.co/300x200?text=No+Image',
                        is_main: true
                    }
                ],
                specs: formSpecs.filter(s => s.spec_key && s.spec_value) 
            };

            const updated = [...products, newProduct];
            setProducts(updated);
            setDB(updated);
            resetForm();
            setIsModalOpen(false);
            setCurrentPage(1);
            alert("Thêm sản phẩm thành công!");
        }
    };

    // Filter + Pagination
    const filteredProducts = filterCategory === 'all'
        ? products
        : products.filter(p => String(p.category_id) === filterCategory);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

    const handleFilterCategory = (cat) => {
        setFilterCategory(cat);
        setCurrentPage(1); // reset trang khi đổi filter
    };

    // Lấy danh sách brands phù hợp với category được chọn trong form
    const getFilteredBrands = () => {
        const categoryMap = { '1': 'laptop', '2': 'component' };
        const categoryType = categoryMap[formCategory];
        
        return dbBrands.filter(brand => 
            brand.type === categoryType || brand.type === 'both'
        );
    };

    return (
        <div className="admin-body">
            <aside className="admin-sidebar" style={{ width: isSidebarOpen ? '250px' : '60px', overflow: 'hidden', transition: 'width 0.3s ease' }}>
                <div className="admin-sidebar-header" style={{ whiteSpace: 'nowrap', overflow: 'hidden', padding: isSidebarOpen ? '20px' : '20px 10px', fontSize: isSidebarOpen ? '20px' : '14px' }}>
                    {isSidebarOpen ? 'TechStore Admin' : 'TS'}
                </div>
                <ul className="admin-nav-menu">
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'products' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('products'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-box"></i>{isSidebarOpen && ' Quản lý Sản phẩm'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'flashsale' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('flashsale'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-bolt"></i>{isSidebarOpen && ' Flash Sale'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'interface' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('interface'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-sliders-h"></i>{isSidebarOpen && ' Quản lý Giao diện'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'orders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('orders'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-shopping-cart"></i>{isSidebarOpen && ' Quản lý Đơn hàng'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'revenue' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('revenue'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-chart-line"></i>{isSidebarOpen && ' Doanh thu'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'reviews' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('reviews'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-star"></i>{isSidebarOpen && ' Đánh giá'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'customers' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('customers'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-users"></i>{isSidebarOpen && ' Khách hàng'}</a></li>
                </ul>
            </aside>

            <main className="admin-main-content">
                <header className="admin-top-header">
                    <div>
                        <i 
                            className="fas fa-bars" 
                            style={{ cursor: 'pointer', fontSize: '20px' }}
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                        ></i>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="admin-profile"><i className="fas fa-user-shield"></i> {adminProfile}</div>
                        <button className="action-btn btn-delete" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className="fas fa-sign-out-alt"></i> Đăng xuất
                        </button>
                    </div>
                </header>

                {currentTab === 'products' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Danh sách Sản phẩm</h2>
                        <button className="btn-add" onClick={() => setIsModalOpen(true)}><i className="fas fa-plus"></i> Thêm Sản Phẩm</button>
                    </div>

                    {/* Bộ lọc danh mục */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: '1',   label: 'Laptop' },
                            { key: '2',   label: 'Linh kiện PC' }
                        ].map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => handleFilterCategory(opt.key)}
                                style={{
                                    padding: '7px 18px',
                                    borderRadius: '20px',
                                    border: '2px solid var(--primary-color)',
                                    background: filterCategory === opt.key ? 'var(--primary-color)' : 'white',
                                    color: filterCategory === opt.key ? 'white' : 'var(--primary-color)',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                            >
                                {opt.label}
                                {opt.key !== 'all' && (
                                    <span style={{ marginLeft: '6px', fontSize: '12px', opacity: 0.8 }}>
                                        ({products.filter(p => String(p.category_id) === opt.key).length})
                                    </span>
                                )}
                            </button>
                        ))}
                        <span style={{ alignSelf: 'center', color: '#888', fontSize: '13px' }}>
                            Đang hiển thị {filteredProducts.length} sản phẩm
                        </span>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Hình ảnh</th>
                                    <th>Tên Sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá bán</th>
                                    <th>Tồn kho</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map(p => (
                                    <tr key={p.id}>
                                        <td>#{p.id}</td>
                                        <td><img src={getMainImage(p)} alt="img" /></td>
                                        <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                                        <td>{categories.find(c => c.id === parseInt(p.category_id))?.name || p.category_id}</td>
                                        <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(p.price)}</td>
                                        <td style={{ fontWeight: 'bold', color: p.stock > 0 ? '#27ae60' : 'red' }}>{p.stock}</td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button className="action-btn" style={{ background: '#3498db', color: 'white' }} onClick={() => handleEditProduct(p)}><i className="fas fa-edit"></i> Sửa</button>
                                            <button className="action-btn btn-delete" onClick={() => handleDelete(p.id)}><i className="fas fa-trash"></i> Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedItems.length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                        
                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page} 
                                        className={`page-btn ${page === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                )}

                {currentTab === 'orders' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Quản lý Đơn hàng và Thanh toán</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Tổng số đơn</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>{orders.length}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Đơn chờ duyệt</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>{pendingOrders.length}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Đơn đã duyệt</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>{confirmedOrders.length}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Lịch sử thanh toán</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8e44ad' }}>{payments.length}</div>
                        </div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Mã Đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Thanh toán</th><th>Tình trạng</th><th>Thời gian</th><th>Hành động</th></tr>
                            </thead>
                            <tbody>
                                {[...orders].reverse().map(o => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td>
                                        <td>
                                            <strong>{getCustomerName(o.user_id)}</strong>
                                            <div style={{ color: '#777', fontSize: '12px' }}>{getCustomerById(o.user_id)?.email || 'Không có email'}</div>
                                        </td>
                                        <td style={{ maxWidth: '280px' }}>
                                            {getOrderItemsByOrderId(o.id).length > 0 ? (
                                                getOrderItemsByOrderId(o.id).map(item => (
                                                    <div key={item.id} style={{ fontSize: '13px', marginBottom: '4px' }}>
                                                        {item.product_name || getProductNameById(item.product_id)} x{item.quantity}
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ color: '#999' }}>Không có chi tiết</span>
                                            )}
                                        </td>
                                        <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(o.total_amount)}</td>
                                        <td>
                                            <div>{getPaymentMethodLabel(o.payment_method)}</div>
                                            <div style={{ marginTop: '4px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: getPaymentStatusMeta(o.payment_status).background, color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {getPaymentStatusMeta(o.payment_status).label}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ padding: '5px 10px', borderRadius: '4px', background: getOrderStatusMeta(o.status).background, color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                                {getOrderStatusMeta(o.status).label}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(o.created_at)}</td>
                                        <td>
                                            {o.status === 'PENDING' ? (
                                                <button className="action-btn" style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => updateOrderStatus(o.id, 'CONFIRMED')}><i className="fas fa-check"></i> Duyệt Đơn</button>
                                            ) : (
                                                <span style={{ color: '#7f8c8d' }}>Đã xử lý</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chưa có đơn hàng nào</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', marginTop: '24px', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 20px 0' }}>
                            <h3 style={{ margin: 0 }}>Lịch sử thanh toán</h3>
                            <p style={{ margin: '8px 0 20px', color: '#666', fontSize: '14px' }}>Theo dõi giao dịch QR, COD và trạng thái thanh toán của từng đơn hàng.</p>
                        </div>
                        <table>
                            <thead>
                                <tr><th>Mã GD</th><th>Đơn hàng</th><th>Khách hàng</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th><th>Mã giao dịch</th><th>Thời gian</th></tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map(payment => {
                                    const order = orders.find(item => item.id === payment.order_id);
                                    return (
                                        <tr key={payment.id}>
                                            <td>#{payment.id}</td>
                                            <td>#{payment.order_id}</td>
                                            <td>{order ? getCustomerName(order.user_id) : 'Không rõ đơn hàng'}</td>
                                            <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(payment.amount || 0)}</td>
                                            <td>{getPaymentMethodLabel(payment.method)}</td>
                                            <td>
                                                <span style={{ padding: '5px 10px', borderRadius: '4px', background: getPaymentStatusMeta(payment.status).background, color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {getPaymentStatusMeta(payment.status).label}
                                                </span>
                                            </td>
                                            <td>{payment.transaction_code || 'COD'}</td>
                                            <td>{formatDateTime(payment.created_at)}</td>
                                        </tr>
                                    );
                                })}
                                {paymentHistory.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chưa có lịch sử thanh toán</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

                {currentTab === 'revenue' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Doanh thu</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', padding: '22px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Doanh thu đã ghi nhận</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(totalRevenue)}</div>
                            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{confirmedOrders.length} đơn đã duyệt</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #2980b9, #3498db)', color: 'white', padding: '22px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Tiền đã thanh toán</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(successfulPaymentRevenue)}</div>
                            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{payments.filter(payment => payment.status === 'SUCCESS').length} giao dịch thành công</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #f39c12, #f1c40f)', color: 'white', padding: '22px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Doanh thu chờ xử lý</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(pendingRevenue)}</div>
                            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{pendingOrders.length} đơn chờ duyệt</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', color: 'white', padding: '22px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Doanh thu hôm nay</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatMoney(todayRevenue)}</div>
                            <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.9 }}>{formatShortDate(new Date())}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '24px', marginBottom: '24px' }}>
                        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Doanh thu theo phương thức thanh toán</h3>
                            {revenueByMethod.map(item => (
                                <div key={item.method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.label}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{item.count} đơn đã duyệt</div>
                                    </div>
                                    <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(item.amount)}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Sản phẩm bán chạy</h3>
                            {topSellingProducts.length > 0 ? topSellingProducts.map((item, index) => (
                                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: index === topSellingProducts.length - 1 ? 'none' : '1px solid #eee' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Đã bán {item.quantity} sản phẩm</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(item.revenue)}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Top {index + 1}</div>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#999', marginBottom: 0 }}>Chưa có dữ liệu bán hàng.</p>
                            )}
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Mã đơn</th><th>Khách hàng</th><th>Phương thức</th><th>Tổng tiền</th><th>Ngày duyệt/đặt</th></tr>
                            </thead>
                            <tbody>
                                {confirmedOrders.length > 0 ? [...confirmedOrders].reverse().slice(0, 10).map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{getCustomerName(order.user_id)}</td>
                                        <td>{getPaymentMethodLabel(order.payment_method)}</td>
                                        <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(order.total_amount)}</td>
                                        <td>{formatDateTime(order.updated_at || order.created_at)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có doanh thu để thống kê</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

                {currentTab === 'reviews' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Đánh giá sản phẩm</h2>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 220px)', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Lọc theo sản phẩm</label>
                                <select value={reviewProductFilter} onChange={e => setReviewProductFilter(e.target.value)}>
                                    <option value="all">Tất cả sản phẩm</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Lọc theo số sao</label>
                                <select value={reviewRatingFilter} onChange={e => setReviewRatingFilter(e.target.value)}>
                                    <option value="all">Tất cả mức sao</option>
                                    <option value="5">5 sao</option>
                                    <option value="4">4 sao</option>
                                    <option value="3">3 sao</option>
                                    <option value="2">2 sao</option>
                                    <option value="1">1 sao</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Tổng đánh giá</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>{reviews.length}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Điểm trung bình</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f39c12' }}>{averageReviewRating} / 5</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Đánh giá 5 sao</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>{fiveStarReviews}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                            <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Đánh giá thấp (1-2 sao)</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>{lowRatingReviews}</div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Người đánh giá</th><th>Sản phẩm</th><th>Số sao</th><th>Nội dung</th><th>Ngày đánh giá</th></tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map(review => (
                                    <tr key={review.id}>
                                        <td>{getCustomerName(review.user_id)}</td>
                                        <td>{getProductNameById(review.product_id)}</td>
                                        <td>
                                            <span style={{ color: '#f39c12', fontWeight: 'bold' }}>
                                                {'★'.repeat(Number(review.rating || 0))}
                                                <span style={{ color: '#ccc' }}>{'★'.repeat(5 - Number(review.rating || 0))}</span>
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '420px', lineHeight: 1.5 }}>{review.comment || review.text || 'Không có nội dung'}</td>
                                        <td>{formatDateTime(review.created_at)}</td>
                                    </tr>
                                ))}
                                {filteredReviews.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có đánh giá phù hợp bộ lọc</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

                {currentTab === 'customers' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Quản lý Khách hàng</h2>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>ID</th><th>Tên khách hàng</th><th>Email</th><th>Số điện thoại</th><th>Địa chỉ</th><th>Ngày đăng ký</th></tr>
                            </thead>
                            <tbody>
                                {customers.map(c => (
                                    <tr key={c.id}>
                                        <td>#{c.id}</td>
                                        <td><strong>{c.full_name}</strong></td>
                                        <td>{c.email}</td>
                                        <td>{c.phone || 'Chưa cập nhật'}</td>
                                        <td>{c.address || 'Chưa cập nhật'}</td>
                                        <td>{formatShortDate(c.created_at)}</td>
                                    </tr>
                                ))}
                                {customers.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có khách hàng nào</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

                {currentTab === 'interface' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Quản lý Giao diện</h2>
                    </div>

                    {/* Items Per Page Section */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                            <i className="fas fa-list"></i> Số lượng sản phẩm trên mỗi trang
                        </h3>
                        <form onSubmit={handleItemsPerPageChange}>
                            <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                                <div style={{ flex: '0 0 200px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số lượng sản phẩm (itemsPerPage):</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="50"
                                        value={itemsPerPageValue} 
                                        onChange={e => setItemsPerPageValue(e.target.value)} 
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        required 
                                    />
                                    <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>Hiện tại: {itemsPerPageValue} sản phẩm/trang</small>
                                </div>
                                <button type="submit" className="btn-submit" style={{ padding: '8px 20px' }}>
                                    <i className="fas fa-save"></i> Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Flash Sale Items Per Page Section */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                            <i className="fas fa-bolt" style={{ color: '#e74c3c' }}></i> Số lượng sản phẩm Flash Sale trên mỗi trang
                        </h3>
                        <form onSubmit={handleFlashSaleItemsPerPageChange}>
                            <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                                <div style={{ flex: '0 0 200px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số lượng sản phẩm:</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="50"
                                        value={flashSaleItemsPerPageValue} 
                                        onChange={e => setFlashSaleItemsPerPageValue(e.target.value)} 
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        required 
                                    />
                                    <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>Hiện tại: {flashSaleItemsPerPageValue} sản phẩm/trang</small>
                                </div>
                                <button type="submit" className="btn-submit" style={{ padding: '8px 20px' }}>
                                    <i className="fas fa-save"></i> Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Banner Management Section */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                            <i className="fas fa-image"></i> Quản lý Banner
                        </h3>

                        {/* Banner Form */}
                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '6px', marginBottom: '30px' }}>
                            <h4 style={{ marginTop: 0 }}>{editingBannerId ? 'Sửa Banner' : 'Thêm Banner Mới'}</h4>
                            <form onSubmit={handleBannerFormSubmit}>
                                <div className="form-group">
                                    <label>Hình ảnh Banner:</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleBannerImageChange}
                                        style={{ width: '100%', padding: '6px 0', cursor: 'pointer', marginBottom: '8px' }}
                                    />
                                    {bannerFormData.image_url && (
                                        <div style={{ marginTop: '8px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '6px', padding: '8px' }}>
                                            <img src={bannerFormData.image_url} alt="preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '4px' }} />
                                            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Xem trước</p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Chọn sản phẩm (liên kết):</label>
                                    <select 
                                        value={bannerFormData.product_id} 
                                        onChange={e => setBannerFormData({ ...bannerFormData, product_id: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        required
                                    >
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Thứ tự hiển thị:</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={bannerFormData.display_order} 
                                        onChange={e => setBannerFormData({ ...bannerFormData, display_order: e.target.value })}
                                        placeholder="Vd: 1, 2, 3..."
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn-submit" style={{ padding: '10px 20px' }}>
                                        <i className="fas fa-save"></i> {editingBannerId ? 'Cập nhật Banner' : 'Thêm Banner'}
                                    </button>
                                    {editingBannerId && (
                                        <button 
                                            type="button" 
                                            className="action-btn btn-cancel" 
                                            onClick={() => {
                                                setEditingBannerId(null);
                                                setBannerFormData({ image_url: '', product_id: '', display_order: '' });
                                            }}
                                            style={{ padding: '10px 20px' }}
                                        >
                                            <i className="fas fa-times"></i> Hủy sửa
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Banners List */}
                        <div>
                            <h4>Danh sách Banner hiện tại:</h4>
                            {bannerSettings.length === 0 ? (
                                <p style={{ color: '#999', fontStyle: 'italic' }}>Chưa có banner nào. Hãy thêm banner mới.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {bannerSettings.map(banner => (
                                        <div key={banner.id} style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            <img src={banner.image_url} alt="banner" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                            <div style={{ padding: '12px' }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <small style={{ display: 'block', color: '#666' }}>Sản phẩm:</small>
                                                    <strong>{products.find(p => p.id === banner.product_id)?.name || 'N/A'}</strong>
                                                </div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <small style={{ display: 'block', color: '#666' }}>Thứ tự:</small>
                                                    <strong>{banner.display_order}</strong>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => handleEditBanner(banner)}
                                                        className="action-btn btn-edit" 
                                                        style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                                    >
                                                        <i className="fas fa-edit"></i> Sửa
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteBanner(banner.id)}
                                                        className="action-btn btn-delete" 
                                                        style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                                                    >
                                                        <i className="fas fa-trash"></i> Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                )}

                {currentTab === 'flashsale' && (
                <section className="admin-content-area">
                    <div className="admin-page-title">
                        <h2>Quản lý Flash Sale</h2>
                    </div>

                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <form onSubmit={handleFlashSaleSubmit}>
                            <div className="form-group">
                                <label>% Giảm giá:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="100"
                                    value={flashSaleDiscountPercent} 
                                    onChange={e => setFlashSaleDiscountPercent(e.target.value)} 
                                    required 
                                    style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>%</span>
                            </div>

                            <div className="form-group">
                                <label>Thời gian bắt đầu:</label>
                                <input 
                                    type="datetime-local" 
                                    value={flashSaleStartTime} 
                                    onChange={e => setFlashSaleStartTime(e.target.value)} 
                                    required 
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Thời gian kết thúc:</label>
                                <input 
                                    type="datetime-local" 
                                    value={flashSaleEndTime} 
                                    onChange={e => setFlashSaleEndTime(e.target.value)} 
                                    required 
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Chọn sản phẩm cho Flash Sale:</label>
                                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {products.map(product => (
                                        <div key={product.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
                                            <input 
                                                type="checkbox"
                                                checked={flashSaleSelectedProducts.includes(product.id)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setFlashSaleSelectedProducts([...flashSaleSelectedProducts, product.id]);
                                                    } else {
                                                        setFlashSaleSelectedProducts(flashSaleSelectedProducts.filter(id => id !== product.id));
                                                    }
                                                }}
                                                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <img src={getMainImage(product)} alt={product.name} style={{ width: '50px', height: '50px', marginRight: '12px', borderRadius: '4px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{formatMoney(product.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '4px', fontSize: '14px', color: '#2e7d32' }}>
                                    <i className="fas fa-info-circle"></i> {flashSaleSelectedProducts.length} sản phẩm được chọn
                                </div>
                            </div>

                            <button type="submit" className="btn-submit" style={{ padding: '12px 30px', fontSize: '16px' }}>
                                <i className="fas fa-save"></i> Cập nhật Flash Sale
                            </button>
                        </form>
                    </div>
                </section>
                )}
            </main>

            <div className={`modal ${isModalOpen ? 'active' : ''}`}>
                <div className="modal-content">
                    <span className="close-modal" onClick={() => { setIsModalOpen(false); resetForm(); }}><i className="fas fa-times"></i></span>
                    <h3 style={{ marginBottom: '20px' }}>{editingProductId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-group">
                            <label>Tên Sản Phẩm:</label>
                            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Danh mục:</label>
                            <select value={formCategory} onChange={e => {
                                setFormCategory(e.target.value);
                                // Auto reset brand khi thay đổi category
                                const filteredBrands = dbBrands.filter(brand => {
                                    const categoryMap = { '1': 'laptop', '2': 'component' };
                                    const categoryType = categoryMap[e.target.value];
                                    return brand.type === categoryType || brand.type === 'both';
                                });
                                if (filteredBrands.length > 0) {
                                    setFormBrand(filteredBrands[0].id.toString());
                                }
                            }}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Thương hiệu:</label>
                            <select value={formBrand} onChange={e => setFormBrand(e.target.value)}>
                                {getFilteredBrands().map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Giá bán (VNĐ):</label>
                            <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Số lượng tồn kho:</label>
                            <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Hình ảnh sản phẩm:</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ width: '100%', padding: '6px 0', cursor: 'pointer', marginBottom: '8px' }}
                            />
                            {formImgPreview && (
                                <div style={{ marginTop: '8px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '6px', padding: '8px' }}>
                                    <img src={formImgPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '4px' }} />
                                    <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Ảnh xác nhận</p>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Đặc điểm nổi bật:</label>
                            <textarea 
                                rows="3"
                                value={formDescription}
                                onChange={e => setFormDescription(e.target.value)}
                                placeholder="Mô tả những điểm nổi bật của sản phẩm..."
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Thông số kỹ thuật:</label>
                            <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
                                {formSpecs.map((spec, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: index < formSpecs.length - 1 ? '10px' : '0' }}>
                                        <input
                                            type="text"
                                            placeholder="Tên thông số (vd: CPU)"
                                            value={spec.spec_key}
                                            onChange={e => {
                                                const updated = [...formSpecs];
                                                updated[index].spec_key = e.target.value;
                                                setFormSpecs(updated);
                                            }}
                                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Giá trị (vd: Intel i7)"
                                            value={spec.spec_value}
                                            onChange={e => {
                                                const updated = [...formSpecs];
                                                updated[index].spec_value = e.target.value;
                                                setFormSpecs(updated);
                                            }}
                                            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                        {formSpecs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setFormSpecs(formSpecs.filter((_, i) => i !== index))}
                                                style={{ padding: '8px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormSpecs([...formSpecs, { spec_key: '', spec_value: '' }])}
                                    style={{ width: '100%', padding: '8px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }}
                                >
                                    <i className="fas fa-plus"></i> Thêm thông số
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn-submit">Lưu Sản Phẩm</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Admin;
