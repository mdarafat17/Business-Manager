
import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string; // e.g., 'bg-blue-500' for icon background
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = 'bg-primary' }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{title}</p>
        <p className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;