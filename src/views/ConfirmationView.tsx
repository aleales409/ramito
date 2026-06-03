import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Trophy, Wallet, Receipt, Copy, Info, AlertTriangle, Shirt, GlassWater, Sparkles, Check, CreditCard, Smartphone, Shield, X, ArrowRight, Activity, Beer, Droplet, Flame, CupSoda } from 'lucide-react';
import { getTransferAccounts } from '../lib/transferRotation';
import { useApp } from '../context/AppContext';
import { getCantinaItems } from '../lib/cantina';

export default function ConfirmationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('ramito_user_role');
  const isAdmin = role === 'admin_vip' || role === 'admin_elite';
  const { setAllBookings, setNotifications, showToast } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | 'mercadopago'>(isAdmin ? 'cash' : 'transfer');
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'deposit'>('full');
  const [showMPSandbox, setShowMPSandbox] = useState(false);
  const [isProcessingMP, setIsProcessingMP] = useState(false);
  const { activeAccount } = getTransferAccounts();
  const [clientName, setClientName] = useState(isAdmin ? 'Reserva Directa' : '');
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

  // Configuración de catálogo dinámica leída en tiempo real desde el catálogo general
  const cantinaItems = getCantinaItems();
  const EXTRAS_CATALOG = cantinaItems
    .filter(item => item.showInBooking !== false || item.id === 'gatorade_single' || item.id === 'water_single' || item.id === 'beer_single')
    .map(item => {
      let icon = GlassWater;
      let color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

      if (item.id === 'gatorade_pack') {
        icon = CupSoda;
        color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      } else if (item.id === 'gatorade_single') {
        icon = Flame;
        color = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      } else if (item.id === 'water_single') {
        icon = Droplet;
        color = 'text-[#4be277] bg-[#4be277]/10 border-[#4be277]/20';
      } else if (item.id === 'beer_single') {
        icon = Beer;
        color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      } else if (item.iconId === 'vests') {
        icon = Shirt;
        color = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      } else if (item.iconId === 'ball') {
        icon = Trophy;
        color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      } else if (item.iconId === 'bbq') {
        icon = Sparkles;
        color = 'text-red-400 bg-red-500/10 border-red-500/20';
      }

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        short: item.name.split(' ')[0] || 'Extra',
        icon: icon,
        color: color,
        stock: item.stock
      };
    });

  // Read data passed from BookingView
  const { court, time, date, price } = (location.state || {}) as { court?: any; time?: string; date?: string; price?: number };
  const courtName = court?.name || 'Cancha Ramito Fut Show';
  const courtImage = court?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI2rR_zidKFtJFxsXgf-iBEkAl2R-EfWM9xwF87LMnUecRPj-EU8uVrmO5z29sIThB3bNFTDI-aoGQDn_93BuqWLdS-srGtl1K1actD1HXlEMP1Nw6SPpHHFgqu2NHg_32Ko675tdbIxjyUU8a-aB0jpjGbFu1Dwj6su5LFlHhxj73Yr-qS3Wf8fvBBdB9RVAi870qod4DA7yyVuVB-f9XPA7cNpK54mQfrUMcZyUIP58WddmJCOdL0q-qlbIediyoUbNPc2dAyQId';
  const slotTime = time || '19:00';
  const slotDate = date || 'Lunes 24 Mayo';
  const baseCourtPrice = price || court?.price || 120;
  const serviceFee = 5;
  const showExtras = paymentMethod !== 'cash';
  const effectiveExtras = showExtras ? selectedExtras : [];
  const extrasTotal = effectiveExtras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = baseCourtPrice + serviceFee + extrasTotal;
  const depositAmount = Math.round(baseCourtPrice * 0.20);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExtraToggle = (extra: any) => {
    setSelectedExtras(prev => 
      prev.some(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const handleConfirm = async () => {
    if (paymentMethod === 'mercadopago') {
      setShowMPSandbox(true);
      return;
    }

    const status = (paymentMethod === 'transfer' || paymentMethod === 'cash') ? 'pending_payment' : 'upcoming';
    const userName = isAdmin ? (clientName || 'Administrador') : (localStorage.getItem('ramito_user_name') || 'Anónimo');
    
    const isDeposit = paymentMethod === 'transfer' && paymentPlan === 'deposit';
    const plan = isDeposit ? 'deposit' : 'full';
    const paid = isDeposit ? depositAmount : totalPrice;
    const balance = isDeposit ? (totalPrice - depositAmount) : 0;

    const bookingId = Math.random().toString(36).substr(2, 9);
    const extrasListNames = effectiveExtras.map(e => e.name);
    const formattedFieldName = courtName + (effectiveExtras.length > 0 ? ` (+${effectiveExtras.map(e => e.short).join(', ')})` : '');
    
    const bookingData = {
      id: bookingId,
      date: slotDate,
      time: slotTime,
      field: courtName,
      amount: `$ ${totalPrice.toFixed(2)}`,
      user: userName,
      status: status,
      payment_method: paymentMethod,
      payment_plan: plan,
      paid_amount: paid,
      pending_balance: balance,
      extras: extrasListNames,
      extras_delivered: false,
      created_at: new Date().toISOString()
    };

    // Almacenar inmediatamente en estado global reactivo para reflejar cambios en tiempo real
    setAllBookings((prev: any) => [...prev, bookingData]);

    // Crear notificaciones correspondientes para el usuario y administrador
    const userNotificationBody = paymentMethod === 'cash'
      ? `Tu turno para el ${slotDate} a las ${slotTime} ha sido pre-reservado. Recuerda abonar en efectivo al llegar.`
      : `Tu turno para el ${slotDate} a las ${slotTime} ha sido pre-reservado. Sube tu comprobante de ${plan === 'deposit' ? 'seña' : 'pago total'} para validarlo.`;

    setNotifications((prev: any) => [
      ...prev,
      {
        title: 'Reserva Registrada',
        body: userNotificationBody,
        time: 'Ahora',
        read: false
      },
      {
        title: 'Nueva Reserva Registrada',
        body: `El jugador ${userName} reservó el campo "${courtName}" para el ${slotDate} a las ${slotTime} (${paymentMethod === 'cash' ? 'Pago en Puerta' : `Transferencia de ${plan === 'deposit' ? 'Seña' : 'Pago Total'}`}).`,
        time: 'Ahora',
        read: false
      }
    ]);

    try {
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('bookings').insert([{
          id: bookingId,
          date: slotDate,
          time: slotTime,
          field: formattedFieldName,
          amount: `$ ${totalPrice.toFixed(2)}`,
          user: userName,
          status: status,
          payment_method: paymentMethod,
          extras_delivered: false,
          created_at: bookingData.created_at
        }]);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error saving booking to Supabase:', err);
    }

    localStorage.setItem('last_booking_status', status);
    localStorage.setItem('last_payment_method', paymentMethod);
    
    if (status === 'pending_payment') {
      if (paymentMethod === 'cash') {
        showToast('¡Reserva registrada con éxito! Recuerde cobrar/abonar en efectivo al llegar al complejo.', 'success');
      } else {
        showToast(`¡Reserva registrada con éxito! Sube tu comprobante de ${plan === 'deposit' ? 'seña' : 'pago total'} para confirmarla.`, 'success');
      }
    } else {
      showToast('¡Reserva confirmada con éxito!', 'success');
    }

    // Navegar a la pantalla de éxito pasando la información de la reserva para el divisor Fútbol Split
    navigate('/success', {
      state: {
        bookingData: {
          id: bookingId,
          date: slotDate,
          time: slotTime,
          field: courtName,
          amount: `$ ${totalPrice.toLocaleString('es-AR')}`,
          status: status,
          payment_method: paymentMethod,
          payment_plan: plan,
          paid_amount: paid,
          pending_balance: balance
        }
      }
    });
  };

  const completeWithMercadoPago = async (simulatedCardBrand: string) => {
    const status = 'upcoming'; 
    const userName = isAdmin ? (clientName || 'Administrador') : (localStorage.getItem('ramito_user_name') || 'Anónimo');
    
    const isDeposit = paymentPlan === 'deposit';
    const plan = isDeposit ? 'deposit' : 'full';
    const paid = isDeposit ? depositAmount : totalPrice;
    const balance = isDeposit ? (totalPrice - depositAmount) : 0;

    const bookingId = Math.random().toString(36).substr(2, 9);
    const extrasListNames = effectiveExtras.map(e => e.name);
    const formattedFieldName = courtName + (effectiveExtras.length > 0 ? ` (+${effectiveExtras.map(e => e.short).join(', ')})` : '');
    
    const bookingData = {
      id: bookingId,
      date: slotDate,
      time: slotTime,
      field: courtName,
      amount: `$ ${totalPrice.toFixed(2)}`,
      user: userName,
      status: status,
      payment_method: 'mercadopago',
      payment_plan: plan,
      paid_amount: paid,
      pending_balance: balance,
      mp_payment_id: `mp_${Math.floor(Math.random() * 1000000000)}`,
      mp_card_brand: simulatedCardBrand,
      extras: extrasListNames,
      extras_delivered: false,
      created_at: new Date().toISOString()
    };

    setAllBookings((prev: any) => [...prev, bookingData]);

    setNotifications((prev: any) => [
      ...prev,
      {
        title: 'Pago Mercado Pago Aprobado',
        body: `Tu pago de la reserva para el ${slotDate} ha sido aprobado al instante por Mercado Pago. ¡Tu turno está CONFIRMADO en el sistema!`,
        time: 'Ahora',
        read: false
      },
      {
        title: 'Nuevo Pago Online Confirmado',
        body: `El jugador ${userName} pagó vía Mercado Pago por su turno del ${slotDate} (${courtName}).`,
        time: 'Ahora',
        read: false
      }
    ]);

    try {
      const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
      if (isSupabaseConfigured) {
        await supabase.from('bookings').insert([{
          id: bookingId,
          date: slotDate,
          time: slotTime,
          field: formattedFieldName,
          amount: `$ ${totalPrice.toFixed(2)}`,
          user: userName,
          status: status,
          payment_method: 'mercadopago',
          extras_delivered: false,
          created_at: bookingData.created_at
        }]);
      }
    } catch (err) {
      console.error('Error saving MP booking to Supabase:', err);
    }

    localStorage.setItem('last_booking_status', status);
    localStorage.setItem('last_payment_method', 'mercadopago');
    showToast(`¡Pago electrónico exitoso con Mercado Pago (${simulatedCardBrand})! Turno CONFIRMADO de forma inmediata.`, 'success');
    
    // Redirigir a la pantalla de éxito con los datos para Fútbol Split
    navigate('/success', {
      state: {
        bookingData: {
          id: bookingId,
          date: slotDate,
          time: slotTime,
          field: courtName,
          amount: `$ ${totalPrice.toLocaleString('es-AR')}`,
          status: status,
          payment_method: 'mercadopago',
          payment_plan: plan,
          paid_amount: paid,
          pending_balance: balance,
          mp_card_brand: simulatedCardBrand
        }
      }
    });
  };

  return (
    <main className="pt-24 pb-32 px-5 w-full max-w-5xl md:max-w-6xl mx-auto min-h-screen">
      {/* Indicador de Pasos del Proceso (Step Tracker) */}
      <div className="mb-8 p-5 bg-[#1a1c1c]/40 backdrop-blur-md rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4be277]/10 border border-[#4be277]/30 flex items-center justify-center text-[#4be277] text-xs font-bold">1</div>
            <div className="text-left">
              <span className="text-[9px] font-bold text-[#4be277]/70 uppercase tracking-wider block">Paso 1 (Completado)</span>
              <span className="text-xs font-black text-white uppercase italic">Selección de Cancha y Horario</span>
            </div>
          </div>
          <div className="hidden sm:block text-white/20">➔</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FF9100]/20 border border-[#FF9100] flex items-center justify-center text-[#FF9100] text-xs font-bold animate-pulse">2</div>
            <div className="text-left">
              <span className="text-[9px] font-bold text-[#FF9100] uppercase tracking-wider block">Paso 2 (Actual)</span>
              <span className="text-xs font-black text-white uppercase italic">Confirmación de Reserva y Pago</span>
            </div>
          </div>
          <div className="hidden sm:block text-white/20">➔</div>
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold">3</div>
            <div className="text-left">
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider block">Paso 3 (Siguiente)</span>
              <span className="text-xs font-black text-white uppercase italic">Comprobante y Gestión</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column: Court details and Payment Summary */}
        <div className="space-y-6">
      {/* Resumen de la Reserva */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 uppercase italic text-white">
          <Check className="w-6 h-6 text-[#4be277]" />
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
            <span className="text-xs font-bold">$ {baseCourtPrice.toFixed(2)}</span>
          </div>
          {effectiveExtras.map((extra) => (
            <div key={extra.id} className="flex justify-between items-center text-[#bccbb9]">
              <span className="text-xs font-semibold uppercase italic">{extra.name}</span>
              <span className="text-xs font-bold">$ {extra.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-[#bccbb9]">
            <span className="text-xs font-semibold uppercase italic">Cargos por servicio</span>
            <span className="text-xs font-bold">$ {serviceFee.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm font-bold text-white uppercase italic">Total a pagar</span>
            <span className="text-xl font-display font-black text-[#4be277]">$ {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </section>
      </div> {/* End Left Column */}

      {/* Right Column: Payment & Policies */}
      <div className="space-y-6">

        {/* Modo Administrador: Identificación del Cliente */}
        {isAdmin && (
          <section className="bg-[#1a1c1c]/60 backdrop-blur-xl rounded-3xl p-5 space-y-4 border border-[#FF9100]/20 shadow-2xl">
            <h3 className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF9100] animate-pulse"></span>
              Reserva Directa: Datos de Cliente
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] text-[#bccbb9] uppercase font-bold tracking-wider">Nombre del Jugador o Grupo</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Juan Pérez - Los Millonarios FC"
                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-[#4be277] transition-all uppercase placeholder:text-white/20"
              />
              <p className="text-[8px] text-[#bccbb9]/65 uppercase tracking-wider leading-relaxed">
                Como Administrador, puedes colocar el nombre de quien solicita la cancha. Se registrará la reserva de forma directa.
              </p>
            </div>
          </section>
        )}

        {/* Plan de Pago: Seña vs Pago Total */}
        {paymentMethod === 'cash' ? (
          <section className="bg-[#1a1c1c]/60 backdrop-blur-xl rounded-3xl p-5 space-y-3.5 border border-[#4be277]/15 shadow-2xl text-left">
            <div className="flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-[#4be277]" />
              <h3 className="text-[10px] font-bold text-[#4be277] uppercase tracking-[0.2em]">Pago en Efectivo en Puerta</h3>
            </div>
            <p className="text-[9.5px] text-[#bccbb9]/80 font-bold uppercase tracking-wide leading-relaxed">
              Para pagos en <strong className="text-white">Efectivo en puerta</strong> no se cobra seña previa. El <strong className="text-[#4be277]">100% del valor total</strong> de la reserva (alquiler de cancha y la compra de bebidas/extras seleccionadas) se abona directamente al ingresar al complejo.
            </p>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-1">
              <span className="text-[7.5px] font-black text-[#bccbb9]/60 uppercase tracking-widest block leading-none">TOTAL A SALDAR EN EL COMPLEJO</span>
              <span className="text-base font-black text-white font-display italic leading-none">$ {totalPrice.toFixed(2)}</span>
              <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider block mt-1 leading-none">
                Incluye: Cancha ($ {baseCourtPrice.toFixed(2)}) + Luz/Tasa ($ {serviceFee.toFixed(2)}) + Adicionales ($ {extrasTotal.toFixed(2)})
              </span>
            </div>
          </section>
        ) : (
          <section className="bg-[#1a1c1c]/60 backdrop-blur-xl rounded-3xl p-5 space-y-4 border border-purple-500/15 shadow-2xl text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              <h3 className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.2em]">Opciones de Pago de Reserva</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción Seña Mínima */}
              <button
                type="button"
                onClick={() => setPaymentPlan('deposit')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden h-32 ${
                  paymentPlan === 'deposit' 
                    ? 'border-purple-400 bg-purple-500/5 shadow-[0_4px_20px_rgba(168,85,247,0.15)]' 
                    : 'border-white/5 bg-black/20 hover:border-white/10'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest block leading-none">ABONAR ENLACE SEÑA</span>
                  <span className="text-sm font-black text-white font-display italic mt-1.5 block leading-none">$ {depositAmount.toFixed(2)}</span>
                </div>
                <p className="text-[7px] text-[#bccbb9]/60 font-bold uppercase tracking-wider leading-relaxed mt-2">
                  Pagas solo el 20% de la cancha para asegurar el turno ahora. El saldo y bebidas de $ {(totalPrice - depositAmount).toFixed(2)} se abona en puerta.
                </p>
                {paymentPlan === 'deposit' && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white animate-pulse" strokeWidth={3} />
                  </div>
                )}
              </button>

              {/* Opción Pago Completo */}
              <button
                type="button"
                onClick={() => setPaymentPlan('full')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden h-32 ${
                  paymentPlan === 'full' 
                    ? 'border-[#4be277] bg-[#4be277]/5 shadow-[0_4px_20px_rgba(75,226,119,0.15)]' 
                    : 'border-white/5 bg-black/20 hover:border-white/10'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-[#4be277] uppercase tracking-widest block leading-none">PAGO TOTAL COMPLETO</span>
                  <span className="text-sm font-black text-[#4be277] font-display italic mt-1.5 block leading-none">$ {totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-[7px] text-[#bccbb9]/60 font-bold uppercase tracking-wider leading-relaxed mt-2">
                  Saldar todo hoy. Incluye el alquiler de cancha, servicios de iluminación y todos los extras/bebidas elegidos.
                </p>
                {paymentPlan === 'full' && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#4be277] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white animate-pulse" strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          </section>
        )}

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
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === 'transfer' ? 'border-[#4be277]' : 'border-white/20'
            }`}>
              {paymentMethod === 'transfer' && <Check className="w-3.2 h-3.2 text-[#4be277]" strokeWidth={3} />}
            </div>
          </label>

          {paymentMethod === 'transfer' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 rounded-2xl border border-[#4be277]/20 bg-[#4be277]/5 space-y-4 overflow-hidden text-left"
            >
              <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[8.5px] font-black text-[#4be277] uppercase tracking-widest leading-none">MONTO A MANDAR EN LA OPERACIÓN</span>
                <span className="text-xl font-black text-white italic font-display">$ {(paymentPlan === 'deposit' ? depositAmount : totalPrice).toFixed(2)}</span>
                <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 block leading-none">
                  {paymentPlan === 'deposit' ? `SEÑA DE TURNO (Saldo restante de $ ${(totalPrice - depositAmount).toFixed(2)} se paga en la entrada del complejo)` : 'CANCELACIÓN DEL VALOR TOTAL DE LA RESERVA'}
                </span>
              </div>
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

          {/* OPCIÓN: MERCADO PAGO INTEGRACIÓN PREPARADA */}
          <label 
            onClick={() => setPaymentMethod('mercadopago')}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              paymentMethod === 'mercadopago' ? 'border-[#009EE3] bg-[#009EE3]/5' : 'border-white/10 bg-[#1a1c1c]'
            }`}
          >
            <div className="flex items-center gap-4">
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'mercadopago' ? 'text-[#009EE3]' : 'text-[#bccbb9]'}`} />
              <div className="text-left">
                <span className="text-xs font-bold uppercase tracking-wide block">Mercado Pago</span>
                <span className="text-[8px] bg-[#009EE3]/10 text-[#009EE3] px-2 py-0.5 rounded font-mono font-black italic uppercase">Automático online</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === 'mercadopago' ? 'border-[#009EE3]' : 'border-white/20'
            }`}>
              {paymentMethod === 'mercadopago' && <Check className="w-3.2 h-3.2 text-[#009EE3]" strokeWidth={3} />}
            </div>
          </label>

          {paymentMethod === 'mercadopago' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 rounded-2xl border border-[#009EE3]/20 bg-[#009EE3]/5 space-y-4 overflow-hidden text-left"
            >
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/25 text-[8.5px] font-black text-[#009EE3] uppercase tracking-wider font-sans">
                <Activity className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                <span>INTEGRACIÓN MERCADO PAGO SDK DETECTADA</span>
              </div>
              <p className="text-[10px] font-bold text-[#bccbb9]/80 uppercase tracking-wide leading-relaxed">
                ¡Olvídate de verificar comprobantes! Con Mercado Pago, los jugadores pagan con <strong className="text-white">Tarjeta de Crédito, Débito o Saldo MP</strong>. El turno se <strong className="text-[#4be277]">valida automáticamente al instante</strong> mediante nuestro Webhook IPN de producción, sin intervención del staff.
              </p>
              <div className="bg-[#009EE3]/15 text-white font-black text-[9px] uppercase tracking-wider px-3 py-2 rounded-lg border border-[#009EE3]/30 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#009EE3] shrink-0" />
                Certificado Sandbox Activo • Listo para Simular
              </div>
            </motion.div>
          )}

          <label 
            onClick={() => {
              setPaymentMethod('cash');
              setPaymentPlan('full');
            }}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              paymentMethod === 'cash' ? 'border-[#4be277] bg-[#4be277]/5' : 'border-white/10 bg-[#1a1c1c]'
            }`}
          >
            <div className="flex items-center gap-4">
              <Receipt className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-[#4be277]' : 'text-[#bccbb9]'}`} />
              <span className="text-xs font-bold uppercase tracking-wide">Efectivo en puerta</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              paymentMethod === 'cash' ? 'border-[#4be277]' : 'border-white/20'
            }`}>
              {paymentMethod === 'cash' && <Check className="w-3.2 h-3.2 text-[#4be277]" strokeWidth={3} />}
            </div>
          </label>

          {isAdmin && (
            <div className="p-3.5 rounded-xl border border-amber-500/15 bg-amber-500/5 text-left text-[9px] font-black text-amber-500 uppercase tracking-widest leading-relaxed mt-2">
              💡 RECOMENDACIÓN OP: RESERVA DIRECTA
              <p className="text-[8.5px] font-bold text-[#bccbb9]/80 uppercase tracking-wide leading-relaxed normal-case mt-1">
                Al seleccionar <strong className="text-white">"Efectivo en puerta"</strong>, la reserva se marcará directamente como <strong className="text-[#4be277]">CONFIRMADA</strong> sin requerir verificaciones de comprobante. ¡Ideal para agilizar gestiones presenciales o telefónicas!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Políticas */}
      <section className="bg-[#1e2020] rounded-2xl p-4 flex flex-col gap-3.5">
        {/* Calzado */}
        <div className="flex gap-3 text-left">
          <Info className="w-4 h-4 text-[#4be277] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-[#4be277] uppercase tracking-wider block">CALZADO PERMITIDO</span>
            <p className="text-[9.5px] text-zinc-300 font-bold uppercase tracking-wide leading-normal">
              {courtName.toUpperCase().includes('CÉSPED') || court?.id === '1' ? (
                <span><strong>SOLO ZAPATILLAS O BOTINES F5 (MULTITAPÓN)</strong>. PROHIBICIÓN DE TAPONES LARGOS DE METAL.</span>
              ) : (
                <span><strong>SE PERMITEN BOTINES O ZAPATILLAS</strong>. PROHIBIDO TAPONES METÁLICOS EN ESTA CANCHA DE TIERRA.</span>
              )}
            </p>
          </div>
        </div>

        {/* Reglas de Pago y Reprogramación */}
        <div className="bg-red-950/15 p-3 rounded-xl border border-red-500/20 flex gap-3 text-left">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2.5 w-full">
            <span className="text-[9px] font-black text-red-400 uppercase tracking-wider block">NOTAS IMPORTANTES DE PAGO & CANCELACIÓN</span>
            
            <div className="grid grid-cols-1 gap-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold shrink-0">•</span>
                <p className="text-zinc-200 leading-normal font-bold uppercase tracking-wide">
                  <strong className="text-white">DINERO IMPACTADO:</strong> SIN DEVOLUCIONES BAJO NINGÚN CONCEPTO TRAS EL PAGO.
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold shrink-0">•</span>
                <p className="text-zinc-200 leading-normal font-bold uppercase tracking-wide">
                  <strong className="text-white">CAMBIOS DE FECHA/HORA:</strong> ÚNICAMENTE CON AL MENOS <strong className="text-amber-400">1 HORA DE ANTICIPACIÓN</strong>.
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold shrink-0">•</span>
                <p className="text-zinc-200 leading-normal font-bold uppercase tracking-wide">
                  <strong className="text-white">TOLERANCIA LÍMITE:</strong> CON MENOS DE 1 HORA DE ANTICIPACIÓN, SE DARÁ POR PERDIDO EL TURNO SIN CAMBIO NI SALDO A FAVOR.
                </p>
              </div>
            </div>

            <p className="text-[8px] font-black text-center text-red-300 text-red-300/90 bg-red-900/10 py-1.5 px-2 rounded border border-red-500/15 uppercase tracking-widest leading-none">
              ⚠️ PAGO REALIZADO ES COMPROMISO DE JUEGO.
            </p>
          </div>
        </div>
      </section>

      {/* Consumos Extras Option Selection */}
      {paymentMethod !== 'cash' && (
        <section className="bg-[#1a1c1c]/60 backdrop-blur-xl rounded-3xl p-5 space-y-4 border border-[#FF9100]/20 shadow-2xl text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-[#FF9100] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF9100]" />
              Consumos Extras (Opcional)
            </h3>
            <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
              RESERVAR AHORA
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-2.5">
            {EXTRAS_CATALOG.map((extra) => {
              const isSelected = selectedExtras.some(e => e.id === extra.id);
              const IconComponent = extra.icon;
              
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => handleExtraToggle(extra)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all relative overflow-hidden group ${
                    isSelected 
                      ? 'border-[#FF9100] bg-[#FF9100]/5 shadow-[0_4px_20px_rgba(255,145,0,0.1)]' 
                      : 'border-white/5 bg-black/20 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full pr-8">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${extra.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-white block uppercase tracking-wide leading-tight group-hover:text-amber-300 transition-colors">
                        {extra.name}
                      </span>
                      <span className="text-xs font-black text-[#4be277] font-mono block">
                        +$ {extra.price.toFixed(2)}
                      </span>
                      <span className="text-[7.5px] font-mono font-bold text-[#bccbb9]/40 block leading-none uppercase">
                        AGREGAR AL MONTO FINAL
                      </span>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex items-center justify-center">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#FF9100] bg-transparent' : 'border-white/20'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF9100]" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

        </div> {/* End Right Column */}
      </div> {/* End Grid */}

      {/* Persistent Button Placeholders */}
      <div className="h-10"></div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl md:max-w-6xl p-4 bg-[#121414]/85 backdrop-blur-2xl border-t border-white/10 z-[40] flex flex-col sm:flex-row gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/booking')}
          className="flex-1 h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-[0.15em] transition-all"
        >
          <X className="w-4 h-4 text-red-500" />
          Cancelar y Volver
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          className="flex-[2] h-14 bg-gradient-to-r from-[#FF9100] via-[#4be277] to-[#D32F2F] text-[#121414] font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(255,145,0,0.3)] flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
        >
          <Check className="w-5 h-5" />
          {paymentMethod === 'mercadopago' ? 'PAGAR CON MERCADO PAGO' : 'CONFIRMAR RESERVA'}
        </motion.button>
      </div>

      {/* Mercado Pago Sandbox Simulator Modal */}
      <AnimatePresence>
        {showMPSandbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#161819] border border-[#009EE3]/35 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,158,227,0.15)] flex flex-col"
            >
              {/* Mercado Pago Branded Top Bar */}
              <div className="bg-[#009EE3] p-5 text-white relative">
                <button 
                  onClick={() => setShowMPSandbox(false)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/25 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[#009EE3] text-lg select-none shadow">
                    mp
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-[8px] font-black tracking-widest text-[#FFF] uppercase bg-[#FFF]/15 px-2 py-0.5 rounded italic">SANDBOX SIMULATOR</span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white mt-1">MERCADO PAGO PASS</h3>
                  </div>
                </div>
              </div>

              {/* Checkout details */}
              <div className="p-6 space-y-6">
                
                {/* Real-time Order Summary Row */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2.5 text-left">
                  <span className="text-[8px] font-black text-[#bccbb9]/40 tracking-widest uppercase block mb-1">DETALLES DE LA RESERVA</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white uppercase italic">{courtName}</span>
                    <span className="text-xs font-black text-[#009EE3] italic">{slotDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#bccbb9]/80 uppercase">
                    <span>Horario seleccionado:</span>
                    <span className="font-bold text-white">{slotTime} Hs</span>
                  </div>
                  {effectiveExtras.length > 0 && (
                    <div className="text-[9px] text-amber-400 font-bold uppercase leading-relaxed">
                      Extras: {effectiveExtras.map(e => e.name).join(', ')}
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/50 uppercase">TOTAL A ABONAR:</span>
                    <span className="text-base font-black text-[#4be277] italic font-display">$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {isProcessingMP ? (
                  /* Loading SSL simulated state */
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-t-[#009EE3] border-white/10 rounded-full animate-spin"></div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white uppercase italic tracking-wider animate-pulse">Estableciendo enlace SSL protegido...</p>
                      <p className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest">PROCESANDO TRANSACCIÓN EN GATEWAY SEGURO</p>
                    </div>
                  </div>
                ) : (
                  /* Choosing credit card template state */
                  <div className="space-y-4 text-left">
                    <span className="text-[9.2px] font-black text-[#009EE3] uppercase tracking-wider block">💳 ELIGE TU TARJETA DE PRUEBA (SANDBOX)</span>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setIsProcessingMP(true);
                          setTimeout(() => {
                            completeWithMercadoPago('Visa **** 8295');
                          }, 1600);
                        }}
                        className="w-full p-4 bg-white/[0.02] hover:bg-[#009EE3]/5 border border-white/5 hover:border-[#009EE3]/40 rounded-2xl flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded flex items-center justify-center text-[8px] text-white font-black italic shadow">VISA</div>
                          <div>
                            <span className="text-xs font-bold text-white block">VISA CREDITO DIRECTO</span>
                            <span className="text-[8px] text-zinc-500 font-mono block">Terminada en 8295 • Simulador</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#009EE3] transition-colors" />
                      </button>

                      <button 
                        onClick={() => {
                          setIsProcessingMP(true);
                          setTimeout(() => {
                            completeWithMercadoPago('Mastercard **** 4103');
                          }, 1600);
                        }}
                        className="w-full p-4 bg-white/[0.02] hover:bg-[#009EE3]/5 border border-white/5 hover:border-[#009EE3]/40 rounded-2xl flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-6 bg-gradient-to-r from-red-500 to-amber-500 rounded flex items-center justify-center text-[8px] text-white font-black italic shadow">MC</div>
                          <div>
                            <span className="text-xs font-bold text-white block">MASTERCARD DÉBITO</span>
                            <span className="text-[8px] text-zinc-500 font-mono block">Terminada en 4103 • Simulador</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#009EE3] transition-colors" />
                      </button>

                      <button 
                        onClick={() => {
                          setIsProcessingMP(true);
                          setTimeout(() => {
                            completeWithMercadoPago('Saldo Mercado Pago');
                          }, 1600);
                        }}
                        className="w-full p-4 bg-white/[0.02] hover:bg-[#009EE3]/5 border border-white/5 hover:border-[#009EE3]/40 rounded-2xl flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-6 bg-[#002F6C] rounded flex items-center justify-center text-[8px] text-white font-black italic shadow">BALANCE</div>
                          <div>
                            <span className="text-xs font-bold text-white block">DINERO EN CUENTA MP</span>
                            <span className="text-[8px] text-zinc-500 font-mono block">Conector de saldo instantáneo</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#009EE3] transition-colors" />
                      </button>
                    </div>

                    <div className="p-3.5 bg-zinc-900 border border-white/5 rounded-2xl text-left flex gap-2.5 items-start">
                      <Shield className="w-4 h-4 text-[#009EE3] shrink-0 mt-0.5" />
                      <p className="text-[8px] text-[#bccbb9]/60 uppercase tracking-wide leading-normal">
                        Al seleccionar un método de prueba, el simulador emitirá un token exitoso a nuestra API simulada. El turno quedará CONFIRMADO de forma inmediata y automática en el panel general.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Secure Footer message */}
              <div className="bg-black/30 p-4 border-t border-white/5 text-center flex items-center justify-center gap-1.5 text-[8.5px] font-bold text-white/40 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-white/30" />
                PAGO PROTEGIDO POR LA RED DE MERCADO PAGO S.A.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
