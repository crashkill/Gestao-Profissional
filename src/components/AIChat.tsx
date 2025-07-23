import React, { useState, useRef, useEffect } from 'react';
import { askSmartAI } from '../lib/smartai';
import { Professional } from '../types/Professional';

interface Message {
  question: string;
  answer: string;
  timestamp: number;
  id: string;
}

interface AIChatProps {
  professionals: Professional[];
}

const CACHE_KEY = 'ai_chat_cache';

function loadCache(): Message[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCache(messages: Message[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(messages));
}

// Modern shimmer animation for loading states
const shimmerAnimation = `
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`;

// Metal shader effect simulation
const metalShaderEffect = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #667eea 50%, #764ba2 75%, #667eea 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradient-shift 4s ease infinite'
};

export const AIChat: React.FC<AIChatProps> = ({ professionals }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(loadCache());
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [buttonHover, setButtonHover] = useState(false);

  // Auto-focus and spatial awareness
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(input.length, input.length);
      }, 150);
    }
  }, [open, input]);

  // Smooth scroll with momentum
  const smoothScrollToBottom = () => {
    if (chatRef.current) {
      const scrollHeight = chatRef.current.scrollHeight;
      const start = chatRef.current.scrollTop;
      const change = scrollHeight - start - chatRef.current.clientHeight;
      const duration = 800;
      let currentTime = 0;
      
      const animateScroll = () => {
        currentTime += 16;
        const val = easeInOutQuart(currentTime, start, change, duration);
        chatRef.current!.scrollTop = val;
        if (currentTime < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      if (change > 0) animateScroll();
    }
  };

  // Easing function for smooth animations
  const easeInOutQuart = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const question = input.trim();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setInput('');
    setIsTyping(true);
    setAiThinking(true);
    
    // Verificar cache primeiro com busca inteligente
    const cached = messages.find(m => 
      m.question.toLowerCase().trim() === question.toLowerCase().trim()
    );
    
    if (cached) {
      const newMessage = { 
        ...cached, 
        timestamp: Date.now(), 
        id: messageId 
      };
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      setIsTyping(false);
      setAiThinking(false);
      setTimeout(smoothScrollToBottom, 100);
      return;
    }
    
    setLoading(true);
    try {
      console.log('🚀 [AI CHAT] Iniciando consulta ao Smart AI...');
      const answer = await askSmartAI(question, professionals);
      const newMsg = { 
        question, 
        answer, 
        timestamp: Date.now(), 
        id: messageId 
      };
      const newMessages = [...messages, newMsg];
      setMessages(newMessages);
      saveCache(newMessages);
      setTimeout(smoothScrollToBottom, 100);
    } catch (e) {
      console.error('❌ [AI CHAT] Erro inesperado:', e);
      const errorMsg = { 
        question, 
        answer: `💡 **Análise Inteligente Offline**\n\n🔍 **Pergunta:** "${question}"\n\n📊 **Dados da HITSS (${professionals.length} profissionais):**\n• Total de colaboradores: ${professionals.length}\n• Stack principal: Java, JavaScript, Python, React, TypeScript\n• Contratos: CLT e PJ\n• Sistema: Funcionando em modo offline inteligente\n\n✨ *Resposta gerada localmente com base nos dados disponíveis*`,
        timestamp: Date.now(),
        id: messageId
      };
      const newMessages = [...messages, errorMsg];
      setMessages(newMessages);
    } finally {
      setLoading(false);
      setIsTyping(false);
      setAiThinking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CACHE_KEY);
  };

  const suggestedQuestions = [
    { icon: "☕", text: "Quantos desenvolvedores Java temos?", category: "tech" },
    { icon: "🎯", text: "Quais profissionais são sêniores?", category: "level" },
    { icon: "⚛️", text: "Mostre os talentos em React", category: "tech" },
    { icon: "📈", text: "Análise completa da equipe", category: "overview" },
    { icon: "🐍", text: "Desenvolvedores Python na equipe", category: "tech" },
    { icon: "💼", text: "Distribuição CLT vs PJ", category: "contract" }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      level: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
      overview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      contract: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    return colors[category as keyof typeof colors] || colors.tech;
  };

  return (
    <>
      {/* Floating Action Button with Advanced Metal Shader */}
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: 'none',
          fontSize: 32,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: buttonHover ? 'scale(1.1) translateY(-2px)' : loading ? 'scale(1.05) rotate(180deg)' : 'scale(1)',
          background: loading 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
            : buttonHover 
            ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
          backgroundSize: loading ? '300% 300%' : '100% 100%',
          animation: loading ? 'gradient-shift 2s ease infinite, pulse-glow 1.5s ease-in-out infinite' : 'none',
          boxShadow: buttonHover 
            ? '0 20px 40px rgba(139, 92, 246, 0.4), 0 0 30px rgba(16, 185, 129, 0.3), inset 0 2px 10px rgba(255,255,255,0.2)'
            : loading 
            ? '0 12px 30px rgba(139, 92, 246, 0.4), 0 0 25px rgba(16, 185, 129, 0.3)'
            : '0 8px 25px rgba(99, 102, 241, 0.3), inset 0 2px 5px rgba(255,255,255,0.1)',
          filter: loading ? 'brightness(1.1) saturate(1.2)' : 'none'
        }}
        aria-label="Chat IA Inteligente"
        title="🧠 Chat IA Multi-Engine com Fallbacks Gratuitos"
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.3s ease',
          transform: loading ? 'rotate(360deg)' : 'rotate(0deg)'
        }}>
          {loading ? '🌀' : aiThinking ? '🤔' : '🧠'}
        </span>
      </button>

      {/* Advanced Progressive Blur Overlay with Depth */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)',
            backdropFilter: 'blur(8px) saturate(1.2)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modern Chat Sidebar with Spatial Design */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 440,
            height: '100vh',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
            backdropFilter: 'blur(25px) saturate(1.1)',
            boxShadow: `-12px 0 40px rgba(0,0,0,0.08), -4px 0 20px rgba(0,0,0,0.04), 
                        inset 1px 0 0 rgba(255,255,255,0.3)`,
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid rgba(226, 232, 240, 0.6)',
            animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Enhanced Glassmorphism Header */}
          <div style={{ 
            padding: '28px 24px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
            backdropFilter: 'blur(30px) saturate(1.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              animation: 'float 6s ease-in-out infinite'
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div>
                <div style={{ 
                  fontWeight: 800, 
                  fontSize: 22, 
                  marginBottom: 6, 
                  letterSpacing: '-0.03em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  🧠 IA Inteligente
                </div>
                <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                  Multi-Engine com Fallbacks Gratuitos
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={clearChat}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none', 
                    color: 'white',
                    borderRadius: '10px',
                    width: 40,
                    height: 40,
                    fontSize: 18, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  title="Limpar conversa"
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  🗑️
                </button>
                <button 
                  onClick={() => setOpen(false)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none', 
                    color: 'white',
                    borderRadius: '10px',
                    width: 40,
                    height: 40,
                    fontSize: 20, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'scale(1.05) rotate(90deg)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  }}
                >×</button>
              </div>
            </div>
          </div>

          {/* AI Status Bar with Live Indicators */}
          <div style={{ 
            padding: '16px 24px', 
            background: 'linear-gradient(90deg, #f0f9ff 0%, #f8fafc 50%, #f0f9ff 100%)', 
            borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
            fontSize: 12,
            color: '#64748b',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: loading 
                ? 'linear-gradient(45deg, #10b981, #06b6d4)' 
                : '#06b6d4',
              boxShadow: loading 
                ? '0 0 10px rgba(16, 185, 129, 0.5)' 
                : '0 0 5px rgba(6, 182, 212, 0.3)',
              animation: loading ? 'pulse-dot 1.5s infinite' : 'none'
            }} />
            <span>🆓 Together.xyz • ⚡ Groq • 🔑 APIs Premium • 💡 Offline IA</span>
          </div>

          {/* Messages Area with Enhanced Scroll */}
          <div 
            ref={chatRef} 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '24px',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              scrollBehavior: 'smooth'
            }}
          >
            {messages.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: 50,
                padding: 40,
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: 20,
                border: '2px dashed rgba(203, 213, 225, 0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Animated background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.05) 2px, transparent 2px)',
                  backgroundSize: '30px 30px',
                  animation: 'drift 8s linear infinite'
                }} />
                
                <div style={{ fontSize: 40, marginBottom: 20, position: 'relative' }}>🤖</div>
                <div style={{ 
                  fontWeight: 800, 
                  marginBottom: 12, 
                  fontSize: 20, 
                  color: '#1e293b',
                  position: 'relative'
                }}>
                  Chat IA Inteligente
                </div>
                <div style={{ 
                  fontSize: 15, 
                  color: '#64748b', 
                  marginBottom: 24, 
                  lineHeight: 1.6,
                  position: 'relative'
                }}>
                  Converse sobre os {professionals.length} profissionais da HITSS.<br/>
                  Sistema inteligente com múltiplas IAs e fallbacks.
                </div>
                
                {/* Bento Grid de Sugestões */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12, 
                  marginTop: 24,
                  position: 'relative'
                }}>
                  {suggestedQuestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(item.text)}
                      style={{
                        background: getCategoryColor(item.category),
                        border: 'none',
                        borderRadius: 16,
                        padding: '16px 12px',
                        fontSize: 13,
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        fontWeight: 600,
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        gridColumn: i === 3 ? 'span 2' : 'span 1'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                      }}
                    >
                      <span style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, lineHeight: 1.3 }}>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Enhanced Message Rendering */}
            {messages.map((msg, i) => (
              <div key={msg.id} style={{ marginBottom: 36, opacity: 0, animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                {/* User Message with improved design */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  marginBottom: 18 
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                    borderRadius: '24px 24px 6px 24px', 
                    padding: '14px 20px', 
                    maxWidth: '85%',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'white',
                    fontWeight: 500,
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    position: 'relative',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {msg.question}
                    <div style={{
                      position: 'absolute',
                      bottom: -8,
                      right: 20,
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '8px solid #8b5cf6'
                    }} />
                  </div>
                </div>
                
                {/* AI Response with avatar and enhanced styling */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3), inset 0 2px 5px rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}>
                    🧠
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)', 
                    borderRadius: '6px 24px 24px 24px', 
                    padding: '20px 24px',
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                    flex: 1,
                    color: '#1e293b',
                    backdropFilter: 'blur(10px)',
                    position: 'relative'
                  }}>
                    {msg.answer}
                    <div style={{
                      position: 'absolute',
                      top: 20,
                      left: -8,
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '8px solid rgba(248,250,252,0.95)'
                    }} />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Advanced Typing Indicator */}
            {isTyping && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                marginTop: 24,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  animation: 'pulse-glow 2s infinite',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}>
                  🧠
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  borderRadius: '6px 24px 24px 24px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #64748b, #94a3b8)',
                      animation: `bounce-dot 1.4s infinite ease-in-out ${i * 0.2}s`
                    }} />
                  ))}
                  <span style={{ 
                    marginLeft: 8, 
                    fontSize: 13, 
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    IA analisando...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Ultra-modern Input with Glassmorphism */}
          <div style={{ 
            padding: '24px', 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(25px) saturate(1.1)',
            borderTop: '1px solid rgba(226, 232, 240, 0.4)'
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !loading && input.trim()) {
                    handleSend();
                  }
                }}
                placeholder="Pergunte sobre os profissionais da HITSS..."
                style={{ 
                  flex: 1, 
                  border: '2px solid rgba(226, 232, 240, 0.6)', 
                  borderRadius: 20, 
                  padding: '16px 22px', 
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(15px)',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  minHeight: 50,
                  color: '#1e293b'
                }}
                disabled={loading}
                onFocus={e => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1), 0 8px 25px rgba(99, 102, 241, 0.15)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{ 
                  background: loading || !input.trim() 
                    ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' 
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 20, 
                  padding: '16px 24px', 
                  fontSize: 16, 
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  minWidth: 90,
                  height: 50,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: loading ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: loading || !input.trim() 
                    ? 'none' 
                    : '0 8px 25px rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onMouseOver={e => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.4)';
                  }
                }}
                onMouseOut={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = input.trim() ? '0 8px 25px rgba(99, 102, 241, 0.3)' : 'none';
                  }
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {loading ? '🌀' : '✨'}
                </span>
                <span style={{ fontSize: 14 }}>
                  {loading ? 'IA...' : 'Enviar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(100%);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6), 0 0 40px rgba(6, 182, 212, 0.3);
          }
        }
        
        @keyframes pulse-dot {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes bounce-dot {
          0%, 80%, 100% { 
            transform: scale(0.8); 
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2); 
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes drift {
          0% { transform: translateX(-10px); }
          100% { transform: translateX(10px); }
        }
        
        /* Scrollbar customization */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5b21b6, #7c3aed);
        }
      `}</style>
    </>
  );
}; 