import React, { useState, useEffect } from 'react';
import type { Item, Sale } from '../types';
import { storage } from '../utils/storage';

interface SalesProps {
  refreshTrigger: number;
  onDataChange: () => void;
}

const Sales: React.FC<SalesProps> = ({ refreshTrigger, onDataChange }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [items, setItems] = useState<Item[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = () => {
    const allItems = storage.getItems();
    const allSales = storage.getSales();
    setItems(allItems);
    setSales(allSales);
  };

  const handleSellItem = () => {
    if (!selectedItem) {
      alert('Please select an item');
      return;
    }

    const qty = parseInt(quantity);
    
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (qty > selectedItem.stock) {
      alert(`Only ${selectedItem.stock} units available in stock`);
      return;
    }

    // Create sale record
    const now = new Date();
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity: qty,
      price: selectedItem.price,
      total: selectedItem.price * qty,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
    };

    // Update stock
    const updatedItems = items.map((item) =>
      item.id === selectedItem.id ? { ...item, stock: item.stock - qty } : item
    );

    // Save changes
    storage.saveItems(updatedItems);
    storage.saveSales([...sales, sale]);

    // Reset form
    setSelectedItem(null);
    setQuantity('1');
    
    loadData();
    onDataChange();
  };

  const filteredSales = sales.filter((sale) => sale.date === filterDate);
  const filteredTotal = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Record Sale</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Sell - Card View for Mobile */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Sell</h3>
        
        {/* Grid View for Items - Mobile Friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {items
            .filter((item) => item.stock > 0)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setQuantity('1');
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left active:scale-95 ${
                  selectedItem?.id === item.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-indigo-600">₹{item.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">Stock: {item.stock}</p>
                  </div>
                  {selectedItem?.id === item.id && (
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
        </div>

        {/* Quantity and Complete Sale */}
        {selectedItem && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 sm:text-right w-full sm:w-auto">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ₹{(selectedItem.price * parseInt(quantity || '0')).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleSellItem}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all"
              >
                Complete Sale
              </button>
            </div>
          </div>
        )}

        {items.filter((item) => item.stock > 0).length === 0 && (
          <p className="text-center text-gray-500 py-8">No items available for sale</p>
        )}
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Sales History</h3>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-600">Total for Selected Date</p>
            <p className="text-2xl font-bold text-green-600">₹{filteredTotal.toFixed(2)}</p>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sales recorded for this date</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => {
                  const item = items.find(i => i.id === sale.itemId);
                  return (
                    <tr key={sale.id}>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{sale.itemName}</span>
                          <span className="md:hidden px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs w-fit mt-1">
                            {item?.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                          {item?.category}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.quantity}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        ₹{sale.price.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{sale.total.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {sale.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;

