import React from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    authLogout();
    navigate('/signin');
  };

  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  const activeLinkStyle = "bg-sky-600 text-white";
  const inactiveLinkStyle = "text-gray-300 hover:bg-sky-700 hover:text-white";

  return (
    <nav className="bg-sky-800 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-sky-200 transition-colors">
              {t('navbar.brand')}
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink 
                to="/events" 
                className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                {t('navbar.events')}
              </NavLink>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                    >
                      {t('navbar.admin')}
                    </NavLink>
                  )}
                  <NavLink 
                    to="/bookings" 
                    className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                  >
                    {t('navbar.myBookings')}
                  </NavLink>
                  <span className="text-gray-300 px-3 py-2 text-sm font-medium">
                    {t('navbar.greeting', { name: user?.username })}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className={`${linkStyle} bg-pink-600 hover:bg-pink-700 text-white`}
                  >
                    {t('navbar.logout')}
                  </button>
                </>
              ) : (
                <>
                  <NavLink 
                    to="/signin" 
                    className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                  >
                    {t('navbar.signIn')}
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className={`${linkStyle} bg-emerald-500 hover:bg-emerald-600 text-white`}
                  >
                    {t('navbar.signUp')}
                  </NavLink>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;