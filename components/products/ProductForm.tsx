import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';

interface ProductFormProps {
  productToEdit?: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onClose }) => {
  const { addProduct, updateProduct, currencySymbol } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setPurchasePrice(productToEdit.purchasePrice.toString());
      setSellingPrice(productToEdit.sellingPrice.toString());
      setStock(productToEdit.stock.toString());
    } else {
      setName('');
      setDescription('');
      setPurchasePrice('');
      setSellingPrice('');
      setStock('');
    }
  }, [productToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPurchasePrice = parseFloat(purchasePrice);
    const numSellingPrice = parseFloat(sellingPrice);
    const numStock = parseInt(stock, 10);

    if (isNaN(numPurchasePrice) || isNaN(numSellingPrice) || isNaN(numStock) || numPurchasePrice < 0 || numSellingPrice < 0 || numStock < 0) {
      alert('Please enter valid numbers for prices and stock.');
      return;
    }

    const productData = { name, description, purchasePrice: numPurchasePrice, sellingPrice: numSellingPrice, stock: numStock };

    if (productToEdit) {
      updateProduct({ ...productData, id: productToEdit.id, createdAt: productToEdit.createdAt });
    } else {
      addProduct(productData);
    }
    onClose();
  };
  
  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="productName" className={labelClass}>Product Name</label>
        <input type="text" id="productName" value={name} onChange={e => setName(e.target.value)} required className={commonInputClass} />
      </div>
      <div>
        <label htmlFor="productDescription" className={labelClass}>Description</label>
        <textarea id="productDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={commonInputClass}></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="purchasePrice" className={labelClass}>Purchase Price ({currencySymbol})</label>
          <input type="number" id="purchasePrice" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} required min="0" step="0.01" className={commonInputClass} />
        </div>
        <div>
          <label htmlFor="sellingPrice" className={labelClass}>Selling Price ({currencySymbol})</label>
          <input type="number" id="sellingPrice" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required min="0" step="0.01" className={commonInputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="stock" className={labelClass}>Stock Quantity</label>
        <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} required min="0" step="1" className={commonInputClass} />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{productToEdit ? 'Update Product' : 'Add Product'}</Button>
      </div>
    </form>
  );
};

export default ProductForm;