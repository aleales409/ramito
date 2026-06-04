import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Power, ChevronRight, RefreshCw, Database, 
  Info, GlassWater, Activity 
} from 'lucide-react';
import { getActiveAccountIndex } from '../../../lib/transferRotation';

interface AjustesTabProps {
  emergencyMode: boolean;
  transferAlias1: string;
  transferAlias2: string;
  court1Policy: string;
  court2Policy: string;
  cantinaItemsCount: number;
  setShowEmergencyWindow: (show: boolean) => void;
  setShowTransferWindow: (show: boolean) => void;
  setShowStorageBackupWindow: (show: boolean) => void;
  setShowCourt1PolicyWindow: (show: boolean) => void;
  setShowCourt2PolicyWindow: (show: boolean) => void;
  setShowCantinaWindow: (show: boolean) => void;
  setShowAnalyticsWindow: (show: boolean) => void;
  setShowDiagnosticsWindow: (show: boolean) => void;
  runDiagnostics: () => void;
}

export default function AjustesTab({
  emergencyMode,
  transferAlias1,
  transferAlias2,
  court1Policy,
  court2Policy,
  cantinaItemsCount,
  setShowEmergencyWindow,
  setShowTransferWindow,
  setShowStorageBackupWindow,
  setShowCourt1PolicyWindow,
  setShowCourt2PolicyWindow,
  setShowCantinaWindow,
  setShowAnalyticsWindow,
  setShowDiagnosticsWindow,
  runDiagnostics
}: AjustesTabProps) {
  return (
    <motion.div
      key="ajustes"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 text-left"
    >
      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Settings className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Ajustes de Administración</h3>
        <p className="text-[10px] font-bold text-[#bccbb9]/60 uppercase tracking-widest max-w-sm">
          Gestione de forma avanzada la auditoría del personal, cierres de emergencia y bloqueo preventivo de reservas.
        </p>
      </div>

      {/* CIERRE DE EMERGENCIA AUTOMÁTICO */}
      <button
        onClick={() => setShowEmergencyWindow(true)}
        className={`w-full text-left glass-panel rounded-3xl border p-5 relative overflow-hidden group hover:border-red-500/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r ${
          emergencyMode
            ? 'from-red-950/45 to-red-900/10 border-red-500/40 shadow-[0_10px_35px_rgba(239,68,68,0.15)]'
            : 'from-zinc-950/80 to-zinc-950/40 border-white/5 shadow-lg'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
              emergencyMode
                ? 'bg-red-500/20 border-red-500/45 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse'
                : 'bg-red-500/10 border-red-500/20 text-red-500 group-hover:bg-red-500/20 group-hover:border-red-500/40'
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-red-400 transition-colors">
                Cierre Emergencia Automático
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                SUSPENSIÓN EN TIEMPO REAL • BLOQUEO DE RESERVAS Y CANCHAS
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${emergencyMode ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${emergencyMode ? 'text-red-400' : 'text-green-400'}`}>
                  {emergencyMode ? 'CIERRE POR FUERZA MAYOR ACTIVO (BLOQUEADO)' : 'SISTEMA ONLINE / OPERATIVO CON NORMALIDAD'}
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN CONFIGURACIÓN DE TRANSFERENCIAS ROTATIVAS */}
      <button
        onClick={() => setShowTransferWindow(true)}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#4be277]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4be277]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#4be277]/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277] group-hover:bg-[#4be277]/20 group-hover:border-[#4be277]/40 transition-all duration-300">
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-[#4be277] transition-colors">
                Rotación de Cuentas para Transferencias
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                CONFIGURACIÓN DE ALIAS, CBU Y TITULAR • INTERCAMBIO SEMANAL AUTOMATIZADO
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#4be277] animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-[#4be277]">
                  ACTIVO ESTA SEMANA: {getActiveAccountIndex() === 0 ? 'CUENTA 1' : 'CUENTA 2'} ({getActiveAccountIndex() === 0 ? transferAlias1 : transferAlias2})
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN RESGUARDO DE BASE DE DATOS Y MULTIMEDIA */}
      <button
        onClick={() => setShowStorageBackupWindow(true)}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#4be277]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-amber-500 transition-colors">
                Resguardo y Multimedia de Base de Datos
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                SISTEMA DE BACKUP • CARPETAS DE GOOGLE CR / SUPABASE STORAGE EN VIVO
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-amber-500">
                  ESPACIO EN USO: 142.5 MB / 1.0 GB • COMPROBANTES DE RESPALDO ACTIVOS
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN RESTRICCIONES Y POLÍTICAS DE CANCHA 1 (CÉSPED) */}
      <button
        onClick={() => setShowCourt1PolicyWindow(true)}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#4be277]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4be277]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#4be277]/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277] group-hover:bg-[#4be277]/20 group-hover:border-[#4be277]/40 transition-all duration-300">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-[#4be277] transition-colors">
                Políticas de Reglas - Cancha 1 (Césped)
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                RESTRICCIONES DE BOTINES • REGULATION WARNINGS • MENSAJE PERSISTIDO EN RESERVAS
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#4be277] animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-[#bccbb9]/70 truncate max-w-[200px] sm:max-w-md block select-none">
                  {court1Policy}
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN RESTRICCIONES Y POLÍTICAS DE CANCHA 2 (SIN CÉSPED) */}
      <button
        onClick={() => setShowCourt2PolicyWindow(true)}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-amber-500/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-amber-500 transition-colors">
                Políticas de Reglas - Cancha 2 (Sin Césped)
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                CALZADO DE SUELA LISA • LOSA DEPORTIVA • RESTRICCIONES DE BOTINES CON COCÓS
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-[#bccbb9]/70 truncate max-w-[200px] sm:max-w-md block select-none">
                  {court2Policy}
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN CONFIGURACIÓN DE CANTINA & MINI-SHOP */}
      <button
        onClick={() => setShowCantinaWindow(true)}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#FF9100]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9100]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF9100]/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-[#FF9100]/10 border-[#FF9100]/20 text-[#FF9100] group-hover:bg-[#FF9100]/20 group-hover:border-[#FF9100]/40 transition-all duration-300">
              <GlassWater className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-[#FF9100] transition-colors">
                Configuración de Cantina, Bebidas y Extras
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                AJUSTE DE TARIFAS • EDITADOR DE PRECIOS Y DESCRIPCIÓN DE CONSUMOS E INSUMOS EXTRAS
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#FF9100] animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-[#FF9100]">
                  TIENDA ACTIVA • {cantinaItemsCount} PRODUCTOS CONFIGURADOS EN CAJA
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN PANEL DE ANALÍTICAS E INTELIGENCIA DE DEMANDA */}
      <button
        onClick={() => setShowAnalyticsWindow(true)}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#10B981]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
              <Activity className="w-6 h-6 animate-pulse" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-emerald-400 transition-colors">
                Panel de Analíticas de Ocupación e Inteligencia
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                OCUPACIÓN HISTÓRICA • FILTROS POR CANCHA • PATRONES DE DEMANDA DIRECTO
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-emerald-400">
                  MONITOREO DE SATURACIÓN ACTIVO • VER PATRONES DE DEMANDA DE RESERVAS
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      {/* BOTÓN PRUEBA DE FUEGO Y DIAGNÓSTICOS SUPABASE */}
      <button
        onClick={() => {
          setShowDiagnosticsWindow(true);
          runDiagnostics();
        }}
        className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#4be277]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg animate-pulse"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4be277]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#4be277]/10 transition-all duration-500" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277] group-hover:bg-[#4be277]/20 group-hover:border-[#4be277]/40 transition-all duration-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-[#4be277] transition-colors">
                Prueba de Fuego Supabase & Conexión
              </span>
              <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                DIAGNÓSTICO EN TIEMPO REAL • CRUD TEST • LATENCIA DE BASE DE DATOS
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#4be277] animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-wider font-mono text-[#bccbb9]/70">
                  VERIFICAR RESPUESTA DEL HOST Y OPERATIVIDAD DE TABLAS
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#bccbb9] group-hover:text-white transition-all shrink-0">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}
