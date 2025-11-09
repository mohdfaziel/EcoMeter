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
  Database
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple authentication (in production, this should be properly secured)
    const adminCredentials = {
      email: 'admin@ecometer.com',
      password: 'admin123'
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === adminCredentials.email && 
        credentials.password === adminCredentials.password) {
      localStorage.setItem('ecoMeterAdminAuth', 'true');
      onLogin(true);
      toast.success('Welcome to Admin Dashboard!');
    } else {
      toast.error('Invalid credentials');
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

        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-100 mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-200">Email: admin@ecometer.com</p>
          <p className="text-xs text-blue-200">Password: admin123</p>
        </div>
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
        toast.success(car ? 'Car updated successfully!' : 'Car added successfully!');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
              <option value="Petrol/Diesel">Petrol/Diesel</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
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

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('ecoMeterAdminAuth') === 'true';
    setIsAuthenticated(authStatus);
    if (authStatus) {
      fetchCars();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cars?limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setCars(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch cars');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ecoMeterAdminAuth');
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
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
        toast.success('Car deleted successfully!');
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
    return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-300 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100">Manage car database</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-blue-100">
                <Database className="w-5 h-5 mr-2" />
                <span>{cars.length} cars</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-blue-200" />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddCar}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Car
            </button>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="text-left">
                    <th className="p-4 text-blue-100 font-semibold">Car</th>
                    <th className="p-4 text-blue-100 font-semibold">Price</th>
                    <th className="p-4 text-blue-100 font-semibold">Mileage</th>
                    <th className="p-4 text-blue-100 font-semibold">CO₂</th>
                    <th className="p-4 text-blue-100 font-semibold">Score</th>
                    <th className="p-4 text-blue-100 font-semibold">Fuel Type</th>
                    <th className="p-4 text-blue-100 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredCars.map((car) => (
                    <tr key={car._id} className="hover:bg-white/5 transition-colors">
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
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Confirm Deletion</h2>
            </div>
            
            <p className="text-blue-100 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.make} {deleteConfirm.model}</strong>? 
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-4">
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
    </div>
  );
};

export default AdminDashboard;