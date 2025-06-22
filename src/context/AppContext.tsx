import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Building, Part, Update, Income, User, PartInstallation, ManualPartInstallation, DebtRecord, AppSettings, FaultReport, MaintenanceReceipt, MaintenanceHistory, MaintenanceRecord, Printer, SMSTemplate, Proposal, Payment, ProposalTemplate, QRCodeData, NotificationData, AutoSaveData, ArchivedReceipt } from '../types';
import { v4 as uuidv4 } from 'uuid';

const initialState: AppState = {
  buildings: [],
  parts: [],
  partInstallations: [],
  manualPartInstallations: [],
  updates: [],
  incomes: [],
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
    autoSaveInterval: 60,
    ceEmblemUrl: '',
    tseEmblemUrl: ''
  },
  lastMaintenanceReset: undefined,
  faultReports: [],
  maintenanceReceipts: [],
  maintenanceHistory: [],
  maintenanceRecords: [],
  printers: [],
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
  lastAutoSave: undefined,
  showReceiptModal: false,
  receiptModalHtml: null,
  archivedReceipts: [],
  showPrinterSelectionModal: false,
  printerSelectionContent: null
};

type Action =
  | { type: 'ADD_BUILDING'; payload: Omit<Building, 'id'> }
  | { type: 'UPDATE_BUILDING'; payload: Building }
  | { type: 'DELETE_BUILDING'; payload: string }
  | { type: 'ADD_PART'; payload: Omit<Part, 'id'> }
  | { type: 'UPDATE_PART'; payload: Part }
  | { type: 'DELETE_PART'; payload: string }
  | { type: 'INSTALL_PART'; payload: Omit<PartInstallation, 'id' | 'installedBy'> }
  | { type: 'INSTALL_MANUAL_PART'; payload: Omit<ManualPartInstallation, 'id' | 'installedBy'> }
  | { type: 'MARK_PART_AS_PAID'; payload: { id: string; isManual: boolean } }
  | { type: 'TOGGLE_MAINTENANCE'; payload: { buildingId: string; showReceipt: boolean } }
  | { type: 'REVERT_MAINTENANCE'; payload: string }
  | { type: 'REPORT_FAULT'; payload: { buildingId: string; faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string } } }
  | { type: 'ADD_UPDATE'; payload: Omit<Update, 'id'> }
  | { type: 'ADD_INCOME'; payload: Omit<Income, 'id'> }
  | { type: 'SET_USER'; payload: string }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_MONTHLY_MAINTENANCE' }
  | { type: 'ADD_FAULT_REPORT'; payload: Omit<FaultReport, 'id'> }
  | { type: 'RESOLVE_FAULT_REPORT'; payload: string }
  | { type: 'ADD_MAINTENANCE_RECEIPT'; payload: Omit<MaintenanceReceipt, 'id'> }
  | { type: 'ADD_MAINTENANCE_HISTORY'; payload: Omit<MaintenanceHistory, 'id'> }
  | { type: 'ADD_MAINTENANCE_RECORD'; payload: Omit<MaintenanceRecord, 'id'> }
  | { type: 'ADD_PRINTER'; payload: Omit<Printer, 'id'> }
  | { type: 'UPDATE_PRINTER'; payload: Printer }
  | { type: 'DELETE_PRINTER'; payload: string }
  | { type: 'ADD_SMS_TEMPLATE'; payload: Omit<SMSTemplate, 'id'> }
  | { type: 'UPDATE_SMS_TEMPLATE'; payload: SMSTemplate }
  | { type: 'DELETE_SMS_TEMPLATE'; payload: string }
  | { type: 'SEND_BULK_SMS'; payload: { templateId: string; buildingIds: string[] } }
  | { type: 'SEND_WHATSAPP'; payload: { templateId: string; buildingIds: string[] } }
  | { type: 'ADD_PROPOSAL'; payload: Omit<Proposal, 'id' | 'createdDate' | 'createdBy'> }
  | { type: 'UPDATE_PROPOSAL'; payload: Proposal }
  | { type: 'DELETE_PROPOSAL'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Omit<Payment, 'id'> }
  | { type: 'ADD_PROPOSAL_TEMPLATE'; payload: Omit<ProposalTemplate, 'id'> }
  | { type: 'UPDATE_PROPOSAL_TEMPLATE'; payload: ProposalTemplate }
  | { type: 'DELETE_PROPOSAL_TEMPLATE'; payload: string }
  | { type: 'ADD_QR_CODE_DATA'; payload: Omit<QRCodeData, 'id'> }
  | { type: 'UPDATE_AUTO_SAVE_DATA'; payload: AutoSaveData }
  | { type: 'SHOW_RECEIPT_MODAL'; payload: string }
  | { type: 'CLOSE_RECEIPT_MODAL' }
  | { type: 'ADD_ARCHIVED_RECEIPT'; payload: Omit<ArchivedReceipt, 'id'> }
  | { type: 'SHOW_PRINTER_SELECTION'; payload: string }
  | { type: 'CLOSE_PRINTER_SELECTION' }
  | { type: 'INCREASE_PRICES'; payload: number };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_BUILDING':
      const newBuilding: Building = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        buildings: [...state.buildings, newBuilding],
        notifications: [`Yeni bina eklendi: ${newBuilding.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'UPDATE_BUILDING':
      return {
        ...state,
        buildings: state.buildings.map(building =>
          building.id === action.payload.id ? action.payload : building
        ),
        notifications: [`Bina güncellendi: ${action.payload.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'DELETE_BUILDING':
      const deletedBuilding = state.buildings.find(b => b.id === action.payload);
      return {
        ...state,
        buildings: state.buildings.filter(building => building.id !== action.payload),
        notifications: [`Bina silindi: ${deletedBuilding?.name || 'Bilinmeyen'}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_PART':
      const newPart: Part = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        parts: [...state.parts, newPart],
        notifications: [`Yeni parça eklendi: ${newPart.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'UPDATE_PART':
      return {
        ...state,
        parts: state.parts.map(part =>
          part.id === action.payload.id ? action.payload : part
        )
      };
      
    case 'DELETE_PART':
      const deletedPart = state.parts.find(p => p.id === action.payload);
      return {
        ...state,
        parts: state.parts.filter(part => part.id !== action.payload),
        notifications: [`Parça silindi: ${deletedPart?.name || 'Bilinmeyen'}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'INSTALL_PART':
      const installation: PartInstallation = {
        ...action.payload,
        id: uuidv4(),
        installedBy: state.currentUser?.name || 'Bilinmeyen',
      };
      
      const updatedParts = state.parts.map(part =>
        part.id === installation.partId
          ? { ...part, quantity: part.quantity - installation.quantity }
          : part
      );
      
      const building = state.buildings.find(b => b.id === installation.buildingId);
      const part = state.parts.find(p => p.id === installation.partId);
      
      return {
        ...state,
        partInstallations: [...state.partInstallations, installation],
        parts: updatedParts,
        notifications: [`Parça takıldı: ${part?.name} - ${building?.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'INSTALL_MANUAL_PART':
      const manualInstallation: ManualPartInstallation = {
        ...action.payload,
        id: uuidv4(),
        installedBy: state.currentUser?.name || 'Bilinmeyen',
      };
      
      const buildingForManual = state.buildings.find(b => b.id === manualInstallation.buildingId);
      
      return {
        ...state,
        manualPartInstallations: [...state.manualPartInstallations, manualInstallation],
        notifications: [`Manuel parça takıldı: ${manualInstallation.partName} - ${buildingForManual?.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'MARK_PART_AS_PAID':
      if (action.payload.isManual) {
        return {
          ...state,
          manualPartInstallations: state.manualPartInstallations.map(installation =>
            installation.id === action.payload.id
              ? { ...installation, isPaid: true, paymentDate: new Date().toISOString() }
              : installation
          ),
          notifications: [`Parça ödemesi tamamlandı`, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1
        };
      } else {
        return {
          ...state,
          partInstallations: state.partInstallations.map(installation =>
            installation.id === action.payload.id
              ? { ...installation, isPaid: true, paymentDate: new Date().toISOString() }
              : installation
          ),
          notifications: [`Parça ödemesi tamamlandı`, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1
        };
      }
      
    case 'TOGGLE_MAINTENANCE':
      const buildingToMaintain = state.buildings.find(b => b.id === action.payload.buildingId);
      if (!buildingToMaintain) return state;
      
      const updatedBuilding: Building = {
        ...buildingToMaintain,
        isMaintained: !buildingToMaintain.isMaintained,
        lastMaintenanceDate: !buildingToMaintain.isMaintained ? new Date().toISOString().split('T')[0] : buildingToMaintain.lastMaintenanceDate,
        lastMaintenanceTime: !buildingToMaintained.isMaintained ? new Date().toTimeString().split(' ')[0] : buildingToMaintain.lastMaintenanceTime,
        isDefective: false
      };
      
      const newMaintenanceRecord: MaintenanceRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceDate: new Date().toISOString().split('T')[0],
        maintenanceTime: new Date().toTimeString().split(' ')[0],
        elevatorCount: buildingToMaintain.elevatorCount,
        totalFee: buildingToMaintain.maintenanceFee * buildingToMaintain.elevatorCount,
        status: 'completed',
        priority: 'medium',
        searchableText: `${buildingToMaintain.name} ${state.currentUser?.name}`
      };
      
      const receiptHtml = generateReceiptHTML(buildingToMaintain, state);
      
      const archivedReceipt: ArchivedReceipt = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        htmlContent: receiptHtml,
        createdDate: new Date().toISOString(),
        createdBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceDate: new Date().toISOString().split('T')[0],
        buildingName: buildingToMaintain.name
      };
      
      return {
        ...state,
        buildings: state.buildings.map(b => b.id === action.payload.buildingId ? updatedBuilding : b),
        maintenanceRecords: [...state.maintenanceRecords, newMaintenanceRecord],
        archivedReceipts: [...state.archivedReceipts, archivedReceipt],
        showReceiptModal: action.payload.showReceipt,
        receiptModalHtml: action.payload.showReceipt ? receiptHtml : state.receiptModalHtml,
        notifications: [`Bakım tamamlandı: ${buildingToMaintain.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
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
        notifications: [`Bakım geri alındı: ${buildingToRevert.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'REPORT_FAULT':
      const faultBuilding = state.buildings.find(b => b.id === action.payload.buildingId);
      if (!faultBuilding) return state;
      
      return {
        ...state,
        buildings: state.buildings.map(b =>
          b.id === action.payload.buildingId
            ? {
                ...b,
                isDefective: true,
                faultSeverity: action.payload.faultData.severity,
                faultTimestamp: new Date().toISOString(),
                faultReportedBy: action.payload.faultData.reportedBy,
                defectiveNote: action.payload.faultData.description
              }
            : b
        ),
        notifications: [`Arıza bildirildi: ${faultBuilding.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_UPDATE':
      const newUpdate: Update = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        updates: [newUpdate, ...state.updates],
      };
      
    case 'ADD_INCOME':
      const newIncome: Income = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        incomes: [...state.incomes, newIncome],
        notifications: [`Yeni ödeme alındı: ${newIncome.amount.toLocaleString('tr-TR')} ₺`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'SET_USER':
      const userId = uuidv4();
      const newUser: User = { id: userId, name: action.payload };
      return {
        ...state,
        currentUser: newUser,
        users: state.users.some(u => u.name === action.payload) 
          ? state.users 
          : [...state.users, newUser],
      };
      
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
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
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
      
    case 'RESET_MONTHLY_MAINTENANCE':
      return {
        ...state,
        buildings: state.buildings.map(building => ({
          ...building,
          isMaintained: false,
        })),
        lastMaintenanceReset: new Date().toISOString(),
        notifications: [`Aylık bakım durumu sıfırlandı`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_FAULT_REPORT':
      const newFaultReport: FaultReport = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        faultReports: [...state.faultReports, newFaultReport],
        notifications: [`Yeni arıza bildirimi alındı`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'RESOLVE_FAULT_REPORT':
      return {
        ...state,
        faultReports: state.faultReports.map(report =>
          report.id === action.payload
            ? { ...report, status: 'resolved' }
            : report
        ),
        notifications: [`Arıza bildirimi çözüldü`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_PRINTER':
      const newPrinter: Printer = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        printers: [...state.printers, newPrinter],
        notifications: [`Yeni yazıcı eklendi: ${newPrinter.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'UPDATE_PRINTER':
      return {
        ...state,
        printers: state.printers.map(printer =>
          printer.id === action.payload.id ? action.payload : printer
        ),
      };
      
    case 'DELETE_PRINTER':
      const deletedPrinter = state.printers.find(p => p.id === action.payload);
      return {
        ...state,
        printers: state.printers.filter(printer => printer.id !== action.payload),
        notifications: [`Yazıcı silindi: ${deletedPrinter?.name || 'Bilinmeyen'}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_SMS_TEMPLATE':
      const newSMSTemplate: SMSTemplate = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        smsTemplates: [...state.smsTemplates, newSMSTemplate],
      };
      
    case 'UPDATE_SMS_TEMPLATE':
      return {
        ...state,
        smsTemplates: state.smsTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
      
    case 'DELETE_SMS_TEMPLATE':
      return {
        ...state,
        smsTemplates: state.smsTemplates.filter(template => template.id !== action.payload),
      };
      
    case 'SEND_BULK_SMS':
      return {
        ...state,
        notifications: [`Toplu SMS gönderildi (${action.payload.buildingIds.length} alıcı)`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'SEND_WHATSAPP':
      const template = state.smsTemplates.find(t => t.id === action.payload.templateId);
      action.payload.buildingIds.forEach(buildingId => {
        const building = state.buildings.find(b => b.id === buildingId);
        if (building && building.contactInfo && template) {
          const message = encodeURIComponent(template.content);
          const whatsappUrl = `https://wa.me/9${building.contactInfo.replace(/\D/g, '')}?text=${message}`;
          window.open(whatsappUrl, '_blank');
        }
      });
      
      return {
        ...state,
        notifications: [`WhatsApp mesajları açıldı (${action.payload.buildingIds.length} alıcı)`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_PROPOSAL':
      const newProposal: Proposal = {
        ...action.payload,
        id: uuidv4(),
        createdDate: new Date().toISOString(),
        createdBy: state.currentUser?.name || 'Bilinmeyen',
      };
      return {
        ...state,
        proposals: [...state.proposals, newProposal],
        notifications: [`Yeni teklif oluşturuldu: ${newProposal.title}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map(proposal =>
          proposal.id === action.payload.id ? action.payload : proposal
        ),
      };
      
    case 'DELETE_PROPOSAL':
      const deletedProposal = state.proposals.find(p => p.id === action.payload);
      return {
        ...state,
        proposals: state.proposals.filter(proposal => proposal.id !== action.payload),
        notifications: [`Teklif silindi: ${deletedProposal?.title || 'Bilinmeyen'}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_PAYMENT':
      const newPayment: Payment = {
        ...action.payload,
        id: uuidv4(),
      };
      
      const paymentBuilding = state.buildings.find(b => b.id === newPayment.buildingId);
      if (!paymentBuilding) return state;
      
      const updatedPaymentBuilding = {
        ...paymentBuilding,
        debt: Math.max(0, paymentBuilding.debt - newPayment.amount)
      };
      
      const newDebtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: newPayment.buildingId,
        date: newPayment.date,
        type: 'payment',
        description: `Ödeme alındı`,
        amount: newPayment.amount,
        previousDebt: paymentBuilding.debt,
        newDebt: updatedPaymentBuilding.debt,
        performedBy: newPayment.receivedBy
      };
      
      return {
        ...state,
        payments: [...state.payments, newPayment],
        buildings: state.buildings.map(b => b.id === newPayment.buildingId ? updatedPaymentBuilding : b),
        debtRecords: [...state.debtRecords, newDebtRecord],
        incomes: [...state.incomes, {
          id: uuidv4(),
          buildingId: newPayment.buildingId,
          amount: newPayment.amount,
          date: newPayment.date,
          receivedBy: newPayment.receivedBy
        }],
        notifications: [`Ödeme alındı: ${newPayment.amount.toLocaleString('tr-TR')} ₺ - ${paymentBuilding.name}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    case 'ADD_PROPOSAL_TEMPLATE':
      const newProposalTemplate: ProposalTemplate = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        proposalTemplates: [...state.proposalTemplates, newProposalTemplate],
      };
      
    case 'UPDATE_PROPOSAL_TEMPLATE':
      return {
        ...state,
        proposalTemplates: state.proposalTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
      
    case 'DELETE_PROPOSAL_TEMPLATE':
      return {
        ...state,
        proposalTemplates: state.proposalTemplates.filter(template => template.id !== action.payload),
      };
      
    case 'ADD_QR_CODE_DATA':
      const newQRCode: QRCodeData = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        qrCodes: [...state.qrCodes, newQRCode],
      };
      
    case 'UPDATE_AUTO_SAVE_DATA':
      return {
        ...state,
        autoSaveData: [
          action.payload,
          ...state.autoSaveData.filter(data => data.formType !== action.payload.formType)
        ],
        lastAutoSave: action.payload.timestamp
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
      
    case 'ADD_ARCHIVED_RECEIPT':
      const newArchivedReceipt: ArchivedReceipt = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        archivedReceipts: [...state.archivedReceipts, newArchivedReceipt]
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
      
    case 'INCREASE_PRICES':
      const multiplier = 1 + (action.payload / 100);
      return {
        ...state,
        parts: state.parts.map(part => ({
          ...part,
          price: Math.round(part.price * multiplier * 100) / 100
        })),
        notifications: [`Tüm parça fiyatları %${action.payload} artırıldı`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1
      };
      
    default:
      return state;
  }
}

// Receipt HTML generation function
function generateReceiptHTML(building: Building, state: AppState): string {
  const template = state.settings.receiptTemplate;
  const now = new Date();
  const buildingAddress = building.address ? 
    `${building.address.mahalle} ${building.address.sokak} ${building.address.binaNo}, ${building.address.ilce}/${building.address.il}` : 
    'Adres belirtilmemiş';
  
  const companyAddress = state.settings.companyAddress ? 
    `${state.settings.companyAddress.mahalle} ${state.settings.companyAddress.sokak} ${state.settings.companyAddress.binaNo}, ${state.settings.companyAddress.ilce}/${state.settings.companyAddress.il}` : 
    'Adres belirtilmemiş';

  return template
    .replace(/{{LOGO}}/g, state.settings.logo ? `<img src="${state.settings.logo}" alt="Logo" style="max-height: 60px; max-width: 150px;">` : '')
    .replace(/{{COMPANY_NAME}}/g, state.settings.companyName)
    .replace(/{{COMPANY_ADDRESS}}/g, companyAddress)
    .replace(/{{COMPANY_PHONE}}/g, state.settings.companyPhone)
    .replace(/{{CE_EMBLEM}}/g, state.settings.ceEmblemUrl ? `<img src="${state.settings.ceEmblemUrl}" alt="CE" style="height: 40px; margin: 0 5px;">` : '')
    .replace(/{{TSE_EMBLEM}}/g, state.settings.tseEmblemUrl ? `<img src="${state.settings.tseEmblemUrl}" alt="TSE" style="height: 40px; margin: 0 5px;">` : '')
    .replace(/{{BUILDING_NAME}}/g, building.name)
    .replace(/{{BUILDING_ADDRESS}}/g, buildingAddress)
    .replace(/{{ELEVATOR_COUNT}}/g, building.elevatorCount.toString())
    .replace(/{{DATE}}/g, now.toLocaleDateString('tr-TR'))
    .replace(/{{TIMESTAMP}}/g, now.toTimeString().split(' ')[0])
    .replace(/{{TECHNICIAN}}/g, state.currentUser?.name || 'Bilinmeyen')
    .replace(/{{MAINTENANCE_ACTION}}/g, 'Rutin bakım yapıldı')
    .replace(/{{NOTES}}/g, building.notes || 'Özel not bulunmamaktadır')
    .replace(/{{PARTS_SECTION}}/g, '')
    .replace(/{{DEBT_SECTION}}/g, building.debt > 0 ? `<div style="margin: 15px 0; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;"><strong>Borç Durumu:</strong> ${building.debt.toLocaleString('tr-TR')} ₺</div>` : '')
    .replace(/{{TOTAL_AMOUNT}}/g, `${(building.maintenanceFee * building.elevatorCount).toLocaleString('tr-TR')} ₺`);
}

const AppContext = createContext<{
  state: AppState;
  addBuilding: (building: Omit<Building, 'id'>) => void;
  updateBuilding: (building: Building) => void;
  deleteBuilding: (id: string) => void;
  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  installPart: (installation: Omit<PartInstallation, 'id' | 'installedBy'>) => void;
  installManualPart: (installation: Omit<ManualPartInstallation, 'id' | 'installedBy'>) => void;
  markPartAsPaid: (id: string, isManual: boolean) => void;
  toggleMaintenance: (buildingId: string, showReceipt: boolean) => void;
  revertMaintenance: (buildingId: string) => void;
  reportFault: (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) => void;
  addUpdate: (update: Omit<Update, 'id'>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  setUser: (name: string) => void;
  deleteUser: (id: string) => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetMonthlyMaintenance: () => void;
  addFaultReport: (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => void;
  resolveFaultReport: (id: string) => void;
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  updatePrinter: (printer: Printer) => void;
  deletePrinter: (id: string) => void;
  addSMSTemplate: (template: Omit<SMSTemplate, 'id'>) => void;
  updateSMSTemplate: (template: SMSTemplate) => void;
  deleteSMSTemplate: (id: string) => void;
  sendBulkSMS: (templateId: string, buildingIds: string[]) => void;
  sendWhatsApp: (templateId: string, buildingIds: string[]) => void;
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdDate' | 'createdBy'>) => void;
  updateProposal: (proposal: Proposal) => void;
  deleteProposal: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  addProposalTemplate: (template: Omit<ProposalTemplate, 'id'>) => void;
  updateProposalTemplate: (template: ProposalTemplate) => void;
  deleteProposalTemplate: (id: string) => void;
  addQRCodeData: (qrData: Omit<QRCodeData, 'id'>) => void;
  updateAutoSaveData: (data: AutoSaveData) => void;
  showReceiptModal: (htmlContent: string) => void;
  closeReceiptModal: () => void;
  getLatestArchivedReceiptHtml: (buildingId: string) => string | null;
  showPrinterSelection: (content: string) => void;
  closePrinterSelection: () => void;
  increasePrices: (percentage: number) => void;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('elevatorMaintenanceData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Merge saved data with initial state
        Object.keys(parsedData).forEach(key => {
          if (key === 'settings') {
            dispatch({ type: 'UPDATE_SETTINGS', payload: parsedData[key] });
          }
          // Add other data loading logic here if needed
        });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      buildings: state.buildings,
      parts: state.parts,
      partInstallations: state.partInstallations,
      manualPartInstallations: state.manualPartInstallations,
      updates: state.updates,
      incomes: state.incomes,
      users: state.users,
      settings: state.settings,
      faultReports: state.faultReports,
      maintenanceRecords: state.maintenanceRecords,
      printers: state.printers,
      smsTemplates: state.smsTemplates,
      proposals: state.proposals,
      payments: state.payments,
      debtRecords: state.debtRecords,
      proposalTemplates: state.proposalTemplates,
      qrCodes: state.qrCodes,
      archivedReceipts: state.archivedReceipts
    };
    localStorage.setItem('elevatorMaintenanceData', JSON.stringify(dataToSave));
  }, [state]);

  const addBuilding = (building: Omit<Building, 'id'>) => {
    dispatch({ type: 'ADD_BUILDING', payload: building });
  };

  const updateBuilding = (building: Building) => {
    dispatch({ type: 'UPDATE_BUILDING', payload: building });
  };

  const deleteBuilding = (id: string) => {
    dispatch({ type: 'DELETE_BUILDING', payload: id });
  };

  const addPart = (part: Omit<Part, 'id'>) => {
    dispatch({ type: 'ADD_PART', payload: part });
  };

  const updatePart = (part: Part) => {
    dispatch({ type: 'UPDATE_PART', payload: part });
  };

  const deletePart = (id: string) => {
    dispatch({ type: 'DELETE_PART', payload: id });
  };

  const installPart = (installation: Omit<PartInstallation, 'id' | 'installedBy'>) => {
    dispatch({ type: 'INSTALL_PART', payload: installation });
  };

  const installManualPart = (installation: Omit<ManualPartInstallation, 'id' | 'installedBy'>) => {
    dispatch({ type: 'INSTALL_MANUAL_PART', payload: installation });
  };

  const markPartAsPaid = (id: string, isManual: boolean) => {
    dispatch({ type: 'MARK_PART_AS_PAID', payload: { id, isManual } });
  };

  const toggleMaintenance = (buildingId: string, showReceipt: boolean = false) => {
    dispatch({ type: 'TOGGLE_MAINTENANCE', payload: { buildingId, showReceipt } });
  };

  const revertMaintenance = (buildingId: string) => {
    dispatch({ type: 'REVERT_MAINTENANCE', payload: buildingId });
  };

  const reportFault = (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) => {
    dispatch({ type: 'REPORT_FAULT', payload: { buildingId, faultData } });
  };

  const addUpdate = (update: Omit<Update, 'id'>) => {
    dispatch({ type: 'ADD_UPDATE', payload: update });
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    dispatch({ type: 'ADD_INCOME', payload: income });
  };

  const setUser = (name: string) => {
    dispatch({ type: 'SET_USER', payload: name });
  };

  const deleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  };

  const addNotification = (message: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: message });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const resetMonthlyMaintenance = () => {
    dispatch({ type: 'RESET_MONTHLY_MAINTENANCE' });
  };

  const addFaultReport = (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => {
    const faultReport: Omit<FaultReport, 'id'> = {
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

  const resolveFaultReport = (id: string) => {
    dispatch({ type: 'RESOLVE_FAULT_REPORT', payload: id });
  };

  const addPrinter = (printer: Omit<Printer, 'id'>) => {
    dispatch({ type: 'ADD_PRINTER', payload: printer });
  };

  const updatePrinter = (printer: Printer) => {
    dispatch({ type: 'UPDATE_PRINTER', payload: printer });
  };

  const deletePrinter = (id: string) => {
    dispatch({ type: 'DELETE_PRINTER', payload: id });
  };

  const addSMSTemplate = (template: Omit<SMSTemplate, 'id'>) => {
    dispatch({ type: 'ADD_SMS_TEMPLATE', payload: template });
  };

  const updateSMSTemplate = (template: SMSTemplate) => {
    dispatch({ type: 'UPDATE_SMS_TEMPLATE', payload: template });
  };

  const deleteSMSTemplate = (id: string) => {
    dispatch({ type: 'DELETE_SMS_TEMPLATE', payload: id });
  };

  const sendBulkSMS = (templateId: string, buildingIds: string[]) => {
    dispatch({ type: 'SEND_BULK_SMS', payload: { templateId, buildingIds } });
  };

  const sendWhatsApp = (templateId: string, buildingIds: string[]) => {
    dispatch({ type: 'SEND_WHATSAPP', payload: { templateId, buildingIds } });
  };

  const addProposal = (proposal: Omit<Proposal, 'id' | 'createdDate' | 'createdBy'>) => {
    dispatch({ type: 'ADD_PROPOSAL', payload: proposal });
  };

  const updateProposal = (proposal: Proposal) => {
    dispatch({ type: 'UPDATE_PROPOSAL', payload: proposal });
  };

  const deleteProposal = (id: string) => {
    dispatch({ type: 'DELETE_PROPOSAL', payload: id });
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    dispatch({ type: 'ADD_PAYMENT', payload: payment });
  };

  const addProposalTemplate = (template: Omit<ProposalTemplate, 'id'>) => {
    dispatch({ type: 'ADD_PROPOSAL_TEMPLATE', payload: template });
  };

  const updateProposalTemplate = (template: ProposalTemplate) => {
    dispatch({ type: 'UPDATE_PROPOSAL_TEMPLATE', payload: template });
  };

  const deleteProposalTemplate = (id: string) => {
    dispatch({ type: 'DELETE_PROPOSAL_TEMPLATE', payload: id });
  };

  const addQRCodeData = (qrData: Omit<QRCodeData, 'id'>) => {
    dispatch({ type: 'ADD_QR_CODE_DATA', payload: qrData });
  };

  const updateAutoSaveData = (data: AutoSaveData) => {
    dispatch({ type: 'UPDATE_AUTO_SAVE_DATA', payload: data });
  };

  const showReceiptModal = (htmlContent: string) => {
    dispatch({ type: 'SHOW_RECEIPT_MODAL', payload: htmlContent });
  };

  const closeReceiptModal = () => {
    dispatch({ type: 'CLOSE_RECEIPT_MODAL' });
  };

  const getLatestArchivedReceiptHtml = (buildingId: string): string | null => {
    const buildingReceipts = state.archivedReceipts
      .filter(receipt => receipt.buildingId === buildingId)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    
    return buildingReceipts.length > 0 ? buildingReceipts[0].htmlContent : null;
  };

  const showPrinterSelection = (content: string) => {
    dispatch({ type: 'SHOW_PRINTER_SELECTION', payload: content });
  };

  const closePrinterSelection = () => {
    dispatch({ type: 'CLOSE_PRINTER_SELECTION' });
  };

  const increasePrices = (percentage: number) => {
    dispatch({ type: 'INCREASE_PRICES', payload: percentage });
  };

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
        installPart,
        installManualPart,
        markPartAsPaid,
        toggleMaintenance,
        revertMaintenance,
        reportFault,
        addUpdate,
        addIncome,
        setUser,
        deleteUser,
        addNotification,
        clearNotifications,
        toggleSidebar,
        updateSettings,
        resetMonthlyMaintenance,
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
        showReceiptModal,
        closeReceiptModal,
        getLatestArchivedReceiptHtml,
        showPrinterSelection,
        closePrinterSelection,
        increasePrices,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};