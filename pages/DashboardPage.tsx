
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getTodayDateString, formatCurrency, getMonthYear } from '../utils/helpers';
import StatCard from '../components/common/StatCard';
import { ShoppingCartIcon, CurrencyBangladeshiIcon, CubeIcon, BanknotesIcon, ScaleIcon, InformationCircleIcon, ArrowTrendingUpIcon, DocumentChartBarIcon } from '../components/icons/HeroIcons';
import { Expense, Sale, ChartData, DailyChartDataPoint } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const DashboardPage: React.FC = () => {
  const { sales, expenses, products, currencySymbol, theme } = useAppContext();
  const today = getTodayDateString();
  const currentMonthNumber = (new Date().getMonth() + 1).toString(); // 1-12

  // --- Top Stat Cards Logic ---
  const todaysSales: Sale[] = sales.filter(sale => sale.date === today);
  const totalSalesToday = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalCOGSToday = todaysSales.reduce((sum, sale) => sum + sale.totalCost, 0);
  const totalProductsSoldToday = todaysSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 
  0);


  const todaysExpenses: Expense[] = expenses.filter(expense => expense.date === today);
  const otherExpensesTodayTotal = todaysExpenses
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const netProfitToday = totalSalesToday - totalCOGSToday - otherExpensesTodayTotal;
  
  const totalProductsInStock = products.length; // Renamed for clarity
  const lowStockProducts = products.filter(p => p.stock < 5).length; 

  // --- Performance Charts Logic ---
  const [selectedYearForChart, setSelectedYearForChart] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonthForChart, setSelectedMonthForChart] = useState<string>(currentMonthNumber); // Default to current month

  const availableYearsForChart = useMemo(() => {
    const years = new Set<string>();
    sales.forEach(s => years.add(s.date.substring(0, 4)));
    expenses.forEach(e => years.add(e.date.substring(0, 4)));
    const currentYear = new Date().getFullYear().toString();
    if (!years.has(currentYear)) {
        years.add(currentYear);
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [sales, expenses]);

  const chartDisplayData = useMemo((): ChartData[] | DailyChartDataPoint[] => {
    if (selectedMonthForChart === "All") {
      // Monthly aggregation for the selected year
      const data: Record<string, { sales: number, cogs: number, expenses: number }> = {};
      const filteredSales = sales.filter(s => s.date.startsWith(selectedYearForChart));
      const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedYearForChart));

      filteredSales.forEach(sale => {
        const monthYear = getMonthYear(sale.date); 
        const monthKey = monthYear.split(' ')[0]; 
        if (!data[monthKey]) data[monthKey] = { sales: 0, cogs: 0, expenses: 0 };
        data[monthKey].sales += sale.totalAmount;
        data[monthKey].cogs += sale.totalCost;
      });

      filteredExpenses.forEach(expense => {
        const monthYear = getMonthYear(expense.date);
        const monthKey = monthYear.split(' ')[0];
        if (!data[monthKey]) data[monthKey] = { sales: 0, cogs: 0, expenses: 0 };
        data[monthKey].expenses += expense.amount;
      });
      
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return monthOrder.map(monthKey => {
        const monthData = data[monthKey] || { sales: 0, cogs: 0, expenses: 0 };
        return {
          name: monthKey, 
          sales: monthData.sales,
          cogs: monthData.cogs,
          expenses: monthData.cogs + monthData.expenses, // Total Costs
          profit: monthData.sales - (monthData.cogs + monthData.expenses),
        };
      }).filter(d => d.sales > 0 || d.expenses > 0 || d.profit !== 0); 
    } else {
      // Daily aggregation for the selected month and year
      const monthIndex = parseInt(selectedMonthForChart) -1; // 0-11
      const daysInMonth = new Date(parseInt(selectedYearForChart), monthIndex + 1, 0).getDate();
      const dailyDataPoints: DailyChartDataPoint[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYearForChart}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const salesForDay = sales.filter(s => s.date === dateStr);
        const expensesForDay = expenses.filter(e => e.date === dateStr);

        const totalSales = salesForDay.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalCOGS = salesForDay.reduce((sum, s) => sum + s.totalCost, 0);
        const totalOtherExpenses = expensesForDay.reduce((sum, e) => sum + e.amount, 0);
        
        dailyDataPoints.push({
          day: day.toString(),
          sales: totalSales,
          costs: totalCOGS + totalOtherExpenses,
          profit: totalSales - totalCOGS - totalOtherExpenses,
        });
      }
      return dailyDataPoints.filter(d => d.sales > 0 || d.costs > 0 || d.profit !== 0);
    }
  }, [sales, expenses, selectedYearForChart, selectedMonthForChart]);
  
  const commonChartMargin = { top: 5, right: 30, left: 20, bottom: 5 };
  const commonTooltipProps = {
    formatter: (value: number) => formatCurrency(value),
    wrapperClassName: "rounded-md shadow-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-2",
    contentStyle: { backgroundColor: theme === 'dark' ? '#374151' : '#ffffff' }, 
    labelStyle: { color: theme === 'dark' ? '#D1D5DB' : '#1F2937' }, 
    cursor: {fill: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'} 
  };
  
  const yAxisTickFormatter = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
    return `${currencySymbol}${value}`;
  };
  
  const getChartTitle = () => {
    if (selectedMonthForChart === "All") {
      return `Monthly Overview (${selectedYearForChart})`;
    }
    const monthName = monthNames[parseInt(selectedMonthForChart) - 1];
    return `Daily Overview (${monthName} ${selectedYearForChart})`;
  };

  const getProfitTrendTitle = () => {
     if (selectedMonthForChart === "All") {
      return `Net Profit Trend (${selectedYearForChart})`;
    }
    const monthName = monthNames[parseInt(selectedMonthForChart) - 1];
    return `Daily Net Profit Trend (${monthName} ${selectedYearForChart})`;
  };

  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#666'; 
  const gridStrokeColor = theme === 'dark' ? '#4B5563' : '#e0e0e0'; 

  return (
    <div className="space-y-6">
      {/* --- Top Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Sales Today"
          value={formatCurrency(totalSalesToday)}
          icon={<ShoppingCartIcon className="h-6 w-6" />}
          colorClass="bg-secondary"
        />
         <StatCard
          title="Products Sold Today"
          value={totalProductsSoldToday}
          icon={<ShoppingCartIcon className="h-6 w-6" />} // Re-using icon, could be different
          colorClass="bg-blue-500" // Different color
        />
        <StatCard
          title="Net Profit Today"
          value={formatCurrency(netProfitToday)}
          icon={<ScaleIcon className="h-6 w-6" />}
          colorClass={netProfitToday >= 0 ? "bg-green-500" : "bg-red-500"}
        />
        <StatCard
          title="COGS Today"
          value={formatCurrency(totalCOGSToday)}
          icon={<BanknotesIcon className="h-6 w-6" />}
          colorClass="bg-orange-500"
        />
        <StatCard
          title="Other Expenses Today"
          value={formatCurrency(otherExpensesTodayTotal)}
          icon={<CurrencyBangladeshiIcon className="h-6 w-6" />}
          colorClass="bg-accent"
        />
         <StatCard
          title="Total Products in Stock"
          value={totalProductsInStock}
          icon={<CubeIcon className="h-6 w-6" />}
          colorClass="bg-purple-500"
        />
      </div>
      
      {lowStockProducts > 0 && (
        <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md shadow-md" role="alert">
          <div className="flex">
            <div className="py-1"><CubeIcon className="h-6 w-6 text-red-500 dark:text-red-400 mr-3"/></div>
            <div>
                <p className="font-bold">Low Stock Alert!</p>
                <p className="text-sm">{lowStockProducts} product(s) are running low on stock (less than 5 units). Please check the Products page to restock.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Today's Activity Lists --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Today's Sales ({todaysSales.length})</h3>
          {todaysSales.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">No sales recorded today.</p>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-96 overflow-y-auto">
              {todaysSales.map(sale => (
                <li key={sale.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Sale ID: {sale.id.substring(0,6)} ({sale.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span className="text-sm font-semibold text-secondary">{formatCurrency(sale.totalAmount)}</span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Today's Expenses ({todaysExpenses.length})</h3>
           {todaysExpenses.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">No expenses recorded today.</p>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-96 overflow-y-auto">
              {todaysExpenses.map(expense => (
                <li key={expense.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{expense.type}: {expense.description}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-500">{formatCurrency(expense.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- Performance Charts Section --- */}
      <div className="space-y-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 flex items-center">
            <DocumentChartBarIcon className="h-7 w-7 mr-2 text-primary"/>
            Performance Charts
          </h2>
          <div className="flex gap-x-2">
            <select
              value={selectedMonthForChart}
              onChange={(e) => setSelectedMonthForChart(e.target.value)}
              className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700"
            >
              <option value="All">All Months</option>
              {monthNames.map((month, index) => (
                <option key={index + 1} value={(index + 1).toString()}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYearForChart}
              onChange={(e) => setSelectedYearForChart(e.target.value)}
              className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-700"
            >
              {availableYearsForChart.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {chartDisplayData.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-neutral-800 rounded-lg shadow">
            <InformationCircleIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"/>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center">
                <ScaleIcon className="h-6 w-6 mr-2 text-primary" />
                {getChartTitle()}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                {selectedMonthForChart === "All" ? "Sales Revenue vs Total Costs vs Net Profit by month" : "Daily Sales vs Total Costs vs Net Profit"}
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartDisplayData as any} margin={commonChartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor}/>
                  <XAxis dataKey={selectedMonthForChart === "All" ? "name" : "day"} stroke={axisStrokeColor}/>
                  <YAxis stroke={axisStrokeColor} tickFormatter={yAxisTickFormatter} />
                  <Tooltip {...commonTooltipProps} />
                  <Legend wrapperStyle={{color: theme === 'dark' ? '#D1D5DB' : '#1F2937'}}/>
                  <Bar dataKey="sales" fill="#4CAF50" name="Sales Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={selectedMonthForChart === "All" ? "expenses" : "costs"} fill="#FFC107" name="Total Costs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#3B82F6" name="Net Profit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
               <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center">
                <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-green-500" />
                {getProfitTrendTitle()}
              </h3>
               <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                 {selectedMonthForChart === "All" ? "Progression of net profit over the months" : "Daily net profit progression"}
               </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartDisplayData as any} margin={commonChartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor}/>
                  <XAxis dataKey={selectedMonthForChart === "All" ? "name" : "day"} stroke={axisStrokeColor}/>
                  <YAxis stroke={axisStrokeColor} tickFormatter={yAxisTickFormatter} />
                  <Tooltip {...commonTooltipProps} />
                  <Legend wrapperStyle={{color: theme === 'dark' ? '#D1D5DB' : '#1F2937'}}/>
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 6 }} name="Net Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
