import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Expense, ExpenseType } from '../types'; 
import Modal from '../components/common/Modal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Button from '../components/common/Button';
import { PlusIcon, PencilIcon, TrashIcon, InformationCircleIcon } from '../components/icons/HeroIcons';
import { formatCurrency, formatDate } from '../utils/helpers';

const ExpensesPage: React.FC = () => {
  const { expenses, deleteExpense, loadingAppData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  const handleAddExpense = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expenseId);
    }
  };
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearchTerm = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              expense.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? expense.type === filterType : true;
    return matchesSearchTerm && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const commonInputStyle = "w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400";

  if (loadingAppData && expenses.length === 0) {
    return <div className="text-center p-6">Loading expense data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Manage Expenses</h2>
        <Button 
            onClick={handleAddExpense} 
            leftIcon={<PlusIcon className="h-5 w-5"/>}
            title="Add New Expense"
        >
          Add New Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
            type="text"
            placeholder="Search expenses (description, type)..."
            className={commonInputStyle}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
            className={commonInputStyle}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
        >
            <option value="">All Types</option>
            {Object.values(ExpenseType).map((type) => (
                <option key={type as string} value={type as string}>{type as string}</option>
            ))}
        </select>
      </div>
      {loadingAppData && expenses.length === 0 ? (
         <div className="text-center py-10">Loading expenses...</div>
      ) : expenses.length === 0 ? (
         <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No expenses found.</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">Click "Add New Expense" to get started.</p>
        </div>
      ) : filteredExpenses.length === 0 && expenses.length > 0 ? (
         <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No expenses match your filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(expense.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{expense.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100 max-w-xs truncate" title={expense.description}>{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditExpense(expense)}
                        leftIcon={<PencilIcon className="h-4 w-4"/>}
                        title="Edit"
                    >Edit</Button>
                    <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDeleteExpense(expense.id)}
                        leftIcon={<TrashIcon className="h-4 w-4"/>}
                        title="Delete"
                    >Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}>
            <ExpenseForm expenseToEdit={expenseToEdit} onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default ExpensesPage;