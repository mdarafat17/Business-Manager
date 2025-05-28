import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationType } from '../../types';
import { CheckCircleIcon, TrashIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '../icons/HeroIcons';

const NotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'delete':
        return <TrashIcon className="h-6 w-6 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
       case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'delete':
        return 'border-red-500';
      case 'info':
        return 'border-blue-500';
      case 'warning':
        return 'border-yellow-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000] w-full max-w-xs space-y-3 no-print">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`bg-white dark:bg-neutral-800 shadow-xl rounded-lg p-4 border-l-4 ${getBorderColor(notification.type)} flex items-start space-x-3 transition-all duration-300 ease-in-out animate-fadeIn`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {notification.message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
              aria-label="Close notification"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationDisplay;