import React from 'react';
import { PageView } from '../types';

interface NavbarProps {
  currentPage: PageView;
  setPage: (page: PageView) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  setPage, 
  isAuthenticated, 
  onLogout,
  onLoginClick 
}) => {
  const navItems: { id: PageView; label: string; icon: string }[] = [
    { id: 'FEED', label: 'News Feed', icon: '📰' },
    { id: 'VERIFY', label: 'Truth Check', icon: '🔍' },
    { id: 'EDUCATION', label: 'Learn', icon: '🎓' },
    { id: 'PROFILE', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setPage('FEED')}>
            <span className="text-2xl mr-2">👁️</span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              TruthLens
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            <div className="pl-4 border-l border-gray-200">
              {isAuthenticated ? (
                <button 
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-red-600 font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button (simplified) */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Bar (Sticky) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex flex-col items-center text-xs ${
              currentPage === item.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
