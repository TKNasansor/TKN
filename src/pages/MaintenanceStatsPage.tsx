import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, User, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import MaintenanceRecordViewer from '../components/MaintenanceRecordViewer';

const MaintenanceStatsPage: React.FC = () => {
  const { state } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Get available years from maintenance records
  const availableYears = Array.from(
    new Set(
      state.maintenanceRecords.map(record => new Date(record.maintenanceDate).getFullYear())
    )
  ).sort((a, b) => b - a);
  
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  // Filter maintenance records by selected month and year
  const filteredRecords = state.maintenanceRecords.filter(record => {
    const recordDate = new Date(record.maintenanceDate);
    return (
      recordDate.getMonth() === selectedMonth &&
      recordDate.getFullYear() === selectedYear
    );
  });

  // Group by technician
  const technicianStats: Record<string, { count: number; totalFee: number; buildings: string[] }> = {};
  
  filteredRecords.forEach(record => {
    const building = state.buildings.find(b => b.id === record.buildingId);
    if (!technicianStats[record.performedBy]) {
      technicianStats[record.performedBy] = { count: 0, totalFee: 0, buildings: [] };
    }
    technicianStats[record.performedBy].count += 1;
    technicianStats[record.performedBy].totalFee += record.totalFee;
    if (building) {
      technicianStats[record.performedBy].buildings.push(building.name);
    }
  });

  // Calculate totals
  const totalMaintenances = filteredRecords.length;
  const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.totalFee, 0);
  const uniqueBuildings = Array.from(new Set(filteredRecords.map(record => record.buildingId))).length;

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would refetch data here
    } catch (err) {
      setError('Veri yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bakım İstatistikleri</h1>
      
      {/* Month/Year Selector */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Yıl</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Bakım</p>
              <p className="text-2xl font-bold text-gray-900">{totalMaintenances}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Bakım Yapılan Bina</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueBuildings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Teknisyen Performansı - {months[selectedMonth]} {selectedYear}
          </h3>
        </div>
        
        {Object.keys(technicianStats).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teknisyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bakım Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Gelir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ortalama Gelir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bakım Yapılan Binalar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(technicianStats)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([technician, stats]) => (
                    <tr key={technician}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                            {technician.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{technician}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stats.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stats.totalFee.toLocaleString('tr-TR')} ₺</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {Math.round(stats.totalFee / stats.count).toLocaleString('tr-TR')} ₺
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {Array.from(new Set(stats.buildings)).join(', ')}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Bu ay için bakım istatistiği bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Maintenance Record Viewer */}
      <MaintenanceRecordViewer
        records={state.maintenanceRecords}
        isLoading={isLoading}
        onRetry={handleRetry}
        error={error}
      />
    </div>
  );
};

export default MaintenanceStatsPage;