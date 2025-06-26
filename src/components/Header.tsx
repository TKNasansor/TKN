import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, toggleSidebar, clearNotifications } = useApp();
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  const formatDateTime = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.notifications-container')) {
      setShowNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && state.unreadNotifications > 0) {
      clearNotifications();
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-3 text-lg font-semibold text-gray-800 truncate max-w-xs sm:max-w-none">
              TKNLİFT {/* BURASI GÜNCELLENDİ */}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{formatDateTime()}</span>
            
            <div className="relative notifications-container">
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                onClick={handleNotificationClick}
              >
                <Bell className="h-6 w-6" />
                {state.unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-xs font-bold text-white">
                    {state.unreadNotifications}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 max-h-80 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Bildirimler</h3>
                  </div>
                  
                  {state.notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {state.notifications.map((notification, index) => (
                        <li key={index} className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm text-gray-700">{notification}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500">Bildirim bulunmamaktadır.</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{state.currentUser?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
