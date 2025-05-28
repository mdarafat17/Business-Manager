import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Customer } from '../types';
import Modal from '../components/common/Modal';
import CustomerForm from '../components/customers/CustomerForm';
import Button from '../components/common/Button';
import { PlusIcon, PencilIcon, TrashIcon, InformationCircleIcon, UserGroupIcon } from '../components/icons/HeroIcons';
import { formatDate } from '../utils/helpers';

const CustomersPage: React.FC = () => {
  const { customers, deleteCustomer, loadingAppData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCustomer = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteCustomer(customerId);
    }
  };
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.district.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  if (loadingAppData && customers.length === 0) {
    return <div className="text-center p-6">Loading customer data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 flex items-center">
            <UserGroupIcon className="h-7 w-7 mr-2 text-primary" /> Customer Management
        </h2>
        <Button 
            onClick={handleAddCustomer} 
            leftIcon={<PlusIcon className="h-5 w-5"/>}
            title="Add New Customer"
        >
          Add New Customer
        </Button>
      </div>

       <input
        type="text"
        placeholder="Search customers (name, phone, email, city, district)..."
        className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loadingAppData && customers.length === 0 ? (
        <div className="text-center py-10">Loading customers...</div>
      ) : customers.length === 0 ? (
         <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No customers found.</p>
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">Click "Add New Customer" to get started.</p>
        </div>
      ) : filteredCustomers.length === 0 && customers.length > 0 ? (
        <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No customers match your search.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Added On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    <div>{customer.phone}</div>
                    {customer.email && <div className="text-xs text-neutral-400 dark:text-neutral-500">{customer.email}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    <div>{customer.address}</div>
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">{customer.city}, {customer.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">{formatDate(customer.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditCustomer(customer)}
                        leftIcon={<PencilIcon className="h-4 w-4"/>}
                        title="Edit"
                    >Edit</Button>
                    <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDeleteCustomer(customer.id)}
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
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={customerToEdit ? 'Edit Customer' : 'Add New Customer'} size="lg">
          <CustomerForm customerToEdit={customerToEdit} onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;