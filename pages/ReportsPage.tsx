
import React, { useMemo, useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Sale, Expense, ChartData, ExpenseType, ExpenseCategoryData, NotificationType } from '../types';
import { formatCurrency, getMonthYear, formatDate, getTodayDateString } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Button from '../components/common/Button';
import { InformationCircleIcon } from '../components/icons/HeroIcons';
import { useNotification } from '../contexts/NotificationContext';


// jsPDF and autoTable are expected to be available on the window object
declare global {
  interface Window {
    jspdf: any; // This will hold the jsPDF library
    autoTable: any; // This will hold the autoTable plugin
  }
}


interface MonthlyData {
  monthYear: string;
  totalSales: number;
  totalCOGS: number;
  totalExpenses: number;
  profit: number;
}

interface DailyData {
  date: string;
  totalSales: number;
  totalCOGS: number;
  totalExpenses: number;
  profit: number;
  salesTransactions: Sale[];
  expenseTransactions: Expense[];
}

const ReportsPage: React.FC = () => {
  const { sales, expenses, currencySymbol, theme } = useAppContext();
  const { showNotification } = useNotification();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const reportContentRef = useRef<HTMLDivElement>(null);


  const availableYears = useMemo(() => {
    const years = new Set<string>();
    sales.forEach(s => years.add(s.date.substring(0, 4)));
    expenses.forEach(e => years.add(e.date.substring(0, 4)));
    const currentYear = new Date().getFullYear().toString();
    if (!years.has(currentYear)) {
        years.add(currentYear);
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [sales, expenses]);

  // Monthly Aggregated Data
  const monthlyData = useMemo(() => {
    const data: Record<string, { sales: number, cogs: number, expenses: number }> = {};
    const filteredSales = sales.filter(s => s.date.startsWith(selectedYear));
    const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedYear));

    filteredSales.forEach(sale => {
      const monthYear = getMonthYear(sale.date);
      if (!data[monthYear]) data[monthYear] = { sales: 0, cogs: 0, expenses: 0 };
      data[monthYear].sales += sale.totalAmount;
      data[monthYear].cogs += sale.totalCost;
    });

    filteredExpenses.forEach(expense => {
      const monthYear = getMonthYear(expense.date);
      if (!data[monthYear]) data[monthYear] = { sales: 0, cogs: 0, expenses: 0 };
      data[monthYear].expenses += expense.amount;
    });
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.entries(data)
      .map(([monthYear, values]) => ({
        monthYear,
        totalSales: values.sales,
        totalCOGS: values.cogs,
        totalExpenses: values.expenses,
        profit: values.sales - values.cogs - values.expenses,
      }))
      .sort((a, b) => {
         const [aMonth] = a.monthYear.split(' ');
         const [bMonth] = b.monthYear.split(' ');
         return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
      });
  }, [sales, expenses, selectedYear]);

  const monthlyChartData: ChartData[] = monthlyData.map(md => ({
    name: md.monthYear.substring(0,3),
    sales: md.totalSales,
    expenses: md.totalCOGS + md.totalExpenses,
    profit: md.profit,
  }));
  
  const monthlyOverallSummary = useMemo(() => {
    let totalRevenue = 0, totalCOGS = 0, totalOtherExpenses = 0;
    monthlyData.forEach(md => {
        totalRevenue += md.totalSales;
        totalCOGS += md.totalCOGS;
        totalOtherExpenses += md.totalExpenses;
    });
    return { totalRevenue, totalCOGS, totalOtherExpenses, grossProfit: totalRevenue - totalCOGS, netProfit: totalRevenue - totalCOGS - totalOtherExpenses };
  }, [monthlyData]);

  // Daily Data
   const dailyReportData = useMemo((): DailyData | null => {
    if (!selectedDate) return null;

    const daySales = sales.filter(s => s.date === selectedDate);
    const dayExpenses = expenses.filter(e => e.date === selectedDate);

    const totalSales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCOGS = daySales.reduce((sum, s) => sum + s.totalCost, 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalSales - totalCOGS - totalExpenses;

    return {
      date: selectedDate,
      totalSales,
      totalCOGS,
      totalExpenses,
      profit,
      salesTransactions: daySales,
      expenseTransactions: dayExpenses,
    };
  }, [sales, expenses, selectedDate]);

  // Expense Breakdown Data (dynamic based on view)
  const expenseBreakdownData = useMemo((): ExpenseCategoryData[] => {
    const relevantExpenses = selectedDate 
        ? expenses.filter(e => e.date === selectedDate) 
        : expenses.filter(e => e.date.startsWith(selectedYear));
    
    const breakdown: Record<ExpenseType, number> = {
        [ExpenseType.SALARY]: 0,
        [ExpenseType.ADVERTISING]: 0,
        [ExpenseType.DELIVERY]: 0,
        [ExpenseType.OTHER]: 0,
    };

    relevantExpenses.forEach(expense => {
        if (breakdown[expense.type] !== undefined) {
            breakdown[expense.type] += expense.amount;
        } else {
            breakdown[ExpenseType.OTHER] += expense.amount; 
        }
    });
    
    return Object.entries(breakdown)
        .map(([name, value]) => ({ name: name as ExpenseType, value }))
        .filter(item => item.value > 0);
  }, [expenses, selectedYear, selectedDate]);

  const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A4DE6C', '#D0ED57', '#FFC658'];
  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#666';
  const gridStrokeColor = theme === 'dark' ? '#4B5563' : '#e0e0e0';
  const legendColor = theme === 'dark' ? '#D1D5DB' : '#1F2937';
  const commonTooltipProps = {
    formatter: (value: number) => formatCurrency(value),
    wrapperClassName: "rounded-md shadow-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-1 text-xs",
    contentStyle: { backgroundColor: theme === 'dark' ? '#374151' : '#ffffff' },
    labelStyle: { color: legendColor },
    itemStyle: { color: legendColor },
    cursor: {fill: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'}
  };


  const handlePrint = () => {
    window.print();
  };

  const generateCSV = (data: any[], headers: {label: string, key: string}[], fileName: string) => {
    const csvContent = [
      headers.map(h => h.label).join(','),
      ...data.map(row => headers.map(h => {
          let cellValue = row[h.key];
          if (typeof cellValue === 'number') return cellValue.toString();
          if (typeof cellValue === 'string') return `"${cellValue.replace(/"/g, '""')}"`; // Escape quotes
          if (typeof cellValue === 'undefined' || cellValue === null) return '';
          return `"${String(cellValue).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`Successfully exported ${fileName}`, 'success');
    } else {
        showNotification('CSV export failed: Browser does not support download attribute.', 'error');
    }
  };

  const handleExportCSV = () => {
    if (selectedDate && dailyReportData) {
        const salesReportData = dailyReportData.salesTransactions.flatMap(s => 
            s.items.map(i => ({
                saleId: s.id.substring(0,8),
                saleDate: formatDate(s.date),
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalItemAmount: i.quantity * i.unitPrice,
            }))
        );
        if (salesReportData.length > 0) {
            const salesHeaders = [
                { label: 'Sale ID', key: 'saleId'},
                { label: 'Date', key: 'saleDate'},
                { label: 'Product Name', key: 'productName'},
                { label: 'Quantity', key: 'quantity'},
                { label: 'Unit Price', key: 'unitPrice'},
                { label: 'Total', key: 'totalItemAmount'},
            ];
            generateCSV(salesReportData, salesHeaders, `daily_sales_transactions_${selectedDate}.csv`);
        } else {
            showNotification('No sales transactions to export for the selected date.', 'info');
        }
        
        if (dailyReportData.expenseTransactions.length > 0) {
            const expensesReportData = dailyReportData.expenseTransactions.map(e => ({
                expenseId: e.id.substring(0,8),
                expenseDate: formatDate(e.date),
                type: e.type,
                description: e.description,
                amount: e.amount,
            }));
            const expensesHeaders = [
                { label: 'Expense ID', key: 'expenseId'},
                { label: 'Date', key: 'expenseDate'},
                { label: 'Type', key: 'type'},
                { label: 'Description', key: 'description'},
                { label: 'Amount', key: 'amount'},
            ];
            generateCSV(expensesReportData, expensesHeaders, `daily_expenses_transactions_${selectedDate}.csv`);
        } else {
             showNotification('No expense transactions to export for the selected date.', 'info');
        }

    } else if (monthlyData.length > 0) {
        const headers = [
            { label: 'Month-Year', key: 'monthYear'},
            { label: 'Total Sales', key: 'totalSales'},
            { label: 'Total COGS', key: 'totalCOGS'},
            { label: 'Total Other Expenses', key: 'totalExpenses'},
            { label: 'Net Profit', key: 'profit'},
        ];
        generateCSV(monthlyData, headers, `monthly_summary_report_${selectedYear}.csv`);
    } else {
        showNotification("No data available to export to CSV.", 'info');
    }
  };

  const handleExportPDF = async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showNotification("PDF library (jsPDF) not loaded. Please try again later.", 'error');
      console.error("jsPDF or window.jspdf is not available.");
      return;
    }
    const { jsPDF } = window.jspdf;

    const reportElement = reportContentRef.current;
    if (!reportElement) {
      showNotification("Report content not found. Cannot generate PDF.", 'error');
      console.error("reportContentRef.current is null.");
      return;
    }

    const reportTitleText = selectedDate 
        ? `Financial Report - ${formatDate(selectedDate)}` 
        : `Financial Report - ${selectedYear}`;
    
    showNotification("Generating PDF, please wait...", 'info');

    try {
      const tempRenderDiv = document.createElement('div');
      // Apply classes that define the PDF page size and force light theme
      tempRenderDiv.className = 'report-container-pdf force-light-for-pdf';
      
      const clonedNode = reportElement.cloneNode(true) as HTMLElement;
      // Remove interactive elements that shouldn't be in the PDF from the clone
      clonedNode.querySelectorAll('.no-print-in-pdf').forEach(el => el.remove());
      
      tempRenderDiv.appendChild(clonedNode);
      document.body.appendChild(tempRenderDiv); // Must be in DOM for html2canvas

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // approx A4 width in pixels at 96DPI for windowWidth hint
      const a4WidthInPx = (210 / 25.4) * 72; // 72DPI is often what html2canvas/jspdf assumes for conversion

      await doc.html(tempRenderDiv, {
        callback: function (docInstance: any) {
          docInstance.save(`${reportTitleText.toLowerCase().replace(/\s+/g, '_')}.pdf`);
          showNotification("PDF downloaded successfully!", 'success');
          if (document.body.contains(tempRenderDiv)) {
            document.body.removeChild(tempRenderDiv);
          }
        },
        x: 0,
        y: 0,
        width: 210, // A4 width in mm
        windowWidth: a4WidthInPx, 
        autoPaging: 'slice', // 'slice' or 'text' for auto-paging
        html2canvas: {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false, // Enable for debugging html2canvas issues
          imageTimeout: 15000, // Increased timeout for images
          removeContainer: true, // Let html2canvas remove its temp container
           onclone: (documentClone: Document) => {
            // This is where you can modify the cloned document before html2canvas processes it
            // For example, ensure all chart animations are finished or explicitly set styles.
            // We are already doing this by preparing tempRenderDiv.
          }
        },
         margin: [10, 10, 10, 10] // Top, Right, Bottom, Left margins in mm
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      showNotification("Failed to generate PDF. Check console for details.", 'error');
      // Ensure cleanup if an error occurs before callback
      const existingTempDiv = document.querySelector('.report-container-pdf');
      if (existingTempDiv && document.body.contains(existingTempDiv)) {
        document.body.removeChild(existingTempDiv);
      }
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Financial Reports</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setSelectedDate(''); }}
              className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
           <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700 dark:[color-scheme:dark]"
            />
            {selectedDate && (
                <Button onClick={() => setSelectedDate('')} variant="outline" size="sm">
                    View Yearly Summary
                </Button>
            )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 no-print">
        <Button onClick={handleExportPDF} variant="secondary">Download PDF</Button>
        <Button onClick={handleExportCSV} variant="secondary">Download Excel (CSV)</Button>
        <Button onClick={handlePrint} variant="outline">Print Report</Button>
      </div>

    <div id="print-area" ref={reportContentRef}>
      {/* Report Title - will be part of the cloned content for PDF */}
      <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {selectedDate 
                ? `Financial Report - ${formatDate(selectedDate)}` 
                : `Financial Report - ${selectedYear}`}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Generated on: {formatDate(getTodayDateString())}
          </p>
      </div>

      {/* Daily Report View */}
      {selectedDate && dailyReportData && (
        <div className="space-y-6 print-section">
            {/* Summary moved to top, title adjusted */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Daily Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <SummaryItem label="Total Sales" value={formatCurrency(dailyReportData.totalSales)} />
                    <SummaryItem label="Total COGS" value={formatCurrency(dailyReportData.totalCOGS)}  isCost={true}/>
                    <SummaryItem label="Total Other Expenses" value={formatCurrency(dailyReportData.totalExpenses)} isCost={true} />
                    <SummaryItem label="Net Profit" value={formatCurrency(dailyReportData.profit)} isProfit={dailyReportData.profit >= 0} highlight={true}/>
                </div>
            </div>
             {dailyReportData.salesTransactions.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg print-table-container">
                    <h4 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Sales Transactions</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-700"><tr><th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">ID</th><th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Items</th><th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Amount</th></tr></thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {dailyReportData.salesTransactions.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">{s.id.substring(0,8)}</td>
                                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 max-w-md truncate" title={s.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}>{s.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}</td>
                                        <td className="px-4 py-2 text-sm text-right text-green-600 dark:text-green-400">{formatCurrency(s.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {dailyReportData.expenseTransactions.length > 0 && (
                 <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg print-table-container">
                    <h4 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Expense Transactions</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-700"><tr><th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Type</th><th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Description</th><th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Amount</th></tr></thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {dailyReportData.expenseTransactions.map(e => (
                                    <tr key={e.id}>
                                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100">{e.type}</td>
                                        <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 max-w-md truncate" title={e.description}>{e.description}</td>
                                        <td className="px-4 py-2 text-sm text-right text-red-500 dark:text-red-400">{formatCurrency(e.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             {dailyReportData.salesTransactions.length === 0 && dailyReportData.expenseTransactions.length === 0 && (
                <p className="text-neutral-500 dark:text-neutral-400 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow">No sales or expenses recorded for {formatDate(dailyReportData.date)}.</p>
            )}
        </div>
      )}

      {/* Monthly Report View (show if no specific date is selected) */}
      {!selectedDate && (
        monthlyData.length === 0 && availableYears.length > 0 ? (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg text-center print-section">
                <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400">No data available for the selected year {selectedYear}. Please add sales or expenses.</p>
            </div>
        ) : monthlyData.length > 0 ? (
          <div className="space-y-8 print-section">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Overall Summary for {selectedYear}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <SummaryItem label="Total Revenue" value={formatCurrency(monthlyOverallSummary.totalRevenue)} />
                  <SummaryItem label="Total COGS" value={formatCurrency(monthlyOverallSummary.totalCOGS)}  isCost={true}/>
                  <SummaryItem label="Gross Profit" value={formatCurrency(monthlyOverallSummary.grossProfit)} isProfit={monthlyOverallSummary.grossProfit >= 0} />
                  <SummaryItem label="Total Other Expenses" value={formatCurrency(monthlyOverallSummary.totalOtherExpenses)} isCost={true} />
                  <SummaryItem label="Net Profit" value={formatCurrency(monthlyOverallSummary.netProfit)} isProfit={monthlyOverallSummary.netProfit >= 0} highlight={true}/>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Monthly Performance ({selectedYear})</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor}/>
                  <XAxis dataKey="name" stroke={axisStrokeColor}/>
                  <YAxis stroke={axisStrokeColor} tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`} />
                  <Tooltip {...commonTooltipProps} />
                  <Legend wrapperStyle={{color: legendColor}}/>
                  <Bar dataKey="sales" fill="#4CAF50" name="Sales Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#FFC107" name="Total Costs (COGS + Other)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#2196F3" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Monthly Profit Trend ({selectedYear})</h3>
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor}/>
                      <XAxis dataKey="name" stroke={axisStrokeColor}/>
                      <YAxis stroke={axisStrokeColor} tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`} />
                      <Tooltip {...commonTooltipProps} />
                      <Legend wrapperStyle={{color: legendColor}}/>
                      <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 6 }} name="Net Profit" />
                  </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-x-auto print-table-container">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 p-6">Monthly Data Table ({selectedYear})</h3>
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">COGS</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Other Expenses</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {monthlyData.map(md => (
                    <tr key={md.monthYear} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{md.monthYear}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 text-right">{formatCurrency(md.totalSales)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 text-right">{formatCurrency(md.totalCOGS)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 text-right">{formatCurrency(md.totalExpenses)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${md.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {formatCurrency(md.profit)}
                      </td>
                    </tr>
                  ))}
                   <tr className="bg-neutral-100 dark:bg-neutral-700 font-bold">
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200">Total ({selectedYear})</td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200 text-right">{formatCurrency(monthlyOverallSummary.totalRevenue)}</td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200 text-right">{formatCurrency(monthlyOverallSummary.totalCOGS)}</td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200 text-right">{formatCurrency(monthlyOverallSummary.totalOtherExpenses)}</td>
                      <td className={`px-6 py-4 text-sm text-right ${monthlyOverallSummary.netProfit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {formatCurrency(monthlyOverallSummary.netProfit)}
                      </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
             availableYears.length === 0 && <p className="text-neutral-500 dark:text-neutral-400 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow text-center">No sales or expenses data available in the system to generate reports.</p>
        )
      )}
      
       {(selectedDate || monthlyData.length > 0) && expenseBreakdownData.length > 0 && (
         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg print-section">
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
                Expense Breakdown by Category ({selectedDate ? formatDate(selectedDate) : selectedYear})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={expenseBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        stroke={theme === 'dark' ? '#1F2937' : '#FFFFFF'} // neutral-800 or white for border between slices
                    >
                        {expenseBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip {...commonTooltipProps}/>
                    <Legend wrapperStyle={{color: legendColor}}/>
                </PieChart>
            </ResponsiveContainer>
         </div>
       )}
      </div> {/* End of #print-area */}
    </div>
  );
};

interface SummaryItemProps {
    label: string;
    value: string;
    isCost?: boolean;
    isProfit?: boolean;
    highlight?: boolean;
}
const SummaryItem: React.FC<SummaryItemProps> = ({label, value, isCost, isProfit, highlight}) => {
    let valueColor = 'text-neutral-900 dark:text-neutral-100';
    if (isCost) valueColor = 'text-red-500 dark:text-red-400';
    if (typeof isProfit !== 'undefined') { 
        valueColor = isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    }
    if (highlight) valueColor += ' md:text-lg';


    return (
        <div className={`p-3 rounded ${highlight ? 'bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20' : ''}`}>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">{label}</p>
            <p className={`font-semibold ${valueColor}`}>{value}</p>
        </div>
    );
};

export default ReportsPage;