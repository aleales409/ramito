import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, Trophy, Wallet, Receipt, Copy, Info } from 'lucide-react';
import { getTransferAccounts } from '../lib/transferRotation';

export default function ConfirmationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const { activeAccount } = getTransferAccounts();

  // Read data passed from BookingView
  const { court, time, date } = (location.state || {}) as { court?: any; time?: string; date?: string };
  const courtName = court?.name || 'Cancha Ramito Fut Show';
  const courtImage = court?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI2rR_zidKFtJFxsXgf-iBEkAl2R-EfWM9xwF87LMnUecRPj-EU8uVrmO5z29sIThB3bNFTDI-aoGQDn_93BuqWLdS-srGtl1K1actD1HXlEMP1Nw6SPpHHFgqu2NHg_32Ko675tdbIxjyUU8a-aB0jpjGbFu1Dwj6su5LFlHhxj73Yr-qS3Wf8fvBBdB9RVAi870qod4DA7yyVuVB-f9XPA7cNpK54mQfrUMcZyUIP58WddmJCOdL0q-qlbIediyoUbNPc2dAyQId';
  const slotTime = time || '19:00';
  const slotDate = date || 'Lunes 24 Mayo';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleConfirm = async () => {
    const status = paymentMethod === 'transfer' ? 'pending_payment' : 'upcoming';
    const userName = localStorage.getItem('ramito_user_name') || 'Anónimo';
    
    const bookingData = {
      date: slotDate,
      time: slotTime,
      field: courtName,
      amount: 'S/ 125.00',
      user: userName,
      status: status,
      payment_method: paymentMethod,
      created_at: new Date().toISOString()
    };

    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('bookings').insert([bookingData]);
      if (error) throw error;

      localStorage.setItem('last_booking_status', status);
      localStorage.setItem('last_payment_method', paymentMethod);
      
      navigate('/success', { state: { bookingData } });
    } catch (err) {
      console.error('Error saving booking:', err);
      // Fallback for demo
      navigate('/success', { state: { bookingData } });
    }
  };

  return (
    <main className="px-5 space-y-6 mt-12 mb-32 max-w-md mx-auto">
      {/* Resumen de la Reserva */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 uppercase italic text-white">
          <CheckCircle2 className="w-6 h-6 text-[#4be277]" />
          Confirmar Reserva
        </h2>

        <div className="bg-[#1a1c1c]/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <div className="relative h-48">
            <img
              alt={courtName}
              className="w-full h-full object-cover"
              src={courtImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121414] to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="bg-[#4be277]/20 backdrop-blur-md text-[#4be277] px-4 py-1 rounded-full text-[10px] font-bold border border-[#4be277]/30 uppercase tracking-widest">
                Cancha Premium
              </span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <h3 className="font-display text-lg font-bold text-white uppercase italic">{courtName}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#bccbb9]">
                <Calendar className="w-5 h-5 text-[#4ae176]" />
                <span className="text-xs font-semibold uppercase">{slotDate}</span>
              </div>
              <div className="flex items-center gap-3 text-[#bccbb9]">
                <Clock className="w-5 h-5 text-[#4ae176]" />
                <span className="text-xs font-semibold uppercase">{slotTime} (1 Hora)</span>
              </div>
              <div className="flex items-center gap-3 text-[#bccbb9]">
                <Trophy className="w-5 h-5 text-[#4ae176]" />
                <span className="text-xs font-semibold uppercase">Fútbol 5 - Césped Sintético</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Detalles de Pago */}
      <section className="bg-[#1a1c1c]/60 backdrop-blur-xl rounded-3xl p-5 space-y-4 border border-white/10">
        <h3 className="text-[10px] font-bold text-[#4be277] uppercase tracking-[0.2em]">Resumen de Pago</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[#bccbb9]">
            <span className="text-xs font-semibold uppercase italic">Alquiler de cancha</span>
            <span className="text-xs font-bold">S/ 120.00</span>
          </div>
          <div className="flex justify-between items-center text-[#bccbb9]">
            <span className="text-xs font-semibold uppercase italic">Cargos por servicio</span>
            <span className="text-xs font-bold">S/ 5.00</span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm font-bold text-white uppercase italic">Total a pagar</span>
            <span className="text-xl font-display font-black text-[#4be277]">S/ 125.00</span>
          </div>
        </div>
      </section>

      {/* Método de Pago */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Método de Pago</h3>
        <div className="space-y-2">
          <label 
            onClick={() => setPaymentMethod('transfer')}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              paymentMethod === 'transfer' ? 'border-[#4be277] bg-[#4be277]/5' : 'border-white/10 bg-[#1a1c1c]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Wallet className={`w-5 h-5 ${paymentMethod === 'transfer' ? 'text-[#4be277]' : 'text-[#bccbb9]'}`} />
              <span className="text-xs font-bold uppercase tracking-wide">Transferencia</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'transfer' ? 'border-[#4be277]' : 'border-white/20'
            }`}>
              {paymentMethod === 'transfer' && <div className="w-2.5 h-2.5 rounded-full bg-[#4be277]" />}
            </div>
          </label>

          {paymentMethod === 'transfer' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 rounded-2xl border border-[#4be277]/20 bg-[#4be277]/5 space-y-4 overflow-hidden text-left"
            >
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#4be277]/10 border border-[#4be277]/25 text-[8.5px] font-black text-[#4be277] uppercase tracking-wider font-sans">
                <Info className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                <span>Cuenta de Producción • Rotación de Enlace Activa</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-[#4be277]/70 uppercase tracking-[0.1em]">ALIAS</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{activeAccount.alias}</span>
                  <Copy 
                    onClick={() => copyToClipboard(activeAccount.alias)}
                    className="w-4 h-4 text-[#4be277] cursor-pointer hover:scale-110 transition-transform" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-[#4be277]/70 uppercase tracking-[0.1em]">CBU (22 DÍGITOS)</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{activeAccount.cbu}</span>
                  <Copy 
                    onClick={() => copyToClipboard(activeAccount.cbu)}
                    className="w-4 h-4 text-[#4be277] cursor-pointer hover:scale-110 transition-transform" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-[#4be277]/70 uppercase tracking-[0.1em]">TITULAR DE LA CUENTA</span>
                <span className="text-xs font-black text-white">{activeAccount.titular}</span>
              </div>
            </motion.div>
          )}

          <label 
            onClick={() => {
              setPaymentMethod('cash');
            }}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              paymentMethod === 'cash' ? 'border-[#4be277] bg-[#4be277]/5' : 'border-white/10 bg-[#1a1c1c]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Receipt className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-[#4be277]' : 'text-[#bccbb9]'}`} />
              <span className="text-xs font-bold uppercase tracking-wide">Efectivo en puerta</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'cash' ? 'border-[#4be277]' : 'border-white/20'
            }`}>
              {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-[#4be277]" />}
            </div>
          </label>
        </div>
      </section>

      {/* Políticas */}
      <section className="bg-[#1e2020] rounded-2xl p-4 flex gap-4">
        <Info className="w-5 h-5 text-[#4be277] flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-[#bccbb9] leading-relaxed uppercase tracking-wider">
            Cancelación gratuita hasta 24 horas antes del inicio. El uso de chimpunes con cocos grandes está prohibido por cuidado del césped.
          </p>
        </div>
      </section>

      {/* Persistent Button Placeholders */}
      <div className="h-10"></div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-[#121414]/80 backdrop-blur-2xl border-t border-white/10 z-[40]">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          className="w-full h-14 bg-gradient-to-r from-[#FF9100] via-[#4be277] to-[#D32F2F] text-[#121414] font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(255,145,0,0.3)] flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
        >
          <CheckCircle2 className="w-5 h-5" />
          CONFIRMAR RESERVA
        </motion.button>
      </div>
    </main>
  );
}
