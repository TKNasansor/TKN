import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, X, Edit, Trash2, Eye, ChevronLeft, Upload } from 'lucide-react';

const ProposalTypePage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { state, addProposal, updateProposal, deleteProposal } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const [proposalForm, setProposalForm] = useState({
    buildingName: '',
    title: '',
    description: '',
    fieldValues: {} as Record<string, any>,
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    totalAmount: 0,
    status: 'draft' as 'draft' | 'sent' | 'accepted' | 'rejected',
    pdfAttachment: ''
  });

  const proposalTypes = {
    installation: 'Montaj Teklifi',
    maintenance: 'Bakım Sözleşmesi',
    revision: 'Revizyon Teklifi'
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusTexts = {
    draft: 'Taslak',
    sent: 'Gönderildi',
    accepted: 'Kabul Edildi',
    rejected: 'Reddedildi'
  };

  if (!type || !proposalTypes[type as keyof typeof proposalTypes]) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Geçersiz teklif türü.</p>
        <button
          onClick={() => navigate('/proposals')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Teklifler Sayfasına Dön
        </button>
      </div>
    );
  }

  const filteredProposals = state.proposals.filter(proposal => proposal.type === type);
  const availableTemplates = state.proposalTemplates.filter(template => template.type === type);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...proposalForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    setProposalForm(prev => ({
      ...prev,
      items: newItems,
      totalAmount
    }));
  };

  const addItem = () => {
    const newId = (proposalForm.items.length + 1).toString();
    setProposalForm(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (proposalForm.items.length > 1) {
      const newItems = proposalForm.items.filter((_, i) => i !== index);
      const totalAmount = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      setProposalForm(prev => ({
        ...prev,
        items: newItems,
        totalAmount
      }));
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProposalForm(prev => ({
          ...prev,
          pdfAttachment: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const proposalData = {
      ...proposalForm,
      type: type as 'installation' | 'maintenance' | 'revision',
      templateId: selectedTemplate
    };
    
    if (editingProposal) {
      updateProposal({ ...proposalData, id: editingProposal });
      setEditingProposal(null);
    } else {
      addProposal(proposalData);
    }
    
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setProposalForm({
      buildingName: '',
      title: '',
      description: '',
      fieldValues: {},
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      totalAmount: 0,
      status: 'draft',
      pdfAttachment: ''
    });
    setSelectedTemplate('');
  };

  const handleEdit = (proposal: any) => {
    setProposalForm({
      buildingName: proposal.buildingName,
      title: proposal.title,
      description: proposal.description,
      fieldValues: proposal.fieldValues || {},
      items: proposal.items,
      totalAmount: proposal.totalAmount,
      status: proposal.status,
      pdfAttachment: proposal.pdfAttachment || ''
    });
    setSelectedTemplate(proposal.templateId || '');
    setEditingProposal(proposal.id);
    setShowForm(true);
  };

  const generateProposalPreview = (proposal: any) => {
    const template = state.proposalTemplates.find(t => t.id === proposal.templateId);
    const templateContent = template ? 
      state.settings?.[`${proposal.type}ProposalTemplate` as keyof typeof state.settings] || '' : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${proposal.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #333; }
            .proposal-title { font-size: 20px; color: #666; margin-top: 10px; }
            .content { margin-bottom: 30px; }
            .building-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .custom-fields { margin: 20px 0; }
            .field { margin: 10px 0; }
            .field-label { font-weight: bold; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { border-top: 2px solid #333; padding-top: 20px; text-align: center; margin-top: 30px; }
            @media print { .actions { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${state.settings?.companyName || 'Asansör Bakım Servisi'}</div>
            <div class="proposal-title">${proposalTypes[proposal.type]}</div>
          </div>
          
          <div class="content">
            <h2>${proposal.title}</h2>
            
            <div class="building-info">
              <strong>Bina:</strong> ${proposal.buildingName}<br>
              <strong>Tarih:</strong> ${new Date(proposal.createdDate).toLocaleDateString('tr-TR')}<br>
              <strong>Hazırlayan:</strong> ${proposal.createdBy}
            </div>
            
            <p>${proposal.description}</p>
            
            ${template && template.fields.length > 0 ? `
              <div class="custom-fields">
                <h3>Detaylar</h3>
                ${template.fields.map((field: any) => `
                  <div class="field">
                    <span class="field-label">${field.label}:</span>
                    <span>${proposal.fieldValues[field.name] || '-'}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Açıklama</th>
                  <th>Miktar</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${proposal.items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice.toLocaleString('tr-TR')} ₺</td>
                    <td>${item.totalPrice.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              Toplam Tutar: ${proposal.totalAmount.toLocaleString('tr-TR')} ₺
            </div>

            ${proposal.pdfAttachment ? `
              <div style="margin-top: 30px;">
                <h3>Ekli PDF</h3>
                <iframe 
                  src="${proposal.pdfAttachment}" 
                  width="100%" 
                  height="600px" 
                  style="border: none;"
                ></iframe>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Bu teklif 30 gün geçerlidir.</p>
            <p>${state.settings?.companyPhone || '0555 123 45 67'}</p>
          </div>
          
          <div class="actions" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; margin: 0 10px;">Yazdır</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; margin: 0 10px;">Kapat</button>
          </div>
        </body>
      </html>
    `;
  };

  const handlePreview = (proposal: any) => {
    const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (previewWindow) {
      previewWindow.document.write(generateProposalPreview(proposal));
      previewWindow.document.close();
      previewWindow.focus();
    }
  };

  const selectedTemplateData = state.proposalTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/proposals')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Geri
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            {proposalTypes[type as keyof typeof proposalTypes]}
          </h1>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Teklif Oluştur
          </button>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredProposals.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredProposals.map((proposal) => (
              <li key={proposal.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">{proposal.title}</h3>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[proposal.status]}`}>
                        {statusTexts[proposal.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{proposal.buildingName}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(proposal.createdDate).toLocaleDateString('tr-TR')} • {proposal.createdBy}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {proposal.totalAmount.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handlePreview(proposal)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(proposal)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProposal(proposal.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>Bu kategoride henüz teklif bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Proposal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingProposal ? 'Teklif Düzenle' : `Yeni ${proposalTypes[type as keyof typeof proposalTypes]}`}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProposal(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bina Adı
                  </label>
                  <input
                    type="text"
                    value={proposalForm.buildingName}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, buildingName: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Bina adını girin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Durum
                  </label>
                  <select
                    value={proposalForm.status}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Taslak</option>
                    <option value="sent">Gönderildi</option>
                    <option value="accepted">Kabul Edildi</option>
                    <option value="rejected">Reddedildi</option>
                  </select>
                </div>
              </div>

              {availableTemplates.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Şablon Seç
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Şablon seçin (opsiyonel)</option>
                    {availableTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Teklif Başlığı
                </label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Teklif başlığı"
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Teklif açıklaması"
                />
              </div>

              {/* Custom Fields */}
              {selectedTemplateData && selectedTemplateData.fields.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Özel Alanlar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplateData.fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            required={field.required}
                            value={proposalForm.fieldValues[field.name] || ''}
                            onChange={(e) => setProposalForm(prev => ({
                              ...prev,
                              fieldValues: { ...prev.fieldValues, [field.name]: e.target.value }
                            }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <input
                            type={field.type}
                            required={field.required}
                            value={proposalForm.fieldValues[field.name] || ''}
                            onChange={(e) => setProposalForm(prev => ({
                              ...prev,
                              fieldValues: { ...prev.fieldValues, [field.name]: e.target.value }
                            }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  PDF Eki
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    PDF Yükle
                  </label>
                  {proposalForm.pdfAttachment && (
                    <span className="ml-3 text-sm text-green-600">PDF yüklendi</span>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Teklif Kalemleri
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Kalem Ekle
                  </button>
                </div>
                
                <div className="space-y-4">
                  {proposalForm.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-md">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Açıklama"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Miktar"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Birim Fiyat"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {item.totalPrice.toLocaleString('tr-TR')} ₺
                        </span>
                        {proposalForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <span className="text-lg font-bold text-gray-900">
                    Toplam: {proposalForm.totalAmount.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProposal(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {editingProposal ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalTypePage;
