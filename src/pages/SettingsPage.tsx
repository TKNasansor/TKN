import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, User, Edit2, Save, X, Trash2, Building, FileText, QrCode } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { state, updateSettings, deleteUser } = useApp();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingTemplates, setEditingTemplates] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState(state.settings?.appTitle ?? '');
  const [companyInfo, setCompanyInfo] = useState({
    companyName: state.settings?.companyName ?? '',
    companyPhone: state.settings?.companyPhone ?? '',
    companyAddress: state.settings?.companyAddress ?? {
      mahalle: '',
      sokak: '',
      il: '',
      ilce: '',
      binaNo: ''
    }
  });
  const [templates, setTemplates] = useState({
    receiptTemplate: state.settings?.receiptTemplate ?? '',
    proposalTemplate: state.settings?.proposalTemplate ?? '',
    faultReportTemplate: state.settings?.faultReportTemplate ?? ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleSave = () => {
    if (newTitle.trim()) {
      updateSettings({ appTitle: newTitle.trim() });
      setEditingTitle(false);
    }
  };

  const handleCompanySave = () => {
    updateSettings(companyInfo);
    setEditingCompany(false);
  };

  const handleTemplatesSave = () => {
    updateSettings(templates);
    setEditingTemplates(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === state.currentUser?.id) {
      alert('Aktif kullanıcı silinemez!');
      return;
    }
    deleteUser(userId);
    setShowDeleteConfirm(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSettings({ logo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      companyAddress: {
        ...prev.companyAddress,
        [field]: value
      }
    }));
  };

  const getFullCompanyAddress = () => {
    if (!state.settings?.companyAddress) return 'Belirtilmemiş';
    const { mahalle, sokak, binaNo, ilce, il } = state.settings.companyAddress;
    return `${mahalle} ${sokak} ${binaNo}, ${ilce}/${il}`.trim();
  };
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ayarlar</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Uygulama Ayarları</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uygulama Başlığı
              </label>
              {editingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Uygulama başlığı"
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-2 text-green-600 hover:text-green-800"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTitle(false);
                      setNewTitle(state.settings?.appTitle ?? '');
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{state.settings?.appTitle}</span>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                {state.settings?.logo && (
                  <img 
                    src={state.settings.logo} 
                    alt="Logo" 
                    className="h-12 w-12 object-contain"
                  />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logo Yükle
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Firma Bilgileri</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {editingCompany ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Adı
                  </label>
                  <input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Firma adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Telefonu
                  </label>
                  <input
                    type="text"
                    value={companyInfo.companyPhone}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, companyPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0555 123 45 67"
                  />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Firma Adresi</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">İl</label>
                      <input
                        type="text"
                        value={companyInfo.companyAddress.il}
                        onChange={(e) => handleAddressChange('il', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="İstanbul"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600">İlçe</label>
                      <input
                        type="text"
                        value={companyInfo.companyAddress.ilce}
                        onChange={(e) => handleAddressChange('ilce', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Kadıköy"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Mahalle</label>
                    <input
                      type="text"
                      value={companyInfo.companyAddress.mahalle}
                      onChange={(e) => handleAddressChange('mahalle', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Merkez Mahalle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Sokak</label>
                    <input
                      type="text"
                      value={companyInfo.companyAddress.sokak}
                      onChange={(e) => handleAddressChange('sokak', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ana Cadde"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Bina No</label>
                    <input
                      type="text"
                      value={companyInfo.companyAddress.binaNo}
                      onChange={(e) => handleAddressChange('binaNo', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleCompanySave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 inline mr-1" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setEditingCompany(false);
                      setCompanyInfo({
                        companyName: state.settings?.companyName ?? '',
                        companyPhone: state.settings?.companyPhone ?? '',
                        companyAddress: state.settings?.companyAddress ?? {
                          mahalle: '',
                          sokak: '',
                          il: '',
                          ilce: '',
                          binaNo: ''
                        }
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    <X className="h-4 w-4 inline mr-1" />
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Firma Adı</h4>
                    <p className="text-gray-900">{state.settings?.companyName}</p>
                  </div>
                  <button
                    onClick={() => setEditingCompany(true)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Firma Telefonu</h4>
                  <p className="text-gray-900">{state.settings?.companyPhone}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Firma Adresi</h4>
                  <p className="text-gray-900">{getFullCompanyAddress()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Şablon Ayarları</h3>
              </div>
              {!editingTemplates && (
                <button
                  onClick={() => setEditingTemplates('all')}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {editingTemplates ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bakım Fişi Şablonu
                  </label>
                  <textarea
                    rows={8}
                    value={templates.receiptTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, receiptTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Bakım fişi HTML şablonu..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teklif Şablonu
                  </label>
                  <textarea
                    rows={8}
                    value={templates.proposalTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, proposalTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Teklif HTML şablonu..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arıza Bildirim Şablonu
                  </label>
                  <textarea
                    rows={8}
                    value={templates.faultReportTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, faultReportTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Arıza bildirim HTML şablonu..."
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleTemplatesSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 inline mr-1" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplates(null);
                      setTemplates({
                        receiptTemplate: state.settings?.receiptTemplate ?? '',
                        proposalTemplate: state.settings?.proposalTemplate ?? '',
                        faultReportTemplate: state.settings?.faultReportTemplate ?? ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    <X className="h-4 w-4 inline mr-1" />
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Bakım Fişi Şablonu</h4>
                  <p className="text-sm text-gray-500">Bakım fişlerinin görünümünü düzenleyin</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Teklif Şablonu</h4>
                  <p className="text-sm text-gray-500">Teklif belgelerinin görünümünü düzenleyin</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Arıza Bildirim Şablonu</h4>
                  <p className="text-sm text-gray-500">QR kod sayfasının görünümünü düzenleyin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Kullanıcı Ayarları</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {state.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-gray-900 font-medium">{user.name}</span>
                    {user.id === state.currentUser?.id && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  {user.id !== state.currentUser?.id && (
                    <button
                      onClick={() => setShowDeleteConfirm(user.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Kullanıcıyı Sil
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bu kullanıcıyı silmek istediğinizden emin misiniz?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;