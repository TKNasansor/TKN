import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Building, Part, PartInstallation, ManualPartInstallation, Update, Income, User, AppSettings, FaultReport, MaintenanceReceipt, MaintenanceHistory, Printer, MaintenanceRecord, SMSTemplate, Proposal, ProposalItem, Payment, DebtRecord, ProposalTemplate, ProposalField, AutoSaveData } from '../types';

const initialSettings: AppSettings = {
  appTitle: 'Asansör Bakım Takip',
  logo: null,
  companyName: 'Asansör Bakım Servisi',
  companyPhone: '0555 123 45 67',
  companyAddress: {
    mahalle: 'Merkez Mahalle',
    sokak: 'Ana Cadde',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    binaNo: '123'
  },
  autoSaveInterval: 60,
  receiptTemplate: `
    <div class="receipt">
      <div class="header">
        <div class="company-info">
          <div class="logo-section">
            {{LOGO}}
          </div>
          <div class="company-details">
            <div class="company-name">{{COMPANY_NAME}}</div>
            <div class="certifications">{{CE_EMBLEM}} | {{TSE_EMBLEM}}</div>
          </div>
        </div>
        <div class="address-info">
          <div class="address-label">Firma Adresi:</div>
          <div class="address-text">{{COMPANY_ADDRESS}}</div>
          <div class="phone-text">{{COMPANY_PHONE}}</div>
          <div class="date-info">
            <strong>Tarih:</strong> {{DATE}}
          </div>
        </div>
      </div>
      
      <div class="section-title">YAPILAN İŞLEMLER</div>
      
      <div class="maintenance-info">
        <div class="info-row">
          <span class="label">Bina Adı:</span>
          <span class="value">{{BUILDING_NAME}}</span>
        </div>
        <div class="info-row">
          <span class="label">Adres:</span>
          <span class="value">{{BUILDING_ADDRESS}}</span>
        </div>
        <div class="info-row">
          <span class="label">Asansör Sayısı:</span>
          <span class="value">{{ELEVATOR_COUNT}} adet</span>
        </div>
        <div class="info-row">
          <span class="label">İşlem:</span>
          <span class="value">{{MAINTENANCE_ACTION}}</span>
        </div>
        <div class="info-row">
          <span class="label">Teknisyen:</span>
          <span class="value">{{TECHNICIAN}}</span>
        </div>
        <div class="info-row">
          <span class="label">Bakım Ücreti:</span>
          <span class="value">{{MAINTENANCE_FEE}}</span>
        </div>
      </div>
      
      {{PARTS_SECTION}}
      {{DEBT_SECTION}}
      
      <div class="total-section">
        TOPLAM TUTAR: {{TOTAL_AMOUNT}}
      </div>
      
      <div class="warnings">
        <div class="warning-title">ÖNEMLI UYARILAR</div>
        <div class="warning-text">
          <strong>NOT:</strong> Bu bakımdan sonra meydana gelebilecek kapı camı kırılması, tavan aydınlatmasının kırılması durumlarında durumu hemen firmamıza bildiriniz, kırık kapı camı ile asansörü çalıştırmayınız. Aksi takdirde olabilecek durumlardan firmamız sorumlu olmayacaktır.
        </div>
        <div class="warning-text">
          <strong>DİKKAT:</strong> Asansör bakımı esnasında değiştirilmesi önerilen parçaların apartman yönetimi tarafından parça değişimine onay verilmemesi durumunda doğacak aksaklık ve kazalardan firmamız sorumlu değildir.
        </div>
      </div>
      
      <div class="footer">
        <div class="thank-you">Teşekkür ederiz</div>
      </div>
    </div>
  `,
  installationProposalTemplate: `
    <div class="proposal">
      <div class="header">
        <div class="company-name">{{COMPANY_NAME}}</div>
        <div class="proposal-title">MONTAJ TEKLİFİ</div>
      </div>
      
      <div class="content">
        <h2>{{PROPOSAL_TITLE}}</h2>
        
        <div class="building-info">
          <strong>Bina:</strong> {{BUILDING_NAME}}<br>
          <strong>Tarih:</strong> {{DATE}}<br>
          <strong>Hazırlayan:</strong> {{CREATED_BY}}
        </div>
        
        <p>{{DESCRIPTION}}</p>
        
        {{CUSTOM_FIELDS}}
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Açıklama</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {{ITEMS}}
          </tbody>
        </table>
        
        <div class="total">
          Toplam Tutar: {{TOTAL_AMOUNT}}
        </div>
      </div>
      
      <div class="footer">
        <p>Bu teklif 30 gün geçerlidir.</p>
        <p>{{COMPANY_PHONE}}</p>
      </div>
    </div>
  `,
  maintenanceProposalTemplate: `
    <div class="proposal">
      <div class="header">
        <div class="company-name">{{COMPANY_NAME}}</div>
        <div class="proposal-title">BAKIM SÖZLEŞMESİ</div>
      </div>
      
      <div class="content">
        <h2>{{PROPOSAL_TITLE}}</h2>
        
        <div class="building-info">
          <strong>Bina:</strong> {{BUILDING_NAME}}<br>
          <strong>Tarih:</strong> {{DATE}}<br>
          <strong>Hazırlayan:</strong> {{CREATED_BY}}
        </div>
        
        <p>{{DESCRIPTION}}</p>
        
        {{CUSTOM_FIELDS}}
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Hizmet</th>
              <th>Süre</th>
              <th>Aylık Ücret</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {{ITEMS}}
          </tbody>
        </table>
        
        <div class="total">
          Toplam Tutar: {{TOTAL_AMOUNT}}
        </div>
      </div>
      
      <div class="footer">
        <p>Bu sözleşme 12 ay geçerlidir.</p>
        <p>{{COMPANY_PHONE}}</p>
      </div>
    </div>
  `,
  revisionProposalTemplate: `
    <div class="proposal">
      <div class="header">
        <div class="company-name">{{COMPANY_NAME}}</div>
        <div class="proposal-title">REVİZYON TEKLİFİ</div>
      </div>
      
      <div class="content">
        <h2>{{PROPOSAL_TITLE}}</h2>
        
        <div class="building-info">
          <strong>Bina:</strong> {{BUILDING_NAME}}<br>
          <strong>Tarih:</strong> {{DATE}}<br>
          <strong>Hazırlayan:</strong> {{CREATED_BY}}
        </div>
        
        <p>{{DESCRIPTION}}</p>
        
        {{CUSTOM_FIELDS}}
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Revizyon İşlemi</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {{ITEMS}}
          </tbody>
        </table>
        
        <div class="total">
          Toplam Tutar: {{TOTAL_AMOUNT}}
        </div>
      </div>
      
      <div class="footer">
        <p>Bu teklif 45 gün geçerlidir.</p>
        <p>{{COMPANY_PHONE}}</p>
      </div>
    </div>
  `,
  faultReportTemplate: `
    <div class="fault-report">
      <div class="header">
        <div class="logo-section">
          {{LOGO}}
        </div>
        <div class="company-details">
          <div class="company-name">{{COMPANY_NAME}}</div>
          <div class="certifications">{{CE_EMBLEM}} | {{TSE_EMBLEM}}</div>
        </div>
        <div class="address-info">
          <div class="address-text">{{COMPANY_ADDRESS}}</div>
          <div class="phone-text">{{COMPANY_PHONE}}</div>
        </div>
      </div>
      
      <div class="report-title">
        <h1>Asansör Arıza Bildirimi</h1>
      </div>
      
      <div class="building-info">
        <h2>{{BUILDING_NAME}}</h2>
        <p>{{BUILDING_ADDRESS}}</p>
      </div>
      
      <div class="form-section">
        <div class="field">
          <label>Ad Soyad:</label>
          <span>{{REPORTER_NAME}}</span>
        </div>
        <div class="field">
          <label>Telefon:</label>
          <span>{{REPORTER_PHONE}}</span>
        </div>
        <div class="field">
          <label>Daire No:</label>
          <span>{{APARTMENT_NO}}</span>
        </div>
        <div class="field">
          <label>Arıza Açıklaması:</label>
          <p>{{DESCRIPTION}}</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Acil durumlar için 112'yi arayın.</p>
        <p>{{COMPANY_PHONE}}</p>
      </div>
    </div>
  `
};

const sampleParts = [
  { name: 'Asansör Kapı Motoru', quantity: 5, price: 2500 },
  { name: 'Fren Balata Takımı', quantity: 10, price: 450 },
  { name: 'Kabin Lambası LED', quantity: 20, price: 85 },
  { name: 'Emniyet Şalteri', quantity: 8, price: 320 },
  { name: 'Kapı Sensörü', quantity: 12, price: 180 },
  { name: 'Kontrol Kartı', quantity: 3, price: 1200 },
  { name: 'Asansör Halatı (1m)', quantity: 50, price: 25 },
  { name: 'Kat Butonu', quantity: 15, price: 65 }
];

const initialProposalTemplates: ProposalTemplate[] = [
  {
    id: 'installation-template-1',
    type: 'installation',
    name: 'Standart Montaj Teklifi',
    content: '',
    fields: [
      { id: 'elevator_type', name: 'elevator_type', label: 'Asansör Tipi', type: 'text', required: true, placeholder: 'Yolcu asansörü' },
      { id: 'capacity', name: 'capacity', label: 'Kapasite (kg)', type: 'number', required: true, placeholder: '630' },
      { id: 'floors', name: 'floors', label: 'Kat Sayısı', type: 'number', required: true, placeholder: '5' },
      { id: 'installation_time', name: 'installation_time', label: 'Montaj Süresi', type: 'text', required: false, placeholder: '15 gün' }
    ]
  },
  {
    id: 'maintenance-template-1',
    type: 'maintenance',
    name: 'Standart Bakım Sözleşmesi',
    content: '',
    fields: [
      { id: 'contract_duration', name: 'contract_duration', label: 'Sözleşme Süresi', type: 'text', required: true, placeholder: '12 ay' },
      { id: 'visit_frequency', name: 'visit_frequency', label: 'Ziyaret Sıklığı', type: 'text', required: true, placeholder: 'Ayda 1 kez' },
      { id: 'emergency_service', name: 'emergency_service', label: 'Acil Servis', type: 'text', required: false, placeholder: '7/24' }
    ]
  },
  {
    id: 'revision-template-1',
    type: 'revision',
    name: 'Standart Revizyon Teklifi',
    content: '',
    fields: [
      { id: 'current_age', name: 'current_age', label: 'Mevcut Asansör Yaşı', type: 'number', required: true, placeholder: '15' },
      { id: 'revision_scope', name: 'revision_scope', label: 'Revizyon Kapsamı', type: 'textarea', required: true, placeholder: 'Makine dairesi yenileme, kabin modernizasyonu' },
      { id: 'completion_time', name: 'completion_time', label: 'Tamamlanma Süresi', type: 'text', required: false, placeholder: '30 gün' }
    ]
  }
];

const initialAppState: AppState = {
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
  settings: initialSettings,
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
  proposalTemplates: initialProposalTemplates,
  qrCodes: [],
  systemNotifications: [],
  autoSaveData: [],
  hasUnsavedChanges: false,
  isAutoSaving: false,
  showReceiptModal: false,
  receiptModalHtml: null,
};

interface AppContextProps {
  state: AppState;
  setUser: (name: string) => void;
  deleteUser: (userId: string) => void;
  addBuilding: (building: Omit<Building, 'id'>) => void;
  updateBuilding: (building: Building) => void;
  deleteBuilding: (id: string) => void;
  toggleMaintenance: (id: string, showReceipt?: boolean) => void;
  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  increasePrices: (percentage: number) => void;
  installPart: (installation: Omit<PartInstallation, 'id' | 'installedBy'>) => void;
  installManualPart: (installation: Omit<ManualPartInstallation, 'id' | 'installedBy'>) => void;
  markPartAsPaid: (installationId: string, isManual: boolean) => void;
  payDebt: (buildingId: string, amount: number) => void;
  toggleSidebar: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addFaultReport: (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => void;
  resolveFaultReport: (faultReportId: string) => void;
  printMaintenanceReceipt: (buildingId: string) => void;
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  updatePrinter: (printer: Printer) => void;
  deletePrinter: (id: string) => void;
  clearNotifications: () => void;
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
  reportFault: (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) => void;
  updateAutoSaveData: (data: AutoSaveData) => void;
  openReceiptModal: (html: string) => void;
  closeReceiptModal: () => void;
  addQRCodeData: (qrCodeData: any) => void;
  showPrinterSelection: (htmlContent: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Migrate old data structures
      const migratedBuildings = parsedState.buildings?.map((building: any) => {
        if (typeof building.address === 'string') {
          return {
            ...building,
            address: {
              mahalle: '',
              sokak: '',
              il: '',
              ilce: '',
              binaNo: ''
            },
            elevatorCount: building.elevatorCount || 1,
            label: building.label || null
          };
        }
        return {
          ...building,
          elevatorCount: building.elevatorCount || 1,
          label: building.label || null
        };
      }) || [];
      
      return {
        ...initialAppState,
        ...parsedState,
        buildings: migratedBuildings,
        settings: {
          ...initialSettings,
          ...parsedState.settings,
          companyAddress: parsedState.settings?.companyAddress || initialSettings.companyAddress,
          installationProposalTemplate: parsedState.settings?.installationProposalTemplate || initialSettings.installationProposalTemplate,
          maintenanceProposalTemplate: parsedState.settings?.maintenanceProposalTemplate || initialSettings.maintenanceProposalTemplate,
          revisionProposalTemplate: parsedState.settings?.revisionProposalTemplate || initialSettings.revisionProposalTemplate
        },
        maintenanceRecords: parsedState.maintenanceRecords || [],
        smsTemplates: parsedState.smsTemplates || [],
        proposals: parsedState.proposals || [],
        payments: parsedState.payments || [],
        manualPartInstallations: parsedState.manualPartInstallations || [],
        debtRecords: parsedState.debtRecords || [],
        proposalTemplates: parsedState.proposalTemplates || initialProposalTemplates,
        showReceiptModal: false,
        receiptModalHtml: null,
      };
    }
    return initialAppState;
  });

  // Initialize sample parts if none exist
  useEffect(() => {
    if (state.parts.length === 0) {
      setState(prev => ({
        ...prev,
        parts: sampleParts.map(part => ({ ...part, id: uuidv4() }))
      }));
    }
  }, []);

  // Check for monthly maintenance reset
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    
    if (state.lastMaintenanceReset !== currentMonth) {
      setState(prev => ({
        ...prev,
        buildings: prev.buildings.map(building => ({
          ...building,
          isMaintained: false
        })),
        lastMaintenanceReset: currentMonth,
        notifications: [
          'Aylık bakım durumu sıfırlandı',
          ...prev.notifications
        ],
        unreadNotifications: prev.unreadNotifications + 1
      }));
    }
  }, [state.lastMaintenanceReset]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);

  const addDebtRecord = (buildingId: string, type: 'maintenance' | 'part' | 'payment', description: string, amount: number, performedBy?: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const debtRecord: DebtRecord = {
      id: uuidv4(),
      buildingId,
      date: new Date().toISOString(),
      type,
      description,
      amount,
      previousDebt: building.debt,
      newDebt: type === 'payment' ? building.debt - amount : building.debt + amount,
      performedBy
    };

    setState(prev => ({
      ...prev,
      debtRecords: [debtRecord, ...prev.debtRecords]
    }));
  };

  const addUpdate = (action: string, details: string) => {
    if (!state.currentUser) return;
    
    const update = {
      id: uuidv4(),
      action,
      user: state.currentUser.name,
      timestamp: new Date().toISOString(),
      details,
    };
    
    setState(prev => ({
      ...prev,
      updates: [update, ...prev.updates],
      notifications: [details, ...prev.notifications],
      unreadNotifications: prev.unreadNotifications + 1,
    }));
  };

  const setUser = (name: string) => {
    const existingUser = state.users.find(user => user.name === name);
    
    if (existingUser) {
      setState(prev => ({
        ...prev,
        currentUser: existingUser,
      }));
    } else {
      const newUser = { id: uuidv4(), name };
      setState(prev => ({
        ...prev,
        currentUser: newUser,
        users: [...prev.users, newUser],
      }));
    }
  };

  const deleteUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId),
    }));
    
    addUpdate('Kullanıcı Silindi', `Kullanıcı silindi`);
  };

  const addBuilding = (building: Omit<Building, 'id'>) => {
    const newBuilding = {
      ...building,
      id: uuidv4(),
      elevatorCount: building.elevatorCount || 1,
      label: building.label || null
    };
    
    setState(prev => ({
      ...prev,
      buildings: [...prev.buildings, newBuilding],
    }));

    // Add initial debt record if there's debt
    if (building.debt > 0) {
      addDebtRecord(newBuilding.id, 'maintenance', 'Başlangıç borcu', building.debt);
    }
    
    addUpdate('Bina Eklendi', `${newBuilding.name} eklendi`);
  };

  const updateBuilding = (building: Building) => {
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === building.id ? building : b
      ),
    }));
    
    addUpdate('Bina Güncellendi', `${building.name} güncellendi`);
  };

  const deleteBuilding = (id: string) => {
    const building = state.buildings.find(b => b.id === id);
    if (!building) return;
    
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.filter(b => b.id !== id),
    }));
    
    addUpdate('Bina Silindi', `${building.name} silindi`);
  };

  const toggleMaintenance = (id: string, showReceipt: boolean = false) => {
    const building = state.buildings.find(b => b.id === id);
    if (!building || !state.currentUser) return;
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    
    // Check if maintenance was already done this month
    const lastMaintenanceMonth = building.lastMaintenanceDate 
      ? `${new Date(building.lastMaintenanceDate).getFullYear()}-${new Date(building.lastMaintenanceDate).getMonth()}`
      : null;
    
    const isMaintained = !building.isMaintained;
    const lastMaintenanceDate = isMaintained ? now.toISOString() : building.lastMaintenanceDate;
    const lastMaintenanceTime = isMaintained ? now.toLocaleTimeString('tr-TR') : building.lastMaintenanceTime;
    
    let debt = building.debt;
    let maintenanceHistory = [...state.maintenanceHistory];
    let maintenanceRecords = [...state.maintenanceRecords];
    
    // Only add debt if it's the first time this month (but don't add to income)
    if (isMaintained && lastMaintenanceMonth !== currentMonth) {
      const totalMaintenanceFee = building.maintenanceFee * building.elevatorCount;
      debt += totalMaintenanceFee;

      // Add debt record
      addDebtRecord(building.id, 'maintenance', `Bakım ücreti (${building.elevatorCount} asansör)`, totalMaintenanceFee, state.currentUser.name);

      // Add to maintenance history
      const maintenanceRecord: MaintenanceHistory = {
        id: uuidv4(),
        buildingId: building.id,
        maintenanceDate: now.toISOString(),
        maintenanceTime: now.toLocaleTimeString('tr-TR'),
        performedBy: state.currentUser.name,
        maintenanceFee: totalMaintenanceFee,
        notes: `${building.name} bakım işlemi tamamlandı (${building.elevatorCount} asansör)`
      };

      maintenanceHistory = [maintenanceRecord, ...maintenanceHistory];

      // Add to maintenance records for tracking
      const record: MaintenanceRecord = {
        id: uuidv4(),
        buildingId: building.id,
        performedBy: state.currentUser.name,
        maintenanceDate: now.toISOString(),
        maintenanceTime: now.toLocaleTimeString('tr-TR'),
        elevatorCount: building.elevatorCount,
        totalFee: totalMaintenanceFee,
        status: 'completed',
        priority: 'medium',
        searchableText: `${building.name} ${state.currentUser.name} bakım`
      };

      maintenanceRecords = [record, ...maintenanceRecords];
    }
    
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === id 
          ? { ...b, isMaintained, lastMaintenanceDate, lastMaintenanceTime, debt }
          : b
      ),
      maintenanceHistory,
      maintenanceRecords,
    }));
    
    if (showReceipt && isMaintained) {
      // Show receipt preview
      showReceiptPreview(id);
    }
    
    addUpdate(
      'Bakım Durumu Değişti', 
      `${building.name} bakım durumu ${isMaintained ? 'yapıldı' : 'yapılmadı'} olarak güncellendi`
    );
  };

  const showReceiptPreview = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building || !state.currentUser) return;

    const now = new Date();
    
    // Get current month parts for this building
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyParts = state.partInstallations.filter(installation => {
      const installDate = new Date(installation.installDate);
      return installation.buildingId === buildingId &&
             installDate.getMonth() === currentMonth &&
             installDate.getFullYear() === currentYear;
    });

    const monthlyManualParts = state.manualPartInstallations.filter(installation => {
      const installDate = new Date(installation.installDate);
      return installation.buildingId === buildingId &&
             installDate.getMonth() === currentMonth &&
             installDate.getFullYear() === currentYear;
    });

    // Create full address string
    const fullAddress = building.address ? 
      `${building.address.mahalle} ${building.address.sokak} ${building.address.binaNo}, ${building.address.ilce}/${building.address.il}` : 
      'Adres belirtilmemiş';

    const companyAddress = state.settings?.companyAddress ? 
      `${state.settings.companyAddress.mahalle} ${state.settings.companyAddress.sokak} ${state.settings.companyAddress.binaNo}, ${state.settings.companyAddress.ilce}/${state.settings.companyAddress.il}` : 
      'Adres belirtilmemiş';

    const totalMaintenanceFee = building.maintenanceFee * building.elevatorCount;
    const partsTotal = monthlyParts.reduce((sum, installation) => {
      const part = state.parts.find(p => p.id === installation.partId);
      return sum + (part ? part.price * installation.quantity : 0);
    }, 0) + monthlyManualParts.reduce((sum, installation) => sum + installation.totalPrice, 0);
    
    const grandTotal = totalMaintenanceFee + partsTotal + building.debt;

    // Create receipt content using template
    let receiptContent = state.settings?.receiptTemplate || initialSettings.receiptTemplate;
    
    // Replace template variables
    receiptContent = receiptContent
      .replace(/{{LOGO}}/g, state.settings?.logo ? `<img src="${state.settings.logo}" alt="Logo" class="logo">` : '')
      .replace(/{{COMPANY_NAME}}/g, state.settings?.companyName || 'Asansör Bakım Servisi')
      .replace(/{{COMPANY_ADDRESS}}/g, companyAddress)
      .replace(/{{COMPANY_PHONE}}/g, state.settings?.companyPhone || '0555 123 45 67')
      .replace(/{{DATE}}/g, now.toLocaleDateString('tr-TR'))
      .replace(/{{BUILDING_NAME}}/g, building.name)
      .replace(/{{BUILDING_ADDRESS}}/g, fullAddress)
      .replace(/{{ELEVATOR_COUNT}}/g, building.elevatorCount.toString())
      .replace(/{{MAINTENANCE_ACTION}}/g, building.elevatorCount > 1 ? 'Bakımlar Yapıldı' : 'Bakım Yapıldı')
      .replace(/{{TECHNICIAN}}/g, state.currentUser.name)
      .replace(/{{MAINTENANCE_FEE}}/g, `${building.elevatorCount} x ${building.maintenanceFee.toLocaleString('tr-TR')} ₺ = ${totalMaintenanceFee.toLocaleString('tr-TR')} ₺`)
      .replace(/{{TOTAL_AMOUNT}}/g, `${grandTotal.toLocaleString('tr-TR')} ₺`);

    // Handle parts section
    let partsSection = '';
    if (monthlyParts.length > 0 || monthlyManualParts.length > 0) {
      partsSection = `
        <div class="parts-section">
          <div class="parts-title">Kullanılan Parçalar:</div>
          ${monthlyParts.map(installation => {
            const part = state.parts.find(p => p.id === installation.partId);
            return part ? `
              <div class="part-item">
                <span><strong>${part.name}</strong> - ${installation.quantity} adet</span>
                <span>${(part.price * installation.quantity).toLocaleString('tr-TR')} ₺</span>
              </div>
            ` : '';
          }).join('')}
          ${monthlyManualParts.map(installation => `
            <div class="part-item">
              <span><strong>${installation.partName}</strong> - ${installation.quantity} adet</span>
              <span>${installation.totalPrice.toLocaleString('tr-TR')} ₺</span>
            </div>
          `).join('')}
          <div class="part-item" style="border-top: 2px solid #333; margin-top: 10px; padding-top: 10px;">
            <span><strong>Parça Toplam:</strong></span>
            <span><strong>${partsTotal.toLocaleString('tr-TR')} ₺</strong></span>
          </div>
        </div>
      `;
    }

    // Handle debt section
    let debtSection = '';
    if (building.debt > 0) {
      debtSection = `
        <div class="parts-section">
          <div class="info-row">
            <span class="label">Önceki Borç:</span>
            <span class="value">${building.debt.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>
      `;
    }

    receiptContent = receiptContent
      .replace(/{{PARTS_SECTION}}/g, partsSection)
      .replace(/{{DEBT_SECTION}}/g, debtSection);

    const fullReceiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bakım Fişi - ${building.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: #f5f5f5;
            }
            .receipt {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-info {
              flex: 1;
              text-align: center;
            }
            .logo-section {
              margin-bottom: 15px;
            }
            .logo { 
              max-height: 80px; 
              max-width: 200px;
              margin: 0 auto;
              display: block;
            }
            .company-details {
              text-align: center;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #333; 
              margin: 15px 0 10px 0;
            }
            .certifications {
              font-size: 14px;
              color: #666;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .address-info {
              text-align: right;
              font-size: 14px;
              color: #333;
              min-width: 200px;
            }
            .address-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .address-text {
              margin-bottom: 5px;
              line-height: 1.4;
            }
            .phone-text {
              margin-bottom: 10px;
              font-weight: bold;
            }
            .date-info {
              font-size: 16px;
              font-weight: bold;
            }
            .content { 
              margin-bottom: 30px; 
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0 15px 0;
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .maintenance-info {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            .label { 
              font-weight: bold; 
              color: #333; 
            }
            .value { 
              color: #666; 
            }
            .parts-section {
              margin: 20px 0;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .parts-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .part-item {
              margin: 5px 0;
              padding: 5px 0;
              border-bottom: 1px dotted #ddd;
              display: flex;
              justify-content: space-between;
            }
            .total-section {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              background: #eff6ff;
              border-radius: 5px;
              border: 2px solid #2563eb;
            }
            .warnings {
              margin-top: 30px;
              padding: 20px;
              background: #fef3c7;
              border-radius: 5px;
              border-left: 4px solid #f59e0b;
            }
            .warning-title {
              font-size: 18px;
              font-weight: bold;
              color: #92400e;
              margin-bottom: 15px;
              text-align: center;
            }
            .warning-text {
              font-size: 14px;
              color: #92400e;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .footer { 
              border-top: 2px solid #333; 
              padding-top: 20px; 
              text-align: center; 
              margin-top: 30px;
            }
            .thank-you {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            @media print {
              body { background: white; }
              .receipt { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `;

    // Open receipt modal
    openReceiptModal(fullReceiptHTML);

    // Save receipt to history
    const receipt: MaintenanceReceipt = {
      id: uuidv4(),
      buildingId,
      maintenanceDate: now.toISOString(),
      maintenanceTime: now.toLocaleTimeString('tr-TR'),
      performedBy: state.currentUser.name,
      maintenanceFee: totalMaintenanceFee,
      notes: `${building.name} bakım fişi oluşturuldu`
    };

    setState(prev => ({
      ...prev,
      maintenanceReceipts: [receipt, ...prev.maintenanceReceipts]
    }));

    addUpdate('Bakım Fişi Oluşturuldu', `${building.name} için bakım fişi oluşturuldu`);
  };

  const openReceiptModal = (html: string) => {
    setState(prev => ({
      ...prev,
      showReceiptModal: true,
      receiptModalHtml: html
    }));
  };

  const closeReceiptModal = () => {
    setState(prev => ({
      ...prev,
      showReceiptModal: false,
      receiptModalHtml: null
    }));
  };

  const addPart = (part: Omit<Part, 'id'>) => {
    const newPart = {
      ...part,
      id: uuidv4(),
    };
    
    setState(prev => ({
      ...prev,
      parts: [...prev.parts, newPart],
    }));
    
    addUpdate('Parça Eklendi', `${newPart.name} eklendi`);
  };

  const updatePart = (part: Part) => {
    setState(prev => ({
      ...prev,
      parts: prev.parts.map(p => 
        p.id === part.id ? part : p
      ),
    }));
    
    addUpdate('Parça Güncellendi', `${part.name} güncellendi`);
  };

  const deletePart = (id: string) => {
    const part = state.parts.find(p => p.id === id);
    if (!part) return;
    
    setState(prev => ({
      ...prev,
      parts: prev.parts.filter(p => p.id !== id),
    }));
    
    addUpdate('Parça Silindi', `${part.name} silindi`);
  };

  const increasePrices = (percentage: number) => {
    if (percentage <= 0) return;
    
    setState(prev => ({
      ...prev,
      parts: prev.parts.map(p => ({
        ...p,
        price: Math.round(p.price * (1 + percentage / 100)),
      })),
    }));
    
    addUpdate('Fiyat Artışı', `Tüm parça fiyatları %${percentage} artırıldı`);
  };

  const installPart = (installation: Omit<PartInstallation, 'id' | 'installedBy'>) => {
    if (!state.currentUser) return;
    
    const part = state.parts.find(p => p.id === installation.partId);
    const building = state.buildings.find(b => b.id === installation.buildingId);
    
    if (!part || !building) return;
    
    if (part.quantity < installation.quantity) {
      addUpdate('Hata', `${part.name} stokta yeterli sayıda yok`);
      return;
    }
    
    const newInstallation = {
      ...installation,
      id: uuidv4(),
      installedBy: state.currentUser.name,
      isPaid: false,
    };

    const totalCost = part.price * installation.quantity;
    
    setState(prev => ({
      ...prev,
      partInstallations: [...prev.partInstallations, newInstallation],
      parts: prev.parts.map(p => 
        p.id === part.id 
          ? { ...p, quantity: p.quantity - installation.quantity }
          : p
      ),
      buildings: prev.buildings.map(b =>
        b.id === building.id
          ? { ...b, debt: b.debt + totalCost }
          : b
      )
    }));

    // Add debt record for part installation
    addDebtRecord(building.id, 'part', `${part.name} (${installation.quantity} adet)`, totalCost, state.currentUser.name);
    
    addUpdate(
      'Parça Takıldı', 
      `${building.name} binasına ${installation.quantity} adet ${part.name} takıldı`
    );
  };

  const installManualPart = (installation: Omit<ManualPartInstallation, 'id' | 'installedBy'>) => {
    if (!state.currentUser) return;
    
    const building = state.buildings.find(b => b.id === installation.buildingId);
    if (!building) return;
    
    const newInstallation = {
      ...installation,
      id: uuidv4(),
      installedBy: state.currentUser.name,
      isPaid: false,
    };
    
    setState(prev => ({
      ...prev,
      manualPartInstallations: [...prev.manualPartInstallations, newInstallation],
      buildings: prev.buildings.map(b =>
        b.id === building.id
          ? { ...b, debt: b.debt + installation.totalPrice }
          : b
      )
    }));

    // Add debt record for manual part installation
    addDebtRecord(building.id, 'part', `${installation.partName} (${installation.quantity} adet)`, installation.totalPrice, state.currentUser.name);
    
    addUpdate(
      'Manuel Parça Takıldı', 
      `${building.name} binasına ${installation.quantity} adet ${installation.partName} takıldı`
    );
  };

  const markPartAsPaid = (installationId: string, isManual: boolean) => {
    if (!state.currentUser) return;

    const now = new Date().toISOString();

    if (isManual) {
      setState(prev => ({
        ...prev,
        manualPartInstallations: prev.manualPartInstallations.map(installation =>
          installation.id === installationId
            ? { ...installation, isPaid: true, paymentDate: now }
            : installation
        )
      }));
    } else {
      setState(prev => ({
        ...prev,
        partInstallations: prev.partInstallations.map(installation =>
          installation.id === installationId
            ? { ...installation, isPaid: true, paymentDate: now }
            : installation
        )
      }));
    }

    addUpdate('Parça Ödemesi', 'Parça ödemesi olarak işaretlendi');
  };

  const payDebt = (buildingId: string, amount: number) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building || amount <= 0 || amount > building.debt || !state.currentUser) return;
    
    // Add to income when payment is received
    const newIncome = {
      id: uuidv4(),
      buildingId,
      amount,
      date: new Date().toISOString(),
      receivedBy: state.currentUser.name,
    };
    
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { ...b, debt: b.debt - amount }
          : b
      ),
      incomes: [newIncome, ...prev.incomes],
    }));

    // Add debt record for payment
    addDebtRecord(buildingId, 'payment', `Ödeme alındı`, amount, state.currentUser.name);
    
    addUpdate(
      'Borç Ödendi', 
      `${building.name} binasının ${amount} TL borcu ödendi`
    );
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const building = state.buildings.find(b => b.id === payment.buildingId);
    if (!building || payment.amount <= 0 || payment.amount > building.debt) return;
    
    const newPayment = {
      ...payment,
      id: uuidv4(),
    };
    
    // Add to income
    const newIncome = {
      id: uuidv4(),
      buildingId: payment.buildingId,
      amount: payment.amount,
      date: payment.date,
      receivedBy: payment.receivedBy,
    };
    
    setState(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === payment.buildingId 
          ? { ...b, debt: b.debt - payment.amount }
          : b
      ),
      payments: [newPayment, ...prev.payments],
      incomes: [newIncome, ...prev.incomes],
    }));

    // Add debt record for payment
    addDebtRecord(payment.buildingId, 'payment', `Ödeme alındı - ${payment.notes || ''}`, payment.amount, payment.receivedBy);
    
    addUpdate(
      'Ödeme Alındı', 
      `${building?.name} binasından ${payment.amount} TL ödeme alındı`
    );
  };

  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen
    }));
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
    
    addUpdate('Ayarlar Güncellendi', 'Uygulama ayarları güncellendi');
  };

  const addFaultReport = (buildingId: string, reporterName: string, reporterSurname: string, reporterPhone: string, apartmentNo: string, description: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const newFaultReport: FaultReport = {
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

    setState(prev => ({
      ...prev,
      faultReports: [newFaultReport, ...prev.faultReports],
      buildings: prev.buildings.map(b => 
        b.id === buildingId ? { ...b, isDefective: true } : b
      ),
      notifications: [
        `${building.name} binasında arıza bildirimi: ${reporterName} ${reporterSurname} tarafından bildirildi`,
        ...prev.notifications
      ],
      unreadNotifications: prev.unreadNotifications + 1
    }));

    addUpdate(
      'Arıza Bildirimi', 
      `${building.name} binasında arıza bildirimi alındı - ${reporterName} ${reporterSurname} (Daire: ${apartmentNo})`
    );
  };

  const resolveFaultReport = (faultReportId: string) => {
    const faultReport = state.faultReports.find(fr => fr.id === faultReportId);
    if (!faultReport) return;

    const building = state.buildings.find(b => b.id === faultReport.buildingId);
    if (!building) return;

    setState(prev => ({
      ...prev,
      faultReports: prev.faultReports.map(fr => 
        fr.id === faultReportId ? { ...fr, status: 'resolved' } : fr
      ),
      buildings: prev.buildings.map(b => 
        b.id === faultReport.buildingId ? { ...b, isDefective: false } : b
      )
    }));

    addUpdate(
      'Arıza Çözüldü', 
      `${building.name} binasının arızası çözüldü`
    );
  };

  const printMaintenanceReceipt = (buildingId: string) => {
    showReceiptPreview(buildingId);
  };

  const addPrinter = (printer: Omit<Printer, 'id'>) => {
    const newPrinter = {
      ...printer,
      id: uuidv4(),
    };

    setState(prev => ({
      ...prev,
      printers: [
        ...prev.printers.map(p => ({ ...p, isDefault: printer.isDefault ? false : p.isDefault })),
        newPrinter
      ],
    }));

    addUpdate('Yazıcı Eklendi', `${newPrinter.name} yazıcısı eklendi`);
  };

  const updatePrinter = (printer: Printer) => {
    setState(prev => ({
      ...prev,
      printers: prev.printers.map(p => {
        if (p.id === printer.id) {
          return printer;
        }
        if (printer.isDefault && p.isDefault) {
          return { ...p, isDefault: false };
        }
        return p;
      }),
    }));

    addUpdate('Yazıcı Güncellendi', `${printer.name} yazıcısı güncellendi`);
  };

  const deletePrinter = (id: string) => {
    const printer = state.printers.find(p => p.id === id);
    if (!printer) return;

    setState(prev => ({
      ...prev,
      printers: prev.printers.filter(p => p.id !== id),
    }));

    addUpdate('Yazıcı Silindi', `${printer.name} yazıcısı silindi`);
  };

  const clearNotifications = () => {
    setState(prev => ({
      ...prev,
      unreadNotifications: 0,
    }));
  };

  const addSMSTemplate = (template: Omit<SMSTemplate, 'id'>) => {
    const newTemplate = {
      ...template,
      id: uuidv4(),
    };

    setState(prev => ({
      ...prev,
      smsTemplates: [...prev.smsTemplates, newTemplate],
    }));

    addUpdate('SMS Şablonu Eklendi', `${newTemplate.name} şablonu eklendi`);
  };

  const updateSMSTemplate = (template: SMSTemplate) => {
    setState(prev => ({
      ...prev,
      smsTemplates: prev.smsTemplates.map(t => 
        t.id === template.id ? template : t
      ),
    }));

    addUpdate('SMS Şablonu Güncellendi', `${template.name} şablonu güncellendi`);
  };

  const deleteSMSTemplate = (id: string) => {
    const template = state.smsTemplates.find(t => t.id === id);
    if (!template) return;

    setState(prev => ({
      ...prev,
      smsTemplates: prev.smsTemplates.filter(t => t.id !== id),
    }));

    addUpdate('SMS Şablonu Silindi', `${template.name} şablonu silindi`);
  };

  const sendBulkSMS = (templateId: string, buildingIds: string[]) => {
    const template = state.smsTemplates.find(t => t.id === templateId);
    if (!template) return;

    const buildings = state.buildings.filter(b => buildingIds.includes(b.id));
    
    // Simulate SMS sending
    addUpdate(
      'Toplu SMS Gönderildi', 
      `${buildings.length} binaya "${template.name}" şablonu ile SMS gönderildi`
    );
  };

  const sendWhatsApp = (templateId: string, buildingIds: string[]) => {
    const template = state.smsTemplates.find(t => t.id === templateId);
    if (!template) return;

    const buildings = state.buildings.filter(b => buildingIds.includes(b.id));
    
    buildings.forEach(building => {
      if (building.contactInfo) {
        // Clean phone number (remove spaces, dashes, etc.)
        const phoneNumber = building.contactInfo.replace(/\D/g, '');
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/90${phoneNumber}?text=${encodeURIComponent(template.content)}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
      }
    });
    
    addUpdate(
      'WhatsApp Mesajları Gönderildi', 
      `${buildings.length} binaya "${template.name}" şablonu ile WhatsApp mesajı gönderildi`
    );
  };

  const addProposal = (proposal: Omit<Proposal, 'id' | 'createdDate' | 'createdBy'>) => {
    if (!state.currentUser) return;

    const newProposal = {
      ...proposal,
      id: uuidv4(),
      createdDate: new Date().toISOString(),
      createdBy: state.currentUser.name,
    };

    setState(prev => ({
      ...prev,
      proposals: [...prev.proposals, newProposal],
    }));

    addUpdate('Teklif Oluşturuldu', `${newProposal.title} teklifi oluşturuldu`);
  };

  const updateProposal = (proposal: Proposal) => {
    setState(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => 
        p.id === proposal.id ? proposal : p
      ),
    }));

    addUpdate('Teklif Güncellendi', `${proposal.title} teklifi güncellendi`);
  };

  const deleteProposal = (id: string) => {
    const proposal = state.proposals.find(p => p.id === id);
    if (!proposal) return;

    setState(prev => ({
      ...prev,
      proposals: prev.proposals.filter(p => p.id !== id),
    }));

    addUpdate('Teklif Silindi', `${proposal.title} teklifi silindi`);
  };

  const addProposalTemplate = (template: Omit<ProposalTemplate, 'id'>) => {
    const newTemplate = {
      ...template,
      id: uuidv4(),
    };

    setState(prev => ({
      ...prev,
      proposalTemplates: [...prev.proposalTemplates, newTemplate],
    }));

    addUpdate('Teklif Şablonu Eklendi', `${newTemplate.name} şablonu eklendi`);
  };

  const updateProposalTemplate = (template: ProposalTemplate) => {
    setState(prev => ({
      ...prev,
      proposalTemplates: prev.proposalTemplates.map(t => 
        t.id === template.id ? template : t
      ),
    }));

    addUpdate('Teklif Şablonu Güncellendi', `${template.name} şablonu güncellendi`);
  };

  const deleteProposalTemplate = (id: string) => {
    const template = state.proposalTemplates.find(t => t.id === id);
    if (!template) return;

    setState(prev => ({
      ...prev,
      proposalTemplates: prev.proposalTemplates.filter(t => t.id !== id),
    }));

    addUpdate('Teklif Şablonu Silindi', `${template.name} şablonu silindi`);
  };

  const reportFault = (buildingId: string, faultData: { description: string; severity: 'low' | 'medium' | 'high'; reportedBy: string }) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const now = new Date().toISOString();

    setState(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { 
              ...b, 
              isDefective: true,
              defectiveNote: faultData.description,
              faultSeverity: faultData.severity,
              faultTimestamp: now,
              faultReportedBy: faultData.reportedBy
            } 
          : b
      ),
      notifications: [
        `${building.name} binasında ${faultData.severity === 'high' ? 'yüksek' : faultData.severity === 'medium' ? 'orta' : 'düşük'} öncelikli arıza bildirimi`,
        ...prev.notifications
      ],
      unreadNotifications: prev.unreadNotifications + 1
    }));

    addUpdate(
      'Arıza Bildirimi', 
      `${building.name} binasında arıza bildirimi - ${faultData.reportedBy} tarafından bildirildi`
    );
  };

  const updateAutoSaveData = (data: AutoSaveData) => {
    setState(prev => ({
      ...prev,
      autoSaveData: [data, ...prev.autoSaveData.filter(d => d.formType !== data.formType || d.userId !== data.userId)],
      lastAutoSave: data.timestamp
    }));
  };

  const addQRCodeData = (qrCodeData: any) => {
    setState(prev => ({
      ...prev,
      qrCodes: [...prev.qrCodes, qrCodeData]
    }));
    
    addUpdate('QR Kod Oluşturuldu', `${qrCodeData.buildingId} için QR kod oluşturuldu`);
  };

  const showPrinterSelection = (htmlContent: string) => {
    // For now, just print directly using browser's print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  return (
    <AppContext.Provider value={{ 
      state, 
      setUser,
      deleteUser,
      addBuilding, 
      updateBuilding, 
      deleteBuilding,
      toggleMaintenance,
      addPart,
      updatePart,
      deletePart,
      increasePrices,
      installPart,
      installManualPart,
      markPartAsPaid,
      payDebt,
      toggleSidebar,
      updateSettings,
      addFaultReport,
      resolveFaultReport,
      printMaintenanceReceipt,
      addPrinter,
      updatePrinter,
      deletePrinter,
      clearNotifications,
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
      reportFault,
      updateAutoSaveData,
      openReceiptModal,
      closeReceiptModal,
      addQRCodeData,
      showPrinterSelection
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