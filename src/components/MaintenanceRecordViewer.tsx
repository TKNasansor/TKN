import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { MaintenanceRecord } from '../types';

interface MaintenanceRecordViewerProps {
  records: MaintenanceRecord[];
  isLoading?: boolean;
  onRetry?: () => void;
  error?: string;
}

const MaintenanceRecordViewer: React.FC<MaintenanceRecordViewerProps> = ({
  records,
  isLoading = false,
  onRetry,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [displayedRecords, setDisplayedRecords] = useState<MaintenanceRecord[]>([]);
  const [loadedCount, setLoadedCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter and sort records
  useEffect(() => {
    let filtered = records.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.searchableText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort records
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setDisplayedRecords(filtered.slice(0, loadedCount));
  }, [records, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder, loadedCount]);

  const loadMoreRecords = async () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoadedCount(prev => prev + 20);
    setIsLoadingMore(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Beklemede';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmeyen';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Normal';
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Yüklenirken Hata Oluştu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <p><strong>Çözüm Önerileri:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>İnternet bağlantınızı kontrol edin</li>
            <li>Sayfayı yenileyin</li>
            <li>Tarayıcı önbelleğini temizleyin</li>
            <li>Sorun devam ederse sistem yöneticisine başvurun</li>
          </ul>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bakım Kayıtları</h3>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Kayıt ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="pending">Beklemede</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
          
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Tarihe Göre</option>
              <option value="status">Duruma Göre</option>
              <option value="priority">Önceliğe Göre</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Kayıtlar yükleniyor...</p>
          </div>
        ) : displayedRecords.length > 0 ? (
          <>
            {displayedRecords.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                        {getPriorityText(record.priority)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Tarih:</span>
                        <p className="text-gray-600">
                          {new Date(record.maintenanceDate).toLocaleDateString('tr-TR')} {record.maintenanceTime}
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-900">Teknisyen:</span>
                        <p className="text-gray-600">{record.performedBy}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-900">Ücret:</span>
                        <p className="text-gray-600">{record.totalFee.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {displayedRecords.length < records.length && (
              <div className="p-6 text-center border-t border-gray-200">
                <button
                  onClick={loadMoreRecords}
                  disabled={isLoadingMore}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Daha Fazla Yükle ({records.length - displayedRecords.length} kayıt)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Filtrelere uygun kayıt bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceRecordViewer;