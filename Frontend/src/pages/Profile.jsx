import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getUserWithEmail, 
    updateUserProfile,
    getUserAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
} from '../utils/mockData';

const Profile = () => {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [addresses, setAddresses] = useState([]);

    // Profile edit state
    const [editProfile, setEditProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileErrors, setProfileErrors] = useState({});

    // Address form state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressFormData, setAddressFormData] = useState({
        receiver_name: '',
        phone: '',
        address_line: '',
        city: '',
        district: '',
        ward: '',
        is_default: false
    });
    const [addressErrors, setAddressErrors] = useState({});

    // Load user data
    useEffect(() => {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const userData = getUserWithEmail(currentUser.email);
        if (!userData) {
            navigate('/login');
            return;
        }

        setUser(userData);
        setUserId(userData.id);
        setProfileData({
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone || ''
        });

        // Load addresses
        const userAddresses = getUserAddresses(userData.id);
        setAddresses(userAddresses);
    }, [navigate]);

    // Validate password
    const validatePassword = (password) => {
        if (!password) return '';
        if (password.length < 8) return 'Mật khẩu phải ít nhất 8 kí tự';
        if (!/[a-z]/.test(password)) return 'Phải chứa chữ cái thường';
        if (!/[A-Z]/.test(password)) return 'Phải chứa chữ cái hoa';
        if (!/[0-9]/.test(password)) return 'Phải chứa chữ số';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Phải chứa kí tự đặc biệt';
        return '';
    };

    const handleProfileSave = (e) => {
        e.preventDefault();
        const errors = {};

        if (!profileData.full_name.trim() || profileData.full_name.trim().length < 3) {
            errors.full_name = 'Họ tên phải ít nhất 3 kí tự';
        }

        if (profileData.email !== user.email) {
            const existingUser = getUserWithEmail(profileData.email);
            if (existingUser) {
                errors.email = 'Email này đã được sử dụng';
            }
        }

        if (newPassword) {
            if (!oldPassword) {
                errors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
            } else if (oldPassword !== user.password) {
                errors.oldPassword = 'Mật khẩu cũ không chính xác';
            }

            const pwdError = validatePassword(newPassword);
            if (pwdError) {
                errors.password = pwdError;
            }

            if (newPassword !== confirmPassword) {
                errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            }
        }

        setProfileErrors(errors);

        if (Object.keys(errors).length > 0) return;

        const updateData = {
            full_name: profileData.full_name,
            email: profileData.email,
            phone: profileData.phone
        };

        if (newPassword) {
            updateData.password = newPassword;
        }

        const updatedUser = updateUserProfile(userId, updateData);
        setUser(updatedUser);
        setProfileData({
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            phone: updatedUser.phone || ''
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditProfile(false);
        setProfileErrors({});
        alert('Cập nhật thông tin thành công!');
    };

    // Address validation
    const validateAddressForm = () => {
        const errors = {};

        if (!addressFormData.receiver_name.trim()) {
            errors.receiver_name = 'Tên người nhận không được để trống';
        }

        if (!addressFormData.phone.trim() || !/^[0-9]{10,11}$/.test(addressFormData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!addressFormData.address_line.trim()) {
            errors.address_line = 'Địa chỉ không được để trống';
        }

        if (!addressFormData.city) {
            errors.city = 'Tỉnh/Thành phố không được để trống';
        }

        if (!addressFormData.district) {
            errors.district = 'Quận/Huyện không được để trống';
        }

        if (!addressFormData.ward) {
            errors.ward = 'Phường/Xã không được để trống';
        }

        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddressSave = (e) => {
        e.preventDefault();

        if (!validateAddressForm()) return;

        if (editingAddressId) {
            const updated = updateAddress(userId, editingAddressId, addressFormData);
            setAddresses(getUserAddresses(userId));
            setEditingAddressId(null);
            alert('Cập nhật địa chỉ thành công!');
        } else {
            addAddress(userId, addressFormData);
            setAddresses(getUserAddresses(userId));
            alert('Thêm địa chỉ thành công!');
        }

        resetAddressForm();
    };

    const resetAddressForm = () => {
        setAddressFormData({
            receiver_name: '',
            phone: '',
            address_line: '',
            city: '',
            district: '',
            ward: '',
            is_default: false
        });
        setAddressErrors({});
        setShowAddressForm(false);
    };

    const handleEditAddress = (address) => {
        setAddressFormData(address);
        setEditingAddressId(address.id);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = (addressId) => {
        if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
            deleteAddress(userId, addressId);
            setAddresses(getUserAddresses(userId));
            alert('Xóa địa chỉ thành công!');
        }
    };

    const handleSetDefault = (addressId) => {
        setDefaultAddress(userId, addressId);
        setAddresses(getUserAddresses(userId));
    };

    if (!user) {
        return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div className="container" style={{ padding: '30px 0', minHeight: 'calc(100vh - 200px)' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Sidebar */}
                <aside style={{ flex: '0 0 250px' }}>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0 }}>Quản lý tài khoản</h3>
                        <button
                            onClick={() => setCurrentTab('profile')}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px',
                                margin: '10px 0',
                                border: 'none',
                                borderRadius: '4px',
                                background: currentTab === 'profile' ? 'var(--primary-color)' : '#f0f0f0',
                                color: currentTab === 'profile' ? 'white' : '#333',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: currentTab === 'profile' ? 'bold' : 'normal'
                            }}
                        >
                            <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                            Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setCurrentTab('addresses')}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px',
                                margin: '10px 0',
                                border: 'none',
                                borderRadius: '4px',
                                background: currentTab === 'addresses' ? 'var(--primary-color)' : '#f0f0f0',
                                color: currentTab === 'addresses' ? 'white' : '#333',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: currentTab === 'addresses' ? 'bold' : 'normal'
                            }}
                        >
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                            Địa chỉ giao hàng
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1 }}>
                    {/* Profile Tab */}
                    {currentTab === 'profile' && (
                        <div style={{ background: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ marginTop: 0 }}>Thông tin cá nhân</h2>

                            {!editProfile ? (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#666', marginBottom: '5px' }}>Họ và tên</label>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>{user.full_name}</p>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#666', marginBottom: '5px' }}>Email</label>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>{user.email}</p>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', color: '#666', marginBottom: '5px' }}>Số điện thoại</label>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>{user.phone || 'Chưa cập nhật'}</p>
                                    </div>

                                    <button
                                        onClick={() => setEditProfile(true)}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'var(--primary-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <i className="fas fa-edit" style={{ marginRight: '8px' }}></i>
                                        Chỉnh sửa
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleProfileSave}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Họ và tên</label>
                                        <input
                                            type="text"
                                            value={profileData.full_name}
                                            onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: `1px solid ${profileErrors.full_name ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {profileErrors.full_name && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{profileErrors.full_name}</span>}
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: `1px solid ${profileErrors.email ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {profileErrors.email && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{profileErrors.email}</span>}
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                            placeholder="VD: 0901234567"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <hr style={{ margin: '30px 0' }} />

                                    <h3>Đổi mật khẩu</h3>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={e => setOldPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu hiện tại để đổi mật khẩu"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: `1px solid ${profileErrors.oldPassword ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                opacity: newPassword ? 1 : 0.6
                                            }}
                                            // disabled={!newPassword}
                                        />
                                        {profileErrors.oldPassword && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{profileErrors.oldPassword}</span>}
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu mới (tùy chọn)</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Để trống nếu không muốn đổi"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: `1px solid ${profileErrors.password ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {profileErrors.password && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{profileErrors.password}</span>}
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Xác nhận mật khẩu</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            disabled={!newPassword}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: `1px solid ${profileErrors.confirmPassword ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                opacity: newPassword ? 1 : 0.6
                                            }}
                                        />
                                        {profileErrors.confirmPassword && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{profileErrors.confirmPassword}</span>}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '10px 20px',
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
                                            Lưu thay đổi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditProfile(false);
                                                setProfileData({
                                                    full_name: user.full_name,
                                                    email: user.email,
                                                    phone: user.phone || ''
                                                });
                                                setOldPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setProfileErrors({});
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                background: '#f0f0f0',
                                                color: '#333',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {currentTab === 'addresses' && (
                        <div style={{ background: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h2 style={{ margin: 0 }}>Địa chỉ giao hàng</h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        style={{
                                            padding: '10px 20px',
                                            background: 'var(--primary-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                                        Thêm địa chỉ
                                    </button>
                                )}
                            </div>

                            {/* Address Form */}
                            {showAddressForm && (
                                <form onSubmit={handleAddressSave} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                                    <h3>{editingAddressId ? 'Chỉnh sửa' : 'Thêm'} địa chỉ</h3>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tên người nhận *</label>
                                        <input
                                            type="text"
                                            value={addressFormData.receiver_name}
                                            onChange={e => setAddressFormData({ ...addressFormData, receiver_name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: `1px solid ${addressErrors.receiver_name ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {addressErrors.receiver_name && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{addressErrors.receiver_name}</span>}
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Số điện thoại *</label>
                                        <input
                                            type="tel"
                                            value={addressFormData.phone}
                                            onChange={e => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                                            placeholder="0901234567"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: `1px solid ${addressErrors.phone ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {addressErrors.phone && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{addressErrors.phone}</span>}
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Địa chỉ chi tiết *</label>
                                        <input
                                            type="text"
                                            value={addressFormData.address_line}
                                            onChange={e => setAddressFormData({ ...addressFormData, address_line: e.target.value })}
                                            placeholder="VD: 123 Nguyễn Văn A"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: `1px solid ${addressErrors.address_line ? '#e74c3c' : '#ccc'}`,
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        {addressErrors.address_line && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{addressErrors.address_line}</span>}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tỉnh/Thành phố *</label>
                                            <input
                                                type="text"
                                                value={addressFormData.city}
                                                onChange={e => setAddressFormData({ ...addressFormData, city: e.target.value })}
                                                placeholder="Tỉnh/Thành phố"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: `1px solid ${addressErrors.city ? '#e74c3c' : '#ccc'}`,
                                                    borderRadius: '4px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            {addressErrors.city && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{addressErrors.city}</span>}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Quận/Huyện *</label>
                                            <input
                                                type="text"
                                                value={addressFormData.district}
                                                onChange={e => setAddressFormData({ ...addressFormData, district: e.target.value })}
                                                placeholder="Quận/Huyện"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: `1px solid ${addressErrors.district ? '#e74c3c' : '#ccc'}`,
                                                    borderRadius: '4px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            {addressErrors.district && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{addressErrors.district}</span>}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phường/Xã *</label>
                                            <input
                                                type="text"
                                                value={addressFormData.ward}
                                                onChange={e => setAddressFormData({ ...addressFormData, ward: e.target.value })}
                                                placeholder="Phường/Xã"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: `1px solid ${addressErrors.ward ? '#e74c3c' : '#ccc'}`,
                                                    borderRadius: '4px',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            {addressErrors.ward && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{addressErrors.ward}</span>}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={addressFormData.is_default}
                                                onChange={e => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                                            />
                                            <span>Đặt làm địa chỉ mặc định</span>
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <i className="fas fa-save" style={{ marginRight: '5px' }}></i>
                                            Lưu
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetAddressForm}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#f0f0f0',
                                                color: '#333',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Addresses List */}
                            {addresses.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#999' }}>Chưa có địa chỉ nào. Hãy thêm địa chỉ giao hàng.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {addresses.map(address => (
                                        <div
                                            key={address.id}
                                            style={{
                                                border: `2px solid ${address.is_default ? 'var(--primary-color)' : '#ddd'}`,
                                                borderRadius: '8px',
                                                padding: '15px',
                                                position: 'relative'
                                            }}
                                        >
                                            {address.is_default && (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    background: 'var(--primary-color)',
                                                    color: 'white',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Mặc định
                                                </span>
                                            )}

                                            <div style={{ marginBottom: '10px' }}>
                                                <strong>{address.receiver_name}</strong> | {address.phone}
                                            </div>

                                            <div style={{ color: '#666', marginBottom: '10px' }}>
                                                {address.address_line}, {address.ward}, {address.district}, {address.city}
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleEditAddress(address)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: 'var(--primary-color)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <i className="fas fa-edit"></i> Sửa
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i> Xóa
                                                </button>

                                                {!address.is_default && (
                                                    <button
                                                        onClick={() => handleSetDefault(address.id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#27ae60',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <i className="fas fa-check"></i> Đặt mặc định
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Profile;
