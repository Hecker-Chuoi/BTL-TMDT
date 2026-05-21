import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { initTestReviewData } from './utils/initTestData';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize test review data on app load
    initTestReviewData();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
