export interface Building {
  id: string;
  name: string;
  maintenanceFee: number; // Per elevator
  elevatorCount: number;
  debt: number;
  contactInfo: string;
  address: {
    mahalle: string;
    sokak: string;
    il: string;
    ilce: string;
    binaNo: string;
    latitude?: number;
    longitude?: number;
  };
  notes: string;
  isMaintained: boolean;
  lastMaintenanceDate?: string;
  lastMaintenanceTime?: string;
  isDefective?: boolean;
  defectiveNote?: string; // Arıza notu
  faultSeverity?: 'low' | 'medium' | 'high'; // Arıza şiddeti
  faultTimestamp?: string; // Arıza zamanı
  faultReportedBy?: string; // Arızayı bildiren
  label?: 'green' | 'blue' | 'yellow' | 'red' | null;
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PartInstallation {
  id: string;
  buildingId: string;
  partId: string;
  quantity: number;
  installDate: string;
  installedBy: string;
  isPaid: boolean;
  paymentDate?: string;
}

export interface ManualPartInstallation {
  id: string;
  buildingId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  installDate: string;
  installedBy: string;
  isPaid: boolean;
  paymentDate?: string;
}

export interface Update {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface Income {
  id: string;
  buildingId: string;
  amount: number;
  date: string;
  receivedBy: string;
}

export interface User {
  id: string;
  name: string;
}

export interface DebtRecord {
  id: string;
  buildingId: string;
  date: string;
  type: 'maintenance' | 'part' | 'payment';
  description: string;
  amount: number;
  previousDebt: number;
  newDebt: number;
  performedBy?: string;
  relatedRecordId?: string; // İlişkili bakım kaydının ID'si eklendi
}

export interface AppSettings {
  appTitle: string;
  logo: string | null;
  companyName: string;
  companyPhone: string;
  companyAddress: {
    mahalle: string;
    sokak: string;
    il: string;
    ilce: string;
    binaNo: string;
    latitude?: number;
    longitude?: number;
  };
  ceEmblemUrl?: string;
  tseEmblemUrl?: string;
  receiptTemplate: string;
  installationProposalTemplate: string;
  maintenanceProposalTemplate: string;
  revisionProposalTemplate: string;
  faultReportTemplate: string;
  autoSaveInterval: number; // Auto-save interval in seconds
}

export interface FaultReport {
  id: string;
  buildingId: string;
  reporterName: string;
  reporterSurname: string;
  reporterPhone: string;
  apartmentNo: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface MaintenanceReceipt {
  id: string;
  buildingId: string;
  maintenanceDate: string;
  maintenanceTime: string;
  performedBy: string;
  maintenanceFee: number;
  notes?: string;
}

export interface MaintenanceHistory {
  id: string;
  buildingId: string;
  maintenanceDate: string;
  maintenanceTime: string;
  performedBy: string;
  maintenanceFee: number;
  notes?: string;
  relatedRecordId?: string; // İlişkili bakım kaydının ID'si eklendi
}

export interface MaintenanceRecord {
  id: string;
  buildingId: string;
  performedBy: string;
  maintenanceDate: string;
  maintenanceTime: string;
  elevatorCount: number;
  totalFee: number;
  status: 'completed' | 'pending' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  searchableText?: string; // For search functionality
}

export interface Printer {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  isDefault: boolean;
  type: 'thermal' | 'inkjet' | 'laser';
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
}

export interface ProposalTemplate {
  id: string;
  type: 'installation' | 'maintenance' | 'revision';
  name: string;
  content: string;
  fields: ProposalField[];
  fileAttachment?: string;
  documentFile?: string; // Word/PDF dosyası
  fillableFields?: TemplateField[]; // Doldurulabilir alanlar
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  required: boolean;
}

export interface ProposalField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface Proposal {
  id: string;
  type: 'installation' | 'maintenance' | 'revision';
  templateId: string;
  buildingName: string;
  title: string;
  description: string;
  fieldValues: Record<string, any>;
  templateFieldValues?: Record<string, any>; // Şablon alanları için değerler
  items: ProposalItem[];
  totalAmount: number;
  createdDate: string;
  createdBy: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  pdfAttachment?: string;
  generatedDocument?: string; // Oluşturulan belge
}

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  buildingId: string;
  amount: number;
  date: string;
  receivedBy: string;
  notes?: string;
}

export interface QRCodeData {
  id: string;
  buildingId: string;
  content: string;
  customFields: Record<string, any>;
  generatedDate: string;
  isActive: boolean;
  logoUrl?: string;
  companyName?: string;
}

export interface NotificationData {
  id: string;
  type: 'fault' | 'maintenance' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  relatedId?: string; // Related building, part, etc.
}

export interface AutoSaveData {
  id: string;
  formType: string;
  formData: any;
  timestamp: string;
  userId: string;
}

export interface ArchivedReceipt {
  id: string;
  buildingId: string;
  htmlContent: string;
  createdDate: string;
  createdBy: string;
  maintenanceDate: string;
  buildingName: string;
  relatedRecordId?: string; // İlişkili bakım kaydının ID'si eklendi
}

export interface AppState {
  buildings: Building[];
  parts: Part[];
  partInstallations: PartInstallation[];
  manualPartInstallations: ManualPartInstallation[];
  updates: Update[];
  incomes: Income[];
  currentUser: User | null;
  users: User[];
  notifications: string[];
  sidebarOpen: boolean;
  settings: AppSettings;
  lastMaintenanceReset?: string;
  faultReports: FaultReport[];
  maintenanceReceipts: MaintenanceReceipt[];
  maintenanceHistory: MaintenanceHistory[];
  maintenanceRecords: MaintenanceRecord[];
  printers: Printer[];
  unreadNotifications: number;
  smsTemplates: SMSTemplate[];
  proposals: Proposal[];
  payments: Payment[];
  debtRecords: DebtRecord[];
  proposalTemplates: ProposalTemplate[];
  qrCodes: QRCodeData[];
  systemNotifications: NotificationData[];
  autoSaveData: AutoSaveData[];
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  lastAutoSave?: string;
  showReceiptModal: boolean;
  receiptModalHtml: string | null;
  archivedReceipts: ArchivedReceipt[];
  showPrinterSelectionModal: boolean;
  printerSelectionContent: string | null;
}
