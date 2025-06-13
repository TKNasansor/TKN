import React from 'react';
import { useApp } from '../context/AppContext';
import { ClipboardList } from 'lucide-react';

const UpdatesPage: React.FC = () => {
  const { state } = useApp();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Son Güncellemeler</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="divide-y divide-gray-200">
          {state.updates.length > 0 ? (
            state.updates.map((update) => (
              <div key={update.id} className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClipboardList className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {update.action}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {update.details}
                    </p>
                    <div className="mt-2 text-xs text-gray-400 flex items-center">
                      <span>{update.user}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(update.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              Henüz güncelleme bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;