import React, { useState } from 'react';
import { AlertTriangle, Clock, User, FileText, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FaultNotificationModalProps {
  isOpen: boolean;
  buildingName: string;
  onSubmit: (data: {
    description: string;
    severity: 'low' | 'medium' | 'high';
    reportedBy: string;
  }) => void;
  onCancel: () => void;
}

const FaultNotificationModal: React.FC<FaultNotificationModalProps> = ({
  isOpen,
  buildingName,
  onSubmit,
  onCancel
}) => {
  const { state } = useApp();
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [reportedBy, setReportedBy] = useState(state.currentUser?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportedBy.trim()) {
      alert('Bildiren kişi bilgisi zorunludur.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        description: description.trim(),
        severity,
        reportedBy: reportedBy.trim()
      });
      
      // Reset form
      setDescription('');
      setSeverity('medium');
      setReportedBy(state.currentUser?.name || '');
    } catch (error) {
      console.error('Fault report submission failed:', error);
      alert('Arıza bildirimi gönderilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityText = (level: string) => {
    switch (level) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      default: return 'Orta';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-900">Arıza Bildirimi</h2>
              <p className="text-sm text-red-700">{buildingName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-red-400 hover:text-red-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Arıza Bildirimi</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Bu bina arızalı olarak işaretlenecektir. Arıza detaylarını doldurabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Arıza Açıklaması
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Arızanın detaylı açıklamasını yazın (opsiyonel)..."
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length} karakter yazıldı
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Arıza Şiddeti *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <label
                    key={level}
                    className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      severity === level
                        ? getSeverityColor(level) + ' border-current'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={level}
                      checked={severity === level}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className="text-center">
                      <div className="font-medium">{getSeverityText(level)}</div>
                      <div className="text-xs mt-1">
                        {level === 'low' && 'Acil değil'}
                        {level === 'medium' && 'Normal öncelik'}
                        {level === 'high' && 'Acil müdahale'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Bildiren Kişi *
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Arızayı bildiren kişinin adı"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Zaman Damgası</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date().toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reportedBy.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                'Arıza Bildirimini Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaultNotificationModal;