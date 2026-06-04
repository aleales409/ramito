import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Globe, ChevronRight, Smartphone, Database, 
  MessageCircle, Save, ExternalLink, Wrench, Key, AlertTriangle 
} from 'lucide-react';
import { isSupabaseConfigured } from '../../../lib/supabase';

interface LicenciasTabProps {
  userRole: string | null;
  webDomain: string;
  webSyncFrequency: string;
  vercelPlan: string;
  webDaysRemaining: number;
  webLicenseActive: boolean;
  appLicenseActive: boolean;
  appPwaShortName: string;
  appPushEnabled: boolean;
  appDaysRemaining: number;
  newAdminPhone: string;
  setNewAdminPhone: (phone: string) => void;
  customCodesCount: number;
  isLicensingReadOnly: boolean;
  maintenanceMode: boolean;
  setShowWebWindow: (show: boolean) => void;
  setShowAppWindow: (show: boolean) => void;
  setShowDiagnosticsWindow: (show: boolean) => void;
  setShowMaintenanceWindow: (show: boolean) => void;
  setShowCodesWindow: (show: boolean) => void;
  saveSettings: (settings: any) => Promise<void>;
  addAuditLog: (action: string, details: string, type: 'info' | 'warning' | 'success' | 'alert') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function LicenciasTab({
  userRole,
  webDomain,
  webSyncFrequency,
  vercelPlan,
  webDaysRemaining,
  webLicenseActive,
  appLicenseActive,
  appPwaShortName,
  appPushEnabled,
  appDaysRemaining,
  newAdminPhone,
  setNewAdminPhone,
  customCodesCount,
  isLicensingReadOnly,
  maintenanceMode,
  setShowWebWindow,
  setShowAppWindow,
  setShowDiagnosticsWindow,
  setShowMaintenanceWindow,
  setShowCodesWindow,
  saveSettings,
  addAuditLog,
  showToast
}: LicenciasTabProps) {
  return (
    <motion.div
      key="licencias"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#4be277]/10 border border-[#4be277]/20 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[#4be277]" />
        </div>
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Panel de Licencias</h3>
        <p className="text-[10px] font-bold text-[#bccbb9]/60 uppercase tracking-widest max-w-xs">
          Administre por separado los servicios web y de aplicación en sus respectivas consolas de configuración.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* COMPONENTE INTERACTIVO: LICENCIA WEB DE PRODUCCIÓN */}
        <button
          onClick={() => setShowWebWindow(true)}
          className={`w-full text-left glass-panel rounded-3xl border p-5 relative overflow-hidden group hover:border-[#4be277]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r ${
            webLicenseActive
              ? 'from-emerald-950/20 to-emerald-900/10 border-[#4be277]/30 shadow-[0_4px_20px_rgba(75,226,119,0.06)]'
              : 'from-zinc-950/80 to-zinc-950/40 border-white/5 shadow-lg'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4be277]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#4be277]/10 transition-all duration-500" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                webLicenseActive
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-[#bccbb9] group-hover:bg-[#4be277]/20 group-hover:border-[#4be277]/40'
              }`}>
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-[#4be277] transition-colors">
                  Licencia Web de Producción
                </span>
                <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                  DOMINIO: {webDomain} • SINCRONIZACIÓN: {webSyncFrequency}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${webLicenseActive ? 'bg-[#4be277]' : 'bg-red-500 animate-ping'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${webLicenseActive ? 'text-[#4be277]' : 'text-red-400 font-bold'}`}>
                    {webLicenseActive ? (
                      vercelPlan === 'free' 
                        ? 'PLAN GRATUITO VERCEL • ACTIVO SIN EXPIRACIÓN' 
                        : `LICENCIA ACTIVA • Quedan ${webDomain ? webDaysRemaining : 0} Días`
                    ) : 'LICENCIA DESACTIVADA'}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>

        {/* COMPONENTE INTERACTIVO: LICENCIA MÓVIL APP */}
        <button
          onClick={() => setShowAppWindow(true)}
          className={`w-full text-left glass-panel rounded-3xl border p-5 relative overflow-hidden group hover:border-[#FF9100]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r ${
            appLicenseActive
              ? 'from-amber-950/20 to-amber-900/10 border-[#FF9100]/35 shadow-[0_4px_20px_rgba(255,145,0,0.06)]'
              : 'from-zinc-950/80 to-zinc-950/40 border-white/5 shadow-lg'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                appLicenseActive
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse'
                  : 'bg-[#FF9100]/10 border-[#FF9100]/20 text-[#bccbb9] group-hover:bg-[#FF9100]/20 group-hover:border-[#FF9100]/40'
              }`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-amber-400 transition-colors">
                  Licencia Móvil APP (PWA)
                </span>
                <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                  APLICACIÓN: {appPwaShortName} • NOTIFICACIONES: {appPushEnabled ? 'HABILITADAS' : 'DESACTIVADAS'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${appLicenseActive ? 'bg-[#FF9100]' : 'bg-red-500 animate-ping'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${appLicenseActive ? 'text-amber-400' : 'text-red-400 font-bold'}`}>
                    {appLicenseActive ? `LICENCIA ACTIVA • Quedan ${appDaysRemaining} Días` : 'LICENCIA EXPIRADA'}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>

        {/* PRUEBA DE FUEGO SUPABASE */}
        {userRole === 'admin_elite' && (
          <button
            onClick={() => setShowDiagnosticsWindow(true)}
            className="w-full text-left glass-panel rounded-3xl border border-violet-500/30 p-5 relative overflow-hidden group hover:border-violet-400/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-violet-950/20 to-violet-900/10 shadow-[0_4px_20px_rgba(139,92,246,0.06)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/10 transition-all duration-500" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-violet-400 transition-colors">
                    Prueba de Fuego Supabase
                  </span>
                  <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                    VERIFICAR TODAS LAS CONEXIONES Y OPERACIONES CRUD EN TIEMPO REAL
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-wider font-mono text-violet-400">
                      {isSupabaseConfigured ? 'MOTOR SUPABASE ACTIVO • LISTO PARA DIAGNÓSTICO' : 'SUPABASE NO CONFIGURADO'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:text-white transition-all shrink-0">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        )}

        {/* GESTOR DE ASISTENCIA WHATSAPP DE SOPORTE (MOSTRADO ÚNICAMENTE EDITABLE PARA EL ADMIN VIP) */}
        {userRole === 'admin_vip' && (
          <div className="glass-panel rounded-3xl border border-white/5 p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden text-left animate-fade-in font-sans">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 shrink-0">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[11px] font-black text-white uppercase tracking-wider block italic font-sans font-bold">Asistencia WhatsApp Soporte</span>
                <span className="text-[8px] font-mono text-[#bccbb9]/40 tracking-wider">NÚMERO DE TELÉFONO SOPORTE GLOBAL RAMITO FUT SHOW</span>
              </div>
            </div>

            <div className="space-y-3 text-left font-sans">
              <div className="space-y-1.5 font-sans">
                <label className="text-[8.5px] font-black text-[#bccbb9]/60 uppercase tracking-widest block font-bold">Número de Soporte WhatsApp</label>
                <input 
                  type="text" 
                  value={newAdminPhone} 
                  onChange={(e) => setNewAdminPhone(e.target.value)} 
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-mono font-bold text-white focus:border-[#25D366]/55 transition-all outline-none" 
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
                <button 
                  type="button"
                  onClick={async () => {
                    await saveSettings({ admin_phone: newAdminPhone });
                    addAuditLog('CAMBIO DE NÚMERO DE ASISTENCIA', `Número de WhatsApp de asistencia configurado a: ${newAdminPhone}`, 'success');
                    showToast('Número de WhatsApp de asistencia guardado', 'success');
                  }} 
                  className="flex-1 h-11 bg-[#25D366] text-white font-black rounded-xl uppercase text-[9px] tracking-widest italic flex items-center justify-center gap-1.5 shadow-lg shadow-[#25D366]/15 hover:opacity-95 transition-all outline-none active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" /> Guardar WhatsApp
                </button>
                <a 
                  href={`https://wa.me/${newAdminPhone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-11 px-4 bg-white/5 hover:bg-white/10 text-[#25D366] font-black rounded-xl border border-white/10 flex items-center justify-center transition-all shrink-0 gap-1.5 text-[9px] uppercase tracking-widest italic font-sans"
                >
                  Probar <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN MANTENIMIENTO DEL SISTEMA */}
        <button
          onClick={() => setShowMaintenanceWindow(true)}
          className={`w-full text-left glass-panel rounded-3xl border p-5 relative overflow-hidden group hover:border-amber-500/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r ${
            maintenanceMode
              ? 'from-amber-950/45 to-amber-900/10 border-amber-500/40 shadow-[0_10px_35px_rgba(245,158,11,0.15)]'
              : 'from-zinc-950/80 to-zinc-950/40 border-white/5 shadow-lg'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                maintenanceMode
                  ? 'bg-amber-500/20 border-amber-500/45 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20 group-hover:border-amber-500/40'
              }`}>
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-amber-400 transition-colors">
                  Mantenimiento del Sistema
                </span>
                <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                  SOPORTE TÉCNICO • WALLPAPER DE ESPERA • MENSAJE PERSONALIZADO
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500 animate-ping' : 'bg-[#4be277]'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${maintenanceMode ? 'text-red-400 font-bold' : 'text-[#4be277]'}`}>
                    {maintenanceMode ? 'BLOQUEO ACTIVO / APP EN MANTENIMIENTO' : 'PANTALLA DE ESPERA LIBERADA / OPERANDO'}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      {/* COMPONENTE INTERACTIVO: SERVIDOR DE CÓDIGOS DE ACTIVACIÓN (EXCLUSIVO ELITE) */}
      {!isLicensingReadOnly && (
        <button
          onClick={() => setShowCodesWindow(true)}
          className="w-full text-left glass-panel rounded-3xl border p-5 relative overflow-hidden group hover:border-purple-500/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-purple-950/20 to-purple-900/10 border-purple-500/30 shadow-[0_4px_20px_rgba(168,85,247,0.06)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-500" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/40 text-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:bg-purple-500/30 transition-all duration-300">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-purple-400 transition-colors">
                  Servidor de Códigos (App Móvil PWA)
                </span>
                <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                  LLAVES DE ACCESO • CREAR CUPONES DE RECARGA DE DÍAS DE LICENCIA
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-wider font-mono text-purple-400">
                    CONSOLA DE CONTROL ELITE ACTIVA • {customCodesCount} CÓDIGOS EN CIRCULACIÓN
                  </span>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      )}
      
      <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex gap-3 text-left">
        <AlertTriangle className="w-5 h-5 text-[#FF9100] shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-black text-white uppercase tracking-wider block italic">Gestión de Acceso Total</span>
          <p className="text-[8.5px] font-bold text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed mt-1">
            Cualquier desactivación de licencia afectará el servicio de producción del complejo. Las llaves persistidas son validadas constantemente mediante nuestra API de seguridad.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
