import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Zap, 
  Target, 
  Users, 
  Key, 
  AlertCircle, 
  Phone, 
  Lock, 
  Edit3, 
  ChevronDown, 
  User, 
  MousePointer2,
  FileSearch,
  CheckCircle2,
  Clock,
  DollarSign,
  Bell,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import NotificationBell from '../components/NotificationBell';

export default function ProfileView() {
  const navigate = useNavigate();
  const { 
    isComplexOpen, 
    setIsComplexOpen, 
    adminPhone, 
    setAdminPhone, 
    eliteKey, 
    setEliteKey, 
    vipKey, 
    setVipKey,
    appLicenseActive,
    setAppLicenseActive,
    webLicenseActive,
    setWebLicenseActive
  } = useApp();
  
  const userName = localStorage.getItem('ramito_user_name');
  const role = (localStorage.getItem('ramito_user_role') as UserRole) || 'player';

  if (!userName && role === 'player') {
    return (
      <main className="pt-40 pb-32 px-10 max-w-md mx-auto flex flex-col items-center text-center space-y-8">
        <div className="w-24 h-24 bg-[#1a1c1c] rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl relative">
          <User className="w-10 h-10 text-[#bccbb9]/20" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center border-4 border-[#121414]">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="font-display text-4xl font-black text-white uppercase italic tracking-tighter">Zona Restringida</h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
            Inicia sesión o regístrate para gestionar tu perfil, <br />
            ver tus estadísticas y ganar trofeos.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="w-full h-16 bg-[#4be277] text-[#121414] font-black rounded-2xl shadow-[0_10px_30px_rgba(75,226,119,0.3)] flex items-center justify-center gap-3 uppercase tracking-[0.2em] italic"
        >
          Iniciar Sesión
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        
        <p className="text-[8px] font-black text-[#bccbb9]/30 uppercase tracking-[0.4em] italic pt-12">
          Ramito Fut Show • v1.0.7
        </p>
      </main>
    );
  }

  const [userRole, setUserRole] = useState<UserRole>(role);
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(adminPhone);

  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isDrawingPattern, setIsDrawingPattern] = useState(false);
  const [newPattern, setNewPattern] = useState<number[]>([]);

  const name = userRole === 'admin_elite' ? 'Elite' : userRole === 'admin_vip' ? 'VIP' : localStorage.getItem('ramito_user_name') || 'Ramito Player';
  const playerPin = localStorage.getItem('ramito_user_pin') || '1234';
  
  const isAdmin = userRole === 'admin_elite' || userRole === 'admin_vip';
  const currentKey = isAdmin 
    ? (userRole === 'admin_elite' ? eliteKey : vipKey) 
    : playerPin;

  const toggleRole = () => {
    const roles: UserRole[] = ['player', 'admin_elite', 'admin_vip'];
    const currentIndex = roles.indexOf(userRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    setUserRole(nextRole);
    localStorage.setItem('ramito_user_role', nextRole);
  };

  const isVIP = userRole === 'admin_vip';
  const isElite = userRole === 'admin_elite';

  const handlePhoneSave = () => {
    setAdminPhone(tempPhone);
    setIsEditingPhone(false);
  };

  const handleKeySave = () => {
    if (userRole === 'admin_elite') setEliteKey(tempKey);
    else if (userRole === 'admin_vip') setVipKey(tempKey);
    else localStorage.setItem('ramito_user_pin', tempKey);
    setIsEditingKey(false);
  };

  const handlePatternNode = (node: number) => {
    if (newPattern.includes(node)) return;
    const p = [...newPattern, node];
    setNewPattern(p);
    if (p.length >= 6) {
      const patternStr = p.join('');
      if (userRole === 'admin_elite') setEliteKey(patternStr);
      else if (userRole === 'admin_vip') setVipKey(patternStr);
      else localStorage.setItem('ramito_user_pin', patternStr);
      setTimeout(() => {
        setIsDrawingPattern(false);
        setNewPattern([]);
      }, 800);
    }
  };

  const payments = [
    { id: 1, user: 'Agus Castro', amount: '$45.00', status: 'Pagado', date: 'Hoy, 18:30', field: 'Cancha 1' },
    { id: 2, user: 'Juan Perez', amount: '$30.00', status: 'Pagado', date: 'Ayer, 20:00', field: 'Cancha 2' },
    { id: 3, user: 'Maria G.', amount: '$45.00', status: 'Pendiente', date: 'Ayer, 21:00', field: 'Cancha 1' },
  ];

  return (
    <main className="pt-32 pb-32 px-5 max-w-2xl mx-auto space-y-10">
      {/* Header with Notification Bell */}
      <div className="flex justify-between items-start mb-6 w-full">
         <div className="flex-1 opacity-0">spacer</div> {/* Spacer to center avatar better or just keep space */}
         <div className="flex-1"></div>
         <NotificationBell />
      </div>

      {/* Restructured Header */}
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative cursor-pointer"
            onClick={toggleRole}
          >
            <div className={`w-32 h-32 rounded-[2.5rem] p-[2px] shadow-[0_0_40px_rgba(255,145,0,0.1)] transition-all ${
              isVIP ? 'bg-gradient-to-br from-[#FF9100] via-[#4be277] to-[#D32F2F]' : isElite ? 'bg-blue-500/50' : 'bg-white/10'
            }`}>
              <div className="w-full h-full rounded-[2.45rem] bg-[#121414] overflow-hidden">
                <img 
                  src={isVIP || isElite 
                    ? "https://images.unsplash.com/photo-1519085185750-74071727339a?auto=format&fit=crop&q=80&w=300&h=300"
                    : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300"
                  } 
                  alt="Avatar"
                  className={`w-full h-full object-cover ${isVIP || isElite ? 'grayscale-0' : 'grayscale'}`}
                />
              </div>
            </div>
          </motion.div>

          <div className="space-y-1">
            <h2 className="font-display text-3xl font-black text-white uppercase italic tracking-tighter">
              {name}
            </h2>
            <div className="flex flex-col items-center gap-2">
              <div className="px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                <span className="text-[#bccbb9] text-[8px] font-black uppercase tracking-[0.2em]">
                  {isVIP ? 'ADMINISTRADOR VIP' : isElite ? 'ADMINISTRADOR ELITE' : 'JUGADOR'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mi Perfil Button (Toggles Settings) */}
        <button 
          onClick={() => setShowProfileSettings(!showProfileSettings)}
          className={`w-full max-w-xs h-14 rounded-2xl flex items-center justify-between px-6 transition-all border ${
            showProfileSettings 
              ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277]' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <User className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Mi Perfil / Seguridad</span>
          </div>
          <motion.div
            animate={{ rotate: showProfileSettings ? 180 : 0 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        {/* Profile Settings (Key/Pattern) */}
        <AnimatePresence>
          {showProfileSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full space-y-4 overflow-hidden"
            >
              <div className="bg-[#1a1c1c] rounded-[2rem] border border-white/5 p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#bccbb9] uppercase tracking-widest">Configuración de Acceso</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsDrawingPattern(false)}
                        className={`text-[8px] font-black uppercase tracking-widest transition-all ${!isDrawingPattern ? 'text-[#4be277]' : 'text-white/20'}`}
                      >
                        Código
                      </button>
                      <button 
                        onClick={() => setIsDrawingPattern(true)}
                        className={`text-[8px] font-black uppercase tracking-widest transition-all ${isDrawingPattern ? 'text-[#4be277]' : 'text-white/20'}`}
                      >
                        Patrón
                      </button>
                    </div>
                  </div>

                  {!isDrawingPattern ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 group">
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-blue-500" />
                          <div>
                            <span className="text-[8px] text-[#bccbb9] uppercase block tracking-widest">
                              {isAdmin ? 'Clave Maestra' : 'Pin Personal'}
                            </span>
                            {isEditingKey ? (
                              <input 
                                type="text"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                className="bg-transparent border-b border-blue-500/50 text-white font-black text-sm outline-none w-24 tracking-[0.4em]"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-black text-white tracking-[0.4em]">{currentKey}</span>
                            )}
                          </div>
                        </div>
                        {isEditingKey ? (
                          <button onClick={handleKeySave} className="text-[9px] font-black text-[#4be277] uppercase">Guardar</button>
                        ) : (
                          <button onClick={() => { setTempKey(currentKey); setIsEditingKey(true); }}>
                            <Edit3 className="w-3 h-3 text-white/40" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <div className="grid grid-cols-3 gap-4 p-4 bg-black/20 rounded-3xl border border-white/5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((node) => (
                          <motion.button
                            key={node}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePatternNode(node)}
                            className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                              newPattern.includes(node) 
                                ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                                : 'bg-white/5 border-white/10'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${newPattern.includes(node) ? 'bg-white' : 'bg-white/20'}`} />
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-[8px] font-bold text-[#bccbb9] uppercase tracking-widest italic">
                        {newPattern.length > 0 ? `Trazando: ${newPattern.length}/6 nodos` : 'Dibuja el nuevo patrón'}
                      </p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="space-y-3 pt-2">
                      <span className="text-[8px] font-bold text-[#bccbb9] uppercase tracking-widest block">Contacto de Administración</span>
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[#FF9100]" />
                          {isEditingPhone ? (
                            <input 
                              type="text"
                              value={tempPhone}
                              onChange={(e) => setTempPhone(e.target.value)}
                              className="bg-transparent border-b border-[#FF9100]/50 text-white font-bold text-xs outline-none"
                              autoFocus
                            />
                          ) : (
                            <span className="text-xs font-bold text-white tracking-widest">{adminPhone}</span>
                          )}
                        </div>
                        {isEditingPhone ? (
                          <button onClick={handlePhoneSave} className="text-[9px] font-black text-[#4be277] uppercase">Listo</button>
                        ) : (
                          <button onClick={() => setIsEditingPhone(true)}>
                            <Edit3 className="w-3 h-3 text-white/40" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin License Control */}
      {(isVIP || isElite) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-end px-2">
            <h3 className="text-[10px] font-black text-[#FF9100] uppercase tracking-[0.3em]">Gestión de Licencias</h3>
            <span className="text-[9px] font-black text-[#bccbb9]/40 uppercase tracking-widest italic">Expira en 30 días</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
             {/* Licencia App */}
            <div className="bg-[#1a1c1c] rounded-[2rem] border border-white/5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    appLicenseActive ? 'bg-[#4be277]/10 text-[#4be277]' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-black uppercase italic tracking-wider">Licencia App</h4>
                    <p className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest mt-0.5">
                      {appLicenseActive ? 'ACTIVA' : 'EXPIRADA'}
                    </p>
                  </div>
                </div>

                {isVIP ? (
                  <button 
                    onClick={() => setAppLicenseActive(!appLicenseActive)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                      appLicenseActive 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-[#4be277] text-[#121414]'
                    }`}
                  >
                    {appLicenseActive ? 'Desactivar' : 'Activar'}
                  </button>
                ) : (
                  <div className={`w-3 h-3 rounded-full animate-pulse ${appLicenseActive ? 'bg-[#4be277]' : 'bg-red-500'}`} />
                )}
              </div>
            </div>

            {/* Licencia Dominio Web */}
            <div className="bg-[#1a1c1c] rounded-[2rem] border border-white/5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    webLicenseActive ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-black uppercase italic tracking-wider">Web Domain</h4>
                    <p className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest mt-0.5">
                      {webLicenseActive ? 'DOMINIO ACTIVO' : 'ERROR DNS'}
                    </p>
                  </div>
                </div>

                {isVIP ? (
                  <button 
                    onClick={() => setWebLicenseActive(!webLicenseActive)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                      webLicenseActive 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {webLicenseActive ? 'Desactivar' : 'Activar'}
                  </button>
                ) : (
                  <div className={`w-3 h-3 rounded-full animate-pulse ${webLicenseActive ? 'bg-blue-500' : 'bg-red-500'}`} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black text-[#4be277] uppercase tracking-[0.3em] ml-2">Control Operativo</h3>
            <div className="bg-[#1a1c1c] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isComplexOpen ? 'bg-[#4be277]/10 text-[#4be277]' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-black uppercase italic tracking-wider">Estado Complejo</h4>
                    <p className="text-[10px] font-bold text-[#bccbb9] uppercase tracking-widest mt-0.5">
                      {isComplexOpen ? 'ABIERTO' : 'CERRADO'}
                    </p>
                  </div>
                </div>

                {isVIP ? (
                  <button 
                    onClick={() => setIsComplexOpen(!isComplexOpen)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                      isComplexOpen 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                        : 'bg-[#4be277] text-[#121414] shadow-[0_0_15px_rgba(75,226,119,0.2)]'
                    }`}
                  >
                    {isComplexOpen ? 'Cerrar' : 'Abrir'}
                  </button>
                ) : (
                  <div className="flex flex-col items-end">
                    <div className={`w-3 h-3 rounded-full mb-1 animate-pulse ${isComplexOpen ? 'bg-[#4be277]' : 'bg-red-500'}`} />
                    <span className="text-[8px] font-bold text-[#bccbb9] uppercase tracking-widest">Lectura</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auditoría Section */}
      {(isVIP || isElite) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-end px-2">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Auditoría de Pagos</h3>
            <div className="flex items-center gap-1 text-[9px] font-black text-[#4be277] uppercase tracking-widest italic">
              <DollarSign className="w-3 h-3" />
              Total: $120.00
            </div>
          </div>

          <div className="bg-[#1a1c1c] rounded-[2.5rem] border border-white/5 p-4 space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#bccbb9]" />
                  </div>
                  <div>
                    <h5 className="text-white text-[11px] font-black uppercase italic">{p.user}</h5>
                    <p className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest">{p.field} • {p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-white text-xs font-black tracking-widest">{p.amount}</span>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {p.status === 'Pagado' ? (
                      <CheckCircle2 className="w-3 h-3 text-[#4be277]" />
                    ) : (
                      <Clock className="w-3 h-3 text-[#FF9100]" />
                    )}
                    <span className={`text-[8px] font-black uppercase tracking-widest ${p.status === 'Pagado' ? 'text-[#4be277]' : 'text-[#FF9100]'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 text-[9px] font-black text-[#bccbb9]/40 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-[#bccbb9] transition-colors">
              <FileSearch className="w-4 h-4" />
              Ver Reporte Completo
            </button>
          </div>
        </motion.div>
      )}

      {/* Info List */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 pt-10"
      >
        {!isVIP && !isElite && (
          <div className="bg-[#1a1c1c] rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FF9100]/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#FF9100]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-sm font-black uppercase italic tracking-widest">Estado de Cuenta</h4>
              <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-widest leading-loose">
                Miembro Élite • Jugador Destacado<br />
                <span className="text-[#4be277]">Al día con las reservas</span>
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button 
          onClick={() => {
             const sessionId = localStorage.getItem('ramito_current_session_id');
             if (sessionId) {
               const sessionsStr = localStorage.getItem('ramito_active_sessions');
               if (sessionsStr) {
                 const sessions = JSON.parse(sessionsStr);
                 const updatedSessions = sessions.filter((s: any) => s.id.toString() !== sessionId);
                 localStorage.setItem('ramito_active_sessions', JSON.stringify(updatedSessions));
               }
             }
             localStorage.removeItem('ramito_user_role');
             localStorage.removeItem('ramito_user_name');
             localStorage.removeItem('ramito_user_pin');
             localStorage.removeItem('ramito_current_session_id');
             window.location.href = '/';
          }}
          className="w-full flex items-center justify-center gap-4 p-6 rounded-[2rem] bg-[#1a1c1c]/40 border border-white/5 text-[#D32F2F] hover:bg-[#D32F2F]/10 transition-all active:scale-[0.98] group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">Cerrar Sesión</span>
        </button>
      </motion.div>

      {/* Footer Hint */}
      <p className="text-center text-[8px] font-black text-[#bccbb9]/20 uppercase tracking-[0.4em] italic pt-8">
        El Show debe continuar • v1.0.7
      </p>
    </main>
  );
}
