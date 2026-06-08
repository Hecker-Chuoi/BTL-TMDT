import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SupportWidget from '../components/SupportWidget';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="layout">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
};

export default MainLayout;
