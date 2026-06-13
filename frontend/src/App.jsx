import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import AiAssistant from './pages/AiAssistant';
import AboutUs from './pages/AboutUs';
import Packages from './pages/Packages';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import PackageDetails from './pages/PackageDetails';
import Bookings from './pages/Bookings';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/about"        element={<AboutUs />} />
          <Route path="/packages"     element={<Packages />} />
          <Route path="/package/:id"  element={<PackageDetails />} />
          <Route path="/contact"      element={<ContactUs />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/login"        element={<Login />} />

          {/* Protected: Any logged-in user */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />

          {/* Admin Page — keeps its own password gate inside the component */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Chatbot />
      </AuthProvider>
    </Router>
  );
}

export default App;
