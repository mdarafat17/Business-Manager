import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME } from '../../constants';
import { 
    HomeIcon, CubeIcon, ShoppingCartIcon, CurrencyBangladeshiIcon, 
    DocumentTextIcon, UserGroupIcon, PrinterIcon, PaletteIcon
} from '../icons/HeroIcons';
// Removed ArrowLeftOnRectangleIcon, ShieldCheckIcon, LockClosedIcon as they are no longer used
// Removed useAuth and useAppContext (if only used for theme, it's okay to keep for theme)
import { useAppContext } from '../../contexts/AppContext';


interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
    ${isActive
        ? 'bg-primary-dark text-white dark:bg-primary-dark'
        : 'text-neutral-100 hover:bg-primary hover:text-white dark:text-neutral-200 dark:hover:bg-primary dark:hover:text-white'
    }`;

  return (
    <NavLink to={to} className={navLinkClass}>
      {icon}
      <span className="ml-3">{label}</span>
    </NavLink>
  );
};


const Sidebar: React.FC = () => {
  const { theme } = useAppContext(); // Theme might still be useful

  return (
    <div className="w-64 bg-neutral-800 text-neutral-100 flex flex-col no-print dark:bg-neutral-900 dark:border-r dark:border-neutral-700">
      <div className="h-16 flex items-center justify-center px-4 border-b border-neutral-700 dark:border-neutral-700">
        <CurrencyBangladeshiIcon className="h-8 w-8 mr-2 text-primary-light"/>
        <h1 className="text-xl font-semibold text-white dark:text-neutral-100">{APP_NAME}</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem to="/dashboard" icon={<HomeIcon className="h-5 w-5" />} label="Dashboard" />
        <NavItem to="/products" icon={<CubeIcon className="h-5 w-5" />} label="Products" />
        <NavItem to="/sales" icon={<ShoppingCartIcon className="h-5 w-5" />} label="Sales" />
        <NavItem to="/expenses" icon={<CurrencyBangladeshiIcon className="h-5 w-5" />} label="Expenses" />
        <NavItem to="/reports" icon={<DocumentTextIcon className="h-5 w-5" />} label="Reports" />
        <NavItem to="/customers" icon={<UserGroupIcon className="h-5 w-5" />} label="Customer Manage" />
        <NavItem to="/invoice" icon={<PrinterIcon className="h-5 w-5" />} label="Create Invoice" />
        <NavItem to="/theme-settings" icon={<PaletteIcon className="h-5 w-5" />} label="Theme Settings" />
      </nav>
      <div className="p-4 border-t border-neutral-700 dark:border-neutral-700">
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">&copy; {new Date().getFullYear()} {APP_NAME} - Created by Md. Yasin Arafat</p>
      </div>
    </div>
  );
};

export default Sidebar;