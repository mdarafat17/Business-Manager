
import { CURRENCY_SYMBOL } from '../constants';

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
     // Handle cases where dateString might not include time, making it UTC midnight
    if (dateString.length === 10) { // YYYY-MM-DD
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // fallback
  }
};

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL} ${amount.toFixed(2)}`;
};

export const getMonthYear = (dateString: string): string => {
  if (!dateString) return 'Unknown Date';
  try {
    const date = new Date(dateString);
    if (dateString.length === 10) { // YYYY-MM-DD
       const [year, month] = dateString.split('-');
       return `${new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('en-US', { month: 'short' })} ${year}`;
    }
    return `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
  } catch (error) {
     console.error("Error getting month year:", dateString, error);
     return dateString;
  }
};
