import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Building2, User, Phone, Home, FileText, CheckCircle } from 'lucide-react';

const FaultReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, addFaultReport } = useApp();
  
  const building = state.buildings.find(b => b.id === id);
  
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterSurname: '',
    reporterPhone: '',
    apartmentNo: '',
    description: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!building) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bina Bulunamadı</h1>
          <p className="text-gray-600 mb-6">
            Arıza bildirimi yapmak istediğiniz bina bulunamadı.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      addFaultReport(
        building.id,
        formData.reporterName,
        formData.reporterSurname,
        formData.reporterPhone,
        formData.apartmentNo,
        formData.description
      );
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Arıza bildirimi gönderilirken hata oluştu:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate page content using template
  const generatePageContent = () => {
    const template = state.settings?.faultReportTemplate || '';
    const companyAddress = state.settings?.companyAddress ? 
      `${state.settings.companyAddress.mahalle} ${state.settings.companyAddress.sokak} ${state.settings.companyAddress.binaNo}, ${state.settings.companyAddress.ilce}/${state.settings.companyAddress.il}` : 
      'Adres belirtilmemiş';

    const buildingAddress = building.address ? 
      `${building.address.mahalle} ${building.address.sokak} ${building.address.binaNo}, ${building.address.ilce}/${building.address.il}` : 
      'Adres belirtilmemiş';

    return template
      .replace(/{{LOGO}}/g, state.settings?.logo ? `<img src="${state.settings.logo}" alt="Logo" class="logo">` : '')
      .replace(/{{COMPANY_NAME}}/g, state.settings?.companyName || 'Asansör Bakım Servisi')
      .replace(/{{COMPANY_ADDRESS}}/g, companyAddress)
      .replace(/{{COMPANY_PHONE}}/g, state.settings?.companyPhone || '0555 123 45 67')
      .replace(/{{BUILDING_NAME}}/g, building.name)
      .replace(/{{BUILDING_ADDRESS}}/g, buildingAddress)
      .replace(/{{REPORTER_NAME}}/g, isSubmitted ? `${formData.reporterName} ${formData.reporterSurname}` : '')
      .replace(/{{REPORTER_PHONE}}/g, isSubmitted ? formData.reporterPhone : '')
      .replace(/{{APARTMENT_NO}}/g, isSubmitted ? formData.apartmentNo : '')
      .replace(/{{DESCRIPTION}}/g, isSubmitted ? formData.description : '');
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Arıza Bildirimi Alındı</h1>
          <p className="text-gray-600 mb-6">
            {building.name} binası için arıza bildiriminiz başarıyla alındı. 
            En kısa sürede ilgilenilecektir.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>Bildirim Sahibi:</strong> {formData.reporterName} {formData.reporterSurname}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Daire No:</strong> {formData.apartmentNo}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Telefon:</strong> {formData.reporterPhone}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          .fault-report {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 2px solid #333;
          }
          .logo-section {
            flex: 1;
          }
          .logo {
            max-height: 60px;
            max-width: 150px;
          }
          .company-details {
            flex: 2;
            text-align: center;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
          }
          .certifications {
            font-size: 12px;
            color: #666;
            font-weight: bold;
          }
          .address-info {
            flex: 1;
            text-align: right;
            font-size: 12px;
            color: #666;
          }
          .address-text {
            margin-bottom: 5px;
            line-height: 1.4;
          }
          .phone-text {
            font-weight: bold;
          }
          .report-title {
            text-align: center;
            padding: 20px;
            background: #dc2626;
            color: white;
          }
          .report-title h1 {
            margin: 0;
            font-size: 20px;
          }
          .building-info {
            padding: 20px;
            background: #f3f4f6;
            border-bottom: 1px solid #e5e7eb;
          }
          .building-info h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 18px;
          }
          .building-info p {
            margin: 0;
            color: #666;
          }
          .form-section {
            padding: 20px;
          }
          .field {
            margin-bottom: 15px;
          }
          .field label {
            display: block;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .footer {
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        `
      }} />
      
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with company info */}
          <div 
            className="fault-report"
            dangerouslySetInnerHTML={{ __html: generatePageContent() }}
          />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Ad *
                </label>
                <input
                  type="text"
                  id="reporterName"
                  name="reporterName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={formData.reporterName}
                  onChange={handleInputChange}
                  placeholder="Adınız"
                />
              </div>
              
              <div>
                <label htmlFor="reporterSurname" className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad *
                </label>
                <input
                  type="text"
                  id="reporterSurname"
                  name="reporterSurname"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={formData.reporterSurname}
                  onChange={handleInputChange}
                  placeholder="Soyadınız"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="reporterPhone" className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Telefon Numarası *
              </label>
              <input
                type="tel"
                id="reporterPhone"
                name="reporterPhone"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.reporterPhone}
                onChange={handleInputChange}
                placeholder="0555 123 45 67"
              />
            </div>
            
            <div>
              <label htmlFor="apartmentNo" className="block text-sm font-medium text-gray-700 mb-1">
                <Home className="h-4 w-4 inline mr-1" />
                Daire Numarası *
              </label>
              <input
                type="text"
                id="apartmentNo"
                name="apartmentNo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.apartmentNo}
                onChange={handleInputChange}
                placeholder="Örn: 3A, 12, Zemin Kat"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Arıza Açıklaması *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Asansörde yaşadığınız sorunu detaylı olarak açıklayın..."
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Önemli:</strong> Acil durumlar için lütfen 112'yi arayın. 
                Bu form sadece asansör arızaları için kullanılmalıdır.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Arıza Bildirimi Yap'}
            </button>
          </form>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Bu QR kod {building.name} binasına aittir
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaultReportPage;