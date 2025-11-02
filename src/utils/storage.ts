import type { Item, Sale } from '../types';

const ITEMS_KEY = 'laxmi_inventory_items';
const SALES_KEY = 'laxmi_inventory_sales';

export const storage = {
  // Items
  getItems: (): Item[] => {
    const items = localStorage.getItem(ITEMS_KEY);
    return items ? JSON.parse(items) : [];
  },

  saveItems: (items: Item[]): void => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  },

  // Sales
  getSales: (): Sale[] => {
    const sales = localStorage.getItem(SALES_KEY);
    return sales ? JSON.parse(sales) : [];
  },

  saveSales: (sales: Sale[]): void => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(ITEMS_KEY);
    localStorage.removeItem(SALES_KEY);
  },
};

