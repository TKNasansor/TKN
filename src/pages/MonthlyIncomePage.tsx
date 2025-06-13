import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, CreditCard, TrendingUp } from 'lucide-react';

const MonthlyIncomePage: React.FC = () => {
  const { state } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  // Get available years from incomes
  const availableYears = Array.from(
    new Set(
      state.incomes.map(income => new Date(income.date).getFullYear())
    )
  ).sort((a, b) => b - a); // Sort descending
  
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }
  
  // Filter incomes by selected month and year (actual payments received)
  const filteredIncomes = state.incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return (
      incomeDate.getMonth() === selectedMonth &&
      incomeDate.getFullYear() === selectedYear
    );
  });
  
  // Calculate expected income from maintenance records for the selected month
  const expectedIncomeFromMaintenance = state.maintenanceRecords
    .filter(record => {
      const recordDate = new Date(record.maintenanceDate);
      return (
        recordDate.getMonth() === selectedMonth &&
        recordDate.getFullYear() === selectedYear
      );
    })
    .reduce((sum, record) => sum + record.totalFee, 0);
  
  // Total expected income (current debts)
  const totalExpectedIncome = state.buildings.reduce((sum, building) => sum + building.debt, 0);
  
  // Group incomes by receiver
  const incomesByReceiver: Record<string, number> = {};
  filteredIncomes.forEach(income => {
    if (incomesByReceiver[income.receivedBy]) {
      incomesByReceiver[income.receivedBy] += income.amount;
    } else {
      incomesByReceiver[income.receivedBy] = income.amount;
    }
  });
  
  // Calculate monthly total from actual payments
  const monthlyTotal = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Aylık Gelir</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {months[selectedMonth]} {selectedYear}
                  </h2>
                  <p className="text-sm text-gray-500">Alınan Ödemeler</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {monthlyTotal.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Gelmesi Gereken Gelir
                  </h2>
                  <p className="text-sm text-gray-500">Toplam Borçlar</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {totalExpectedIncome.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Personel Bazlı Gelir</h3>
          </div>
          
          {Object.keys(incomesByReceiver).length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {Object.entries(incomesByReceiver).map(([receiver, amount]) => (
                <li key={receiver} className="px-6 py-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{receiver}</p>
                  <p className="text-sm font-semibold text-gray-900">{amount.toLocaleString('tr-TR')} ₺</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Bu ay için personel bazlı gelir bilgisi bulunmamaktadır.
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detaylı Gelir Listesi</h3>
          </div>
          
          {filteredIncomes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredIncomes.map((income) => {
                const building = state.buildings.find(b => b.id === income.buildingId);
                return (
                  <li key={income.id} className="px-6 py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{building?.name || 'Bilinmeyen Bina'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(income.date).toLocaleDateString('tr-TR')} • {income.receivedBy}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{income.amount.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Bu ay için gelir kaydı bulunmamaktadır.
            </div>
          )}
        </div>
      </div>

      {expectedIncomeFromMaintenance > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Bu Ay Yapılan Bakımlardan Gelmesi Gereken Gelir
          </h4>
          <p className="text-lg font-semibold text-blue-900">
            {expectedIncomeFromMaintenance.toLocaleString('tr-TR')} ₺
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Bu miktar yapılan bakımlar sonucu oluşan borçları gösterir
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyIncomePage;