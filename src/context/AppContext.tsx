import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, User, AppSettings } from '../types';

interface AppContextType {
  state: AppState;
  addBuilding: (building: any) => void;
  updateBuilding: (id: string, building: any) => void;
  deleteBuilding: (id: string) => void;
  addPart: (part: any) => void;
  updatePart: (id: string, part: any) => void;
  deletePart: (id: string) => void;
  addUpdate: (update: any) => void;
  addIncome: (income: any) => void;
  setUser: (name: string) => void;
  deleteUser: (id: string) => void;
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  toggleMaintenance: () => void;
  reportFault: (fault: any) => void;
  updateSettings: (settings: any) => void;
  resetMaintenanceStatus: () => void;
  addFaultReport: (report: any) => void;
  resolveFaultReport: (id: string) => void;
  addMaintenanceHistory: (history: any) => void;
  addMaintenanceRecord: (record: any) => void;
  addPrinter: (printer: any) => void;
  updatePrinter: (id: string, printer: any) => void;
  deletePrinter: (id: string) => void;
  addSMSTemplate: (template: any) => void;
  updateSMSTemplate: (id: string, template: any) => void;
  deleteSMSTemplate: (id: string) => void;
  sendBulkSMS: (data: any) => void;
  sendWhatsApp: (data: any) => void;
  addProposal: (proposal: any) => void;
  updateProposal: (id: string, proposal: any) => void;
  deleteProposal: (id: string) => void;
  addPayment: (payment: any) => void;
  addProposalTemplate: (template: any) => void;
  updateProposalTemplate: (id: string, template: any) => void;
  deleteProposalTemplate: (id: string) => void;
  addQRCodeData: (data: any) => void;
  updateAutoSaveData: (data: any) => void;
  showReceiptModal: () => void;
  closeReceiptModal: () => void;
  archiveReceipt: () => void;
  showPrinterSelection: () => void;
  closePrinterSelection: () => void;
  increasePrices: () => void;
  showArchivedReceipt: () => void;
  removeMaintenanceStatusMark: () => void;
  cancelMaintenance: () => void;
  revertMaintenance: () => void;
  getLatestArchivedReceiptHtml: () => string;
  addSystemNotification: (notification: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultAppSettings: AppSettings = {
  appTitle: 'Asansör Yönetim Sistemi',
  logo: null,
  companyName: '',
  companyPhone: '',
  companyAddress: {
    mahalle: '',
    sokak: '',
    il: '',
    ilce: '',
    binaNo: ''
  },
  receiptTemplate: '',
  installationProposalTemplate: '',
  maintenanceProposalTemplate: '',
  revisionProposalTemplate: '',
  faultReportTemplate: '',
  autoSaveInterval: 30
};

const defaultAppState: AppState = {
  buildings: [],
  parts: [],
  partInstallations: [],
  manualPartInstallations: [],
  updates: [],
  incomes: [],
  currentUser: null,
  users: [],
  notifications: [],
  sidebarOpen: false,
  settings: defaultAppSettings,
  faultReports: [],
  maintenanceReceipts: [],
  maintenanceHistory: [],
  maintenanceRecords: [],
  printers: [],
  unreadNotifications: 0,
  smsTemplates: [],
  proposals: [],
  payments: [],
  debtRecords: [],
  proposalTemplates: [],
  qrCodes: [],
  systemNotifications: [],
  autoSaveData: [],
  hasUnsavedChanges: false,
  isAutoSaving: false,
  showReceiptModal: false,
  receiptModalHtml: null,
  archivedReceipts: [],
  showPrinterSelectionModal: false,
  printerSelectionContent: null
};

function appReducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case 'SET_USER': {
      const userId = uuidv4();
      const newUser: User = {
        id: userId,
        name: action.payload
      };
      
      // Check if user already exists in users array
      const existingUserIndex = state.users.findIndex(user => user.name === action.payload);
      const updatedUsers = existingUserIndex >= 0 
        ? state.users 
        : [...state.users, newUser];
      
      return { 
        ...state, 
        currentUser: newUser,
        users: updatedUsers
      };
    }
    case 'DELETE_USER':
      return { 
        ...state, 
        currentUser: null,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'ADD_NOTIFICATION_LOCAL':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    default:
      return state;
  }
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, defaultAppState);

  const addSystemNotification = (notification: any) => {
    console.log('System notification:', notification);
  };

  const getLatestArchivedReceiptHtmlMemoized = useMemo(() => {
    return () => '';
  }, []);

  const addNotification = (notification: any) => {
    // Check if Firestore is available and user is authenticated
    const isFirestoreReady = false; // This should be determined by your Firebase setup
    
    if (isFirestoreReady && state.currentUser) {
      console.log("Adding notification to Firestore");
      // Add your Firestore logic here
    } else {
      console.warn("Firestore not ready or user not authenticated to add notification. Adding locally.");
      if (typeof addSystemNotification === 'function') {
        addSystemNotification({
          id: uuidv4(),
          message: "Firebase kullanılamıyor. Uygulama offline modda çalışıyor.",
          timestamp: new Date().toISOString(),
          type: 'info',
          severity: 'low',
          actionRequired: false,
          userId: state.currentUser?.id || 'system'
        });
      }
      // Fallback: Firestore yoksa lokal duruma ekle (kalıcı olmaz)
      dispatch({ type: 'ADD_NOTIFICATION_LOCAL', payload: notification });
    }
  };

  const setUser = (name: string) => {
    dispatch({ type: 'SET_USER', payload: name });
  };

  const deleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  };

  // Stub implementations for all the required methods
  const addBuilding = (building: any) => console.log('addBuilding', building);
  const updateBuilding = (id: string, building: any) => console.log('updateBuilding', id, building);
  const deleteBuilding = (id: string) => console.log('deleteBuilding', id);
  const addPart = (part: any) => console.log('addPart', part);
  const updatePart = (id: string, part: any) => console.log('updatePart', id, part);
  const deletePart = (id: string) => console.log('deletePart', id);
  const addUpdate = (update: any) => console.log('addUpdate', update);
  const addIncome = (income: any) => console.log('addIncome', income);
  const clearNotifications = () => console.log('clearNotifications');
  const toggleSidebar = () => console.log('toggleSidebar');
  const toggleMaintenance = () => console.log('toggleMaintenance');
  const reportFault = (fault: any) => console.log('reportFault', fault);
  const updateSettings = (settings: any) => console.log('updateSettings', settings);
  const resetMaintenanceStatus = () => console.log('resetMaintenanceStatus');
  const addFaultReport = (report: any) => console.log('addFaultReport', report);
  const resolveFaultReport = (id: string) => console.log('resolveFaultReport', id);
  const addMaintenanceHistory = (history: any) => console.log('addMaintenanceHistory', history);
  const addMaintenanceRecord = (record: any) => console.log('addMaintenanceRecord', record);
  const addPrinter = (printer: any) => console.log('addPrinter', printer);
  const updatePrinter = (id: string, printer: any) => console.log('updatePrinter', id, printer);
  const deletePrinter = (id: string) => console.log('deletePrinter', id);
  const addSMSTemplate = (template: any) => console.log('addSMSTemplate', template);
  const updateSMSTemplate = (id: string, template: any) => console.log('updateSMSTemplate', id, template);
  const deleteSMSTemplate = (id: string) => console.log('deleteSMSTemplate', id);
  const sendBulkSMS = (data: any) => console.log('sendBulkSMS', data);
  const sendWhatsApp = (data: any) => console.log('sendWhatsApp', data);
  const addProposal = (proposal: any) => console.log('addProposal', proposal);
  const updateProposal = (id: string, proposal: any) => console.log('updateProposal', id, proposal);
  const deleteProposal = (id: string) => console.log('deleteProposal', id);
  const addPayment = (payment: any) => console.log('addPayment', payment);
  const addProposalTemplate = (template: any) => console.log('addProposalTemplate', template);
  const updateProposalTemplate = (id: string, template: any) => console.log('updateProposalTemplate', id, template);
  const deleteProposalTemplate = (id: string) => console.log('deleteProposalTemplate', id);
  const addQRCodeData = (data: any) => console.log('addQRCodeData', data);
  const updateAutoSaveData = (data: any) => console.log('updateAutoSaveData', data);
  const showReceiptModal = () => console.log('showReceiptModal');
  const closeReceiptModal = () => console.log('closeReceiptModal');
  const archiveReceipt = () => console.log('archiveReceipt');
  const showPrinterSelection = () => console.log('showPrinterSelection');
  const closePrinterSelection = () => console.log('closePrinterSelection');
  const increasePrices = () => console.log('increasePrices');
  const showArchivedReceipt = () => console.log('showArchivedReceipt');
  const removeMaintenanceStatusMark = () => console.log('removeMaintenanceStatusMark');
  const cancelMaintenance = () => console.log('cancelMaintenance');
  const revertMaintenance = () => console.log('revertMaintenance');

  return (
    <AppContext.Provider
      value={{
        state,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addPart,
        updatePart,
        deletePart,
        addUpdate,
        addIncome,
        setUser,
        deleteUser,
        addNotification,
        clearNotifications,
        toggleSidebar,
        toggleMaintenance,
        reportFault,
        updateSettings,
        resetMaintenanceStatus,
        addFaultReport,
        resolveFaultReport,
        addMaintenanceHistory,
        addMaintenanceRecord,
        addPrinter,
        updatePrinter,
        deletePrinter,
        addSMSTemplate,
        updateSMSTemplate,
        deleteSMSTemplate,
        sendBulkSMS,
        sendWhatsApp,
        addProposal,
        updateProposal,
        deleteProposal,
        addPayment,
        addProposalTemplate,
        updateProposalTemplate,
        deleteProposalTemplate,
        addQRCodeData,
        updateAutoSaveData,
        showReceiptModal,
        closeReceiptModal,
        archiveReceipt,
        showPrinterSelection,
        closePrinterSelection,
        increasePrices,
        showArchivedReceipt,
        removeMaintenanceStatusMark,
        cancelMaintenance,
        revertMaintenance,
        getLatestArchivedReceiptHtml: getLatestArchivedReceiptHtmlMemoized,
        addSystemNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};