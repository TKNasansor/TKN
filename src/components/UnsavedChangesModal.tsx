import React from 'react';
import { AlertTriangle, Save, Trash2, ArrowLeft } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onReturn: () => void;
  formType?: string;
  lastAutoSave?: string;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onReturn,
  formType = 'form',
  lastAutoSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-center pt-6 pb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kaydedilmemiş Değişiklikler
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {formType} formunda kaydedilmemiş değişiklikleriniz var. 
              Çıkmadan önce değişikliklerinizi kaydetmek istiyor musunuz?
            </p>
            
            {lastAutoSave && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  <strong>Son otomatik kayıt:</strong> {new Date(lastAutoSave).toLocaleString('tr-TR')}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={onSave}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              Değişiklikleri Kaydet
            </button>
            
            <button
              onClick={onReturn}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Forma Geri Dön
            </button>
            
            <button
              onClick={onDiscard}
              className="w-full flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium transition-colors"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Değişiklikleri Kaydetme
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Önerilen seçenek: <strong>Değişiklikleri Kaydet</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;