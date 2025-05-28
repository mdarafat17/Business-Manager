import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
    Product, Sale, Expense, Customer, CompanyProfile, 
    Invoice, Theme, AppContextType, AppContextAddSaleInput, SaleItem, NotificationType
} from '../types';
import { generateId } from '../utils/helpers';
import { CURRENCY_SYMBOL, APP_NAME } from '../constants';
import { useNotification } from './NotificationContext'; // Import useNotification

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCompanyProfileData: CompanyProfile = {
  companyName: APP_NAME,
  address: '123 Business Rd, Dhaka',
  phone: '01xxxxxxxxx',
  email: 'contact@example.com',
  logo: '', 
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [companyProfile, setCompanyProfile] = useLocalStorage<CompanyProfile | null>('companyProfile', initialCompanyProfileData);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [loadingAppData, setLoadingAppData] = useState<boolean>(true);

  const { showNotification } = useNotification(); // Get showNotification from NotificationContext

  useEffect(() => {
    const timer = setTimeout(() => {
        setLoadingAppData(false);
    }, 100); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { 
    if (companyProfile === null) {
        setCompanyProfile(initialCompanyProfileData);
    }
  }, [companyProfile, setCompanyProfile]);


  useEffect(() => { 
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = { ...productData, id: generateId(), createdAt: new Date().toISOString() };
    setProducts(prev => [newProduct, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
    showNotification('Product added successfully.', 'success');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p).sort((a,b) => a.name.localeCompare(b.name)));
    showNotification('Product updated successfully.', 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showNotification('Product deleted.', 'delete');
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const addSale = (saleData: AppContextAddSaleInput): boolean => {
    let totalAmount = 0;
    let totalCost = 0;
    const detailedItems: SaleItem[] = [];
    const updatedProducts = [...products]; 

    for (const item of saleData.items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex === -1) {
        showNotification(`Product with id ${item.productId} not found. Sale not recorded.`, 'error'); return false;
      }
      const product = updatedProducts[productIndex];
      if (product.stock < item.quantity) {
        showNotification(`Not enough stock for ${product.name}. Available: ${product.stock}. Sale not recorded.`, 'error'); return false;
      }
      
      detailedItems.push({
        productId: item.productId, quantity: item.quantity, productName: product.name,
        unitPrice: product.sellingPrice, unitCost: product.purchasePrice,
      });
      totalAmount += product.sellingPrice * item.quantity;
      totalCost += product.purchasePrice * item.quantity;
      
      updatedProducts[productIndex] = { ...product, stock: product.stock - item.quantity };
    }

    const newSale: Sale = {
      id: generateId(), date: saleData.date, items: detailedItems,
      totalAmount, totalCost, createdAt: new Date().toISOString(),
    };
    
    setSales(prev => [newSale, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setProducts(updatedProducts.sort((a,b) => a.name.localeCompare(b.name))); 
    showNotification('Sale recorded successfully.', 'success');
    return true;
  };

  const deleteSales = (saleIds: string[]) => {
    setSales(prev => prev.filter(s => !saleIds.includes(s.id)));
    showNotification(`${saleIds.length} sales record(s) deleted.`, 'delete');
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expenseData, id: generateId() };
    setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showNotification('Expense added successfully.', 'success');
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showNotification('Expense updated successfully.', 'success');
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    showNotification('Expense deleted.', 'delete');
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer | null => {
    const newCustomer: Customer = { ...customerData, id: generateId(), createdAt: new Date().toISOString() };
    setCustomers(prev => [newCustomer, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
    showNotification('Customer added successfully.', 'success');
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c).sort((a,b) => a.name.localeCompare(b.name)));
    showNotification('Customer updated successfully.', 'success');
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    showNotification('Customer deleted.', 'delete');
  };
  
  const getCustomerById = (customerId: string): Customer | undefined => customers.find(c => c.id === customerId);
  
  const updateCompanyProfile = (profileData: CompanyProfile) => {
    setCompanyProfile(profileData);
    showNotification('Company profile updated.', 'success');
  };
  
  const getNextInvoiceNumber = (): string => {
    if (invoices.length === 0) {
        return 'INV-0001';
    }
    const sortedInvoices = [...invoices].sort((a, b) => {
        const numA = parseInt(a.invoiceNumber.split('-').pop() || '0');
        const numB = parseInt(b.invoiceNumber.split('-').pop() || '0');
        return numA - numB;
    });
    const lastInvoice = sortedInvoices[sortedInvoices.length - 1];
    let lastNumber = 0;
    if (lastInvoice) {
        const numPart = lastInvoice.invoiceNumber.split('-').pop();
        if (numPart && !isNaN(parseInt(numPart))) {
           lastNumber = parseInt(numPart);
        }
    }
    return `INV-${(lastNumber + 1).toString().padStart(4, '0')}`;
  };
  
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'qrCodeData'>): Invoice | null => {
    const newInvoiceNumber = getNextInvoiceNumber();
    const qrData = {
        invoiceId: newInvoiceNumber,
        customerName: invoiceData.customerSnapshot.name,
        amount: invoiceData.grandTotal,
        date: invoiceData.date
    };
    const newInvoice: Invoice = {
      ...invoiceData, id: generateId(), invoiceNumber: newInvoiceNumber,
      qrCodeData: JSON.stringify(qrData), createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    showNotification(`Invoice ${newInvoiceNumber} generated successfully.`, 'success');
    return newInvoice;
  };

  const getInvoiceById = (invoiceId: string): Invoice | undefined => invoices.find(inv => inv.id === invoiceId);

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, getProductById,
      sales, addSale, deleteSales,
      expenses, addExpense, updateExpense, deleteExpense,
      currencySymbol: CURRENCY_SYMBOL,
      customers, addCustomer, updateCustomer, deleteCustomer, getCustomerById,
      companyProfile, updateCompanyProfile, 
      invoices, addInvoice, getInvoiceById, getNextInvoiceNumber,
      theme, setTheme,
      loadingAppData,
      showNotification // Expose showNotification through AppContext for direct use if needed elsewhere, though primarily used internally.
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
