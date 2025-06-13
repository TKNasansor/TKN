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
  };
  notes: string;
  isMaintained: boolean;
  lastMaintenanceDate?: string;
  lastMaintenanceTime?: string;
  isDefective?: boolean;
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
  };
  receiptTemplate: string;
  proposalTemplate: string;
  faultReportTemplate: string;
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
}

export interface MaintenanceRecord {
  id: string;
  buildingId: string;
  performedBy: string;
  maintenanceDate: string;
  maintenanceTime: string;
  elevatorCount: number;
  totalFee: number;
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

export interface Proposal {
  id: string;
  type: 'installation' | 'maintenance' | 'revision';
  buildingName: string;
  title: string;
  description: string;
  items: ProposalItem[];
  totalAmount: number;
  createdDate: string;
  createdBy: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  pdfAttachment?: string;
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
}