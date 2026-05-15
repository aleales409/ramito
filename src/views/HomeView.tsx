import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ShieldCheck, ChevronRight, X, Lock, User, AlertTriangle, MousePointer2, UserPlus, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HomeView() {
  const navigate = useNavigate();
  const { eliteKey, vipKey } = useApp();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState(false);
  const [usePattern, setUsePattern] = useState(false);
  const [pattern, setPattern] = useState<number[]>([]);

  const isLogged = !!localStorage.getItem('ramito_user_name');

  // Auto-login when credentials match
  React.useEffect(() => {
    const name = adminName.toLowerCase();
    if (name === 'elite' && adminKey === eliteKey) {
      localStorage.setItem('ramito_user_role', 'admin_elite');
      localStorage.setItem('ramito_user_name', 'Elite');
      navigate('/profile');
    } else if (name === 'vip' && adminKey === vipKey) {
      localStorage.setItem('ramito_user_role', 'admin_vip');
      localStorage.setItem('ramito_user_name', 'VIP');
      navigate('/profile');
    }
  }, [adminName, adminKey, eliteKey, vipKey, navigate]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(true);
    setTimeout(() => setError(false), 3000);
  };

  const handlePatternNode = (node: number) => {
    if (pattern.includes(node)) return;
    const newPattern = [...pattern, node];
    setPattern(newPattern);
    
    const patternStr = newPattern.join('');
    if (adminName.toLowerCase() === 'elite' && patternStr === eliteKey) {
      localStorage.setItem('ramito_user_role', 'admin_elite');
      navigate('/profile');
    } else if (adminName.toLowerCase() === 'vip' && patternStr === vipKey) {
      localStorage.setItem('ramito_user_role', 'admin_vip');
      navigate('/profile');
    }

    if (newPattern.length >= 6) {
      setTimeout(() => setPattern([]), 500);
    }
  };

  return (
    <main className="relative flex-grow flex flex-col items-center justify-end h-[100dvh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[#0d1f11]">
        <img
          alt="Ramito Fut Show Pitch"
          className="w-full h-full object-cover brightness-[0.7] contrast-[1.1] scale-105"
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop"
        />
        {/* Stadium Light Flares */}
        <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-[50%] h-[30%] bg-green-400/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        {/* Pitch Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#0d2e16]/20 to-[#121414] mix-blend-multiply"></div>
        
        {/* Grass Texture Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] pointer-events-none"></div>
        
        {/* Subtle Pitch Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[30%] left-[-10%] w-[120%] h-[1px] bg-white/5 rotate-[-2deg]"></div>
          <div className="absolute top-[60%] left-[-10%] w-[120%] h-[1px] bg-white/5 rotate-[-2deg]"></div>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="relative z-10 w-full px-5 flex flex-col items-center pb-32 space-y-10 max-w-md mx-auto h-full justify-end">
        {/* Logo Moment */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center justify-center mb-auto pt-12"
        >
          <div className="relative w-full flex flex-col items-center">
            {/* Logo Image if available, otherwise stylized text */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              <img 
                src="/logo-ramito.png" 
                alt="Ramito Fut Show" 
                className="w-64 h-auto relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  // Fallback to text if image fails
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('text-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            </div>

            {/* Text Logo Fallback (Hidden by default, shown if image fails) */}
            <div id="text-logo-fallback" className="hidden flex-col items-center justify-center w-full px-4">
              <h1 
                className="text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#FFA500] via-[#FF4500] to-[#8B0000] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                style={{
                  WebkitTextStroke: '2px #FFD700',
                  filter: 'drop-shadow(0px 8px 12px rgba(255, 69, 0, 0.6)) drop-shadow(0px 0px 30px rgba(255, 165, 0, 0.4))',
                  transform: 'rotate(-5deg)',
                  lineHeight: '0.85'
                }}
              >
                RAMITO
              </h1>
              <h2 
                className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#FFA500] via-[#FF4500] to-[#8B0000] mt-1 ml-12"
                style={{
                  WebkitTextStroke: '1.5px #FFD700',
                  filter: 'drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.8)) drop-shadow(0px 0px 20px rgba(255, 69, 0, 0.5))',
                  transform: 'rotate(-5deg)'
                }}
              >
                FUT SHOW
              </h2>
            </div>
          </div>
        </motion.div>
        {/* Interaction Section */}
        <div className="w-full flex flex-col gap-4">
          {!isLogged ? (
            <div className="flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login', { state: { mode: 'register' } })}
                className="group relative w-full flex flex-col items-center justify-center p-8 rounded-[2rem] bg-[#4be277]/15 border border-[#4be277]/30 backdrop-blur-xl text-white transition-all duration-300 overflow-hidden shadow-[0_10px_40px_rgba(75,226,119,0.15)] hover:bg-[#4be277]/25"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#4be277]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <UserPlus className="w-8 h-8 mb-2 text-[#4be277]" />
                <span className="font-display text-2xl font-black italic uppercase tracking-tighter text-[#4be277] drop-shadow-md">Nuevo Jugador</span>
                <span className="text-[9px] font-black text-[#bccbb9] uppercase tracking-[0.2em]">Registrar mi perfil</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login', { state: { mode: 'login' } })}
                className="group relative w-full flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white transition-all duration-300 hover:bg-white/10"
              >
                <span className="font-display text-lg font-black italic uppercase tracking-tighter">Ya soy Jugador</span>
                <span className="text-[8px] font-bold text-[#bccbb9]/70 uppercase tracking-[0.2em] mt-1">Ingresar a mi cuenta</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/booking')}
              className="group relative w-full flex flex-col items-center justify-center p-10 rounded-[2.5rem] bg-gradient-to-br from-[#FF9100]/20 to-[#D32F2F]/20 border border-[#FF9100]/30 backdrop-blur-xl text-white transition-all duration-300 overflow-hidden shadow-[0_20px_50px_rgba(255,145,0,0.15)] hover:from-[#FF9100]/30 hover:to-[#D32F2F]/30"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#FF9100]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Zap className="w-10 h-10 mb-3 text-[#FF9100] animate-pulse drop-shadow-[0_0_15px_rgba(255,145,0,0.8)]" />
              <span className="font-display text-3xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FF9100] to-[#FFD600] drop-shadow-md">Reservar Cancha</span>
              <span className="text-[10px] font-black text-[#bccbb9] mt-1 uppercase tracking-[0.3em]">Jugar en el Complejo</span>
            </motion.button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-grow bg-white/10"></div>
            <span className="text-[10px] font-bold text-[#bccbb9]/50 uppercase tracking-widest italic">o</span>
            <div className="h-[1px] flex-grow bg-white/10"></div>
          </div>

          {/* Acceso Staff */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdminLogin(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/5 text-[#e2e2e2] hover:bg-white/10 transition-all backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-6 h-6 text-[#4be277]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold uppercase tracking-wide text-white">Acceso Staff</span>
                <span className="text-[10px] font-semibold text-[#bccbb9]/70 uppercase">Panel de Administración</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#4be277]" />
          </motion.button>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="absolute inset-0 bg-[#000]/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1c1c] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-6 right-6 text-[#bccbb9] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-blue-500 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Acceso Staff</h3>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button 
                      onClick={() => setUsePattern(false)}
                      className={`text-[9px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${!usePattern ? 'text-[#FF9100] border-[#FF9100]' : 'text-[#bccbb9] border-transparent'}`}
                    >
                      Código
                    </button>
                    <button 
                      onClick={() => setUsePattern(true)}
                      className={`text-[9px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${usePattern ? 'text-[#FF9100] border-[#FF9100]' : 'text-[#bccbb9] border-transparent'}`}
                    >
                      Patrón
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="w-full space-y-8">
                  <div className="space-y-6 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Administrador</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9] group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="NOMBRE"
                          className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white font-black uppercase text-[11px] focus:border-blue-500/50 focus:bg-white/[0.06] outline-none transition-all placeholder:text-white/10"
                        />
                      </div>
                    </div>

                    {!usePattern ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Clave Secreta</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9] group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="••••••"
                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 text-white font-black tracking-[0.8em] focus:border-blue-500/50 focus:bg-white/[0.06] outline-none transition-all placeholder:text-white/10"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Dibujar Patrón</label>
                        <div className="grid grid-cols-3 gap-4 mx-auto w-fit p-4 bg-white/[0.02] rounded-3xl border border-white/5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((node) => (
                            <motion.button
                              key={node}
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handlePatternNode(node)}
                              className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                                pattern.includes(node) 
                                  ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                                  : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${pattern.includes(node) ? 'bg-white' : 'bg-white/20'}`} />
                            </motion.button>
                          ))}
                        </div>
                        <p className="text-center text-[8px] font-bold text-[#bccbb9] uppercase tracking-widest italic pt-2">
                          {pattern.length > 0 ? `Dibujando: ${pattern.length} nodos` : 'Toca los puntos en orden'}
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-500 justify-center bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">Acceso Denegado</span>
                    </motion.div>
                  )}
                  
                  <div className="pt-2">
                     <p className="text-center text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest"> 
                        Validación automática habilitada
                     </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

