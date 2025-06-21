import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, User, Edit2, Save, X, Trash2, Building, FileText, QrCode, Upload, Plus } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { state, updateSettings, deleteUser, addProposalTemplate, updateProposalTemplate, deleteProposalTemplate } = useApp();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingTemplates, setEditingTemplates] = useState<string | null>(null);
  const [showProposalTemplateForm, setShowProposalTemplateForm] = useState(false);
  const [editingProposalTemplate, setEditingProposalTemplate] = useState<string | null>(null);
  
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
    installationProposalTemplate: state.settings?.installationProposalTemplate ?? '',
    maintenanceProposalTemplate: state.settings?.maintenanceProposalTemplate ?? '',
    revisionProposalTemplate: state.settings?.revisionProposalTemplate ?? '',
    faultReportTemplate: state.settings?.faultReportTemplate ?? ''
  });
  
  const [proposalTemplateForm, setProposalTemplateForm] = useState({
    type: 'installation' as 'installation' | 'maintenance' | 'revision',
    name: '',
    content: '',
    fields: [] as any[],
    documentFile: '',
    fillableFields: [] as any[]
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

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

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProposalTemplateForm(prev => ({
          ...prev,
          documentFile: base64String
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Lütfen sadece Word (.docx, .doc) veya PDF dosyası yükleyin.');
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

  const addFillableField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setProposalTemplateForm(prev => ({
      ...prev,
      fillableFields: [...prev.fillableFields, newField]
    }));
  };

  const updateFillableField = (index: number, field: string, value: any) => {
    setProposalTemplateForm(prev => ({
      ...prev,
      fillableFields: prev.fillableFields.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }));
  };

  const removeFillableField = (index: number) => {
    setProposalTemplateForm(prev => ({
      ...prev,
      fillableFields: prev.fillableFields.filter((_, i) => i !== index)
    }));
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setProposalTemplateForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index: number, field: string, value: any) => {
    setProposalTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }));
  };

  const removeField = (index: number) => {
    setProposalTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleProposalTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProposalTemplate) {
      updateProposalTemplate({ ...proposalTemplateForm, id: editingProposalTemplate });
      setEditingProposalTemplate(null);
    } else {
      addProposalTemplate(proposalTemplateForm);
    }
    setProposalTemplateForm({
      type: 'installation',
      name: '',
      content: '',
      fields: [],
      documentFile: '',
      fillableFields: []
    });
    setShowProposalTemplateForm(false);
  };

  const editProposalTemplate = (template: any) => {
    setProposalTemplateForm({
      type: template.type,
      name: template.name,
      content: template.content,
      fields: template.fields,
      documentFile: template.documentFile || '',
      fillableFields: template.fillableFields || []
    });
    setEditingProposalTemplate(template.id);
    setShowProposalTemplateForm(true);
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
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Kullanılabilir Değişkenler:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>{'{{LOGO}}'} - Firma logosu</div>
                      <div>{'{{COMPANY_NAME}}'} - Firma adı</div>
                      <div>{'{{COMPANY_ADDRESS}}'} - Firma adresi</div>
                      <div>{'{{COMPANY_PHONE}}'} - Firma telefonu</div>
                      <div>{'{{CE_EMBLEM}}'} - CE amblemi</div>
                      <div>{'{{TSE_EMBLEM}}'} - TSE amblemi</div>
                      <div>{'{{DATE}}'} - Tarih</div>
                      <div>{'{{BUILDING_NAME}}'} - Bina adı</div>
                      <div>{'{{BUILDING_ADDRESS}}'} - Bina adresi</div>
                      <div>{'{{ELEVATOR_COUNT}}'} - Asansör sayısı</div>
                      <div>{'{{MAINTENANCE_ACTION}}'} - Bakım işlemi</div>
                      <div>{'{{TECHNICIAN}}'} - Teknisyen</div>
                      <div>{'{{MAINTENANCE_FEE}}'} - Bakım ücreti</div>
                      <div>{'{{PARTS_SECTION}}'} - Parçalar bölümü</div>
                      <div>{'{{DEBT_SECTION}}'} - Borç bölümü</div>
                      <div>{'{{TOTAL_AMOUNT}}'} - Toplam tutar</div>
                      <div>{'{{TIMESTAMP}}'} - Zaman damgası</div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="text-xs font-semibold text-blue-800 mb-2">Amblem Kullanımı:</h5>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• CE amblemi için: {'{{CE_EMBLEM}}'}</p>
                        <p>• TSE amblemi için: {'{{TSE_EMBLEM}}'}</p>
                        <p>• Bu değişkenler otomatik olarak img etiketlerine dönüştürülür</p>
                        <p>• Amblem URL'lerini ayarlar bölümünden güncelleyebilirsiniz</p>
                      </div>
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    value={templates.receiptTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, receiptTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder={`Bakım fişi HTML şablonu örneği:

<div class="header">
  {{LOGO}}
  <h1>{{COMPANY_NAME}}</h1>
  <div class="certifications">
    {{CE_EMBLEM}}
    {{TSE_EMBLEM}}
  </div>
</div>

<div class="content">
  <h2>BAKIM FİŞİ</h2>
  <p>Bina: {{BUILDING_NAME}}</p>
  <p>Tarih: {{DATE}}</p>
  <p>Teknisyen: {{TECHNICIAN}}</p>
</div>`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montaj Teklifi Şablonu
                  </label>
                  <textarea
                    rows={8}
                    value={templates.installationProposalTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, installationProposalTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Montaj teklifi HTML şablonu..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bakım Sözleşmesi Şablonu
                  </label>
                  <textarea
                    rows={8}
                    value={templates.maintenanceProposalTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, maintenanceProposalTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Bakım sözleşmesi HTML şablonu..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revizyon Teklifi Şablonu
                  </label>
                  <textarea
                    rows={8}
                    value={templates.revisionProposalTemplate}
                    onChange={(e) => setTemplates(prev => ({ ...prev, revisionProposalTemplate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Revizyon teklifi HTML şablonu..."
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
                        installationProposalTemplate: state.settings?.installationProposalTemplate ?? '',
                        maintenanceProposalTemplate: state.settings?.maintenanceProposalTemplate ?? '',
                        revisionProposalTemplate: state.settings?.revisionProposalTemplate ?? '',
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
                  <h4 className="text-sm font-medium text-gray-700">Teklif Şablonları</h4>
                  <p className="text-sm text-gray-500">Montaj, bakım ve revizyon teklif belgelerinin görünümünü düzenleyin</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Arıza Bildirim Şablonu</h4>
                  <p className="text-sm text-gray-500">QR kod sayfasının görünümünü düzenleyin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Proposal Templates */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Teklif Şablonları (Word/PDF)</h3>
              </div>
              <button
                onClick={() => setShowProposalTemplateForm(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Şablon Ekle
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {state.proposalTemplates.length > 0 ? (
              <div className="space-y-4">
                {state.proposalTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-500">
                          {template.type === 'installation' ? 'Montaj Teklifi' :
                           template.type === 'maintenance' ? 'Bakım Sözleşmesi' : 'Revizyon Teklifi'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.fillableFields?.length || 0} doldurulabilir alan
                        </p>
                        {template.documentFile && (
                          <p className="text-xs text-green-600 mt-1">✓ Belge yüklendi</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editProposalTemplate(template)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProposalTemplate(template.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Henüz teklif şablonu bulunmamaktadır.</p>
            )}
          </div>
        </div>

        {/* Emblem Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Amblem Ayarları</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CE Amblemi URL
              </label>
              <input
                type="url"
                value={state.settings?.ceEmblemUrl || ''}
                onChange={(e) => updateSettings({ ceEmblemUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/ce-emblem.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                CE amblemi için görsel URL'si girin
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TSE Amblemi URL
              </label>
              <input
                type="url"
                value={state.settings?.tseEmblemUrl || ''}
                onChange={(e) => updateSettings({ tseEmblemUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/tse-emblem.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                TSE amblemi için görsel URL'si girin
              </p>
            </div>

            {(state.settings?.ceEmblemUrl || state.settings?.tseEmblemUrl) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Amblem Önizlemesi:</h4>
                <div className="flex space-x-4">
                  {state.settings?.ceEmblemUrl && (
                    <div className="text-center">
                      <img 
                        src={state.settings.ceEmblemUrl} 
                        alt="CE Amblemi" 
                        className="h-12 w-12 object-contain mx-auto mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500">CE Amblemi</p>
                    </div>
                  )}
                  {state.settings?.tseEmblemUrl && (
                    <div className="text-center">
                      <img 
                        src={state.settings.tseEmblemUrl} 
                        alt="TSE Amblemi" 
                        className="h-12 w-12 object-contain mx-auto mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500">TSE Amblemi</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Nasıl Kullanılır:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Amblem görsellerini bir sunucuya yükleyin (örn: Google Drive, Dropbox)</p>
                <p>2. Görsellerin doğrudan erişim URL'lerini yukarıdaki alanlara girin</p>
                <p>3. Bakım fişi şablonunda {`{{CE_EMBLEM}}`} ve {`{{TSE_EMBLEM}}`} değişkenlerini kullanın</p>
                <p>4. Bu değişkenler otomatik olarak img etiketlerine dönüştürülecektir</p>
              </div>
            </div>
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

      {/* Proposal Template Form Modal */}
      {showProposalTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingProposalTemplate ? 'Şablon Düzenle' : 'Yeni Teklif Şablonu'}
              </h2>
              <button
                onClick={() => {
                  setShowProposalTemplateForm(false);
                  setEditingProposalTemplate(null);
                  setProposalTemplateForm({
                    type: 'installation',
                    name: '',
                    content: '',
                    fields: [],
                    documentFile: '',
                    fillableFields: []
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleProposalTemplateSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Şablon Adı
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={proposalTemplateForm.name}
                      onChange={(e) => setProposalTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Şablon adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Teklif Türü
                    </label>
                    <select
                      value={proposalTemplateForm.type}
                      onChange={(e) => setProposalTemplateForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="installation">Montaj Teklifi</option>
                      <option value="maintenance">Bakım Sözleşmesi</option>
                      <option value="revision">Revizyon Teklifi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Word/PDF Belge Yükle
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => documentInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Belge Yükle
                    </button>
                    {proposalTemplateForm.documentFile && (
                      <span className="text-sm text-green-600">✓ Belge yüklendi</span>
                    )}
                    <input
                      ref={documentInputRef}
                      type="file"
                      accept=".doc,.docx,.pdf"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Word (.doc, .docx) veya PDF dosyası yükleyebilirsiniz
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Doldurulabilir Alanlar
                    </label>
                    <button
                      type="button"
                      onClick={addFillableField}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Alan Ekle
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Bu alanlar teklif oluştururken doldurulacak ve belgeye yerleştirilecektir.
                  </p>
                  
                  <div className="space-y-3">
                    {proposalTemplateForm.fillableFields.map((field, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Alan Adı</label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => updateFillableField(index, 'name', e.target.value)}
                              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="alan_adi"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Etiket</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateFillableField(index, 'label', e.target.value)}
                              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Alan Etiketi"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Tip</label>
                            <select
                              value={field.type}
                              onChange={(e) => updateFillableField(index, 'type', e.target.value)}
                              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="text">Metin</option>
                              <option value="number">Sayı</option>
                              <option value="date">Tarih</option>
                              <option value="textarea">Uzun Metin</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateFillableField(index, 'required', e.target.checked)}
                                className="h-3 w-3 text-blue-600"
                              />
                              <span className="ml-1 text-xs text-gray-600">Zorunlu</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeFillableField(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => updateFillableField(index, 'placeholder', e.target.value)}
                            className="block w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Placeholder metni"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingProposalTemplate ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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