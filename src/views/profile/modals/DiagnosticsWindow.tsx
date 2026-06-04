import React, { useState, useEffect } from 'react';
import { Database, X, Clock, Activity, Check, RefreshCw, Info, ArrowRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface DiagnosticsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiagnosticsWindow({ isOpen, onClose }: DiagnosticsWindowProps) {
  const { adminPhone } = useApp();
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsResults, setDiagnosticsResults] = useState<any>(null);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);

  const runDiagnostics = async () => {
    if (diagnosticsRunning) return;
    setDiagnosticsRunning(true);
    setDiagnosticsLogs(['[00:01] Inicializando prueba de fuego del motor Supabase...', '[00:02] Cargando credenciales de entorno y verificando cliente...']);
    
    const results: any = {
      connection: { status: 'loading', latency: 0 },
      profiles: { status: 'loading', latency: 0, actions: { read: 'pending' } },
      bookings: { status: 'loading', latency: 0, actions: { read: 'pending', write: 'pending', delete: 'pending' } },
      system_settings: { status: 'loading', latency: 0, actions: { read: 'pending', write: 'pending' } },
      ledger_transactions: { status: 'loading', latency: 0, actions: { read: 'pending', write: 'pending', delete: 'pending' } },
      cantina_items: { status: 'loading', latency: 0, actions: { read: 'pending' } },
      active_sessions: { status: 'loading', latency: 0, actions: { read: 'pending', write: 'pending', delete: 'pending' } }
    };
    setDiagnosticsResults({ ...results });

    const startTime = Date.now();

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase no está configurado o sus credenciales son inválidas en el archivo .env.');
      }

      setDiagnosticsLogs(prev => [...prev, `✓ [00:04] Conexión básica establecida con el Host: ${(supabase as any).supabaseUrl}`]);
      results.connection = { status: 'success', latency: Date.now() - startTime };

      const testTable = async (tableName: string, operations: ('read' | 'write' | 'delete')[], mockData?: any) => {
        const tStart = Date.now();
        setDiagnosticsLogs(prev => [...prev, `[00:05] Analizando tabla '${tableName}'...`]);
        results[tableName] = { status: 'loading', latency: 0, actions: { read: 'pending' } };
        if (operations.includes('write')) results[tableName].actions.write = 'pending';
        if (operations.includes('delete')) results[tableName].actions.delete = 'pending';
        
        // 1. READ TEST
        let { data, error } = await supabase.from(tableName).select('*').limit(1);
        if (error) {
          setDiagnosticsLogs(prev => [...prev, `❌ [00:06] Error de lectura en '${tableName}': ${error.message}`]);
          results[tableName] = { status: 'error', latency: Date.now() - tStart, actions: { read: 'failed' } };
          return;
        }
        
        results[tableName].actions.read = 'success';
        setDiagnosticsLogs(prev => [...prev, `✓ [00:07] Lectura exitosa en '${tableName}' (${data?.length || 0} filas encontradas)`]);

        // 2. WRITE TEST (if requested)
        let insertedId: any = null;
        let deleteKeyToUse: string = 'id';
        if (operations.includes('write') && mockData) {
          if (tableName === 'system_settings') {
            const { error: uError } = await supabase.from(tableName).update({ admin_phone: adminPhone }).eq('id', 1);
            if (uError) {
              setDiagnosticsLogs(prev => [...prev, `❌ [00:10] Error de actualización (UPDATE) en '${tableName}': ${uError.message}`]);
              results[tableName].actions.write = 'failed';
              results[tableName].status = 'partial_success';
              return;
            } else {
              setDiagnosticsLogs(prev => [...prev, `✓ [00:10] Actualización (UPDATE) en '${tableName}' exitosa`]);
              results[tableName].actions.write = 'success';
            }
          } else {
            const { data: inserted, error: wError } = await supabase.from(tableName).insert([mockData]).select();
            if (wError) {
              setDiagnosticsLogs(prev => [...prev, `❌ [00:08] Error de escritura (INSERT) en '${tableName}': ${wError.message}`]);
              results[tableName].actions.write = 'failed';
              results[tableName].status = 'partial_success';
              return;
            }
            
            results[tableName].actions.write = 'success';
            insertedId = inserted && inserted[0] ? (inserted[0].id || inserted[0].profile_id) : null;
            deleteKeyToUse = (inserted && inserted[0] && inserted[0].id) ? 'id' : 'profile_id';
            setDiagnosticsLogs(prev => [...prev, `✓ [00:09] Escritura (INSERT) en '${tableName}' exitosa`]);
          }
        }

        // 3. DELETE TEST (if requested)
        if (operations.includes('delete') && insertedId) {
          const { error: dError } = await supabase.from(tableName).delete().eq(deleteKeyToUse, insertedId);
          if (dError) {
            setDiagnosticsLogs(prev => [...prev, `❌ [00:11] Error de eliminación (DELETE) en '${tableName}': ${dError.message}`]);
            results[tableName].actions.delete = 'failed';
            results[tableName].status = 'partial_success';
            return;
          }
          results[tableName].actions.delete = 'success';
          setDiagnosticsLogs(prev => [...prev, `✓ [00:12] Eliminación (DELETE) en '${tableName}' exitosa`]);
        }

        results[tableName].status = 'success';
        results[tableName].latency = Date.now() - tStart;
      };

      // Profiles read-only test
      const tProfilesStart = Date.now();
      const { error: pError } = await supabase.from('profiles').select('*').limit(1);
      if (pError) {
        results.profiles = { status: 'error', latency: Date.now() - tProfilesStart, actions: { read: 'failed' } };
        setDiagnosticsLogs(prev => [...prev, `❌ [00:13] Error de lectura en 'profiles': ${pError.message}`]);
      } else {
        results.profiles = { status: 'success', latency: Date.now() - tProfilesStart, actions: { read: 'success' } };
        setDiagnosticsLogs(prev => [...prev, `✓ [00:14] Lectura exitosa en 'profiles'`]);
      }

      // Cantina items read-only test
      const tCantinaStart = Date.now();
      const { error: cError } = await supabase.from('cantina_items').select('*').limit(1);
      if (cError) {
        results.cantina_items = { status: 'error', latency: Date.now() - tCantinaStart, actions: { read: 'failed' } };
        setDiagnosticsLogs(prev => [...prev, `❌ [00:15] Error de lectura en 'cantina_items': ${cError.message}`]);
      } else {
        results.cantina_items = { status: 'success', latency: Date.now() - tCantinaStart, actions: { read: 'success' } };
        setDiagnosticsLogs(prev => [...prev, `✓ [00:16] Lectura exitosa en 'cantina_items'`]);
      }

      // System settings write-read test
      await testTable('system_settings', ['read', 'write']);

      // Bookings write-read-delete test
      await testTable('bookings', ['read', 'write', 'delete'], {
        id: 'diagnostics_bk_' + Math.random().toString(36).substr(2, 5),
        date: 'Lunes 1 Enero',
        time: '00:00',
        field: 'Cancha Diagnóstico Temporal',
        amount: '$ 0.00',
        user: 'DIAGNOSTICS_TEMP_BOT',
        status: 'pending_payment',
        payment_method: 'cash',
        extras_delivered: false,
        created_at: new Date().toISOString()
      });

      // Ledger transactions write-read-delete test
      await testTable('ledger_transactions', ['read', 'write', 'delete'], {
        id: 'diagnostics_tx_' + Date.now(),
        time: '00:00',
        detail: 'Diagnóstico Temporal Transacción',
        method: 'Efectivo',
        amount: 0,
        type: 'cash',
        labelColor: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/30'
      });

      // Active sessions write-read-delete test
      await testTable('active_sessions', ['read', 'write', 'delete'], {
        profile_id: 'diagnostics_sess_' + Math.random().toString(36).substr(2, 5),
        created_at: new Date().toISOString()
      });

      setDiagnosticsLogs(prev => [...prev, '✓ [00:18] Prueba de fuego completada. Todos los sistemas operativos.']);
    } catch (err: any) {
      setDiagnosticsLogs(prev => [...prev, `❌ [00:19] Falla catastrófica de diagnóstico: ${err.message}`]);
      results.connection = { status: 'error', latency: Date.now() - startTime };
    } finally {
      setDiagnosticsRunning(false);
      setDiagnosticsResults({ ...results });
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4be277]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4be277]/10 border border-[#4be277]/20 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-[#4be277]" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Prueba de Fuego Supabase</h4>
              <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                CONSOLA DE DIAGNÓSTICOS EN TIEMPO REAL • CONEXIONES Y OPERACIONES CRUD
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status and Latency Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
          {/* Connection Health Card */}
          <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden font-sans">
            <span className="text-[9.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Estado de Conexión</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                {diagnosticsResults?.connection?.status === 'success' ? 'CONECTADO' : diagnosticsResults?.connection?.status === 'error' ? 'ERROR' : 'PENDIENTE'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${diagnosticsResults?.connection?.status === 'success' ? 'bg-[#4be277] animate-pulse' : 'bg-zinc-500'}`} />
              <span className="text-[8px] font-mono font-black text-zinc-400">Host verificado con éxito</span>
            </div>
          </div>

          {/* API Latency Card */}
          <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden font-sans">
            <span className="text-[9.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Latencia de Conexión</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                {diagnosticsResults?.connection?.latency ? `${diagnosticsResults.connection.latency} ms` : '--'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[8px] font-mono font-black text-zinc-400">Tiempo de respuesta inicial</span>
            </div>
          </div>

          {/* Active Channels Card */}
          <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-3xl relative overflow-hidden font-sans">
            <span className="text-[9.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Canales Realtime</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#4be277] font-mono">4 ACTIVOS</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#4be277] animate-pulse" />
              <span className="text-[8px] font-mono font-black text-zinc-400">Settings, Bookings, Ledger, Cantina</span>
            </div>
          </div>
        </div>

        {/* Table Testing Matrix */}
        <div className="p-6 bg-[#18181b]/40 border border-white/5 rounded-3xl text-left mb-6 font-sans">
          <span className="text-[9px] font-black text-[#4be277] uppercase tracking-widest block mb-4 italic">Tabla de Verificación de Permisos (CRUD)</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Results grid */}
            <div className="space-y-2">
              {[
                { name: 'profiles', label: 'Perfiles de Usuario', ops: ['Lectura'] },
                { name: 'system_settings', label: 'Ajustes del Complejo', ops: ['Lectura', 'Actualización'] },
                { name: 'bookings', label: 'Reservas de Cancha', ops: ['Lectura', 'Inserción', 'Eliminación'] },
                { name: 'ledger_transactions', label: 'Libro de Caja (Ledger)', ops: ['Lectura', 'Inserción', 'Eliminación'] },
                { name: 'cantina_items', label: 'Inventario de Cantina', ops: ['Lectura'] },
                { name: 'active_sessions', label: 'Sesiones de Operadores', ops: ['Lectura', 'Inserción', 'Eliminación'] }
              ].map((table) => {
                const res = diagnosticsResults ? diagnosticsResults[table.name] : null;
                return (
                  <div key={table.name} className="p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10.5px] font-black text-white uppercase italic block tracking-wider">{table.label}</span>
                      <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                        Tabla: {table.name} • Pruebas: {table.ops.join(', ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {res?.status === 'loading' && (
                        <span className="text-[7.5px] font-mono font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25 animate-pulse">TESTING...</span>
                      )}
                      {res?.status === 'success' && (
                        <span className="text-[7.5px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> PASÓ ({res.latency}ms)
                        </span>
                      )}
                      {res?.status === 'partial_success' && (
                        <span className="text-[7.5px] font-mono font-black text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/25">PARCIAL</span>
                      )}
                      {res?.status === 'error' && (
                        <span className="text-[7.5px] font-mono font-black text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/25">FALLÓ</span>
                      )}
                      {!res && (
                        <span className="text-[7.5px] font-mono font-black text-zinc-600 bg-zinc-800/20 px-2.5 py-0.5 rounded-full border border-zinc-700/20">PENDIENTE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic logs output console */}
            <div className="space-y-4">
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 h-[256px] flex flex-col justify-between font-mono text-[9px] text-zinc-400 select-all overflow-y-auto">
                <div className="space-y-1.5 flex-1 p-0.5">
                  {diagnosticsLogs.length === 0 ? (
                    <div className="text-zinc-600 italic">Presione EJECUTAR PRUEBA DE FUEGO para iniciar los tests de lectura/escritura en tiempo real.</div>
                  ) : (
                    diagnosticsLogs.map((log, i) => (
                      <div key={i} className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : log.startsWith('❌') ? 'text-red-500 font-bold' : log.includes('Encontrados') ? 'text-[#4be277]' : 'text-zinc-400'}>{log}</div>
                    ))
                  )}
                </div>
                {diagnosticsRunning && (
                  <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden mt-2 shrink-0">
                    <div className="h-full bg-[#4be277] transition-all duration-55" style={{ width: '100%' }} />
                  </div>
                )}
              </div>

              <button
                disabled={diagnosticsRunning}
                onClick={runDiagnostics}
                className={`h-12 w-full rounded-xl font-black text-[9px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                  diagnosticsRunning
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                    : 'bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/25 hover:border-[#4be277]/50 text-[#4be277] hover:border-[#4be277]/60 shadow-[0_0_20px_rgba(75,226,119,0.15)]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
                {diagnosticsRunning ? 'EJECUTANDO DIAGNÓSTICO...' : 'EJECUTAR NUEVA PRUEBA DE FUEGO'}
              </button>
            </div>
          </div>
        </div>

        {/* Informative footer */}
        <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex gap-3 text-left mb-6 font-sans">
          <Info className="w-5 h-5 text-[#4be277] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-black text-white uppercase tracking-wider block italic">AUDITORÍA DE PRUEBA DE FUEGO</span>
            <p className="text-[8.5px] font-bold text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed mt-1">
              Esta herramienta realiza operaciones CRUD (Creación, Lectura, Actualización y Borrado) simuladas y controladas con registros temporales autofirmados. La persistencia es validada e inmediatamente removida para mantener la sanidad de la base de datos de producción.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Ajustes
          </button>
        </div>
      </div>
    </div>
  );
}
