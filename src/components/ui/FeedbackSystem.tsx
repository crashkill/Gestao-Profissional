import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, Loader2, X } from 'lucide-react';

type FeedbackType = 'success' | 'error' | 'info' | 'loading';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface FeedbackSystemProps {
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const getIcon = (type: FeedbackType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
    case 'loading':
      return <Loader2 className="w-5 h-5 animate-spin" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

const getStyles = (type: FeedbackType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/20 text-green-400';
    case 'error':
      return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'loading':
      return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
  }
};

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  messages,
  onDismiss,
  position = 'top-right'
}) => {
  React.useEffect(() => {
    messages.forEach((message) => {
      if (!message.persistent && message.type !== 'loading') {
        const duration = message.duration || 5000;
        const timer = setTimeout(() => {
          onDismiss(message.id);
        }, duration);
        return () => clearTimeout(timer);
      }
    });
  }, [messages, onDismiss]);

  return (
    <div className={`fixed z-50 ${getPositionStyles(position)} space-y-2 max-w-sm w-full`}>
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              border rounded-lg p-4 backdrop-blur-sm
              ${getStyles(message.type)}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(message.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white mb-1">
                  {message.title}
                </h4>
                <p className="text-sm opacity-90">
                  {message.message}
                </p>
              </div>
              
              {!message.persistent && message.type !== 'loading' && (
                <button
                  onClick={() => onDismiss(message.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook para gerenciar mensagens de feedback
export const useFeedback = () => {
  const [messages, setMessages] = React.useState<FeedbackMessage[]>([]);

  const addMessage = React.useCallback((message: Omit<FeedbackMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setMessages(prev => [...prev, { ...message, id }]);
    return id;
  }, []);

  const removeMessage = React.useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setMessages([]);
  }, []);

  const showSuccess = React.useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({ type: 'success', title, message, ...options });
  }, [addMessage]);

  const showError = React.useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({ type: 'error', title, message, ...options });
  }, [addMessage]);

  const showInfo = React.useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({ type: 'info', title, message, ...options });
  }, [addMessage]);

  const showLoading = React.useCallback((title: string, message: string, options?: Partial<FeedbackMessage>) => {
    return addMessage({ type: 'loading', title, message, persistent: true, ...options });
  }, [addMessage]);

  return {
    messages,
    addMessage,
    removeMessage,
    clearAll,
    showSuccess,
    showError,
    showInfo,
    showLoading
  };
};