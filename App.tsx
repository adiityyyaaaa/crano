import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import TeacherProfile from './pages/TeacherProfile';
import Dashboard from './pages/Dashboard';
import Teach from './pages/Teach';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';

// Helper to handle scrolling to hash targets after navigation
const ScrollToHash = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);
  return null;
};

const Footer = () => (
  <footer className="bg-slate-900 text-white py-20 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div>
        <div className="flex items-center mb-6">
          <img
            src="/assets/crano-logo.png"
            alt="Crano Logo"
            className="h-16 w-auto brightness-0 invert"
          />
        </div>
        <p className="text-slate-400 leading-relaxed">
          Nurturing young minds through the power of 1-on-1 teaching. Because true understanding begins with personal care.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-500">For Students</h4>
        <ul className="space-y-4 text-slate-300">
          <li><Link to="/discover" className="hover:text-white transition-colors">Find a Teacher</Link></li>
          <li><a href="#" className="hover:text-white transition-colors">Group Learning</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-500">For Teachers</h4>
        <ul className="space-y-4 text-slate-300">
          <li><Link to="/teach" className="hover:text-white transition-colors">Apply to Teach</Link></li>
          <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
          <li><a href="#" className="hover:text-white transition-colors">YouTube Sync</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-slate-500">Company</h4>
        <ul className="space-y-4 text-slate-300">
          <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-sm">
      © 2025 Crano Education Inc. Built for dedicated teachers and eager learners.
    </div>
  </footer>
);

const AppContent: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // We can listen for a custom event to open the modal from anywhere
  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    // If user is on the home page, take them to Discover after logging in
    if (location.pathname === '/') {
      navigate('/discover');
    } else {
      // Just refresh current page state if they are already on a deep link
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ScrollToHash />
      <Navbar onJoinClick={() => setIsAuthModalOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenAuth={() => setIsAuthModalOpen(true)} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/teacher/:id" element={
            <ErrorBoundary>
              <TeacherProfile />
            </ErrorBoundary>
          } />
          <Route path="/teach" element={<Teach />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
