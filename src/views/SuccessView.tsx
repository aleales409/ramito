import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Share2, CalendarDays, Clock, DollarSign, Activity, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SuccessView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setNotifications, setAllBookings, showToast, adminPhone } = useApp();
  
  const bookingStatus = localStorage.getItem('last_booking_status') || 'upcoming';
  const paymentMethod = localStorage.getItem('last_payment_method') || 'cash';
  const userName = localStorage.getItem('ramito_user_name') || 'Agus Castro';
  
  // Obtener los datos reales del turno recién reservado
  const bookingData = location.state?.bookingData || {
    date: 'Mañana, Sábado',
    time: '21:00 - 22:00',
    field: 'Cancha 1 • El Maracaná',
    amount: '$ 35.000',
    status: bookingStatus
  };

  const [playerCount, setPlayerCount] = useState(10);

  useEffect(() => {
    // Si los datos vinieron por state, ya se guardaron en ConfirmationView. 
    // No obstante, si se requiere asegurar el registro local:
    if (location.state?.bookingData) {
      // Ya guardado, pero validamos no duplicar.
    }
  }, []);

  const isPending = bookingStatus === 'pending_approval' || bookingStatus === 'pending_payment';
  const needsTicket = bookingStatus === 'pending_payment';

  // Analizar monto de forma ultra segura para dividir
  const parseAmountValue = (amt: string) => {
    if (!amt) return 35000;
    let cleaned = amt;
    // Si viene con formato de decimales, lidiar con ello
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts[parts.length - 1] === '00' || parts[parts.length - 1].length === 2) {
        parts.pop();
        cleaned = parts.join('');
      }
    }
    const digitsOnly = cleaned.replace(/\D/g, '');
    const val = parseInt(digitsOnly, 10);
    return isNaN(val) ? 35000 : val;
  };

  const totalCost = parseAmountValue(bookingData.amount);
  const shareAmount = Math.ceil(totalCost / playerCount);

  const handleShareSplitMsg = () => {
    const isCancha1 = bookingData.field?.toUpperCase().includes('CANCHA 1') || bookingData.field?.toUpperCase().includes('MARACANÁ') || !bookingData.field?.toUpperCase().includes('CANCHA 2');
    const courtName = isCancha1 ? 'Cancha 1 • El Maracaná 🏟️' : 'Cancha 2 • La Bombonera 🏟️';
    const totalCostStr = `$ ${totalCost.toLocaleString('es-AR')}`;
    const shareAmountStr = `$ ${shareAmount.toLocaleString('es-AR')}`;
    
    const textMsg = `¡Muchachos! Ya tenemos reservada la cancha: *${courtName}* 🏟️\n🗓️ *Fecha*: ${bookingData.date}\n⏰ *Horario*: ${bookingData.time} hs\n\nSomos *${playerCount}* jugadores en total, por lo que nos toca pagar *${shareAmountStr}* a cada uno para la cancha. 💰 ¡No falten! ⚽🏆\n\n📲 *Pagar vía Transferencia / Mercado Pago* al número: *${adminPhone}*\n\n_(Monto total: ${totalCostStr})_\n_Enviado desde Ramito Fut Show_`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textMsg);
      if (showToast) {
        showToast(`¡Fútbol Split copiado para ${playerCount} jugadores! Pegalo en WhatsApp.`, 'success');
      } else {
        alert(`¡Fútbol Split copiado para ${playerCount} jugadores! Pastealo en tu grupo.`);
      }
    } else {
      if (showToast) {
        showToast('No se pudo copiar el texto del split.', 'error');
      } else {
        alert('No se pudo copiar el texto.');
      }
    }
  };

  return (
    <main className="relative flex-grow flex flex-col items-center justify-start min-h-[100dvh] pt-20 pb-24 px-5 text-center overflow-y-auto">
      {/* Background Glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 ${isPending ? 'bg-[#FF9100]/15' : 'bg-[#4be277]/15'} blur-[100px] z-0 pointer-events-none`} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative z-10 space-y-5 w-full max-w-sm"
      >
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
            isPending 
              ? 'border-[#FF9100]/30 bg-[#FF9100]/10 text-[#FF9100] shadow-[0_0_20px_rgba(255,145,0,0.1)]' 
              : 'border-[#4be277]/30 bg-[#4be277]/10 text-[#4be277] shadow-[0_0_20px_rgba(75,226,119,0.1)]'
          }`}>
            {isPending ? (
              <Clock className="w-8 h-8" strokeWidth={2.5} />
            ) : (
              <Check className="w-8 h-8" strokeWidth={2.5} />
            )}
          </div>
        </div>

        <div className="space-y-2 px-2">
          <h2 className="font-display text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
            {needsTicket ? 'Reserva Registrada' : isPending ? 'Validando Comprobante' : '¡Reserva Lista!'}
          </h2>
          <p className="text-[#bccbb9]/80 text-[10px] font-bold uppercase tracking-[0.08em] leading-relaxed">
            {needsTicket
              ? 'Tu reserva está separada. Por favor, realiza la transferencia y sube el comprobante en la sección "Mis Reservas" para confirmarla.'
              : isPending 
                ? 'Estamos revisando tu transferencia. Recibirás una notificación cuando sea confirmada.' 
                : paymentMethod === 'cash' 
                  ? 'Tu cancha está reservada. Recuerda realizar el pago en la recepción al llegar.'
                  : 'Tu lugar en la cancha ya es oficial. ¡Prepárate para el show!'}
          </p>
        </div>

        {/* Resumen de Cancha */}
        <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-3xl text-left space-y-3.5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4be277]/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <CalendarDays className="w-4 h-4 text-[#FF9100]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[7.5px] font-black text-[#FF9100]/70 uppercase tracking-widest block leading-none">Cancha Reservada</span>
              <span className="text-xs font-black text-white uppercase italic leading-none mt-1 block truncate">
                {bookingData.field}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/5 font-mono">
            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Fecha y Hora</span>
              <span className="text-[11px] font-black text-white block mt-1 uppercase leading-tight">{bookingData.date}</span>
              <span className="text-[11px] font-black text-[#4be277] block mt-1 leading-none">{bookingData.time} hs</span>
            </div>
            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Monto / Seña</span>
              <span className="text-[14px] font-black text-[#4be277] block mt-1.5 leading-none">{bookingData.amount}</span>
            </div>
          </div>
        </div>

        {/* Fútbol Split - Divisor de gastos para el grupo */}
        <div className="p-4.5 bg-[#4be277]/[0.02] border border-[#4be277]/10 rounded-3xl space-y-3 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#4be277]/10 rounded-full blur-lg pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <DollarSign className="w-4 h-4 text-[#4be277] shrink-0" />
              <span className="text-[9px] font-black uppercase text-[#bccbb9] tracking-wider truncate">Fútbol Split • Dividir Gastos 💰</span>
            </div>
            <span className="text-[6.5px] font-bold text-[#4be277] bg-[#4be277]/10 border border-[#4be277]/20 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">
              Listo para WhatsApp
            </span>
          </div>

          <p className="text-[9px] text-[#bccbb9]/60 font-medium uppercase tracking-wide leading-relaxed">
            Divide automáticamente el total de la cancha entre todos los muchachos que jugarán y comparte las cuotas al instante por WhatsApp.
          </p>

          <div className="flex items-center justify-between gap-3 bg-black/50 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Total Jugadores</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setPlayerCount(p => Math.max(2, p - 1))}
                  className="w-9 h-9 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white font-black text-sm flex items-center justify-center transition-all cursor-pointer select-none border border-white/5"
                >
                  -
                </button>
                <span className="text-sm font-black font-mono text-white w-7 text-center">{playerCount}</span>
                <button
                  type="button"
                  onClick={() => setPlayerCount(p => Math.min(22, p + 1))}
                  className="w-9 h-9 bg-white/5 hover:bg-white/10 active:scale-95 rounded-lg text-white font-black text-sm flex items-center justify-center transition-all cursor-pointer select-none border border-white/5"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right flex flex-col justify-center">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block leading-none mb-1">Cuota por Jugador</span>
              <span className="text-xl font-black text-[#4be277] font-mono block leading-none mt-1">
                $ {shareAmount.toLocaleString('es-AR')}
              </span>
              <span className="text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-wide block mt-1.5">
                Neto unitario exacto
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShareSplitMsg}
            className="w-full h-11 rounded-xl bg-[#4be277] text-black font-black text-[9px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(75,226,119,0.25)] hover:opacity-95"
          >
            <DollarSign className="w-3.5 h-3.5" /> Copiar Cuota del Equipo (WhatsApp Split)
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full max-w-sm mt-6 space-y-3"
      >
        <button
          onClick={() => navigate('/my-bookings')}
          className="w-full h-12 bg-[#1a1c1c] border border-white/15 hover:bg-white/5 text-white font-bold text-[10px] rounded-2xl flex items-center justify-center gap-2.5 uppercase tracking-[0.15em] transition-all"
        >
          <CalendarDays className="w-4 h-4 text-[#FF9100]" />
          Ir a Mis Reservas
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 text-[#bccbb9] text-[9px] font-black uppercase tracking-[0.25em] hover:text-white transition-colors"
        >
          Volver al Inicio
        </button>
      </motion.div>
    </main>
  );
}
