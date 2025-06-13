import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, X, Printer, Wifi, Settings } from 'lucide-react';

const PrintersPage: React.FC = () => {
  const { state, addPrinter, updatePrinter, deletePrinter } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    ipAddress: '',
    port: 9100,
    isDefault: false,
    type: 'thermal' as 'thermal' | 'inkjet' | 'laser',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewPrinter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               name === 'port' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPrinter(newPrinter);
    setNewPrinter({
      name: '',
      ipAddress: '',
      port: 9100,
      isDefault: false,
      type: 'thermal',
    });
    setShowAddForm(false);
  };

  const handleEdit = (printer: any) => {
    setNewPrinter(printer);
    setEditingPrinter(printer.id);
    setShowAddForm(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrinter) {
      updatePrinter({ ...newPrinter, id: editingPrinter });
      setEditingPrinter(null);
      setNewPrinter({
        name: '',
        ipAddress: '',
        port: 9100,
        isDefault: false,
        type: 'thermal',
      });
      setShowAddForm(false);
    }
  };

  const handleDelete = (printerId: string) => {
    deletePrinter(printerId);
    setShowDeleteConfirm(null);
  };

  const filteredPrinters = state.printers.filter(printer => {
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      printer.name.toLowerCase().includes(query) ||
      printer.ipAddress.toLowerCase().includes(query)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'thermal':
        return '🧾';
      case 'inkjet':
        return '🖨️';
      case 'laser':
        return '⚡';
      default:
        return '🖨️';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'thermal':
        return 'Termal Yazıcı';
      case 'inkjet':
        return 'Mürekkep Püskürtmeli';
      case 'laser':
        return 'Lazer Yazıcı';
      default:
        return 'Bilinmeyen';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Yazıcılar</h1>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Yazıcı ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Yazıcı Ekle
          </button>
        </div>
      </div>

      {/* Add/Edit Printer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingPrinter ? 'Yazıcı Düzenle' : 'Yeni Yazıcı Ekle'}
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPrinter(null);
                  setNewPrinter({
                    name: '',
                    ipAddress: '',
                    port: 9100,
                    isDefault: false,
                    type: 'thermal',
                  });
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={editingPrinter ? handleUpdate : handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Yazıcı Adı
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newPrinter.name}
                    onChange={handleInputChange}
                    placeholder="Örn: Ofis Yazıcısı"
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Yazıcı Tipi
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newPrinter.type}
                    onChange={handleInputChange}
                  >
                    <option value="thermal">Termal Yazıcı (Fiş)</option>
                    <option value="inkjet">Mürekkep Püskürtmeli</option>
                    <option value="laser">Lazer Yazıcı</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">
                    IP Adresi
                  </label>
                  <input
                    type="text"
                    id="ipAddress"
                    name="ipAddress"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newPrinter.ipAddress}
                    onChange={handleInputChange}
                    placeholder="192.168.1.100"
                  />
                </div>
                
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                    Port
                  </label>
                  <input
                    type="number"
                    id="port"
                    name="port"
                    required
                    min="1"
                    max="65535"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newPrinter.port}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={newPrinter.isDefault}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Varsayılan yazıcı olarak ayarla
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingPrinter ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Yazıcıyı Sil
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bu yazıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printers List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredPrinters.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredPrinters.map((printer) => (
              <li key={printer.id}>
                <div className="flex items-center px-6 py-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl">{getTypeIcon(printer.type)}</span>
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 px-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {printer.name}
                        {printer.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Varsayılan
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Wifi className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">{printer.ipAddress}:{printer.port}</span>
                      <span className="mx-2">•</span>
                      <span className="truncate">{getTypeText(printer.type)}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      type="button"
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => handleEdit(printer)}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => setShowDeleteConfirm(printer.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            {searchQuery ? 'Arama kriterine uygun yazıcı bulunamadı.' : 'Henüz yazıcı bulunmamaktadır.'}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Printer className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Yazıcı Kurulum Bilgileri
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Termal yazıcılar bakım fişleri için önerilir</li>
                <li>IP adresi ve port bilgilerini yazıcı ayarlarından öğrenebilirsiniz</li>
                <li>Varsayılan yazıcı otomatik olarak bakım fişleri için kullanılır</li>
                <li>Yazıcının ağa bağlı ve erişilebilir olduğundan emin olun</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintersPage;