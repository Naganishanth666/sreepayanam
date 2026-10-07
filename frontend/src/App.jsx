import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Services from './pages/Services';
import { Blogs, Brochures } from './pages/BlogsBrochures';
import SavedRoute from './pages/SavedRoute';
import { NotFoundPage } from './pages/AccessPages';

const routeTitles = {
  '/': 'SreePayanam | Travel Smarter. Journey Better.',
  '/about': 'About | SreePayanam',
  '/packages': 'Packages | SreePayanam',
  '/contact': 'Contact | SreePayanam',
  '/ai-assistant': 'Trip planner | SreePayanam',
  '/login': 'Log in | SreePayanam',
  '/bookings': 'Book services | SreePayanam',
  '/services': 'Travel services | SreePayanam',
  '/blogs': 'Travel articles | SreePayanam',
  '/brochures': 'Brochures | SreePayanam',
  '/route': 'Find your itinerary | SreePayanam',
  '/admin': 'Admin dashboard | SreePayanam'
};

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = routeTitles[location.pathname] || (location.pathname.startsWith('/route/') ? 'Find your itinerary | SreePayanam' : location.pathname.startsWith('/package/') ? 'Package details | SreePayanam' : location.pathname.startsWith('/services/') ? 'Travel service | SreePayanam' : 'Page not found | SreePayanam');
    document.title = baseTitle;
  }, [location.pathname]);

  return null;
};

const PageScroll = () => {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const timer = window.setTimeout(() => {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);
  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PageTitle />
        <PageScroll />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/about"        element={<AboutUs />} />
          <Route path="/packages"     element={<Packages />} />
          <Route path="/package/:id"  element={<PackageDetails />} />
          <Route path="/contact"      element={<ContactUs />} />
          <Route path="/services"     element={<Services />} />
          <Route path="/blogs"        element={<Blogs />} />
          <Route path="/brochures"    element={<Brochures />} />
          <Route path="/route"        element={<SavedRoute />} />
          <Route path="/route/:reference" element={<SavedRoute />} />
          <Route path="/services/:slug" element={<Services />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/login"        element={<Login />} />

          {/* Protected: Any logged-in user */}
          <Route path="/checkout" element={<Navigate to="/packages" replace />} />
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
