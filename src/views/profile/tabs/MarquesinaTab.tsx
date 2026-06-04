import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Smartphone, Sparkles, Save, Clock, Info } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface MarquesinaTabProps {
  userRole: string | null;
  addAuditLog: (action: string, details: string, type: 'info' | 'warning' | 'success' | 'alert') => void;
}

export default function MarquesinaTab({ userRole, addAuditLog }: MarquesinaTabProps) {
  const {
    marqueeText, setMarqueeText,
    secondaryMarqueeText, setSecondaryMarqueeText,
    schedule, saveSettings, showToast
  } = useApp();

  const [newMarqueeText, setNewMarqueeText] = useState(marqueeText || '');
  const [newSecondaryMarqueeText, setNewSecondaryMarqueeText] = useState(secondaryMarqueeText || '');

  // Opening hours states
  const [newWeekdayOpen, setNewWeekdayOpen] = useState(schedule?.weekday?.open || '18:00');
  const [newWeekdayClose, setNewWeekdayClose] = useState(schedule?.weekday?.close || '23:00');
  const [newWeekdayOpen2, setNewWeekdayOpen2] = useState(schedule?.weekday?.open2 || '08:00');
  const [newWeekdayClose2, setNewWeekdayClose2] = useState(schedule?.weekday?.close2 || '12:00');
  const [newWeekdayUseTwoShifts, setNewWeekdayUseTwoShifts] = useState(schedule?.weekday?.useTwoShifts || false);

  const [newWeekendOpen, setNewWeekendOpen] = useState(schedule?.weekend?.open || '15:00');
  const [newWeekendClose, setNewWeekendClose] = useState(schedule?.weekend?.close || '23:00');
  const [newWeekendOpen2, setNewWeekendOpen2] = useState(schedule?.weekend?.open2 || '09:00');
  const [newWeekendClose2, setNewWeekendClose2] = useState(schedule?.weekend?.close2 || '13:00');
  const [newWeekendUseTwoShifts, setNewWeekendUseTwoShifts] = useState(schedule?.weekend?.useTwoShifts || false);

  const handleSaveSchedule = async () => {
    try {
      await saveSettings({
        schedule: {
          weekday: { 
            open: newWeekdayOpen, 
            close: newWeekdayClose, 
            open2: newWeekdayOpen2, 
            close2: newWeekdayClose2, 
            useTwoShifts: newWeekdayUseTwoShifts 
          },
          weekend: { 
            open: newWeekendOpen, 
            close: newWeekendClose, 
            open2: newWeekendOpen2, 
            close2: newWeekendClose2, 
            useTwoShifts: newWeekendUseTwoShifts 
          }
        }
      });
      addAuditLog(
        'HORARIOS DEL COMPLEJO', 
        `Actualización ordinaria de horarios de atención efectuada: LUNES-VIERNES (${newWeekdayOpen} a ${newWeekdayClose}${newWeekdayUseTwoShifts ? ` y ${newWeekdayOpen2} a ${newWeekdayClose2}` : ''}) - SÁBADO-DOMINGO (${newWeekendOpen} a ${newWeekendClose}${newWeekendUseTwoShifts ? ` y ${newWeekendOpen2} a ${newWeekendClose2}` : ''}). Estado sincronizado en tiempo real.`, 
        'success'
      );
      showToast('Horarios del complejo actualizados', 'success');
    } catch (err) {
      showToast('Error al guardar horarios');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-6"
    >
      {!userRole?.includes('admin') ? (
        /* Vista jugadores / No admin */
        <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Newspaper className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Noticias del Complejo</h3>
              <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest">Anuncios y novedades importantes</p>
            </div>
          </div>

          <div className="p-4 bg-[#121414]/90 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF9100]/5 rounded-full blur-xl pointer-events-none" />
            
            {/* Animación del marquee local para previsualizarlo */}
            <div className="w-full bg-black/85 rounded-lg py-2.5 px-4 overflow-hidden border border-white/5">
              <div className="whitespace-nowrap animate-marquee inline-block text-[9.5px] font-mono uppercase tracking-wider">
                <span className="text-[#FF9100]">{marqueeText}</span>
                {(() => {
                  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
                  const tRange = isWeekend ? { open: schedule?.weekend?.open || '15:00', close: schedule?.weekend?.close || '23:00' } : { open: schedule?.weekday?.open || '18:00', close: schedule?.weekday?.close || '23:00' };
                  const now = new Date();
                  const currentHours = now.getHours();
                  const currentMinutes = now.getMinutes();
                  const currentTime = currentHours + currentMinutes / 60;
                  const [openH, openM] = tRange.open.split(':').map(Number);
                  const [closeH, closeM] = tRange.close.split(':').map(Number);
                  const openTime = openH + openM / 60;
                  const closeTime = closeH + closeM / 60;
                  let currentlyOpen = false;
                  if (closeTime < openTime) {
                    if (currentTime >= openTime || currentTime <= closeTime) currentlyOpen = true;
                  } else {
                    if (currentTime >= openTime && currentTime <= closeTime) currentlyOpen = true;
                  }

                  return currentlyOpen ? (
                    <span className="text-white">
                      {' • '}HOY <span className="text-[#4be277] font-black">ABIERTO</span> DE{' '}
                      <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{tRange.open}</span>
                      {' '}A{' '}
                      <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{tRange.close}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      {' • '}<span className="text-red-500 font-extrabold">COMPLEJO CERRADO</span> • ABRIMOS A LAS{' '}
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-black">{tRange.open}</span>
                    </span>
                  );
                })()}
                <span className="text-zinc-500 mx-5">•</span>
              </div>
            </div>

            <p className="text-[9.5px] font-bold text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed">
              Sigue las redes sociales y el marquesina para no perderte campeonatos, clínicas y torneos flash organizados por el complejo.
            </p>
          </div>
        </div>
      ) : (
        /* Vista Administradores */
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Administrar Noticias y Marquesina (Marque)</h3>
            <p className="text-[10px] font-bold text-[#bccbb9]/60 uppercase tracking-widest max-w-sm">
              Reconfigure el texto del marquee, defina los horarios de atención y configure las noticias semanales del complejo.
            </p>
          </div>

          {/* Marquesina Live Editor */}
          <div className="glass-panel rounded-3xl border border-white/5 p-4 xs:p-5 space-y-5 bg-zinc-950/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9100]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <Smartphone className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-[11px] font-black text-white uppercase tracking-wider block italic font-sans">Texto del Marquee Activo</span>
                <span className="text-[8px] font-mono text-[#FF9100] tracking-wider block">ANUNCIO SCROLL EN LA BARRA DE NAVEGACIÓN SUPERIOR</span>
              </div>
            </div>

            {/* MINI PREVISUALIZADOR MARQUEE */}
            <div className="space-y-2">
              <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-wider block font-bold">Vista Previa Real</span>
              <div className="w-full bg-black/90 rounded-2xl px-4 py-3 flex items-center overflow-hidden border border-white/5 relative">
                <div className="whitespace-nowrap animate-marquee inline-block text-[10px] font-black tracking-[0.1em] uppercase italic">
                  <span className="text-[#FF9100]">{marqueeText}</span>
                  {secondaryMarqueeText && (
                    <span className="text-[#009EE3] ml-3 bg-[#009EE3]/15 px-2 py-0.5 rounded-lg border border-[#009EE3]/30 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3] animate-ping shrink-0" />
                      <Sparkles className="w-3.5 h-3.5 text-[#009EE3] shrink-0 inline" />
                      {secondaryMarqueeText}
                    </span>
                  )}
                  {(() => {
                    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
                    const tRange = isWeekend ? { open: newWeekendOpen, close: newWeekendClose } : { open: newWeekdayOpen, close: newWeekdayClose };
                    const now = new Date();
                    const currentHours = now.getHours();
                    const currentMinutes = now.getMinutes();
                    const currentTime = currentHours + currentMinutes / 60;
                    const [openH, openM] = tRange.open.split(':').map(Number);
                    const [closeH, closeM] = tRange.close.split(':').map(Number);
                    const openTime = openH + openM / 60;
                    const closeTime = closeH + closeM / 60;
                    let currentlyOpen = false;
                    if (closeTime < openTime) {
                      if (currentTime >= openTime || currentTime <= closeTime) currentlyOpen = true;
                    } else {
                      if (currentTime >= openTime && currentTime <= closeTime) currentlyOpen = true;
                    }

                    return currentlyOpen ? (
                      <span className="text-white">
                        {' • '}HOY <span className="text-[#4be277] font-black">ABIERTO</span> DE{' '}
                        <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{tRange.open}</span>
                        {' '}A{' '}
                        <span className="bg-[#4be277]/10 text-[#4be277] border border-[#4be277]/20 px-1.5 py-0.5 rounded font-mono font-black">{tRange.close}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-400">
                        {' • '}<span className="text-red-500 font-extrabold">COMPLEJO CERRADO</span> • ABRIMOS A LAS{' '}
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono font-black">{tRange.open}</span>
                      </span>
                    );
                  })()}
                  <span className="text-zinc-500 mx-5">•</span>
                  <span className="text-[#FF9100]">{marqueeText}</span>
                  {secondaryMarqueeText && (
                    <span className="text-[#009EE3] ml-3 bg-[#009EE3]/15 px-2 py-0.5 rounded-lg border border-[#009EE3]/30 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3] animate-ping shrink-0" />
                      <Sparkles className="w-3.5 h-3.5 text-[#009EE3] shrink-0 inline" />
                      {secondaryMarqueeText}
                    </span>
                  )}
                  <span className="text-zinc-500 mx-5">•</span>
                </div>
              </div>
            </div>

            {/* Input de texto marquee */}
            <div className="space-y-2">
              <label className="text-[8.5px] font-black text-[#bccbb9]/60 uppercase tracking-widest block font-bold">Escribir Nueva Noticia / Marquesina</label>
              <textarea
                rows={3}
                value={newMarqueeText}
                onChange={(e) => setNewMarqueeText(e.target.value)}
                placeholder="Redacte la noticia aquí..."
                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl p-3.5 text-xs text-white uppercase font-bold focus:border-[#FF9100]/60 transition-all outline-none resize-none leading-relaxed no-scrollbar"
              />
            </div>

            <button 
              onClick={async () => {
                if (!newMarqueeText.trim()) {
                  showToast('El texto de la marquesina no puede estar vacío', 'error');
                  return;
                }
                try {
                  await saveSettings({ marquee_text: newMarqueeText });
                  setMarqueeText(newMarqueeText);
                  addAuditLog('CAMBIO DE MARQUESINA', `Se actualizó el banner de noticias a: ${newMarqueeText.toUpperCase()}`, 'success');
                  showToast('Colección de noticias/marquesina guardada con éxito', 'success');
                } catch (err) {
                  showToast('Error al actualizar la marquesina', 'error');
                }
              }}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl uppercase text-[9px] tracking-widest italic shadow-lg shadow-[#FF9100]/15 flex items-center justify-center gap-2 transition-all outline-none active:scale-[0.98]"
            >
              <Save className="w-4 h-4" /> Guardar Marquesina
            </button>

            {/* NOTICIA SECUNDARIA */}
            <div className="space-y-4 border-t border-white/5 pt-5 relative">
              <div className="absolute top-5 right-0 w-24 h-24 bg-[#009EE3]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#009EE3]/10 flex items-center justify-center border border-[#009EE3]/20">
                    <Smartphone className="w-4.5 h-4.5 text-[#009EE3]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-wider block italic font-sans">Noticia Secundaria / Alerta Crítica (Opcional)</span>
                    <span className="text-[7.5px] font-mono text-[#009EE3] tracking-wider block">COLOR AZUL NEÓN • VA ANTES DEL HORARIO ABIERTO/CERRADO</span>
                  </div>
                </div>
                {secondaryMarqueeText && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await saveSettings({ secondary_marquee_text: '' });
                        setSecondaryMarqueeText('');
                        setNewSecondaryMarqueeText('');
                        addAuditLog('CAMBIO DE MARQUESINA SEC.', `Se eliminó la noticia secundaria de la marquesina`, 'success');
                        showToast('Noticia secundaria eliminada con éxito', 'success');
                      } catch (err) {
                        showToast('Error al limpiar la noticia secundaria', 'error');
                      }
                    }}
                    className="text-[7px] text-red-400 hover:text-red-300 font-extrabold uppercase tracking-widest bg-red-500/5 hover:bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/10 transition-all self-start sm:self-center"
                  >
                    Eliminar Noticia
                  </button>
                )}
              </div>

              <textarea
                rows={2}
                value={newSecondaryMarqueeText}
                onChange={(e) => setNewSecondaryMarqueeText(e.target.value)}
                placeholder="Escriba aquí la noticia secundaria (ej. ¡PROMO 2X1 CANCHA SINTÉTICA HOY DE 15 A 18 HS!)..."
                className="w-full bg-zinc-950/80 border border-white/10 rounded-xl p-3.5 text-xs text-white uppercase font-bold focus:border-[#009EE3]/60 transition-all outline-none resize-none leading-relaxed no-scrollbar"
              />

              <button 
                onClick={async () => {
                  try {
                    await saveSettings({ secondary_marquee_text: newSecondaryMarqueeText });
                    setSecondaryMarqueeText(newSecondaryMarqueeText);
                    addAuditLog('CAMBIO DE MARQUESINA SEC.', `Se actualizó la noticia secundaria a: ${newSecondaryMarqueeText.toUpperCase()}`, 'success');
                    showToast('Noticia secundaria guardada con éxito', 'success');
                  } catch (err) {
                    showToast('Error al actualizar la noticia secundaria', 'error');
                  }
                }}
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800/80 text-[#009EE3] hover:text-sky-400 border border-[#009EE3]/15 hover:border-[#009EE3]/30 font-black rounded-xl uppercase text-[8.5px] tracking-widest italic flex items-center justify-center gap-2 transition-all outline-none active:scale-[0.98]"
              >
                <Save className="w-4 h-4" /> Guardar Noticia Secundaria
              </button>
            </div>
          </div>

          {/* HORARIOS DE APERTURA Y CIERRE */}
          <div className="glass-panel rounded-3xl border border-white/5 p-4 xs:p-5 space-y-5 bg-zinc-950/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-[11px] font-black text-white uppercase tracking-wider block italic font-sans">Sincronización de Horario del Complejo</span>
                <span className="text-[8px] font-mono text-blue-400 tracking-wider block">DETERMINA EL ESTADO EN LA MARQUESINA (ABIERTO / CERRADO)</span>
              </div>
            </div>

            <p className="text-[9.5px] font-bold text-[#bccbb9]/45 uppercase tracking-wide leading-relaxed">
              Establezca los rangos horarios operacionales de atención para actualizar dinámicamente el cartel del tope de la pantalla:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lunes a Viernes */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2">
                  <span className="text-[9.5px] font-black text-[#bccbb9] uppercase tracking-widest block font-sans">LUNES A VIERNES</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={newWeekdayUseTwoShifts} 
                      onChange={(e) => setNewWeekdayUseTwoShifts(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/15 bg-black/40 text-blue-500 focus:ring-0 focus:ring-offset-0 checkmark-custom"
                    />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-sans">Rango Partido</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[8px] font-black text-amber-500/80 uppercase tracking-wider mb-2 font-mono">
                      {newWeekdayUseTwoShifts ? '⏰ TURNO 1 (MAÑANA)' : '⏰ HORARIO CORRIDO'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA APERTURA</span>
                        <input 
                          type="time" 
                          value={newWeekdayOpen}
                          onChange={(e) => setNewWeekdayOpen(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA CIERRE</span>
                        <input 
                          type="time" 
                          value={newWeekdayClose}
                          onChange={(e) => setNewWeekdayClose(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {newWeekdayUseTwoShifts && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="text-[8px] font-black text-emerald-400/80 uppercase tracking-wider font-mono">⏰ TURNO 2 (TARDE/NOCHE)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA APERTURA</span>
                          <input 
                            type="time" 
                            value={newWeekdayOpen2}
                            onChange={(e) => setNewWeekdayOpen2(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA CIERRE</span>
                          <input 
                            type="time" 
                            value={newWeekdayClose2}
                            onChange={(e) => setNewWeekdayClose2(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sábados y Domingos */}
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2">
                  <span className="text-[9.5px] font-black text-[#bccbb9] uppercase tracking-widest block font-sans">SÁBADO Y DOMINGO</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={newWeekendUseTwoShifts} 
                      onChange={(e) => setNewWeekendUseTwoShifts(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/15 bg-black/40 text-blue-500 focus:ring-0 focus:ring-offset-0 checkmark-custom"
                    />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-sans">Rango Partido</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[8px] font-black text-amber-500/80 uppercase tracking-wider mb-2 font-mono">
                      {newWeekendUseTwoShifts ? '⏰ TURNO 1 (MAÑANA)' : '⏰ HORARIO CORRIDO'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA APERTURA</span>
                        <input 
                          type="time" 
                          value={newWeekendOpen}
                          onChange={(e) => setNewWeekendOpen(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA CIERRE</span>
                        <input 
                          type="time" 
                          value={newWeekendClose}
                          onChange={(e) => setNewWeekendClose(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {newWeekendUseTwoShifts && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="text-[8px] font-black text-emerald-400/80 uppercase tracking-wider font-mono">⏰ TURNO 2 (TARDE/NOCHE)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA APERTURA</span>
                          <input 
                            type="time" 
                            value={newWeekendOpen2}
                            onChange={(e) => setNewWeekendOpen2(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[7px] font-mono text-zinc-500 uppercase block mb-1">HORA CIERRE</span>
                          <input 
                            type="time" 
                            value={newWeekendClose2}
                            onChange={(e) => setNewWeekendClose2(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic calculative status badge */}
            {(() => {
              const now = new Date();
              const day = now.getDay();
              const isWeekend = day === 0 || day === 6;
              const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day];
              
              const currentHours = now.getHours();
              const currentMinutes = now.getMinutes();
              const currentTime = currentHours + currentMinutes / 60;
              
              const openStr = isWeekend ? newWeekendOpen : newWeekdayOpen;
              const closeStr = isWeekend ? newWeekendClose : newWeekdayClose;
              const openStr2 = isWeekend ? newWeekendOpen2 : newWeekdayOpen2;
              const closeStr2 = isWeekend ? newWeekendClose2 : newWeekdayClose2;
              const use2 = isWeekend ? newWeekendUseTwoShifts : newWeekdayUseTwoShifts;

              const checkInShift = (op: string, cl: string) => {
                if (!op || !cl) return false;
                const [openH, openM] = op.split(':').map(Number);
                const [closeH, closeM] = cl.split(':').map(Number);
                const openTime = openH + openM / 60;
                const closeTime = closeH + closeM / 60;
                if (closeTime < openTime) {
                  return currentTime >= openTime || currentTime <= closeTime;
                } else {
                  return currentTime >= openTime && currentTime <= closeTime;
                }
              };

              let currentlyOpen = checkInShift(openStr, closeStr);
              if (use2) {
                currentlyOpen = currentlyOpen || checkInShift(openStr2, closeStr2);
              }

              return (
                <div className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-2xl flex items-start gap-2.5 text-left font-sans">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block">COMPROBACIÓN DE TELEMETRÍA EN VIVO</span>
                    <p className="text-[9.5px] font-bold text-[#bccbb9]/70 uppercase tracking-wide leading-relaxed mt-0.5">
                      Hoy es <span className="text-white font-extrabold">{dayName}</span>. Basado en las horas elegidas, el complejo registraría en su marquesina el estado de <span className={`font-black ${currentlyOpen ? 'text-[#4be277]' : 'text-red-500'}`}>{currentlyOpen ? '● BIENVENIDO / ABIERTO' : '● CERRADO / OPERACIONES SUSPENDIDAS'}</span> ({openStr} a {closeStr}{use2 ? ` y ${openStr2} a {closeStr2}` : ''}).
                    </p>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleSaveSchedule}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl uppercase text-[9px] tracking-widest italic flex items-center justify-center gap-2 transition-all outline-none active:scale-[0.98]"
            >
              <Save className="w-4 h-4" /> Sincronizar Horarios en Tiempo Real
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
