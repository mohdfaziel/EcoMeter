import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Car, 
  Eye, 
  EyeOff, 
  Lock,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Database,
  Fuel,
  DollarSign,
  TrendingUp,
  Trophy
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // Store token and admin info
        localStorage.setItem('ecoMeterAdminToken', data.data.token);
        localStorage.setItem('ecoMeterAdminAuth', 'true');
        localStorage.setItem('ecoMeterAdminInfo', JSON.stringify(data.data.admin));
        
        onLogin(true, data.data.admin);
        toast.success('Welcome to Admin Dashboard!');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-blue-100">Enter your credentials to manage car data</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-blue-100 mb-2">Email</label>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              placeholder="admin@ecometer.com"
            />
          </div>

          <div>
            <label className="block text-sm text-blue-100 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 pr-12 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-300 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const CarForm = ({ car, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    price_lakh: '',
    mileage_kmpl: '',
    engine_size_l: '',
    co2_gkm: '',
    comfort_rating: '',
    space_rating: '',
    fuel_type: 'Petrol'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make || '',
        model: car.model || '',
        price_lakh: car.price_lakh || '',
        mileage_kmpl: car.mileage_kmpl || '',
        engine_size_l: car.engine_size_l || '',
        co2_gkm: car.co2_gkm || '',
        comfort_rating: car.comfort_rating || '',
        space_rating: car.space_rating || '',
        fuel_type: car.fuel_type || 'Petrol'
      });
    }
  }, [car]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = car 
        ? `${API_URL}/api/cars/${encodeURIComponent(car.model)}`
        : `${API_URL}/api/cars`;
      
      const method = car ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(car ? 'Car updated successfully! Changes will reflect on Car Rankings page.' : 'Car added successfully! It will now appear on Car Rankings page.');
        onSave(data.data);
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            {car ? <Edit3 className="w-6 h-6 mr-2" /> : <Plus className="w-6 h-6 mr-2" />}
            {car ? 'Edit Car' : 'Add New Car'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-blue-100 mb-1">Make</label>
              <input
                type="text"
                required
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. Maruti Suzuki"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">Model</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. Swift"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">Price (₹ Lakh)</label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                max="1000"
                value={formData.price_lakh}
                onChange={(e) => handleChange('price_lakh', parseFloat(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. 6.5"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">Mileage (km/l)</label>
              <input
                type="number"
                required
                step="0.1"
                min="1"
                max="50"
                value={formData.mileage_kmpl}
                onChange={(e) => handleChange('mileage_kmpl', parseFloat(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. 18.5"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">Engine Size (L)</label>
              <input
                type="number"
                required
                step="0.1"
                min="0.1"
                max="10"
                value={formData.engine_size_l}
                onChange={(e) => handleChange('engine_size_l', parseFloat(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. 1.2"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">CO₂ Emissions (g/km)</label>
              <input
                type="number"
                required
                min="1"
                max="1000"
                value={formData.co2_gkm}
                onChange={(e) => handleChange('co2_gkm', parseInt(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. 120"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">Comfort Rating (1-10)</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.comfort_rating}
                onChange={(e) => handleChange('comfort_rating', parseInt(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. 8"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-100 mb-1">Space Rating (1-10)</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.space_rating}
                onChange={(e) => handleChange('space_rating', parseInt(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                placeholder="e.g. 7"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-blue-100 mb-1">Fuel Type</label>
            <select
              value={formData.fuel_type}
              onChange={(e) => handleChange('fuel_type', e.target.value)}
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="Petrol" className="bg-gray-800 text-white">Petrol</option>
              <option value="Diesel" className="bg-gray-800 text-white">Diesel</option>
              <option value="Electric" className="bg-gray-800 text-white">Electric</option>
              <option value="Hybrid" className="bg-gray-800 text-white">Hybrid</option>
              <option value="CNG" className="bg-gray-800 text-white">CNG</option>
              <option value="Petrol/Diesel" className="bg-gray-800 text-white">Petrol/Diesel</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {car ? 'Update Car' : 'Add Car'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-3 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminSettingsModal = ({ show, onClose, adminInfo, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    newEmail: adminInfo?.email || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('ecoMeterAdminToken');
      const response = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onClose();
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    
    if (!emailData.newEmail || !emailData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('ecoMeterAdminToken');
      const response = await fetch(`${API_URL}/api/admin/change-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email updated successfully!');
        // Update local storage with new admin info
        const updatedAdminInfo = { ...adminInfo, email: data.data.admin.email };
        localStorage.setItem('ecoMeterAdminInfo', JSON.stringify(updatedAdminInfo));
        onUpdate(updatedAdminInfo);
        setEmailData({ newEmail: data.data.admin.email, password: '' });
        onClose();
      } else {
        toast.error(data.message || 'Failed to update email');
      }
    } catch (error) {
      console.error('Email change error:', error);
      toast.error('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Admin Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Email
            </button>
          </div>

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Email
                </label>
                <input
                  type="email"
                  value={adminInfo?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={emailData.password}
                  onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password to confirm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Update Email'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('ecoMeterAdminAuth') === 'true';
    const adminInfoStr = localStorage.getItem('ecoMeterAdminInfo');
    
    if (authStatus && adminInfoStr) {
      try {
        const adminData = JSON.parse(adminInfoStr);
        setAdminInfo(adminData);
        setIsAuthenticated(true);
        // Don't call fetchCars here - it will be called by the separate useEffect
      } catch (error) {
        console.error('Error parsing admin info:', error);
        handleLogout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch cars when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCars();
    }
  }, [isAuthenticated]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      console.log('🚗 Fetching cars from API...');
      const response = await fetch(`${API_URL}/api/cars?limit=1000&sortBy=score&sortOrder=desc`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response:', data);
      
      if (data.success) {
        setCars(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} cars`);
        toast.success(`Loaded ${data.data?.length || 0} cars from database`);
      } else {
        throw new Error(data.error || data.message || 'Failed to fetch cars');
      }
    } catch (error) {
      console.error('❌ Error fetching cars:', error);
      toast.error(`Failed to load cars: ${error.message}`);
      setCars([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ecoMeterAdminAuth');
    localStorage.removeItem('ecoMeterAdminToken');
    localStorage.removeItem('ecoMeterAdminInfo');
    setIsAuthenticated(false);
    setAdminInfo(null);
    setCars([]);
    toast.info('Logged out successfully');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ecoMeterAdminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setShowForm(true);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleDeleteCar = async (car) => {
    try {
      const response = await fetch(`${API_URL}/api/cars/${encodeURIComponent(car.model)}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Car deleted successfully! It has been removed from Car Rankings page.');
        setCars(prev => prev.filter(c => c._id !== car._id));
        setDeleteConfirm(null);
      } else {
        throw new Error(data.error || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error(error.message);
    }
  };

  const handleSaveCar = (savedCar) => {
    if (editingCar) {
      // Update existing car
      setCars(prev => prev.map(car => 
        car._id === savedCar._id ? savedCar : car
      ));
    } else {
      // Add new car
      setCars(prev => [savedCar, ...prev]);
    }
    
    setShowForm(false);
    setEditingCar(null);
  };

  const filteredCars = cars.filter(car =>
    car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.fuel_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return <AdminLogin onLogin={(authenticated, adminData) => {
      setIsAuthenticated(authenticated);
      if (adminData) setAdminInfo(adminData);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-300 mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm sm:text-base">Manage car database</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center justify-center sm:justify-start text-blue-100 bg-white/5 rounded-lg px-3 py-2">
                <Database className="w-5 h-5 mr-2" />
                <span>{cars.length} cars</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors flex items-center justify-center"
                >
                  <Lock className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <Car className="w-6 sm:w-8 h-6 sm:h-8 text-blue-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-blue-200">Total Cars</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{cars.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <Fuel className="w-6 sm:w-8 h-6 sm:h-8 text-green-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-blue-200">Avg Mileage</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {cars.length > 0 ? (cars.reduce((sum, car) => sum + car.mileage_kmpl, 0) / cars.length).toFixed(1) : '0'} km/l
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-blue-200">Avg Score</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {cars.length > 0 ? (cars.reduce((sum, car) => sum + (car.score || 0), 0) / cars.length).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-6">
            <div className="flex items-center">
              <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-red-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-blue-200">Avg Price</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  ₹{cars.length > 0 ? (cars.reduce((sum, car) => sum + car.price_lakh, 0) / cars.length).toFixed(1) : '0'}L
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-blue-200" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={fetchCars}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors flex items-center justify-center disabled:opacity-50"
                title="Refresh car list"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Refresh
                  </>
                )}
              </button>
              
              <button
                onClick={handleAddCar}
                className="flex-1 sm:flex-none px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Car
              </button>
            </div>
          </div>
        </div>

        {/* Cars Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Car className="w-6 h-6 mr-2" />
              Car Database
              <span className="ml-auto text-sm text-blue-200">
                {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} found
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-blue-300 animate-spin mx-auto mb-4" />
              <p className="text-blue-100">Loading cars...</p>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="p-8 text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No cars found</p>
              <p className="text-gray-400">Try adjusting your search or add a new car</p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden">
                <div className="divide-y divide-white/10">
                  {filteredCars.map((car, index) => (
                    <div key={car._id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                            index === 1 ? 'bg-gray-400/20 text-gray-300' :
                            index === 2 ? 'bg-orange-600/20 text-orange-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            #{index + 1}
                          </span>
                          {index < 3 && (
                            <Trophy className={`w-4 h-4 ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-600'
                            }`} />
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCar(car)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-white transition-colors"
                            title="Edit car"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(car)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 hover:text-white transition-colors"
                            title="Delete car"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="font-medium text-white text-lg">{car.make} {car.model}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            car.score >= 40 ? 'bg-green-500/20 text-green-300' :
                            car.score >= 30 ? 'bg-yellow-500/20 text-yellow-300' :
                            car.score >= 20 ? 'bg-orange-500/20 text-orange-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            AI Score: {car.score}
                          </span>
                          <span className="ml-2 px-2 py-1 bg-white/10 rounded text-xs text-blue-200">
                            {car.fuel_type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white/5 rounded p-2">
                          <div className="flex items-center text-blue-200 text-xs mb-1">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Price
                          </div>
                          <div className="text-white font-semibold">₹{car.price_lakh}L</div>
                        </div>
                        
                        <div className="bg-white/5 rounded p-2">
                          <div className="flex items-center text-blue-200 text-xs mb-1">
                            <Fuel className="w-3 h-3 mr-1" />
                            Mileage
                          </div>
                          <div className="text-white font-semibold">{car.mileage_kmpl} km/l</div>
                        </div>
                        
                        <div className="bg-white/5 rounded p-2">
                          <div className="text-blue-200 text-xs mb-1">CO₂ Emissions</div>
                          <div className="text-white font-semibold">{car.co2_gkm} g/km</div>
                        </div>
                        
                        <div className="bg-white/5 rounded p-2">
                          <div className="text-blue-200 text-xs mb-1">Engine Size</div>
                          <div className="text-white font-semibold">{car.engine_size_l}L</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-blue-200 pt-2 border-t border-white/10">
                        <span>Comfort: {car.comfort_rating}/10</span>
                        <span>Space: {car.space_rating}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr className="text-left">
                      <th className="p-4 text-blue-100 font-semibold">Rank</th>
                      <th className="p-4 text-blue-100 font-semibold">Car Details</th>
                      <th className="p-4 text-blue-100 font-semibold">Price</th>
                      <th className="p-4 text-blue-100 font-semibold">Mileage</th>
                      <th className="p-4 text-blue-100 font-semibold">CO₂</th>
                      <th className="p-4 text-blue-100 font-semibold">AI Score</th>
                      <th className="p-4 text-blue-100 font-semibold">Fuel Type</th>
                      <th className="p-4 text-blue-100 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredCars.map((car, index) => (
                      <tr key={car._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                              index === 1 ? 'bg-gray-400/20 text-gray-300' :
                              index === 2 ? 'bg-orange-600/20 text-orange-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              #{index + 1}
                            </span>
                            {index < 3 && (
                              <Trophy className={`w-4 h-4 ml-2 ${
                                index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-gray-400' :
                                'text-orange-600'
                              }`} />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-white">{car.make} {car.model}</div>
                            <div className="text-sm text-blue-200">
                              Engine: {car.engine_size_l}L | Comfort: {car.comfort_rating}/10 | Space: {car.space_rating}/10
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-blue-100">₹{car.price_lakh}L</td>
                        <td className="p-4 text-blue-100">{car.mileage_kmpl} km/l</td>
                        <td className="p-4 text-blue-100">{car.co2_gkm} g/km</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            car.score >= 40 ? 'bg-green-500/20 text-green-300' :
                            car.score >= 30 ? 'bg-yellow-500/20 text-yellow-300' :
                            car.score >= 20 ? 'bg-orange-500/20 text-orange-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {car.score}
                          </span>
                        </td>
                        <td className="p-4 text-blue-100">{car.fuel_type}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCar(car)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 hover:text-white transition-colors"
                              title="Edit car"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(car)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 hover:text-white transition-colors"
                              title="Delete car"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Car Form Modal */}
      {showForm && (
        <CarForm
          car={editingCar}
          onSave={handleSaveCar}
          onCancel={() => {
            setShowForm(false);
            setEditingCar(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Confirm Deletion</h2>
            </div>
            
            <p className="text-blue-100 mb-6 text-sm sm:text-base">
              Are you sure you want to delete <strong>{deleteConfirm.make} {deleteConfirm.model}</strong>? 
              This car will be removed from both the admin database and the Car Rankings page. This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleDeleteCar(deleteConfirm)}
                className="flex-1 p-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 p-3 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        adminInfo={adminInfo}
        onUpdate={setAdminInfo}
      />
    </div>
  );
};

export default AdminDashboard;