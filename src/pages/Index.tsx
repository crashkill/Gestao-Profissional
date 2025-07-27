import { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import ManualForm from '../components/ManualForm';
import ExcelImport from '../components/ExcelImport';
import { AIChat } from '../components/AIChat';
import WebGLBackground from '../components/WebGLBackground';
import { Professional } from '../types/Professional';
import { supabase } from '../lib/supabaseClient';

type View = 'dashboard' | 'manual' | 'excel' | 'ai-chat';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Erro ao carregar profissionais:', error);
        return;
      }
      
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (view: 'manual' | 'excel' | 'ai-chat') => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    loadProfessionals(); // Recarrega os dados quando volta ao dashboard
  };

  const handleProfessionalSubmit = async (professional: Omit<Professional, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([professional]);
      
      if (error) {
        console.error('Erro ao salvar profissional:', error);
        return;
      }
      
      loadProfessionals();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    }
  };

  const handleExcelImport = async (professionals: Omit<Professional, 'id' | 'created_at'>[]) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert(professionals);
      
      if (error) {
        console.error('Erro ao importar profissionais:', error);
        return;
      }
      
      loadProfessionals();
    } catch (error) {
      console.error('Erro ao importar profissionais:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      <WebGLBackground />
      
      {currentView === 'dashboard' && (
        <Dashboard 
          professionals={professionals} 
          onNavigate={handleNavigate}
        />
      )}
      
      {currentView === 'manual' && (
        <ManualForm 
          onSubmit={handleProfessionalSubmit}
          onBack={handleBackToDashboard} 
        />
      )}
      
      {currentView === 'excel' && (
        <ExcelImport 
          onImport={handleExcelImport}
          onBack={handleBackToDashboard} 
        />
      )}
      
      {currentView === 'ai-chat' && (
        <AIChat 
          professionals={professionals}
        />
      )}
    </div>
  );
};

export default Index;