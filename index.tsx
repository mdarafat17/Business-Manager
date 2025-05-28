import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext'; // Import NotificationProvider

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <NotificationProvider> {/* Wrap AppProvider (and thus App) with NotificationProvider */}
      <AppProvider>
        <App />
      </AppProvider>
    </NotificationProvider>
  </React.StrictMode>
);
