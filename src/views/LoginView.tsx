import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Key, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || 'register';
  const isRegister = mode === 'register';

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && pin) {
      // Determine device type
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const deviceType = isMobile ? 'mobile' : 'desktop';
      
      // Get current sessions
      const activeSessionsStr = localStorage.getItem('ramito_active_sessions');
      const activeSessions: any[] = activeSessionsStr ? JSON.parse(activeSessionsStr) : [];
      
      const isAttemptingAdmin = name.toLowerCase().includes('admin') || pin === '123456' || pin === '654321';
      const roleToAssign = pin === '123456' ? 'admin_elite' : (pin === '654321' ? 'admin_vip' : 'player');

      if (roleToAssign === 'player') {
        const hasSession = activeSessions.some((s) => s.name === name);
        if (hasSession) {
          alert('Acceso Denegado: Ya tienes una sesión activa en otro dispositivo.');
          return;
        }
      } else {
        // Admin restriction: 1 mobile, 1 desktop max for this name
        const sameDeviceSession = activeSessions.find(s => s.name === name && s.deviceType === deviceType);
        if (sameDeviceSession) {
          alert(`Acceso Denegado: Ya hay un administrador activo en este tipo de dispositivo (${deviceType}).`);
          return;
        }
      }

      // Add to sessions
      const newSession = { name, role: roleToAssign, deviceType, id: Date.now() };
      localStorage.setItem('ramito_active_sessions', JSON.stringify([...activeSessions, newSession]));
      localStorage.setItem('ramito_current_session_id', newSession.id.toString());

      localStorage.setItem('ramito_user_name', name);
      localStorage.setItem('ramito_user_pin', pin);
      localStorage.setItem('ramito_user_role', roleToAssign);
      navigate('/');
    }
  };

  return (
    <main className="pt-32 pb-24 px-5 max-w-md mx-auto space-y-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 ${isRegister ? 'bg-[#4be277]/10' : 'bg-[#FF9100]/10'}`}>
          {isRegister ? <UserPlus className="w-8 h-8 text-[#4be277]" /> : <LogIn className="w-8 h-8 text-[#FF9100]" />}
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-black text-white uppercase italic tracking-tighter">
            {isRegister ? 'Crea tu Perfil' : 'Bienvenido de Nuevo'}
          </h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-widest">
            {isRegister ? 'Únete al Show de Ramito' : 'Ingresa tus credenciales'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-[0.2em] ml-2">Nombre del Jugador</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#bccbb9] group-focus-within:text-[#4be277] transition-colors" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NOMBRE"
                className="block w-full pl-12 pr-4 py-4 bg-[#1a1c1c] border border-white/10 rounded-2xl text-white font-black uppercase text-[11px] placeholder:text-[#bccbb9]/20 focus:border-[#4be277] focus:bg-white/[0.02] outline-none transition-all"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-[0.2em] ml-2">Pin de Acceso</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-[#bccbb9] group-focus-within:text-[#FF9100] transition-colors" />
              </div>
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="block w-full pl-12 pr-4 py-4 bg-[#1a1c1c] border border-white/10 rounded-2xl text-white font-black tracking-[0.8em] placeholder:text-[#bccbb9]/20 focus:border-[#FF9100] focus:bg-white/[0.02] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[#4be277] flex-shrink-0" />
          <p className="text-[9px] font-black text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed italic">
            Tu Pin es personal. No lo compartas con otros jugadores para mantener tu historial seguro.
          </p>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className={`w-full h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-3 uppercase tracking-[0.3em] italic transition-all shadow-xl ${
            isRegister 
              ? 'bg-[#4be277] text-[#121414] shadow-[#4be277]/20' 
              : 'bg-[#FF9100] text-[#121414] shadow-[#FF9100]/20'
          }`}
        >
          {isRegister ? 'Registrarme' : 'Entrar a Jugar'}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
    </main>
  );
}
