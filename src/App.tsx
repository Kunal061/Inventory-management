import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Reports from './components/Reports';

type Tab = 'dashboard' | 'inventory' | 'sales' | 'reports';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleDataChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard refreshTrigger={refreshTrigger} />;
      case 'inventory':
        return <Inventory refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />;
      case 'sales':
        return <Sales refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />;
      case 'reports':
        return <Reports refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />;
      default:
        return <Dashboard refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Laxmi Stationary</h1>
            <p className="text-indigo-100 mt-1 text-sm sm:text-base">Inventory Management System</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200 overflow-x-auto">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 min-w-max">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm sm:text-base">Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('inventory')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm sm:text-base">Inventory</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('sales')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm sm:text-base">Sales</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('reports')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm sm:text-base">Reports</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Laxmi Stationary - Inventory Management System | Built with React & TypeScript
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Manage your inventory and track sales effortlessly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
