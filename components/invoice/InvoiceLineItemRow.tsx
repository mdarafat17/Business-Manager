
import React from 'react';
import { InvoiceItem, Product } from '../../types';
import Button from '../common/Button';
import { TrashIcon } from '../icons/HeroIcons';

interface InvoiceLineItemRowProps {
  item: InvoiceItem;
  index: number;
  onItemChange: (index: number, field: keyof InvoiceItem, value: any) => void;
  onRemoveItem: (index: number) => void;
  commonInputClass: string; // Passed down with dark mode styles already
  products: Product[]; // For datalist suggestions
}

const InvoiceLineItemRow: React.FC<InvoiceLineItemRowProps> = ({
  item,
  index,
  onItemChange,
  onRemoveItem,
  commonInputClass, // This will now include dark: styles from CreateInvoicePage
  products
}) => {
  const labelClass = "block text-xs font-medium text-neutral-600 dark:text-neutral-400";
  return (
    <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50/50 dark:bg-neutral-700/30 relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2 items-start">
        <div className="md:col-span-5">
          <label htmlFor={`item-desc-${index}`} className={labelClass}>Description *</label>
          <input
            type="text"
            id={`item-desc-${index}`}
            list={`product-suggestions-${index}`}
            value={item.description}
            onChange={e => onItemChange(index, 'description', e.target.value)}
            required
            className={commonInputClass} 
            placeholder="Product or Service Name"
          />
          <datalist id={`product-suggestions-${index}`}>
            {products.map(p => (
              <option key={p.id} value={p.name}>{p.name} (Stock: {p.stock})</option>
            ))}
          </datalist>
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`item-qty-${index}`} className={labelClass}>Quantity *</label>
          <input
            type="number"
            id={`item-qty-${index}`}
            value={item.quantity}
            onChange={e => onItemChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
            required
            min="1"
            className={commonInputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`item-price-${index}`} className={labelClass}>Unit Price *</label>
          <input
            type="number"
            id={`item-price-${index}`}
            value={item.unitPrice}
            onChange={e => onItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
            required
            min="0"
            step="0.01"
            className={commonInputClass}
          />
        </div>
        <div className="md:col-span-2 flex flex-col items-end">
            <label className={`${labelClass} w-full text-right`}>Total</label>
            <input
                type="text"
                value={item.total.toFixed(2)}
                readOnly
                className={`${commonInputClass} text-right bg-neutral-100 dark:bg-neutral-600 cursor-default`}
                aria-label="Item total"
            />
        </div>
        <div className="md:col-span-1 flex items-end justify-end md:justify-start h-full">
          {index >= 0 && ( /* Always show remove button for simplicity, can be index > 0 if first item cannot be removed */
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onRemoveItem(index)}
              className="mt-auto !p-2"
              aria-label="Remove item"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceLineItemRow;