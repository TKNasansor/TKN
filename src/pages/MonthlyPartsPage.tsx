import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Package } from 'lucide-react';

const MonthlyPartsPage: React.FC = () => {
  const { state } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  // Get available years from installations
  const availableYears = Array.from(
    new Set(
      state.partInstallations.map(installation => new Date(installation.installDate).getFullYear())
    )
  ).sort((a, b) => b - a); // Sort descending
  
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }
  
  // Filter installations by selected month and year
  const filteredInstallations = state.partInstallations.filter(installation => {
    const installDate = new Date(installation.installDate);
    return (
      installDate.getMonth() === selectedMonth &&
      installDate.getFullYear() === selectedYear
    );
  });
  
  // Group installations by building
  const buildingsWithInstallations: Record<string, typeof filteredInstallations> = {};
  
  filteredInstallations.forEach(installation => {
    if (buildingsWithInstallations[installation.buildingId]) {
      buildingsWithInstallations[installation.buildingId].push(installation);
    } else {
      buildingsWithInstallations[installation.buildingId] = [installation];
    }
  });
  
  // Calculate total installations
  const totalInstallations = filteredInstallations.length;
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bu Ay Takılan Parçalar</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {months[selectedMonth]} {selectedYear}
                </h2>
                <p className="text-sm text-gray-500">Takılan Parça Sayısı</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalInstallations}</p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-4">
            <div className="relative inline-block w-full md:w-auto">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            
            <div className="relative inline-block w-full md:w-auto">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {Object.keys(buildingsWithInstallations).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(buildingsWithInstallations).map(([buildingId, installations]) => {
            const building = state.buildings.find(b => b.id === buildingId);
            
            return (
              <div key={buildingId} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">{building?.name || 'Bilinmeyen Bina'}</h3>
                </div>
                
                <ul className="divide-y divide-gray-200">
                  {installations.map((installation) => {
                    const part = state.parts.find(p => p.id === installation.partId);
                    
                    return (
                      <li key={installation.id} className="px-6 py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{part?.name || 'Bilinmeyen Parça'}</p>
                            <p className="text-xs text-gray-500">
                              Miktar: {installation.quantity} • 
                              Tarih: {new Date(installation.installDate).toLocaleDateString('tr-TR')} • 
                              Takan: {installation.installedBy}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {part ? `${(part.price * installation.quantity).toLocaleString('tr-TR')} ₺` : ''}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Parça Takılmamış</h3>
          <p className="mt-2 text-gray-500">
            {months[selectedMonth]} {selectedYear} ayında hiç parça takılmamış.
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyPartsPage;