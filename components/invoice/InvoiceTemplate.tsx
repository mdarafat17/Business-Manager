
import React from 'react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';


interface InvoiceTemplateProps {
  invoice: Invoice;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
  const {
    companyProfileSnapshot: company,
    customerSnapshot: customer,
    invoiceNumber,
    date,
    dueDate,
    items,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    notes,
    qrCodeData
  } = invoice;

  // Styles here are for the on-screen preview. 
  // The .invoice-container-print class in index.html handles actual print styling (forcing light mode).
  // For PDF generation, we also ensure a light theme is used by rendering into a div with a specific class.
  const isDarkThemeForPreview = document.documentElement.classList.contains('dark');
  const previewBg = isDarkThemeForPreview ? 'bg-neutral-800' : 'bg-white';
  const previewTextPrimary = isDarkThemeForPreview ? 'text-neutral-100' : 'text-neutral-800';
  const previewTextSecondary = isDarkThemeForPreview ? 'text-neutral-300' : 'text-neutral-600';
  const previewTextMuted = isDarkThemeForPreview ? 'text-neutral-400' : 'text-neutral-500';
  const previewBorder = isDarkThemeForPreview ? 'border-neutral-700' : 'border-neutral-200';
  const previewTableHeadBg = isDarkThemeForPreview ? 'bg-neutral-700' : 'bg-neutral-100';


  return (
    // This div is for the on-screen preview. Print styles are controlled by @media print and invoice-container-print.
    <div className={`${previewBg} p-6 md:p-8 lg:p-10 font-sans print:bg-white print:text-black`} style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
      {/* Header with Logo */}
      <div className="text-center mb-6">
        {company.logo && (
          <img src={company.logo} alt={`${company.companyName} Logo`} className="mx-auto h-16 md:h-20 object-contain mb-2" />
        )}
        <h1 className={`text-2xl md:text-3xl font-bold ${previewTextPrimary}`}>{company.companyName}</h1>
        <p className={`text-xs ${previewTextMuted}`}>{company.address}</p>
        <p className={`text-xs ${previewTextMuted}`}>Phone: {company.phone} | Email: {company.email}</p>
      </div>

      {/* Invoice Info and Customer Info */}
      <div className="flex flex-col md:flex-row justify-between mb-6 text-sm">
        <div className="mb-4 md:mb-0">
          <h2 className={`text-lg font-semibold ${previewTextPrimary} mb-1`}>INVOICE</h2>
          <p className={`${previewTextSecondary}`}><strong>Invoice #:</strong> {invoiceNumber}</p>
          <p className={`${previewTextSecondary}`}><strong>Date:</strong> {formatDate(date)}</p>
          {dueDate && <p className={`${previewTextSecondary}`}><strong>Due Date:</strong> {formatDate(dueDate)}</p>}
        </div>
        <div className="md:text-right">
          <h3 className={`font-semibold ${previewTextPrimary} mb-1`}>Bill To:</h3>
          <p className={`${previewTextPrimary} font-medium`}>{customer.name}</p>
          <p className={`${previewTextSecondary}`}>{customer.address}</p>
          <p className={`${previewTextSecondary}`}>{customer.city}, {customer.district}</p>
          <p className={`${previewTextSecondary}`}>Phone: {customer.phone}</p>
          {customer.email && <p className={`${previewTextSecondary}`}>Email: {customer.email}</p>}
        </div>
      </div>
      
      {/* Items Table */}
      <div className="w-full">
          <table className="w-full mb-6 text-sm">
              <thead className={`${previewTableHeadBg}`}>
              <tr>
                  <th className={`px-3 py-2 text-left font-semibold ${previewTextPrimary} uppercase`}>Description</th>
                  <th className={`px-3 py-2 text-right font-semibold ${previewTextPrimary} uppercase w-1/6`}>Qty</th>
                  <th className={`px-3 py-2 text-right font-semibold ${previewTextPrimary} uppercase w-1/5`}>Unit Price</th>
                  <th className={`px-3 py-2 text-right font-semibold ${previewTextPrimary} uppercase w-1/5`}>Total</th>
              </tr>
              </thead>
              <tbody className={`divide-y ${previewBorder}`}>
              {items.map((item, index) => (
                  <tr key={item.id || index}>
                  <td className={`px-3 py-2 ${previewTextSecondary}`}>{item.description}</td>
                  <td className={`px-3 py-2 text-right ${previewTextSecondary}`}>{item.quantity}</td>
                  <td className={`px-3 py-2 text-right ${previewTextSecondary}`}>{formatCurrency(item.unitPrice)}</td>
                  <td className={`px-3 py-2 text-right ${previewTextSecondary}`}>{formatCurrency(item.total)}</td>
                  </tr>
              ))}
              </tbody>
          </table>
      </div>

      {/* Totals and QR Code Section */}
      <div className="flex flex-col md:flex-row justify-between mb-6">
        {/* QR Code (Left Side or Top on Small Screens) */}
        {qrCodeData && (
          <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center md:items-start print:w-auto print:self-start print:mt-2">
            <div className={`p-2 border ${previewBorder} rounded-md bg-white qr-code-for-pdf`}> {/* QR code on white background always for readability, added qr-code-for-pdf class */}
              <QRCodeSVG value={qrCodeData} size={80} level="M" bgColor="#FFFFFF" fgColor="#000000" />
            </div>
            <p className={`text-xs ${previewTextMuted} mt-1 text-center md:text-left`}>Scan for details</p>
          </div>
        )}

        {/* Totals (Right Side or Bottom on Small Screens) */}
        <div className="w-full md:w-2/5 text-sm">
          <div className={`flex justify-between py-1 border-b ${previewBorder}`}>
            <span className={`${previewTextSecondary}`}>Subtotal:</span>
            <span className={`${previewTextPrimary}`}>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className={`flex justify-between py-1 border-b ${previewBorder}`}>
              <span className={`${previewTextSecondary}`}>Discount:</span>
              <span className="text-red-500 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className={`flex justify-between py-1 border-b ${previewBorder}`}>
              <span className={`${previewTextSecondary}`}>Tax:</span>
              <span className={`${previewTextPrimary}`}>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 mt-1">
            <span className={`text-base font-bold ${previewTextPrimary}`}>Grand Total:</span>
            <span className={`text-base font-bold ${previewTextPrimary}`}>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>


      {/* Notes */}
      {notes && (
        <div className="mb-6 text-sm">
          <h4 className={`font-semibold ${previewTextPrimary} mb-1`}>Notes:</h4>
          <p className={`${previewTextSecondary} whitespace-pre-wrap`}>{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className={`text-center text-xs ${previewTextMuted} pt-4 border-t ${previewBorder}`}>
        <p>Thank you for your business!</p>
        <p>{company.companyName} | {invoiceNumber}</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;