import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Customer, CompanyProfile, InvoiceItem, Invoice, NewInvoiceCustomerInput } from '../types';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CompanyProfileForm from '../components/invoice/CompanyProfileForm';
import InvoiceTemplate from '../components/invoice/InvoiceTemplate';
import InvoiceLineItemRow from '../components/invoice/InvoiceLineItemRow';
import { PlusIcon, PencilIcon, PrinterIcon, UserPlusIcon, InformationCircleIcon } from '../components/icons/HeroIcons'; // Removed CheckCircleIcon
import { generateId, getTodayDateString, formatCurrency } from '../utils/helpers';
import { APP_NAME } from '../constants'; 

declare global {
  interface Window {
    jspdf: any;
    autoTable: any;
  }
}

type CustomerInputMode = 'existing' | 'new';

const CreateInvoicePage: React.FC = () => {
  const { 
    companyProfile, 
    updateCompanyProfile, 
    customers, 
    addInvoice, 
    addCustomer,
    products,
    loadingAppData,
    showNotification // Get showNotification from AppContext
  } = useAppContext();

  const [isCompanyProfileModalOpen, setIsCompanyProfileModalOpen] = useState(false);
  const [customerInputMode, setCustomerInputMode] = useState<CustomerInputMode>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerDistrict, setNewCustomerDistrict] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  const [invoiceDate, setInvoiceDate] = useState<string>(getTodayDateString());
  const [dueDate, setDueDate] = useState<string>('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [discount, setDiscount] = useState<string>('0');
  const [taxRate, setTaxRate] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  // Removed: const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const printableContentRef = useRef<HTMLDivElement>(null); 

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountValue = parseFloat(discount) || 0;
  const discountAmount = discount.endsWith('%') 
    ? subtotal * (discountValue / 100)
    : discountValue;
  const taxableAmount = subtotal - discountAmount;
  const taxPercentage = parseFloat(taxRate) || 0;
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const grandTotal = taxableAmount + taxAmount;

  const handleAddItem = () => {
    setItems([...items, { id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    (item as any)[field] = value;
    if (field === 'description') {
        const product = products.find(p => p.name.toLowerCase() === String(value).toLowerCase() || p.id === String(value));
        if(product) {
            item.unitPrice = product.sellingPrice;
        }
    }
    if (field === 'quantity' || field === 'unitPrice') {
      item.quantity = Math.max(0, Number(item.quantity) || 0);
      item.unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      item.total = item.quantity * item.unitPrice;
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const resetNewCustomerForm = () => {
    setNewCustomerName(''); setNewCustomerDistrict(''); setNewCustomerCity('');
    setNewCustomerAddress(''); setNewCustomerPhone(''); setNewCustomerEmail('');
  };
  
  const handleGenerateAndDownload = async () => {
    if (!companyProfile) {
        showNotification("Company profile is not set. Please edit and save company details first.", 'warning');
        return;
    }

    let finalCustomer: Customer | undefined | null = null;
    let finalCustomerId: string = '';

    if (customerInputMode === 'existing') {
      if (!selectedCustomerId) {
        showNotification('Please select an existing customer.', 'warning'); return;
      }
      finalCustomer = customers.find(c => c.id === selectedCustomerId);
      if (!finalCustomer) {
        showNotification('Selected customer not found.', 'error'); return;
      }
      finalCustomerId = finalCustomer.id;
    } else { 
      if (!newCustomerName || !newCustomerPhone || !newCustomerAddress || !newCustomerCity || !newCustomerDistrict) {
        showNotification('Please fill in all required new customer fields: Name, Phone, Address, City, and District.', 'warning'); return;
      }
      const newCustomerData: NewInvoiceCustomerInput = {
        name: newCustomerName, district: newCustomerDistrict, city: newCustomerCity,
        address: newCustomerAddress, phone: newCustomerPhone, email: newCustomerEmail || undefined
      };
      finalCustomer = addCustomer(newCustomerData); // addCustomer already shows its own notification
      if (!finalCustomer) {
        showNotification("Failed to save new customer. Please try again.", 'error'); return;
      }
      finalCustomerId = finalCustomer.id;
      resetNewCustomerForm(); 
    }

    const validItems = items.filter(item => item.description && item.quantity > 0 && item.unitPrice >= 0);
    if (validItems.length === 0) {
        showNotification('Please add at least one valid item to the invoice.', 'warning'); return;
    }

    const invoiceToSave: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'| 'qrCodeData'> = {
      customerSnapshot: finalCustomer as Customer, 
      customerId: finalCustomerId,    
      companyProfileSnapshot: companyProfile,
      date: invoiceDate,
      dueDate: dueDate || undefined,
      items: validItems,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      notes,
    };
    
    const savedInvoice = addInvoice(invoiceToSave); // addInvoice now shows its own notification
    if (!savedInvoice) {
        showNotification("Failed to save invoice. Please try again.", 'error'); return;
    }
    setPreviewInvoice(savedInvoice); 
    // Removed setShowSuccessMessage, notification handled by addInvoice in AppContext

    if (!(window as any).jspdf || !(window as any).jspdf.jsPDF) {
      showNotification("PDF library (jsPDF) not loaded. Cannot download PDF.", 'error'); return;
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [148, 210] }); 
    
    const invoiceContentSource = printableContentRef.current; 
    if (invoiceContentSource) {
        const tempRenderDiv = document.createElement('div');
        tempRenderDiv.className = 'invoice-container-print force-light-for-pdf';
        const clonedNode = invoiceContentSource.cloneNode(true) as HTMLElement;
        tempRenderDiv.appendChild(clonedNode);
        
        document.body.appendChild(tempRenderDiv); 

        try {
            await doc.html(tempRenderDiv, { 
                callback: function (docInstance: any) {
                    docInstance.save(`Invoice-${savedInvoice.invoiceNumber}.pdf`);
                    if(document.body.contains(tempRenderDiv)) {
                       document.body.removeChild(tempRenderDiv); 
                    }
                },
                x: 0, y: 0, 
                html2canvas: {
                    scale: 2, 
                    useCORS: true, 
                },
                width: 148, 
                windowWidth: 560, 
                margin: [0,0,0,0] 
            });
        } catch (error) {
            console.error("Error generating PDF with doc.html:", error);
            showNotification("Failed to generate PDF. Check console for details.", 'error');
            if (document.body.contains(tempRenderDiv)) {
                document.body.removeChild(tempRenderDiv);
            }
        }
    } else {
      showNotification("Invoice preview content for PDF generation not found.", 'error');
    }
  };
  
  
  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500";
  const commonLabelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";
  const newCustomerInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900"; 
  const newCustomerLabelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300"; 
  const sectionTitleClass = "text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700";

  if (loadingAppData && !companyProfile) { 
    return <div className="text-center p-6">Loading invoice creation page...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Create New Invoice</h2>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className={sectionTitleClass.replace('mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700', '')}>Company Details</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsCompanyProfileModalOpen(true)} 
            leftIcon={<PencilIcon className="h-4 w-4"/>}
            title="Edit Company Details"
          >
            Edit
          </Button>
        </div>
        {companyProfile ? (
            <>
                <p><strong>{companyProfile.companyName}</strong></p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{companyProfile.address}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone: {companyProfile.phone} | Email: {companyProfile.email}</p>
                {companyProfile.logo && <img src={companyProfile.logo} alt="Company Logo" className="max-h-16 mt-2 rounded"/>}
            </>
        ) : loadingAppData ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading company profile...</p>
        ) : (
             <div className="p-4 border border-dashed border-accent rounded-md text-center">
                <InformationCircleIcon className="h-8 w-8 mx-auto text-accent mb-2" />
                <p className="text-sm text-accent dark:text-amber-400">Company profile not set up yet. Click 'Edit' to add details.</p>
            </div>
        )
        }
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow space-y-6">
        <div className="mb-4">
            <span className={`${commonLabelClass} mb-2`}>Customer Type</span>
            <div className="flex items-center space-x-4 mt-1">
                {(['existing', 'new'] as CustomerInputMode[]).map(mode => (
                    <label key={mode} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="radio" name="customerType" value={mode} checked={customerInputMode === mode}
                            onChange={() => { setCustomerInputMode(mode); if (mode === 'existing') resetNewCustomerForm(); else setSelectedCustomerId(''); }}
                            className="form-radio h-4 w-4 text-primary focus:ring-primary-dark border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:checked:bg-primary"
                        />
                        <span className={commonLabelClass}>
                            {mode === 'existing' ? 'Existing Customer' : 'New Customer'}
                        </span>
                    </label>
                ))}
            </div>
        </div>

        {customerInputMode === 'existing' ? (
            <div>
              <label htmlFor="customer" className={commonLabelClass}>Select Existing Customer *</label>
              <select 
                id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} 
                required={customerInputMode === 'existing'} className={commonInputClass}
              >
                <option value="">-- Select a Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>
        ) : (
            <div className="space-y-4 p-4 border border-dashed border-primary-light dark:border-primary-dark rounded-md">
                <h4 className="text-md font-semibold text-primary dark:text-primary-light flex items-center"><UserPlusIcon className="h-5 w-5 mr-2"/>Enter New Customer Details</h4>
                <div>
                    <label htmlFor="newCustomerName" className={newCustomerLabelClass}>Name *</label>
                    <input type="text" id="newCustomerName" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} required className={newCustomerInputClass}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newCustomerPhone" className={newCustomerLabelClass}>Phone *</label>
                        <input type="tel" id="newCustomerPhone" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} required className={newCustomerInputClass}/>
                    </div>
                    <div>
                        <label htmlFor="newCustomerEmail" className={newCustomerLabelClass}>Email</label>
                        <input type="email" id="newCustomerEmail" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} className={newCustomerInputClass}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="newCustomerAddress" className={newCustomerLabelClass}>Address *</label>
                    <input type="text" id="newCustomerAddress" value={newCustomerAddress} onChange={e => setNewCustomerAddress(e.target.value)} required className={newCustomerInputClass}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newCustomerCity" className={newCustomerLabelClass}>City *</label>
                        <input type="text" id="newCustomerCity" value={newCustomerCity} onChange={e => setNewCustomerCity(e.target.value)} required className={newCustomerInputClass}/>
                    </div>
                    <div>
                        <label htmlFor="newCustomerDistrict" className={newCustomerLabelClass}>District *</label>
                        <input type="text" id="newCustomerDistrict" value={newCustomerDistrict} onChange={e => setNewCustomerDistrict(e.target.value)} required className={newCustomerInputClass}/>
                    </div>
                </div>
            </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="invoiceDate" className={commonLabelClass}>Invoice Date *</label>
            <input type="date" id="invoiceDate" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required className={`${commonInputClass} dark:[color-scheme:dark]`}/>
          </div>
          <div>
            <label htmlFor="dueDate" className={commonLabelClass}>Due Date (Optional)</label>
            <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${commonInputClass} dark:[color-scheme:dark]`}/>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Invoice Items</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <InvoiceLineItemRow
                key={item.id} item={item} index={index} onItemChange={handleItemChange}
                onRemoveItem={handleRemoveItem} commonInputClass={commonInputClass} products={products}
              />
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem} leftIcon={<PlusIcon className="h-4 w-4"/>} className="mt-3">
            Add Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t dark:border-neutral-700">
          <div>
            <label htmlFor="discount" className={commonLabelClass}>Discount (e.g., 50 or 5%)</label>
            <input type="text" id="discount" value={discount} onChange={e => setDiscount(e.target.value)} className={commonInputClass} placeholder="0 or 0%"/>
          </div>
          <div>
            <label htmlFor="taxRate" className={commonLabelClass}>Tax Rate (e.g., 15 for 15%)</label>
            <input type="text" id="taxRate" value={taxRate} onChange={e => setTaxRate(e.target.value)} className={commonInputClass} placeholder="0 for 0%"/>
          </div>
          <div className="text-right space-y-1 md:mt-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Subtotal: <span className="font-semibold">{formatCurrency(subtotal)}</span></p>
            {discountAmount > 0 && <p className="text-sm text-neutral-600 dark:text-neutral-400">Discount: <span className="font-semibold text-red-500">-{formatCurrency(discountAmount)}</span></p>}
            {taxAmount > 0 && <p className="text-sm text-neutral-600 dark:text-neutral-400">Tax ({taxPercentage}%): <span className="font-semibold">{formatCurrency(taxAmount)}</span></p>}
            <p className="text-lg font-bold text-primary dark:text-primary-light">Grand Total: {formatCurrency(grandTotal)}</p>
          </div>
        </div>

        <div>
            <label htmlFor="notes" className={commonLabelClass}>Notes/Payment Instructions</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={commonInputClass} placeholder="e.g., Bank details, thank you message..."></textarea>
        </div>

        <div className="flex justify-end pt-4">
            <Button onClick={handleGenerateAndDownload} variant="primary" size="lg" title="Generate & Download Invoice">
                Generate & Download Invoice
            </Button>
        </div>
      </div>
      
      {/* Success message removed, handled by NotificationDisplay via AppContext */}

      {previewInvoice && (
        <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg shadow no-print">
            <div className="flex justify-between items-center mb-4">
                <h3 className={sectionTitleClass.replace('border-b border-neutral-200 dark:border-neutral-700', '')}>Invoice Preview ({previewInvoice.invoiceNumber})</h3>
                 <Button onClick={() => window.print()} variant="outline" leftIcon={<PrinterIcon className="h-5 w-5"/>}>
                    Browser Print
                </Button>
            </div>
            <div className="border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-900"> 
                 <div ref={printableContentRef}>
                    <InvoiceTemplate invoice={previewInvoice} />
                 </div>
            </div>
        </div>
      )}
      
      <Modal isOpen={isCompanyProfileModalOpen} onClose={() => setIsCompanyProfileModalOpen(false)} title="Edit Company Profile" size="lg">
        <CompanyProfileForm 
            currentProfile={companyProfile || { companyName: APP_NAME, address: '', phone: '', email: '', logo: '' }} 
            onSave={(updated) => {
                updateCompanyProfile(updated); // updateCompanyProfile in AppContext now shows a notification
                setIsCompanyProfileModalOpen(false);
            }}
            onClose={() => setIsCompanyProfileModalOpen(false)}
        />
    </Modal>
    </div>
  );
};

export default CreateInvoicePage;
