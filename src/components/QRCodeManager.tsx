import React, { useState, useRef, useCallback, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Edit, Printer, X, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// qrContent için TypeScript arayüzü
interface QRContent {
  buildingName: string;
  buildingId: string;
  contactInfo: string;
  emergencyPhone: string;
  customMessage: string;
}

interface QRCodeManagerProps {
  isOpen: boolean;
  buildingId: string;
  buildingName: string;
  onClose: () => void;
  onSave: (qrData: QRContent & { url: string; logoUrl?: string; companyName?: string; companyPhone?: string }) => void;
}

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  isOpen,
  buildingId,
  buildingName,
  onClose,
  onSave,
}) => {
  const { state, showPrinterSelection } = useApp();
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [isQRCodeSaved, setIsQRCodeSaved] = useState(false);
  const [qrContent, setQrContent] = useState<QRContent>(() => {
    // localStorage'dan veriyi yükle
    const savedData = localStorage.getItem(`qrCode_${buildingId}`);
    if (savedData) {
      setIsQRCodeSaved(true);
      return JSON.parse(savedData);
    }
    return {
      buildingName,
      buildingId,
      contactInfo: '',
      emergencyPhone: '112',
      customMessage: 'Asansör arızası için QR kodu okutun',
    };
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Bileşen açıldığında doğru adımı göster
  useEffect(() => {
    if (isOpen) {
      setStep(isQRCodeSaved ? 'preview' : 'edit');
    }
  }, [isOpen, isQRCodeSaved]);

  const validateQRContent = useCallback(() => {
    const errors: string[] = [];
    if (!qrContent.buildingName.trim()) errors.push('Bina adı zorunludur');
    if (!qrContent.customMessage.trim()) errors.push('Özel mesaj zorunludur');
    if (qrContent.emergencyPhone && !/^\d{7,}$/.test(qrContent.emergencyPhone)) {
      errors.push('Acil durum telefonu en az 7 rakam olmalı');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  }, [qrContent.buildingName, qrContent.customMessage, qrContent.emergencyPhone]);

  const generateQRCode = async () => {
    if (!validateQRContent()) {
      toast.error('Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.');
      return;
    }
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const qrData = {
        ...qrContent,
        url: `${window.location.origin}/report-fault/${buildingId}`,
        logoUrl: state.settings?.logo,
        companyName: state.settings?.companyName,
        companyPhone: state.settings?.companyPhone,
      };
      onSave(qrData);
      setIsQRCodeSaved(true);
      // localStorage'a kaydet
      localStorage.setItem(`qrCode_${buildingId}`, JSON.stringify(qrContent));
      setStep('preview');
      toast.success('QR kod başarıyla oluşturuldu!');
    } catch (error) {
      console.error('QR Code generation failed:', error);
      toast.error('QR kod oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Kod - ${qrContent.buildingName}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .qr-container { text-align: center; border: 2px solid #333; padding: 30px; border-radius: 10px; background: white; }
            .company-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .building-name { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }
            .qr-code { margin: 20px 0; }
            .instructions { font-size: 16px; color: #666; margin-top: 20px; max-width: 300px; line-height: 1.5; }
            .contact-info { margin-top: 20px; font-size: 14px; color: #888; }
            @media print { .actions { display: none; } }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${state.settings?.companyName ? `<div class="company-name">${state.settings.companyName}</div>` : ''}
            <div class="building-name">${qrContent.buildingName}</div>
            <div class="qr-code">${printRef.current.innerHTML}</div>
            <div class="instructions">${qrContent.customMessage}</div>
            ${state.settings?.companyPhone ? `<div class="contact-info">İletişim: ${state.settings.companyPhone}</div>` : ''}
            <div class="contact-info">Acil durumlar için: ${qrContent.emergencyPhone}</div>
          </div>
        </body>
      </html>
    `;
    showPrinterSelection(printContent);
    toast.info('Yazdırma ekranı açılıyor...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ToastContainer bileşeni */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <QrCode className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">QR Kod Yöneticisi</h2>
              <p className="text-sm text-gray-600">{buildingName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Kapat">
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 'edit' ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <span className="font-medium text-blue-600">İçerik Düzenle</span>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <span className="text-gray-600">Önizleme & Yazdır</span>
                </div>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-red-800 mb-2">Düzeltilmesi Gereken Hatalar:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bina Adı *</label>
                <input
                  type="text"
                  value={qrContent.buildingName}
                  onChange={(e) => setQrContent(prev => ({ ...prev, buildingName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bina adını girin"
                  aria-label="Bina adı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Özel Mesaj *</label>
                <textarea
                  rows={3}
                  value={qrContent.customMessage}
                  onChange={(e) => setQrContent(prev => ({ ...prev, customMessage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="QR kod üzerinde görünecek mesaj"
                  aria-label="Özel mesaj"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Acil Durum Telefonu</label>
                  <input
                    type="tel"
                    value={qrContent.emergencyPhone}
                    onChange={(e) => setQrContent(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="112"
                    aria-label="Acil durum telefonu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İletişim Bilgisi</label>
                <input
                  type="text"
                  value={qrContent.contactInfo}
                  onChange={(e) => setQrContent(prev => ({ ...prev, contactInfo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ek iletişim bilgisi (opsiyonel)"
                  aria-label="İletişim bilgisi"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                aria-label="İptal"
              >
                İptal
              </button>
              <button
                onClick={generateQRCode}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                aria-label="QR kod oluştur"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Kod Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                  <span className="text-green-600 font-medium">İçerik Düzenlendi</span>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <span className="font-medium text-blue-600">Önizleme & Yazdır</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">QR Kod Önizlemesi</h3>
              <div className="inline-block p-6 border-2 border-gray-300 rounded-lg bg-white">
                {state.settings?.companyName && (
                  <div className="text-lg font-bold text-gray-900 mb-2">{state.settings.companyName}</div>
                )}
                <div className="text-xl font-bold text-gray-900 mb-4">{qrContent.buildingName}</div>
                <div ref={printRef} className="mb-4 relative">
                  <QRCodeSVG
                    value={`${window.location.origin}/report-fault/${buildingId}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={state.settings?.logo ? {
                      src: state.settings.logo,
                      height: 40,
                      width: 40,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                <div className="text-sm text-gray-600 max-w-xs mx-auto">
                  {qrContent.customMessage}
                </div>
                {state.settings?.companyPhone && (
                  <div className="text-xs text-gray-500 mt-2">
                    İletişim: {state.settings.companyPhone}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Acil: {qrContent.emergencyPhone}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-3 mt-8">
              <button
                onClick={() => setStep('edit')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                aria-label="Düzenle"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                aria-label="Yazdır"
              >
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 flex items-center"
                aria-label="İptal"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeManager;