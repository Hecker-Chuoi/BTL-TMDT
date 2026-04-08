import React, { useState, useEffect } from 'react';
import { getDB, setDB, getMainImage, formatMoney, dbBrands, getFlashSale, setFlashSale } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [currentTab, setCurrentTab] = useState('products');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all'); // 'all' | '1' | '2'
    
    // Data state
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [flashSale, setFlashSaleState] = useState(null);

    // Flash sale form state
    const [flashSaleDiscountPercent, setFlashSaleDiscountPercent] = useState('20');
    const [flashSaleStartTime, setFlashSaleStartTime] = useState('');
    const [flashSaleEndTime, setFlashSaleEndTime] = useState('');
    const [flashSaleSelectedProducts, setFlashSaleSelectedProducts] = useState([]);

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
    const [adminProfile, setAdminProfile] = useState("Admin");
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user || user.role !== 'ADMIN') {
            alert("Bạn không có quyền truy cập trang quản trị này!");
            navigate('/login');
            return;
        }

        const dbData = getDB();
        setProducts(dbData);
        setAdminProfile(user.name);
        
        setCategories(JSON.parse(localStorage.getItem('categories')) || []);
        setBrands(JSON.parse(localStorage.getItem('brands')) || []);
        setOrders(JSON.parse(localStorage.getItem('orders')) || []);
        
        // Load customers (users with role = 'USER')
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userCustomers = users.filter(u => u.role === 'USER');
        setCustomers(userCustomers);
        
        // Load flash sale data
        const flashSaleData = getFlashSale();
        setFlashSaleState(flashSaleData);
        setFlashSaleDiscountPercent(String(flashSaleData.discount_percent || 20));
        setFlashSaleStartTime(flashSaleData.start_time ? flashSaleData.start_time.substring(0, 16) : '');
        setFlashSaleEndTime(flashSaleData.end_time ? flashSaleData.end_time.substring(0, 16) : '');
        setFlashSaleSelectedProducts(flashSaleData.product_ids || []);
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
        setFlashSaleState(updatedFlashSale);
        alert("Cập nhật Flash Sale thành công!");
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
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'orders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('orders'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-shopping-cart"></i>{isSidebarOpen && ' Quản lý Đơn hàng'}</a></li>
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
                        <h2>Quản lý Đơn hàng</h2>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Mã Đơn</th><th>Tổng tiền</th><th>Thanh toán</th><th>Tình trạng</th><th>Hành động</th></tr>
                            </thead>
                            <tbody>
                                {[...orders].reverse().map(o => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td>
                                        <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(o.total_amount)}</td>
                                        <td>{o.payment_method === 'ONLINE' ? 'Chuyển khoản (QR)' : 'Tiền mặt (COD)'}</td>
                                        <td>
                                            <span style={{ padding: '5px 10px', borderRadius: '4px', background: o.status === 'PENDING' ? '#f39c12' : '#27ae60', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td>
                                            {o.status === 'PENDING' ? (
                                                <button className="action-btn" style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => updateOrderStatus(o.id, 'CONFIRMED')}><i className="fas fa-check"></i> Duyệt Đơn</button>
                                            ) : (
                                                <span style={{ color: '#7f8c8d' }}>Đã xử lý</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có đơn hàng nào</td></tr>}
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
                                        <td>{new Date(c.created_at || Date.now()).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                                {customers.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chưa có khách hàng nào</td></tr>}
                            </tbody>
                        </table>
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
