export interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  initialStock?: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  time: string;
}

export interface Category {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: 'stationary', name: 'Stationary' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'other', name: 'Other' },
];

