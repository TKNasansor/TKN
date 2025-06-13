import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Edit, ChevronLeft, Save, CheckSquare, MapPin, ExternalLink, Tag, Plus, X } from 'lucide-react';

const BuildingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateBuilding, installManualPart } = useApp();
  
  const building = state.buildings.find(b => b.id === id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedBuilding, setEditedBuilding] = useState(building);
  const [showManualPartForm, setShowManualPartForm] = useState(false);
  const [manualPart, setManualPart] = useState({
    partName: '',
    quantity: 1,
    unitPrice: 0,
    installDate: new Date().toISOString().split('T')[0]
  });
  
  if (!building) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Bina bulunamadı.</p>
        <button
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => navigate('/buildings')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Binalar Sayfasına Dön
        </button>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (!editedBuilding) return;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditedBuilding({
        ...editedBuilding,
        address: {
          ...editedBuilding.address,
          [addressField]: value
        }
      });
    } else {
      setEditedBuilding({
        ...editedBuilding,
        [name]: name === 'maintenanceFee' || name === 'elevatorCount' ? Number(value) : 
                name === 'label' ? (value === '' ? null : value as any) :
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      });
    }
  };
  
  const handleSave = () => {
    if (editedBuilding) {
      updateBuilding(editedBuilding);
      setIsEditing(false);
    }
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (building) {
      const updatedBuilding = {
        ...building,
        notes: e.target.value
      };
      updateBuilding(updatedBuilding);
    }
  };

  const handleManualPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!building) return;

    const totalPrice = manualPart.quantity * manualPart.unitPrice;
    
    installManualPart({
      buildingId: building.id,
      partName: manualPart.partName,
      quantity: manualPart.quantity,
      unitPrice: manualPart.unitPrice,
      totalPrice,
      installDate: manualPart.installDate
    });

    setManualPart({
      partName: '',
      quantity: 1,
      unitPrice: 0,
      installDate: new Date().toISOString().split('T')[0]
    });
    setShowManualPartForm(false);
  };

  const openGoogleMaps = () => {
    if (building.address) {
      const { mahalle, sokak, binaNo, ilce, il } = building.address;
      const fullAddress = `${mahalle} ${sokak} ${binaNo}, ${ilce}/${il}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
      window.open(url, '_blank');
    }
  };

  const getFullAddress = () => {
    if (!building.address) return 'Belirtilmemiş';
    const { mahalle, sokak, binaNo, ilce, il } = building.address;
    return `${mahalle} ${sokak} ${binaNo}, ${ilce}/${il}`.trim();
  };

  const getLabelColor = (label: string | null) => {
    switch (label) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getLabelText = (label: string | null) => {
    switch (label) {
      case 'green': return 'Yeşil';
      case 'blue': return 'Mavi';
      case 'yellow': return 'Sarı';
      case 'red': return 'Kırmızı';
      default: return 'Etiketsiz';
    }
  };
  
  // Installations for this building
  const installations = state.partInstallations.filter(
    installation => installation.buildingId === building.id
  );

  // Manual installations for this building
  const manualInstallations = state.manualPartInstallations.filter(
    installation => installation.buildingId === building.id
  );

  // Maintenance history for this building
  const maintenanceHistory = state.maintenanceHistory.filter(
    history => history.buildingId === building.id
  );

  const totalMaintenanceFee = building.maintenanceFee * building.elevatorCount;
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <button
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => navigate('/buildings')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Geri
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              {isEditing ? 'Bina Düzenle' : building.name}
            </h2>
            {building.label && !isEditing && (
              <div className="ml-3 flex items-center">
                <Tag className="h-4 w-4 text-gray-400 mr-1" />
                <span className={`inline-block w-3 h-3 rounded-full ${getLabelColor(building.label)}`}></span>
                <span className="ml-1 text-sm text-gray-500">{getLabelText(building.label)}</span>
              </div>
            )}
          </div>
          
          {!isEditing && (
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Düzenle
            </button>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {isEditing ? (
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Bina Adı
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={editedBuilding?.name || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="elevatorCount" className="block text-sm font-medium text-gray-700">
                    Asansör Sayısı
                  </label>
                  <input
                    type="number"
                    name="elevatorCount"
                    id="elevatorCount"
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedBuilding?.elevatorCount || 1}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="maintenanceFee" className="block text-sm font-medium text-gray-700">
                    Bakım Ücreti (Asansör Başına) (₺)
                  </label>
                  <input
                    type="number"
                    name="maintenanceFee"
                    id="maintenanceFee"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedBuilding?.maintenanceFee || 0}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
                  İletişim Bilgisi
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  id="contactInfo"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={editedBuilding?.contactInfo || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                  Etiket
                </label>
                <select
                  name="label"
                  id="label"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={editedBuilding?.label || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Etiketsiz</option>
                  <option value="green">Yeşil</option>
                  <option value="blue">Mavi</option>
                  <option value="yellow">Sarı</option>
                  <option value="red">Kırmızı</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Adres Bilgileri</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.il" className="block text-xs font-medium text-gray-600">
                      İl
                    </label>
                    <input
                      type="text"
                      name="address.il"
                      id="address.il"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editedBuilding?.address?.il || ''}
                      onChange={handleInputChange}
                      placeholder="İstanbul"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address.ilce" className="block text-xs font-medium text-gray-600">
                      İlçe
                    </label>
                    <input
                      type="text"
                      name="address.ilce"
                      id="address.ilce"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={editedBuilding?.address?.ilce || ''}
                      onChange={handleInputChange}
                      placeholder="Kadıköy"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address.mahalle" className="block text-xs font-medium text-gray-600">
                    Mahalle
                  </label>
                  <input
                    type="text"
                    name="address.mahalle"
                    id="address.mahalle"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedBuilding?.address?.mahalle || ''}
                    onChange={handleInputChange}
                    placeholder="Merkez Mahalle"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.sokak" className="block text-xs font-medium text-gray-600">
                    Sokak
                  </label>
                  <input
                    type="text"
                    name="address.sokak"
                    id="address.sokak"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedBuilding?.address?.sokak || ''}
                    onChange={handleInputChange}
                    placeholder="Ana Cadde"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.binaNo" className="block text-xs font-medium text-gray-600">
                    Bina No
                  </label>
                  <input
                    type="text"
                    name="address.binaNo"
                    id="address.binaNo"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={editedBuilding?.address?.binaNo || ''}
                    onChange={handleInputChange}
                    placeholder="123"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="isDefective" className="block text-sm font-medium text-gray-700">
                  Arızalı mı?
                </label>
                <select
                  name="isDefective"
                  id="isDefective"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={editedBuilding?.isDefective ? 'true' : 'false'}
                  onChange={(e) => {
                    if (editedBuilding) {
                      setEditedBuilding({
                        ...editedBuilding,
                        isDefective: e.target.value === 'true',
                      });
                    }
                  }}
                >
                  <option value="false">Hayır</option>
                  <option value="true">Evet</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setIsEditing(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Bakım Durumu</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {building.isMaintained ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Bakımı Yapıldı
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Bakım Gerekiyor
                    </span>
                  )}
                </p>
                {building.lastMaintenanceDate && building.lastMaintenanceTime && (
                  <p className="mt-1 text-xs text-gray-500">
                    Son bakım: {new Date(building.lastMaintenanceDate).toLocaleDateString('tr-TR')} - {building.lastMaintenanceTime}
                  </p>
                )}
              </div>

              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Asansör Bilgileri</h3>
                <p className="mt-1 text-sm text-gray-900">{building.elevatorCount} adet asansör</p>
                <p className="mt-1 text-xs text-gray-500">
                  Asansör başına: {building.maintenanceFee.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Toplam Bakım Ücreti</h3>
                <p className="mt-1 text-sm text-gray-900">{totalMaintenanceFee.toLocaleString('tr-TR')} ₺</p>
                <p className="mt-1 text-xs text-gray-500">
                  {building.elevatorCount} x {building.maintenanceFee.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Borç Durumu</h3>
                <p className="mt-1 text-sm text-gray-900">{building.debt.toLocaleString('tr-TR')} ₺</p>
              </div>
              
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">İletişim Bilgisi</h3>
                <p className="mt-1 text-sm text-gray-900">{building.contactInfo || 'Belirtilmemiş'}</p>
              </div>
              
              <div className="sm:col-span-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-500">Adres</h3>
                  {getFullAddress() !== 'Belirtilmemiş' && (
                    <button
                      onClick={openGoogleMaps}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Haritada Göster
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-900">{getFullAddress()}</p>
              </div>
              
              <div className="sm:col-span-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notlar</h3>
                <textarea
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={building.notes || ''}
                  onChange={handleNotesChange}
                  placeholder="Buraya not ekleyebilirsiniz..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Part Installation Section */}
      {!isEditing && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Manuel Parça Ekle</h3>
            <button
              onClick={() => setShowManualPartForm(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Parça Ekle
            </button>
          </div>
          
          {showManualPartForm && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <form onSubmit={handleManualPartSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parça Adı
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={manualPart.partName}
                      onChange={(e) => setManualPart(prev => ({ ...prev, partName: e.target.value }))}
                      placeholder="Parça adını girin"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Miktar
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={manualPart.quantity}
                      onChange={(e) => setManualPart(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Birim Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={manualPart.unitPrice}
                      onChange={(e) => setManualPart(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Takılma Tarihi
                    </label>
                    <input
                      type="date"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={manualPart.installDate}
                      onChange={(e) => setManualPart(prev => ({ ...prev, installDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Toplam Fiyat: {(manualPart.quantity * manualPart.unitPrice).toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowManualPartForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Parçayı Ekle
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Maintenance History Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Bakım Geçmişi</h3>
        </div>
        <div className="border-t border-gray-200">
          {maintenanceHistory.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {maintenanceHistory.map((history) => (
                <li key={history.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckSquare className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Bakım Tamamlandı
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(history.maintenanceDate).toLocaleDateString('tr-TR')} - {history.maintenanceTime} - {history.performedBy}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {history.maintenanceFee.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              Bu binada henüz bakım geçmişi bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
      
      {/* Installed Parts Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Takılan Parçalar</h3>
        </div>
        <div className="border-t border-gray-200">
          {(installations.length > 0 || manualInstallations.length > 0) ? (
            <ul className="divide-y divide-gray-200">
              {installations.map((installation) => {
                const part = state.parts.find(p => p.id === installation.partId);
                return (
                  <li key={installation.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{part?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(installation.installDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Miktar: {installation.quantity}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        Takılma Tarihi: {new Date(installation.installDate).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </li>
                );
              })}
              {manualInstallations.map((installation) => (
                <li key={installation.id} className="px-4 py-4 sm:px-6 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{installation.partName} <span className="text-xs text-blue-600">(Manuel)</span></p>
                    <p className="text-sm text-gray-500">
                      {new Date(installation.installDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Miktar: {installation.quantity} • Birim Fiyat: {installation.unitPrice.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      Toplam: {installation.totalPrice.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              Bu binaya henüz parça takılmamış.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingDetailsPage;