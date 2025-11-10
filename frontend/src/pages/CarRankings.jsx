import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Trophy, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Car, 
  Fuel, 
  DollarSign, 
  Gauge, 
  Heart, 
  Home, 
  Loader2,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';

// Simple chart components since we don't have chart.js yet
const SimpleBarChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(item => item.co2_gkm));
  
  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
        {title}
      </h3>
      
      <div className="space-y-2">
        {data.slice(0, 8).map((item, index) => {
          const percentage = (item.co2_gkm / maxValue) * 100;
          const isHigh = item.co2_gkm > (maxValue * 0.7);
          
          return (
            <div key={index} className="flex items-center">
              {/* Car name */}
              <div className="w-24 text-xs text-slate-300 truncate">
                {item.model}
              </div>
              
              {/* Bar */}
              <div className="flex-1 mx-2">
                <div className="bg-slate-700 rounded h-4 relative overflow-hidden">
                  <div 
                    className={`h-full rounded transition-all duration-500 ${
                      isHigh 
                        ? 'bg-red-500' 
                        : item.co2_gkm > (maxValue * 0.4)
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 8)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Value */}
              <div className="w-12 text-xs text-white text-right">
                {item.co2_gkm}g
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Simple legend */}
      <div className="flex justify-center mt-3 pt-2 border-t border-white/10">
        <div className="flex items-center space-x-3 text-xs text-blue-300">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>Low
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded mr-1"></div>Med
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded mr-1"></div>High
          </div>
        </div>
      </div>
    </div>
  );
};

const SimpleScatterPlot = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const maxPrice = Math.max(...data.map(item => item.price_lakh));
  const minPrice = Math.min(...data.map(item => item.price_lakh));
  const maxMileage = Math.max(...data.map(item => item.mileage_kmpl));
  const minMileage = Math.min(...data.map(item => item.mileage_kmpl));
  
  const priceRange = maxPrice - minPrice;
  const mileageRange = maxMileage - minMileage;
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-red-300" />
        {title}
      </h3>
      <div className="relative h-64 bg-gray-800/50 rounded-lg overflow-hidden">
        {/* Chart container with padding */}
        <div className="absolute inset-0 p-8">
          
          {/* Y-axis values */}
          <div className="absolute left-0 top-8 bottom-8 w-8 flex flex-col justify-between">
            {[maxMileage, (maxMileage + minMileage) / 2, minMileage].map((value, i) => (
              <div key={i} className="text-xs text-blue-200 text-right">
                {Math.round(value)}
              </div>
            ))}
          </div>
          
          {/* X-axis values */}
          <div className="absolute left-8 right-2 bottom-0 h-6 flex justify-between items-end">
            {[minPrice, (maxPrice + minPrice) / 2, maxPrice].map((value, i) => (
              <div key={i} className="text-xs text-blue-200">
                ₹{Math.round(value)}L
              </div>
            ))}
          </div>
          
          {/* Chart area */}
          <div className="absolute left-8 right-2 top-8 bottom-6">
            {/* Grid */}
            <div className="absolute inset-0 border-l border-b border-blue-600/30"></div>
            
            {/* Data points */}
            {data.slice(0, 15).map((item, index) => {
              const x = ((item.price_lakh - minPrice) / priceRange) * 100;
              const y = 100 - ((item.mileage_kmpl - minMileage) / mileageRange) * 100;
              
              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-blue-500 rounded-full border border-white hover:scale-125 transition-transform cursor-pointer group"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={`${item.make} ${item.model} - ₹${item.price_lakh}L, ${item.mileage_kmpl}km/l`}
                >
                </div>
              );
            })}
          </div>
          
          {/* Labels */}
          <div className="absolute left-1 top-1/2 transform -rotate-90 text-xs text-blue-200">
            Mileage (km/l)
          </div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-blue-200">
            Price (₹ Lakh)
          </div>
        </div>
      </div>
    </div>
  );
};

const CarRankings = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    fuelType: 'all',
    make: 'all',
    sortBy: 'score',
    sortOrder: 'desc',
    search: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const [availableFilters, setAvailableFilters] = useState({
    fuelTypes: [],
    makes: []
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [fuelTypesResponse, makesResponse] = await Promise.all([
          fetch(`${API_URL}/api/cars/filter/fuel-types`),
          fetch(`${API_URL}/api/cars/filter/makes`)
        ]);
        
        const fuelTypesData = await fuelTypesResponse.json();
        const makesData = await makesResponse.json();
        
        if (fuelTypesData.success) {
          setAvailableFilters(prev => ({ ...prev, fuelTypes: fuelTypesData.data }));
        }
        
        if (makesData.success) {
          setAvailableFilters(prev => ({ ...prev, makes: makesData.data }));
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Fetch cars data
  useEffect(() => {
    fetchCars();
  }, [filters, currentPage]);
  
  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage,
        limit: 10
      });
      
      // Remove empty values
      Object.keys(queryParams).forEach(key => {
        if (!queryParams.get(key) || queryParams.get(key) === 'all') {
          queryParams.delete(key);
        }
      });
      
      const response = await fetch(`${API_URL}/api/cars?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setCars(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch cars');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError(error.message);
      toast.error('Failed to load car rankings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cars/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      handleFilterChange('search', e.target.value || filters.search);
    }
  };

  const resetFilters = () => {
    setFilters({
      fuelType: 'all',
      make: 'all',
      sortBy: 'score',
      sortOrder: 'desc',
      search: '',
      minPrice: '',
      maxPrice: ''
    });
    setCurrentPage(1);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-blue-200">#{rank}</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 40) return 'text-green-400';
    if (score >= 30) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 40) return 'bg-green-500/20 border-green-500/30';
    if (score >= 30) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 20) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (loading && cars.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading car rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Trophy className="w-8 h-8 mr-3 text-blue-300" />
            Car Rankings
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Discover the top-ranked cars in India based on our AI-calculated score that balances 
            CO₂ emissions, price, mileage, comfort, and space ratings.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-white mr-2" />
            <h2 className="text-lg font-semibold text-white">Filters & Search</h2>
          </div>
          
          <div className="space-y-4">
            {/* Search - Full Width */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyPress={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Fuel Type */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fuel Type</label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="all" className="bg-gray-800 text-white">All Types</option>
                  {availableFilters.fuelTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800 text-white">{type}</option>
                  ))}
                </select>
              </div>

              {/* Make */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Make</label>
                <select
                  value={filters.make}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="all" className="bg-gray-800 text-white">All Makes</option>
                  {availableFilters.makes.map(make => (
                    <option key={make} value={make} className="bg-gray-800 text-white">{make}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-blue-400 [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="score" className="bg-gray-800 text-white">Rank (Score)</option>
                  <option value="co2_gkm" className="bg-gray-800 text-white">CO₂ Emissions</option>
                  <option value="price_lakh" className="bg-gray-800 text-white">Price</option>
                  <option value="mileage_kmpl" className="bg-gray-800 text-white">Mileage</option>
                  <option value="comfort_rating" className="bg-gray-800 text-white">Comfort</option>
                  <option value="space_rating" className="bg-gray-800 text-white">Space</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Order</label>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {filters.sortOrder === 'desc' ? (
                    <><SortDesc className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">High to Low</span><span className="sm:hidden">↓</span></>
                  ) : (
                    <><SortAsc className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Low to High</span><span className="sm:hidden">↑</span></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm text-blue-100 mb-1">Min Price (₹ Lakh)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div>
              <label className="block text-sm text-blue-100 mb-1">Max Price (₹ Lakh)</label>
              <input
                type="number"
                placeholder="50"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                onClick={resetFilters}
                className="w-full p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Car Rankings Table */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Car className="w-6 h-6 mr-2" />
                  Rankings
                  {pagination && (
                    <span className="ml-auto text-sm text-blue-200">
                      {cars.length} of {pagination.totalCount} cars
                    </span>
                  )}
                </h2>
              </div>

              {error ? (
                <div className="p-6 text-center">
                  <p className="text-red-300 mb-4">{error}</p>
                  <button
                    onClick={fetchCars}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {cars.map((car) => (
                    <div key={car._id} className="p-4 hover:bg-white/5 transition-colors">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            {getRankIcon(car.rank)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {car.make} {car.model}
                            </h3>
                            <div className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${getScoreBgColor(car.score)}`}>
                              <span className={getScoreColor(car.score)}>
                                Score: {car.score}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center text-blue-100 mb-1">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span className="font-medium">Price</span>
                            </div>
                            <div className="text-white font-semibold">₹{car.price_lakh}L</div>
                          </div>
                          
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center text-blue-100 mb-1">
                              <Gauge className="w-4 h-4 mr-1" />
                              <span className="font-medium">Mileage</span>
                            </div>
                            <div className="text-white font-semibold">{car.mileage_kmpl} km/l</div>
                          </div>
                          
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center text-blue-100 mb-1">
                              <Zap className="w-4 h-4 mr-1" />
                              <span className="font-medium">CO₂</span>
                            </div>
                            <div className="text-white font-semibold">{car.co2_gkm} g/km</div>
                          </div>
                          
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center text-blue-100 mb-1">
                              <Heart className="w-4 h-4 mr-1" />
                              <span className="font-medium">Comfort</span>
                            </div>
                            <div className="text-white font-semibold">{car.comfort_rating}/10</div>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex items-center justify-between text-xs text-blue-200 pt-2 border-t border-white/10">
                          <div className="flex items-center">
                            <Fuel className="w-3 h-3 mr-1" />
                            {car.fuel_type}
                          </div>
                          <div className="flex items-center">
                            <Home className="w-3 h-3 mr-1" />
                            Space {car.space_rating}/10
                          </div>
                          <div>
                            Engine: {car.engine_size_l}L
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 flex justify-center">
                          {getRankIcon(car.rank)}
                        </div>

                        {/* Car Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {car.make} {car.model}
                            </h3>
                            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreBgColor(car.score)}`}>
                              <span className={getScoreColor(car.score)}>
                                Score: {car.score}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div className="flex items-center text-blue-100">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ₹{car.price_lakh}L
                            </div>
                            <div className="flex items-center text-blue-100">
                              <Gauge className="w-4 h-4 mr-1" />
                              {car.mileage_kmpl} km/l
                            </div>
                            <div className="flex items-center text-blue-100">
                              <Zap className="w-4 h-4 mr-1" />
                              {car.co2_gkm} g/km
                            </div>
                            <div className="flex items-center text-blue-100">
                              <Heart className="w-4 h-4 mr-1" />
                              Comfort {car.comfort_rating}/10
                            </div>
                            <div className="flex items-center text-blue-100">
                              <Home className="w-4 h-4 mr-1" />
                              Space {car.space_rating}/10
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-4 text-xs text-blue-200">
                            <div className="flex items-center">
                              <Fuel className="w-3 h-3 mr-1" />
                              {car.fuel_type}
                            </div>
                            <div>
                              Engine: {car.engine_size_l}L
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="p-6 border-t border-white/20 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="text-blue-100">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-8">
            {stats && (
              <SimpleBarChart 
                data={stats.co2Emissions} 
                title="CO₂ Emissions by Model" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRankings;