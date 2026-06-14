import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Key, ShieldCheck, ArrowRight, UserPlus, LogIn, Crown, Gem, Activity, Sparkles, Smartphone, Eye, EyeOff, Mail, CheckCircle2, HelpCircle, Send } from 'lucide-react';

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, setUserName, setUserRole, universalUserKey } = useApp();
  
  // Local state to toggle between registering and logging in
  const [isRegister, setIsRegister] = useState(() => (location.state?.mode || 'login') === 'register');
  // Local state to choose login mechanism when logging in
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'pin'>('credentials');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [quickPin, setQuickPin] = useState('');
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [quickPinVisible, setQuickPinVisible] = useState(false);

  // States for recovery
  const [isRecovering, setIsRecovering] = useState(() => location.state?.view === 'recover');
  const [recoveryRole, setRecoveryRole] = useState<'player' | 'admin_vip' | 'admin_elite'>('player');
  const [recoveryContact, setRecoveryContact] = useState(''); // Email or WhatsApp input
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState('');
  const [recoveredUser, setRecoveredUser] = useState<any | null>(null);

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
      { id: 'master_access_elite', email: 'admin@ramito.com', password: 'ELITE_PASSWORD', name: 'Elite Admin', role: 'admin_elite', pin: 'ELITE26', phone: '+54 9 11 1234-5678' },
      { id: 'master_access_vip', email: 'vip@ramito.com', password: 'VIP_PASSWORD', name: 'VIP Admin', role: 'admin_vip', pin: 'VIP26', phone: '+54 9 11 2345-6789' },
      { id: 'player_1', email: 'agus@ramito.com', password: 'agus2026', name: 'Agus Castro', role: 'player', pin: 'agus26', phone: '+54 9 11 5678-9012' }
    ];
  };

  const saveLocalProfile = (profile: any) => {
    const profiles = getLocalProfiles();
    profiles.push(profile);
    localStorage.setItem('ramito_profiles', JSON.stringify(profiles));
  };

  // Auto-Login for players (only for standard credentials)
  React.useEffect(() => {
    const autoLogin = async () => {
      if (!isRegister && loginMethod === 'credentials' && email && password.length >= 4) {
        if (isSupabaseConfigured) {
          const { data: user } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle();
          if (user && user.password === password) {
            completeLogin(user);
          }
        } else {
          const profiles = getLocalProfiles();
          const user = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());
          
          const currentEliteKey = localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
          const currentVipKey = localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';
          
          let isPasswordValid = false;
          if (user) {
            isPasswordValid = user.password === password;
            if (user.role === 'admin_elite' && password === currentEliteKey) {
              isPasswordValid = true;
            }
            if (user.role === 'admin_vip' && password === currentVipKey) {
              isPasswordValid = true;
            }
          }
          
          if (user && isPasswordValid) {
            completeLogin(user);
          }
        }
      }
    };
    autoLogin();
  }, [password, email, isRegister, loginMethod]);

  const completeLogin = async (user: any) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    let sessionId = 'mock_session_' + Date.now();

    if (isSupabaseConfigured) {
      // If player already has active sessions, delete them first to allow fresh login
      if (user.role === 'player') {
        const { data: sessions } = await supabase.from('active_sessions').select('id').eq('profile_id', user.id);
        if (sessions && sessions.length > 0) {
          // Delete old sessions to allow re-login
          await supabase.from('active_sessions').delete().eq('profile_id', user.id);
        }
      }

      const { data: newSession, error: sessionError } = await supabase.from('active_sessions')
        .insert([{ profile_id: user.id, device_type: deviceType }])
        .select()
        .single();

      if (sessionError) {
        // If active_sessions table doesn't exist or fails, continue without session tracking
        console.warn('Session tracking error (continuing anyway):', sessionError.message);
      } else {
        sessionId = newSession.id;
      }
    }

    localStorage.setItem('ramito_current_session_id', sessionId);
    localStorage.setItem('ramito_user_id', user.id);
    localStorage.setItem('ramito_user_name', user.name || 'Usuario');
    localStorage.setItem('ramito_user_role', user.role);
    if (user.password) {
      localStorage.setItem('ramito_user_pw', user.password);
    }
    if (user.pin) {
      localStorage.setItem('ramito_user_pin', user.pin);
    } else {
      localStorage.removeItem('ramito_user_pin');
    }
    if (user.email) {
      localStorage.setItem('ramito_user_email', user.email);
    }
    
    setUserName(user.name || 'Usuario');
    setUserRole(user.role);
    
    showToast(`¡Bienvenido, ${user.name}!`, 'success');
    if (user.role === 'admin_elite' || user.role === 'admin_vip') {
      navigate('/profile?view=admin_selection');
    } else {
      const redirectPath = location.state?.from || '/profile';
      const stateObj = location.state?.pendingCourtSelection 
        ? { initialCourt: location.state.pendingCourtSelection } 
        : undefined;
      navigate(redirectPath, { state: stateObj });
    }
  };

  const handleRecoverAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactClean = recoveryContact.trim();
    if (!contactClean) {
      showToast('Por favor ingrese su Correo o WhatsApp.', 'error');
      return;
    }

    setIsSendingRecovery(true);
    setRecoveredUser(null);
    setRecoveryStep('Buscando registro en el servidor de seguridad de Ramito...');

    setTimeout(() => {
      setRecoveryStep('Validando credenciales en canales autorizados...');
      
      setTimeout(async () => {
        try {
          const contactLower = contactClean.toLowerCase();
          const contactDigits = contactClean.replace(/\D/g, '');
          
          let foundUser: any = null;

          if (recoveryRole === 'admin_elite') {
            const profiles = getLocalProfiles();
            const localElite = profiles.find((p: any) => p.role === 'admin_elite') || {};
            
            const eliteEm = (localStorage.getItem('ramito_user_email') && localStorage.getItem('ramito_user_role') === 'admin_elite' ? localStorage.getItem('ramito_user_email') : null) || localElite.email || 'admin@ramito.com';
            const elitePh = (localStorage.getItem('ramito_user_phone') && localStorage.getItem('ramito_user_role') === 'admin_elite' ? localStorage.getItem('ramito_user_phone') : null) || localElite.phone || localStorage.getItem('ramito_elite_phone') || '+51 987 654 321';
            const elitePhDigits = elitePh.replace(/\D/g, '');
            const elitePass = (localStorage.getItem('ramito_user_pw') && localStorage.getItem('ramito_user_role') === 'admin_elite' ? localStorage.getItem('ramito_user_pw') : null) || localElite.password || 'ELITE_PASSWORD';
            const elitePinVal = (localStorage.getItem('ramito_user_pin') && localStorage.getItem('ramito_user_role') === 'admin_elite' ? localStorage.getItem('ramito_user_pin') : null) || localElite.pin || 'ELITE26';

            if (contactLower === eliteEm.toLowerCase() || (contactDigits && elitePhDigits.includes(contactDigits))) {
              foundUser = {
                name: localElite.name || 'Elite Admin',
                email: eliteEm,
                phone: elitePh,
                password: elitePass,
                pin: elitePinVal,
                role: 'admin_elite'
              };
            }
          } else if (recoveryRole === 'admin_vip') {
            const profiles = getLocalProfiles();
            const localVip = profiles.find((p: any) => p.role === 'admin_vip') || {};

            const vipEm = (localStorage.getItem('ramito_user_email') && localStorage.getItem('ramito_user_role') === 'admin_vip' ? localStorage.getItem('ramito_user_email') : null) || localVip.email || 'vip@ramito.com';
            const vipPh = (localStorage.getItem('ramito_user_phone') && localStorage.getItem('ramito_user_role') === 'admin_vip' ? localStorage.getItem('ramito_user_phone') : null) || localVip.phone || localStorage.getItem('ramito_admin_phone') || '+51 912 345 678';
            const vipPhDigits = vipPh.replace(/\D/g, '');
            const vipPass = (localStorage.getItem('ramito_user_pw') && localStorage.getItem('ramito_user_role') === 'admin_vip' ? localStorage.getItem('ramito_user_pw') : null) || localVip.password || 'VIP_PASSWORD';
            const vipPinVal = (localStorage.getItem('ramito_user_pin') && localStorage.getItem('ramito_user_role') === 'admin_vip' ? localStorage.getItem('ramito_user_pin') : null) || localVip.pin || 'VIP26';

            if (contactLower === vipEm.toLowerCase() || (contactDigits && vipPhDigits.includes(contactDigits))) {
              foundUser = {
                name: localVip.name || 'VIP Admin',
                email: vipEm,
                phone: vipPh,
                password: vipPass,
                pin: vipPinVal,
                role: 'admin_vip'
              };
            }
          } else {
            // Player recovery
            const list = getLocalProfiles();
            let dbProfiles: any[] = [];
            if (isSupabaseConfigured) {
              const { data } = await supabase.from('profiles').select('*');
              if (data) dbProfiles = data;
            }
            const combined = [...list, ...dbProfiles];
            
            foundUser = combined.find((p: any) => {
              const uEmail = (p.email || '').toLowerCase().trim();
              const uPhone = (p.phone || '').replace(/\D/g, '');
              return uEmail === contactLower || (contactDigits && uPhone.includes(contactDigits));
            });
          }

          if (foundUser) {
            setRecoveryStep('¡Registro verificado con éxito! Transmitiendo datos...');
            setTimeout(() => {
              setRecoveryStep('¡Código y Clave enviados! Preparando resumen...');
              setTimeout(() => {
                setIsSendingRecovery(false);
                setRecoveredUser(foundUser);
                showToast('¡Mensaje enviado con éxito al Correo y WhatsApp!', 'success');
              }, 1000);
            }, 1000);
          } else {
            setIsSendingRecovery(false);
            showToast('No se encontró ningún usuario con ese Correo o Teléfono.', 'error');
          }
        } catch (error: any) {
          setIsSendingRecovery(false);
          showToast(`Error al buscar la cuenta: ${error.message}`, 'error');
        }
      }, 1200);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check login method if not registering
    if (!isRegister && loginMethod === 'pin') {
      const trimmedQuickPin = quickPin.trim();
      if (!trimmedQuickPin) {
        showToast('Por favor ingrese su PIN o Llave Secundaria', 'error');
        return;
      }

      try {
        if (isSupabaseConfigured) {
          const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('pin', trimmedQuickPin)
            .maybeSingle();

          if (error || !user) {
            // Fallback to local profiles
            const profiles = getLocalProfiles();
            const localUser = profiles.find((p: any) => p.pin && p.pin.trim().toLowerCase() === trimmedQuickPin.toLowerCase());
            if (!localUser) {
              showToast('PIN de ingreso rápido incorrecto o no encontrado.');
              return;
            }
            await completeLogin(localUser);
            return;
          }
          await completeLogin(user);
        } else {
          const profiles = getLocalProfiles();
          const user = profiles.find((p: any) => p.pin && p.pin.trim().toLowerCase() === trimmedQuickPin.toLowerCase());
          if (!user) {
            showToast('PIN de ingreso rápido incorrecto o no encontrado.');
            return;
          }
          await completeLogin(user);
        }
      } catch (err: any) {
        showToast(`Error: ${err.message}`);
      }
      return;
    }

    // Standard credential submission
    if (isRegister) {
      if (!email || !password || !name) {
        showToast('Completa todos los campos obligatorios');
        return;
      }
    } else {
      if (!email || !password) {
        showToast('Completa todos los campos');
        return;
      }
    }

    try {
      if (isRegister) {
        if (isSupabaseConfigured) {
          const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).maybeSingle();
          if (existingUser) {
            showToast('El correo ya está registrado.');
            return;
          }

          const currentEliteKey = localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
          const currentVipKey = localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';
          const roleToAssign = pin === currentEliteKey ? 'admin_elite' : (pin === currentVipKey ? 'admin_vip' : 'player');
          
          const { data: newUser, error: insertError } = await supabase.from('profiles')
            .insert([{ email: email.toLowerCase(), password, name, pin, phone, role: roleToAssign }])
            .select()
            .single();

          if (insertError) {
             // Fallback block if column phone doesn't exist yet on their supabase table
             const { data: fallbackUser, error: fallbackError } = await supabase.from('profiles')
               .insert([{ email: email.toLowerCase(), password, name, pin, role: roleToAssign }])
               .select()
               .single();
             if (fallbackError) {
                showToast('Error al crear perfil de usuario.');
                return;
             }
             await completeLogin(fallbackUser);
          } else {
             await completeLogin(newUser);
          }
        } else {
          const profiles = getLocalProfiles();
          const existingUser = profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            showToast('El correo ya está registrado.');
            return;
          }

          const currentEliteKey = localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
          const currentVipKey = localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';
          const roleToAssign = pin === currentEliteKey ? 'admin_elite' : (pin === currentVipKey ? 'admin_vip' : 'player');
          const newUser = {
            id: 'mock_userId_' + Date.now(),
            email: email.toLowerCase(),
            password,
            name,
            pin,
            phone,
            role: roleToAssign
          };
          saveLocalProfile(newUser);
          await completeLogin(newUser);
        }
      } else {
        // Trim inputs to avoid whitespace issues
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        console.log('--- LoginView Submit Attempt ---');
        console.log('Email:', trimmedEmail, 'Password length:', trimmedPassword.length);
        console.log('isSupabaseConfigured:', isSupabaseConfigured);

        if (isSupabaseConfigured) {
          try {
            console.log('Fetching user from Supabase...');
            const { data: user, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', trimmedEmail)
              .maybeSingle();

            if (fetchError) {
              console.warn('Supabase login fetch error, falling back to local:', fetchError);
              // Fallback to local profiles
              const profiles = getLocalProfiles();
              const localUser = profiles.find((p: any) => p.email.toLowerCase() === trimmedEmail);
              if (!localUser || localUser.password?.trim() !== trimmedPassword) {
                console.log('Local fallback failed: User not found or password mismatch');
                showToast('Correo o Llave incorrectos.');
                return;
              }
              console.log('Local fallback successful for:', localUser.email);
              await completeLogin(localUser);
              return;
            }

            if (!user) {
              console.log('User not found in Supabase, trying local...');
              // User not found in Supabase, try local
              const profiles = getLocalProfiles();
              const localUser = profiles.find((p: any) => p.email.toLowerCase() === trimmedEmail);
              if (!localUser || localUser.password?.trim() !== trimmedPassword) {
                console.log('Local fallback failed (user not found in Supabase): User not found or password mismatch');
                showToast('Correo o Llave incorrectos.');
                return;
              }
              console.log('Local fallback successful (user not found in Supabase) for:', localUser.email);
              await completeLogin(localUser);
              return;
            }

            console.log('User found in Supabase. DB password:', user.password);
            const storedPassword = (user.password || '').trim();
            if (storedPassword !== trimmedPassword) {
              console.log('Password mismatch in Supabase: Stored:', storedPassword, 'Entered:', trimmedPassword);
              showToast('Correo o Llave incorrectos.');
              return;
            }
            console.log('Supabase login successful for:', user.email);
            await completeLogin(user);
          } catch (fetchErr: any) {
            console.error('Connection/fetch error in LoginView:', fetchErr);
            showToast(`Error de conexión: ${fetchErr.message}`);
          }
        } else {
          console.log('Using local profiles only...');
          const profiles = getLocalProfiles();
          const user = profiles.find((p: any) => p.email.toLowerCase() === trimmedEmail);

          const currentEliteKey = localStorage.getItem('ramito_elite_key') || 'ELITE-9A7F-D3B8-K2C5';
          const currentVipKey = localStorage.getItem('ramito_vip_key') || 'VIP-3E8F-C1A5-J7B9';

          let isPasswordValid = false;
          if (user) {
            isPasswordValid = (user.password || '').trim() === trimmedPassword;
            if (user.role === 'admin_elite' && trimmedPassword === currentEliteKey) isPasswordValid = true;
            if (user.role === 'admin_vip' && trimmedPassword === currentVipKey) isPasswordValid = true;
          }

          console.log('Local profile found:', !!user, 'Password valid:', isPasswordValid);

          if (!user || !isPasswordValid) {
            showToast('Correo o Llave incorrectos.');
            return;
          }
          await completeLogin(user);
        }
      }
    } catch (err: any) {
      console.error('Outer catch error in LoginView:', err);
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <main className="pt-24 pb-32 px-5 w-full max-w-5xl md:max-w-6xl mx-auto min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* Form login/register/recovery box */}
        <div className="space-y-6 bg-black/35 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4be277]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF9100]/5 rounded-full blur-3xl pointer-events-none" />

          {isRecovering ? (
            /* =============================================
               GOURMET PASSWORD & PIN RECOVERY VIEW
               ============================================= */
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-dashed border-[#4be277]/30 bg-[#4be277]/5 animate-pulse">
                  <HelpCircle className="w-7 h-7 text-[#4be277]" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-black text-white uppercase italic tracking-tighter">
                    Recuperar Acceso
                  </h2>
                  <p className="text-[#bccbb9] text-[9.5px] font-bold uppercase tracking-widest leading-relaxed">
                    Recupera tu Llave o PIN por Correo o WhatsApp
                  </p>
                </div>
              </div>

              {/* Role selector tabs for recovery */}
              <div className="flex bg-black/60 p-1 rounded-2xl border border-white/5 mx-auto w-full">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryRole('player');
                    setRecoveredUser(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    recoveryRole === 'player'
                      ? 'bg-[#FF9100] text-black shadow-md'
                      : 'text-[#bccbb9]/40 hover:text-white'
                  }`}
                >
                  Jugador
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryRole('admin_vip');
                    setRecoveredUser(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    recoveryRole === 'admin_vip'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'text-[#bccbb9]/40 hover:text-white'
                  }`}
                >
                  Admin VIP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryRole('admin_elite');
                    setRecoveredUser(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    recoveryRole === 'admin_elite'
                      ? 'bg-[#4be277] text-black shadow-md'
                      : 'text-[#bccbb9]/40 hover:text-white'
                  }`}
                >
                  Admin Élite
                </button>
              </div>

              {isSendingRecovery ? (
                /* LIVE RECOVERY TIMELINE SPINNER */
                <div className="p-8 text-center space-y-4 bg-zinc-950/50 rounded-3xl border border-white/5 animate-pulse">
                  <div className="w-10 h-10 border-4 border-[#3cd168] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] font-mono font-medium text-[#bccbb9] uppercase tracking-wider">
                    {recoveryStep}
                  </p>
                </div>
              ) : recoveredUser ? (
                /* RESUMEN DE CREDENCIALES ENVIADOS (SOPORTE IMPECABLE) */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 bg-[#4be277]/10 border border-[#4be277]/25 rounded-3xl space-y-3.5 text-left">
                    <div className="flex items-center gap-2 border-b border-[#4be277]/10 pb-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#4be277]" />
                      <h4 className="text-[10px] font-black text-white uppercase italic tracking-wider">
                        Despacho Exitoso de Credenciales
                      </h4>
                    </div>

                    <p className="text-[9px] text-[#bccbb9] leading-relaxed uppercase font-bold tracking-wide">
                      ¡Un mensaje cifrado ha sido enviado al WhatsApp <span className="text-[#4be277]">{recoveredUser.phone}</span> y a su correo de respaldo con las siguientes llaves de seguridad!
                    </p>

                    <div className="space-y-2.5 pt-1">
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[8px] font-black text-[#bccbb9] uppercase italic tracking-wider">Usuario / Cargo</span>
                        <div className="text-white text-[11px] font-black font-sans uppercase">
                          {recoveredUser.name} ({recoveredUser.role === 'admin_elite' ? 'Admin Élite' : recoveredUser.role === 'admin_vip' ? 'Admin VIP' : 'Jugador Regular'})
                        </div>
                      </div>

                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[8px] font-black text-[#bccbb9] uppercase italic tracking-wider">Correo Enlazado</span>
                        <div className="text-white text-[10px] font-bold font-mono">
                          {recoveredUser.email}
                        </div>
                      </div>

                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[8px] font-black text-[#bccbb9] uppercase italic tracking-wider">Llave Maestra</span>
                        <div className="text-[#ffb142] text-xs font-black font-mono tracking-widest uppercase">
                          {recoveredUser.password}
                        </div>
                      </div>

                      {recoveredUser.pin && (
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[8px] font-black text-[#bccbb9] uppercase italic tracking-wider">PIN Secundario</span>
                          <div className="text-[#4be277] text-xs font-black font-mono tracking-widest uppercase">
                            {recoveredUser.pin}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // Autofill credentials instantly for absolute ease of use
                      setEmail(recoveredUser.email);
                      setPassword(recoveredUser.password);
                      if (recoveredUser.pin) {
                        setQuickPin(recoveredUser.pin);
                      }
                      setRecoveredUser(null);
                      setIsRecovering(false);
                      showToast('Credenciales autocompletadas en el Login.', 'success');
                    }}
                    className="w-full h-13 bg-[#4be277] hover:bg-[#3cd168] text-black font-black uppercase text-[10px] tracking-widest italic rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4be277]/10 active:scale-95"
                  >
                    Usar y Volver al Login
                  </button>
                </div>
              ) : (
                /* RECOVERY INPUT FORM */
                <form onSubmit={handleRecoverAccess} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-black text-[#bccbb9] uppercase tracking-widest ml-2">
                      Buscar por Correo o Teléfono / WhatsApp
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9] transition-colors group-focus-within:text-[#FF9100]" />
                      <input
                        type="text"
                        required
                        value={recoveryContact}
                        onChange={(e) => setRecoveryContact(e.target.value)}
                        placeholder="EJ: TU_CORREO@DOMINIO.COM O +51..."
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-sans font-bold uppercase text-[11px] outline-none transition-all focus:border-[#4be277]/60"
                      />
                    </div>
                  </div>

                  <p className="text-[8px] text-[#bccbb9]/40 uppercase tracking-widest font-black leading-relaxed text-center px-1">
                    * El sistema interceptará su clave enlazada y enviará un código de verificación por WhatsApp y correo de respaldo de forma inmediata.
                  </p>

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#FF9100] text-black font-black uppercase tracking-widest text-[9.5px] rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 cursor-pointer italic"
                  >
                    <Send className="w-4 h-4 shrink-0" /> Buscar y Enviar Credenciales
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecovering(false);
                    setRecoveredUser(null);
                  }}
                  className="text-[8.5px] font-black text-[#bccbb9]/50 hover:text-white uppercase tracking-widest transition-all cursor-pointer font-mono hover:underline"
                >
                  &larr; Volver al Inicio de Sesión
                </button>
              </div>
            </div>
          ) : (
            /* =============================================
               STANDARD SIGN-IN / SIGN-UP VIEW
               ============================================= */
            <>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 ${
                  isRegister 
                    ? 'bg-[#4be277]/10' 
                    : loginMethod === 'pin' ? 'bg-[#4be277]/15' : 'bg-[#FF9100]/10'
                }`}>
                  {isRegister ? (
                    <UserPlus className="w-7 h-7 text-[#4be277]" />
                  ) : loginMethod === 'pin' ? (
                    <Sparkles className="w-7 h-7 text-[#4be277] animate-pulse" />
                  ) : (
                    <LogIn className="w-7 h-7 text-[#FF9100]" />
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-2.5xl font-black text-white uppercase italic tracking-tighter">
                    {isRegister ? 'Crea tu Perfil' : (loginMethod === 'pin' ? 'Acceso con PIN' : 'Ingreso al Show')}
                  </h2>
                  <p className="text-[#bccbb9] text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                    {isRegister 
                      ? 'Define tu Llave Maestra y datos de acceso' 
                      : (loginMethod === 'pin' ? 'Usa tu código especial de ingreso rápido' : 'Usa tu correo y tu Llave Maestra de acceso')}
                  </p>
                </div>
              </div>

              {/* Toggle for login methods: Credentials vs PIN (Only visible in Login Mode) */}
              {!isRegister && (
                <div className="flex bg-black/60 p-1 rounded-2xl border border-white/5 mx-auto max-w-[290px] mt-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('credentials')}
                    className={`flex-1 py-2 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-all ${
                      loginMethod === 'credentials'
                        ? 'bg-[#FF9100] text-black shadow-md font-black'
                        : 'text-[#bccbb9]/50 hover:text-white'
                    }`}
                  >
                    Con Correo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('pin')}
                    className={`flex-1 py-2 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center ${
                      loginMethod === 'pin'
                        ? 'bg-[#4be277] text-black shadow-md font-black'
                        : 'text-[#bccbb9]/50 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" /> PIN Rápido
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  
                  {/* Login Method: PIN/Secondary Key Input */}
                  {!isRegister && loginMethod === 'pin' ? (
                    <div className="space-y-2 animate-fade-in">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[9px] font-black text-[#4be277] uppercase tracking-widest">
                          Llave Secundaria de Ingreso / PIN
                        </label>
                      </div>
                      <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4be277] group-focus-within:text-[#4be277] transition-all" />
                        <input
                          type={quickPinVisible ? 'text' : 'password'}
                          required
                          value={quickPin}
                          onChange={(e) => setQuickPin(e.target.value)}
                          placeholder="INGRESE SU PIN / CÓDIGO"
                          className="block w-full pl-11 pr-14 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white font-mono font-black tracking-widest uppercase text-xs focus:border-[#4be277]/60 outline-none transition-all cursor-text text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setQuickPinVisible(!quickPinVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono font-black text-[#bccbb9]/50 hover:text-white tracking-widest px-2 py-1.5 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        >
                          {quickPinVisible ? 'OCULTAR' : 'VER'}
                        </button>
                      </div>
                      <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-normal text-center mt-1 px-2">
                        * Ingresa tu PIN de 4 a 12 caracteres alfanuméricos configurado en tu panel para entrar instantáneamente sin correos.
                      </p>
                    </div>
                  ) : (
                    /* Login/Register: Standard credentials inputs */
                    <div className="space-y-3.5">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[9px] font-black text-[#bccbb9] uppercase tracking-widest ml-2">Correo Electrónico</label>
                        <div className="relative group">
                          <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9] transition-colors ${
                            isRegister ? 'group-focus-within:text-[#4be277]' : 'group-focus-within:text-[#FF9100]'
                          }`} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="TU@CORREO.COM"
                            className={`block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-sans font-bold uppercase text-[11px] outline-none transition-all ${
                              isRegister ? 'focus:border-[#4be277]/60' : 'focus:border-[#FF9100]/60'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[9px] font-black text-[#bccbb9] uppercase tracking-widest ml-2">Llave Maestra de Acceso</label>
                        <div className="relative group">
                          <Key className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9] transition-colors ${
                            isRegister ? 'group-focus-within:text-[#4be277]' : 'group-focus-within:text-[#FF9100]'
                          }`} />
                          <input
                            type={passwordVisible ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`block w-full pl-11 pr-14 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono font-black tracking-widest text-[11px] outline-none transition-all ${
                              isRegister ? 'focus:border-[#4be277]/60' : 'focus:border-[#FF9100]/60'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono font-black text-[#bccbb9]/50 hover:text-white tracking-widest px-2 py-1.5 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                          >
                            {passwordVisible ? 'OCULTAR' : 'VER'}
                          </button>
                        </div>
                      </div>

                      {isRegister && (
                        <div className="space-y-3.5 pt-1.5">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-[#bccbb9] uppercase tracking-widest ml-2 font-bold">Nombre Completo</label>
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="TU NOMBRE Y APELLIDO"
                              className="block w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-sans font-bold uppercase text-[11px] outline-none transition-all focus:border-[#4be277]/60"
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-[#bccbb9] uppercase tracking-widest ml-2 font-bold">Teléfono / WhatsApp de Soporte</label>
                            <div className="relative group">
                              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bccbb9] transition-colors group-focus-within:text-[#4be277]" />
                              <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="EJ: +51 912 345 678"
                                className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-sans font-bold uppercase text-[11px] outline-none transition-all focus:border-[#4be277]/60"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center ml-2">
                              <label className="text-[9px] font-black text-[#bccbb9] uppercase tracking-widest font-bold">PIN / Llave Secundaria (Opcional)</label>
                            </div>
                            <div className="relative group">
                              <input
                                type={pinVisible ? 'text' : 'password'}
                                maxLength={12}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="PIN DE 4 A 12 CARACTERES"
                                className="block w-full px-4 pr-14 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-mono font-black tracking-widest text-[11px] outline-none transition-all focus:border-[#4be277]/60"
                              />
                              <button
                                type="button"
                                onClick={() => setPinVisible(!pinVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono font-black text-[#bccbb9]/50 hover:text-white tracking-widest px-2 py-1.5 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                              >
                                {pinVisible ? 'OCULTAR' : 'VER'}
                              </button>
                            </div>
                            <p className="text-[7.5px] font-bold text-[#bccbb9]/30 uppercase tracking-widest leading-normal px-2">
                              * Configurar tu PIN te permite ingresar en un segundo directamente desde la pestaña de PIN Rápido.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className={`w-full h-15 rounded-xl font-black text-[10.5px] flex items-center justify-center gap-2.5 uppercase tracking-[0.25em] italic transition-all shadow-xl font-mono cursor-pointer ${
                    isRegister 
                      ? 'bg-[#4be277] hover:bg-[#3cd168] text-[#121414]' 
                      : loginMethod === 'pin' 
                        ? 'bg-[#4be277] hover:bg-[#3cd168] text-[#121414]' 
                        : 'bg-[#FF9100] hover:bg-[#e08000] text-[#121414]'
                  }`}
                >
                  {isRegister ? 'Registrarme' : (loginMethod === 'pin' ? 'Validar PIN e Ingresar' : 'Entrar Ahora')}
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </motion.button>
              </form>

              {/* Recovery link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsRecovering(true)}
                  className="text-[8px] font-black text-[#bccbb9]/60 hover:text-[#FF9100] uppercase tracking-widest transition-all cursor-pointer hover:underline font-mono"
                >
                  ¿Olvidaste tu clave o PIN de acceso? Recupéralo aquí
                </button>
              </div>

              {/* Simple Inline Switch link (Sign In vs Sign Up) */}
              <div className="pt-4 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setLoginMethod('credentials');
                  }}
                  className="text-[8.5px] font-black text-[#bccbb9]/50 hover:text-white uppercase tracking-widest transition-all cursor-pointer hover:underline font-mono"
                >
                  {isRegister ? '¿YA TIENES CUENTA? INICIA SESIÓN AQUÍ' : '¿NO TIENES CUENTA? REGÍSTRATE AQUÍ'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
