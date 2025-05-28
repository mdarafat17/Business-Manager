
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChartData } from '../types';
import { formatCurrency, getMonthYear } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { InformationCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ScaleIcon } from '../components/icons/HeroIcons';

const ChartsPage: React.FC = () => {
  const { sales, expenses, currencySymbol } = useAppContext();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

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

  const monthlyChartData = useMemo((): ChartData[] => {
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
        name: monthYear.substring(0,3), // Use short month name for X-axis
        monthFullName: monthYear, // Keep full name for sorting or detailed display
        sales: values.sales,
        cogs: values.cogs,
        expenses: values.cogs + values.expenses, // Total Costs
        profit: values.sales - (values.cogs + values.expenses),
      }))
      .sort((a, b) => {
         const [aMonth] = a.monthFullName.split(' ');
         const [bMonth] = b.monthFullName.split(' ');
         return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
      });
  }, [sales, expenses, selectedYear]);

  if (availableYears.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow">
        <InformationCircleIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4"/>
        <p className="text-neutral-500 text-lg">No data available to display charts.</p>
        <p className="text-neutral-400 text-sm">Start by adding some sales or expenses.</p>
      </div>
    );
  }
  
  const commonChartMargin = { top: 5, right: 30, left: 20, bottom: 5 };
  const commonTooltipProps = {
    formatter: (value: number) => formatCurrency(value),
    wrapperClassName: "rounded-md shadow-lg bg-white border border-neutral-200 p-2",
    cursor: {fill: 'rgba(229, 231, 235, 0.5)'}
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-neutral-700">Monthly Performance Charts</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-900 bg-white"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {monthlyChartData.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <InformationCircleIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4"/>
          <p className="text-neutral-500 text-lg">No data for {selectedYear}.</p>
        </div>
      ) : (
        <>
          {/* Combined Sales, Costs, Profit Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-neutral-700 mb-1 flex items-center">
              <ScaleIcon className="h-6 w-6 mr-2 text-primary" />
              Monthly Overview ({selectedYear})
            </h3>
            <p className="text-sm text-neutral-500 mb-4">Sales Revenue vs Total Costs vs Net Profit</p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyChartData} margin={commonChartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="name" stroke="#666"/>
                <YAxis stroke="#666" tickFormatter={(value) => `${currencySymbol}${value / 1000}k`} />
                <Tooltip {...commonTooltipProps} />
                <Legend />
                <Bar dataKey="sales" fill="#4CAF50" name="Sales Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#FFC107" name="Total Costs (COGS + Other)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#3B82F6" name="Net Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Profit Trend Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
             <h3 className="text-xl font-semibold text-neutral-700 mb-1 flex items-center">
              {monthlyChartData[monthlyChartData.length-1]?.profit >= (monthlyChartData[0]?.profit || 0) ? <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-green-500" /> : <ArrowTrendingDownIcon className="h-6 w-6 mr-2 text-red-500" />}
              Net Profit Trend ({selectedYear})
            </h3>
             <p className="text-sm text-neutral-500 mb-4">Progression of net profit over the months.</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData} margin={commonChartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="name" stroke="#666"/>
                <YAxis stroke="#666" tickFormatter={(value) => `${currencySymbol}${value / 1000}k`} />
                <Tooltip {...commonTooltipProps} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 6 }} name="Net Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartsPage;
