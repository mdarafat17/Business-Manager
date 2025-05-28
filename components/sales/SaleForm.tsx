import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Product, SaleItem } from '../../types';
import Button from '../common/Button';
import { PlusIcon, TrashIcon } from '../icons/HeroIcons';
import { getTodayDateString, formatCurrency } from '../../utils/helpers';

interface SaleFormProps {
  onClose: () => void;
}

// FormSaleItem only needs productId and quantity for form manipulation.
// The 'id' field is for React key prop during rendering of form items.
interface FormSaleItemState {
  id: string; // Temporary ID for form item management
  productId: string;
  quantity: number;
}

const SaleForm: React.FC<SaleFormProps> = ({ onClose }) => {
  const { products, addSale, currencySymbol } = useAppContext();
  const [saleDate, setSaleDate] = useState<string>(getTodayDateString());
  const [items, setItems] = useState<FormSaleItemState[]>([{ id: Date.now().toString(), productId: '', quantity: 1 }]);

  const handleItemChange = (index: number, field: keyof FormSaleItemState, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
        const product = products.find(p => p.id === newItems[index].productId);
        const quantity = Number(value);
        if (product && quantity > product.stock) {
            alert(`Cannot sell more than available stock (${product.stock}) for ${product.name}.`);
            (newItems[index] as any)[field] = product.stock;
        } else {
            (newItems[index] as any)[field] = quantity < 1 ? 1 : quantity; // Ensure quantity is at least 1
        }
    } else {
         (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleDate) {
        alert('Please select a sale date.');
        return;
    }

    const saleItemsForContext: Omit<SaleItem, 'unitPrice' | 'unitCost' | 'productName'>[] = items
      .filter(item => item.productId && item.quantity > 0)
      .map(formItem => {
        return {
          productId: formItem.productId,
          quantity: Number(formItem.quantity),
        };
      });

    if (saleItemsForContext.length === 0) {
      alert('Please add at least one valid item to the sale.');
      return;
    }
    
    const success = addSale({ date: saleDate, items: saleItemsForContext });
    if (success) {
        onClose();
    }
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.sellingPrice * Number(item.quantity) : 0);
    }, 0);
  };

  const commonInputClass = "block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const itemLabelClass = "block text-xs font-medium text-neutral-600 dark:text-neutral-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="saleDate" className={labelClass}>Sale Date</label>
        <input type="date" id="saleDate" value={saleDate} onChange={e => setSaleDate(e.target.value)} required className={`mt-1 ${commonInputClass} dark:[color-scheme:dark]`} />
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium text-neutral-700 dark:text-neutral-200">Sale Items</h3>
        {items.map((item, index) => {
          const selectedProduct = products.find(p => p.id === item.productId);
          return (
            <div key={item.id} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md space-y-3 bg-neutral-50 dark:bg-neutral-700/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label htmlFor={`product-${index}`} className={itemLabelClass}>Product</label>
                  <select
                    id={`product-${index}`}
                    value={item.productId}
                    onChange={e => handleItemChange(index, 'productId', e.target.value)}
                    required
                    className={`mt-1 ${commonInputClass}`}
                  >
                    <option value="">Select Product</option>
                    {products.filter(p => p.stock > 0 || p.id === item.productId).map(p => ( 
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock}, Price: {formatCurrency(p.sellingPrice)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`quantity-${index}`} className={itemLabelClass}>Quantity</label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    value={item.quantity}
                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value,10))}
                    required
                    min="1"
                    className={`mt-1 ${commonInputClass}`}
                  />
                </div>
              </div>
              {items.length > 1 && (
                <div className="text-right">
                    <Button type="button" variant="danger" size="sm" onClick={() => removeItem(index)} leftIcon={<TrashIcon className="h-4 w-4"/>}>
                        Remove
                    </Button>
                </div>
              )}
            </div>
          );
        })}
        <Button type="button" variant="outline" onClick={addItem} leftIcon={<PlusIcon className="h-4 w-4"/>}>
          Add Another Item
        </Button>
      </div>

      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 text-right">
          Total: {formatCurrency(calculateTotal())}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Record Sale</Button>
      </div>
    </form>
  );
};

export default SaleForm;