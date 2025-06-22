import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Building, Part, User, Update, Income, PartInstallation, MaintenanceHistory, FaultReport, Printer, SMSTemplate, Proposal, Payment, DebtRecord, ProposalTemplate, QRCodeData, ManualPartInstallation, MaintenanceRecord } from '../types';

interface AppContextType {
  state: AppState;
  addBuilding: (building: Omit<Building, 'id'>) => void;
  updateBuilding: (building: Building) => void;
  deleteBuilding: (id: string) => void;
  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  addUpdate: (action: string, details: string) => void;
  setUser: (name: string) => void;
  toggleSidebar: () => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  updateSettings: (settings: any) => void;
  deleteUser: (id: string) => void;
  toggleMaintenance: (buildingId: string, showReceipt?: boolean) => void;
  revertMaintenance: (buildingId: string) => void;
  reportFault: (buildingId: string, faultData: any) => void;
  installPart: (data: any) => void;
  installManualPart: (data: any) => void;
  markPartAsPaid: (partId: string, isManual: boolean) => void;
  increasePrices: (percentage: number) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  addFaultReport: (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => void;
  resolveFaultReport: (reportId: string) => void;
  addPrinter: (printer: any) => void;
  updatePrinter: (printer: any) => void;
  deletePrinter: (id: string) => void;
  addSMSTemplate: (template: any) => void;
  updateSMSTemplate: (template: any) => void;
  deleteSMSTemplate: (id: string) => void;
  sendBulkSMS: (templateId: string, buildingIds: string[]) => void;
  sendWhatsApp: (templateId: string, buildingIds: string[]) => void;
  addProposal: (proposal: any) => void;
  updateProposal: (proposal: any) => void;
  deleteProposal: (id: string) => void;
  addPayment: (payment: any) => void;
  addProposalTemplate: (template: any) => void;
  updateProposalTemplate: (template: any) => void;
  deleteProposalTemplate: (id: string) => void;
  addQRCodeData: (qrData: any) => void;
  updateAutoSaveData: (data: any) => void;
  closeReceiptModal: () => void;
  showReceiptModal: (htmlContent: string) => void;
  getLatestArchivedReceiptHtml: (buildingId: string) => string | null;
  showPrinterSelection: (content: string) => void;
  closePrinterSelection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction = 
  | { type: 'ADD_BUILDING'; payload: Building }
  | { type: 'UPDATE_BUILDING'; payload: Building }
  | { type: 'DELETE_BUILDING'; payload: string }
  | { type: 'ADD_PART'; payload: Part }
  | { type: 'UPDATE_PART'; payload: Part }
  | { type: 'DELETE_PART'; payload: string }
  | { type: 'ADD_UPDATE'; payload: Update }
  | { type: 'SET_USER'; payload: User }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: any }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'TOGGLE_MAINTENANCE'; payload: { buildingId: string; showReceipt?: boolean } }
  | { type: 'REVERT_MAINTENANCE'; payload: string }
  | { type: 'REPORT_FAULT'; payload: { buildingId: string; faultData: any } }
  | { type: 'INSTALL_PART'; payload: any }
  | { type: 'INSTALL_MANUAL_PART'; payload: any }
  | { type: 'MARK_PART_AS_PAID'; payload: { partId: string; isManual: boolean } }
  | { type: 'INCREASE_PRICES'; payload: number }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'ADD_FAULT_REPORT'; payload: FaultReport }
  | { type: 'RESOLVE_FAULT_REPORT'; payload: string }
  | { type: 'ADD_PRINTER'; payload: Printer }
  | { type: 'UPDATE_PRINTER'; payload: Printer }
  | { type: 'DELETE_PRINTER'; payload: string }
  | { type: 'ADD_SMS_TEMPLATE'; payload: SMSTemplate }
  | { type: 'UPDATE_SMS_TEMPLATE'; payload: SMSTemplate }
  | { type: 'DELETE_SMS_TEMPLATE'; payload: string }
  | { type: 'SEND_BULK_SMS'; payload: { templateId: string; buildingIds: string[] } }
  | { type: 'SEND_WHATSAPP'; payload: { templateId: string; buildingIds: string[] } }
  | { type: 'ADD_PROPOSAL'; payload: Proposal }
  | { type: 'UPDATE_PROPOSAL'; payload: Proposal }
  | { type: 'DELETE_PROPOSAL'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'ADD_PROPOSAL_TEMPLATE'; payload: ProposalTemplate }
  | { type: 'UPDATE_PROPOSAL_TEMPLATE'; payload: ProposalTemplate }
  | { type: 'DELETE_PROPOSAL_TEMPLATE'; payload: string }
  | { type: 'ADD_QR_CODE_DATA'; payload: QRCodeData }
  | { type: 'UPDATE_AUTO_SAVE_DATA'; payload: any }
  | { type: 'CLOSE_RECEIPT_MODAL' }
  | { type: 'SHOW_RECEIPT_MODAL'; payload: string }
  | { type: 'SHOW_PRINTER_SELECTION'; payload: string }
  | { type: 'CLOSE_PRINTER_SELECTION' };

const initialState: AppState = {
  buildings: [],
  parts: [],
  partInstallations: [],
  manualPartInstallations: [],
  updates: [],
  incomes: [],
  payments: [],
  currentUser: null,
  users: [],
  notifications: [],
  unreadNotifications: 0,
  sidebarOpen: false,
  settings: {
    appTitle: 'Asansör Bakım Takip',
    logo: null,
    companyName: 'Asansör Bakım Servisi',
    companyPhone: '0555 123 45 67',
    companyAddress: {
      mahalle: '',
      sokak: '',
      il: '',
      ilce: '',
      binaNo: ''
    },
    receiptTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
  <div style="text-align: center; margin-bottom: 20px;">
    {{LOGO}}
    <h1 style="color: #333; font-size: 24px; margin: 5px 0;">{{COMPANY_NAME}}</h1>
    <p style="color: #777; font-size: 12px;">{{COMPANY_ADDRESS}}</p>
    <p style="color: #777; font-size: 12px;">{{COMPANY_PHONE}}</p>
    <div style="margin-top: 10px;">
      {{CE_EMBLEM}}
      {{TSE_EMBLEM}}
    </div>
  </div>

  <h2 style="text-align: center; color: #333; font-size: 20px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">BAKIM FİŞİ</h2>

  <div style="margin-bottom: 15px;">
    <p style="margin: 5px 0;"><strong>Bina Adı:</strong> {{BUILDING_NAME}}</p>
    <p style="margin: 5px 0;"><strong>Bina Adresi:</strong> {{BUILDING_ADDRESS}}</p>
    <p style="margin: 5px 0;"><strong>Asansör Sayısı:</strong> {{ELEVATOR_COUNT}}</p>
  </div>

  <div style="margin-bottom: 15px;">
    <p style="margin: 5px 0;"><strong>Bakım Tarihi:</strong> {{DATE}}</p>
    <p style="margin: 5px 0;"><strong>Bakım Saati:</strong> {{TIMESTAMP}}</p>
    <p style="margin: 5px 0;"><strong>Teknisyen:</strong> {{TECHNICIAN}}</p>
  </div>

  <div style="margin-bottom: 15px;">
    <p style="margin: 5px 0;"><strong>Yapılan İşlem:</strong> {{MAINTENANCE_ACTION}}</p>
    <p style="margin: 5px 0;"><strong>Notlar:</strong> {{NOTES}}</p>
  </div>

  {{PARTS_SECTION}}

  {{DEBT_SECTION}}

  <div style="text-align: right; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
    <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">Toplam Ücret: {{TOTAL_AMOUNT}}</p>
  </div>

  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
    <p>Bu fiş, yapılan bakım hizmetinin belgesidir.</p>
  </div>
</div>`,
    installationProposalTemplate: '',
    maintenanceProposalTemplate: '',
    revisionProposalTemplate: '',
    faultReportTemplate: '',
    autoSaveInterval: 60
  },
  faultReports: [],
  maintenanceReceipts: [],
  maintenanceHistory: [],
  maintenanceRecords: [],
  printers: [],
  smsTemplates: [],
  proposals: [],
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

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_BUILDING':
      return {
        ...state,
        buildings: [...state.buildings, action.payload],
        notifications: [`Yeni bina eklendi: ${action.payload.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'UPDATE_BUILDING':
      return {
        ...state,
        buildings: state.buildings.map(b => b.id === action.payload.id ? action.payload : b),
        notifications: [`Bina güncellendi: ${action.payload.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'DELETE_BUILDING':
      const building = state.buildings.find(b => b.id === action.payload);
      return {
        ...state,
        buildings: state.buildings.filter(b => b.id !== action.payload),
        notifications: [`Bina silindi: ${building?.name || 'Bilinmeyen'}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'ADD_PART':
      return {
        ...state,
        parts: [...state.parts, action.payload],
        notifications: [`Yeni parça eklendi: ${action.payload.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'DELETE_PART':
      const part = state.parts.find(p => p.id === action.payload);
      return {
        ...state,
        parts: state.parts.filter(p => p.id !== action.payload),
        notifications: [`Parça silindi: ${part?.name || 'Bilinmeyen'}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'ADD_UPDATE':
      return {
        ...state,
        updates: [action.payload, ...state.updates]
      };

    case 'SET_USER':
      const existingUser = state.users.find(u => u.name === action.payload.name);
      const user = existingUser || action.payload;
      
      return {
        ...state,
        currentUser: user,
        users: existingUser ? state.users : [...state.users, user],
        notifications: [`Hoşgeldiniz ${user.name}!`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        unreadNotifications: 0
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        notifications: ['Ayarlar güncellendi', ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'TOGGLE_MAINTENANCE':
      const buildingToMaintain = state.buildings.find(b => b.id === action.payload.buildingId);
      if (!buildingToMaintain) return state;

      const updatedBuilding = {
        ...buildingToMaintain,
        isMaintained: !buildingToMaintain.isMaintained,
        isDefective: false,
        lastMaintenanceDate: !buildingToMaintain.isMaintained ? new Date().toISOString().split('T')[0] : buildingToMaintain.lastMaintenanceDate,
        lastMaintenanceTime: !buildingToMaintain.isMaintained ? new Date().toTimeString().slice(0, 5) : buildingToMaintain.lastMaintenanceTime
      };

      const newMaintenanceHistory: MaintenanceHistory = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        maintenanceDate: new Date().toISOString().split('T')[0],
        maintenanceTime: new Date().toTimeString().slice(0, 5),
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceFee: buildingToMaintain.maintenanceFee * buildingToMaintain.elevatorCount
      };

      return {
        ...state,
        buildings: state.buildings.map(b => b.id === action.payload.buildingId ? updatedBuilding : b),
        maintenanceHistory: [...state.maintenanceHistory, newMaintenanceHistory],
        notifications: [`Bakım tamamlandı: ${buildingToMaintain.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1,
        showReceiptModal: action.payload.showReceipt || false,
        receiptModalHtml: action.payload.showReceipt ? 'Bakım fişi HTML içeriği' : state.receiptModalHtml
      };

    case 'REVERT_MAINTENANCE':
      const buildingToRevert = state.buildings.find(b => b.id === action.payload);
      if (!buildingToRevert) return state;

      return {
        ...state,
        buildings: state.buildings.map(b => 
          b.id === action.payload 
            ? { ...b, isMaintained: false, lastMaintenanceDate: undefined, lastMaintenanceTime: undefined }
            : b
        ),
        notifications: [`Bakım geri alındı: ${buildingToRevert.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'REPORT_FAULT':
      const faultBuilding = state.buildings.find(b => b.id === action.payload.buildingId);
      if (!faultBuilding) return state;

      const faultUpdatedBuilding = {
        ...faultBuilding,
        isDefective: true,
        faultSeverity: action.payload.faultData.severity,
        faultTimestamp: new Date().toISOString(),
        faultReportedBy: action.payload.faultData.reportedBy
      };

      return {
        ...state,
        buildings: state.buildings.map(b => b.id === action.payload.buildingId ? faultUpdatedBuilding : b),
        notifications: [`Arıza bildirildi: ${faultBuilding.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'INSTALL_PART':
      const partToInstall = state.parts.find(p => p.id === action.payload.partId);
      if (!partToInstall || partToInstall.quantity < action.payload.quantity) return state;

      const newInstallation: PartInstallation = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        partId: action.payload.partId,
        quantity: action.payload.quantity,
        installDate: action.payload.installDate,
        installedBy: state.currentUser?.name || 'Bilinmeyen',
        isPaid: false
      };

      return {
        ...state,
        partInstallations: [...state.partInstallations, newInstallation],
        parts: state.parts.map(p => 
          p.id === action.payload.partId 
            ? { ...p, quantity: p.quantity - action.payload.quantity }
            : p
        ),
        notifications: [`Parça takıldı: ${partToInstall.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'INSTALL_MANUAL_PART':
      const manualInstallation: ManualPartInstallation = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        partName: action.payload.partName,
        quantity: action.payload.quantity,
        unitPrice: action.payload.unitPrice,
        totalPrice: action.payload.totalPrice,
        installDate: action.payload.installDate,
        installedBy: state.currentUser?.name || 'Bilinmeyen',
        isPaid: false
      };

      return {
        ...state,
        manualPartInstallations: [...state.manualPartInstallations, manualInstallation],
        notifications: [`Manuel parça takıldı: ${action.payload.partName}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'ADD_PAYMENT':
      const paymentBuilding = state.buildings.find(b => b.id === action.payload.buildingId);
      if (!paymentBuilding) return state;

      const newDebt = Math.max(0, paymentBuilding.debt - action.payload.amount);
      const updatedPaymentBuilding = { ...paymentBuilding, debt: newDebt };

      const newPayment: Payment = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        amount: action.payload.amount,
        date: action.payload.date,
        receivedBy: action.payload.receivedBy,
        notes: action.payload.notes
      };

      const newIncome: Income = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        amount: action.payload.amount,
        date: action.payload.date,
        receivedBy: action.payload.receivedBy
      };

      return {
        ...state,
        buildings: state.buildings.map(b => b.id === action.payload.buildingId ? updatedPaymentBuilding : b),
        payments: [newPayment, ...state.payments],
        incomes: [newIncome, ...state.incomes],
        notifications: [`Ödeme alındı: ${paymentBuilding.name} - ${action.payload.amount.toLocaleString('tr-TR')} ₺`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'ADD_PRINTER':
      return {
        ...state,
        printers: [...state.printers, { ...action.payload, id: uuidv4() }],
        notifications: [`Yeni yazıcı eklendi: ${action.payload.name}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'DELETE_PRINTER':
      const printerToDelete = state.printers.find(p => p.id === action.payload);
      return {
        ...state,
        printers: state.printers.filter(p => p.id !== action.payload),
        notifications: [`Yazıcı silindi: ${printerToDelete?.name || 'Bilinmeyen'}`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'INCREASE_PRICES':
      return {
        ...state,
        parts: state.parts.map(part => ({
          ...part,
          price: Math.round(part.price * (1 + action.payload / 100))
        })),
        notifications: [`Fiyatlar %${action.payload} artırıldı`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'ADD_FAULT_REPORT':
      return {
        ...state,
        faultReports: [action.payload, ...state.faultReports],
        notifications: [`Yeni arıza bildirimi alındı`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'RESOLVE_FAULT_REPORT':
      return {
        ...state,
        faultReports: state.faultReports.map(report =>
          report.id === action.payload ? { ...report, status: 'resolved' as const } : report
        ),
        notifications: [`Arıza bildirimi çözüldü`, ...state.notifications.slice(0, 19)],
        unreadNotifications: state.unreadNotifications + 1
      };

    case 'SHOW_RECEIPT_MODAL':
      return {
        ...state,
        showReceiptModal: true,
        receiptModalHtml: action.payload
      };

    case 'CLOSE_RECEIPT_MODAL':
      return {
        ...state,
        showReceiptModal: false,
        receiptModalHtml: null
      };

    case 'SHOW_PRINTER_SELECTION':
      return {
        ...state,
        showPrinterSelectionModal: true,
        printerSelectionContent: action.payload
      };

    case 'CLOSE_PRINTER_SELECTION':
      return {
        ...state,
        showPrinterSelectionModal: false,
        printerSelectionContent: null
      };

    case 'ADD_SMS_TEMPLATE':
      return {
        ...state,
        smsTemplates: [...state.smsTemplates, { ...action.payload, id: uuidv4() }]
      };

    case 'UPDATE_SMS_TEMPLATE':
      return {
        ...state,
        smsTemplates: state.smsTemplates.map(t => t.id === action.payload.id ? action.payload : t)
      };

    case 'DELETE_SMS_TEMPLATE':
      return {
        ...state,
        smsTemplates: state.smsTemplates.filter(t => t.id !== action.payload)
      };

    case 'ADD_PROPOSAL':
      return {
        ...state,
        proposals: [...state.proposals, { 
          ...action.payload, 
          id: uuidv4(),
          createdDate: new Date().toISOString(),
          createdBy: state.currentUser?.name || 'Bilinmeyen'
        }]
      };

    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map(p => p.id === action.payload.id ? action.payload : p)
      };

    case 'DELETE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.filter(p => p.id !== action.payload)
      };

    case 'ADD_PROPOSAL_TEMPLATE':
      return {
        ...state,
        proposalTemplates: [...state.proposalTemplates, { ...action.payload, id: uuidv4() }]
      };

    case 'UPDATE_PROPOSAL_TEMPLATE':
      return {
        ...state,
        proposalTemplates: state.proposalTemplates.map(t => t.id === action.payload.id ? action.payload : t)
      };

    case 'DELETE_PROPOSAL_TEMPLATE':
      return {
        ...state,
        proposalTemplates: state.proposalTemplates.filter(t => t.id !== action.payload)
      };

    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('elevator-maintenance-app');
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Merge saved state with initial state to ensure all new fields exist
        Object.keys(parsedState).forEach(key => {
          if (parsedState[key] !== undefined) {
            if (key === 'currentUser' && parsedState[key]) {
              dispatch({ type: 'SET_USER', payload: parsedState[key] });
            } else if (key === 'settings') {
              dispatch({ type: 'UPDATE_SETTINGS', payload: parsedState[key] });
            }
            // Add more specific handling for other state properties as needed
          }
        });
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('elevator-maintenance-app', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }, [state]);

  const addBuilding = (building: Omit<Building, 'id'>) => {
    const newBuilding: Building = {
      ...building,
      id: uuidv4()
    };
    dispatch({ type: 'ADD_BUILDING', payload: newBuilding });
    addUpdate('Yeni bina eklendi', `${building.name} binası sisteme eklendi`);
  };

  const updateBuilding = (building: Building) => {
    dispatch({ type: 'UPDATE_BUILDING', payload: building });
    addUpdate('Bina güncellendi', `${building.name} binası güncellendi`);
  };

  const deleteBuilding = (id: string) => {
    dispatch({ type: 'DELETE_BUILDING', payload: id });
    addUpdate('Bina silindi', 'Bir bina sistemden silindi');
  };

  const addPart = (part: Omit<Part, 'id'>) => {
    const newPart: Part = {
      ...part,
      id: uuidv4()
    };
    dispatch({ type: 'ADD_PART', payload: newPart });
    addUpdate('Yeni parça eklendi', `${part.name} parçası stoka eklendi`);
  };

  const updatePart = (part: Part) => {
    dispatch({ type: 'UPDATE_PART', payload: part });
  };

  const deletePart = (id: string) => {
    dispatch({ type: 'DELETE_PART', payload: id });
    addUpdate('Parça silindi', 'Bir parça stoktan silindi');
  };

  const addUpdate = (action: string, details: string) => {
    const update: Update = {
      id: uuidv4(),
      action,
      details,
      user: state.currentUser?.name || 'Bilinmeyen',
      timestamp: new Date().toISOString()
    };
    dispatch({ type: 'ADD_UPDATE', payload: update });
  };

  const setUser = (name: string) => {
    const user: User = {
      id: uuidv4(),
      name
    };
    dispatch({ type: 'SET_USER', payload: user });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const addNotification = (message: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: message });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const updateSettings = (settings: any) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const deleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  };

  const toggleMaintenance = (buildingId: string, showReceipt: boolean = false) => {
    dispatch({ type: 'TOGGLE_MAINTENANCE', payload: { buildingId, showReceipt } });
  };

  const revertMaintenance = (buildingId: string) => {
    dispatch({ type: 'REVERT_MAINTENANCE', payload: buildingId });
  };

  const reportFault = (buildingId: string, faultData: any) => {
    dispatch({ type: 'REPORT_FAULT', payload: { buildingId, faultData } });
  };

  const installPart = (data: any) => {
    dispatch({ type: 'INSTALL_PART', payload: data });
  };

  const installManualPart = (data: any) => {
    dispatch({ type: 'INSTALL_MANUAL_PART', payload: data });
  };

  const markPartAsPaid = (partId: string, isManual: boolean) => {
    dispatch({ type: 'MARK_PART_AS_PAID', payload: { partId, isManual } });
  };

  const increasePrices = (percentage: number) => {
    dispatch({ type: 'INCREASE_PRICES', payload: percentage });
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...income,
      id: uuidv4()
    };
    dispatch({ type: 'ADD_INCOME', payload: newIncome });
  };

  const addFaultReport = (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => {
    const faultReport: FaultReport = {
      id: uuidv4(),
      buildingId,
      reporterName,
      reporterSurname,
      reporterPhone,
      apartmentNo,
      description,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    dispatch({ type: 'ADD_FAULT_REPORT', payload: faultReport });
  };

  const resolveFaultReport = (reportId: string) => {
    dispatch({ type: 'RESOLVE_FAULT_REPORT', payload: reportId });
  };

  const addPrinter = (printer: any) => {
    dispatch({ type: 'ADD_PRINTER', payload: printer });
  };

  const updatePrinter = (printer: any) => {
    dispatch({ type: 'UPDATE_PRINTER', payload: printer });
  };

  const deletePrinter = (id: string) => {
    dispatch({ type: 'DELETE_PRINTER', payload: id });
  };

  const addSMSTemplate = (template: any) => {
    dispatch({ type: 'ADD_SMS_TEMPLATE', payload: template });
  };

  const updateSMSTemplate = (template: any) => {
    dispatch({ type: 'UPDATE_SMS_TEMPLATE', payload: template });
  };

  const deleteSMSTemplate = (id: string) => {
    dispatch({ type: 'DELETE_SMS_TEMPLATE', payload: id });
  };

  const sendBulkSMS = (templateId: string, buildingIds: string[]) => {
    dispatch({ type: 'SEND_BULK_SMS', payload: { templateId, buildingIds } });
    addNotification(`${buildingIds.length} binaya SMS gönderildi`);
  };

  const sendWhatsApp = (templateId: string, buildingIds: string[]) => {
    const template = state.smsTemplates.find(t => t.id === templateId);
    if (!template) return;

    buildingIds.forEach(buildingId => {
      const building = state.buildings.find(b => b.id === buildingId);
      if (building && building.contactInfo) {
        const phoneNumber = building.contactInfo.replace(/\D/g, '');
        const message = encodeURIComponent(template.content);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }
    });
    
    dispatch({ type: 'SEND_WHATSAPP', payload: { templateId, buildingIds } });
    addNotification(`${buildingIds.length} bina için WhatsApp pencereleri açıldı`);
  };

  const addProposal = (proposal: any) => {
    dispatch({ type: 'ADD_PROPOSAL', payload: proposal });
  };

  const updateProposal = (proposal: any) => {
    dispatch({ type: 'UPDATE_PROPOSAL', payload: proposal });
  };

  const deleteProposal = (id: string) => {
    dispatch({ type: 'DELETE_PROPOSAL', payload: id });
  };

  const addPayment = (payment: any) => {
    dispatch({ type: 'ADD_PAYMENT', payload: payment });
  };

  const addProposalTemplate = (template: any) => {
    dispatch({ type: 'ADD_PROPOSAL_TEMPLATE', payload: template });
  };

  const updateProposalTemplate = (template: any) => {
    dispatch({ type: 'UPDATE_PROPOSAL_TEMPLATE', payload: template });
  };

  const deleteProposalTemplate = (id: string) => {
    dispatch({ type: 'DELETE_PROPOSAL_TEMPLATE', payload: id });
  };

  const addQRCodeData = (qrData: any) => {
    dispatch({ type: 'ADD_QR_CODE_DATA', payload: qrData });
  };

  const updateAutoSaveData = (data: any) => {
    dispatch({ type: 'UPDATE_AUTO_SAVE_DATA', payload: data });
  };

  const closeReceiptModal = () => {
    dispatch({ type: 'CLOSE_RECEIPT_MODAL' });
  };

  const showReceiptModal = (htmlContent: string) => {
    dispatch({ type: 'SHOW_RECEIPT_MODAL', payload: htmlContent });
  };

  const getLatestArchivedReceiptHtml = (buildingId: string): string | null => {
    // Bu fonksiyon arşivlenmiş fişleri kontrol eder
    const latestReceipt = state.archivedReceipts
      .filter(receipt => receipt.buildingId === buildingId)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
    
    return latestReceipt ? latestReceipt.htmlContent : null;
  };

  const showPrinterSelection = (content: string) => {
    dispatch({ type: 'SHOW_PRINTER_SELECTION', payload: content });
  };

  const closePrinterSelection = () => {
    dispatch({ type: 'CLOSE_PRINTER_SELECTION' });
  };

  return (
    <AppContext.Provider value={{
      state,
      addBuilding,
      updateBuilding,
      deleteBuilding,
      addPart,
      updatePart,
      deletePart,
      addUpdate,
      setUser,
      toggleSidebar,
      addNotification,
      clearNotifications,
      updateSettings,
      deleteUser,
      toggleMaintenance,
      revertMaintenance,
      reportFault,
      installPart,
      installManualPart,
      markPartAsPaid,
      increasePrices,
      addIncome,
      addFaultReport,
      resolveFaultReport,
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
      closeReceiptModal,
      showReceiptModal,
      getLatestArchivedReceiptHtml,
      showPrinterSelection,
      closePrinterSelection
    }}>
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