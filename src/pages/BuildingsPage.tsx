import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building } from '../types';
import { Plus, Search, X, Check, QrCode, Trash2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const BuildingsPage: React.FC = () => {
  const { state, addBuilding, deleteBuilding, toggleMaintenance } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'maintained' | 'unmaintained'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | 'green' | 'blue' | 'yellow' | 'red' | 'none'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMaintenanceOptions, setShowMaintenanceOptions] = useState<string | null>(null);
  const [newBuilding, setNewBuilding] = useState<Omit<Building, 'id'>>({
    name: '',
    maintenanceFee: 0,
    elevatorCount: 1,
    debt: 0,
    contactInfo: '',
    address: {
      mahalle: '',
      sokak: '',
      il: '',
      ilce: '',
      binaNo: ''
    },
    notes: '',
    isMaintained: false,
    isDefective: false,
    label: null
  });

  // Sample buildings data
  const sampleBuildings = [
    {
      name: 'Merkez Plaza',
      maintenanceFee: 500,
      elevatorCount: 3,
      debt: 0,
      contactInfo: '5551234567',
      address: {
        mahalle: 'Merkez',
        sokak: 'Ana Cadde',
        il: 'İstanbul',
        ilce: 'Kadıköy',
        binaNo: '1'
      },
      notes: '',
      isMaintained: false,
      isDefective: false,
      label: 'green' as const
    },
    {
      name: 'Park Residence',
      maintenanceFee: 600,
      elevatorCount: 2,
      debt: 500,
      contactInfo: '5559876543',
      address: {
        mahalle: 'Park',
        sokak: 'Yeşil Sokak',
        il: 'İstanbul',
        ilce: 'Beşiktaş',
        binaNo: '5'
      },
      notes: '',
      isMaintained: false,
      isDefective: false,
      label: 'blue' as const
    },
    {
      name: 'Sahil Apartmanı',
      maintenanceFee: 400,
      elevatorCount: 1,
      debt: 0,
      contactInfo: '5555678901',
      address: {
        mahalle: 'Sahil',
        sokak: 'Deniz Caddesi',
        il: 'İstanbul',
        ilce: 'Bakırköy',
        binaNo: '10'
      },
      notes: '',
      isMaintained: false,
      isDefective: false,
      label: null
    }
  ];

  // Add sample buildings if none exist
  React.useEffect(() => {
    if (state.buildings.length === 0) {
      sampleBuildings.forEach(building => addBuilding(building));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setNewBuilding(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setNewBuilding(prev => ({
        ...prev,
        [name]: name === 'maintenanceFee' || name === 'elevatorCount' || name === 'debt' ? Number(value) : 
                name === 'label' ? (value === '' ? null : value as any) : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBuilding(newBuilding);
    setNewBuilding({
      name: '',
      maintenanceFee: 0,
      elevatorCount: 1,
      debt: 0,
      contactInfo: '',
      address: {
        mahalle: '',
        sokak: '',
        il: '',
        ilce: '',
        binaNo: ''
      },
      notes: '',
      isMaintained: false,
      isDefective: false,
      label: null
    });
    setShowAddForm(false);
  };

  const handleDeleteBuilding = (buildingId: string) => {
    deleteBuilding(buildingId);
    setShowDeleteConfirm(null);
  };

  const handleMaintenanceToggle = (buildingId: string, showReceipt: boolean = false) => {
    toggleMaintenance(buildingId, showReceipt);
    setShowMaintenanceOptions(null);
  };

  const handleShowQRCode = (building: Building) => {
    setShowQRCode(building.id);
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && showQRCode) {
      const building = state.buildings.find(b => b.id === showQRCode);
      if (!building) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>QR Kod - ${building.name}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
              .container { text-align: center; }
              h2 { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${building.name}</h2>
              ${document.getElementById('qr-code')?.innerHTML}
              <p style="margin-top: 20px; font-size: 14px;">Arıza bildirimi için QR kodu okutun</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getFullAddress = (building: Building) => {
    if (!building.address) return '';
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

  const filteredBuildings = state.buildings.filter(building => {
    if (activeTab === 'maintained' && !building.isMaintained) return false;
    if (activeTab === 'unmaintained' && building.isMaintained) return false;
    
    if (labelFilter !== 'all') {
      if (labelFilter === 'none' && building.label !== null) return false;
      if (labelFilter !== 'none' && building.label !== labelFilter) return false;
    }
    
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    const fullAddress = getFullAddress(building);
    return (
      building.name.toLowerCase().includes(query) ||
      fullAddress.toLowerCase().includes(query) ||
      building.contactInfo.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">Binalar</h1>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Bina ara..."
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">Tüm Etiketler</option>
            <option value="green">Yeşil</option>
            <option value="blue">Mavi</option>
            <option value="yellow">Sarı</option>
            <option value="red">Kırmızı</option>
            <option value="none">Etiketsiz</option>
          </select>
          
          <button
            type="button"
            className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Bina Ekle
          </button>
        </div>
      </div>
      
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            Tüm Binalar
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintained'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('maintained')}
          >
            Bakımı Yapılanlar
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'unmaintained'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('unmaintained')}
          >
            Bakımı Yapılmayanlar
          </button>
        </nav>
      </div>
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">Yeni Bina Ekle</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Bina Adı
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newBuilding.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="elevatorCount" className="block text-sm font-medium text-gray-700">
                      Asansör Sayısı
                    </label>
                    <input
                      type="number"
                      id="elevatorCount"
                      name="elevatorCount"
                      required
                      min="1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newBuilding.elevatorCount}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maintenanceFee" className="block text-sm font-medium text-gray-700">
                      Bakım Ücreti (Asansör Başına) (₺)
                    </label>
                    <input
                      type="number"
                      id="maintenanceFee"
                      name="maintenanceFee"
                      required
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newBuilding.maintenanceFee}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="debt" className="block text-sm font-medium text-gray-700">
                    Başlangıç Borcu (₺)
                  </label>
                  <input
                    type="number"
                    id="debt"
                    name="debt"
                    min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newBuilding.debt}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
                    İletişim Bilgisi
                  </label>
                  <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newBuilding.contactInfo}
                    onChange={handleInputChange}
                    placeholder="5551234567"
                  />
                </div>

                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                    Etiket
                  </label>
                  <select
                    id="label"
                    name="label"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newBuilding.label || ''}
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
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="address.il" className="block text-xs font-medium text-gray-600">
                        İl
                      </label>
                      <input
                        type="text"
                        id="address.il"
                        name="address.il"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={newBuilding.address.il}
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
                        id="address.ilce"
                        name="address.ilce"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={newBuilding.address.ilce}
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
                      id="address.mahalle"
                      name="address.mahalle"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={newBuilding.address.mahalle}
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
                      id="address.sokak"
                      name="address.sokak"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={newBuilding.address.sokak}
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
                      id="address.binaNo"
                      name="address.binaNo"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={newBuilding.address.binaNo}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notlar
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newBuilding.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Arıza Bildirim QR Kodu
              </h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col items-center" id="qr-code">
              <QRCodeSVG
                value={`${window.location.origin}/report-fault/${showQRCode}`}
                size={200}
                level="H"
              />
              <p className="mt-4 text-sm text-gray-600 text-center">
                Bu QR kodu okutarak arıza bildirimi yapılabilir
              </p>
            </div>
            <button
              onClick={printQRCode}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              QR Kodu Yazdır
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Options Modal */}
      {showMaintenanceOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bakım İşlemi
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Bakım işlemini nasıl tamamlamak istiyorsunuz?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleMaintenanceToggle(showMaintenanceOptions, false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-5 w-5 mr-2" />
                Sadece İşaretle
              </button>
              <button
                onClick={() => handleMaintenanceToggle(showMaintenanceOptions, true)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Bakım Fişi Göster
              </button>
              <button
                onClick={() => setShowMaintenanceOptions(null)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Binayı Sil
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bu binayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteBuilding(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBuildings.length > 0 ? (
            filteredBuildings.map((building) => (
              <li key={building.id}>
                <div className="flex items-center px-3 py-3 md:px-6 md:py-4">
                  <button
                    className={`flex-shrink-0 h-5 w-5 md:h-6 md:w-6 rounded border ${
                      building.isMaintained 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 bg-white'
                    } flex items-center justify-center mr-3`}
                    onClick={() => setShowMaintenanceOptions(building.id)}
                  >
                    {building.isMaintained && <Check className="h-3 w-3 md:h-4 md:w-4" />}
                  </button>
                  
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="min-w-0 flex-1 px-2 md:px-4">
                      <Link to={`/buildings/${building.id}`} className="block">
                        <div className="flex items-center">
                          <p className="text-sm md:text-base font-medium text-blue-600 truncate">{building.name}</p>
                        </div>
                        <p className="mt-1 flex text-xs md:text-sm text-gray-500">
                          <span className="truncate">{building.elevatorCount} asansör • Bakım: {(building.maintenanceFee * building.elevatorCount).toLocaleString('tr-TR')} ₺</span>
                          <span className="mx-1">•</span>
                          <span className="truncate">Borç: {building.debt.toLocaleString('tr-TR')} ₺</span>
                        </p>
                        <p className="mt-1 text-xs md:text-sm text-gray-500 truncate">{building.contactInfo}</p>
                        <p className="mt-1 text-xs md:text-sm text-gray-500 truncate">{getFullAddress(building)}</p>
                        {building.lastMaintenanceDate && building.lastMaintenanceTime && (
                          <p className="mt-1 text-xs text-green-600">
                            Son bakım: {new Date(building.lastMaintenanceDate).toLocaleDateString('tr-TR')} - {building.lastMaintenanceTime}
                          </p>
                        )}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="ml-2 md:ml-4 flex-shrink-0 flex items-center space-x-2">
                    {building.label && (
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mr-1" />
                        <span className={`inline-block w-2 h-2 md:w-3 md:h-3 rounded-full ${getLabelColor(building.label)}`}></span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="inline-flex items-center p-1 md:p-1.5 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleShowQRCode(building)}
                    >
                      <QrCode className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center p-1 md:p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => setShowDeleteConfirm(building.id)}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              {searchQuery ? 'Arama kriterine uygun bina bulunamadı.' : 'Henüz bina bulunmamaktadır.'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BuildingsPage;