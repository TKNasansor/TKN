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
  customMessage: string;
  emergencyPhone: string; // Sabit: "112"
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
      const parsed = JSON.parse(savedData);
      return { ...parsed, emergencyPhone: '112' }; // emergencyPhone sabit
    }
    return {
      buildingName,
      buildingId,
      contactInfo: '',
      customMessage: 'Asansör arızası için QR kodu okutun',
      emergencyPhone: '112', // Sabit
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
    setValidationErrors(errors);
    return errors.length === 0;
  }, [qrContent.buildingName, qrContent.customMessage]);

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
        emergencyPhone: '112', // Sabit
        url: `${window.location.origin}/report-fault/${buildingId}`,
        logoUrl: state.settings?.logo,
        companyName: state.settings?.companyName,
        companyPhone: state.settings?.companyPhone,
      };
      onSave(qrData);
      setIsQRCodeSaved(true);
      // localStorage'a kaydet
      localStorage.setItem(`qrCode_${buildingId}`, JSON.stringify({ ...qrContent, emergencyPhone: '112' }));
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
            body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 10px; }
            .qr-container { text-align: center; border: 2px solid #333; padding: 20px; border-radius: 8px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .company-name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
            .building-name { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
            .qr-code { margin: 16px 0; padding: 8px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; }
            .instructions { font-size: 14px; color: #4b5563; margin-top: 16px; max-width: 250px; line-height: 1.4; }
            .contact-info { margin-top: 16px; font-size: 12px; color: #6b7280; }
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
            <div class="contact-info">Acil durumlar için: 112</div>
          </div>
        </body>
      </html>
    `;
    showPrinterSelection(printContent);
    toast.info('Yazdırma ekranı açılıyor...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:w-11/12 flex flex-col items-center">
        {/* ToastContainer bileşeni */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 w-full">
          <div className="flex items-center">
            <QrCode className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">QR Kod Yöneticisi</h2>
              <p className="text-xs text-gray-600">{buildingName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'edit' ? (
          <div className="p-4 flex flex-col items-center w-full">
            <div className="mb-4 w-full">
              <div className="flex items-center space-x-3 mb-3 justify-center">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
                  <span className="font-medium text-blue-600 text-sm">İçerik Düzenle</span>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                  <span className="text-gray-600 text-sm">Önizleme & Yazdır</span>
                </div>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 w-full max-w-xs mx-auto">
                <h4 className="text-xs font-medium text-red-800 mb-1">Düzeltilmesi Gereken Hatalar:</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 w-full max-w-xs mx-auto">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bina Adı *</label>
                <input
                  type="text"
                  value={qrContent.buildingName}
                  onChange={(e) => setQrContent(prev => ({ ...prev, buildingName: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Bina adını girin"
                  aria-label="Bina adı"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Özel Mesaj *</label>
                <textarea
                  rows={2}
                  value={qrContent.customMessage}
                  onChange={(e) => setQrContent(prev => ({ ...prev, customMessage: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="QR kod üzerinde görünecek mesaj"
                  aria-label="Özel mesaj"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">İletişim Bilgisi</label>
                <input
                  type="text"
                  value={qrContent.contactInfo}
                  onChange={(e) => setQrContent(prev => ({ ...prev, contactInfo: e.target.value }))}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ek iletişim bilgisi (opsiyonel)"
                  aria-label="İletişim bilgisi"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-2 mt-4 w-full">
              <button
                onClick={onClose}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                aria-label="İptal"
              >
                İptal
              </button>
              <button
                onClick={generateQRCode}
                disabled={isGenerating}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                aria-label="QR kod oluştur"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <QrCode className="h-3 w-3 mr-1" />
                    QR Kod Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col items-center w-full">
            <div className="mb-4 w-full">
              <div className="flex items-center space-x-3 mb-3 justify-center">
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">✓</div>
                  <span className="text-green-600 font-medium text-sm">İçerik Düzenlendi</span>
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
                  <span className="font-medium text-blue-600 text-sm">Önizleme & Yazdır</span>
                </div>
              </div>
            </div>

            <div className="text-center w-full flex flex-col items-center justify-center flex-grow">
              <h3 className="text-base font-semibold text-gray-900 mb-4">QR Kod Önizlemesi</h3>
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 max-w-xs mx-auto mb-4">
                {state.settings?.companyName && (
                  <div className="text-sm font-bold text-gray-900 mb-1">{state.settings.companyName}</div>
                )}
                <div className="text-xl font-bold text-gray-900 mb-3">{qrContent.buildingName}</div>
                <div ref={printRef} className="mb-3 p-2 bg-white border border-gray-200 rounded-md shadow-sm mx-auto flex items-center justify-center">
                  <QRCodeSVG
                    value={`${window.location.origin}/report-fault/${buildingId}`}
                    size={160}
                    level="H"
                    includeMargin={true}
                    imageSettings={state.settings?.logo ? {
                      src: state.settings.logo,
                      height: 32,
                      width: 32,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                <div className="text-xs text-gray-600 max-w-[200px] mx-auto mb-2 leading-relaxed">
                  {qrContent.customMessage}
                </div>
                {state.settings?.companyPhone && (
                  <div className="text-[10px] text-gray-500 mb-1">
                    İletişim: {state.settings.companyPhone}
                  </div>
                )}
                <div className="text-[10px] text-gray-500">
                  Acil: 112
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-2 mt-4 w-full">
              <button
                onClick={() => setStep('edit')}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                aria-label="Düzenle"
              >
                <Edit className="h-3 w-3 mr-1" />
                Düzenle
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 flex items-center transition-colors duration-200"
                aria-label="Yazdır"
              >
                <Printer className="h-3 w-3 mr-1" />
                Yazdır
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-xs font-medium hover:bg-gray-700 flex items-center transition-colors duration-200"
                aria-label="İptal"
              >
                <X className="h-3 w-3 mr-1" />
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