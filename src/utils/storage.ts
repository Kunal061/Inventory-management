import type { Item, Sale } from '../types';

const ITEMS_KEY = 'laxmi_inventory_items';
const SALES_KEY = 'laxmi_inventory_sales';

export const storage = {
  // Items
  getItems: (): Item[] => {
    try {
      const items = localStorage.getItem(ITEMS_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error parsing items from localStorage:', error);
      return [];
    }
  },

  saveItems: (items: Item[]): void => {
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving items to localStorage:', error);
    }
  },

  // Sales
  getSales: (): Sale[] => {
    try {
      const sales = localStorage.getItem(SALES_KEY);
      return sales ? JSON.parse(sales) : [];
    } catch (error) {
      console.error('Error parsing sales from localStorage:', error);
      return [];
    }
  },

  saveSales: (sales: Sale[]): void => {
    try {
      localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales to localStorage:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    try {
      localStorage.removeItem(ITEMS_KEY);
      localStorage.removeItem(SALES_KEY);
    } catch (error) {
      console.error('Error clearing data from localStorage:', error);
    }
  },
};