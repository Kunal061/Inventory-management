# Laxmi Stationary - Inventory Management System

A modern, efficient inventory management application for "Laxmi Stationary" shop to track items, manage stock, and record sales with a beautiful, user-friendly interface.

## 🚀 Quick Deploy

Want to deploy this app to production? See our deployment guides:

- **[QUICK-DEPLOY.md](QUICK-DEPLOY.md)** - Fast 15-minute deployment guide
- **[DEPLOY.md](DEPLOY.md)** - Complete deployment guide with Jenkins CI/CD
- **Deploy to AWS EC2** with automated CI/CD pipeline

## Features

### 📊 Dashboard
- **Daily Revenue Tracking**: View today's total revenue and sales count
- **Low Stock Alerts**: Automatically highlights items with stock below 10 units
- **Inventory Value**: Calculate total value of current inventory
- **Recent Sales**: Display the latest 5 sales transactions
- **Date Filter**: Select any date to view historical sales data

### 📦 Inventory Management
- **Add/Edit Items**: Create new products or update existing ones
- **Stock Tracking**: Monitor current stock levels in real-time
- **Stock Updates**: Quick bulk stock updates when purchasing from market
- **Categorization**: Organize items into categories (Stationary, Electronics, Accessories, Other)
- **Search & Filter**: Find items quickly by name or category
- **Visual Indicators**: Color-coded stock status (Green/Orange/Red)
- **Delete Items**: Remove obsolete products

### 💰 Sales Management
- **Quick Sell**: Fast checkout process with item selection and quantity input
- **Sales History**: Complete transaction log with timestamps
- **Daily Totals**: Calculate total revenue for any selected date
- **Automatic Stock Deduction**: Stock levels automatically decrease after each sale
- **Receipt Details**: View item name, category, quantity, price, and total for each sale

### 📊 Sales Reports
- **Daily Sales Tracking**: View sales breakdown by day with all details
- **Flexible Date Ranges**: Filter by last 7, 14, 30, 90 days or all time
- **Comprehensive Statistics**: Total revenue, items sold, transactions, and average daily sales
- **Smart Sorting**: Sort by date (newest/oldest) or revenue (highest/lowest)
- **Visual Summary Cards**: Quick overview of key metrics at a glance
- **Detailed Table**: Complete daily breakdown with transaction count and average order value

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: Vite 7
- **Data Storage**: LocalStorage (Browser-based)
- **Icons**: Heroicons (SVG)

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd laxmi-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - The app will automatically open

## Building for Production

### Create Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The optimized files will be in the `dist/` folder.

## Usage Guide

### Adding Items
1. Go to **Inventory** tab
2. Click **"Add Item"** button
3. Fill in:
   - Item Name (e.g., "Blue Pen", "iPhone Charger", "Tempered Glass")
   - Category (Stationary/Electronics/Accessories/Other)
   - Price per unit (₹)
   - Initial stock quantity
4. Click **"Add Item"**

### Updating Stock
1. Go to **Inventory** tab
2. Find the item card
3. Click **"Update Stock"**
4. Enter new quantity
5. Click **"Update Stock"**

### Recording a Sale
1. Go to **Sales** tab
2. Select item from dropdown
3. Enter quantity
4. Review total amount
5. Click **"Complete Sale"**

### Viewing Dashboard
- Click **Dashboard** tab
- View today's statistics:
  - Total revenue
  - Items sold
  - Low stock alerts
  - Inventory value
- Filter by date to see historical data
- Check recent sales list

## Data Storage

- All data is stored in browser's **LocalStorage**
- No server or database required
- Data persists across browser sessions
- **Warning**: Clearing browser data will delete all inventory

### Backup Recommendation
For production use, consider implementing:
- Export/Import functionality
- Cloud storage sync
- Database integration

## Customization

### Colors & Branding
Edit `tailwind.config.js` to customize:
- Brand colors
- Typography
- Spacing
- Components

### Categories
Modify `src/types/index.ts`:
```typescript
export const CATEGORIES: Category[] = [
  { id: 'stationary', name: 'Stationary' },
  { id: 'electronics', name: 'Electronics' },
  // Add your categories
];
```

## Project Structure

```
laxmi-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Dashboard with stats
│   │   ├── Inventory.tsx      # Inventory management
│   │   ├── Sales.tsx          # Sales recording
│   │   └── AddItemModal.tsx   # Add/Edit item modal
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── utils/
│   │   └── storage.ts         # LocalStorage utilities
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML template
├── tailwind.config.js         # Tailwind config
├── postcss.config.js          # PostCSS config
├── vite.config.ts             # Vite config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

## Future Enhancements

Potential features for client customization:
- Barcode scanning
- Customer management
- Purchase/supplier tracking
- Advanced reports & analytics
- Multi-user support
- Email/PDF receipts
- Inventory alerts (email notifications)
- Data export (CSV/Excel)
- Cloud backup integration

## License

This project is created for commercial use by the freelancer.

## Support

For issues or customization requests, contact the developer.

---

**Built with ❤️ for Laxmi Stationary**
