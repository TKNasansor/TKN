import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppSettings } from '../types';
import { Plus, Search, X, Check, QrCode, Trash2, Tag, AlertTriangle, Settings, User, Edit2, Save, Building, FileText, Upload } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { state, updateSettings, deleteUser, addNotification } = useApp(); // addProposalTemplate, updateProposalTemplate, deleteProposalTemplate kaldırıldı

  const [localSettings, setLocalSettings] = useState<Partial<AppSettings>>(state.settings || {});

  useEffect(() => {
    setLocalSettings(state.settings || {});
  }, [state.settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('companyAddress.')) {
      const addressField = name.split('.')[1] as keyof AppSettings['companyAddress'];
      setLocalSettings(prev => ({
        ...prev,
        companyAddress: {
          ...(prev.companyAddress || {}),
          [addressField]: value
        }
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    addNotification('Ayarlar başarıyla kaydedildi!');
  };

  // Eski koddan kalan diğer state ve fonksiyon tanımlamaları - ÇOĞU KALDIRILDI
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: state.settings?.companyName ?? '',
    companyPhone: state.settings?.companyPhone ?? '',
    companySlogan: state.settings?.companySlogan ?? '', // YENİ EKLENDİ
    companyAddress: state.settings?.companyAddress ?? {
      mahalle: '',
      sokak: '',
      il: '',
      ilce: '',
      binaNo: ''
    }
  });
  
  // Şablon ayarları ile ilgili state'ler kaldırıldı
  // Teklif şablonları ile ilgili state'ler kaldırıldı
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCompanySave = () => {
    updateSettings(companyInfo);
    setEditingCompany(false);
    addNotification('Firma bilgileri başarıyla kaydedildi!'); // Bildirim eklendi
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === state.currentUser?.id) {
      addNotification('Aktif kullanıcı silinemez!');
      return;
    }
    deleteUser(userId);
    setShowDeleteConfirm(null);
    addNotification('Kullanıcı başarıyla silindi!');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSettings({ logo: base64String });
        addNotification('Logo başarıyla yüklendi!');
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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Uygulama Ayarları</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Uygulama Başlığı bölümü kaldırıldı */}
        {/* Logo bölümü Firma Bilgileri'ne taşındı */}

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Firma adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Slogan
                  </label>
                  <input
                    type="text"
                    value={companyInfo.companySlogan} // YENİ EKLENDİ
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, companySlogan: e.target.value }))} // YENİ EKLENDİ
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Firma sloganı"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="İstanbul"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600">İlçe</label>
                      <input
                        type="text"
                        value={companyInfo.companyAddress.ilce}
                        onChange={(e) => handleAddressChange('ilce', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Merkez Mahalle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Sokak</label>
                    <input
                      type="text"
                      value={companyInfo.companyAddress.sokak}
                      onChange={(e) => handleAddressChange('sokak', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ana Cadde"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Bina No</label>
                    <input
                      type="text"
                      value={companyInfo.companyAddress.binaNo}
                      onChange={(e) => handleAddressChange('binaNo', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div> {/* Logo yükleme buraya taşındı */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Logosu
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
                      type="button" // type="button" eklendi
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
                
                <div className="flex space-x-2">
                  <button
                    type="button" // type="button" eklendi
                    onClick={handleCompanySave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 inline mr-1" />
                    Kaydet
                  </button>
                  <button
                    type="button" // type="button" eklendi
                    onClick={() => {
                      setEditingCompany(false);
                      setCompanyInfo({
                        companyName: state.settings?.companyName ?? '',
                        companyPhone: state.settings?.companyPhone ?? '',
                        companySlogan: state.settings?.companySlogan ?? '', // YENİ EKLENDİ
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
                    type="button" // type="button" eklendi
                    onClick={() => setEditingCompany(true)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Firma Slogan</h4> {/* YENİ EKLENDİ */}
                  <p className="text-gray-900">{state.settings?.companySlogan}</p> {/* YENİ EKLENDİ */}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Firma Telefonu</h4>
                  <p className="text-gray-900">{state.settings?.companyPhone}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Firma Adresi</h4>
                  <p className="text-gray-900">{getFullCompanyAddress()}</p>
                </div>

                <div> {/* Logo önizlemesi buraya taşındı */}
                  <h4 className="text-sm font-medium text-gray-700">Firma Logosu</h4>
                  {state.settings?.logo ? (
                    <img 
                      src={state.settings.logo} 
                      alt="Logo" 
                      className="h-12 w-12 object-contain mt-2"
                    />
                  ) : (
                    <p className="text-gray-500 text-sm mt-2">Logo yüklenmemiş.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Şablon Ayarları bölümü kaldırıldı */}
        {/* Teklif Şablonları (Word/PDF) bölümü kaldırıldı */}

        {/* Amblem Ayarları bölümü Sertifika Ayarları olarak güncellendi */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Sertifika Ayarları</h3> {/* BAŞLIK GÜNCELLENDİ */}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CE Sertifikası URL
              </label>
              <input
                type="url"
                value={state.settings?.ceEmblemUrl || ''}
                onChange={(e) => updateSettings({ ceEmblemUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/ce-sertifikasi.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                CE sertifikası için görsel URL'si girin
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TSE Sertifikası URL
              </label>
              <input
                type="url"
                value={state.settings?.tseEmblemUrl || ''}
                onChange={(e) => updateSettings({ tseEmblemUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/tse-sertifikasi.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                TSE sertifikası için görsel URL'si girin
              </p>
            </div>

            {(state.settings?.ceEmblemUrl || state.settings?.tseEmblemUrl) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sertifika Önizlemesi:</h4>
                <div className="flex space-x-4">
                  {state.settings?.ceEmblemUrl && (
                    <div className="text-center">
                      <img 
                        src={state.settings.ceEmblemUrl} 
                        alt="CE Sertifikası" 
                        className="h-12 w-12 object-contain mx-auto mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500">CE Sertifikası</p>
                    </div>
                  )}
                  {state.settings?.tseEmblemUrl && (
                    <div className="text-center">
                      <img 
                        src={state.settings.tseEmblemUrl} 
                        alt="TSE Sertifikası" 
                        className="h-12 w-12 object-contain mx-auto mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500">TSE Sertifikası</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* "Nasıl Kullanılır" bilgi kartı kaldırıldı */}
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
                      type="button" // type="button" eklendi
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

      {/* Teklif Şablonu Form Modalı kaldırıldı */}

      {/* Silme Onayı Modalı */}
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
                type="button" // type="button" eklendi
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="button" // type="button" eklendi
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
