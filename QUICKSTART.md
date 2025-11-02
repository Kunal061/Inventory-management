# Quick Start Guide - Laxmi Stationary App

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to `http://localhost:5173` in your browser

---

## 📱 Features Overview

### Dashboard Tab
- View daily revenue and sales count
- Track inventory value
- Get low stock alerts
- See recent sales

### Inventory Tab
- **Add Items**: Click "Add Item" button
  - Enter name, category, price, stock
  - Categories: Stationary, Electronics, Accessories, Other
- **Update Stock**: Click "Update Stock" on any item card
  - Enter new quantity when buying from market
- **Edit**: Modify item details
- **Delete**: Remove obsolete items
- **Search**: Find items by name
- **Filter**: Sort by category

### Sales Tab
- **Record Sale**: 
  - Select item from dropdown
  - Enter quantity
  - Click "Complete Sale"
- **View History**: See all sales for selected date
- **Daily Total**: Check revenue for any date

---

## 💾 Data Storage

- All data saved in browser LocalStorage
- Automatically persists across sessions
- No internet required
- Safe and private

**Important**: Data will be lost if you clear browser cache

---

## 🎨 Customization

### Change Shop Name
1. Open `src/App.tsx`
2. Find "Laxmi Stationary" text
3. Replace with your shop name

### Add More Categories
1. Open `src/types/index.ts`
2. Edit `CATEGORIES` array:
```typescript
export const CATEGORIES: Category[] = [
  { id: 'stationary', name: 'Stationary' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'your-category', name: 'Your Category' },  // Add here
];
```

### Change Colors
1. Open `tailwind.config.js`
2. Modify theme colors as needed
3. Tailwind utility classes will update automatically

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder - ready to deploy!

---

## 🌐 Deployment Options

- **Vercel**: Drag and drop `dist` folder
- **Netlify**: Connect GitHub repo or upload `dist`
- **GitHub Pages**: Deploy static files
- **Any web hosting**: Upload `dist` contents

---

## 🔧 Troubleshooting

**Problem**: Styles not showing
- Solution: Run `npm run dev` again

**Problem**: Data lost
- Solution: Check if browser cache was cleared

**Problem**: Can't add items
- Solution: Check browser console for errors

---

## 📞 Support

For issues or customization, contact the developer.

**Enjoy managing your inventory! 🎉**

