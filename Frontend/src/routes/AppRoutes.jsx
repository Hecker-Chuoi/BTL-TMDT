import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import OrderStatus from '../pages/OrderStatus';
import UserOrders from '../pages/UserOrders';
import Login from '../pages/Login';
import Admin from '../pages/Admin';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="order-status/:orderId" element={<OrderStatus />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        {/* Route quản trị có thể tách Layout riêng nếu cần sau này */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
