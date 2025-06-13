import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, CheckCircle, Clock, User, Phone, Home, FileText, Calendar } from 'lucide-react';

const FaultReportsPage: React.FC = () => {
  const { state, resolveFaultReport } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  
  const filteredReports = state.faultReports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });
  
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'resolved':
        return 'Çözüldü';
      default:
        return 'Bilinmeyen';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Arıza Bildirimleri</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tümü ({state.faultReports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Beklemede ({state.faultReports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Çözüldü ({state.faultReports.filter(r => r.status === 'resolved').length})
          </button>
        </div>
      </div>
      
      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const building = state.buildings.find(b => b.id === report.buildingId);
            
            return (
              <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(report.status)}
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {building?.name || 'Bilinmeyen Bina'}
                        </h3>
                        <p className="text-sm text-gray-600">{building?.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                      
                      {report.status === 'pending' && (
                        <button
                          onClick={() => resolveFaultReport(report.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Çözüldü Olarak İşaretle
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Bildiren:</span>
                      <span className="ml-1">{report.reporterName} {report.reporterSurname}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="font-medium">Telefon:</span>
                      <span className="ml-1">{report.reporterPhone}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="h-4 w-4 mr-2" />
                      <span className="font-medium">Daire:</span>
                      <span className="ml-1">{report.apartmentNo}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Tarih:</span>
                      <span className="ml-1">{formatDate(report.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Arıza Açıklaması:</span>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Arıza Bildirimi Yok' : 
             filter === 'pending' ? 'Bekleyen Arıza Yok' : 'Çözülen Arıza Yok'}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Henüz hiç arıza bildirimi alınmamış.' :
             filter === 'pending' ? 'Şu anda bekleyen arıza bildirimi bulunmuyor.' :
             'Henüz çözülen arıza bildirimi bulunmuyor.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FaultReportsPage;