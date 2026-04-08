export const dbCategories = [
    { id: 1, name: "Laptop", parent_id: null },
    { id: 2, name: "Linh kiện PC", parent_id: null }
];

export const dbBrands = [
    { id: 1, name: "Apple", type: "laptop" },
    { id: 2, name: "MSI", type: "component" },
    { id: 3, name: "Corsair", type: "component" },
    { id: 4, name: "Asus", type: "both" },
    { id: 5, name: "Kingston", type: "component" }
];

const defaultProducts = [
    { 
        id: 1, 
        name: "MacBook Air M1 2020", 
        description: "Chiếc laptop mỏng nhẹ, pin trâu với sức mạnh đột phá từ chip M1.",
        price: 18990000, 
        stock: 50,
        category_id: 1,
        brand_id: 1,
        status: "ACTIVE",
        images: [
            { id: 1, image_url: "https://placehold.co/600x400/eee/333?text=MacBook+Main", is_main: true },
            { id: 2, image_url: "https://placehold.co/600x400/ddd/222?text=MacBook+Side", is_main: false }
        ],
        specs: [
            { id: 1, spec_key: "CPU", spec_value: "Apple M1 8-core" },
            { id: 2, spec_key: "RAM", spec_value: "8GB Unified Memory" },
            { id: 3, spec_key: "Ổ cứng", spec_value: "256GB SSD" }
        ]
    },
    { 
        id: 2, 
        name: "VGA MSI RTX 4060 Ti Ventus 2X 8GB", 
        description: "Card màn hình kiến trúc Ada Lovelace, hỗ trợ DLSS 3 chiến mượt mọi game.",
        price: 10500000, 
        stock: 15,
        category_id: 2,
        brand_id: 2,
        status: "ACTIVE",
        images: [
            { id: 3, image_url: "https://placehold.co/600x400/eee/333?text=VGA+Main", is_main: true }
        ],
        specs: [
            { id: 4, spec_key: "GPU", spec_value: "NVIDIA GeForce RTX 4060 Ti" },
            { id: 5, spec_key: "VRAM", spec_value: "8GB GDDR6" }
        ]
    },
    { 
        id: 3, 
        name: "RAM Corsair Vengeance LPX 16GB DDR4", 
        description: "RAM hiệu năng cao dành cho PC Gaming.",
        price: 950000, 
        stock: 100,
        category_id: 2,
        brand_id: 3,
        status: "ACTIVE",
        images: [
            { id: 4, image_url: "https://placehold.co/600x400/eee/333?text=RAM+Corsair", is_main: true }
        ],
        specs: [
            { id: 6, spec_key: "Chuẩn RAM", spec_value: "DDR4" },
            { id: 7, spec_key: "Bus", spec_value: "3200MHz" }
        ]
    },
    { 
        id: 4, 
        name: "Laptop Asus ROG Strix G15", 
        description: "Laptop gaming cực đỉnh với cấu hình khủng.",
        price: 25000000, 
        stock: 20,
        category_id: 1,
        brand_id: 4,
        status: "ACTIVE",
        images: [
            { id: 5, image_url: "https://placehold.co/600x400/eee/333?text=Asus+ROG", is_main: true }
        ],
        specs: [
            { id: 8, spec_key: "CPU", spec_value: "Intel Core i7-12700H" },
            { id: 9, spec_key: "VGA", spec_value: "RTX 3060 6GB" }
        ]
    },
    {
        id: 5,
        name: "MacBook Pro M3 14 inch",
        description: "Hiệu năng chuyên nghiệp với chip M3 Pro, màn hình Liquid Retina XDR.",
        price: 42990000,
        stock: 12,
        category_id: 1,
        brand_id: 1,
        status: "ACTIVE",
        images: [{ id: 10, image_url: "https://placehold.co/600x400/eee/333?text=MacBook+Pro+M3", is_main: true }],
        specs: [
            { id: 10, spec_key: "CPU", spec_value: "Apple M3 Pro 12-core" },
            { id: 11, spec_key: "RAM", spec_value: "18GB Unified Memory" },
            { id: 12, spec_key: "Ổ cứng", spec_value: "512GB SSD" }
        ]
    },
    {
        id: 6,
        name: "Laptop Dell XPS 15 9530",
        description: "Laptop cao cấp cho dân sáng tạo nội dung, màn hình OLED 3.5K tuyệt đẹp.",
        price: 38000000,
        stock: 8,
        category_id: 1,
        brand_id: 1,
        status: "ACTIVE",
        images: [{ id: 11, image_url: "https://placehold.co/600x400/eee/333?text=Dell+XPS+15", is_main: true }],
        specs: [
            { id: 13, spec_key: "CPU", spec_value: "Intel Core i7-13700H" },
            { id: 14, spec_key: "RAM", spec_value: "16GB DDR5" },
            { id: 15, spec_key: "Ổ cứng", spec_value: "512GB SSD" }
        ]
    },
    {
        id: 7,
        name: "Laptop Lenovo ThinkPad X1 Carbon Gen 11",
        description: "Laptop doanh nhân hàng đầu, siêu nhẹ chỉ 1.12kg, pin 15 giờ.",
        price: 35000000,
        stock: 6,
        category_id: 1,
        brand_id: 2,
        status: "ACTIVE",
        images: [{ id: 12, image_url: "https://placehold.co/600x400/eee/333?text=ThinkPad+X1", is_main: true }],
        specs: [
            { id: 16, spec_key: "CPU", spec_value: "Intel Core i7-1365U" },
            { id: 17, spec_key: "RAM", spec_value: "16GB LPDDR5" },
            { id: 18, spec_key: "Màn hình", spec_value: "14 inch 2.8K OLED" }
        ]
    },
    {
        id: 8,
        name: "CPU Intel Core i9-13900K",
        description: "Vi xử lý máy tính bàn cao cấp thế hệ 13, 24 nhân 32 luồng.",
        price: 14500000,
        stock: 30,
        category_id: 2,
        brand_id: 2,
        status: "ACTIVE",
        images: [{ id: 13, image_url: "https://placehold.co/600x400/eee/333?text=Intel+i9-13900K", is_main: true }],
        specs: [
            { id: 19, spec_key: "Nhân/Luồng", spec_value: "24 nhân / 32 luồng" },
            { id: 20, spec_key: "Xung nhịp", spec_value: "3.0GHz (Boost 5.8GHz)" }
        ]
    },
    {
        id: 9,
        name: "SSD Samsung 990 Pro 2TB NVMe M.2",
        description: "Ổ cứng SSD tốc độ cao nhất từ Samsung, đọc/ghi lên đến 7450/6900 MB/s.",
        price: 3200000,
        stock: 75,
        category_id: 2,
        brand_id: 3,
        status: "ACTIVE",
        images: [{ id: 14, image_url: "https://placehold.co/600x400/eee/333?text=Samsung+990+Pro", is_main: true }],
        specs: [
            { id: 21, spec_key: "Dung lượng", spec_value: "2TB" },
            { id: 22, spec_key: "Giao tiếp", spec_value: "NVMe PCIe 4.0 x4" }
        ]
    },
    {
        id: 10,
        name: "VGA Asus ROG Strix RTX 4090 OC 24GB",
        description: "Card đồ họa mạnh nhất thế giới, chinh phục mọi tựa game 4K.",
        price: 42000000,
        stock: 5,
        category_id: 2,
        brand_id: 4,
        status: "ACTIVE",
        images: [{ id: 15, image_url: "https://placehold.co/600x400/eee/333?text=RTX+4090", is_main: true }],
        specs: [
            { id: 23, spec_key: "GPU", spec_value: "NVIDIA GeForce RTX 4090" },
            { id: 24, spec_key: "VRAM", spec_value: "24GB GDDR6X" }
        ]
    },
    {
        id: 11,
        name: "Laptop HP Spectre x360 14",
        description: "Laptop 2 trong 1 cao cấp, màn hình cảm ứng OLED, thiết kế lật 360 độ.",
        price: 32000000,
        stock: 9,
        category_id: 1,
        brand_id: 3,
        status: "ACTIVE",
        images: [{ id: 16, image_url: "https://placehold.co/600x400/eee/333?text=HP+Spectre+x360", is_main: true }],
        specs: [
            { id: 25, spec_key: "CPU", spec_value: "Intel Core Ultra 7 155H" },
            { id: 26, spec_key: "RAM", spec_value: "16GB LPDDR5" },
            { id: 27, spec_key: "Màn hình", spec_value: "14 inch 2.8K OLED Cảm ứng" }
        ]
    },
    {
        id: 12,
        name: "Mainboard Asus ROG Maximus Z790 Hero",
        description: "Bo mạch chủ cao cấp dành cho Core i9, hỗ trợ DDR5 và PCIe 5.0.",
        price: 18500000,
        stock: 10,
        category_id: 2,
        brand_id: 4,
        status: "ACTIVE",
        images: [{ id: 17, image_url: "https://placehold.co/600x400/eee/333?text=ASUS+Z790+Hero", is_main: true }],
        specs: [
            { id: 28, spec_key: "Socket", spec_value: "Intel LGA 1700" },
            { id: 29, spec_key: "RAM hỗ trợ", spec_value: "DDR5 up to 7800MHz" }
        ]
    }
];

export const getDB = () => {
    try {
        // So sánh số lượng: nếu bộ nhớ ít hơn defaultProducts => nạp lại
        let db = localStorage.getItem('globalProducts');
        if (!db) {
            localStorage.setItem('globalProducts', JSON.stringify(defaultProducts));
            return defaultProducts;
        }
        const parsed = JSON.parse(db);
        // Nếu DB cũ ít sản phẩm hơn defaultProducts (tức chưa có data mới), reset lại
        if (parsed.length < defaultProducts.length) {
            localStorage.setItem('globalProducts', JSON.stringify(defaultProducts));
            return defaultProducts;
        }
        return parsed;
    } catch {
        return defaultProducts;
    }
};

export const setDB = (products) => {
    localStorage.setItem('globalProducts', JSON.stringify(products));
};

export const getMainImage = (product) => {
    if (!product.images || product.images.length === 0) return "https://placehold.co/300x200?text=No+Image";
    const mainImg = product.images.find(img => img.is_main);
    return mainImg ? mainImg.image_url : product.images[0].image_url;
};

export const formatMoney = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
};

export const getCartKey = () => {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) return null;
    return `cartItems_${user.email}`;
};


export const addToCart = (productId) => {
    const cartKey = getCartKey();
    if (!cartKey) {
        alert("Vui lòng đăng nhập để sử dụng giỏ hàng!");
        // Cần redirect nhưng vì ở ngoài component React nên dùng window.location hoặc để component kia tự check
        return;
    }
    
    let cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
    const products = getDB();
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const exist = cartItems.find(i => i.id === productId);
    if (exist) {
        exist.quantity++;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated')); // Custom event for Header to catch
    alert("Đã thêm vào giỏ hàng!");
};

export const getFlashSale = () => {
    try {
        let flashSale = localStorage.getItem('flashSale');
        if (!flashSale) {
            // Default flash sale config
            const defaultFlashSale = {
                discount_percent: 20,
                start_time: new Date(Date.now()).toISOString(),
                end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 giờ từ bây giờ
                product_ids: [1, 2, 5] // IDs của sản phẩm trong flash sale
            };
            localStorage.setItem('flashSale', JSON.stringify(defaultFlashSale));
            return defaultFlashSale;
        }
        return JSON.parse(flashSale);
    } catch {
        return {
            discount_percent: 20,
            start_time: new Date(Date.now()).toISOString(),
            end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            product_ids: [1, 2, 5]
        };
    }
};

export const setFlashSale = (flashSaleData) => {
    localStorage.setItem('flashSale', JSON.stringify(flashSaleData));
};

export const getFlashSaleDiscountForProduct = (productId) => {
    const flashSale = getFlashSale();
    const now = new Date();
    const startTime = new Date(flashSale.start_time);
    const endTime = new Date(flashSale.end_time);
    
    // Kiểm tra xem hiện tại có trong khoảng thời gian flash sale không
    if (now >= startTime && now < endTime && flashSale.product_ids.includes(productId)) {
        return flashSale.discount_percent;
    }
    return 0; // Không có discount
};

// ===== Multi-Session Management =====
export const getActiveUser = () => {
    const currentUser = sessionStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
};

export const setActiveUser = (email) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify({
            name: user.full_name,
            email: user.email,
            role: user.role
        }));
        return true;
    }
    return false;
};

export const getLoggedInUsers = () => {
    const loggedInStr = localStorage.getItem('loggedInUsers');
    return loggedInStr ? JSON.parse(loggedInStr) : [];
};

export const addLoggedInUser = (user) => {
    const loggedInUsers = getLoggedInUsers();
    const exists = loggedInUsers.find(u => u.email === user.email);
    if (!exists) {
        loggedInUsers.push({
            name: user.full_name,
            email: user.email,
            role: user.role
        });
        localStorage.setItem('loggedInUsers', JSON.stringify(loggedInUsers));
    }
    // Set as active user in sessionStorage (per-tab)
    sessionStorage.setItem('currentUser', JSON.stringify({
        name: user.full_name,
        email: user.email,
        role: user.role
    }));
};

export const removeLoggedInUser = (email) => {
    let loggedInUsers = getLoggedInUsers();
    loggedInUsers = loggedInUsers.filter(u => u.email !== email);
    localStorage.setItem('loggedInUsers', JSON.stringify(loggedInUsers));
    
    // If removed user was active, switch to first logged in user
    const currentUser = getActiveUser();
    if (currentUser?.email === email) {
        if (loggedInUsers.length > 0) {
            localStorage.setItem('currentUser', JSON.stringify(loggedInUsers[0]));
        } else {
            localStorage.removeItem('currentUser');
        }
    }
};

export const getSwitchableUsers = () => {
    return getLoggedInUsers();
};

const defaultUsers = [
    { id: 101, email: "khachhang1@gmail.com", password: "123", full_name: "Khách Hàng Vip", role: "USER", status: "ACTIVE" },
    { id: 102, email: "khachhang2@gmail.com", password: "123", full_name: "Thượng Đế Mua Hàng", role: "USER", status: "ACTIVE" },
    { id: 103, email: "admin@gmail.com", password: "admin", full_name: "Quản Trị Viên", role: "ADMIN", status: "ACTIVE" }
];

const initMockData = () => {
    // 1. Khởi tạo và nạp user mẫu vào mảng users nếu chưa có
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
        if (!Array.isArray(users)) users = [];
    } catch {
        users = [];
    }

    const hasUser1 = users.find(u => u.email === defaultUsers[0].email);
    if (!hasUser1) users.push(defaultUsers[0]);

    const hasUser2 = users.find(u => u.email === defaultUsers[1].email);
    if (!hasUser2) users.push(defaultUsers[1]);

    const hasAdmin = users.find(u => u.email === defaultUsers[2].email);
    if (!hasAdmin) users.push(defaultUsers[2]);

    localStorage.setItem('users', JSON.stringify(users));
    
    // 2. Tạo sẵn giỏ hàng cho khachhang1@gmail.com
    if (!localStorage.getItem('cartItems_khachhang1@gmail.com')) {
        const cart1 = [
            { ...defaultProducts[0], quantity: 1 },
            { ...defaultProducts[2], quantity: 2 }
        ];
        localStorage.setItem('cartItems_khachhang1@gmail.com', JSON.stringify(cart1));
    }

    // 3. Tạo sẵn giỏ hàng cho khachhang2@gmail.com
    if (!localStorage.getItem('cartItems_khachhang2@gmail.com')) {
        const cart2 = [
            { ...defaultProducts[3], quantity: 1 }
        ];
        localStorage.setItem('cartItems_khachhang2@gmail.com', JSON.stringify(cart2));
    }
    
    // 4. Các bảng relational khác
    if (!localStorage.getItem('categories')) localStorage.setItem('categories', JSON.stringify(dbCategories));
    if (!localStorage.getItem('brands')) localStorage.setItem('brands', JSON.stringify(dbBrands));
    if (!localStorage.getItem('addresses')) localStorage.setItem('addresses', JSON.stringify([]));
    if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
    if (!localStorage.getItem('order_items')) localStorage.setItem('order_items', JSON.stringify([]));
    if (!localStorage.getItem('payments')) localStorage.setItem('payments', JSON.stringify([]));
};

// Gọi ngay khi file mockData được load để nạp dữ liệu rỗng cho máy người dùng mới
initMockData();
