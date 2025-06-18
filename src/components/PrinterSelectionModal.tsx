import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Check, Wifi } from 'lucide-react';

interface PrinterSelectionModalProps {
  isOpen: boolean;
  content: string | null;
  onClose: () => void;
}

const PrinterSelectionModal: React.FC<PrinterSelectionModalProps> = ({
  isOpen,
  content,
  onClose
}) => {
  const { state } = useApp();
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!selectedPrinter || !content) return;

    const printer = state.printers.find(p => p.id === selectedPrinter);
    if (!printer) return;

    setIsPrinting(true);

    try {
      // Simulate printing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Printing to ${printer.name} (${printer.ipAddress}:${printer.port})`);
      console.log('Content:', content);
      
      // In a real implementation, you would send the content to the printer
      // This could be done through a backend service or printer API
      
      alert(`Belge ${printer.name} yazıcısına gönderildi!`);
      onClose();
    } catch (error) {
      console.error('Printing failed:', error);
      alert('Yazdırma işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsPrinting(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <Printer className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Yazıcı Seç</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPrinting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {state.printers.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Yazdırmak istediğiniz yazıcıyı seçin:
              </p>
              
              {state.printers.map((printer) => (
                <label
                  key={printer.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPrinter === printer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={printer.id}
                    checked={selectedPrinter === printer.id}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    className="sr-only"
                    disabled={isPrinting}
                  />
                  
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0 mr-3">
                      <span className="text-2xl">{getTypeIcon(printer.type)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {printer.name}
                        </h3>
                        {printer.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Wifi className="h-3 w-3 mr-1" />
                        <span>{printer.ipAddress}:{printer.port}</span>
                        <span className="mx-1">•</span>
                        <span>{getTypeText(printer.type)}</span>
                      </div>
                    </div>
                    
                    {selectedPrinter === printer.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Printer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz yazıcı tanımlanmamış.</p>
              <p className="text-sm text-gray-400 mt-1">
                Ayarlar bölümünden yazıcı ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>

        {state.printers.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isPrinting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={handlePrint}
                disabled={!selectedPrinter || isPrinting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isPrinting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Yazdırılıyor...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Yazdır
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterSelectionModal;