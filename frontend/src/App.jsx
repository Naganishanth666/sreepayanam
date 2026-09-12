import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { NotFoundPage } from './pages/AccessPages';

const routeTitles = {
  '/': 'SreePayanam | Travel Smarter. Journey Better.',
  '/about': 'About | SreePayanam',
  '/packages': 'Packages | SreePayanam',
  '/contact': 'Contact | SreePayanam',
  '/ai-assistant': 'Trip planner | SreePayanam',
  '/login': 'Log in | SreePayanam',
  '/bookings': 'Book services | SreePayanam',
  '/checkout': 'Checkout | SreePayanam',
  '/admin': 'Admin dashboard | SreePayanam'
};

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = routeTitles[location.pathname] || (location.pathname.startsWith('/package/') ? 'Package details | SreePayanam' : 'Page not found | SreePayanam');
    document.title = baseTitle;
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PageTitle />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Chatbot />
      </AuthProvider>
    </Router>
  );
}

export default App;
