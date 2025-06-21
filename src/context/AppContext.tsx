import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Building, Part, PartInstallation, ManualPartInstallation, Update, Income, User, DebtRecord, FaultReport, MaintenanceHistory, MaintenanceRecord, Printer, SMSTemplate, Proposal, Payment, ProposalTemplate, QRCodeData, AutoSaveData, ArchivedReceipt } from '../types';

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
      <div class="receipt">
        <div class="header">
          <div class="logo-section">
            {{LOGO}}
          </div>
          <div class="company-details">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div class="certifications">
              {{CE_EMBLEM}}
              {{TSE_EMBLEM}}
            </div>
          </div>
          <div class="address-info">
            <div class="address-text">{{COMPANY_ADDRESS}}</div>
            <div class="phone-text">Tel: {{COMPANY_PHONE}}</div>
          </div>
        </div>
        
        <div class="receipt-title">
          <h1>BAKIM FİŞİ</h1>
        </div>
        
        <div class="building-info">
          <h2>{{BUILDING_NAME}}</h2>
          <p>{{BUILDING_ADDRESS}}</p>
        </div>
        
        <div class="maintenance-details">
          <div class="detail-row">
            <span class="label">Tarih:</span>
            <span class="value">{{DATE}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Asansör Sayısı:</span>
            <span class="value">{{ELEVATOR_COUNT}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Yapılan İşlem:</span>
            <span class="value">{{MAINTENANCE_ACTION}}</span>
          </div>
          <div class="detail-row">
            <span class="label">Teknisyen:</span>
            <span class="value">{{TECHNICIAN}}</span>
          </div>
        </div>
        
        {{PARTS_SECTION}}
        {{DEBT_SECTION}}
        
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Toplam Tutar:</span>
            <span class="total-value">{{TOTAL_AMOUNT}} ₺</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Bu fiş {{TIMESTAMP}} tarihinde oluşturulmuştur.</p>
          <p>Teşekkür ederiz.</p>
        </div>
      </div>
      
      <style>
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          font-family: Arial, sans-serif;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 2px solid #333;
        }
        .logo-section {
          flex: 1;
        }
        .logo {
          max-height: 60px;
          max-width: 150px;
        }
        .company-details {
          flex: 2;
          text-align: center;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 10px 0;
        }
        .certifications {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 10px;
        }
        .certifications img {
          max-height: 40px;
          object-fit: contain;
        }
        .address-info {
          flex: 1;
          text-align: right;
          font-size: 12px;
          color: #666;
        }
        .address-text {
          margin-bottom: 5px;
          line-height: 1.4;
        }
        .phone-text {
          font-weight: bold;
        }
        .receipt-title {
          text-align: center;
          padding: 20px;
          background: #dc2626;
          color: white;
        }
        .receipt-title h1 {
          margin: 0;
          font-size: 20px;
        }
        .building-info {
          padding: 20px;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }
        .building-info h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 18px;
        }
        .building-info p {
          margin: 0;
          color: #666;
        }
        .maintenance-details {
          padding: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
          border-bottom: 1px dotted #ccc;
        }
        .label {
          font-weight: bold;
          color: #333;
        }
        .value {
          color: #666;
        }
        .parts-section, .debt-section {
          margin: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 5px;
        }
        .section-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .total-section {
          padding: 20px;
          background: #f3f4f6;
          border-top: 2px solid #333;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .total-value {
          font-size: 20px;
          font-weight: bold;
          color: #dc2626;
        }
        .footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e7eb;
        }
        @media print {
          .receipt {
            box-shadow: none;
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
  | { type: 'ADD_NOTIFICATION'; payload: string }
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
          building.id === action.payload.id ? action.payload : building
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

      // Update part quantity
      const updatedParts = state.parts.map(p =>
        p.id === action.payload.partId
          ? { ...p, quantity: p.quantity - action.payload.quantity }
          : p
      );

      // Update building debt
      const updatedBuildings = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: b.debt + totalPartCost }
          : b
      );

      // Add debt record
      const debtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.installDate,
        type: 'part',
        description: `${action.payload.quantity} adet ${part.name} takıldı`,
        amount: totalPartCost,
        previousDebt: building?.debt || 0,
        newDebt: (building?.debt || 0) + totalPartCost,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
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

      // Update building debt
      const updatedBuildingsManual = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: b.debt + action.payload.totalPrice }
          : b
      );

      // Add debt record
      const manualDebtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.installDate,
        type: 'part',
        description: `${action.payload.quantity} adet ${action.payload.partName} takıldı (Manuel)`,
        amount: action.payload.totalPrice,
        previousDebt: manualBuilding?.debt || 0,
        newDebt: (manualBuilding?.debt || 0) + action.payload.totalPrice,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
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

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
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
      const { buildingId, showReceipt } = action.payload;
      const targetBuilding = state.buildings.find(b => b.id === buildingId);
      
      if (!targetBuilding) return state;

      const newMaintenanceStatus = !targetBuilding.isMaintained;
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      let updatedBuildingsForMaintenance = state.buildings.map(b =>
        b.id === buildingId
          ? {
              ...b,
              isMaintained: newMaintenanceStatus,
              lastMaintenanceDate: newMaintenanceStatus ? currentDate : b.lastMaintenanceDate,
              lastMaintenanceTime: newMaintenanceStatus ? currentTime : b.lastMaintenanceTime,
              isDefective: false, // Clear defective status when maintenance is done
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

      if (newMaintenanceStatus) {
        const maintenanceFee = targetBuilding.maintenanceFee * targetBuilding.elevatorCount;
        
        // Update building debt
        updatedBuildingsForMaintenance = updatedBuildingsForMaintenance.map(b =>
          b.id === buildingId
            ? { ...b, debt: b.debt + maintenanceFee }
            : b
        );

        // Add debt record
        const maintenanceDebtRecord: DebtRecord = {
          id: uuidv4(),
          buildingId,
          date: currentDate,
          type: 'maintenance',
          description: `Bakım ücreti (${targetBuilding.elevatorCount} asansör)`,
          amount: maintenanceFee,
          previousDebt: targetBuilding.debt,
          newDebt: targetBuilding.debt + maintenanceFee,
          performedBy: state.currentUser?.name || 'Bilinmeyen',
        };

        newDebtRecords = [...newDebtRecords, maintenanceDebtRecord];

        // Add maintenance history
        const maintenanceHistoryRecord: MaintenanceHistory = {
          id: uuidv4(),
          buildingId,
          maintenanceDate: currentDate,
          maintenanceTime: currentTime,
          performedBy: state.currentUser?.name || 'Bilinmeyen',
          maintenanceFee,
        };

        newMaintenanceHistory = [...newMaintenanceHistory, maintenanceHistoryRecord];

        // Add maintenance record
        const maintenanceRecord: MaintenanceRecord = {
          id: uuidv4(),
          buildingId,
          performedBy: state.currentUser?.name || 'Bilinmeyen',
          maintenanceDate: currentDate,
          maintenanceTime: currentTime,
          elevatorCount: targetBuilding.elevatorCount,
          totalFee: maintenanceFee,
          status: 'completed',
          priority: 'medium',
          searchableText: `${targetBuilding.name} ${state.currentUser?.name || 'Bilinmeyen'} bakım`,
        };

        newMaintenanceRecords = [...newMaintenanceRecords, maintenanceRecord];
      }

      const newState = {
        ...state,
        buildings: updatedBuildingsForMaintenance,
        debtRecords: newDebtRecords,
        maintenanceHistory: newMaintenanceHistory,
        maintenanceRecords: newMaintenanceRecords,
        updates: [
          {
            id: uuidv4(),
            action: newMaintenanceStatus ? 'Bakım Tamamlandı' : 'Bakım İptali',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${targetBuilding.name} binasının bakımı ${newMaintenanceStatus ? 'tamamlandı' : 'iptal edildi'}.`,
          },
          ...state.updates,
        ],
      };

      // Show receipt modal if requested and maintenance was completed
      if (showReceipt && newMaintenanceStatus) {
        const receiptHtml = generateMaintenanceReceipt(targetBuilding, newState.settings, state.currentUser?.name || 'Bilinmeyen');
        return {
          ...newState,
          showReceiptModal: true,
          receiptModalHtml: receiptHtml,
        };
      }

      return newState;

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
        notifications: [
          `${faultBuilding.name} binasında arıza bildirildi (${faultData.severity === 'high' ? 'Yüksek' : faultData.severity === 'medium' ? 'Orta' : 'Düşük'} öncelik)`,
          ...state.notifications,
        ],
        unreadNotifications: state.unreadNotifications + 1,
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

      return {
        ...state,
        faultReports: [...state.faultReports, faultReport],
        notifications: [
          `Yeni arıza bildirimi: ${action.payload.reporterName} ${action.payload.reporterSurname}`,
          ...state.notifications,
        ],
        unreadNotifications: state.unreadNotifications + 1,
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
      const maintenanceRecord: MaintenanceRecord = {
        ...action.payload,
        id: uuidv4(),
      };

      return {
        ...state,
        maintenanceRecords: [...state.maintenanceRecords, maintenanceRecord],
      };

    case 'ADD_PRINTER':
      const newPrinter: Printer = {
        ...action.payload,
        id: uuidv4(),
      };

      // If this is set as default, remove default from others
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
      
      // If this printer is being set as default, remove default from others
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
      // In a real implementation, this would trigger SMS sending
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

      // Update building debt
      const updatedBuildingsForPayment = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: Math.max(0, b.debt - action.payload.amount) }
          : b
      );

      // Find the building for debt record
      const paymentBuilding = state.buildings.find(b => b.id === action.payload.buildingId);

      // Add debt record for payment
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

// Helper function to generate maintenance receipt HTML
function generateMaintenanceReceipt(building: Building, settings: AppState['settings'], technician: string): string {
  const currentDate = new Date().toLocaleDateString('tr-TR');
  const currentTime = new Date().toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const maintenanceFee = building.maintenanceFee * building.elevatorCount;
  
  const buildingAddress = building.address ? 
    `${building.address.mahalle} ${building.address.sokak} ${building.address.binaNo}, ${building.address.ilce}/${building.address.il}` : 
    'Adres belirtilmemiş';

  const companyAddress = settings.companyAddress ? 
    `${settings.companyAddress.mahalle} ${settings.companyAddress.sokak} ${settings.companyAddress.binaNo}, ${settings.companyAddress.ilce}/${settings.companyAddress.il}` : 
    'Adres belirtilmemiş';

  let htmlContent = settings.receiptTemplate || `
    <div class="receipt">
      <div class="header">
        <div class="logo-section">
          {{LOGO}}
        </div>
        <div class="company-details">
          <div class="company-name">{{COMPANY_NAME}}</div>
          <div class="certifications">
            {{CE_EMBLEM}}
            {{TSE_EMBLEM}}
          </div>
        </div>
        <div class="address-info">
          <div class="address-text">{{COMPANY_ADDRESS}}</div>
          <div class="phone-text">Tel: {{COMPANY_PHONE}}</div>
        </div>
      </div>
      
      <div class="receipt-title">
        <h1>BAKIM FİŞİ</h1>
      </div>
      
      <div class="building-info">
        <h2>{{BUILDING_NAME}}</h2>
        <p>{{BUILDING_ADDRESS}}</p>
      </div>
      
      <div class="maintenance-details">
        <div class="detail-row">
          <span class="label">Tarih:</span>
          <span class="value">{{DATE}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Asansör Sayısı:</span>
          <span class="value">{{ELEVATOR_COUNT}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Yapılan İşlem:</span>
          <span class="value">{{MAINTENANCE_ACTION}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Teknisyen:</span>
          <span class="value">{{TECHNICIAN}}</span>
        </div>
      </div>
      
      {{PARTS_SECTION}}
      {{DEBT_SECTION}}
      
      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Toplam Tutar:</span>
          <span class="total-value">{{TOTAL_AMOUNT}} ₺</span>
        </div>
      </div>
      
      <div class="footer">
        <p>Bu fiş {{TIMESTAMP}} tarihinde oluşturulmuştur.</p>
        <p>Teşekkür ederiz.</p>
      </div>
    </div>
  `;

  // Process emblem placeholders first
  if (settings.ceEmblemUrl) {
    htmlContent = htmlContent.replace(
      /{{CE_EMBLEM}}/g,
      `<img src="${settings.ceEmblemUrl}" alt="CE Amblemi" style="max-height: 40px; object-fit: contain; display: inline-block; vertical-align: middle;">`
    );
  } else {
    htmlContent = htmlContent.replace(/{{CE_EMBLEM}}/g, '');
  }

  if (settings.tseEmblemUrl) {
    htmlContent = htmlContent.replace(
      /{{TSE_EMBLEM}}/g,
      `<img src="${settings.tseEmblemUrl}" alt="TSE Amblemi" style="max-height: 40px; object-fit: contain; display: inline-block; vertical-align: middle;">`
    );
  } else {
    htmlContent = htmlContent.replace(/{{TSE_EMBLEM}}/g, '');
  }

  // Process other placeholders
  htmlContent = htmlContent
    .replace(/{{LOGO}}/g, settings.logo ? `<img src="${settings.logo}" alt="Logo" class="logo">` : '')
    .replace(/{{COMPANY_NAME}}/g, settings.companyName)
    .replace(/{{COMPANY_ADDRESS}}/g, companyAddress)
    .replace(/{{COMPANY_PHONE}}/g, settings.companyPhone)
    .replace(/{{BUILDING_NAME}}/g, building.name)
    .replace(/{{BUILDING_ADDRESS}}/g, buildingAddress)
    .replace(/{{DATE}}/g, `${currentDate} ${currentTime}`)
    .replace(/{{ELEVATOR_COUNT}}/g, building.elevatorCount.toString())
    .replace(/{{MAINTENANCE_ACTION}}/g, 'Rutin Bakım')
    .replace(/{{TECHNICIAN}}/g, technician)
    .replace(/{{MAINTENANCE_FEE}}/g, `${maintenanceFee.toLocaleString('tr-TR')} ₺`)
    .replace(/{{PARTS_SECTION}}/g, '')
    .replace(/{{DEBT_SECTION}}/g, `
      <div class="debt-section">
        <div class="section-title">Borç Durumu</div>
        <p>Yeni borç: ${(building.debt + maintenanceFee).toLocaleString('tr-TR')} ₺</p>
      </div>
    `)
    .replace(/{{TOTAL_AMOUNT}}/g, maintenanceFee.toLocaleString('tr-TR'))
    .replace(/{{TIMESTAMP}}/g, new Date().toLocaleString('tr-TR'));

  return htmlContent;
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
  addNotification: (notification: string) => void;
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
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

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

  const addNotification = (notification: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
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
    // Process emblem placeholders before showing modal
    let processedHtml = htmlContent;

    // CE Emblem replacement
    if (state.settings.ceEmblemUrl) {
      processedHtml = processedHtml.replace(
        /{{CE_EMBLEM}}/g,
        `<img src="${state.settings.ceEmblemUrl}" alt="CE Amblemi" style="max-height: 40px; object-fit: contain; display: inline-block; vertical-align: middle;">`
      );
    } else {
      processedHtml = processedHtml.replace(/{{CE_EMBLEM}}/g, '');
    }

    // TSE Emblem replacement
    if (state.settings.tseEmblemUrl) {
      processedHtml = processedHtml.replace(
        /{{TSE_EMBLEM}}/g,
        `<img src="${state.settings.tseEmblemUrl}" alt="TSE Amblemi" style="max-height: 40px; object-fit: contain; display: inline-block; vertical-align: middle;">`
      );
    } else {
      processedHtml = processedHtml.replace(/{{TSE_EMBLEM}}/g, '');
    }

    // Logo replacement
    if (state.settings.logo) {
      processedHtml = processedHtml.replace(
        /{{LOGO}}/g,
        `<img src="${state.settings.logo}" alt="Company Logo" class="logo" style="max-height: 60px; max-width: 150px;">`
      );
    } else {
      processedHtml = processedHtml.replace(/{{LOGO}}/g, '');
    }

    // Company name replacement
    if (state.settings.companyName) {
      processedHtml = processedHtml.replace(/{{COMPANY_NAME}}/g, state.settings.companyName);
    }

    dispatch({ type: 'SHOW_RECEIPT_MODAL', payload: processedHtml });
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