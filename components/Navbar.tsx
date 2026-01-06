
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, UserCircle, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onJoinClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onJoinClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Re-check login status whenever the location changes
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || 'student';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 20;

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleJoinNow = () => {
    if (onJoinClick) {
      onJoinClick();
    } else {
      if (location.pathname === '/') {
        const element = document.getElementById('search-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/#search-section');
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-2' : 'bg-transparent py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img
            src="/assets/crano-logo.png"
            alt="Crano Logo"
            className="h-30 md:h-36 w-auto transform transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`font-semibold transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Home</Link>

          {/* Hide Find Teachers for logged-in Teachers */}
          {(!isLoggedIn || userRole !== 'teacher') && (
            <Link to="/discover" className={`font-semibold transition-colors ${location.pathname === '/discover' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Find Teachers</Link>
          )}

          <Link
            to="/#how-it-works"
            onClick={handleHowItWorksClick}
            className="text-slate-600 hover:text-blue-600 font-semibold"
          >
            How it Works
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-md">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 font-bold text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinNow}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <span>Join Now</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-900">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t p-6 flex flex-col space-y-4 shadow-xl">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold">Home</Link>

          {(!isLoggedIn || userRole !== 'teacher') && (
            <Link to="/discover" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold">Find Teachers</Link>
          )}

          <Link to="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold">How it Works</Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-900 text-white w-full py-4 rounded-xl font-bold text-center">Dashboard</Link>
              <button onClick={handleLogout} className="bg-red-50 text-red-600 w-full py-4 rounded-xl font-bold">Logout</button>
            </>
          ) : (
            <button onClick={handleJoinNow} className="bg-blue-600 text-white w-full py-4 rounded-xl font-bold">Join Now</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
