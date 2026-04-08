import React, { useState, useEffect } from 'react';
import { getDB, setDB, getMainImage, formatMoney, dbBrands } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('products');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all'); // 'all' | '1' | '2'
    
    // Data state
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [orders, setOrders] = useState([]);

    // Form state
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState('1'); 
    const [formBrand, setFormBrand] = useState('1');
    const [formPrice, setFormPrice] = useState('');
    const [formStock, setFormStock] = useState('10');
    const [formImg, setFormImg] = useState('');        // base64 data URL
    const [formImgPreview, setFormImgPreview] = useState(''); // for preview
    const [adminProfile, setAdminProfile] = useState("Admin");
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
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

    const updateOrderStatus = (orderId, newStatus) => {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
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
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: formName,
            category_id: parseInt(formCategory),
            brand_id: parseInt(formBrand),
            price: parseInt(formPrice),
            stock: parseInt(formStock),
            status: "ACTIVE",
            images: [
                {
                    id: Date.now(),
                    image_url: formImg || 'https://placehold.co/300x200?text=No+Image',
                    is_main: true
                }
            ],
            specs: [] 
        };

        const updated = [...products, newProduct];
        setProducts(updated);
        setDB(updated);
        
        // Reset and close
        setFormName('');
        setFormCategory('1');
        setFormBrand('1');
        setFormPrice('');
        setFormStock('10');
        setFormImg('');
        setFormImgPreview('');
        setIsModalOpen(false);
        setCurrentPage(1);
        alert("Thêm sản phẩm thành công!");
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
                    <li><a href="#" className="admin-nav-item" style={{ whiteSpace: 'nowrap' }}><i className="fas fa-tachometer-alt"></i>{isSidebarOpen && ' Tổng quan'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'products' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('products'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-box"></i>{isSidebarOpen && ' Quản lý Sản phẩm'}</a></li>
                    <li><a href="#" className={`admin-nav-item ${currentTab === 'orders' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentTab('orders'); }} style={{ whiteSpace: 'nowrap' }}><i className="fas fa-shopping-cart"></i>{isSidebarOpen && ' Quản lý Đơn hàng'}</a></li>
                    <li><a href="#" className="admin-nav-item" style={{ whiteSpace: 'nowrap' }}><i className="fas fa-users"></i>{isSidebarOpen && ' Khách hàng'}</a></li>
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
                                        <td>
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
            </main>

            <div className={`modal ${isModalOpen ? 'active' : ''}`}>
                <div className="modal-content">
                    <span className="close-modal" onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></span>
                    <h3 style={{ marginBottom: '20px' }}>Thêm Sản Phẩm Mới</h3>
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
                        <button type="submit" className="btn-submit">Lưu Sản Phẩm</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Admin;
