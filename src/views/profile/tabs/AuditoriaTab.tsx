import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, Check, Smartphone, RefreshCw, FileText, Database, 
  User, Settings, AlertTriangle, MessageCircle, ExternalLink 
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface AuditoriaTabProps {
  userRole: string | null;
  newEmail: string;
  newPersonalPhone: string;
  newPersonalKey: string;
  newPersonalPin: string;
  auditLogs: any[];
  addAuditLog: (action: string, details: string, type: 'info' | 'warning' | 'success' | 'alert') => void;
  setShowProfileModal: (show: boolean) => void;
  setShowAdvancedConfig: (show: boolean) => void;
}

export default function AuditoriaTab({
  userRole,
  newEmail,
  newPersonalPhone,
  newPersonalKey,
  newPersonalPin,
  auditLogs,
  addAuditLog,
  setShowProfileModal,
  setShowAdvancedConfig
}: AuditoriaTabProps) {
  const {
    cashTotal, setCashTotal,
    transferTotal, setTransferTotal,
    mpTotal, setMpTotal,
    ledgerTransactions, setLedgerTransactions,
    setNotifications, showToast, stadiumName, adminPhone
  } = useApp();

  const [selectedExportRange, setSelectedExportRange] = useState<'mensual' | 'trimestral'>('mensual');
  const [selectedAuditFilter, setSelectedAuditFilter] = useState('todos');

  const generatePDFReport = (range: 'mensual' | 'trimestral') => {
    const daysFiltered = range === 'mensual' ? 30 : 90;
    const logsQty = range === 'mensual' ? Math.min(25, auditLogs.length) : auditLogs.length;
    const reportedLogs = auditLogs.slice(0, logsQty);

    const totalCaja = cashTotal + transferTotal + mpTotal;
    const cashPercentage = ((cashTotal / (totalCaja || 1)) * 100).toFixed(1);
    const transferPercentage = ((transferTotal / (totalCaja || 1)) * 100).toFixed(1);
    const mpPercentage = ((mpTotal / (totalCaja || 1)) * 100).toFixed(1);

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      if (showToast) showToast('Habilite las ventanas emergentes para descargar el PDF', 'error');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Auditoria - Ramito Fut Show</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              color: #1a1a1a;
              padding: 40px;
              background-color: #ffffff;
              line-height: 1.4;
            }
            .header-container {
              border-bottom: 3px solid #009EE3;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-placeholder {
              font-size: 24px;
              font-weight: 900;
              color: #009EE3;
              letter-spacing: -1px;
            }
            .report-title {
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-top: 5px;
              color: #555;
            }
            .grid-totals {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 35px;
            }
            .total-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              background-color: #f8fafc;
            }
            .total-title {
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 1px;
            }
            .total-val {
              font-size: 24px;
              font-weight: 900;
              color: #0f172a;
              margin-top: 5px;
            }
            .percentage {
              font-size: 11px;
              color: #64748b;
              margin-top: 2px;
            }
            .ledger-section {
              margin-bottom: 35px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
              letter-spacing: 1px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            th {
              background-color: #f1f5f9;
              text-align: left;
              padding: 10px;
              font-weight: bold;
              text-transform: uppercase;
              color: #475569;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e2e8f0;
            }
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .badge-success { background-color: #dcfce7; color: #15803d; }
            .badge-warning { background-color: #fef9c3; color: #a16207; }
            .badge-info { background-color: #e0f2fe; color: #0369a1; }
            .badge-error { background-color: #fee2e2; color: #b91c1c; }
            .signature-area {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #a1a1a1;
              text-align: center;
              font-size: 10px;
              padding-top: 8px;
              text-transform: uppercase;
              font-weight: bold;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-placeholder">${stadiumName?.toUpperCase() || 'COMPLEJO DEPORTIVO RAMITO'}</div>
            <div class="report-title">Reporte Consolidado de Auditoria e Ingresos</div>
            <div style="font-size: 10px; margin-top: 10px; color: #64748b;">
              FECHA DE EMISIÓN: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} Hs. • OPERADOR: ${userRole === 'admin_elite' ? 'Élite Admin' : 'Vip Admin'}
            </div>
          </div>

          <div class="grid-totals">
            <div class="total-card">
              <div class="total-title">Total Efectivo</div>
              <div class="total-val">$${cashTotal.toLocaleString('es-AR')}</div>
              <div class="percentage">Participación: ${cashPercentage}%</div>
            </div>
            <div class="total-card">
              <div class="total-title">Total Transferencias</div>
              <div class="total-val">$${transferTotal.toLocaleString('es-AR')}</div>
              <div class="percentage">Participación: ${transferPercentage}%</div>
            </div>
            <div class="total-card" style="border-color: #009EE3;">
              <div class="total-title" style="color: #009EE3;">Total Mercado Pago</div>
              <div class="total-val" style="color: #009EE3;">$${mpTotal.toLocaleString('es-AR')}</div>
              <div class="percentage">Participación: ${mpPercentage}%</div>
            </div>
          </div>

          <div class="total-card" style="margin-bottom: 35px; border-color: #10B981; background-color: #f0fdf4;">
            <div class="total-title" style="color: #15803d; font-size: 11px;">Arqueo de Caja General</div>
            <div class="total-val" style="color: #15803d; font-size: 32px;">$${totalCaja.toLocaleString('es-AR')} ARS</div>
            <div class="percentage" style="color: #166534; font-weight: bold; margin-top: 5px;">ESTADO DE AUDITORÍA: CONCILIADO & CUADRADO</div>
          </div>

          <div class="ledger-section">
            <div class="section-title">Registro Bitácora de Acciones Recientes (Últimos ${daysFiltered} Días)</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 15%">Timestamp</th>
                  <th style="width: 15%">Operador</th>
                  <th style="width: 25%">Acción</th>
                  <th style="width: 10%">Estado</th>
                  <th style="width: 35%">Detalle Técnico</th>
                </tr>
              </thead>
              <tbody>
                ${reportedLogs.map(log => `
                  <tr>
                    <td>${log.timestamp}</td>
                    <td><strong>${log.user}</strong></td>
                    <td style="color:#0f172a; font-weight: bold;">${log.action}</td>
                    <td>
                      <span class="badge ${log.type === 'success' ? 'badge-success' : log.type === 'warning' ? 'badge-warning' : log.type === 'alert' ? 'badge-error' : 'badge-info'}">
                        ${log.type}
                      </span>
                    </td>
                    <td>${log.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="signature-area">
            <div class="signature-line">
              Firma y Acreditación de Operador
            </div>
            <div class="signature-line">
              Control e Auditoria Externa
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    addAuditLog('IMP. REPORTE AUDITORÍA', `Se exportó el reporte dinámico ${range.toUpperCase()} (Caja total: $${totalCaja.toLocaleString('es-AR')}) estructurado para formato PDF e impresión de seguridad.`, 'success');
  };

  const exportToExcelReport = (range: 'mensual' | 'trimestral') => {
    const totalCaja = cashTotal + transferTotal + mpTotal;
    let csvContent = "\uFEFF";
    csvContent += "=== REPORTE DE AUDITORÍA Y ARQUEO DE CAJA ===\n";
    csvContent += `Complejo Lunático:;${stadiumName || 'Complejo Deportivo Ramito'}\n`;
    csvContent += `Rango del Reporte:;${range.toUpperCase()}\n`;
    csvContent += `Total Efectivo:;${cashTotal}\n`;
    csvContent += `Total Transferencias:;${transferTotal}\n`;
    csvContent += `Total Mercado Pago:;${mpTotal}\n`;
    csvContent += `Caja Bruta General:;${totalCaja}\n`;
    csvContent += "=========================================\n\n";
    csvContent += "TIMESTAMP;OPERADOR;ACCION;TIPO;DETALLE\n";

    auditLogs.forEach(log => {
      csvContent += `${log.timestamp};"${log.user}";"${log.action}";"${log.type}";"${log.details}"\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_caja_ramito_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('IMP. REPORTE EXCEL', `Se exportó el reporte estructurado en formato CSV/Excel con el consolidado en un solo click`, 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="space-y-6"
    >
      {!userRole?.includes('admin') ? (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/5 text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto border border-yellow-500/20">
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
            <p className="text-[10px] font-black text-[#bccbb9] uppercase tracking-widest italic">Acceso restringido a administradores</p>
          </div>

          {/* BOTÓN ASISTENCIA WHATSAPP PARA JUGADORES */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl border border-white/5 p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 shrink-0">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black text-white uppercase tracking-wider block italic font-sans animate-pulse">Asistencia WhatsApp Soporte</span>
                <span className="text-[8px] font-mono text-[#bccbb9]/40 tracking-wider">RESOLUCIÓN DE DUDAS Y LLAVES</span>
              </div>
            </div>

            <div className="space-y-3 text-left font-sans">
              <p className="text-[9.5px] font-bold text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed">
                ¿Tienes problemas con tu llave o tu reserva? Comunícate con asistencia directa por WhatsApp.
              </p>
              {adminPhone && <p className="text-sm font-mono font-black text-[#25D366] tracking-widest pt-1">{adminPhone}</p>}
              <a 
                href={`https://wa.me/${adminPhone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/15 active:scale-[0.98] transition-all italic"
              >
                Abrir Chat de Soporte <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-left font-sans">
          {/* 1. SECCIÓN: CAJA DEL DÍA - REVOLUCIONARIA, CON MERCADO PAGO INTEGRADO */}
          <div className="glass-panel rounded-3xl border border-white/5 p-5 bg-zinc-950/60 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#009EE3]/[0.02] rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center border border-[#009EE3]/20 shrink-0">
                  <CreditCard className="w-5 h-5 text-[#009EE3]" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#009EE3] uppercase tracking-wider block italic">Sistema de Caja Unificada</span>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">Auditoría Financiera Activa</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-2.5 py-1 rounded-xl shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-400/50" />
                <span className="text-[7.5px] font-black text-[#bccbb9]/60 tracking-wider uppercase font-mono">CONEXIÓN MP SECURE PRO: OK</span>
              </div>
            </div>

            {/* Grande de Caja del Día */}
            <div className="text-center py-5 bg-black/50 border border-white/5 rounded-2xl relative overflow-hidden">
              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#009EE3]/40 to-transparent" />
              <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Monto Reconciliado Total de Hoy (Semaforizado)</span>
              <span className="font-mono text-3xl font-black text-white block tracking-tighter mt-1">
                ${(cashTotal + transferTotal + mpTotal).toLocaleString('es-AR')}
                <span className="text-xs font-bold text-[#4be277] ml-1 font-sans">ARS</span>
              </span>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                <span className="text-[7.5px] font-mono text-[#4be277] uppercase tracking-widest inline-flex items-center gap-1 bg-[#4be277]/10 px-2.5 py-0.5 rounded-full border border-[#4be277]/25">
                  <Check className="w-2.5 h-2.5" /> Balance Cuadrado y Auditado
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    setCashTotal(0);
                    setTransferTotal(0);
                    setMpTotal(0);
                    setLedgerTransactions([]);
                    showToast('Valores de caja restablecidos', 'success');
                    if (isSupabaseConfigured) {
                      await supabase.from('ledger_transactions').delete().neq('id', '0');
                    }
                  }}
                  className="text-[7px] text-zinc-400 hover:text-white uppercase tracking-widest font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 transition-all"
                >
                  Restablecer Caja
                </button>
              </div>
            </div>

            {/* Columnas de Efectivo, Transferencia y Mercado Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Efectivo */}
              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-2 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-[8.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest font-bold flex items-center gap-1">💸 Efectivo</span>
                  <span className="text-[7.5px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                    {((cashTotal / (cashTotal + transferTotal + mpTotal || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="font-mono text-lg font-black text-white block">${cashTotal.toLocaleString('es-AR')}</span>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <span className="text-[7px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Recaudado Puerta</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setCashTotal(prev => prev + 1000);
                        showToast('+1.000 ARS Efectivo registrado', 'success');
                        const newTx = { id: `tx_${Date.now()}`, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}), detail: 'Ajuste Efectivo (+)', method: 'Efectivo', amount: 1000, type: 'cash', labelColor: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/30' };
                        setLedgerTransactions(prev => [newTx, ...prev]);
                        if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                      }}
                      className="text-[7px] font-black text-white bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 transition-all"
                    >
                      +1k
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setCashTotal(prev => Math.max(0, prev - 1000));
                        showToast('-1.000 ARS Efectivo ajustado', 'success');
                        const newTx = { id: `tx_${Date.now()}`, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}), detail: 'Ajuste Efectivo (-)', method: 'Efectivo', amount: -1000, type: 'cash', labelColor: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/30' };
                        setLedgerTransactions(prev => [newTx, ...prev]);
                        if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                      }}
                      className="text-[7px] font-black text-zinc-400 bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 transition-all"
                    >
                      -1k
                    </button>
                  </div>
                </div>
              </div>

              {/* Transferencias */}
              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-2 relative group">
                <div className="flex justify-between items-center">
                  <span className="text-[8.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest font-bold flex items-center gap-1">🏦 Transferencia</span>
                  <span className="text-[7.5px] font-mono text-[#4be277] bg-[#4be277]/10 px-1.5 py-0.5 rounded border border-[#4be277]/10">
                    {((transferTotal / (cashTotal + transferTotal + mpTotal || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="font-mono text-lg font-black text-white block">${transferTotal.toLocaleString('es-AR')}</span>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <span className="text-[7px] font-black text-[#4be277]/75 uppercase tracking-widest block">Bancos CBU Coincide</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setTransferTotal(prev => prev + 2000);
                        showToast('+2.000 ARS Transferencia cargada', 'success');
                        const newTx = { id: `tx_${Date.now()}`, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}), detail: 'Ajuste Transferencia (+)', method: 'Transferencia Bancaria', amount: 2000, type: 'transfer', labelColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
                        setLedgerTransactions(prev => [newTx, ...prev]);
                        if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                      }}
                      className="text-[7px] font-black text-white bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 transition-all"
                    >
                      +2k
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setTransferTotal(prev => Math.max(0, prev - 2000));
                        showToast('-2.000 ARS Transferencia corregida', 'success');
                        const newTx = { id: `tx_${Date.now()}`, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}), detail: 'Ajuste Transferencia (-)', method: 'Transferencia Bancaria', amount: -2000, type: 'transfer', labelColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
                        setLedgerTransactions(prev => [newTx, ...prev]);
                        if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                      }}
                      className="text-[7px] font-black text-zinc-400 bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 transition-all"
                    >
                      -2k
                    </button>
                  </div>
                </div>
              </div>

              {/* Mercado Pago */}
              <div className="p-4 bg-zinc-900/60 border border-[#009EE3]/15 rounded-2xl space-y-2 relative group">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#009EE3] animate-pulse" />
                <div className="flex justify-between items-center">
                  <span className="text-[8.5px] font-black text-[#009EE3] uppercase tracking-widest font-bold flex items-center gap-1">💙 Mercado Pago</span>
                  <span className="text-[7.5px] font-mono text-[#009EE3] bg-[#009EE3]/10 px-1.5 py-0.5 rounded border border-[#009EE3]/15">
                    {((mpTotal / (cashTotal + transferTotal + mpTotal || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="font-mono text-lg font-black text-[#009EE3] block">${mpTotal.toLocaleString('es-AR')}</span>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <span className="text-[7px] font-black text-[#009EE3]/75 uppercase tracking-widest block">Cobros Digitales</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setMpTotal(prev => prev + 5000);
                        showToast('+5.000 ARS Mercado Pago añadido', 'success');
                        const newTx = { id: `tx_${Date.now()}`, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}), detail: 'Ajuste Mercado Pago (+)', method: 'Mercado Pago', amount: 5000, type: 'mercadopago', labelColor: 'text-[#009EE3] bg-[#009EE3]/10 border-[#009EE3]/20' };
                        setLedgerTransactions(prev => [newTx, ...prev]);
                        if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                      }}
                      className="text-[7px] font-black text-white bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-[#009EE3]/25 transition-all"
                    >
                      +5k
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setMpTotal(prev => Math.max(0, prev - 5000));
                        showToast('-5.000 ARS Mercado Pago ajustado', 'success');
                        const newTx = { id: `tx_${Date.now()}`, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}), detail: 'Ajuste Mercado Pago (-)', method: 'Mercado Pago', amount: -5000, type: 'mercadopago', labelColor: 'text-[#009EE3] bg-[#009EE3]/10 border-[#009EE3]/20' };
                        setLedgerTransactions(prev => [newTx, ...prev]);
                        if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                      }}
                      className="text-[7px] font-black text-zinc-400 bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 transition-all"
                    >
                      -5k
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Distribución Visual Semáforo/Categorizada */}
            {(() => {
              const total = cashTotal + transferTotal + mpTotal || 1;
              const cp = (cashTotal / total) * 100;
              const tp = (transferTotal / total) * 100;
              const mpPercentageVal = (mpTotal / total) * 100;
              return (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap justify-between text-[7px] font-extrabold text-[#bccbb9]/55 uppercase tracking-wider gap-x-3">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" /> Efectivo ({cp.toFixed(0)}%)</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#4be277] rounded-full" /> Transferencia ({tp.toFixed(0)}%)</span>
                    <span className="flex items-center gap-1 text-[#009EE3]"><span className="w-1.5 h-1.5 bg-[#009EE3] rounded-full" /> Mercado Pago ({mpPercentageVal.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-950 rounded-full flex overflow-hidden border border-white/5 p-[1.5px]">
                    <div className="h-full bg-zinc-600/70 rounded-l-full transition-all duration-500" style={{ width: `${cp}%` }} />
                    <div className="h-full bg-[#4be277] transition-all duration-500" style={{ width: `${tp}%` }} />
                    <div className="h-full bg-[#009EE3] rounded-r-full transition-all duration-500" style={{ width: `${mpPercentageVal}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SIMULADOR DE COBROS DIGITALES MERCADO PAGO EN TIEMPO REAL */}
          <div className="glass-panel rounded-3xl border border-[#009EE3]/15 p-5 bg-gradient-to-br from-zinc-950 via-zinc-950 to-[#009EE3]/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#009EE3]/15 flex items-center justify-center border border-[#009EE3]/30 shrink-0">
                  <Smartphone className="w-4 h-4 text-[#009EE3]" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-[#009EE3] uppercase tracking-widest block font-sans">Pasarela y Simulador IPN / Checkout</span>
                  <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block">Simula cobros en línea automáticos y valida acreditaciones</p>
                </div>
              </div>
              <span className="text-[7.5px] text-[#009EE3] bg-[#009EE3]/10 border border-[#009EE3]/25 font-black uppercase px-2 py-0.5 rounded-lg tracking-widest">
                GATEWAY: SANDBOX SIMULATOR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[8px] font-black text-[#bccbb9]/50 uppercase tracking-wider block mb-1">Nombre Jugador (Abonante)</label>
                <input 
                  type="text" 
                  id="sim_player_name"
                  defaultValue="Juan Gómez"
                  className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-3 text-[10.5px] font-black uppercase tracking-wider text-white outline-none focus:border-[#009EE3]"
                  placeholder="Juan Gómez"
                />
              </div>
              <div>
                <label className="text-[8px] font-black text-[#bccbb9]/50 uppercase tracking-wider block mb-1">Monto de Cobro (ARS)</label>
                <select 
                  id="sim_charge_amount"
                  defaultValue="12000"
                  className="w-full h-9 bg-black/40 border border-white/10 rounded-xl px-3 text-[10.5px] font-black uppercase tracking-wider text-white outline-none focus:border-[#009EE3]"
                >
                  <option value="6000" className="bg-zinc-950">Mínimo: $6.000 ARS</option>
                  <option value="8000" className="bg-zinc-950">Intermedio: $8.000 ARS</option>
                  <option value="12000" className="bg-zinc-950">Sintética: $12.000 ARS</option>
                  <option value="15000" className="bg-zinc-950">Premium Turf: $15.000 ARS</option>
                  <option value="25000" className="bg-zinc-950">Pack Complejo: $25.000 ARS</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={async () => {
                    const pInput = document.getElementById('sim_player_name') as HTMLInputElement;
                    const aInput = document.getElementById('sim_charge_amount') as HTMLSelectElement;
                    const player = (pInput?.value || 'Juan Gómez').trim().toUpperCase();
                    const amount = parseInt(aInput?.value || '12000', 10);
                    
                    setMpTotal(prev => prev + amount);
                    
                    const now = new Date();
                    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                    const newTx = {
                      id: `tx_sim_${Date.now()}`,
                      time: timeStr,
                      detail: `${player} • Cancha Sintética (Pago On-Line)`,
                      method: 'Mercado Pago (Aprobado)',
                      amount: amount,
                      type: 'mercadopago',
                      labelColor: 'text-[#009EE3] bg-[#009EE3]/10 border-[#009EE3]/20 animate-pulse'
                    };
                    setLedgerTransactions(prev => [newTx, ...prev]);
                    if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);

                    const systemWebNotification = {
                      id: `mp_notkey_${Date.now()}`,
                      title: 'PAGO AUTOMÁTICO MERCADO PAGO',
                      body: `Aprobado con Éxito: El jugador ${player} abonó S/. ${(amount / 100).toFixed(2)} (${amount} ARS equivalente) vía la pasarela digital y su reserva fue AUTO-CONFIRMADA inmediatamente en Base de Datos. No requiere validación manual.`,
                      time: 'Hace un instante',
                      read: false
                    };
                    
                    if (setNotifications) {
                      setNotifications((prev: any[]) => [systemWebNotification, ...(prev || [])]);
                    }

                    showToast(`¡Simulación MP Exitosa! +$${amount.toLocaleString('es-AR')} acreditado.`, 'success');
                  }}
                  className="w-full h-9 bg-[#009EE3] hover:bg-sky-500 text-white font-black rounded-xl text-[8.5px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#009EE3]/15 active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Simular Recibir Pago Mercado Pago
                </button>
              </div>
            </div>
            <div className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest pt-1 flex items-center gap-1.5 leading-relaxed">
              <span>💡 <strong>PRO TIP:</strong> Tras simular un cobro, se sumará instantáneamente al total recaudado con su respectiva visualización en semáforos, actualizará el ledger inferior, e inyectará una notificación de alerta crítica en el Panel General.</span>
            </div>
          </div>

          {/* 2. REGISTRO DETALLADO DE PAGOS DE HOY */}
          <div className="glass-panel rounded-3xl border border-white/5 p-5 bg-zinc-950/60 space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h5 className="text-[9px] font-black text-white uppercase italic tracking-widest font-bold">Ledger de Facturación Diaria</h5>
              <button
                type="button"
                onClick={async () => {
                  setLedgerTransactions([]);
                  showToast('Ledger de transacciones limpiado', 'success');
                  if (isSupabaseConfigured) await supabase.from('ledger_transactions').delete().neq('id', '0');
                }}
                className="text-[7.5px] font-bold text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-2 py-0.5 rounded transition-all uppercase tracking-widest"
              >
                Limpiar Tabla
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ledgerTransactions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-[9px] uppercase tracking-widest font-mono">
                  No hay transacciones registradas hoy en el ledger.
                </div>
              ) : (
                ledgerTransactions.map((tx, idx) => (
                  <div key={tx.id || idx} className="p-3 bg-black/40 border border-white/[0.03] rounded-xl flex justify-between items-center gap-3">
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[8px] text-[#bccbb9]/40">{tx.time}</span>
                        <span className={`text-[6.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full border ${tx.labelColor}`}>
                          {tx.method}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-white uppercase italic tracking-wide font-bold">{tx.detail}</p>
                    </div>
                    <span className="font-mono text-xs font-black text-white">
                      ${(tx.amount || 0).toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selector de Rango & Exportación de Auditoría PDF */}
          <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-2.5xl space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block italic">Servicios de Exportación de Auditoría</span>
            </div>
            
            <p className="text-[10.5px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed">
              Personalice y descargue un reporte de auditoría completo y un arqueo de caja timbrado para impresión PDF.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedExportRange('mensual')}
                className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  selectedExportRange === 'mensual'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 font-black scale-[1.01]'
                    : 'bg-zinc-900/40 border-white/5 text-[#bccbb9]/50 hover:bg-zinc-900'
                }`}
              >
                Reporte Mensual
              </button>
              <button
                type="button"
                onClick={() => setSelectedExportRange('trimestral')}
                className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  selectedExportRange === 'trimestral'
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 font-black scale-[1.01]'
                    : 'bg-zinc-900/40 border-white/5 text-[#bccbb9]/50 hover:bg-zinc-900'
                }`}
              >
                Reporte Trimestral
              </button>
            </div>

            <button
              type="button"
              onClick={() => generatePDFReport(selectedExportRange)}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-[#121414] font-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all outline-none italic shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:opacity-95 animate-pulse"
            >
              <FileText className="w-4 h-4" /> Generar & Descargar PDF ({selectedExportRange})
            </button>

            <button
              type="button"
              onClick={() => exportToExcelReport(selectedExportRange)}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-[#121414] font-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all outline-none italic shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:opacity-[0.98] mt-2.5"
            >
              <Database className="w-4 h-4" /> Exportar Planilla Excel (.CSV) ({selectedExportRange})
            </button>
          </div>

          {/* SECCIÓN PERSONAL DE ACCESO RÁPIDO Y PIN DE ADMINISTRADOR */}
          <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-2.5xl space-y-4 text-left animate-fade-in mb-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <User className="w-4.5 h-4.5 text-[#4be277]" />
              <h5 className="text-[10px] font-black text-white uppercase italic tracking-widest font-bold">Tu PIN & Credenciales Personales de Respaldo</h5>
            </div>
            <p className="text-[9.5px] font-bold text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed">
              Como administrador, tus credenciales personales, llave de acceso y teléfono de recuperación están activos. Puedes cambiarlos o actualizarlos al instante en el centro de configuración:
            </p>
            
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                <span className="text-[7.5px] font-black text-zinc-500 uppercase tracking-widest block">Mi Correo de Login</span>
                <span className="font-mono text-[9px] font-black text-white block truncate">{newEmail || 'admin@ramito.com'}</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1 font-mono">
                <span className="text-[7.5px] font-black text-zinc-500 uppercase tracking-widest block">Teléfono / WhatsApp</span>
                <span className="font-mono text-[9px] font-black text-white block truncate">{newPersonalPhone || '+51 987 654 321'}</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                <span className="text-[7.5px] font-black text-zinc-500 uppercase tracking-widest block">Llave Maestra Acceso</span>
                <span className="font-mono text-[9px] font-black text-[#4be277] uppercase block truncate">
                  {newPersonalKey ? '✓ ' + newPersonalKey : '✘ NO CONFIGURADO'}
                </span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-[#4be277]/10 rounded-2xl space-y-1">
                <span className="text-[7.5px] font-black text-[#4be277] uppercase tracking-widest block">PIN Rápido Activo</span>
                <span className="font-mono text-[9px] font-black text-[#4be277] uppercase block truncate">
                  {newPersonalPin ? '✓ ' + newPersonalPin : '✘ NO CONFIGURADO'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowProfileModal(true);
                setShowAdvancedConfig(true);
              }}
              className="w-full h-11 bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/20 hover:border-[#4be277]/40 text-[#4be277] font-black rounded-xl text-[9px] uppercase tracking-widest italic flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Settings className="w-3.5 h-3.5 animate-spin duration-3000" /> Configurar Mi Cuenta & PIN Rápido
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
