import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Building2, Phone, Check, Edit, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const DefectiveElevatorsPage: React.FC = () => {
  const { state, updateBuilding } = useApp();
  const [showAllBuildings, setShowAllBuildings] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  
  const getFullAddress = (address: any) => {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object' && address !== null) {
      const parts = [];
      if (address.sokak) parts.push(address.sokak);
      if (address.mahalle) parts.push(address.mahalle);
      if (address.ilce) parts.push(address.ilce);
      if (address.il) parts.push(address.il);
      if (address.binaNo) parts.push(`No: ${address.binaNo}`);
      return parts.join(', ') || 'Adres bilgisi yok';
    }
    return 'Adres bilgisi yok';
  };
  
  const handleMarkAsDefective = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (building) {
      updateBuilding({
        ...building,
        isDefective: true
      });
    }
  };
  
  const handleFixElevator = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (building) {
      updateBuilding({
        ...building,
        isDefective: false,
        defectiveNote: undefined
      });
    }
  };

  const handleEditNote = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (building) {
      setEditingNote(buildingId);
      setNoteText(building.defectiveNote || '');
    }
  };

  const handleSaveNote = (buildingId: string) => {
    const building = state.buildings.find(b => b.id === buildingId);
    if (building) {
      updateBuilding({
        ...building,
        defectiveNote: noteText.trim() || undefined
      });
      setEditingNote(null);
      setNoteText('');
    }
  };

  const handleCancelNote = () => {
    setEditingNote(null);
    setNoteText('');
  };
  
  const defectiveElevators = state.buildings.filter(building => building.isDefective);
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {showAllBuildings ? 'Tüm Binalar' : 'Arızalı Asansörler'}
        </h1>
        <button
          onClick={() => setShowAllBuildings(!showAllBuildings)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showAllBuildings ? 'Arızalı Asansörleri Göster' : 'Tüm Binaları Göster'}
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {(showAllBuildings ? state.buildings : defectiveElevators).map((building) => (
            <li key={building.id} className="px-6 py-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className={`h-6 w-6 ${building.isDefective ? 'text-orange-500' : 'text-gray-400'}`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <Link to={`/buildings/${building.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800">
                      {building.name}
                    </Link>
                    <div className="flex space-x-2">
                      {building.isDefective && (
                        <button
                          onClick={() => handleEditNote(building.id)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Arıza Notu
                        </button>
                      )}
                      {showAllBuildings ? (
                        !building.isDefective && (
                          <button
                            onClick={() => handleMarkAsDefective(building.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Arızalı Olarak İşaretle
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleFixElevator(building.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Arıza Çözüldü
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap">
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:mr-6">
                      <Building2 className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {getFullAddress(building.address)}
                    </div>
                    {building.contactInfo && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Phone className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {building.contactInfo}
                      </div>
                    )}
                  </div>
                  
                  {/* Arıza Notu Düzenleme */}
                  {editingNote === building.id ? (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <label className="block text-sm font-medium text-orange-800 mb-2">
                        Arıza Açıklaması
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Arızanın detaylarını yazın..."
                      />
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleSaveNote(building.id)}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Kaydet
                        </button>
                        <button
                          onClick={handleCancelNote}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <X className="h-3 w-3 mr-1" />
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (building.isDefective && building.defectiveNote ? (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-orange-800">Arıza Açıklaması:</h4>
                          <p className="text-sm text-orange-700 mt-1">{building.defectiveNote}</p>
                        </div>
                        <button
                          onClick={() => handleEditNote(building.id)}
                          className="p-1 text-orange-600 hover:text-orange-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null)}
                  
                  {building.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Not: {building.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DefectiveElevatorsPage;