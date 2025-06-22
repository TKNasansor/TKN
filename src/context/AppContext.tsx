import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Building, Part, PartInstallation, ManualPartInstallation, Update, Income, User, DebtRecord, FaultReport, MaintenanceHistory, MaintenanceRecord, Printer, SMSTemplate, Proposal, Payment, ProposalTemplate, QRCodeData, AutoSaveData, ArchivedReceipt } from '../types';

// Bu kısım dışarıdan geldiği varsayılan bir helper fonksiyonudur.
// Normalde bu dosya içinde tanımlı olmaz veya başka bir util dosyasından import edilir.
// Eğer yoksa, bu reducer içinde basit bir versiyonu oluşturulabilir.
// Örnek:
const generateMaintenanceReceipt = (building: Building, state: AppState, technicianName: string): string => {
    let receiptHtml = state.settings.receiptTemplate;

    // Dinamik bilgileri doldur
    receiptHtml = receiptHtml.replace(/{{COMPANY_NAME}}/g, state.settings.companyName || '');
    receiptHtml = receiptHtml.replace(/{{COMPANY_PHONE}}/g, state.settings.companyPhone || '');
    receiptHtml = receiptHtml.replace(/{{COMPANY_ADDRESS}}/g, 
        `${state.settings.companyAddress.mahalle} ${state.settings.companyAddress.sokak}, ` +
        `${state.settings.companyAddress.binaNo}, ${state.settings.companyAddress.ilce}/` +
        `${state.settings.companyAddress.il}` || '');
    receiptHtml = receiptHtml.replace(/{{DATE}}/g, new Date().toLocaleDateString('tr-TR'));
    receiptHtml = receiptHtml.replace(/{{BUILDING_NAME}}/g, building.name || '');
    receiptHtml = receiptHtml.replace(/{{TECHNICIAN_NAME}}/g, technicianName || 'Bilinmeyen');

    // Logo ve Amblemler
    receiptHtml = receiptHtml.replace(/{{LOGO}}/g, state.settings.logo ? `<img src="${state.settings.logo}" alt="Company Logo" class="logo" />` : '');
    receiptHtml = receiptHtml.replace(/{{TSE_EMBLEM}}/g, state.settings.tseEmblemUrl ? `<img src="${state.settings.tseEmblemUrl}" alt="TSE Emblem" />` : '');
    receiptHtml = receiptHtml.replace(/{{CE_EMBLEM}}/g, state.settings.ceEmblemUrl ? `<img src="${state.settings.ceEmblemUrl}" alt="CE Emblem" />` : '');
    receiptHtml = receiptHtml.replace(/{{LOGO_WATERMARK_URL}}/g, state.settings.logo || ''); // Filigran için logo URL'si

    // Bakım Notu Bölümü (opsiyonel)
    const maintenanceNoteSection = building.maintenanceNote ? `
        <div class="maintenance-note-section">
            <h3>BAKIM NOTU</h3>
            <p>${building.maintenanceNote}</p>
        </div>
    ` : '';
    receiptHtml = receiptHtml.replace(/{{MAINTENANCE_NOTE_SECTION}}/g, maintenanceNoteSection);

    // Bakım Ücreti Hesaplama
    const maintenanceFeeCalculated = (building.maintenanceFee * building.elevatorCount).toFixed(2);
    receiptHtml = receiptHtml.replace(/{{MAINTENANCE_FEE_CALCULATED}}/g, `${maintenanceFeeCalculated} TL`);

    // Takılan Parçalar Bölümü (varsa)
    const installedParts = state.partInstallations.filter(pi => pi.buildingId === building.id && pi.installDate === new Date().toISOString().split('T')[0]);
    const manualInstalledParts = state.manualPartInstallations.filter(mpi => mpi.buildingId === building.id && mpi.installDate === new Date().toISOString().split('T')[0]);

    let partsSectionHtml = '';
    if (installedParts.length > 0 || manualInstalledParts.length > 0) {
        partsSectionHtml = `
            <div class="parts-section maintenance-summary-section">
                <h3>DEĞİŞTİRİLEN PARÇALAR</h3>
                ${installedParts.map(pi => {
                    const part = state.parts.find(p => p.id === pi.partId);
                    return part ? `<div class="summary-item"><span>${pi.quantity} Adet ${part.name}</span><span>${(part.price * pi.quantity).toFixed(2)} TL</span></div>` : '';
                }).join('')}
                ${manualInstalledParts.map(mpi => `
                    <div class="summary-item"><span>${mpi.quantity} Adet ${mpi.partName}</span><span>${mpi.totalPrice.toFixed(2)} TL</span></div>
                `).join('')}
            </div>
        `;
    }
    receiptHtml = receiptHtml.replace(/{{PARTS_SECTION}}/g, partsSectionHtml);

    // Toplam Tutar Hesaplama
    const totalMaintenanceFee = building.maintenanceFee * building.elevatorCount;
    const totalPartsCost = installedParts.reduce((sum, pi) => {
        const part = state.parts.find(p => p.id === pi.partId);
        return sum + (part ? part.price * pi.quantity : 0);
    }, 0);
    const totalManualPartsCost = manualInstalledParts.reduce((sum, mpi) => sum + mpi.totalPrice, 0);

    const finalTotalAmount = (totalMaintenanceFee + totalPartsCost + totalManualPartsCost).toFixed(2);
    receiptHtml = receiptHtml.replace(/{{FINAL_TOTAL_AMOUNT}}/g, `${finalTotalAmount} TL`);

    // Binanın Güncel Borcu
    const buildingCurrentDebtSection = building.debt > 0 ? `
        <span class="building-current-debt">Binanın Güncel Borcu: ${building.debt.toFixed(2)} TL</span>
    ` : '';
    receiptHtml = receiptHtml.replace(/{{BUILDING_CURRENT_DEBT_SECTION}}/g, buildingCurrentDebtSection);


    return receiptHtml;
};


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
          flex-direction: column; /* İçerik alt alta gelsin diye */
          justify-content: space-between;
          align-items: flex-end; /* Sağ tarafa hizala */
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
            opacity: 0.15; /* Yazdırma için daha belirgin olabilir */
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
  archivedReceipts: [], // Arşivlenmiş makbuzlar burada saklanacak
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
  | { type: 'TOGGLE_MAINTENANCE'; payload: { buildingId: string; showReceipt: boolean } } // showReceipt artık bu aksiyonun parçası
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
  | { type: 'SHOW_ARCHIVED_RECEIPT'; payload: string } // Yeni aksiyon: Arşivlenmiş fişi göster
  | { type: 'CANCEL_MAINTENANCE'; payload: string }; // Yeni aksiyon: Bakımı iptal et

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_BUILDING':
      const newBuilding: Building = {
        ...action.payload,
        id: uuidv4(),
        maintenanceNote: '', // Yeni eklenen alan: bakım notu
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
          building.id === action.payload.id ? { ...building, ...action.payload } : building // Ensure maintenanceNote can be updated
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

      // Parça miktarını güncelle
      const updatedParts = state.parts.map(p =>
        p.id === action.payload.partId
          ? { ...p, quantity: p.quantity - action.payload.quantity }
          : p
      );

      // Bina borcunu güncelle
      const updatedBuildings = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: b.debt + totalPartCost }
          : b
      );

      // Borç kaydı ekle
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

      // Bina borcunu güncelle
      const updatedBuildingsManual = state.buildings.map(b =>
        b.id === action.payload.buildingId
          ? { ...b, debt: b.debt + action.payload.totalPrice }
          : b
      );

      // Borç kaydı ekle
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

      // Bina zaten bakım yapıldıysa
      if (targetBuilding.isMaintained) {
        // Kullanıcı fişi görüntülemek istiyorsa
        if (showReceipt) {
          const currentMonth = new Date().toISOString().substring(0, 7);
          // Mevcut ay içinde yapılmış son bakıma ait makbuzu bul
          const latestReceipt = state.archivedReceipts.filter(ar =>
            ar.buildingId === buildingId && ar.timestamp.substring(0, 7) === currentMonth
          ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          if (latestReceipt) {
            return {
              ...state,
              showReceiptModal: true,
              receiptModalHtml: latestReceipt.htmlContent,
            };
          }
          // Eğer bu ay için makbuz bulunamazsa, durumu değiştirmeden çık
          return state;
        }
        // Eğer bina zaten bakımlıysa ve fiş gösterilmek istenmiyorsa (UI seçenekleri gösterecek)
        return state; 
      }

      // Bina henüz bakım yapılmadıysa, bakım işlemini tamamla
      const newMaintenanceStatus = true; // Her zaman true olarak ayarla
      const currentDateISO = new Date().toISOString().split('T')[0];
      const currentTimeLocale = new Date().toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      let updatedBuildingsForMaintenance = state.buildings.map(b =>
        b.id === buildingId
          ? {
              ...b,
              isMaintained: newMaintenanceStatus,
              lastMaintenanceDate: newMaintenanceStatus ? currentDateISO : b.lastMaintenanceDate,
              lastMaintenanceTime: newMaintenanceStatus ? currentTimeLocale : b.lastMaintenanceTime,
              isDefective: false, // Bakım yapıldığında arıza durumunu temizle
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

      // Bakım ücretinin bu ay içinde zaten eklenip eklenmediğini kontrol et (sadece 1 defa yazılsın)
      const currentMonth = new Date().toISOString().substring(0, 7); //YYYY-MM formatı
      const maintenanceFeeAlreadyAddedThisMonth = state.debtRecords.some(dr =>
          dr.buildingId === buildingId &&
          dr.type === 'maintenance' &&
          dr.date.substring(0, 7) === currentMonth
      );

      if (!maintenanceFeeAlreadyAddedThisMonth) {
          const maintenanceFee = targetBuilding.maintenanceFee * targetBuilding.elevatorCount;
          
          // Bina borcunu güncelle (Sadece bu ay için ilk kez ekle)
          updatedBuildingsForMaintenance = updatedBuildingsForMaintenance.map(b =>
            b.id === buildingId
                ? { ...b, debt: b.debt + maintenanceFee }
                : b
          );

          // Borç kaydı ekle (Sadece bu ay için ilk kez ekle)
          const maintenanceDebtRecord: DebtRecord = {
              id: uuidv4(),
              buildingId,
              date: currentDateISO,
              type: 'maintenance',
              description: `Bakım ücreti (${targetBuilding.elevatorCount} asansör)`,
              amount: maintenanceFee,
              previousDebt: targetBuilding.debt,
              newDebt: (targetBuilding.debt || 0) + maintenanceFee,
              performedBy: state.currentUser?.name || 'Bilinmeyen',
          };
          newDebtRecords = [...newDebtRecords, maintenanceDebtRecord];
      }

      // Bakım geçmişine ve kayıtlarına her ziyaret için ekle, ücret eklenmese bile
      const maintenanceHistoryRecord: MaintenanceHistory = {
        id: uuidv4(),
        buildingId,
        maintenanceDate: currentDateISO,
        maintenanceTime: currentTimeLocale,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceFee: targetBuilding.maintenanceFee * targetBuilding.elevatorCount, // Bu ziyaretin ücreti
      };
      newMaintenanceHistory = [...newMaintenanceHistory, maintenanceHistoryRecord];

      const maintenanceRecordCurrentVisit: MaintenanceRecord = { 
        id: uuidv4(),
        buildingId,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceDate: currentDateISO,
        maintenanceTime: currentTimeLocale,
        elevatorCount: targetBuilding.elevatorCount,
        totalFee: targetBuilding.maintenanceFee * targetBuilding.elevatorCount, // Bu ziyaretin ücreti
        status: 'completed',
        priority: 'medium',
        searchableText: `${targetBuilding.name} ${state.currentUser?.name || 'Bilinmeyen'} bakım`,
      };
      newMaintenanceRecords = [...newMaintenanceRecords, maintenanceRecordCurrentVisit];


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

      // Makbuz modülünü göster ve bakım tamamlandıysa fişi oluştur
      if (showReceipt) { 
        const receiptHtml = generateMaintenanceReceipt(targetBuilding, finalStateAfterMaintenance, state.currentUser?.name || 'Bilinmeyen');
        
        // Makbuzu arşivle
        const archivedReceipt: ArchivedReceipt = {
            id: uuidv4(),
            buildingId: buildingId,
            timestamp: new Date().toISOString(),
            htmlContent: receiptHtml,
        };
        
        return {
          ...finalStateAfterMaintenance,
          showReceiptModal: true,
          receiptModalHtml: receiptHtml,
          archivedReceipts: [...finalStateAfterMaintenance.archivedReceipts, archivedReceipt],
        };
      }
      return finalStateAfterMaintenance;

    case 'CANCEL_MAINTENANCE':
      const buildingToCancelMaintenance = state.buildings.find(b => b.id === action.payload);

      if (!buildingToCancelMaintenance) return state;

      const currentMonthForCancel = new Date().toISOString().substring(0, 7);
      const maintenanceFeeToRevert = buildingToCancelMaintenance.maintenanceFee * buildingToCancelMaintenance.elevatorCount;

      let updatedBuildingsAfterCancel = state.buildings.map(b =>
        b.id === action.payload
          ? {
              ...b,
              isMaintained: false, // Bakım durumunu geri al
              lastMaintenanceDate: undefined, // Son bakım tarihini temizle
              lastMaintenanceTime: undefined, // Son bakım saatini temizle
            }
          : b
      );

      // Mevcut ay içinde eklenmiş olan bakım ücretini borç kayıtlarından bul ve çıkar
      const updatedDebtRecordsAfterCancel = state.debtRecords.filter(dr =>
        !(dr.buildingId === action.payload &&
          dr.type === 'maintenance' &&
          dr.date.substring(0, 7) === currentMonthForCancel &&
          dr.amount === maintenanceFeeToRevert) // Sadece doğru bakım ücretini geri aldığımızdan emin ol
      );

      // Eğer bakım borcu kaldırıldıysa, binanın toplam borcunu da güncelle
      const debtRemovedAmount = state.debtRecords.length !== updatedDebtRecordsAfterCancel.length ? maintenanceFeeToRevert : 0;

      updatedBuildingsAfterCancel = updatedBuildingsAfterCancel.map(b =>
        b.id === action.payload
          ? { ...b, debt: b.debt - debtRemovedAmount }
          : b
      );

      return {
        ...state,
        buildings: updatedBuildingsAfterCancel,
        debtRecords: updatedDebtRecordsAfterCancel,
        updates: [
          {
            id: uuidv4(),
            action: 'Bakım İptal Edildi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${buildingToCancelMaintenance.name} binasının bakımı iptal edildi.`,
          },
          ...state.updates,
        ],
      };
      
    case 'SHOW_ARCHIVED_RECEIPT':
        const receiptId = action.payload; // Bu payload arşivlenmiş makbuzun ID'si olmalı
        const archivedReceiptToShow = state.archivedReceipts.find(ar => ar.id === receiptId);

        if (archivedReceiptToShow) {
            return {
                ...state,
                showReceiptModal: true,
                receiptModalHtml: archivedReceiptToShow.htmlContent,
            };
        }
        return state; // Eğer makbuz bulunamazsa durumu değiştirmeden çık

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
            action: 'Bakım Durumu Sıfırlandı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `Tüm binaların bakım durumu sıfırlandı.`,
          },
          ...state.updates,
        ],
      };

    case 'ADD_FAULT_REPORT':
        const newFaultReport: FaultReport = {
            ...action.payload,
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            status: 'pending', // Başlangıçta bekliyor durumu
        };
        return {
            ...state,
            faultReports: [...state.faultReports, newFaultReport],
            updates: [
                {
                    id: uuidv4(),
                    action: 'Arıza Raporu Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newFaultReport.buildingId} için yeni arıza raporu oluşturuldu.`,
                },
                ...state.updates,
            ],
        };

    case 'RESOLVE_FAULT_REPORT':
        return {
            ...state,
            faultReports: state.faultReports.map(report =>
                report.id === action.payload ? { ...report, status: 'resolved', resolvedDate: new Date().toISOString() } : report
            ),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Arıza Raporu Çözüldü',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload} ID'li arıza raporu çözüldü.`,
                },
                ...state.updates,
            ],
        };

    case 'ADD_MAINTENANCE_HISTORY':
        const newMaintenanceHistoryEntry: MaintenanceHistory = {
            ...action.payload,
            id: uuidv4(),
        };
        return {
            ...state,
            maintenanceHistory: [...state.maintenanceHistory, newMaintenanceHistoryEntry],
            updates: [
                {
                    id: uuidv4(),
                    action: 'Bakım Geçmişi Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newMaintenanceHistoryEntry.buildingId} için bakım geçmişi kaydı eklendi.`,
                },
                ...state.updates,
            ],
        };
    
    case 'ADD_MAINTENANCE_RECORD':
        const newMaintenanceRecord: MaintenanceRecord = {
            ...action.payload,
            id: uuidv4(),
        };
        return {
            ...state,
            maintenanceRecords: [...state.maintenanceRecords, newMaintenanceRecord],
            updates: [
                {
                    id: uuidv4(),
                    action: 'Bakım Kaydı Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newMaintenanceRecord.buildingId} için bakım kaydı eklendi.`,
                },
                ...state.updates,
            ],
        };

    case 'ADD_PRINTER':
        const newPrinter: Printer = {
            ...action.payload,
            id: uuidv4(),
        };
        return {
            ...state,
            printers: [...state.printers, newPrinter],
            updates: [
                {
                    id: uuidv4(),
                    action: 'Yazıcı Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newPrinter.name} yazıcısı sisteme eklendi.`,
                },
                ...state.updates,
            ],
        };

    case 'UPDATE_PRINTER':
        return {
            ...state,
            printers: state.printers.map(printer =>
                printer.id === action.payload.id ? action.payload : printer
            ),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Yazıcı Güncellendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload.name} yazıcısı güncellendi.`,
                },
                ...state.updates,
            ],
        };

    case 'DELETE_PRINTER':
        const printerToDelete = state.printers.find(p => p.id === action.payload);
        return {
            ...state,
            printers: state.printers.filter(printer => printer.id !== action.payload),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Yazıcı Silindi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${printerToDelete?.name || 'Bilinmeyen'} yazıcısı silindi.`,
                },
                ...state.updates,
            ],
        };

    case 'ADD_SMS_TEMPLATE':
        const newSMSTemplate: SMSTemplate = {
            ...action.payload,
            id: uuidv4(),
        };
        return {
            ...state,
            smsTemplates: [...state.smsTemplates, newSMSTemplate],
            updates: [
                {
                    id: uuidv4(),
                    action: 'SMS Şablonu Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newSMSTemplate.name} SMS şablonu eklendi.`,
                },
                ...state.updates,
            ],
        };

    case 'UPDATE_SMS_TEMPLATE':
        return {
            ...state,
            smsTemplates: state.smsTemplates.map(template =>
                template.id === action.payload.id ? action.payload : template
            ),
            updates: [
                {
                    id: uuidv4(),
                    action: 'SMS Şablonu Güncellendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload.name} SMS şablonu güncellendi.`,
                },
                ...state.updates,
            ],
        };

    case 'DELETE_SMS_TEMPLATE':
        const smsTemplateToDelete = state.smsTemplates.find(s => s.id === action.payload);
        return {
            ...state,
            smsTemplates: state.smsTemplates.filter(template => template.id !== action.payload),
            updates: [
                {
                    id: uuidv4(),
                    action: 'SMS Şablonu Silindi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${smsTemplateToDelete?.name || 'Bilinmeyen'} SMS şablonu silindi.`,
                },
                ...state.updates,
            ],
        };

    case 'SEND_BULK_SMS':
        // Bu aksiyon, sadece bir simülasyon veya bir harici API çağrısı için bir işaretleyici olabilir.
        // Gerçek SMS gönderimi burada yapılmaz, sadece loglanır.
        return {
            ...state,
            updates: [
                {
                    id: uuidv4(),
                    action: 'Toplu SMS Gönderildi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload.buildingIds.length} binaya SMS gönderimi denendi (Şablon ID: ${action.payload.templateId}).`,
                },
                ...state.updates,
            ],
            notifications: [
                `Toplu SMS gönderimi başarıyla başlatıldı.`,
                ...state.notifications,
            ],
            unreadNotifications: state.unreadNotifications + 1,
        };

    case 'SEND_WHATSAPP':
        // WhatsApp entegrasyonu için benzer bir mantık
        return {
            ...state,
            updates: [
                {
                    id: uuidv4(),
                    action: 'WhatsApp Mesajı Gönderildi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload.buildingIds.length} binaya WhatsApp mesajı gönderimi denendi (Şablon ID: ${action.payload.templateId}).`,
                },
                ...state.updates,
            ],
            notifications: [
                `WhatsApp mesajı gönderimi başarıyla başlatıldı.`,
                ...state.notifications,
            ],
            unreadNotifications: state.unreadNotifications + 1,
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
            updates: [
                {
                    id: uuidv4(),
                    action: 'Teklif Oluşturuldu',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newProposal.title} başlıklı yeni teklif oluşturuldu.`,
                },
                ...state.updates,
            ],
        };

    case 'UPDATE_PROPOSAL':
        return {
            ...state,
            proposals: state.proposals.map(proposal =>
                proposal.id === action.payload.id ? action.payload : proposal
            ),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Teklif Güncellendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload.title} başlıklı teklif güncellendi.`,
                },
                ...state.updates,
            ],
        };

    case 'DELETE_PROPOSAL':
        const proposalToDelete = state.proposals.find(p => p.id === action.payload);
        return {
            ...state,
            proposals: state.proposals.filter(proposal => proposal.id !== action.payload),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Teklif Silindi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${proposalToDelete?.title || 'Bilinmeyen'} başlıklı teklif silindi.`,
                },
                ...state.updates,
            ],
        };

    case 'ADD_PAYMENT':
        const newPayment: Payment = {
            ...action.payload,
            id: uuidv4(),
        };

        // İlgili binanın borcunu düşür
        const updatedBuildingsAfterPayment = state.buildings.map(b =>
            b.id === newPayment.buildingId
                ? { ...b, debt: b.debt - newPayment.amount }
                : b
        );

        // Borç kaydı ekle (ödeme kaydı)
        const buildingForPayment = state.buildings.find(b => b.id === newPayment.buildingId);
        const paymentDebtRecord: DebtRecord = {
            id: uuidv4(),
            buildingId: newPayment.buildingId,
            date: newPayment.paymentDate,
            type: 'payment',
            description: `Ödeme yapıldı`,
            amount: -newPayment.amount, // Ödeme olduğu için negatif değer
            previousDebt: buildingForPayment?.debt || 0,
            newDebt: (buildingForPayment?.debt || 0) - newPayment.amount,
            performedBy: state.currentUser?.name || 'Bilinmeyen',
        };

        return {
            ...state,
            payments: [...state.payments, newPayment],
            buildings: updatedBuildingsAfterPayment,
            debtRecords: [...state.debtRecords, paymentDebtRecord],
            updates: [
                {
                    id: uuidv4(),
                    action: 'Ödeme Alındı',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${buildingForPayment?.name || 'Bilinmeyen'} binasından ${newPayment.amount} TL ödeme alındı.`,
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
            updates: [
                {
                    id: uuidv4(),
                    action: 'Teklif Şablonu Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newProposalTemplate.name} teklif şablonu eklendi.`,
                },
                ...state.updates,
            ],
        };

    case 'UPDATE_PROPOSAL_TEMPLATE':
        return {
            ...state,
            proposalTemplates: state.proposalTemplates.map(template =>
                template.id === action.payload.id ? action.payload : template
            ),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Teklif Şablonu Güncellendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${action.payload.name} teklif şablonu güncellendi.`,
                },
                ...state.updates,
            ],
        };

    case 'DELETE_PROPOSAL_TEMPLATE':
        const proposalTemplateToDelete = state.proposalTemplates.find(p => p.id === action.payload);
        return {
            ...state,
            proposalTemplates: state.proposalTemplates.filter(template => template.id !== action.payload),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Teklif Şablonu Silindi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${proposalTemplateToDelete?.name || 'Bilinmeyen'} teklif şablonu silindi.`,
                },
                ...state.updates,
            ],
        };

    case 'ADD_QR_CODE_DATA':
        const newQRCodeData: QRCodeData = {
            ...action.payload,
            id: uuidv4(),
        };
        return {
            ...state,
            qrCodes: [...state.qrCodes, newQRCodeData],
            updates: [
                {
                    id: uuidv4(),
                    action: 'QR Kod Verisi Eklendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `Yeni QR kod verisi (${newQRCodeData.data}) eklendi.`,
                },
                ...state.updates,
            ],
        };

    case 'UPDATE_AUTO_SAVE_DATA':
        // AutoSaveData'yı güncelle
        return {
            ...state,
            autoSaveData: [action.payload], // Genellikle tek bir oto kaydı tutulur
            lastAutoSave: new Date().toISOString(),
            hasUnsavedChanges: false, // Kayıt yapıldığı için değişiklik yok sayılır
            isAutoSaving: false,
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
        const newArchivedReceipt: ArchivedReceipt = {
            ...action.payload,
            id: uuidv4(),
        };
        return {
            ...state,
            archivedReceipts: [...state.archivedReceipts, newArchivedReceipt],
            updates: [
                {
                    id: uuidv4(),
                    action: 'Makbuz Arşivlendi',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `${newArchivedReceipt.buildingId} binası için makbuz arşivlendi.`,
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
        const percentage = action.payload; // Yüzde olarak (örn: 10, 20)
        return {
            ...state,
            parts: state.parts.map(part => ({
                ...part,
                price: part.price * (1 + percentage / 100),
            })),
            buildings: state.buildings.map(building => ({
                ...building,
                maintenanceFee: building.maintenanceFee * (1 + percentage / 100),
            })),
            updates: [
                {
                    id: uuidv4(),
                    action: 'Fiyatlar Artırıldı',
                    user: state.currentUser?.name || 'Bilinmeyen',
                    timestamp: new Date().toISOString(),
                    details: `Tüm parça fiyatları ve bakım ücretleri %${percentage} oranında artırıldı.`,
                },
                ...state.updates,
            ],
        };

    default:
      return state;
  }
}
