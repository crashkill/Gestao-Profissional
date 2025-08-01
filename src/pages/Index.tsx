import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        .from('colaboradores')
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

  const handleNavigate = (view: 'manual' | 'excel' | 'ai-chat' | 'dashboard') => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    loadProfessionals(); // Recarrega os dados quando volta ao dashboard
  };

  const handleProfessionalSubmit = async (professional: Omit<Professional, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('colaboradores')
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
        .from('colaboradores')
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center py-16 px-6"
          >
            <div className="max-w-4xl mx-auto">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight"
              >
                Gestão Profissional HITSS
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-slate-300 text-xl font-light tracking-wide"
              >
                Gerencie profissionais de TI com facilidade e elegância
              </motion.p>
              
              {/* Decorative line */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 mt-6 mx-auto"
              ></motion.div>
              

            </div>
          </motion.header>

          <main className="max-w-7xl mx-auto px-6 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Dashboard 
                professionals={professionals} 
                onNavigate={handleNavigate}
              />
            </motion.div>
          </main>
         </div>
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
      
      {/* Chat lateral de IA */}
      {currentView === 'dashboard' && (
        <AIChat professionals={professionals} />
      )}
    </div>
  );
};

export default Index;