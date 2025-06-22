import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Building, Part, PartInstallation, ManualPartInstallation, Update, Income, User, DebtRecord, FaultReport, MaintenanceHistory, MaintenanceRecord, Printer, SMSTemplate, Proposal, Payment, ProposalTemplate, QRCodeData, AutoSaveData, ArchivedReceipt, NotificationData as AppNotificationData } from '../types';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, collection, query, onSnapshot, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// Global variables provided by the Canvas environment
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string;

// Initialize Firebase outside the component to avoid re-initialization
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
let app;
let db;
let auth;

// Check if app is already initialized to prevent multiple initializations
if (Object.keys(firebaseConfig).length > 0 && !window.firebaseApp) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  window.firebaseApp = app; // Store in window to prevent re-initialization on hot-reload
} else if (window.firebaseApp) {
  app = window.firebaseApp;
  db = getFirestore(app);
  auth = getAuth(app);
}

const initialState: AppState = {
  buildings: [],
  parts: [],
  partInstallations: [],
  manualPartInstallations: [],
  updates: [],
  incomes: [],
  currentUser: null,
  users: [],
  notifications: [], // This will be populated from Firestore
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
    ceEmblemUrl: '/ce.png',
    tseEmblemUrl: '/ts.jpg',
    receiptTemplate: `
      <div class="receipt-container">
        <div class="header-section">
          <div class="header-left">
            {{LOGO}} <!-- Firma Logosu -->
          </div>
          <div class="header-center">
            <h1 class="company-name-title">{{COMPANY_NAME}}</h1> <!-- Firma Adı -->
          </div>
          <div class="header-right">
            {{TSE_EMBLEM}} <!-- TSE Amblemi -->
            {{CE_EMBLEM}} <!-- CE Amblemi -->
          </div>
        </div>

        <div class="receipt-title-section">
          <h2>BAKIM - ARIZA SERVİS FORMU</h2> <!-- Sabit Metin -->
        </div>

        <div class="contact-and-date-section">
          <div class="contact-info">
            <p>SERVİS NO : {{COMPANY_PHONE}}</p> <!-- Firma Telefonu -->
            <p>{{COMPANY_ADDRESS}}</p> <!-- Firma Adresi -->
          </div>
          <div class="date-info">
            <p style="font-weight: bold; font-size: 16px; color: #333;">TARİH : {{DATE}}</p> <!-- Sadece Tarih, Kalın ve Büyük, Koyu Renk -->
          </div>
        </div>

        <div class="building-details-section">
          <h3>BİNANIN ADI : {{BUILDING_NAME}}</h3> <!-- Bina Adı -->
        </div>

        {{MAINTENANCE_NOTE_SECTION}} <!-- Bakım Notu Bölümü (varsa) -->

        <div class="note-section">
          <p>NOT : Bu bakımdan sonra meydana gelebilecek kapı camı kırılması, tavan aydınlatmasının kırılması durumlarında durumu hemen firmamıza
          bildiriniz. Kırık kapı camı ile asansörü çalıştırmayınız. Aksi taktirde olabilecek durumlardan firmamız sorumlu olmayacaktır.</p>
        </div>

        <div class="maintenance-summary-section">
          <h3>YAPILAN İŞLEMLER</h3> <!-- Sabit Metin -->
          <div class="summary-item">
            <span>Bakım Yapıldı</span>
            <span>{{MAINTENANCE_FEE_CALCULATED}}</span> <!-- Bakım Ücreti -->
          </div>
        </div>

        {{PARTS_SECTION}} <!-- Takılan Parçalar Bölümü (varsa) -->
        
        <!-- Borç Durumu kaldırıldı. Eğer bina borçluysa toplam tutar altında yazacak. -->

        <div class="total-amount-section">
          <span>Toplam Tutar:</span>
          <span class="final-total">{{FINAL_TOTAL_AMOUNT}}</span> <!-- Toplam Tutar -->
          {{BUILDING_CURRENT_DEBT_SECTION}} <!-- Binanın Güncel Borcu (varsa) -->
        </div>

        <div class="footer-warning-section">
          <p>! ! ! Asansör bakımı esnasında değiştirilmesi önerilen parçaların apartman yönetimi tarafından parça
          değişimine onay verilmemesi durumunda doğacak aksaklık ve kazalardan firmamız sorumlu değildir.</p>
        </div>
        
        <div class="signature-section">
          <p>Asansör firma yetkilisi</p> <!-- Sabit Metin -->
          <p>{{TECHNICIAN_NAME}}</p> <!-- Teknisyen Adı -->
        </div>

        <div class="watermark" style="background-image: url('{{LOGO_WATERMARK_URL}}');"></div> <!-- Filigran Logo -->
      </div>

      <style>
        .receipt-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #fff;
          overflow: hidden; /* Filigranın taşmasını önlemek için */
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%; /* Filigranın boyutunu ayarlayın */
          height: 80%; /* Filigranın boyutunu ayarlayın */
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.25; /* Filigranın şeffaflığı artırıldı */
          z-index: 0; /* İçeriğin arkasında kalmasını sağlayın */
          pointer-events: none; /* Üzerine tıklamayı engeller */
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #ccc;
          padding-bottom: 15px;
          position: relative;
          z-index: 1;
        }
        .header-left .logo {
          max-height: 80px;
          max-width: 180px;
          object-fit: contain;
        }
        .header-center {
          text-align: center;
          flex-grow: 1;
        }
        .company-name-title {
          font-size: 28px;
          color: #dc2626;
          margin: 0 0 5px 0;
          font-weight: bold;
        }
        .header-right {
          display: flex;
          gap: 15px;
        }
        .header-right img {
          max-height: 50px;
          object-fit: contain;
        }
        .receipt-title-section {
          text-align: center;
          background-color: #dc2626;
          color: white;
          padding: 10px 0;
          margin-bottom: 25px;
          position: relative;
          z-index: 1;
        }
        .receipt-title-section h2 {
          margin: 0;
          font-size: 22px;
          text-transform: uppercase;
        }
        .contact-and-date-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
          color: #555;
          position: relative;
          z-index: 1;
        }
        .contact-info p, .date-info p {
          margin: 5px 0;
        }
        .building-details-section {
          background-color: #f8f8f8;
          padding: 15px 20px;
          margin-bottom: 20px;
          border-left: 5px solid #dc2626;
          position: relative;
          z-index: 1;
        }
        .building-details-section h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 19px;
        }
        .building-details-section p {
          margin: 0;
          color: #666;
        }
        .note-section {
          background-color: #fffbe6;
          border: 1px solid #ffe58f;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #7a5f00;
          border-radius: 5px;
          position: relative;
          z-index: 1;
        }
        .note-section p {
          margin: 0;
        }
        .maintenance-summary-section {
          margin-bottom: 20px;
          border: 1px solid #eee;
          padding: 15px;
          border-radius: 5px;
          position: relative;
          z-index: 1;
        }
        .maintenance-summary-section h3 {
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #f0f0f0;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dotted #e0e0e0;
        }
        .summary-item:last-child {
          border-bottom: none;
        }
        .summary-item span:first-child {
          font-weight: bold;
          color: #444;
        }
        .total-amount-section {
          display: flex;
          flex-direction: column; 
          justify-content: space-between;
          align-items: flex-end; 
          background-color: #f3f4f6;
          padding: 15px 20px;
          border-top: 2px solid #dc2626;
          margin-top: 30px;
          font-size: 20px;
          font-weight: bold;
          color: #333;
          position: relative;
          z-index: 1;
        }
        .total-amount-section span:first-child {
            width: 100%;
            text-align: right;
            margin-bottom: 5px;
        }
        .final-total {
          color: #dc2626;
          font-size: 24px;
        }
        .building-current-debt {
            width: 100%;
            text-align: right;
            font-size: 16px;
            color: #555;
            margin-top: 10px;
        }
        .footer-warning-section {
          text-align: center;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          font-size: 13px;
          color: #777;
          position: relative;
          z-index: 1;
        }
        .footer-warning-section p {
          margin: 0;
          font-weight: bold;
          color: #dc2626;
        }
        .signature-section {
          text-align: right;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          position: relative;
          z-index: 1;
        }
        .signature-section p {
          margin: 5px 0;
          font-weight: bold;
        }
        @media print {
          .receipt-container {
            box-shadow: none;
            border: none;
            padding: 0;
          }
          .header-section, .receipt-title-section, .contact-and-date-section,
          .building-details-section, .note-section, .maintenance-summary-section,
          .parts-section, .total-amount-section,
          .footer-warning-section, .signature-section {
            box-shadow: none;
            page-break-inside: avoid;
          }
          .watermark {
            opacity: 0.15; 
          }
        }
      </style>
    `,
    installationProposalTemplate: '',
    maintenanceProposalTemplate: '',
    revisionProposalTemplate: '',
    faultReportTemplate: '',
    autoSaveInterval: 60
  },
  lastMaintenanceReset: undefined,
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
  lastAutoSave: undefined,
  showReceiptModal: false,
  receiptModalHtml: null,
  archivedReceipts: [], 
  showPrinterSelectionModal: false,
  printerSelectionContent: null,
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
  | { type: 'MARK_PART_AS_PAID'; payload: { installationId: string; isManual: boolean } }
  | { type: 'ADD_UPDATE'; payload: Omit<Update, 'id' | 'timestamp'> }
  | { type: 'ADD_INCOME'; payload: Omit<Income, 'id'> }
  | { type: 'SET_USER'; payload: string }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_NOTIFICATION_LOCAL'; payload: AppNotificationData } // Local dispatch, not to Firestore directly
  | { type: 'SET_NOTIFICATIONS_FROM_DB'; payload: AppNotificationData[] } // For loading from DB
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_MAINTENANCE'; payload: { buildingId: string; showReceipt: boolean } }
  | { type: 'REPORT_FAULT'; payload: { buildingId: string; faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string } } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'RESET_MAINTENANCE_STATUS' }
  | { type: 'ADD_FAULT_REPORT'; payload: Omit<FaultReport, 'id' | 'timestamp' | 'status'> }
  | { type: 'RESOLVE_FAULT_REPORT'; payload: string }
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
  | { type: 'ARCHIVE_RECEIPT'; payload: Omit<ArchivedReceipt, 'id'> }
  | { type: 'SHOW_PRINTER_SELECTION'; payload: string }
  | { type: 'CLOSE_PRINTER_SELECTION' }
  | { type: 'INCREASE_PRICES'; payload: number }
  | { type: 'SHOW_ARCHIVED_RECEIPT'; payload: string } 
  | { type: 'REMOVE_MAINTENANCE_STATUS_MARK'; payload: string } 
  | { type: 'CANCEL_MAINTENANCE'; payload: string }
  | { type: 'REVERT_MAINTENANCE'; payload: string }; 

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_BUILDING':
      const newBuilding: Building = {
        ...action.payload,
        id: uuidv4(),
        maintenanceNote: '', 
      };
      return {
        ...state,
        buildings: [...state.buildings, newBuilding],
        updates: [
          {
            id: uuidv4(),
            action: 'Bina Eklendi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${newBuilding.name} binası sisteme eklendi.`,
          },
          ...state.updates,
        ],
      };

    case 'UPDATE_BUILDING':
      return {
        ...state,
        buildings: state.buildings.map(building =>
          building.id === action.payload.id ? { ...building, ...action.payload } : building
        ),
        updates: [
          {
            id: uuidv4(),
            action: 'Bina Güncellendi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${action.payload.name} binası güncellendi.`,
          },
          ...state.updates,
        ],
      };

    case 'DELETE_BUILDING':
      const buildingToDelete = state.buildings.find(b => b.id === action.payload);
      return {
        ...state,
        buildings: state.buildings.filter(building => building.id !== action.payload),
        updates: [
          {
            id: uuidv4(),
            action: 'Bina Silindi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${buildingToDelete?.name || 'Bilinmeyen'} binası silindi.`,
          },
          ...state.updates,
        ],
      };

    case 'ADD_PART':
      const newPart: Part = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        parts: [...state.parts, newPart],
        updates: [
          {
            id: uuidv4(),
            action: 'Parça Eklendi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${newPart.name} parçası stoka eklendi.`,
          },
          ...state.updates,
        ],
      };

    case 'UPDATE_PART':
      return {
        ...state,
        parts: state.parts.map(part =>
          part.id === action.payload.id ? action.payload : part
        ),
      };

    case 'DELETE_PART':
      const partToDelete = state.parts.find(p => p.id === action.payload);
      return {
        ...state,
        parts: state.parts.filter(part => part.id !== action.payload),
        updates: [
          {
            id: uuidv4(),
            action: 'Parça Silindi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${partToDelete?.name || 'Bilinmeyen'} parçası stoktan silindi.`,
          },
          ...state.updates,
        ],
      };

    case 'INSTALL_PART':
      const installation: PartInstallation = {
        ...action.payload,
        id: uuidv4(),
        installedBy: state.currentUser?.name || 'Bilinmeyen',
        isPaid: false,
      };

      const part = state.parts.find(p => p.id === action.payload.partId);
      const building = state.buildings.find(b => b.id === action.payload.buildingId);
      
      if (!part || part.quantity < action.payload.quantity) {
        return state;
      }

      const totalPartCost = part.price * action.payload.quantity;

      const updatedParts = state.parts.map(p =>
        p.id === action.payload.partId
          ? { ...p, quantity: p.quantity - action.payload.quantity }
          : p
      );

      const updatedBuildings = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: b.debt + totalPartCost }
          : b
      );

      const debtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.installDate,
        type: 'part',
        description: `${action.payload.quantity} Adet ${part.name} takıldı`,
        amount: totalPartCost,
        previousDebt: building?.debt || 0,
        newDebt: (building?.debt || 0) + totalPartCost,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        relatedRecordId: null, 
      };

      return {
        ...state,
        partInstallations: [...state.partInstallations, installation],
        parts: updatedParts,
        buildings: updatedBuildings,
        debtRecords: [...state.debtRecords, debtRecord],
        updates: [
          {
            id: uuidv4(),
            action: 'Parça Takıldı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${building?.name || 'Bilinmeyen'} binasına ${action.payload.quantity} adet ${part.name} takıldı.`,
          },
          ...state.updates,
        ],
      };

    case 'INSTALL_MANUAL_PART':
      const manualInstallation: ManualPartInstallation = {
        ...action.payload,
        id: uuidv4(),
        installedBy: state.currentUser?.name || 'Bilinmeyen',
        isPaid: false,
      };

      const manualBuilding = state.buildings.find(b => b.id === action.payload.buildingId);

      const updatedBuildingsManual = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: b.debt + action.payload.totalPrice }
          : b
      );

      const manualDebtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.installDate,
        type: 'part',
        description: `${action.payload.quantity} Adet ${action.payload.partName} takıldı`,
        amount: action.payload.totalPrice,
        previousDebt: manualBuilding?.debt || 0,
        newDebt: (manualBuilding?.debt || 0) + action.payload.totalPrice,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        relatedRecordId: null, 
      };

      return {
        ...state,
        manualPartInstallations: [...state.manualPartInstallations, manualInstallation],
        buildings: updatedBuildingsManual,
        debtRecords: [...state.debtRecords, manualDebtRecord],
        updates: [
          {
            id: uuidv4(),
            action: 'Manuel Parça Takıldı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${manualBuilding?.name || 'Bilinmeyen'} binasına ${action.payload.quantity} adet ${action.payload.partName} takıldı.`,
          },
          ...state.updates,
        ],
      };

    case 'MARK_PART_AS_PAID':
      const { installationId, isManual } = action.payload;
      const paymentDate = new Date().toISOString();

      if (isManual) {
        return {
          ...state,
          manualPartInstallations: state.manualPartInstallations.map(installation =>
            installation.id === installationId
              ? { ...installation, isPaid: true, paymentDate }
              : installation
          ),
        };
      } else {
        return {
          ...state,
          partInstallations: state.partInstallations.map(installation =>
            installation.id === installationId
              ? { ...installation, isPaid: true, paymentDate }
              : installation
          ),
        };
      }

    case 'ADD_UPDATE':
      const update: Update = {
        ...action.payload,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        updates: [update, ...state.updates],
      };

    case 'ADD_INCOME':
      const income: Income = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        incomes: [...state.incomes, income],
      };

    case 'SET_USER':
      const existingUser = state.users.find(u => u.name === action.payload);
      let currentUser: User;
      let updatedUsers = state.users;

      if (existingUser) {
        currentUser = existingUser;
      } else {
        currentUser = {
          id: uuidv4(),
          name: action.payload,
        };
        updatedUsers = [...state.users, currentUser];
      }

      return {
        ...state,
        currentUser,
        users: updatedUsers,
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };

    case 'ADD_NOTIFICATION_LOCAL': // Used for local state update after DB sync
      return {
        ...state,
        notifications: [action.payload.message, ...state.notifications], // Assuming message is string
        unreadNotifications: state.unreadNotifications + 1,
      };

    case 'SET_NOTIFICATIONS_FROM_DB': // Used to set notifications from Firestore
        const notificationsFromDb = action.payload.map(n => n.message); // Get just the message strings
        return {
            ...state,
            notifications: notificationsFromDb,
            unreadNotifications: notificationsFromDb.length, // Set unread count based on fetched notifications
        };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadNotifications: 0,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'TOGGLE_MAINTENANCE':
      const { buildingId: tmBuildingId, showReceipt } = action.payload;
      const targetBuilding = state.buildings.find(b => b.id === tmBuildingId);
      
      if (!targetBuilding) return state;

      if (targetBuilding.isMaintained) {
        if (showReceipt) {
            const receiptHtml = generateMaintenanceReceipt(targetBuilding, state, state.currentUser?.name || 'Bilinmeyen');
            return {
                ...state,
                showReceiptModal: true,
                receiptModalHtml: receiptHtml,
            };
        }
        return state; 
      }

      const newMaintenanceStatus = true; 
      const currentDateISO = new Date().toISOString().split('T')[0];
      const currentTimeLocale = new Date().toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      let updatedBuildingsForMaintenance = state.buildings.map(b =>
        b.id === tmBuildingId
          ? {
              ...b,
              isMaintained: newMaintenanceStatus,
              lastMaintenanceDate: newMaintenanceStatus ? currentDateISO : b.lastMaintenanceDate,
              lastMaintenanceTime: newMaintenanceStatus ? currentTimeLocale : b.lastMaintenanceTime,
              isDefective: false, 
              defectiveNote: undefined,
              faultSeverity: undefined,
              faultTimestamp: undefined,
              faultReportedBy: undefined,
            }
          : b
      );

      let newDebtRecords = [...state.debtRecords];
      let newMaintenanceHistory = [...state.maintenanceHistory];
      let newMaintenanceRecords = [...state.maintenanceRecords];

      const newMaintenanceRecordId = uuidv4();
      const maintenanceRecordCurrentVisit: MaintenanceRecord = { 
        id: newMaintenanceRecordId,
        buildingId: tmBuildingId,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceDate: currentDateISO,
        maintenanceTime: currentTimeLocale,
        elevatorCount: targetBuilding.elevatorCount,
        totalFee: targetBuilding.maintenanceFee * targetBuilding.elevatorCount, 
        status: 'completed',
        priority: 'medium',
        searchableText: `${targetBuilding.name} ${state.currentUser?.name || 'Bilinmeyen'} bakım`,
      };
      newMaintenanceRecords = [...newMaintenanceRecords, maintenanceRecordCurrentVisit];

      const currentMonth = new Date().toISOString().substring(0, 7); 
      const maintenanceFeeAlreadyAddedThisMonth = state.debtRecords.some(dr =>
          dr.buildingId === tmBuildingId &&
          dr.type === 'maintenance' &&
          dr.date.substring(0, 7) === currentMonth &&
          dr.relatedRecordId === newMaintenanceRecordId 
      );

      if (!maintenanceFeeAlreadyAddedThisMonth) {
          const maintenanceFee = targetBuilding.maintenanceFee * targetBuilding.elevatorCount;
          
          updatedBuildingsForMaintenance = updatedBuildingsForMaintenance.map(b =>
            b.id === tmBuildingId
                ? { ...b, debt: b.debt + maintenanceFee }
                : b
          );

          const maintenanceDebtRecord: DebtRecord = {
              id: uuidv4(),
              buildingId: tmBuildingId,
              date: currentDateISO,
              type: 'maintenance',
              description: `Bakım ücreti (${targetBuilding.elevatorCount} asansör)`,
              amount: maintenanceFee,
              previousDebt: targetBuilding.debt,
              newDebt: (targetBuilding.debt || 0) + maintenanceFee,
              performedBy: state.currentUser?.name || 'Bilinmeyen',
              relatedRecordId: newMaintenanceRecordId, 
          };
          newDebtRecords = [...newDebtRecords, maintenanceDebtRecord];
      }

      const maintenanceHistoryRecord: MaintenanceHistory = {
        id: uuidv4(),
        buildingId: tmBuildingId,
        maintenanceDate: currentDateISO,
        maintenanceTime: currentTimeLocale,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceFee: targetBuilding.maintenanceFee * targetBuilding.elevatorCount, 
        relatedRecordId: newMaintenanceRecordId, 
      };
      newMaintenanceHistory = [...newMaintenanceHistory, maintenanceHistoryRecord];


      const finalStateAfterMaintenance = {
        ...state,
        buildings: updatedBuildingsForMaintenance,
        debtRecords: newDebtRecords,
        maintenanceHistory: newMaintenanceHistory,
        maintenanceRecords: newMaintenanceRecords,
        updates: [
          {
            id: uuidv4(),
            action: 'Bakım Tamamlandı', 
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${targetBuilding.name} binasının bakımı tamamlandı.`,
          },
          ...state.updates,
        ],
      };

      if (showReceipt) { 
        const receiptHtml = generateMaintenanceReceipt(targetBuilding, finalStateAfterMaintenance, state.currentUser?.name || 'Bilinmeyen');
        
        const archivedReceipt: ArchivedReceipt = {
            id: uuidv4(),
            buildingId: tmBuildingId,
            createdDate: currentDateISO, 
            createdBy: state.currentUser?.name || 'Bilinmeyen', 
            maintenanceDate: currentDateISO, 
            buildingName: targetBuilding.name, 
            htmlContent: receiptHtml,
            relatedRecordId: newMaintenanceRecordId, 
            timestamp: new Date().toISOString(), 
        };
        
        return {
          ...finalStateAfterMaintenance,
          showReceiptModal: true,
          receiptModalHtml: receiptHtml,
          archivedReceipts: [...finalStateAfterMaintenance.archivedReceipts, archivedReceipt],
        };
      }
      return finalStateAfterMaintenance;

    case 'REPORT_FAULT':
      const { buildingId: faultBuildingId, faultData } = action.payload;
      const faultBuilding = state.buildings.find(b => b.id === faultBuildingId);
      
      if (!faultBuilding) return state;

      const updatedBuildingsForFault = state.buildings.map(b =>
        b.id === faultBuildingId
          ? {
              ...b,
              isDefective: true,
              defectiveNote: faultData.description,
              faultSeverity: faultData.severity,
              faultTimestamp: new Date().toISOString(),
              faultReportedBy: faultData.reportedBy,
            }
          : b
      );

      const notificationMessage = `${faultBuilding.name} binasında arıza bildirildi (${faultData.severity === 'high' ? 'Yüksek' : faultData.severity === 'medium' ? 'Orta' : 'Düşük'} öncelik)`;
      
      // Firestore'a bildirim ekleme
      if (db && state.currentUser?.uid) {
        const notificationsCollectionRef = collection(db, `artifacts/${__app_id}/users/${state.currentUser.uid}/notifications`);
        addDoc(notificationsCollectionRef, {
          message: notificationMessage,
          timestamp: new Date().toISOString(),
          type: 'error', // Assuming fault reports are 'error' type
          severity: faultData.severity,
          actionRequired: true,
          relatedId: faultBuildingId,
          userId: state.currentUser.uid,
        }).catch(console.error);
      }

      return {
        ...state,
        buildings: updatedBuildingsForFault,
        updates: [
          {
            id: uuidv4(),
            action: 'Arıza Bildirildi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${faultBuilding.name} binası arızalı olarak işaretlendi. Bildiren: ${faultData.reportedBy}`,
          },
          ...state.updates,
        ],
        // notifications ve unreadNotifications şimdi Firestore listener tarafından güncellenecek.
        // Bu yüzden doğrudan burada güncellemiyoruz.
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'RESET_MAINTENANCE_STATUS':
      const resetBuildings = state.buildings.map(building => ({
        ...building,
        isMaintained: false,
      }));

      return {
        ...state,
        buildings: resetBuildings,
        lastMaintenanceReset: new Date().toISOString(),
        updates: [
          {
            id: uuidv4(),
            action: 'Bakım Durumları Sıfırlandı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: 'Tüm binaların bakım durumları sıfırlandı.',
          },
          ...state.updates,
        ],
      };

    case 'ADD_FAULT_REPORT':
      const faultReport: FaultReport = {
        ...action.payload,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      // Firestore'a bildirim ekleme (örnek: arıza bildirimleri için)
      if (db && state.currentUser?.uid) {
        const notificationsCollectionRef = collection(db, `artifacts/${__app_id}/users/${state.currentUser.uid}/notifications`);
        addDoc(notificationsCollectionRef, {
          message: `Yeni arıza bildirimi: ${action.payload.reporterName} ${action.payload.reporterSurname}`,
          timestamp: new Date().toISOString(),
          type: 'info', // Adjust type as necessary
          severity: 'high', // Assuming fault reports are high priority
          actionRequired: true,
          relatedId: action.payload.buildingId,
          userId: state.currentUser.uid,
        }).catch(console.error);
      }

      return {
        ...state,
        faultReports: [...state.faultReports, faultReport],
        // notifications ve unreadNotifications şimdi Firestore listener tarafından güncellenecek.
      };

    case 'RESOLVE_FAULT_REPORT':
      return {
        ...state,
        faultReports: state.faultReports.map(report =>
          report.id === action.payload
            ? { ...report, status: 'resolved' }
            : report
        ),
      };

    case 'ADD_MAINTENANCE_HISTORY':
      const maintenanceHistory: MaintenanceHistory = {
        ...action.payload,
        id: uuidv4(),
      };

      return {
        ...state,
        maintenanceHistory: [...state.maintenanceHistory, maintenanceHistory],
      };

    case 'ADD_MAINTENANCE_RECORD':
      const newMaintenanceRecord: MaintenanceRecord = { 
        ...action.payload,
        id: uuidv4(),
      };

      return {
        ...state,
        maintenanceRecords: [...state.maintenanceRecords, newMaintenanceRecord],
      };

    case 'ADD_PRINTER':
      const newPrinter: Printer = {
        ...action.payload,
        id: uuidv4(),
      };

      let updatedPrinters = state.printers;
      if (newPrinter.isDefault) {
        updatedPrinters = state.printers.map(p => ({ ...p, isDefault: false }));
      }

      return {
        ...state,
        printers: [...updatedPrinters, newPrinter],
      };

    case 'UPDATE_PRINTER':
      let printersForUpdate = state.printers;
      
      if (action.payload.isDefault) {
        printersForUpdate = state.printers.map(p => 
          p.id === action.payload.id ? p : { ...p, isDefault: false }
        );
      }

      return {
        ...state,
        printers: printersForUpdate.map(printer =>
          printer.id === action.payload.id ? action.payload : printer
        ),
      };

    case 'DELETE_PRINTER':
      return {
        ...state,
        printers: state.printers.filter(printer => printer.id !== action.payload),
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
      console.log('Sending SMS to buildings:', action.payload.buildingIds);
      return state;

    case 'SEND_WHATSAPP':
      const { templateId, buildingIds } = action.payload;
      const template = state.smsTemplates.find(t => t.id === templateId);
      
      if (template) {
        buildingIds.forEach(buildingId => {
          const building = state.buildings.find(b => b.id === buildingId);
          if (building && building.contactInfo) {
            const message = encodeURIComponent(template.content);
            const phoneNumber = building.contactInfo.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(whatsappUrl, '_blank');
          }
        });
      }
      
      return state;

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
      };

    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map(proposal =>
          proposal.id === action.payload.id ? action.payload : proposal
        ),
      };

    case 'DELETE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.filter(proposal => proposal.id !== action.payload),
      };

    case 'ADD_PAYMENT':
      const payment: Payment = {
        ...action.payload,
        id: uuidv4(),
      };

      const updatedBuildingsForPayment = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: Math.max(0, b.debt - action.payload.amount) }
          : b
      );

      const paymentBuilding = state.buildings.find(b => b.id === action.payload.buildingId);

      const paymentDebtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.date,
        type: 'payment',
        description: `Ödeme alındı`,
        amount: action.payload.amount,
        previousDebt: paymentBuilding?.debt || 0,
        newDebt: Math.max(0, (paymentBuilding?.debt || 0) - action.payload.amount),
        performedBy: action.payload.receivedBy,
        relatedRecordId: null, 
      };

      return {
        ...state,
        payments: [...state.payments, payment],
        buildings: updatedBuildingsForPayment,
        debtRecords: [...state.debtRecords, paymentDebtRecord],
        incomes: [...state.incomes, {
          id: uuidv4(),
          buildingId: action.payload.buildingId,
          amount: action.payload.amount,
          date: action.payload.date,
          receivedBy: action.payload.receivedBy,
        }],
        updates: [
          {
            id: uuidv4(),
            action: 'Ödeme Alındı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${paymentBuilding?.name || 'Bilinmeyen'} binasından ${action.payload.amount.toLocaleString('tr-TR')} ₺ ödeme alındı.`,
          },
          ...state.updates,
        ],
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
      const existingAutoSaveIndex = state.autoSaveData.findIndex(
        data => data.formType === action.payload.formType && data.userId === action.payload.userId
      );

      let updatedAutoSaveData;
      if (existingAutoSaveIndex >= 0) {
        updatedAutoSaveData = [...state.autoSaveData];
        updatedAutoSaveData[existingAutoSaveIndex] = action.payload;
      } else {
        updatedAutoSaveData = [...state.autoSaveData, action.payload];
      }

      return {
        ...state,
        autoSaveData: updatedAutoSaveData,
        lastAutoSave: action.payload.timestamp,
      };

    case 'SHOW_RECEIPT_MODAL':
      return {
        ...state,
        showReceiptModal: true,
        receiptModalHtml: action.payload,
      };

    case 'CLOSE_RECEIPT_MODAL':
      return {
        ...state,
        showReceiptModal: false,
        receiptModalHtml: null,
      };

    case 'ARCHIVE_RECEIPT':
      const archivedReceipt: ArchivedReceipt = {
        ...action.payload,
        id: uuidv4(),
      };

      return {
        ...state,
        archivedReceipts: [...state.archivedReceipts, archivedReceipt],
      };

    case 'SHOW_ARCHIVED_RECEIPT':
        const archivedReceiptToShow = state.archivedReceipts.find(ar => ar.id === action.payload);
        if (archivedReceiptToShow) {
            return {
                ...state,
                showReceiptModal: true,
                receiptModalHtml: archivedReceiptToShow.htmlContent,
            };
        }
        console.warn(`Arşivlenmiş fiş bulunamadı: ${action.payload}`);
        return state; 

    case 'REMOVE_MAINTENANCE_STATUS_MARK':
        const buildingToRemoveMark = state.buildings.find(b => b.id === action.payload);
        return {
            ...state,
            buildings: state.buildings.map(b =>
                b.id === action.payload
                    ? { ...b, isMaintained: false }
                    : b
            ),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Bakım İşareti Kaldırıldı',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${buildingToRemoveMark?.name || 'Bilinmeyen'} binasının bakım işareti kaldırıldı.`,
                },
                ...state.updates,
            ],
        };

    case 'CANCEL_MAINTENANCE':
        const buildingToCancelMaintenance = state.buildings.find(b => b.id === action.payload);
        if (!buildingToCancelMaintenance) return state;

        let updatedBuildingsAfterCancel = state.buildings.map(b =>
            b.id === action.payload
                ? { ...b, isMaintained: false, lastMaintenanceDate: undefined, lastMaintenanceTime: undefined }
                : b
        );

        let updatedDebtRecordsAfterCancel = [...state.debtRecords];
        let updatedMaintenanceHistoryAfterCancel = [...state.maintenanceHistory];
        let updatedMaintenanceRecordsAfterCancel = [...state.maintenanceRecords];

        const currentMonthYearForCancel = new Date().toISOString().substring(0, 7);

        const lastMaintenanceDebtRecordIndex = updatedDebtRecordsAfterCancel.findIndex(dr =>
            dr.buildingId === action.payload &&
            dr.type === 'maintenance' &&
            dr.date.substring(0, 7) === currentMonthYearForCancel 
        );

        if (lastMaintenanceDebtRecordIndex !== -1) {
            const canceledMaintenanceDebt = updatedDebtRecordsAfterCancel[lastMaintenanceDebtRecordIndex].amount;
            updatedDebtRecordsAfterCancel.splice(lastMaintenanceDebtRecordIndex, 1); 

            updatedBuildingsAfterCancel = updatedBuildingsAfterCancel.map(b =>
                b.id === action.payload
                    ? { ...b, debt: b.debt - canceledMaintenanceDebt }
                    : b
            );
        }

        const lastMaintenanceHistoryIndex = updatedMaintenanceHistoryAfterCancel.findIndex(mh => 
            mh.buildingId === action.payload && 
            mh.maintenanceDate.substring(0, 7) === currentMonthYearForCancel
        ); 
        if (lastMaintenanceHistoryIndex !== -1) {
            updatedMaintenanceHistoryAfterCancel.splice(lastMaintenanceHistoryIndex, 1);
        }

        const lastMaintenanceRecordIndex = updatedMaintenanceRecordsAfterCancel.findIndex(mr => 
            mr.buildingId === action.payload &&
            mr.maintenanceDate.substring(0, 7) === currentMonthYearForCancel
        ); 
        if (lastMaintenanceRecordIndex !== -1) {
            updatedMaintenanceRecordsAfterCancel.splice(lastMaintenanceRecordIndex, 1);
        }

        return {
            ...state,
            buildings: updatedBuildingsAfterCancel,
            debtRecords: updatedDebtRecordsAfterCancel,
            maintenanceHistory: updatedMaintenanceHistoryAfterCancel,
            maintenanceRecords: updatedMaintenanceRecordsAfterCancel,
            updates: [
                {
                    id: uuidv4(),
                    action: 'Bakım İptal Edildi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${buildingToCancelMaintenance.name} binasının son bakımı iptal edildi.`,
                },
                ...state.updates,
            ],
        };

    case 'REVERT_MAINTENANCE':
        const buildingIdToRevert = action.payload;
        const buildingToRevert = state.buildings.find(b => b.id === buildingIdToRevert);
        if (!buildingToRevert) return state;

        const latestMaintenanceRecord = state.maintenanceRecords
            .filter(mr => mr.buildingId === buildingIdToRevert)
            .sort((a, b) => new Date(b.maintenanceDate + ' ' + b.maintenanceTime).getTime() - new Date(a.maintenanceDate + ' ' + a.maintenanceTime).getTime())
            .shift(); 

        if (!latestMaintenanceRecord) {
            console.warn(`No maintenance record found for building ${buildingIdToRevert} to revert.`);
            return state;
        }

        const newMaintenanceRecordsAfterRevert = state.maintenanceRecords.filter(mr => mr.id !== latestMaintenanceRecord.id);
        const newMaintenanceHistoryAfterRevert = state.maintenanceHistory.filter(mh => mh.relatedRecordId !== latestMaintenanceRecord.id);
        const newDebtRecordsAfterRevert = state.debtRecords.filter(dr => dr.relatedRecordId !== latestMaintenanceRecord.id);
        const newArchivedReceiptsAfterRevert = state.archivedReceipts.filter(ar => ar.relatedRecordId !== latestMaintenanceRecord.id);

        const revertedDebtAmount = latestMaintenanceRecord.totalFee;
        const updatedBuildingsAfterRevert = state.buildings.map(b =>
            b.id === buildingIdToRevert
                ? { ...b, 
                    isMaintained: false, 
                    lastMaintenanceDate: undefined, 
                    lastMaintenanceTime: undefined,
                    debt: b.debt - revertedDebtAmount 
                }
                : b
        );

        return {
            ...state,
            buildings: updatedBuildingsAfterRevert,
            maintenanceRecords: newMaintenanceRecordsAfterRevert,
            maintenanceHistory: newMaintenanceHistoryAfterRevert,
            debtRecords: newDebtRecordsAfterRevert,
            archivedReceipts: newArchivedReceiptsAfterRevert,
            updates: [
                {
                    id: uuidv4(),
                    action: 'Bakım Geri Alındı',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${buildingToRevert.name} binasının son bakımı geri alındı.`,
                },
                ...state.updates,
            ],
        };

    case 'SHOW_PRINTER_SELECTION':
      return {
        ...state,
        showPrinterSelectionModal: true,
        printerSelectionContent: action.payload,
      };

    case 'CLOSE_PRINTER_SELECTION':
      return {
        ...state,
        showPrinterSelectionModal: false,
        printerSelectionContent: null,
      };

    case 'INCREASE_PRICES':
      const percentage = action.payload;
      const updatedPartsWithIncrease = state.parts.map(part => ({
        ...part,
        price: Math.round(part.price * (1 + percentage / 100) * 100) / 100,
      }));

      return {
        ...state,
        parts: updatedPartsWithIncrease,
        updates: [
          {
            id: uuidv4(),
            action: 'Fiyat Artışı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `Tüm parça fiyatları %${percentage} artırıldı.`,
          },
          ...state.updates,
        ],
      };

    default:
      return state;
  }
}

function generateMaintenanceReceipt(building: Building, state: AppState, technician: string): string {
  const currentDateOnly = new Date().toLocaleDateString('tr-TR');
  const maintenanceFeeCalculated = building.maintenanceFee * building.elevatorCount;

  const companyAddressFormatted = state.settings.companyAddress ?
    `${state.settings.companyAddress.mahalle} ${state.settings.companyAddress.sokak} No:${state.settings.companyAddress.binaNo}, ${state.settings.companyAddress.ilce}/${state.settings.companyAddress.il}` :
    'Adres belirtilmemiş';

  const currentReceiptMonthYear = new Date().toISOString().substring(0, 7); 
  const installedPartsForCurrentMonth = [
    ...state.partInstallations.filter(pi => 
      pi.buildingId === building.id && 
      pi.installDate.substring(0, 7) === currentReceiptMonthYear
    ),
    ...state.manualPartInstallations.filter(mpi => 
      mpi.buildingId === building.id && 
      mpi.installDate.substring(0, 7) === currentReceiptMonthYear
    )
  ];

  let partsSectionHtml = '';
  let totalPartsCost = 0;
  if (installedPartsForCurrentMonth.length > 0) { 
    let partsListHtml = '<ul class="parts-list">';
    installedPartsForCurrentMonth.forEach(item => {
      if ('partId' in item) { 
        const part = state.parts.find(p => p.id === item.partId);
        if (part) {
          const cost = part.price * item.quantity;
          totalPartsCost += cost;
          partsListHtml += `<li>${item.quantity} Adet ${part.name} - ${cost.toLocaleString('tr-TR')} ₺</li>`;
        }
      } else { 
        totalPartsCost += item.totalPrice;
        partsListHtml += `<li>${item.quantity} Adet ${item.partName} - ${item.totalPrice.toLocaleString('tr-TR')} ₺</li>`;
      }
    });
    partsListHtml += '</ul>';

    partsSectionHtml = `
      <div class="parts-section">
        <div class="section-title">Takılan Parçalar</div>
        ${partsListHtml}
        <p style="text-align: right; font-weight: bold; margin-top: 10px;">Parça Toplam: ${totalPartsCost.toLocaleString('tr-TR')} ₺</p>
      </div>
    `;
  }

  let maintenanceNoteSectionHtml = '';
  if (building.maintenanceNote && building.maintenanceNote.trim() !== '') { 
    maintenanceNoteSectionHtml = `
      <div class="note-section">
        <h3>BAKIM NOTU</h3>
        <p>${building.maintenanceNote}</p>
      </div>
    `;
  }

  let buildingCurrentDebtSectionHtml = '';
  if (building.debt > 0) {
    buildingCurrentDebtSectionHtml = `
      <p class="building-current-debt">Binanın Güncel Borcu: ${building.debt.toLocaleString('tr-TR')} ₺</p>
    `;
  }

  const finalTotalAmount = maintenanceFeeCalculated + totalPartsCost; 

  let htmlContent = state.settings.receiptTemplate || '';

  htmlContent = htmlContent.replace(/{{LOGO_WATERMARK_URL}}/g, state.settings.logo || '');
  
  htmlContent = htmlContent
    .replace(/{{CE_EMBLEM}}/g, state.settings.ceEmblemUrl ? `<img src="${state.settings.ceEmblemUrl}" alt="CE Amblemi">` : '')
    .replace(/{{TSE_EMBLEM}}/g, state.settings.tseEmblemUrl ? `<img src="${state.settings.tseEmblemUrl}" alt="TSE Amblemi">` : '')
    .replace(/{{LOGO}}/g, state.settings.logo ? `<img src="${state.settings.logo}" alt="Logo" class="logo">` : '');

  htmlContent = htmlContent
    .replace(/{{COMPANY_NAME}}/g, state.settings.companyName)
    .replace(/{{COMPANY_PHONE}}/g, state.settings.companyPhone)
    .replace(/{{COMPANY_ADDRESS}}/g, companyAddressFormatted)
    .replace(/{{BUILDING_NAME}}/g, building.name)
    .replace(/{{DATE}}/g, currentDateOnly) 
    .replace(/{{MAINTENANCE_FEE_CALCULATED}}/g, `${maintenanceFeeCalculated.toLocaleString('tr-TR')} ₺`)
    .replace(/{{TECHNICIAN_NAME}}/g, technician)
    .replace(/{{PARTS_SECTION}}/g, partsSectionHtml)
    .replace(/{{DEBT_SECTION}}/g, '') 
    .replace(/{{MAINTENANCE_NOTE_SECTION}}/g, maintenanceNoteSectionHtml) 
    .replace(/{{FINAL_TOTAL_AMOUNT}}/g, `${finalTotalAmount.toLocaleString('tr-TR')} ₺`)
    .replace(/{{BUILDING_CURRENT_DEBT_SECTION}}/g, buildingCurrentDebtSectionHtml); 

  return htmlContent;
}

function getLatestArchivedReceiptHtml(buildingId: string, state: AppState): string | null {
    const latestReceipt = state.archivedReceipts
        .filter(ar => ar.buildingId === buildingId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .shift(); 

    return latestReceipt ? latestReceipt.htmlContent : null;
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
  markPartAsPaid: (installationId: string, isManual: boolean) => void;
  addUpdate: (update: Omit<Update, 'id' | 'timestamp'>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  setUser: (name: string) => void;
  deleteUser: (id: string) => void;
  addNotification: (notification: AppNotificationData) => void; // Updated to take NotificationData
  clearNotifications: () => void;
  toggleSidebar: () => void;
  toggleMaintenance: (buildingId: string, showReceipt?: boolean) => void;
  reportFault: (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  resetMaintenanceStatus: () => void;
  addFaultReport: (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => void;
  resolveFaultReport: (id: string) => void;
  addMaintenanceHistory: (history: Omit<MaintenanceHistory, 'id'>) => void;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
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
  archiveReceipt: (receipt: Omit<ArchivedReceipt, 'id'>) => void;
  showPrinterSelection: (content: string) => void;
  closePrinterSelection: () => void;
  increasePrices: (percentage: number) => void;
  showArchivedReceipt: (receiptId: string) => void; 
  removeMaintenanceStatusMark: (buildingId: string) => void; 
  cancelMaintenance: (buildingId: string) => void; 
  revertMaintenance: (buildingId: string) => void; 
  getLatestArchivedReceiptHtml: (buildingId: string) => string | null; 
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const authReady = useRef(false); // To track if auth state has been checked

  useEffect(() => {
    if (!app || !db || !auth) {
      console.warn("Firebase is not initialized. Notifications will not be persistent.");
      return;
    }

    // Authenticate user
    const setupAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
        console.log("Firebase Authentication successful.");
      } catch (error) {
        console.error("Firebase Authentication failed:", error);
      }
    };

    setupAuth();

    // Listen for auth state changes and then set up Firestore listeners
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in. Now we can set up Firestore listeners.
        authReady.current = true;
        const userId = user.uid;
        console.log("User authenticated, setting up Firestore listeners for userId:", userId);

        // Set up real-time listener for notifications
        const notificationsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/notifications`);
        const unsubscribeNotifications = onSnapshot(notificationsCollectionRef, (snapshot) => {
          const fetchedNotifications: AppNotificationData[] = [];
          snapshot.forEach(doc => {
            const data = doc.data() as AppNotificationData;
            fetchedNotifications.push({ ...data, id: doc.id }); // Add id from doc
          });
          // Sort by timestamp if desired (latest first)
          fetchedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          dispatch({ type: 'SET_NOTIFICATIONS_FROM_DB', payload: fetchedNotifications });
          console.log("Notifications fetched from DB:", fetchedNotifications);
        }, (error) => {
          console.error("Error listening to notifications:", error);
        });

        // Return unsubscribe function for cleanup
        return () => {
          console.log("Unsubscribing from notifications listener.");
          unsubscribeNotifications();
        };

      } else {
        // User is signed out. Clear notifications.
        authReady.current = true;
        dispatch({ type: 'SET_NOTIFICATIONS_FROM_DB', payload: [] });
        console.log("User signed out.");
      }
    });

    // Cleanup auth listener on component unmount
    return () => {
      unsubscribeAuth();
    };
  }, []); // Empty dependency array means this effect runs once on mount

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

  const markPartAsPaid = (installationId: string, isManual: boolean) => {
    dispatch({ type: 'MARK_PART_AS_PAID', payload: { installationId, isManual } });
  };

  const addUpdate = (update: Omit<Update, 'id' | 'timestamp'>) => {
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

  // Modified addNotification to save to Firestore
  const addNotification = async (notification: AppNotificationData) => {
    if (db && authReady.current && auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        const notificationsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/notifications`);
        await addDoc(notificationsCollectionRef, {
          ...notification,
          timestamp: new Date().toISOString(), // Ensure timestamp is set
          userId: userId, // Ensure userId is set
        });
        console.log("Notification added to Firestore:", notification.message);
      } catch (error) {
        console.error("Error adding notification to Firestore:", error);
      }
    } else {
      console.warn("Firestore not ready or user not authenticated to add notification.");
      // Optionally, dispatch to local state if Firestore is not available, but it won't persist.
      dispatch({ type: 'ADD_NOTIFICATION_LOCAL', payload: notification });
    }
  };

  // Modified clearNotifications to delete from Firestore
  const clearNotifications = async () => {
    if (db && authReady.current && auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        const notificationsCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/notifications`);
        const q = query(notificationsCollectionRef); // Get all documents in the collection
        const snapshot = await getDocs(q); // Fetch the documents

        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
          batch.delete(d.ref); // Add each document to the batch for deletion
        });
        await batch.commit(); // Commit the batch deletion

        console.log("Notifications cleared from Firestore.");
        dispatch({ type: 'CLEAR_NOTIFICATIONS' }); // Clear local state after DB is cleared
      } catch (error) {
        console.error("Error clearing notifications from Firestore:", error);
      }
    } else {
      console.warn("Firestore not ready or user not authenticated to clear notifications.");
      dispatch({ type: 'CLEAR_NOTIFICATIONS' }); // Clear local state without DB sync
    }
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const toggleMaintenance = (buildingId: string, showReceipt: boolean = false) => {
    dispatch({ type: 'TOGGLE_MAINTENANCE', payload: { buildingId, showReceipt } });
  };

  const reportFault = (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) => {
    dispatch({ type: 'REPORT_FAULT', payload: { buildingId, faultData } });
  };

  const updateSettings = (settings: Partial<AppState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const resetMaintenanceStatus = () => {
    dispatch({ type: 'RESET_MAINTENANCE_STATUS' });
  };

  const addFaultReport = (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => {
    dispatch({ 
      type: 'ADD_FAULT_REPORT', 
      payload: { 
        buildingId, 
        reporterName, 
        reporterSurname, 
        reporterPhone, 
        apartmentNo, 
        description 
      } 
    });
  };

  const resolveFaultReport = (id: string) => {
    dispatch({ type: 'RESOLVE_FAULT_REPORT', payload: id });
  };

  const addMaintenanceHistory = (history: Omit<MaintenanceHistory, 'id'>) => {
    dispatch({ type: 'ADD_MAINTENANCE_HISTORY', payload: history });
  };

  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    dispatch({ type: 'ADD_MAINTENANCE_RECORD', payload: record });
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

  const archiveReceipt = (receipt: Omit<ArchivedReceipt, 'id'>) => {
    dispatch({ type: 'ARCHIVE_RECEIPT', payload: receipt });
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

  const showArchivedReceipt = (receiptId: string) => {
    dispatch({ type: 'SHOW_ARCHIVED_RECEIPT', payload: receiptId });
  };

  const removeMaintenanceStatusMark = (buildingId: string) => {
    dispatch({ type: 'REMOVE_MAINTENANCE_STATUS_MARK', payload: buildingId });
  };

  const cancelMaintenance = (buildingId: string) => {
    dispatch({ type: 'CANCEL_MAINTENANCE', payload: buildingId });
  };

  const revertMaintenance = (buildingId: string) => {
    dispatch({ type: 'REVERT_MAINTENANCE', payload: buildingId });
  };

  const getLatestArchivedReceiptHtmlMemoized = (buildingId: string): string | null => {
    return getLatestArchivedReceiptHtml(buildingId, state);
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
}
