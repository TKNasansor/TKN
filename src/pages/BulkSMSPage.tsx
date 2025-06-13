import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Plus, X, Send, Edit, Trash2 } from 'lucide-react';

const BulkSMSPage: React.FC = () => {
  const { state, addSMSTemplate, updateSMSTemplate, deleteSMSTemplate, sendBulkSMS, sendWhatsApp } = useApp();
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: ''
  });

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateSMSTemplate({ ...templateForm, id: editingTemplate });
      setEditingTemplate(null);
    } else {
      addSMSTemplate(templateForm);
    }
    setTemplateForm({ name: '', content: '' });
    setShowTemplateForm(false);
  };

  const handleEditTemplate = (template: any) => {
    setTemplateForm({ name: template.name, content: template.content });
    setEditingTemplate(template.id);
    setShowTemplateForm(true);
  };

  const handleSendMessage = () => {
    if (selectedTemplate && selectedBuildings.length > 0) {
      if (sendMethod === 'whatsapp') {
        sendWhatsApp(selectedTemplate, selectedBuildings);
      } else {
        sendBulkSMS(selectedTemplate, selectedBuildings);
      }
      setSelectedBuildings([]);
      setSelectedTemplate('');
      setShowSendForm(false);
      alert(`${sendMethod === 'whatsapp' ? 'WhatsApp mesajları' : 'SMS gönderimi'} başlatıldı!`);
    }
  };

  const toggleBuildingSelection = (buildingId: string) => {
    setSelectedBuildings(prev => 
      prev.includes(buildingId) 
        ? prev.filter(id => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Toplu Mesaj</h1>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Şablon Ekle
          </button>
          
          <button
            onClick={() => setShowSendForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Send className="h-5 w-5 mr-2" />
            Mesaj Gönder
          </button>
        </div>
      </div>

      {/* Message Templates */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mesaj Şablonları</h3>
        </div>
        
        {state.smsTemplates.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {state.smsTemplates.map((template) => (
              <li key={template.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{template.content}</p>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSMSTemplate(template.id)}
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
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Henüz mesaj şablonu bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">
                {editingTemplate ? 'Şablon Düzenle' : 'Yeni Mesaj Şablonu'}
              </h2>
              <button
                onClick={() => {
                  setShowTemplateForm(false);
                  setEditingTemplate(null);
                  setTemplateForm({ name: '', content: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleTemplateSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Şablon Adı
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn: Bakım Hatırlatması"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mesaj İçeriği
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Mesajınızı buraya yazın..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Karakter sayısı: {templateForm.content.length}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingTemplate ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-800">Toplu Mesaj Gönder</h2>
              <button
                onClick={() => {
                  setShowSendForm(false);
                  setSelectedBuildings([]);
                  setSelectedTemplate('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gönderim Yöntemi
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="whatsapp"
                        checked={sendMethod === 'whatsapp'}
                        onChange={(e) => setSendMethod(e.target.value as 'whatsapp')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="sms"
                        checked={sendMethod === 'sms'}
                        onChange={(e) => setSendMethod(e.target.value as 'sms')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">SMS</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesaj Şablonu Seçin
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Şablon seçin...</option>
                    {state.smsTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Binalar Seçin ({selectedBuildings.length} seçili)
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                    {state.buildings.map((building) => (
                      <label key={building.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBuildings.includes(building.id)}
                          onChange={() => toggleBuildingSelection(building.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{building.name}</p>
                          <p className="text-xs text-gray-500">{building.contactInfo}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {selectedTemplate && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Önizleme:</h4>
                    <p className="text-sm text-gray-600">
                      {state.smsTemplates.find(t => t.id === selectedTemplate)?.content}
                    </p>
                  </div>
                )}

                {sendMethod === 'whatsapp' && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>WhatsApp Gönderimi:</strong> Her bina için ayrı WhatsApp penceresi açılacak. 
                      Mesajları manuel olarak göndermeniz gerekecek.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSendForm(false);
                    setSelectedBuildings([]);
                    setSelectedTemplate('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!selectedTemplate || selectedBuildings.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMethod === 'whatsapp' ? 'WhatsApp Gönder' : 'SMS Gönder'} ({selectedBuildings.length} bina)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkSMSPage;