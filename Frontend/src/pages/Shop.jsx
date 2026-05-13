import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDB, getMainImage, formatMoney, addToCart, dbBrands, getFlashSaleDiscountForProduct, getItemsPerPage } from '../utils/mockData';

const Shop = () => {
    const [searchParams] = useSearchParams();
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // Filters state
    const [categories, setCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState('all');
    const [sortOption, setSortOption] = useState('default');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPageState] = useState(6);

    useEffect(() => {
        const dbData = getDB();
        setAllProducts(dbData);
        
        // Load itemsPerPage from settings
        const storedItemsPerPage = getItemsPerPage();
        setItemsPerPageState(storedItemsPerPage);
        
        // Handle initial category from URL (e.g. ?cat=1)
        const catQ = searchParams.get('cat');
        if (catQ) {
            setCategories([catQ]);
        }
    }, [searchParams]);

    useEffect(() => {
        applyFilters();
    }, [allProducts, categories, selectedBrands, priceRange, sortOption]);

    // Lấy danh sách brands phù hợp với category đã chọn
    const getAvailableBrands = () => {
        if (categories.length === 0) return dbBrands;
        
        const categoryMap = { '1': 'laptop', '2': 'component' };
        const types = categories.map(cat => categoryMap[cat]).filter(Boolean);
        
        return dbBrands.filter(brand => 
            types.some(type => brand.type === type || brand.type === 'both')
        );
    };

    const applyFilters = () => {
        let filtered = [...allProducts];

        // Search Query (e.g. ?q=laptop)
        const query = searchParams.get('q');
        if (query) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        }

        if (categories.length > 0) {
            filtered = filtered.filter(p => categories.includes(p.category_id.toString()));
        }

        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.includes(p.brand_id.toString()));
        }

        if (priceRange !== 'all') {
            if (priceRange === 'under10') filtered = filtered.filter(p => p.price < 10000000);
            if (priceRange === '10to20') filtered = filtered.filter(p => p.price >= 10000000 && p.price <= 20000000);
            if (priceRange === 'over20') filtered = filtered.filter(p => p.price > 20000000);
        }

        if (sortOption === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        if (sortOption === 'price-desc') filtered.sort((a, b) => b.price - a.price);

        setFilteredProducts(filtered);
        setCurrentPage(1); // reset to page 1 on filter
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setCategories(prev => 
            e.target.checked ? [...prev, val] : prev.filter(c => c !== val)
        );
        // Reset selected brands khi thay đổi category
        setSelectedBrands([]);
    };

    const handleBrandChange = (e) => {
        const val = e.target.value;
        setSelectedBrands(prev => 
            e.target.checked ? [...prev, val] : prev.filter(b => b !== val)
        );
    };

    // Pagination Calculation
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

    return (
        <div className="container shop-container">
            <aside className="sidebar">
                <div className="filter-group">
                    <h3>Danh mục</h3>
                    <label className="filter-item">
                        <input type="checkbox" value="1" onChange={handleCategoryChange} checked={categories.includes("1")} /> Laptop
                    </label>
                    <label className="filter-item">
                        <input type="checkbox" value="2" onChange={handleCategoryChange} checked={categories.includes("2")} /> Linh kiện PC
                    </label>
                </div>

                <div className="filter-group">
                    <h3>Thương hiệu</h3>
                    {getAvailableBrands().map(brand => (
                        <label key={brand.id} className="filter-item">
                            <input 
                                type="checkbox" 
                                value={brand.id} 
                                onChange={handleBrandChange} 
                                checked={selectedBrands.includes(brand.id.toString())}
                                disabled={categories.length === 0}
                            /> {brand.name}
                        </label>
                    ))}
                    {categories.length === 0 && (
                        <p style={{ fontSize: '12px', color: '#888' }}>Chọn danh mục trước</p>
                    )}
                </div>

                <div className="filter-group">
                    <h3>Khoảng giá</h3>
                    <label className="filter-item">
                        <input type="radio" name="price" value="all" checked={priceRange === 'all'} onChange={e => setPriceRange(e.target.value)} /> Tất cả
                    </label>
                    <label className="filter-item">
                        <input type="radio" name="price" value="under10" checked={priceRange === 'under10'} onChange={e => setPriceRange(e.target.value)} /> Dưới 10 triệu
                    </label>
                    <label className="filter-item">
                        <input type="radio" name="price" value="10to20" checked={priceRange === '10to20'} onChange={e => setPriceRange(e.target.value)} /> 10 - 20 triệu
                    </label>
                    <label className="filter-item">
                        <input type="radio" name="price" value="over20" checked={priceRange === 'over20'} onChange={e => setPriceRange(e.target.value)} /> Trên 20 triệu
                    </label>
                </div>
            </aside>

            <section className="product-area">
                <div className="top-bar">
                    <div id="result-count">Đang hiển thị {currentProducts.length} trên {filteredProducts.length} sản phẩm</div>
                    <select id="sort-select" value={sortOption} onChange={e => setSortOption(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
                        <option value="default">Sắp xếp: Mặc định</option>
                        <option value="price-asc">Giá: Thấp đến Cao</option>
                        <option value="price-desc">Giá: Cao đến Thấp</option>
                    </select>
                </div>

                <div className="product-grid">
                    {currentProducts.map(p => {
                        const randomReviews = Math.floor(Math.random() * 90) + 10;
                        const discountPercent = getFlashSaleDiscountForProduct(p.id);
                        const salePrice = discountPercent > 0 ? Math.floor(p.price * (100 - discountPercent) / 100) : p.price;
                        const savedAmount = p.price - salePrice;

                        return (
                            <div className="product-card" key={p.id} style={{ position: 'relative' }}>
                                {discountPercent > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        zIndex: 10
                                    }}>
                                        -{discountPercent}%
                                    </div>
                                )}
                                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <img src={getMainImage(p)} alt={p.name} />
                                    <div className="product-title">{p.name}</div>
                                    <div>
                                        {discountPercent > 0 ? (
                                            <div>
                                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', marginRight: '8px' }}>
                                                    {formatMoney(p.price)}
                                                </span>
                                                <span className="price" style={{ color: '#e74c3c', fontWeight: 'bold' }}>{formatMoney(salePrice)}</span>
                                                <div style={{ fontSize: '12px', color: '#27ae60', fontWeight: 'bold', marginTop: '4px' }}>
                                                    Tiết kiệm: {formatMoney(savedAmount)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="price">{formatMoney(p.price)}</div>
                                        )}
                                    </div>
                                    
                                    <div style={{ color: '#f39c12', fontSize: '13px', margin: '8px 0' }}>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star-half-alt"></i> 
                                        <span style={{ color: '#777', fontSize: '12px', marginLeft: '5px' }}>({randomReviews} đánh giá)</span>
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: p.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                                        {p.stock > 0 ? `Còn ${p.stock} sản phẩm` : 'Hết hàng'}
                                    </div>
                                </Link>
                                
                                <button 
                                    className="add-to-cart-btn" 
                                    onClick={() => p.stock > 0 && addToCart(p.id)} 
                                    disabled={p.stock === 0}
                                    style={{ width: '100%', padding: '8px', marginTop: '10px', fontWeight: 'bold', opacity: p.stock === 0 ? 0.5 : 1, cursor: p.stock === 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    <i className="fas fa-cart-plus"></i> {p.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button 
                                key={page} 
                                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                                onClick={() => { setCurrentPage(page); window.scrollTo(0,0); }}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Shop;
