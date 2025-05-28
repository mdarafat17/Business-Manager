import React, { useState, useEffect } from 'react';
import { Expense, ExpenseType } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import { getTodayDateString } from '../../utils/helpers';

interface ExpenseFormProps {
  expenseToEdit?: Expense | null;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseToEdit, onClose }) => {
  const { addExpense, updateExpense, currencySymbol } = useAppContext();
  const [type, setType] = useState<ExpenseType>(ExpenseType.OTHER);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    if (expenseToEdit) {
      setType(expenseToEdit.type);
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString());
      setDate(expenseToEdit.date);
    } else {
      setType(ExpenseType.OTHER);
      setDescription('');
      setAmount('');
      setDate(getTodayDateString());
    }
  }, [expenseToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }
    if (!date) {
        alert('Please select a date for the expense.');
        return;
    }

    const expenseData = { type, description, amount: numAmount, date };

    if (expenseToEdit) {
      updateExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
      addExpense(expenseData);
    }
    onClose();
  };
  
  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="expenseType" className={labelClass}>Expense Type</label>
        <select id="expenseType" value={type} onChange={e => setType(e.target.value as ExpenseType)} required className={commonInputClass}>
          {Object.values(ExpenseType).map(et => (
            <option key={et} value={et}>{et}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="expenseDescription" className={labelClass}>Description</label>
        <input type="text" id="expenseDescription" value={description} onChange={e => setDescription(e.target.value)} required className={commonInputClass} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expenseAmount" className={labelClass}>Amount ({currencySymbol})</label>
          <input type="number" id="expenseAmount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className={commonInputClass} />
        </div>
        <div>
          <label htmlFor="expenseDate" className={labelClass}>Date</label>
          <input type="date" id="expenseDate" value={date} onChange={e => setDate(e.target.value)} required className={`${commonInputClass} dark:[color-scheme:dark]`} />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{expenseToEdit ? 'Update Expense' : 'Add Expense'}</Button>
      </div>
    </form>
  );
};

export default ExpenseForm;