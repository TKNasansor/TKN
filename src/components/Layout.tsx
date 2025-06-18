import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ReceiptModal from './ReceiptModal';
import PrinterSelectionModal from './PrinterSelectionModal';
import { useApp } from '../context/AppContext';
import UserSelection from './UserSelection';

const Layout: React.FC = () => {
  const { state, toggleSidebar, closeReceiptModal, closePrinterSelection } = useApp();
  
  if (!state.currentUser) {
    return <UserSelection />;
  }
  
  const handleBackdropClick = () => {
    if (state.sidebarOpen) {
      toggleSidebar();
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Backdrop for mobile */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={handleBackdropClick}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={state.showReceiptModal}
        htmlContent={state.receiptModalHtml}
        onClose={closeReceiptModal}
      />

      {/* Printer Selection Modal */}
      <PrinterSelectionModal
        isOpen={state.showPrinterSelectionModal}
        content={state.printerSelectionContent}
        onClose={closePrinterSelection}
      />
    </div>
  );
};

export default Layout;