import React, { useState, useEffect } from 'react';
import type { Sale } from '../types';
import { storage } from '../utils/storage';

interface ReportsProps {
  refreshTrigger: number;
  onDataChange?: () => void;
}

interface DailySales {
  date: string;
  totalRevenue: number;
  itemsSold: number;
  transactionCount: number;
  sales: Sale[];
}

const Reports: React.FC<ReportsProps> = ({ refreshTrigger, onDataChange }) => {
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [dailySalesData, setDailySalesData] = useState<DailySales[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7'); // days
  const [sortBy, setSortBy] = useState<'date' | 'revenue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadSales();
  }, [refreshTrigger]);

  useEffect(() => {
    calculateDailySales();
  }, [allSales, selectedDateRange]);

  const loadSales = () => {
    const sales = storage.getSales();
    setAllSales(sales);
  };

  const calculateDailySales = () => {
    const salesByDate: { [key: string]: Sale[] } = {};
    
    // Group sales by date
    allSales.forEach((sale) => {
      if (!salesByDate[sale.date]) {
        salesByDate[sale.date] = [];
      }
      salesByDate[sale.date].push(sale);
    });

    // Calculate daily totals
    const dailyData: DailySales[] = Object.keys(salesByDate).map((date) => {
      const sales = salesByDate[date];
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const itemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
      
      return {
        date,
        totalRevenue,
        itemsSold,
        transactionCount: sales.length,
        sales,
      };
    });

    // Filter by date range if specified
    let filteredData = dailyData;
    if (selectedDateRange !== 'all') {
      const daysAgo = parseInt(selectedDateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      filteredData = dailyData.filter((day) => {
        const dayDate = new Date(day.date);
        return dayDate >= cutoffDate;
      });
    }

    // Sort data
    filteredData.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.totalRevenue - b.totalRevenue
          : b.totalRevenue - a.totalRevenue;
      }
    });

    setDailySalesData(filteredData);
  };

  const totalRevenue = dailySalesData.reduce((sum, day) => sum + day.totalRevenue, 0);
  const totalItemsSold = dailySalesData.reduce((sum, day) => sum + day.itemsSold, 0);
  const totalTransactions = dailySalesData.reduce((sum, day) => sum + day.transactionCount, 0);
  const averageDailyRevenue = dailySalesData.length > 0 ? totalRevenue / dailySalesData.length : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'revenue', 'asc' | 'desc'];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="revenue-desc">Highest Revenue</option>
            <option value="revenue-asc">Lowest Revenue</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-gray-800">{totalItemsSold}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Daily</p>
              <p className="text-2xl font-bold text-gray-800">₹{averageDailyRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Sales List */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
        
        {dailySalesData.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No sales data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start recording sales to see your daily reports
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Sold</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Avg Order</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailySalesData.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{getShortDate(day.date)}</span>
                        <span className="text-xs text-gray-500 hidden md:inline">{formatDate(day.date)}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {day.transactionCount}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {day.itemsSold}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      ₹{day.transactionCount > 0 ? (day.totalRevenue / day.transactionCount).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{day.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dailySalesData.length} day{dailySalesData.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {totalTransactions}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {totalItemsSold}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    ₹{totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                    ₹{totalRevenue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Dangerous Actions Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Dangerous Actions</h3>
            <p className="text-sm text-red-700">
              Clear all inventory and sales data. This action cannot be undone!
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('⚠️ WARNING: This will delete ALL inventory items and sales data!\n\nAre you absolutely sure? This action CANNOT be undone.')) {
                if (window.confirm('Final confirmation: Delete everything?')) {
                  storage.clearAll();
                  onDataChange?.();
                  loadSales();
                }
              }
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;

