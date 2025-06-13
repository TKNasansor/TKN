import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Wrench, Shield, RefreshCw } from 'lucide-react';

const ProposalsPage: React.FC = () => {
  const proposalTypes = [
    {
      type: 'installation',
      title: 'Montaj Teklifi',
      description: 'Yeni asansör montaj teklifleri',
      icon: Wrench,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      type: 'maintenance',
      title: 'Bakım Sözleşmesi',
      description: 'Asansör bakım sözleşme teklifleri',
      icon: Shield,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      type: 'revision',
      title: 'Revizyon Teklifi',
      description: 'Asansör revizyon ve modernizasyon teklifleri',
      icon: RefreshCw,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Teklifler</h1>
        <p className="text-gray-600">Teklif türünü seçerek devam edin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {proposalTypes.map((proposalType) => {
          const Icon = proposalType.icon;
          return (
            <Link
              key={proposalType.type}
              to={`/proposals/${proposalType.type}`}
              className={`block p-6 rounded-lg shadow-lg text-white ${proposalType.color} ${proposalType.hoverColor} transform transition-all duration-200 hover:scale-105`}
            >
              <div className="flex items-center justify-center mb-4">
                <Icon className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {proposalType.title}
              </h3>
              <p className="text-center text-sm opacity-90">
                {proposalType.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Teklif Türleri Hakkında</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Montaj Teklifi</h4>
            <p>Yeni asansör kurulumu için hazırlanan teklifler. Malzeme, işçilik ve montaj süreçlerini içerir.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Bakım Sözleşmesi</h4>
            <p>Düzenli bakım hizmetleri için hazırlanan sözleşme teklifleri. Aylık/yıllık bakım planlarını kapsar.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Revizyon Teklifi</h4>
            <p>Mevcut asansörlerin modernizasyonu ve yenilenmesi için hazırlanan teklifler.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalsPage;