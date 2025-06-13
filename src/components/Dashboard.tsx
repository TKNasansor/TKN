import React from 'react';
import { useApp } from '../context/AppContext';
import { Building } from '../types';
import { ChevronRight, AlertTriangle, Package, CreditCard, TrendingUp } from 'lucide-react';
import SummaryCard from './SummaryCard';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  
  // Defective elevators (buildings)
  const defectiveElevators = state.buildings.filter(b => b.isDefective);
  
  // Monthly income from actual payments
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyIncome = state.incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
  }).reduce((sum, income) => sum + income.amount, 0);
  
  // Expected income from debts
  const expectedIncome = state.buildings.reduce((sum, building) => sum + building.debt, 0);
  
  // Parts installed this month
  const monthlyInstallations = state.partInstallations.filter(installation => {
    const installDate = new Date(installation.installDate);
    return installDate.getMonth() === currentMonth && installDate.getFullYear() === currentYear;
  });
  
  // Calculate unique buildings with installations this month
  const buildingsWithInstallations = Array.from(
    new Set(monthlyInstallations.map(installation => installation.buildingId))
  ).map(buildingId => {
    return state.buildings.find(building => building.id === buildingId);
  }).filter(building => building !== undefined) as Building[];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gösterge Paneli</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Arızalı Asansörler" 
          value={defectiveElevators.length.toString()}
          icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
          color="bg-orange-100"
          path="/defective"
        />
        
        <SummaryCard 
          title="Bu Ay Takılan Parçalar" 
          value={monthlyInstallations.length.toString()}
          icon={<Package className="h-6 w-6 text-blue-500" />}
          color="bg-blue-100"
          path="/monthly-parts"
        />

        <SummaryCard 
          title="Bu Ayki Gelir" 
          value={`${monthlyIncome.toLocaleString('tr-TR')} ₺`}
          icon={<CreditCard className="h-6 w-6 text-green-500" />}
          color="bg-green-100"
          path="/monthly-income"
        />

        <SummaryCard 
          title="Gelmesi Gereken Gelir" 
          value={`${expectedIncome.toLocaleString('tr-TR')} ₺`}
          icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
          color="bg-purple-100"
          path="/monthly-income"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Defective Elevators */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Arızalı Asansörler</h2>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          {defectiveElevators.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {defectiveElevators.map(building => (
                <li key={building.id} className="py-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">{building.name}</p>
                      <p className="text-sm text-gray-600">
                        {building.address ? 
                          `${building.address.mahalle} ${building.address.sokak} ${building.address.binaNo}, ${building.address.ilce}/${building.address.il}` : 
                          'Adres belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-3">Arızalı asansör bulunmamaktadır.</p>
          )}
        </div>
        
        {/* Buildings with Parts Installed */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Bu Ay Parça Takılan Binalar</h2>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          {buildingsWithInstallations.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {buildingsWithInstallations.map(building => (
                <li key={building.id} className="py-3">
                  <div className="flex items-start">
                    <Package className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">{building.name}</p>
                      <p className="text-sm text-gray-600">
                        {monthlyInstallations
                          .filter(installation => installation.buildingId === building.id)
                          .map(installation => {
                            const part = state.parts.find(p => p.id === installation.partId);
                            return part ? `${installation.quantity} adet ${part.name}` : '';
                          })
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-3">Bu ay parça takılan bina bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;