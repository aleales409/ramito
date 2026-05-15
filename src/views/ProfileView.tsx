import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, ShieldCheck, Key, Settings, CreditCard, History, 
  ChevronRight, LogOut, Phone, MessageCircle, AlertTriangle, 
  CheckCircle2, Save, ExternalLink, ArrowRight, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function ProfileView() {
  const navigate = useNavigate();
  const { showToast, eliteKey, vipKey, saveSettings, adminPhone } = useApp();
  
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | 'soporte'>('perfil');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for Security tab
  const [newEliteKey, setNewEliteKey] = useState(eliteKey);
  const [newVipKey, setNewVipKey] = useState(vipKey);
  const [newAdminPhone, setNewAdminPhone] = useState(adminPhone);
  const [newPersonalKey, setNewPersonalKey] = useState('');

  const userId = localStorage.getItem('ramito_user_id');
  const userRole = localStorage.getItem('ramito_user_role');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setUserData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    showToast('Sesión cerrada correctamente');
  };

  const handleSaveKeys = async () => {
    try {
      await saveSettings({
        elite_key: newEliteKey,
        vip_key: newVipKey,
        admin_phone: newAdminPhone
      });
      showToast('¡CONFIGURACIÓN ACTUALIZADA!', 'success');
    } catch (err) {
      showToast('Error al guardar cambios');
    }
  };

  const handleUpdatePersonalKey = async () => {
    if (!newPersonalKey || newPersonalKey.length < 4) {
      showToast('La llave debe tener al menos 4 caracteres');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password: newPersonalKey })
        .eq('id', userId);
      
      if (error) throw error;
      showToast('¡TU LLAVE HA SIDO ACTUALIZADA!', 'success');
      setNewPersonalKey('');
    } catch (err) {
      showToast('Error al actualizar tu llave');
    }
  };

  // 1. PANTALLA DE BLOQUEO SI NO ESTÁ LOGUEADO
  if (!userId) {
    return (
      <main className="pt-24 pb-32 px-10 max-w-md mx-auto flex flex-col items-center text-center space-y-8">
        <div className="w-24 h-24 glass-panel rounded-[2rem] flex items-center justify-center relative">
          <User className="w-10 h-10 text-[#bccbb9]/20" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#4be277] rounded-2xl flex items-center justify-center border-4 border-[#121414]">
            <Lock className="w-4 h-4 text-[#121414]" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="font-display text-4xl font-black text-white uppercase italic tracking-tighter">Mi Perfil</h2>
          <p className="text-[#bccbb9] text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
            Inicia sesión para gestionar tus datos, <br />
            cambiar tu llave personal y acceder <br />
            a la configuración de administrador.
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
          Seguridad Ramito Fut Show • v1.0.7
        </p>
      </main>
    );
  }

  if (loading) return null;


  return (
    <main className="pt-16 pb-32 px-5 max-w-lg mx-auto min-h-screen">
      {/* HEADER PERFIL */}
      <div className="relative mb-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#4be277] to-[#121414] p-1 shadow-2xl shadow-[#4be277]/20">
              <div className="w-full h-full rounded-[2.2rem] bg-[#121414] flex items-center justify-center overflow-hidden">
                <User className="w-12 h-12 text-[#4be277]" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#4be277] flex items-center justify-center border-4 border-[#121414]">
              <ShieldCheck className="w-4 h-4 text-[#121414]" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{userData?.name || 'Cargando...'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                userRole?.includes('admin') ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277]' : 'bg-white/5 border-white/10 text-[#bccbb9]'
              }`}>
                {userRole === 'admin_elite' ? '👑 ELITE ADMIN' : (userRole === 'admin_vip' ? '💎 VIP ADMIN' : '⚽ JUGADOR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVEGACIÓN */}
      <div className="flex gap-2 p-1.5 glass-panel rounded-2xl border border-white/5 mb-8">
        {(['perfil', 'seguridad', 'soporte'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white/10 text-white shadow-xl border border-white/10' : 'text-[#bccbb9]/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* VISTA PERFIL */}
        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#bccbb9]/40 uppercase tracking-widest">Correo Electrónico</p>
                  <p className="text-sm font-black text-white uppercase italic">{userData?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 text-[#bccbb9]" />
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-[#FF9100]" />
                <h3 className="text-xs font-black text-white uppercase italic">Cambiar Mi Llave Personal</h3>
              </div>
              <div className="space-y-4">
                <input 
                  type="password" 
                  value={newPersonalKey}
                  onChange={(e) => setNewPersonalKey(e.target.value)}
                  placeholder="NUEVA LLAVE" 
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-white font-black tracking-[0.3em] outline-none focus:border-[#FF9100]/50 transition-all"
                />
                <button 
                  onClick={handleUpdatePersonalKey}
                  className="w-full h-14 bg-[#FF9100] text-black font-black rounded-2xl uppercase text-[10px] tracking-widest italic shadow-lg shadow-[#FF9100]/20"
                >
                  Actualizar Mi Llave
                </button>
              </div>
            </div>

            <button onClick={handleLogout} className="w-full h-16 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/10 transition-all italic">
              Cerrar Sesión <LogOut className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* VISTA SEGURIDAD (SOLO ADMINS) */}
        {activeTab === 'seguridad' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {!userRole?.includes('admin') ? (
              <div className="glass-panel p-10 rounded-3xl border border-white/5 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto border border-yellow-500/20">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest italic">Acceso restringido a administradores</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass-panel rounded-[2.5rem] border border-white/5 p-8 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#4be277]/10 flex items-center justify-center border border-[#4be277]/20">
                      <ShieldCheck className="w-6 h-6 text-[#4be277]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Gestión de Llaves Maestras</h3>
                      <p className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest">Configura el acceso administrativo</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {userRole === 'admin_elite' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#4be277] uppercase tracking-widest ml-1 italic">👑 Llave Elite Admin</label>
                        <input type="text" value={newEliteKey} onChange={(e) => setNewEliteKey(e.target.value)} className="w-full h-16 bg-black/40 border border-[#4be277]/30 rounded-2xl px-6 text-white font-black tracking-[0.3em] outline-none shadow-[0_0_20px_rgba(75,226,119,0.1)] focus:border-[#4be277]" />
                      </div>
                    )}

                    {(userRole === 'admin_vip' || userRole === 'admin_elite') && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#FFD600] uppercase tracking-widest ml-1 italic">💎 Llave VIP Admin</label>
                        <input type="text" value={newVipKey} onChange={(e) => setNewVipKey(e.target.value)} className="w-full h-16 bg-black/40 border border-[#FFD600]/30 rounded-2xl px-6 text-white font-black tracking-[0.3em] outline-none shadow-[0_0_20px_rgba(255,214,0,0.1)] focus:border-[#FFD600]" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest ml-1 italic">📱 WhatsApp de Soporte</label>
                      <input type="text" value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value)} className="w-full h-16 bg-white/[0.02] border border-white/10 rounded-2xl px-6 text-white font-black outline-none focus:border-white/30" />
                    </div>
                  </div>

                  <button onClick={handleSaveKeys} className="w-full h-16 bg-[#4be277] text-[#121414] rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-[#4be277]/20 flex items-center justify-center gap-3 italic transition-transform active:scale-95">
                    Guardar Configuración <Save className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest leading-relaxed italic">
                    Cualquier cambio en las llaves maestras afectará el acceso de todo el personal. Úsalas con extrema precaución.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VISTA SOPORTE */}
        {activeTab === 'soporte' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="glass-panel rounded-[2.5rem] border border-white/5 p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-[#25D366]/10 flex items-center justify-center mx-auto border border-[#25D366]/20">
                <MessageCircle className="w-10 h-10 text-[#25D366] animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Asistencia Directa</h3>
                <p className="text-[10px] font-bold text-[#bccbb9]/40 uppercase tracking-widest max-w-[200px] mx-auto">¿Tienes problemas con tu llave o reserva? Háblanos por WhatsApp.</p>
              </div>
              <a href={`https://wa.me/${adminPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full h-16 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] transition-all">
                Abrir Chat de Soporte <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
