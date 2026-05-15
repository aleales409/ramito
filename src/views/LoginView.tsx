import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Key, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useApp();
  const mode = location.state?.mode || 'register';
  const isRegister = mode === 'register';

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && pin) {
      try {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceType = isMobile ? 'mobile' : 'desktop';

        let profileId = '';
        let roleToAssign = 'player';

        if (isRegister) {
          // Check if name already exists
          const { data: existingUser } = await supabase.from('profiles').select('id').eq('name', name).maybeSingle();
          if (existingUser) {
            showToast('Acceso Denegado: Ya existe un jugador con este nombre.');
            return;
          }

          roleToAssign = pin === '123456' ? 'admin_elite' : (pin === '654321' ? 'admin_vip' : 'player');

          const { data: newUser, error: insertError } = await supabase.from('profiles')
            .insert([{ name, pin, role: roleToAssign }])
            .select()
            .single();

          if (insertError) {
             console.error(insertError);
             showToast('Error al crear perfil.');
             return;
          }
          profileId = newUser.id;
        } else {
          // Login flow
          const { data: user, error: userError } = await supabase.from('profiles').select('*').eq('name', name).maybeSingle();
          if (!user || user.pin !== pin) {
            showToast('Acceso Denegado: Nombre o PIN incorrectos.');
            return;
          }
          profileId = user.id;
          roleToAssign = user.role;
        }

        // Limit active sessions
        if (roleToAssign === 'player') {
          const { data: sessions } = await supabase.from('active_sessions').select('id').eq('profile_id', profileId);
          if (sessions && sessions.length > 0) {
            showToast('Acceso Denegado: Ya tienes una sesión activa en otro dispositivo.');
            return;
          }
        } else {
          const { data: sessions } = await supabase.from('active_sessions')
            .select('id')
            .eq('profile_id', profileId)
            .eq('device_type', deviceType);
          
          if (sessions && sessions.length > 0) {
            showToast(`Acceso Denegado: Ya tienes una sesión activa de administrador en un dispositivo tipo ${deviceType}.`);
            return;
          }
        }

        // Create new session
        const { data: newSession, error: sessionError } = await supabase.from('active_sessions')
          .insert([{ profile_id: profileId, device_type: deviceType }])
          .select()
          .single();

        if (sessionError) {
           console.error(sessionError);
           showToast('Error al crear sesión activa.');
           return;
        }

        localStorage.setItem('ramito_current_session_id', newSession.id);
        localStorage.setItem('ramito_user_id', profileId);
        localStorage.setItem('ramito_user_name', name);
        localStorage.setItem('ramito_user_pin', pin);
        localStorage.setItem('ramito_user_role', roleToAssign);
        navigate('/');

      } catch (err) {
        console.error(err);
        showToast('Error de conexión con la base de datos.');
      }
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
