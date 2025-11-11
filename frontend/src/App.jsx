import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from "@vercel/analytics/react";
import { 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Github,
  Database,
  Zap,
  X,
  User,
  Trophy,
  Shield,
  Home,
  Menu,
  XCircle
} from 'lucide-react';

import PredictionForm from './components/PredictionForm';
import HistoryList from './components/HistoryList';
import CarRankings from './pages/CarRankings';
import AdminDashboard from './pages/AdminDashboard';
import { healthCheck } from './services/api';

// HomePage component with prediction functionality
const HomePage = () => {
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  const [lastPrediction, setLastPrediction] = useState(null);

  // Handle successful prediction
  const handlePredictionComplete = (predictionData) => {
    setLastPrediction(predictionData);
    setRefreshHistoryTrigger(prev => prev + 1); // Trigger history refresh
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
          Predict Your Car's CO₂ Emissions
        </h2>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
         This prediction is based on a machine learning model trained on real car data. 
        Results are estimates and may vary from actual emissions.
        </p>
      </div>

      {/* Latest Prediction Display */}
      {lastPrediction && (
        <div className="mb-8">
          <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Latest Prediction</h3>
            <div className="text-2xl md:text-3xl font-bold text-yellow-300 mb-2">
              {lastPrediction.formattedPrediction}
            </div>
            <p className="text-yellow-100 text-sm">
              Engine: {lastPrediction.input.engineSize}L • 
              Cylinders: {lastPrediction.input.cylinders} • 
              Fuel: {lastPrediction.input.fuelConsumption}L/100km
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction Form */}
        <div className="lg:col-span-1">
          <PredictionForm onPredictionComplete={handlePredictionComplete} />
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
          <HistoryList refreshTrigger={refreshHistoryTrigger} />
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-6 text-center">
          <Zap className="mx-auto mb-4 text-yellow-300" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Instant Predictions</h3>
          <p className="text-slate-300 text-sm">
            Get CO₂ emission predictions in seconds using our trained machine learning model.
          </p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-6 text-center">
          <Database className="mx-auto mb-4 text-blue-300" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Prediction History</h3>
          <p className="text-slate-300 text-sm">
            Track all your predictions with detailed history and the ability to compare results.
          </p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-6 text-center">
          <Leaf className="mx-auto mb-4 text-green-300" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Environmental Impact</h3>
          <p className="text-slate-300 text-sm">
            Make informed decisions about your vehicle's environmental footprint.
          </p>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ backendStatus, showStatusTooltip, setShowStatusTooltip, getStatusIndicator }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/car-rankings', label: 'Car Rankings', icon: Trophy },
    { path: '/admin', label: 'Admin', icon: Shield }
  ];

  const isActivePage = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-600/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EcoMeter</h1>
              <p className="text-sm text-slate-300">Car CO₂ Emissions Predictor</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActivePage(path)
                    ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Status and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {getStatusIndicator()}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-yellow-300 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-600/30 mt-4 pt-4">
            <div className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActivePage(path)
                      ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await healthCheck();
      setBackendStatus('healthy');
      console.log('✅ Backend health check passed:', health);
    } catch (error) {
      setBackendStatus('unhealthy');
      console.error('❌ Backend health check failed:', error);
      toast.error('Backend service is unavailable. Some features may not work.');
    }
  };

  // Get status indicator with custom tooltip
  const getStatusIndicator = () => {
    const getStatusConfig = () => {
      switch (backendStatus) {
        case 'healthy':
          return {
            icon: <CheckCircle className="w-5 h-5" />,
            text: "All systems operational",
            iconColor: "text-green-400",
            tooltipBg: "bg-green-600",
            tooltipText: "text-white"
          };
        case 'unhealthy':
          return {
            icon: <X className="w-5 h-5" />,
            text: "Service unavailable",
            iconColor: "text-red-400",
            tooltipBg: "bg-red-600",
            tooltipText: "text-white"
          };
        default:
          return {
            icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>,
            text: "Checking status...",
            iconColor: "text-yellow-400",
            tooltipBg: "bg-yellow-600",
            tooltipText: "text-white"
          };
      }
    };

    const config = getStatusConfig();

    return (
      <div 
        className="relative flex items-center cursor-pointer"
        onMouseEnter={() => setShowStatusTooltip(true)}
        onMouseLeave={() => setShowStatusTooltip(false)}
      >
        <div className={`flex items-center ${config.iconColor}`}>
          {config.icon}
        </div>
        
        {/* Custom Tooltip */}
        {showStatusTooltip && (
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 text-sm ${config.tooltipBg} ${config.tooltipText} rounded-lg shadow-lg whitespace-nowrap z-50 backdrop-blur-sm`}>
            {config.text}
            {/* Arrow pointing up */}
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${config.tooltipBg.replace('bg-', 'border-b-')}`}></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        {/* Navigation */}
        <Navigation 
          backendStatus={backendStatus}
          showStatusTooltip={showStatusTooltip}
          setShowStatusTooltip={setShowStatusTooltip}
          getStatusIndicator={getStatusIndicator}
        />

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/car-rankings" element={<CarRankings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-md border-t border-slate-600/30 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Left side - Copyright and Description */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <div className="p-1 bg-blue-500 rounded">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-semibold">EcoMeter</span>
                </div>
                <p className="text-sm text-slate-300">
                  © 2025 EcoMeter. Helping you understand your vehicle's environmental impact.
                </p>
              </div>
              
              {/* Right side - Portfolio Link */}
              <div className="flex items-center">
                <a
                  href="https://faziel.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-700/50 rounded-lg"
                  title="Developer Portfolio"
                >
                  <User className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
      <Analytics />
    </Router>
  );
}

export default App;