import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Product } from '../types';
import Modal from '../components/common/Modal';
import ProductForm from '../components/products/ProductForm';
import Button from '../components/common/Button';
import { PlusIcon, PencilIcon, TrashIcon, InformationCircleIcon } from '../components/icons/HeroIcons';
import { formatCurrency, formatDate } from '../utils/helpers';

const ProductsPage: React.FC = () => {
  const { products, deleteProduct, currencySymbol, loadingAppData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name));

  if (loadingAppData && products.length === 0) { // Show initial loading if no products yet
    return <div className="text-center p-6">Loading product data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Manage Products</h2>
        <Button 
            onClick={handleAddProduct} 
            leftIcon={<PlusIcon className="h-5 w-5"/>}
            title="Add New Product"
        >
          Add New Product
        </Button>
      </div>

       <input
        type="text"
        placeholder="Search products..."
        className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loadingAppData && products.length === 0 ? ( // Show if still loading and no products rendered yet
        <div className="text-center py-10">Loading products...</div>
      ) : products.length === 0 ? (
         <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No products found.</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">Click "Add New Product" to get started.</p>
        </div>
      ) : filteredProducts.length === 0 && products.length > 0 ? (
        <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No products match your search.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Purchase Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Selling Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Added On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 max-w-xs truncate" title={product.description}>{product.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatCurrency(product.purchasePrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatCurrency(product.sellingPrice)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${product.stock < 5 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(product.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditProduct(product)} 
                        leftIcon={<PencilIcon className="h-4 w-4"/>}
                        title="Edit"
                    >Edit</Button>
                    <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDeleteProduct(product.id)} 
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
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={productToEdit ? 'Edit Product' : 'Add New Product'}>
            <ProductForm productToEdit={productToEdit} onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default ProductsPage;