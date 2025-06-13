import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Banknote, Plus, X, Calendar, User } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const { state, addPayment } = useApp();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    buildingId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    receivedBy: state.currentUser?.name || '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentForm.buildingId && paymentForm.amount > 0) {
      addPayment(paymentForm);
      setPaymentForm({
        buildingId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        receivedBy: state.currentUser?.name || '',
        notes: ''
      });
      setShowPaymentForm(false);
    }
  };

  const getMaxPayment = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    return building ? building.debt : 0;
  };

  const buildingsWithDebt = state.buildings.filter(building => building.debt > 0);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Ödeme Yönetimi</h1>
        
        <button
          onClick={() => setShowPaymentForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ödeme Al
        </button>
      </div>

      {/* Buildings with Debt */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Borçlu Binalar</h3>
        </div>
        
        {buildingsWithDebt.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {buildingsWithDebt.map((building) => (
              <li key={building.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{building.name}</h4>
                    <p className="text-sm text-gray-500">{building.contactInfo}</p>
                    <p className="text-sm text-gray-500">
                      {building.address ? 
                        `${building.address.mahalle} ${building.address.sokak} ${building.address.binaNo}, ${building.address.ilce}/${building.address.il}` : 
                        'Adres belirtilmemiş'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-600">
                      {building.debt.toLocaleString('tr-TR')} ₺
                    </p>
                    <button
                      onClick={() => {
                        setPaymentForm(prev => ({
                          ...prev,
                          buildingId: building.id,
                          amount: building.debt
                        }));
                        setShowPaymentForm(true);
                      }}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      Ödeme Al
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Borçlu bina bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Son Ödemeler</h3>
        </div>
        
        {state.payments && state.payments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {state.payments.slice(0, 10).map((payment) => {
              const building = state.buildings.find(b => b.id === payment.buildingId);
              return (
                <li key={payment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {building?.name || 'Bilinmeyen Bina'}
                      </h4>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(payment.date).toLocaleDateString('tr-TR')}</span>
                        <User className="h-4 w-4 ml-4 mr-1" />
                        <span>{payment.receivedBy}</span>
                      </div>
                      {payment.notes && (
                        <p className="mt-1 text-sm text-gray-600">{payment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        +{payment.amount.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>Henüz ödeme kaydı bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">Ödeme Al</h2>
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentForm({
                    buildingId: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    receivedBy: state.currentUser?.name || '',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bina
                  </label>
                  <select
                    value={paymentForm.buildingId}
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      buildingId: e.target.value,
                      amount: e.target.value ? getMaxPayment(e.target.value) : 0
                    }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Bina seçin...</option>
                    {buildingsWithDebt.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name} - {building.debt.toLocaleString('tr-TR')} ₺ borç
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ödeme Miktarı (₺)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={paymentForm.buildingId ? getMaxPayment(paymentForm.buildingId) : undefined}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  {paymentForm.buildingId && (
                    <p className="mt-1 text-xs text-gray-500">
                      Maksimum: {getMaxPayment(paymentForm.buildingId).toLocaleString('tr-TR')} ₺
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ödeme Tarihi
                  </label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ödemeyi Alan
                  </label>
                  <input
                    type="text"
                    value={paymentForm.receivedBy}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, receivedBy: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notlar (Opsiyonel)
                  </label>
                  <textarea
                    rows={3}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Ödeme ile ilgili notlar..."
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;