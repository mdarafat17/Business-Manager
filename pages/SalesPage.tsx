import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import SaleForm from '../components/sales/SaleForm';
import Button from '../components/common/Button';
import { PlusIcon, InformationCircleIcon, TrashIcon } from '../components/icons/HeroIcons';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Sale } from '../types';

const SalesPage: React.FC = () => {
  const { sales, deleteSales, loadingAppData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);

  const handleAddSale = () => {
    setIsModalOpen(true);
  };
  
  const sortedSales = useMemo(() => 
    [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [sales]);

  const filteredSales = useMemo(() => 
    sortedSales.filter(sale => {
      if (!searchTerm) return true;
      const lowerSearchTerm = searchTerm.toLowerCase();
      return sale.id.toLowerCase().includes(lowerSearchTerm) ||
             sale.items.some(item => item.productName.toLowerCase().includes(lowerSearchTerm));
    }),
  [sortedSales, searchTerm]);

  const handleSelectSale = (saleId: string) => {
    setSelectedSaleIds(prevSelected =>
      prevSelected.includes(saleId)
        ? prevSelected.filter(id => id !== saleId)
        : [...prevSelected, saleId]
    );
  };

  const handleSelectAllSales = () => {
    if (selectedSaleIds.length === filteredSales.length) {
      setSelectedSaleIds([]);
    } else {
      setSelectedSaleIds(filteredSales.map(sale => sale.id));
    }
  };

  const handleDeleteSelectedSales = () => {
    if (selectedSaleIds.length === 0) {
      alert('Please select sales records to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedSaleIds.length} selected sales records? This action cannot be undone.`)) {
      deleteSales(selectedSaleIds);
      setSelectedSaleIds([]); // Clear selection after deletion
    }
  };
  
  const commonCheckboxClass = "form-checkbox h-5 w-5 text-primary rounded border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 focus:ring-primary-dark";

  if (loadingAppData && sales.length === 0) {
    return <div className="text-center p-6">Loading sales data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Sales Records</h2>
        <div className="flex gap-2">
          {selectedSaleIds.length > 0 && (
            <Button 
                onClick={handleDeleteSelectedSales} 
                variant="danger"
                leftIcon={<TrashIcon className="h-5 w-5"/>}
                title="Delete Selected Sales"
            >
              Delete ({selectedSaleIds.length})
            </Button>
          )}
          <Button 
              onClick={handleAddSale} 
              leftIcon={<PlusIcon className="h-5 w-5"/>}
              title="Record New Sale"
          >
            Record New Sale
          </Button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search sales (ID, product name)..."
        className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {sales.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No sales recorded yet.</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">Click "Record New Sale" to add your first sale.</p>
        </div>
      ) : filteredSales.length === 0 && sales.length > 0 ? (
        <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No sales match your search.</p>
        </div>
      ): (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    className={commonCheckboxClass}
                    checked={filteredSales.length > 0 && selectedSaleIds.length === filteredSales.length}
                    onChange={handleSelectAllSales}
                    aria-label="Select all sales"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Sale ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Total Cost (COGS)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredSales.map((sale: Sale) => (
                <tr key={sale.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 ${selectedSaleIds.includes(sale.id) ? 'bg-primary-light bg-opacity-20 dark:bg-primary-dark dark:bg-opacity-30' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className={commonCheckboxClass}
                      checked={selectedSaleIds.includes(sale.id)}
                      onChange={() => handleSelectSale(sale.id)}
                      aria-label={`Select sale ${sale.id.substring(0,8)}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{sale.id.substring(0,8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(sale.date)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <ul className="list-disc list-inside">
                        {sale.items.map(item => (
                            <li key={item.productId + item.productName} className="truncate max-w-xs" title={`${item.productName} (Qty: ${item.quantity}, Unit Price: ${formatCurrency(item.unitPrice)})`}>
                                {item.productName} (x{item.quantity})
                            </li>
                        ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatCurrency(sale.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">{formatCurrency(sale.totalCost)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${(sale.totalAmount - sale.totalCost) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(sale.totalAmount - sale.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Sale" size="lg">
            <SaleForm onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default SalesPage;
