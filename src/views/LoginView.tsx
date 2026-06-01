import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Key, ShieldCheck, ArrowRight, UserPlus, LogIn, Crown, Gem, Activity } from 'lucide-react';

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, setUserName, setUserRole } = useApp();
  const mode = location.state?.mode || 'register';
  const isRegister = mode === 'register';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  // Helper for localStorage profiles when offline or Supabase is unconfigured
  const getLocalProfiles = () => {
    const saved = localStorage.getItem('ramito_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Initial mock profile list with master access
    return [
      { id: 'master_access_elite', email: 'admin@ramito.com', password: '123456', name: 'Elite Admin', role: 'admin_elite', pin: '123456' },
      { id: 'master_access_vip', email: 'vip@ramito.com', password: '654321', name: 'VIP Admin', role: 'admin_vip', pin: '654321' },
      { id: 'player_1', email: 'user@ramito.com', password: 'password', name: 'Agus Castro', role: 'player', pin: '' }
    ];
  };

  const saveLocalProfile = (profile: any) => {
    const profiles = getLocalProfiles();
    profiles.push(profile);
    localStorage.setItem('ramito_profiles', JSON.stringify(profiles));
  };

  // Auto-Login for players
  React.useEffect(() => {
    const autoLogin = async () => {
      if (!isRegister && email && password.length >= 4) {
        if (isSupabaseConfigured) {
          const { data: user } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle();
          if (user && user.password === password) {
            completeLogin(user);
          }
        } else {
          const profiles = getLocalProfiles();
          const user = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());
          if (user && user.password === password) {
            completeLogin(user);
          }
        }
      }
    };
    autoLogin();
  }, [password, email, isRegister]);

  const completeLogin = async (user: any) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    let sessionId = 'mock_session_' + Date.now();

    if (isSupabaseConfigured) {
      // Limit active sessions for players
      if (user.role === 'player') {
        const { data: sessions } = await supabase.from('active_sessions').select('id').eq('profile_id', user.id);
        if (sessions && sessions.length > 0) {
          showToast('Ya tienes una sesión activa.');
          return;
        }
      }

      const { data: newSession, error: sessionError } = await supabase.from('active_sessions')
        .insert([{ profile_id: user.id, device_type: deviceType }])
        .select()
        .single();

      if (sessionError) {
         showToast(`Error: ${sessionError.message}`);
         return;
      }
      sessionId = newSession.id;
    }

    localStorage.setItem('ramito_current_session_id', sessionId);
    localStorage.setItem('ramito_user_id', user.id);
    localStorage.setItem('ramito_user_name', user.name || 'Usuario');
    localStorage.setItem('ramito_user_role', user.role);
    setUserName(user.name || 'Usuario');
    setUserRole(user.role);
    
    showToast(`¡Bienvenido, ${user.name}!`, 'success');
    if (user.role === 'admin_elite' || user.role === 'admin_vip') {
      navigate('/profile?view=admin_selection');
    } else {
      navigate('/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Completa todos los campos');
      return;
    }

    try {
      if (isRegister) {
        if (isSupabaseConfigured) {
          const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).maybeSingle();
          if (existingUser) {
            showToast('El correo ya está registrado.');
            return;
          }

          const currentEliteKey = localStorage.getItem('ramito_elite_key') || '123456';
          const currentVipKey = localStorage.getItem('ramito_vip_key') || '654321';
          const roleToAssign = pin === currentEliteKey ? 'admin_elite' : (pin === currentVipKey ? 'admin_vip' : 'player');
          const { data: newUser, error: insertError } = await supabase.from('profiles')
            .insert([{ email: email.toLowerCase(), password, name, pin, role: roleToAssign }])
            .select()
            .single();

          if (insertError) {
             showToast('Error al crear cuenta.');
             return;
          }
          await completeLogin(newUser);
        } else {
          const profiles = getLocalProfiles();
          const existingUser = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            showToast('El correo ya está registrado.');
            return;
          }

          const currentEliteKey = localStorage.getItem('ramito_elite_key') || '123456';
          const currentVipKey = localStorage.getItem('ramito_vip_key') || '654321';
          const roleToAssign = pin === currentEliteKey ? 'admin_elite' : (pin === currentVipKey ? 'admin_vip' : 'player');
          const newUser = {
            id: 'mock_userId_' + Date.now(),
            email: email.toLowerCase(),
            password,
            name,
            pin,
            role: roleToAssign
          };
          saveLocalProfile(newUser);
          await completeLogin(newUser);
        }
      } else {
        if (isSupabaseConfigured) {
          const { data: user } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle();
          if (!user || user.password !== password) {
            showToast('Correo o Llave incorrectos.');
            return;
          }
          await completeLogin(user);
        } else {
          const profiles = getLocalProfiles();
          const user = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());
          if (!user || user.password !== password) {
            showToast('Correo o Llave incorrectos.');
            return;
          }
          await completeLogin(user);
        }
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <main className="pt-24 pb-32 px-5 w-full max-w-5xl md:max-w-6xl mx-auto min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* Form login/register */}
        <div className="space-y-8 bg-black/30 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border border-white/10 ${isRegister ? 'bg-[#4be277]/10' : 'bg-[#FF9100]/10'}`}>
              {isRegister ? <UserPlus className="w-8 h-8 text-[#4be277]" /> : <LogIn className="w-8 h-8 text-[#FF9100]" />}
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-3xl font-black text-white uppercase italic tracking-tighter">
                {isRegister ? 'Crea tu Perfil' : 'Ingreso al Show'}
              </h2>
              <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-widest">
                {isRegister ? 'Define tu llave de acceso' : 'Usa tu correo y tu llave'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest ml-2">Correo Electrónico</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bccbb9] group-focus-within:text-[#4be277] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="TU@CORREO.COM"
                    className="block w-full pl-12 pr-4 py-4 glass-panel border border-white/10 rounded-2xl text-white font-black uppercase text-[11px] focus:border-[#4be277] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest ml-2">Llave de Acceso</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bccbb9] group-focus-within:text-[#FF9100] transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-12 pr-4 py-4 glass-panel border border-white/10 rounded-2xl text-white font-black tracking-[0.3em] focus:border-[#FF9100] outline-none"
                  />
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest ml-2">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="COMO TE LLAMAS"
                      className="block w-full px-5 py-4 glass-panel border border-white/10 rounded-2xl text-white font-black uppercase text-[11px] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest ml-2">Código Especial (Opcional)</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••••"
                      className="block w-full px-5 py-4 glass-panel border border-white/10 rounded-2xl text-white font-black tracking-[0.8em] outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`w-full h-16 rounded-2xl font-black text-xs flex items-center justify-center gap-3 uppercase tracking-[0.3em] italic transition-all shadow-xl ${
                isRegister ? 'bg-[#4be277] text-[#121414]' : 'bg-[#FF9100] text-[#121414]'
              }`}
            >
              {isRegister ? 'Registrarme' : 'Entrar Ahora'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </main>
  );
}
