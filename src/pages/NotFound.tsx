import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebGLBackground from '../components/WebGLBackground';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative flex items-center justify-center">
      <WebGLBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-8xl font-bold text-white mb-4"
          >
            404
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Página não encontrada
          </h1>
          
          <p className="text-slate-300 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              Ir para o início
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;