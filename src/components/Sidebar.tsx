import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building2, 
  Wrench, 
  Settings, 
  AlertCircle,
  CreditCard,
  Package,
  ClipboardList,
  LayoutDashboard,
  AlertTriangle,
  Printer,
  MessageSquare,
  FileText,
  BarChart3,
  Banknote
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar: React.FC = () => {
  const { state, toggleSidebar } = useApp();
  
  const pendingFaultReports = state.faultReports?.filter(fr => fr.status === 'pending').length || 0;
  
  const navigation = [
    { name: 'Gösterge Paneli', to: '/', icon: LayoutDashboard },
    { name: 'Binalar', to: '/buildings', icon: Building2 },
    { name: 'Parçalar', to: '/parts', icon: Package },
    { name: 'Son Güncellemeler', to: '/updates', icon: ClipboardList },
    { name: 'Arızalı Asansörler', to: '/defective', icon: AlertCircle },
    { 
      name: 'Arıza Bildirimleri', 
      to: '/fault-reports', 
      icon: AlertTriangle,
      badge: pendingFaultReports > 0 ? pendingFaultReports : undefined
    },
    { name: 'Ödeme Yönetimi', to: '/payments', icon: Banknote },
    { name: 'Yazıcılar', to: '/printers', icon: Printer },
    { name: 'Toplu SMS', to: '/bulk-sms', icon: MessageSquare },
    { name: 'Teklifler', to: '/proposals', icon: FileText },
    { name: 'Bakım İstatistikleri', to: '/maintenance-stats', icon: BarChart3 },
    { name: 'Aylar', to: '/monthly-income', icon: CreditCard },
    { name: 'Ayarlar', to: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };
  
  return (
    <div 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <Wrench className="h-8 w-8 text-white" />
          <span className="ml-2 text-white font-bold text-lg">Asansör Takip</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) => `
                    flex items-center justify-between px-2 py-2 text-base font-medium rounded-md
                    ${isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 bg-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                {state.currentUser?.name.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{state.currentUser?.name}</p>
              <p className="text-xs font-medium text-gray-300">Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;