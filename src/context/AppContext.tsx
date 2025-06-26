import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  AppState,
  Building,
  Part,
  PartInstallation,
  ManualPartInstallation,
  Update,
  Income,
  User,
  DebtRecord,
  AppSettings,
  FaultReport,
  MaintenanceReceipt,
  MaintenanceHistory,
  MaintenanceRecord,
  Printer,
  SMSTemplate,
  Proposal,
  Payment,
  ProposalTemplate,
  QRCodeData,
  NotificationData,
  AutoSaveData,
  ArchivedReceipt,
} from '../types';

// Initial state
const initialState: AppState = {
  buildings: [],
  parts: [
    // Örnek Parçalar - YENİ EKLENDİ
    { id: uuidv4(), name: 'Motor', quantity: 5, price: 15000 },
    { id: uuidv4(), name: 'Halat', quantity: 20, price: 500 },
    { id: uuidv4(), name: 'Kapı Sensörü', quantity: 15, price: 300 },
    { id: uuidv4(), name: 'Kumanda Kartı', quantity: 8, price: 2500 },
    { id: uuidv4(), name: 'Fren Balatası', quantity: 30, price: 100 },
  ],
  partInstallations: [],
  manualPartInstallations: [],
  updates: [],
  incomes: [],
  currentUser: null,
  users: [],
  notifications: [],
  sidebarOpen: false,
  settings: {
    appTitle: 'TKNLİFT', // BURASI GÜNCELLENDİ
    logo: null,
    companyName: 'TKNLİFT Asansör',
    companySlogan: 'Güvenli ve Hızlı Çözümler', // YENİ EKLENDİ
    companyPhone: '05551234567',
    companyAddress: {
      mahalle: 'Merkez Mah.',
      sokak: 'Ana Cad.',
      il: 'İstanbul',
      ilce: 'Kadıköy',
      binaNo: '123',
    },
    ceEmblemUrl: '/ce.png', // public klasöründeki örnek görsel
    tseEmblemUrl: '/ts.jpg', // public klasöründeki örnek görsel
    receiptTemplate: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          {{LOGO}}
          <h1 style="color: #333;">{{COMPANY_NAME}}</h1>
          <p style="font-size: 12px; color: #777;">{{COMPANY_ADDRESS}}</p>
          <p style="font-size: 12px; color: #777;">Tel: {{COMPANY_PHONE}}</p>
          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
            {{CE_EMBLEM}}
            {{TSE_EMBLEM}}
          </div>
        </div>
        <h2 style="text-align: center; color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px;">BAKIM FİŞİ</h2>
        <div style="margin-bottom: 10px;">
          <strong>Bina Adı:</strong> {{BUILDING_NAME}}<br>
          <strong>Adres:</strong> {{BUILDING_ADDRESS}}<br>
          <strong>Asansör Sayısı:</strong> {{ELEVATOR_COUNT}}<br>
          <strong>Bakım Ücreti:</strong> {{MAINTENANCE_FEE}} ₺<br>
          <strong>Teknisyen:</strong> {{TECHNICIAN}}<br>
          <strong>Tarih:</strong> {{DATE}} {{TIME}}<br>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Yapılan İşlem:</strong> {{MAINTENANCE_ACTION}}
        </div>
        {{PARTS_SECTION}}
        {{DEBT_SECTION}}
        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
          <strong>Notlar:</strong> {{NOTES}}
        </div>
        <div style="text-align: right; margin-top: 30px; font-size: 12px; color: #999;">
          Oluşturulma Zamanı: {{TIMESTAMP}}
        </div>
      </div>
    `,
    installationProposalTemplate: '',
    maintenanceProposalTemplate: '',
    revisionProposalTemplate: '',
    faultReportTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; background: #f8f9fa; border-bottom: 2px solid #333;">
          <div style="flex: 1;">
            {{LOGO}}
          </div>
          <div style="flex: 2; text-align: center;">
            <h1 style="font-size: 24px; font-weight: bold; color: #333; margin: 10px 0;">{{COMPANY_NAME}}</h1>
            <p style="font-size: 12px; color: #666; font-weight: bold;">Asansör Bakım ve Servis Hizmetleri</p>
          </div>
          <div style="flex: 1; text-align: right; font-size: 12px; color: #666;">
            <p style="margin-bottom: 5px; line-height: 1.4;">{{COMPANY_ADDRESS}}</p>
            <p style="font-weight: bold;">TEL: {{COMPANY_PHONE}}</p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; background: #dc2626; color: white;">
          <h1 style="margin: 0; font-size: 20px;">ARIZA BİLDİRİM FORMU</h1>
        </div>
        <div style="padding: 20px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Bina Bilgileri</h2>
          <p style="margin: 0; color: #666;"><strong>Bina Adı:</strong> {{BUILDING_NAME}}</p>
          <p style="margin: 0; color: #666;"><strong>Adres:</strong> {{BUILDING_ADDRESS}}</p>
        </div>
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Bildirim Detayları</h2>
          <p style="margin-bottom: 10px;"><strong>Bildiren:</strong> {{REPORTER_NAME}}</p>
          <p style="margin-bottom: 10px;"><strong>Telefon:</strong> {{REPORTER_PHONE}}</p>
          <p style="margin-bottom: 10px;"><strong>Daire No:</strong> {{APARTMENT_NO}}</p>
          <p style="margin-bottom: 10px;"><strong>Açıklama:</strong> {{DESCRIPTION}}</p>
        </div>
        <div style="padding: 20px; background: #f8f9fa; border-top: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #666;">
          <p>Bu form {{COMPANY_NAME}} tarafından sağlanmıştır.</p>
          <p>Acil durumlar için lütfen {{COMPANY_PHONE}} numaralı telefonu arayın.</p>
        </div>
      </div>
    `,
    autoSaveInterval: 60,
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
  proposalTemplates: [
    // Bakım Sözleşmesi Şablonu - YENİ EKLENDİ
    {
      id: 'maintenance-contract-template',
      type: 'maintenance',
      name: 'Bakım Sözleşmesi',
      content: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bakım Sözleşmesi</title>
            <style>
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; font-size: 12px; line-height: 1.5; }
              .container { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 30px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header img.logo { max-height: 80px; margin-bottom: 10px; }
              .header h1 { margin: 0; font-size: 24px; color: #333; }
              .header p { margin: 5px 0; color: #555; }
              .certifications { display: flex; justify-content: center; gap: 20px; margin-top: 15px; }
              .certifications img { max-height: 50px; }
              .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .info-row { display: flex; margin-bottom: 5px; }
              .info-label { font-weight: bold; width: 150px; flex-shrink: 0; }
              .info-value { flex-grow: 1; }
              .static-text { margin-top: 20px; margin-bottom: 20px; }
              .static-text ol, .static-text ul { margin: 0; padding-left: 20px; }
              .static-text li { margin-bottom: 5px; }
              .signature-line { margin-top: 50px; text-align: center; }
              .signature-line div { border-top: 1px solid #000; display: inline-block; padding-top: 5px; min-width: 200px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                {{LOGO}}
                <h1>{{COMPANY_NAME}}</h1>
                <p>{{COMPANY_SLOGAN}}</p>
                <p>{{COMPANY_ADDRESS}}</p>
                <p>TEL: {{COMPANY_PHONE}}</p>
                <div class="certifications">
                  {{CE_EMBLEM}}
                  {{TSE_EMBLEM}}
                </div>
              </div>

              <h2 style="text-align: center; font-size: 18px; margin-bottom: 30px;">BAKIM SÖZLEŞMESİ</h2>

              <div class="section-title">Sözleşme Bilgileri</div>
              <div class="info-row"><span class="info-label">Sözleşme Başlangıç Tarihi:</span> <span class="info-value">{{CONTRACT_START_DATE}}</span></div>
              <div class="info-row"><span class="info-label">Sözleşme Bitiş Tarihi:</span> <span class="info-value">{{CONTRACT_END_DATE}}</span></div>

              <div class="section-title">Bina Bilgileri</div>
              <div class="info-row"><span class="info-label">Bina Adı:</span> <span class="info-value">{{BUILDING_NAME}}</span></div>
              <div class="info-row"><span class="info-label">Bina Sorumlusu:</span> <span class="info-value">{{BUILDING_RESPONSIBLE}}</span></div>
              <div class="info-row"><span class="info-label">Adres:</span> <span class="info-value">{{BUILDING_ADDRESS}}</span></div>
              <div class="info-row"><span class="info-label">İletişim Telefonu:</span> <span class="info-value">{{CONTACT_PHONE}}</span></div>
              <div class="info-row"><span class="info-label">Asansör Sayısı:</span> <span class="info-value">{{ELEVATOR_COUNT}}</span></div>
              <div class="info-row"><span class="info-label">Aylık Bakım Ücreti:</span> <span class="info-value">{{MONTHLY_MAINTENANCE_FEE}} ₺</span></div>

              <div class="section-title">Asansör Detayları</div>
              <div class="info-row"><span class="info-label">Asansör Cinsi:</span> <span class="info-value">{{ELEVATOR_TYPE}}</span></div>
              <div class="info-row"><span class="info-label">Taşıyacağı Yük (kg):</span> <span class="info-value">{{LOAD_CAPACITY_KG}}</span></div>
              <div class="info-row"><span class="info-label">Kat Sayısı:</span> <span class="info-value">{{FLOOR_COUNT}}</span></div>
              <div class="info-row"><span class="info-label">Durak Sayısı:</span> <span class="info-value">{{STOP_COUNT}}</span></div>
              <div class="info-row"><span class="info-label">Seyir Mesafesi:</span> <span class="info-value">{{TRAVEL_DISTANCE}}</span></div>
              <div class="info-row"><span class="info-label">Asansör Hızı (m/s):</span> <span class="info-value">{{ELEVATOR_SPEED_MS}}</span></div>

              <div class="section-title">BAKIMCI FİRMANIN SORUMLULUKLARI</div>
              <div class="static-text">
                <ol>
                  <li>{{COMPANY_NAME}} firması tarafından bahsi geçen asansörün aylık olarak periyodik bakımı yapılacaktır. Lüzumlu hallerde temizleme ve yağlama işlemleri yapılacak, arızaları giderilerek sıhhatli çalışması temin edilecektir.</li>
                  <li>Bakım işleri, asansör bakım talimatları, standart ve yönetmeliklerine uygun olarak gerçekleştirilecektir.</li>
                  <li>Bakımı yapan kişi, asansörün çalışmasının veya can güvenliğine engel olacak bir durum tespit ettiğinde durumu Bina Yöneticisine bildirerek gerektiğinde asansörü hizmet dışı bırakabilecektir.</li>
                  <li>Asansör bildirimlerine en geç şehir içi ise 6 saatte müdahale edilecektir.</li>
                  <li>Bakımın yapılabilmesi için gerekli yağları, üstübü ve temizlik malzemelerini bina yönetimi temin edecektir.</li>
                </ol>
              </div>

              <div class="section-title">BİNA YÖNETİCİSİNİN SORUMLULUKLARI</div>
              <div class="static-text">
                <ol>
                  <li>Asansör makine dairesinin ve asansör kuyusunun başka amaçlar için kullandırmamasını sağlamak.</li>
                  <li>Kabin, kapı gibi görünen dış yüzeylerin temizletilmesi. Asansör kuyusunun temizliği.</li>
                  <li>Asansörün kullanım talimatnamesine uygun olarak kullanılmasının sağlanması.</li>
                  <li>Apartman Yöneticisine firma tarafından teslim edilen, asansörde insan kaldığında kurtarıcı anahtarın muhafazası ve 2. Şahıslara verilmemesi.</li>
                  <li>Asansörde meydana gelecek arızaların en kısa sürede firmaya bildirilmesi.</li>
                </ol>
              </div>

              <div class="section-title">ÖDEME ŞEKLİ</div>
              <div class="static-text">
                <ol>
                  <li>Fiyatlar ait olduğu dönemin sonunda kesilecek ve ödemeler müteakip ayın 15.gününe kadar, firma yetkilisine firmaya ait makbuz mukabili yapılacaktır.</li>
                  <li>Ödemenin bu süre içinde yapılmaması halinde aylık %10 gecikme farkı talep edilecektir. Asansör müşterisi bu ödeme şeklini peşinen kabul eder.</li>
                </ol>
              </div>

              <div class="section-title">ANLAŞMAZLIK</div>
              <div class="static-text">
                <ol>
                  <li>İş bu sözleşmenin tatbikatından doğacak ihtilaflarda BATMAN mahkemeleri ve İcra Daireleri yetkilidir.</li>
                  <li>İş bu sözleşme 2 nüsha halinde tanzim edilmiştir.</li>
                </ol>
              </div>

              <div class="signature-line">
                <div>{{COMPANY_NAME}}</div>
              </div>
            </div>
          </body>
        </html>
      `,
      fillableFields: [
        { id: 'contractStartDate', name: 'CONTRACT_START_DATE', label: 'Sözleşme Başlangıç Tarihi', type: 'date', required: true },
        { id: 'contractEndDate', name: 'CONTRACT_END_DATE', label: 'Sözleşme Bitiş Tarihi', type: 'date', required: true },
        { id: 'elevatorType', name: 'ELEVATOR_TYPE', label: 'Asansör Cinsi', type: 'text', required: true },
        { id: 'loadCapacityKg', name: 'LOAD_CAPACITY_KG', label: 'Taşıyacağı Yük (kg)', type: 'number', required: true },
        { id: 'floorCount', name: 'FLOOR_COUNT', label: 'Binadaki Kat Sayısı', type: 'number', required: true },
        { id: 'stopCount', name: 'STOP_COUNT', label: 'Durak Sayısı', type: 'number', required: true },
        { id: 'travelDistance', name: 'TRAVEL_DISTANCE', label: 'Seyir Mesafesi', type: 'number', required: true },
        { id: 'elevatorSpeedMs', name: 'ELEVATOR_SPEED_MS', label: 'Asansör Hızı (m/s)', type: 'number', required: true },
      ],
      documentFile: '',
    },
  ],
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
  | { type: 'INCREASE_PRICES'; payload: number }
  | { type: 'SHOW_ARCHIVED_RECEIPT'; payload: string }
  | { type: 'REMOVE_MAINTENANCE_STATUS_MARK'; payload: string }
  | { type: 'CANCEL_MAINTENANCE'; payload: string }
  | { type: 'REVERT_MAINTENANCE'; payload: string };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_BUILDING':
      const newBuilding: Building = { ...action.payload, id: uuidv4(), maintenanceNote: '' };
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
        buildings: state.buildings.map(b => (b.id === action.payload.id ? { ...b, ...action.payload } : b)),
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
        buildings: state.buildings.filter(b => b.id !== action.payload),
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
      const newPart: Part = { ...action.payload, id: uuidv4() };
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
      return { ...state, parts: state.parts.map(p => (p.id === action.payload.id ? action.payload : p)) };

    case 'DELETE_PART':
      const partToDelete = state.parts.find(p => p.id === action.payload);
      return {
        ...state,
        parts: state.parts.filter(p => p.id !== action.payload),
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

    case 'INSTALL_PART': {
      const installation: PartInstallation = {
        ...action.payload,
        id: uuidv4(),
        installedBy: state.currentUser?.name || 'Bilinmeyen',
        isPaid: false,
      };
      const part = state.parts.find(p => p.id === action.payload.partId);
      const building = state.buildings.find(b => b.id === action.payload.buildingId);

      if (!part || part.quantity < action.payload.quantity) return state;

      const totalPartCost = part.price * action.payload.quantity;
      const updatedParts = state.parts.map(p =>
        p.id === action.payload.partId ? { ...p, quantity: p.quantity - action.payload.quantity } : p
      );
      const updatedBuildings = state.buildings.map(b =>
        b.id === action.payload.buildingId ? { ...b, debt: (b.debt || 0) + totalPartCost } : b
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
    }

    case 'INSTALL_MANUAL_PART': {
      const manualInstallation: ManualPartInstallation = {
        ...action.payload,
        id: uuidv4(),
        installedBy: state.currentUser?.name || 'Bilinmeyen',
        isPaid: false,
      };
      const building = state.buildings.find(b => b.id === action.payload.buildingId);
      const updatedBuildings = state.buildings.map(b =>
        b.id === action.payload.buildingId ? { ...b, debt: (b.debt || 0) + action.payload.totalPrice } : b
      );
      const debtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.installDate,
        type: 'part',
        description: `${action.payload.quantity} Adet ${action.payload.partName} takıldı`,
        amount: action.payload.totalPrice,
        previousDebt: building?.debt || 0,
        newDebt: (building?.debt || 0) + action.payload.totalPrice,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        relatedRecordId: null,
      };

      return {
        ...state,
        manualPartInstallations: [...state.manualPartInstallations, manualInstallation],
        buildings: updatedBuildings,
        debtRecords: [...state.debtRecords, debtRecord],
        updates: [
          {
            id: uuidv4(),
            action: 'Manuel Parça Takıldı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${building?.name || 'Bilinmeyen'} binasına ${action.payload.quantity} adet ${action.payload.partName} takıldı.`,
          },
          ...state.updates,
        ],
      };
    }

    case 'MARK_PART_AS_PAID': {
      const { installationId, isManual } = action.payload;
      const paymentDate = new Date().toISOString();
      return {
        ...state,
        ...(isManual
          ? { manualPartInstallations: state.manualPartInstallations.map(i => (i.id === installationId ? { ...i, isPaid: true, paymentDate } : i)) }
          : { partInstallations: state.partInstallations.map(i => (i.id === installationId ? { ...i, isPaid: true, paymentDate } : i)) }),
      };
    }

    case 'ADD_UPDATE': {
      const update: Update = { ...action.payload, id: uuidv4(), timestamp: new Date().toISOString() };
      return { ...state, updates: [update, ...state.updates] };
    }

    case 'ADD_INCOME': {
      const income: Income = { ...action.payload, id: uuidv4() };
      return { ...state, incomes: [...state.incomes, income] };
    }

    case 'SET_USER': {
      const existingUser = state.users.find(u => u.name === action.payload);
      const currentUser = existingUser || { id: uuidv4(), name: action.payload };
      return { ...state, currentUser, users: existingUser ? state.users : [...state.users, currentUser] };
    }

    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };

    case 'ADD_NOTIFICATION': {
      const newNotification = action.payload;
      const updatedNotifications = [newNotification, ...state.notifications];
      const newUnreadCount = state.unreadNotifications + 1;

      if (updatedNotifications.length !== state.notifications.length + 1) {
        console.error('Bildirim eklenemedi! Dizi güncellenmedi.', { state, action });
      } else {
        console.log('Bildirim eklendi:', newNotification, 'Yeni unread count:', newUnreadCount);
      }

      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: newUnreadCount,
      };
    }

    case 'CLEAR_NOTIFICATIONS': {
      const clearedNotifications = [];
      if (state.unreadNotifications !== 0) {
        console.log('Bildirimler temizlendi, unreadNotifications 0 olarak ayarlandı.');
      } else {
        console.log('Zaten hiç okunmamış bildirim yok.');
      }
      return {
        ...state,
        notifications: clearedNotifications,
        unreadNotifications: 0,
      };
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'TOGGLE_MAINTENANCE': {
      const { buildingId, showReceipt } = action.payload;
      const targetBuilding = state.buildings.find(b => b.id === buildingId);

      if (!targetBuilding || targetBuilding.isMaintained) {
        if (showReceipt && targetBuilding) {
          const receiptHtml = generateMaintenanceReceipt(targetBuilding, state, state.currentUser?.name || 'Bilinmeyen');
          return { ...state, showReceiptModal: true, receiptModalHtml: receiptHtml };
        }
        return state;
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const updatedBuildings = state.buildings.map(b =>
        b.id === buildingId
          ? {
              ...b,
              isMaintained: true,
              lastMaintenanceDate: currentDate,
              lastMaintenanceTime: currentTime,
              isDefective: false,
              defectiveNote: undefined,
              faultSeverity: undefined,
              faultTimestamp: undefined,
              faultReportedBy: undefined,
            }
          : b
      );

      const newMaintenanceRecordId = uuidv4();
      const maintenanceRecord: MaintenanceRecord = {
        id: newMaintenanceRecordId,
        buildingId,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceDate: currentDate,
        maintenanceTime: currentTime,
        elevatorCount: targetBuilding.elevatorCount,
        totalFee: targetBuilding.maintenanceFee * targetBuilding.elevatorCount,
        status: 'completed',
        priority: 'medium',
        searchableText: `${targetBuilding.name} ${state.currentUser?.name || 'Bilinmeyen'} bakım`,
      };
      const currentMonth = currentDate.substring(0, 7);
      const maintenanceFeeAlreadyAdded = state.debtRecords.some(
        dr => dr.buildingId === buildingId && dr.type === 'maintenance' && dr.date.substring(0, 7) === currentMonth && dr.relatedRecordId === newMaintenanceRecordId
      );

      let newDebtRecords = [...state.debtRecords];
      let updatedBuildingsWithDebt = [...updatedBuildings];
      if (!maintenanceFeeAlreadyAdded) {
        const maintenanceFee = targetBuilding.maintenanceFee * targetBuilding.elevatorCount;
        updatedBuildingsWithDebt = updatedBuildings.map(b =>
          b.id === buildingId ? { ...b, debt: (b.debt || 0) + maintenanceFee } : b
        );
        newDebtRecords = [
          ...newDebtRecords,
          {
            id: uuidv4(),
            buildingId,
            date: currentDate,
            type: 'maintenance',
            description: `Bakım ücreti (${targetBuilding.elevatorCount} asansör)`,
            amount: maintenanceFee,
            previousDebt: targetBuilding.debt || 0,
            newDebt: (targetBuilding.debt || 0) + maintenanceFee,
            performedBy: state.currentUser?.name || 'Bilinmeyen',
            relatedRecordId: newMaintenanceRecordId,
          },
        ];
      }

      const maintenanceHistory: MaintenanceHistory = {
        id: uuidv4(),
        buildingId,
        maintenanceDate: currentDate,
        maintenanceTime: currentTime,
        performedBy: state.currentUser?.name || 'Bilinmeyen',
        maintenanceFee: targetBuilding.maintenanceFee * targetBuilding.elevatorCount,
        relatedRecordId: newMaintenanceRecordId,
      };

      const finalState = {
        ...state,
        buildings: updatedBuildingsWithDebt,
        debtRecords: newDebtRecords,
        maintenanceHistory: [...state.maintenanceHistory, maintenanceHistory],
        maintenanceRecords: [...state.maintenanceRecords, maintenanceRecord],
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
        const receiptHtml = generateMaintenanceReceipt(targetBuilding, finalState, state.currentUser?.name || 'Bilinmeyen');
        const archivedReceipt: ArchivedReceipt = {
          id: uuidv4(),
          buildingId,
          timestamp: new Date().toISOString(),
          htmlContent: receiptHtml,
          relatedRecordId: newMaintenanceRecordId,
        };
        return {
          ...finalState,
          showReceiptModal: true,
          receiptModalHtml: receiptHtml,
          archivedReceipts: [...finalState.archivedReceipts, archivedReceipt],
        };
      }
      return finalState;
    }

    case 'REPORT_FAULT': {
      const { buildingId, faultData } = action.payload;
      const faultBuilding = state.buildings.find(b => b.id === buildingId);

      if (!faultBuilding) return state;

      const updatedBuildings = state.buildings.map(b =>
        b.id === buildingId
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
        buildings: updatedBuildings,
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
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'RESET_MAINTENANCE_STATUS':
      return {
        ...state,
        buildings: state.buildings.map(b => ({ ...b, isMaintained: false })),
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

    case 'ADD_FAULT_REPORT': {
      const faultReport: FaultReport = {
        ...action.payload,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      return {
        ...state,
        faultReports: [...state.faultReports, faultReport],
        notifications: [`Yeni arıza bildirimi: ${action.payload.reporterName} ${action.payload.reporterSurname}`, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
      };
    }

    case 'RESOLVE_FAULT_REPORT':
      return {
        ...state,
        faultReports: state.faultReports.map(r => (r.id === action.payload ? { ...r, status: 'resolved' } : r)),
      };

    case 'ADD_MAINTENANCE_HISTORY': {
      const maintenanceHistory: MaintenanceHistory = { ...action.payload, id: uuidv4() };
      return { ...state, maintenanceHistory: [...state.maintenanceHistory, maintenanceHistory] };
    }

    case 'ADD_MAINTENANCE_RECORD': {
      const newMaintenanceRecord: MaintenanceRecord = { ...action.payload, id: uuidv4() };
      return { ...state, maintenanceRecords: [...state.maintenanceRecords, newMaintenanceRecord] };
    }

    case 'ADD_PRINTER': {
      const newPrinter: Printer = { ...action.payload, id: uuidv4() };
      const updatedPrinters = newPrinter.isDefault ? state.printers.map(p => ({ ...p, isDefault: false })) : state.printers;
      return { ...state, printers: [...updatedPrinters, newPrinter] };
    }

    case 'UPDATE_PRINTER': {
      const updatedPrinters = action.payload.isDefault
        ? state.printers.map(p => (p.id === action.payload.id ? action.payload : { ...p, isDefault: false }))
        : state.printers.map(p => (p.id === action.payload.id ? action.payload : p));
      return { ...state, printers: updatedPrinters };
    }

    case 'DELETE_PRINTER':
      return { ...state, printers: state.printers.filter(p => p.id !== action.payload) };

    case 'ADD_SMS_TEMPLATE': {
      const newSMSTemplate: SMSTemplate = { ...action.payload, id: uuidv4() };
      return { ...state, smsTemplates: [...state.smsTemplates, newSMSTemplate] };
    }

    case 'UPDATE_SMS_TEMPLATE':
      return { ...state, smsTemplates: state.smsTemplates.map(t => (t.id === action.payload.id ? action.payload : t)) };

    case 'DELETE_SMS_TEMPLATE':
      return { ...state, smsTemplates: state.smsTemplates.filter(t => t.id !== action.payload) };

    case 'SEND_BULK_SMS':
      console.log('Sending SMS to buildings:', action.payload.buildingIds);
      return state;

    case 'SEND_WHATSAPP': {
      const { templateId, buildingIds } = action.payload;
      const template = state.smsTemplates.find(t => t.id === templateId);
      if (template) {
        buildingIds.forEach(buildingId => {
          const building = state.buildings.find(b => b.id === buildingId);
          if (building?.contactInfo) {
            const message = encodeURIComponent(template.content);
            const phoneNumber = building.contactInfo.replace(/\D/g, '');
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
          }
        });
      }
      return state;
    }

    case 'ADD_PROPOSAL': {
      const newProposal: Proposal = {
        ...action.payload,
        id: uuidv4(),
        createdDate: new Date().toISOString(),
        createdBy: state.currentUser?.name || 'Bilinmeyen',
      };
      return { ...state, proposals: [...state.proposals, newProposal] };
    }

    case 'UPDATE_PROPOSAL':
      return { ...state, proposals: state.proposals.map(p => (p.id === action.payload.id ? action.payload : p)) };

    case 'DELETE_PROPOSAL':
      return { ...state, proposals: state.proposals.filter(p => p.id !== action.payload) };

    case 'ADD_PAYMENT': {
      const payment: Payment = { ...action.payload, id: uuidv4() };
      const updatedBuildings = state.buildings.map(b =>
        b.id === action.payload.buildingId ? { ...b, debt: Math.max(0, (b.debt || 0) - action.payload.amount) } : b
      );
      const building = state.buildings.find(b => b.id === action.payload.buildingId);
      const paymentDebtRecord: DebtRecord = {
        id: uuidv4(),
        buildingId: action.payload.buildingId,
        date: action.payload.date,
        type: 'payment',
        description: 'Ödeme alındı',
        amount: action.payload.amount,
        previousDebt: building?.debt || 0,
        newDebt: Math.max(0, (building?.debt || 0) - action.payload.amount),
        performedBy: action.payload.receivedBy,
        relatedRecordId: null,
      };
      return {
        ...state,
        payments: [...state.payments, payment],
        buildings: updatedBuildings,
        debtRecords: [...state.debtRecords, paymentDebtRecord],
        incomes: [
          ...state.incomes,
          { id: uuidv4(), buildingId: action.payload.buildingId, amount: action.payload.amount, date: action.payload.date, receivedBy: action.payload.receivedBy },
        ],
        updates: [
          {
            id: uuidv4(),
            action: 'Ödeme Alındı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${building?.name || 'Bilinmeyen'} binasından ${action.payload.amount.toLocaleString('tr-TR')} ₺ ödeme alındı.`,
          },
          ...state.updates,
        ],
      };
    }

    case 'ADD_PROPOSAL_TEMPLATE': {
      const newProposalTemplate: ProposalTemplate = { ...action.payload, id: uuidv4() };
      return { ...state, proposalTemplates: [...state.proposalTemplates, newProposalTemplate] };
    }

    case 'UPDATE_PROPOSAL_TEMPLATE':
      return { ...state, proposalTemplates: state.proposalTemplates.map(t => (t.id === action.payload.id ? action.payload : t)) };

    case 'DELETE_PROPOSAL_TEMPLATE':
      return { ...state, proposalTemplates: state.proposalTemplates.filter(t => t.id !== action.payload) };

    case 'ADD_QR_CODE_DATA': {
      const newQRCode: QRCodeData = { ...action.payload, id: uuidv4() };
      return { ...state, qrCodes: [...state.qrCodes, newQRCode] };
    }

    case 'UPDATE_AUTO_SAVE_DATA': {
      const index = state.autoSaveData.findIndex(
        data => data.formType === action.payload.formType && data.userId === action.payload.userId
      );
      const updatedAutoSaveData = index >= 0 ? state.autoSaveData.map((d, i) => (i === index ? action.payload : d)) : [...state.autoSaveData, action.payload];
      return { ...state, autoSaveData: updatedAutoSaveData, lastAutoSave: action.payload.timestamp };
    }

    case 'SHOW_RECEIPT_MODAL':
      return { ...state, showReceiptModal: true, receiptModalHtml: action.payload };

    case 'CLOSE_RECEIPT_MODAL':
      return { ...state, showReceiptModal: false, receiptModalHtml: null };

    case 'ARCHIVE_RECEIPT': {
      const archivedReceipt: ArchivedReceipt = { ...action.payload, id: uuidv4() };
      return { ...state, archivedReceipts: [...state.archivedReceipts, archivedReceipt] };
    }

    case 'SHOW_ARCHIVED_RECEIPT': {
      const receipt = state.archivedReceipts.find(ar => ar.id === action.payload);
      return receipt
        ? { ...state, showReceiptModal: true, receiptModalHtml: receipt.htmlContent }
        : { ...state, showReceiptModal: false, receiptModalHtml: null };
    }

    case 'REMOVE_MAINTENANCE_STATUS_MARK': {
      const building = state.buildings.find(b => b.id === action.payload);
      return {
        ...state,
        buildings: state.buildings.map(b => (b.id === action.payload ? { ...b, isMaintained: false } : b)),
        updates: [
          {
            id: uuidv4(),
            action: 'Bakım İşareti Kaldırıldı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${building?.name || 'Bilinmeyen'} binasının bakım işareti kaldırıldı.`,
          },
          ...state.updates,
        ],
      };
    }

    case 'CANCEL_MAINTENANCE': {
      const building = state.buildings.find(b => b.id === action.payload);
      if (!building) return state;

      const currentMonth = new Date().toISOString().substring(0, 7);
      let updatedBuildings = state.buildings.map(b =>
        b.id === action.payload ? { ...b, isMaintained: false, lastMaintenanceDate: undefined, lastMaintenanceTime: undefined } : b
      );
      let updatedDebtRecords = [...state.debtRecords];
      let updatedMaintenanceHistory = [...state.maintenanceHistory];
      let updatedMaintenanceRecords = [...state.maintenanceRecords];

      const lastDebtIndex = updatedDebtRecords.findIndex(
        dr => dr.buildingId === action.payload && dr.type === 'maintenance' && dr.date.substring(0, 7) === currentMonth
      );
      if (lastDebtIndex !== -1) {
        const debtAmount = updatedDebtRecords[lastDebtIndex].amount;
        updatedDebtRecords.splice(lastDebtIndex, 1);
        updatedBuildings = updatedBuildings.map(b =>
          b.id === action.payload ? { ...b, debt: Math.max(0, (b.debt || 0) - debtAmount) } : b
        );
      }

      const lastHistoryIndex = updatedMaintenanceHistory.findIndex(
        mh => mh.buildingId === action.payload && mh.maintenanceDate.substring(0, 7) === currentMonth
      );
      if (lastHistoryIndex !== -1) updatedMaintenanceHistory.splice(lastHistoryIndex, 1);

      const lastRecordIndex = updatedMaintenanceRecords.findIndex(
        mr => mr.buildingId === action.payload && mr.maintenanceDate.substring(0, 7) === currentMonth
      );
      if (lastRecordIndex !== -1) updatedMaintenanceRecords.splice(lastRecordIndex, 1);

      return {
        ...state,
        buildings: updatedBuildings,
        debtRecords: updatedDebtRecords,
        maintenanceHistory: updatedMaintenanceHistory,
        maintenanceRecords: updatedMaintenanceRecords,
        updates: [
          {
            id: uuidv4(),
            action: 'Bakım İptal Edildi',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${building.name} binasının son bakımı iptal edildi.`,
          },
          ...state.updates,
        ],
      };
    }

    case 'REVERT_MAINTENANCE': {
      const buildingId = action.payload;
      const building = state.buildings.find(b => b.id === buildingId);
      if (!building) return state;

      const latestMaintenanceRecord = state.maintenanceRecords
        .filter(mr => mr.buildingId === buildingId)
        .sort((a, b) => new Date(b.maintenanceDate + ' ' + b.maintenanceTime).getTime() - new Date(a.maintenanceDate + ' ' + a.maintenanceTime).getTime())
        .shift();

      if (!latestMaintenanceRecord) return state;

      const newMaintenanceRecords = state.maintenanceRecords.filter(mr => mr.id !== latestMaintenanceRecord.id);
      const newMaintenanceHistory = state.maintenanceHistory.filter(mh => mh.relatedRecordId !== latestMaintenanceRecord.id);
      const newDebtRecords = state.debtRecords.filter(dr => dr.relatedRecordId !== latestMaintenanceRecord.id);
      const newArchivedReceipts = state.archivedReceipts.filter(ar => ar.relatedRecordId !== latestMaintenanceRecord.id);
      const updatedBuildings = state.buildings.map(b =>
        b.id === buildingId
          ? { ...b, isMaintained: false, lastMaintenanceDate: undefined, lastMaintenanceTime: undefined, debt: Math.max(0, (b.debt || 0) - latestMaintenanceRecord.totalFee) }
          : b
      );

      return {
        ...state,
        buildings: updatedBuildings,
        maintenanceRecords: newMaintenanceRecords,
        maintenanceHistory: newMaintenanceHistory,
        debtRecords: newDebtRecords,
        archivedReceipts: newArchivedReceipts,
        updates: [
          {
            id: uuidv4(),
            action: 'Bakım Geri Alındı',
            user: state.currentUser?.name || 'Bilinmeyen',
            timestamp: new Date().toISOString(),
            details: `${building.name} binasının son bakımı geri alındı.`,
          },
          ...state.updates,
        ],
      };
    }

    case 'SHOW_PRINTER_SELECTION':
      return { ...state, showPrinterSelectionModal: true, printerSelectionContent: action.payload };

    case 'CLOSE_PRINTER_SELECTION':
      return { ...state, showPrinterSelectionModal: false, printerSelectionContent: null };

    case 'INCREASE_PRICES': {
      const percentage = action.payload;
      const updatedParts = state.parts.map(part => ({
        ...part,
        price: Math.round(part.price * (1 + percentage / 100) * 100) / 100,
      }));
      return {
        ...state,
        parts: updatedParts,
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
    }

    default:
      return state;
  }
}

// Bakım fişi HTML'ini oluşturan yardımcı fonksiyon
function generateMaintenanceReceipt(building: Building, state: AppState, technician: string): string {
  const currentDate = new Date().toLocaleDateString('tr-TR');
  const maintenanceFee = building.maintenanceFee * building.elevatorCount;
  const companyAddress = state.settings.companyAddress
    ? `${state.settings.companyAddress.mahalle} ${state.settings.companyAddress.sokak} No:${state.settings.companyAddress.binaNo}, ${state.settings.companyAddress.ilce}/${state.settings.companyAddress.il}`
    : 'Adres belirtilmemiş';
  const currentMonth = new Date().toISOString().substring(0, 7);
  const installedParts = [
    ...state.partInstallations.filter(pi => pi.buildingId === building.id && pi.installDate.substring(0, 7) === currentMonth),
    ...state.manualPartInstallations.filter(mpi => mpi.buildingId === building.id && mpi.installDate.substring(0, 7) === currentMonth),
  ];
  let partsSectionHtml = '';
  let totalPartsCost = 0;

  if (installedParts.length > 0) {
    const partsListHtml = installedParts
      .map(item => {
        if ('partId' in item) {
          const part = state.parts.find(p => p.id === item.partId);
          if (part) {
            const cost = part.price * item.quantity;
            totalPartsCost += cost;
            return `<li>${item.quantity} Adet ${part.name} - ${cost.toLocaleString('tr-TR')} ₺</li>`;
          }
        } else {
          totalPartsCost += item.totalPrice;
          return `<li>${item.quantity} Adet ${item.partName} - ${item.totalPrice.toLocaleString('tr-TR')} ₺</li>`;
        }
        return '';
      })
      .join('');
    partsSectionHtml = `
      <div class="parts-section">
        <div class="section-title">Takılan Parçalar</div>
        <ul class="parts-list">${partsListHtml}</ul>
        <p style="text-align:right;font-weight:bold;margin-top:10px">Parça Toplam: ${totalPartsCost.toLocaleString('tr-TR')} ₺</p>
      </div>
    `;
  }

  let maintenanceNoteSectionHtml = building.maintenanceNote && building.maintenanceNote.trim()
    ? `<div class="note-section"><h3>BAKIM NOTU</h3><p>${building.maintenanceNote}</p></div>`
    : '';

  let buildingCurrentDebtSectionHtml = building.debt > 0
    ? `<p class="building-current-debt">Binanın Güncel Borcu: ${building.debt.toLocaleString('tr-TR')} ₺</p>`
    : '';

  const finalTotalAmount = maintenanceFee + totalPartsCost;
  let htmlContent = state.settings.receiptTemplate || '';

  htmlContent = htmlContent
    .replace(/{{LOGO_WATERMARK_URL}}/g, state.settings.logo || '')
    .replace(/{{CE_EMBLEM}}/g, state.settings.ceEmblemUrl ? `<img src="${state.settings.ceEmblemUrl}" alt="CE Amblemi">` : '')
    .replace(/{{TSE_EMBLEM}}/g, state.settings.tseEmblemUrl ? `<img src="${state.settings.tseEmblemUrl}" alt="TSE Amblemi">` : '')
    .replace(/{{LOGO}}/g, state.settings.logo ? `<img src="${state.settings.logo}" alt="Logo" class="logo">` : '')
    .replace(/{{COMPANY_NAME}}/g, state.settings.companyName)
    .replace(/{{COMPANY_PHONE}}/g, state.settings.companyPhone)
    .replace(/{{COMPANY_ADDRESS}}/g, companyAddress)
    .replace(/{{BUILDING_NAME}}/g, building.name)
    .replace(/{{DATE}}/g, currentDate)
    .replace(/{{MAINTENANCE_FEE_CALCULATED}}/g, `${maintenanceFee.toLocaleString('tr-TR')} ₺`)
    .replace(/{{TECHNICIAN_NAME}}/g, technician)
    .replace(/{{PARTS_SECTION}}/g, partsSectionHtml)
    .replace(/{{MAINTENANCE_NOTE_SECTION}}/g, maintenanceNoteSectionHtml)
    .replace(/{{FINAL_TOTAL_AMOUNT}}/g, `${finalTotalAmount.toLocaleString('tr-TR')} ₺`)
    .replace(/{{BUILDING_CURRENT_DEBT_SECTION}}/g, buildingCurrentDebtSectionHtml)
    .replace(/{{DEBT_SECTION}}/g, '');

  return htmlContent;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);
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
  showArchivedReceipt: (receiptId: string) => void;
  removeMaintenanceStatusMark: (buildingId: string) => void;
  cancelMaintenance: (buildingId: string) => void;
  revertMaintenance: (buildingId: string) => void;
  getLatestArchivedReceiptHtml: (buildingId: string) => string | null;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // State değişikliklerini izlemek için debug
  useEffect(() => {
    console.log('State güncellendi:', { notifications: state.notifications, unreadNotifications: state.unreadNotifications });
  }, [state.notifications, state.unreadNotifications]);

  const addBuilding = (building: Omit<Building, 'id'>) => dispatch({ type: 'ADD_BUILDING', payload: building });
  const updateBuilding = (building: Building) => dispatch({ type: 'UPDATE_BUILDING', payload: building });
  const deleteBuilding = (id: string) => dispatch({ type: 'DELETE_BUILDING', payload: id });
  const addPart = (part: Omit<Part, 'id'>) => dispatch({ type: 'ADD_PART', payload: part });
  const updatePart = (part: Part) => dispatch({ type: 'UPDATE_PART', payload: part });
  const deletePart = (id: string) => dispatch({ type: 'DELETE_PART', payload: id });
  const installPart = (installation: Omit<PartInstallation, 'id' | 'installedBy'>) => dispatch({ type: 'INSTALL_PART', payload: installation });
  const installManualPart = (installation: Omit<ManualPartInstallation, 'id' | 'installedBy'>) => dispatch({ type: 'INSTALL_MANUAL_PART', payload: installation });
  const markPartAsPaid = (installationId: string, isManual: boolean) => dispatch({ type: 'MARK_PART_AS_PAID', payload: { installationId, isManual } });
  const addUpdate = (update: Omit<Update, 'id' | 'timestamp'>) => dispatch({ type: 'ADD_UPDATE', payload: update });
  const addIncome = (income: Omit<Income, 'id'>) => dispatch({ type: 'ADD_INCOME', payload: income });
  const setUser = (name: string) => dispatch({ type: 'SET_USER', payload: name });
  const deleteUser = (id: string) => dispatch({ type: 'DELETE_USER', payload: id });
  const addNotification = (notification: string) => {
    console.log('addNotification çağrıldı:', notification, 'Mevcut state:', state.unreadNotifications);
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };
  const clearNotifications = () => {
    console.log('clearNotifications çağrıldı, Mevcut state:', state.unreadNotifications);
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const toggleMaintenance = (buildingId: string, showReceipt = false) => dispatch({ type: 'TOGGLE_MAINTENANCE', payload: { buildingId, showReceipt } });
  const reportFault = (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) =>
    dispatch({ type: 'REPORT_FAULT', payload: { buildingId, faultData } });
  const updateSettings = (settings: Partial<AppState['settings']>) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  const resetMaintenanceStatus = () => dispatch({ type: 'RESET_MAINTENANCE_STATUS' });
  const addFaultReport = (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) =>
    dispatch({ type: 'ADD_FAULT_REPORT', payload: { buildingId, reporterName, reporterSurname, reporterPhone, apartmentNo, description } });
  const resolveFaultReport = (id: string) => dispatch({ type: 'RESOLVE_FAULT_REPORT', payload: id });
  const addMaintenanceHistory = (history: Omit<MaintenanceHistory, 'id'>) => dispatch({ type: 'ADD_MAINTENANCE_HISTORY', payload: history });
  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => dispatch({ type: 'ADD_MAINTENANCE_RECORD', payload: record });
  const addPrinter = (printer: Omit<Printer, 'id'>) => dispatch({ type: 'ADD_PRINTER', payload: printer });
  const updatePrinter = (printer: Printer) => dispatch({ type: 'UPDATE_PRINTER', payload: printer });
  const deletePrinter = (id: string) => dispatch({ type: 'DELETE_PRINTER', payload: id });
  const addSMSTemplate = (template: Omit<SMSTemplate, 'id'>) => dispatch({ type: 'ADD_SMS_TEMPLATE', payload: template });
  const updateSMSTemplate = (template: SMSTemplate) => dispatch({ type: 'UPDATE_SMS_TEMPLATE', payload: template });
  const deleteSMSTemplate = (id: string) => dispatch({ type: 'DELETE_SMS_TEMPLATE', payload: id });
  const sendBulkSMS = (templateId: string, buildingIds: string[]) => dispatch({ type: 'SEND_BULK_SMS', payload: { templateId, buildingIds } });
  const sendWhatsApp = (templateId: string, buildingIds: string[]) => dispatch({ type: 'SEND_WHATSAPP', payload: { templateId, buildingIds } });
  const addProposal = (proposal: Omit<Proposal, 'id' | 'createdDate' | 'createdBy'>) => dispatch({ type: 'ADD_PROPOSAL', payload: proposal });
  const updateProposal = (proposal: Proposal) => dispatch({ type: 'UPDATE_PROPOSAL', payload: proposal });
  const deleteProposal = (id: string) => dispatch({ type: 'DELETE_PROPOSAL', payload: id });
  const addPayment = (payment: Omit<Payment, 'id'>) => dispatch({ type: 'ADD_PAYMENT', payload: payment });
  const addProposalTemplate = (template: Omit<ProposalTemplate, 'id'>) => dispatch({ type: 'ADD_PROPOSAL_TEMPLATE', payload: template });
  const updateProposalTemplate = (template: ProposalTemplate) => dispatch({ type: 'UPDATE_PROPOSAL_TEMPLATE', payload: template });
  const deleteProposalTemplate = (id: string) => dispatch({ type: 'DELETE_PROPOSAL_TEMPLATE', payload: id });
  const addQRCodeData = (qrData: Omit<QRCodeData, 'id'>) => dispatch({ type: 'ADD_QR_CODE_DATA', payload: qrData });
  const updateAutoSaveData = (data: AutoSaveData) => dispatch({ type: 'UPDATE_AUTO_SAVE_DATA', payload: data });
  const showReceiptModal = (htmlContent: string) => dispatch({ type: 'SHOW_RECEIPT_MODAL', payload: htmlContent });
  const closeReceiptModal = () => dispatch({ type: 'CLOSE_RECEIPT_MODAL' });
  const archiveReceipt = (receipt: Omit<ArchivedReceipt, 'id'>) => dispatch({ type: 'ARCHIVE_RECEIPT', payload: receipt });
  const showPrinterSelection = (content: string) => dispatch({ type: 'SHOW_PRINTER_SELECTION', payload: content });
  const closePrinterSelection = () => dispatch({ type: 'CLOSE_PRINTER_SELECTION' });
  const increasePrices = (percentage: number) => dispatch({ type: 'INCREASE_PRICES', payload: percentage });
  const showArchivedReceipt = (receiptId: string) => dispatch({ type: 'SHOW_ARCHIVED_RECEIPT', payload: receiptId });
  const removeMaintenanceStatusMark = (buildingId: string) => dispatch({ type: 'REMOVE_MAINTENANCE_STATUS_MARK', payload: buildingId });
  const cancelMaintenance = (buildingId: string) => dispatch({ type: 'CANCEL_MAINTENANCE', payload: buildingId });
  const revertMaintenance = (buildingId: string) => dispatch({ type: 'REVERT_MAINTENANCE', payload: buildingId });

  const getLatestArchivedReceiptHtml = useCallback(
    (buildingId: string): string | null => {
      const latestReceipt = state.archivedReceipts
        .filter(ar => ar.buildingId === buildingId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .shift();
      return latestReceipt ? latestReceipt.htmlContent : null;
    },
    [state.archivedReceipts]
  );

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
        getLatestArchivedReceiptHtml,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};