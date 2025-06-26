import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';

const UserSelection: React.FC = () => {
  const { setUser } = useApp();
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUser(name.trim());
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Wrench className="h-10 w-10 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 ml-2">TKNLİFT</h1> {/* BURASI GÜNCELLENDİ */}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              İsminizi Girin
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="İsminizi girin"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSelection;
