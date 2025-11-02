import React, { useState, useEffect } from 'react';
import type { Item } from '../types';
import { storage } from '../utils/storage';
import AddItemModal from './AddItemModal';

interface InventoryProps {
  refreshTrigger: number;
  onDataChange: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ refreshTrigger, onDataChange }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [stockUpdateModal, setStockUpdateModal] = useState<Item | null>(null);
  const [newStock, setNewStock] = useState<string>('');

  useEffect(() => {
    loadItems();
  }, [refreshTrigger]);

  const loadItems = () => {
    const allItems = storage.getItems();
    setItems(allItems);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter((item) => item.id !== id);
      storage.saveItems(updatedItems);
      loadItems();
      onDataChange();
    }
  };

  const handleOpenStockUpdate = (item: Item) => {
    setStockUpdateModal(item);
    setNewStock('');
  };

  const handleUpdateStock = () => {
    if (stockUpdateModal && newStock) {
      const stockValue = parseInt(newStock) || 0; // Handle NaN case
      if (stockValue < 0) {
        alert('Please enter a valid stock number');
        return;
      }

      const updatedItems = items.map((item) =>
        item.id === stockUpdateModal.id ? { ...item, stock: stockValue } : item
      );
      storage.saveItems(updatedItems);
      loadItems();
      onDataChange();
      setStockUpdateModal(null);
      setNewStock('');
    }
  };

  const categories = ['all', 'stationary', 'electronics', 'accessories', 'other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                item.stock < 10 ? 'border-yellow-500' : item.stock < 20 ? 'border-orange-500' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">₹{item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">per unit</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">Stock</span>
                    <span className={`text-lg font-bold ${item.stock < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                      {item.stock} units
                    </span>
                  </div>
                  {item.stock < 10 && (
                    <p className="text-xs text-red-600">Low stock!</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenStockUpdate(item)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm"
                  >
                    Update Stock
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsAddModalOpen(true);
                    }}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {isAddModalOpen && (
        <AddItemModal
          item={editingItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onSave={() => {
            loadItems();
            onDataChange();
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Stock Update Modal */}
      {stockUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Update Stock - {stockUpdateModal.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <input
                type="text"
                value={stockUpdateModal.stock}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Quantity
              </label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter new stock quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStockUpdateModal(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

