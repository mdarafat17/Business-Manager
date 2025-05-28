import React from 'react';
import { useLocation } from 'react-router-dom';
// Removed useAuth and UserCircleIcon as they are no longer used

const Header: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const path = pathParts.length > 0 ? pathParts[pathParts.length -1] : 'dashboard';
    
    if (path === 'theme-settings') return "Theme Settings";
    // Removed 'superadmin' case as the page is removed
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="h-16 bg-white dark:bg-neutral-800 shadow-md dark:shadow-neutral-700/50 flex items-center justify-between px-6 no-print">
      <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">{getPageTitle()}</h2>
      {/* User display removed */}
    </header>
  );
};

export default Header;