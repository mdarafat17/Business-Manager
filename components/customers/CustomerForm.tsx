
import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';

interface CustomerFormProps {
  customerToEdit?: Customer | null;
  onClose: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customerToEdit, onClose }) => {
  const { addCustomer, updateCustomer } = useAppContext();
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState(''); // Home Location / Street
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setDistrict(customerToEdit.district);
      setCity(customerToEdit.city);
      setAddress(customerToEdit.address);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
    } else {
      // Reset form for new customer
      setName('');
      setDistrict('');
      setCity('');
      setAddress('');
      setPhone('');
      setEmail('');
    }
  }, [customerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !city || !district) {
        alert('Please fill in all required fields: Name, Phone, Address, City, and District.');
        return;
    }

    const customerData = { name, district, city, address, phone, email: email.trim() === '' ? undefined : email.trim() };

    if (customerToEdit) {
      updateCustomer({ ...customerData, id: customerToEdit.id, createdAt: customerToEdit.createdAt });
    } else {
      addCustomer(customerData);
    }
    onClose();
  };
  
  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customerName" className={labelClass}>Customer Name *</label>
        <input type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} required className={commonInputClass} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="customerPhone" className={labelClass}>Mobile Phone Number *</label>
            <input type="tel" id="customerPhone" value={phone} onChange={e => setPhone(e.target.value)} required className={commonInputClass} placeholder="e.g., 01xxxxxxxxx" />
        </div>
        <div>
            <label htmlFor="customerEmail" className={labelClass}>Email (Optional)</label>
            <input type="email" id="customerEmail" value={email} onChange={e => setEmail(e.target.value)} className={commonInputClass} placeholder="e.g., user@example.com" />
        </div>
      </div>

      <div>
        <label htmlFor="customerAddress" className={labelClass}>Home Location / Street Address *</label>
        <input type="text" id="customerAddress" value={address} onChange={e => setAddress(e.target.value)} required className={commonInputClass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerCity" className={labelClass}>City *</label>
          <input type="text" id="customerCity" value={city} onChange={e => setCity(e.target.value)} required className={commonInputClass} />
        </div>
        <div>
          <label htmlFor="customerDistrict" className={labelClass}>District *</label>
          <input type="text" id="customerDistrict" value={district} onChange={e => setDistrict(e.target.value)} required className={commonInputClass} />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{customerToEdit ? 'Update Customer' : 'Add Customer'}</Button>
      </div>
    </form>
  );
};

export default CustomerForm;