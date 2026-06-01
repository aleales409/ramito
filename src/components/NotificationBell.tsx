import React, { useState } from 'react';
import { Bell, X, Trash2, ShieldAlert, Check, AlertTriangle, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function NotificationBell() {
  const { notifications, setNotifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications ? notifications.filter((n: any) => !n.read).length : 0;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          if (!showNotifications && unreadCount > 0) markAllAsRead();
          setShowNotifications(true);
        }}
        className="w-12 h-12 rounded-2xl bg-[#121414]/30 backdrop-blur-md flex items-center justify-center text-[#bccbb9] hover:bg-white/10 hover:text-white transition-all relative border border-white/10 shadow-lg"
        title="Ver notificaciones del sistema"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-[#121414] animate-ping" />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-[#121414]" />
          </>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-zinc-950 overflow-y-auto w-full h-full select-none">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-grow justify-between min-h-screen">
              {/* Header inside fullscreen view */}
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Centro de Notificaciones</h4>
                      <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                        ALERTAS EN TIEMPO REAL • COMPROBANTES DE PAGO Y EVENTOS ESTELARES DEL SISTEMA
                      </span>
                    </div>
                  </div>
                  
                  {/* Persistent Close "X" Button */}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/10 shadow-lg shrink-0 active:scale-95"
                    title="Cerrar y Regresar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subtitle / Counter indicators */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-black text-white tracking-widest uppercase">
                      Mensajes Totales: {notifications?.length || 0}
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[8px] font-black bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest leading-none">
                        {unreadCount} Sin Leer
                      </span>
                    )}
                  </div>

                  {notifications?.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
                    </button>
                  )}
                </div>

                {/* Notifications detailed timeline list */}
                <div className="space-y-4">
                  {(!notifications || notifications.length === 0) ? (
                    <div className="py-24 text-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                      <Bell className="w-14 h-14 text-[#bccbb9]/10 mx-auto mb-4" />
                      <p className="text-[11px] font-black text-[#bccbb9]/20 uppercase tracking-[0.3em] italic">Ninguna alerta o notificación en el historial</p>
                      <p className="text-[9px] font-semibold text-[#bccbb9]/40 uppercase tracking-wider mt-1.5">Las transacciones y comprobantes nuevos aparecerán aquí al instante</p>
                    </div>
                  ) : (
                    [...notifications].reverse().map((n: any, i: number) => {
                      const isComprobante = n.title?.toUpperCase().includes('COMPROBANTE') || n.title?.toUpperCase().includes('PAGO');
                      const isValidado = n.title?.toUpperCase().includes('CONFIRMADA') || n.title?.toUpperCase().includes('VALIDADO') || n.title?.toUpperCase().includes('EXITO');
                      const isFallo = n.title?.toUpperCase().includes('RECHAZADO') || n.title?.toUpperCase().includes('FALLID');
                      
                      const isStockAlarm = n.title?.toUpperCase().includes('INVENTARIO') || n.title?.toUpperCase().includes('STOCK');
                      const isEmergencia = n.title?.toUpperCase().includes('EMERGENCIA') || n.title?.toUpperCase().includes('REAPERTURA') || n.title?.toUpperCase().includes('CIERRE');

                      let borderClass = 'border-white/5 hover:border-white/10';
                      let iconBgClass = 'bg-transparent border-white/10 text-[#bccbb9]';
                      let textHoverClass = 'group-hover:text-amber-500';

                      if (isComprobante) {
                        borderClass = 'border-amber-500/15 hover:border-amber-500/30';
                        iconBgClass = 'bg-transparent border-amber-500/30 text-amber-500';
                        textHoverClass = 'group-hover:text-amber-400';
                      } else if (isValidado) {
                        borderClass = 'border-emerald-500/15 hover:border-emerald-500/30';
                        iconBgClass = 'bg-transparent border-emerald-500/30 text-[#4be277]';
                        textHoverClass = 'group-hover:text-[#4be277]';
                      } else if (isFallo) {
                        borderClass = 'border-red-500/15 hover:border-red-500/30';
                        iconBgClass = 'bg-transparent border-red-500/30 text-red-500';
                        textHoverClass = 'group-hover:text-red-400';
                      }

                      if (isStockAlarm || isEmergencia) {
                        const isRed = n.title?.toUpperCase().includes('AGOTADO') || n.title?.toUpperCase().includes('CRÍTICO') || n.title?.toUpperCase().includes('CIERRE') || n.title?.toUpperCase().includes('EMERGENCIA');
                        const isGreen = n.title?.toUpperCase().includes('REAPERTURA') || n.title?.toUpperCase().includes('REHABILITADO') || n.title?.toUpperCase().includes('ÉXITO') || n.title?.toUpperCase().includes('CORRECTO');
                        
                        if (isRed) {
                          borderClass = 'border-red-500/30 hover:border-red-500/60';
                          iconBgClass = 'bg-transparent border-red-500/40 text-red-500';
                          textHoverClass = 'group-hover:text-red-400';
                        } else if (isGreen) {
                          borderClass = 'border-emerald-500/30 hover:border-emerald-500/60';
                          iconBgClass = 'bg-transparent border-emerald-500/40 text-emerald-400';
                          textHoverClass = 'group-hover:text-[#4be277]';
                        } else {
                          // Amber by default for warning/caution
                          borderClass = 'border-amber-500/30 hover:border-amber-500/60';
                          iconBgClass = 'bg-transparent border-amber-500/40 text-amber-500';
                          textHoverClass = 'group-hover:text-amber-400';
                        }
                      }

                      /* 
                        GUIDELINE FOR PREMIUM STYLING & ICON REPRESENTAION:
                        ====================================================
                        ALWAYS use premium, minimalist drawn/outlined vector icons (e.g. standard Lucide outlined icons)
                        with glass border accents and transparent/semi-transparent backdrops.
                        AVOID solid, heavily filled, or opaque round background badges on icons as they disrupt the dark UI's elegant rhythm.
                      */

                      return (
                        <motion.div 
                          key={n.id || i} 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.05, 0.4) }}
                          className={`p-5 bg-gradient-to-r from-zinc-950 to-zinc-900/60 rounded-3xl border relative overflow-hidden text-left flex items-start gap-4 transition-all group ${borderClass}`}
                        >
                          {/* Colored category dot (fully minimalist, drawn and outlined, no solid fill) */}
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${iconBgClass}`}>
                            {isComprobante ? (
                              <ShieldAlert className="w-4.5 h-4.5" />
                            ) : isValidado ? (
                              <Check className="w-4.5 h-4.5" />
                            ) : isFallo ? (
                              <AlertTriangle className="w-4.5 h-4.5" />
                            ) : isStockAlarm ? (
                              <ShieldAlert className="w-4.5 h-4.5 animate-bounce" />
                            ) : (
                              <Info className="w-4.5 h-4.5" />
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <span className={`text-white text-[12px] font-black uppercase italic leading-none block ${textHoverClass} transition-colors`}>
                                {n.title}
                              </span>
                              <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block font-mono">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[10.5px] font-bold text-[#bccbb9] uppercase tracking-wide leading-relaxed font-sans block">
                              {n.body}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Back / Bottom close button */}
              <div className="pt-8 mt-12 border-t border-white/5">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4" /> Regresar al Menú Principal
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
