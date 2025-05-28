import React, {useEffect} from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import CustomersPage from './pages/CustomersPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ThemeSettingsPage from './pages/ThemeSettingsPage';
import { useAppContext } from './contexts/AppContext';
import NotificationDisplay from './components/common/NotificationDisplay'; // Import NotificationDisplay

const AppLayout: React.FC = () => {
  const { theme } = useAppContext();
   useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`flex h-screen bg-neutral-100 dark:bg-neutral-900`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900 p-6">
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
      <NotificationDisplay /> {/* Add NotificationDisplay here */}
    </div>
  );
};

const App: React.FC = () => {
  const { loadingAppData } = useAppContext(); 

  // if (loadingAppData) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900">
  //       <div className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">Loading Application Data...</div>
  //     </div>
  //   );
  // }

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/invoice" element={<CreateInvoicePage />} />
          <Route path="/theme-settings" element={<ThemeSettingsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
