import React from 'react';
import { X, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ReceiptModalProps {
  isOpen: boolean;
  htmlContent: string | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, htmlContent, onClose }) => {
  const { showPrinterSelection } = useApp();

  const handlePrint = () => {
    if (htmlContent) {
      showPrinterSelection(htmlContent);
    }
  };

  if (!isOpen || !htmlContent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Bakım Fişi</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Printer className="h-4 w-4 mr-2" />
              Fişi Yazdır
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <X className="h-4 w-4 mr-2" />
              Kapat
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Bakım Fişi"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;