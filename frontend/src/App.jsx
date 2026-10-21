import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import SiteMetadata from './components/SiteMetadata';

import LandingPage from './pages/LandingPage';
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

const AdminPage = lazy(() => import('./pages/AdminPage'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const PageLoading = () => <main className="page-container"><div className="container"><p role="status">Loading page…</p></div></main>;

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
        <SiteMetadata />
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
          <Route path="/ai-assistant" element={<Suspense fallback={<PageLoading />}><AiAssistant /></Suspense>} />
          <Route path="/login"        element={<Login />} />

          {/* Protected: Any logged-in user */}
          <Route path="/checkout" element={<Navigate to="/packages" replace />} />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />

          {/* Admin Page — keeps its own password gate inside the component */}
          <Route path="/admin" element={<Suspense fallback={<PageLoading />}><AdminPage /></Suspense>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Chatbot />
      </AuthProvider>
    </Router>
  );
}

export default App;
