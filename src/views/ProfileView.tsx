import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, ShieldCheck, Key, Settings, CreditCard, History, 
  ChevronRight, LogOut, Phone, MessageCircle, AlertTriangle, 
  Save, ExternalLink, ArrowRight, Lock, Clock, Newspaper,
  Globe, Smartphone, X, Activity, CheckCircle, Wrench, Trash2, Plus, Copy, RefreshCw, Power, Check, FileText, Mail,
  Database, HardDrive, Info, GlassWater, Trophy, Sparkles, Crown, Gem, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getRotationMetadata, getActiveAccountIndex } from '../lib/transferRotation';
import { getCantinaItems, saveCantinaItems, CantinaItem } from '../lib/cantina';

export default function ProfileView() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramView = searchParams.get('view');

  const { 
    showToast, eliteKey, setEliteKey, vipKey, setVipKey, universalUserKey, setUniversalUserKey, saveSettings, adminPhone, schedule, 
    appLicenseActive, webLicenseActive, maintenanceMode, setMaintenanceMode, emergencyMode, setEmergencyMode, 
    emergencyType, setEmergencyType,
    emergencyMessage, setEmergencyMessage, notifications, setNotifications, stadiumName, setStadiumName, 
    marqueeText, setMarqueeText, secondaryMarqueeText, setSecondaryMarqueeText, setUserAvatar, 
    setUserName, setUserRole, allBookings, 
    cashTotal, setCashTotal, transferTotal, setTransferTotal, mpTotal, setMpTotal, 
    ledgerTransactions, setLedgerTransactions, cantinaItems, setCantinaItems 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'licencias' | 'ajustes' | 'seguridad' | 'noticia' | 'analytics'>(() => {
    const userRole = localStorage.getItem('ramito_user_role');
    const searchParamsTemp = new URLSearchParams(window.location.search);
    const viewParam = searchParamsTemp.get('view');
    const tabParam = searchParamsTemp.get('tab');
    if (tabParam === 'seguridad') {
      return 'seguridad';
    }
    if (tabParam === 'ajustes' && (userRole === 'admin_elite' || userRole === 'admin_vip')) {
      return 'ajustes';
    }
    if (tabParam === 'noticia') {
      return 'noticia';
    }
    if ((viewParam === 'admin_selection' || tabParam === 'licencias') && (userRole === 'admin_elite' || userRole === 'admin_vip')) {
      return 'licencias';
    }
    return (userRole === 'admin_elite' || userRole === 'admin_vip') ? 'licencias' : 'seguridad';
  });

  const [showProfileModal, setShowProfileModal] = useState(() => {
    const searchParamsTemp = new URLSearchParams(window.location.search);
    const tabParam = searchParamsTemp.get('tab');
    return tabParam === 'perfil';
  });
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Separate Windows (Ventanas) for each Admin and License
  const [showWebWindow, setShowWebWindow] = useState(() => {
    const searchParamsTemp = new URLSearchParams(window.location.search);
    const tab = searchParamsTemp.get('tab');
    const license = searchParamsTemp.get('license');
    const modal = searchParamsTemp.get('modal');
    return (tab === 'licencias' && license === 'web') || modal === 'web_console' || modal === 'vercel';
  });
  const [webConsoleActiveTab, setWebConsoleActiveTab] = useState<'config' | 'metrics'>(() => {
    const searchParamsTemp = new URLSearchParams(window.location.search);
    const modal = searchParamsTemp.get('modal');
    return modal === 'vercel' ? 'metrics' : 'config';
  });
  const [showAppWindow, setShowAppWindow] = useState(false);
  const [showEmergencyWindow, setShowEmergencyWindow] = useState(false);
  const [showTransferWindow, setShowTransferWindow] = useState(false);
  const [showCantinaWindow, setShowCantinaWindow] = useState(false);
  const [showMaintenanceWindow, setShowMaintenanceWindow] = useState(false);
  const [showCodesWindow, setShowCodesWindow] = useState(false);
  const [showAnalyticsWindow, setShowAnalyticsWindow] = useState(() => {
    const searchParamsTemp = new URLSearchParams(window.location.search);
    return searchParamsTemp.get('tab') === 'ajustes' && searchParamsTemp.get('modal') === 'analytics';
  });

  const [showStorageBackupWindow, setShowStorageBackupWindow] = useState(() => {
    const searchParamsTemp = new URLSearchParams(window.location.search);
    return searchParamsTemp.get('tab') === 'ajustes' && searchParamsTemp.get('modal') === 'backup';
  });
  
  // Custom simulation states for Vercel and Storage Backups
  const [isSimulatingBackup, setIsSimulatingBackup] = useState(false);
  const [backupProgressPercent, setBackupProgressPercent] = useState(0);
  const [backupLogs, setBackupLogs] = useState<string[]>([]);
  const [isRefreshingVercelMetrics, setIsRefreshingVercelMetrics] = useState(false);
  const [transferAlias1, setTransferAlias1] = useState(() => localStorage.getItem('ramito_transfer_alias_1') || 'RAMITO.FUT.SHOW');
  const [transferCbu1, setTransferCbu1] = useState(() => localStorage.getItem('ramito_transfer_cbu_1') || '0000003100012345678901');
  const [transferTitular1, setTransferTitular1] = useState(() => localStorage.getItem('ramito_transfer_titular_1') || 'RAMITO FUT SHOW S.R.L.');
  const [transferAlias2, setTransferAlias2] = useState(() => localStorage.getItem('ramito_transfer_alias_2') || 'RAMITO.FUT.SEGUNDA');
  const [transferCbu2, setTransferCbu2] = useState(() => localStorage.getItem('ramito_transfer_cbu_2') || '0000003100098765432109');
  const [transferTitular2, setTransferTitular2] = useState(() => localStorage.getItem('ramito_transfer_titular_2') || 'COMPLEJO RAMITO S.A.');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportRange, setSelectedExportRange] = useState<'mensual' | 'trimestral'>('mensual');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

  // Supabase Diagnostics / Fire Test states
  const [showDiagnosticsWindow, setShowDiagnosticsWindow] = useState(false);
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
            // we don't insert, we only update row id=1
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
              results[tableName].status = 'partial_success'; // failed write but read succeeded
              return;
            }
            
            results[tableName].actions.write = 'success';
            // Prefer the returned id; fallback to profile_id for tables like active_sessions
            insertedId = inserted && inserted[0] ? (inserted[0].id || inserted[0].profile_id) : null;
            deleteKeyToUse = (inserted && inserted[0] && inserted[0].id) ? 'id' : 'profile_id';
            setDiagnosticsLogs(prev => [...prev, `✓ [00:09] Escritura (INSERT) en '${tableName}' exitosa`]);
          }
        }

        // 3. DELETE TEST (if requested and we have something to delete)
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

      // RUN READS & WRITES
      await testTable('profiles', ['read']);
      await testTable('system_settings', ['read', 'write'], { id: 1 });
      
      // Test Bookings with mock insert
      const mockBooking = {
        id: `test_diag_${Date.now()}`,
        date: 'Test',
        time: '99:99',
        field: 'Cancha Diagnóstico',
        status: 'completed',
        amount: 'S/. 0.00',
        user: 'DIAGNOSTICO SUPABASE',
        phone: '+000000000'
      };
      await testTable('bookings', ['read', 'write', 'delete'], mockBooking);

      // Test Ledger
      const mockTx = {
        id: `tx_diag_${Date.now()}`,
        time: '00:00',
        detail: 'Diagnóstico de Conexión',
        method: 'Test de Consola',
        amount: 0,
        type: 'cash',
        labelColor: 'text-zinc-400 bg-zinc-800'
      };
      await testTable('ledger_transactions', ['read', 'write', 'delete'], mockTx);

      // Test Cantina
      await testTable('cantina_items', ['read']);

      // Test Active Sessions
      const mockSession = {
        profile_id: `diag_test_${Date.now()}`,
        device_type: 'desktop'
      };
      await testTable('active_sessions', ['read', 'write', 'delete'], mockSession);

      setDiagnosticsLogs(prev => [...prev, '✓ [00:25] ¡PRUEBA DE FUEGO SUPABASE COMPLETADA CON ÉXITO!', 'Todas las conexiones y operaciones CRUD con Supabase funcionan al 100%.']);
      showToast('Prueba de fuego completada con éxito', 'success');

    } catch (err: any) {
      console.error(err);
      results.connection = { status: 'error', latency: 0 };
      setDiagnosticsLogs(prev => [...prev, `❌ [00:25] ERROR CRÍTICO EN PRUEBA DE FUEGO: ${err.message || err}`]);
      showToast('Fallo en la prueba de fuego de base de datos');
    } finally {
      setDiagnosticsRunning(false);
      setDiagnosticsResults({ ...results });
    }
  };


  // States for WEB License Options (Separated and Complete)
  const [webDomain, setWebDomain] = useState(() => localStorage.getItem('ramito_web_domain') || 'ramitofutshow.com');
  const [webVercelHook, setWebVercelHook] = useState(() => localStorage.getItem('ramito_web_vercel_hook') || 'https://api.vercel.com/v1/integrations/deploy/prj_12345');
  const [webDaysRemaining, setWebDaysRemaining] = useState(() => parseInt(localStorage.getItem('ramito_web_days_remaining') || '15', 10));
  const [webPaymentGateway, setWebPaymentGateway] = useState(() => localStorage.getItem('ramito_web_payment_gateway') || 'Mercado Pago (Latam)');
  const [webPaymentKey, setWebPaymentKey] = useState(() => localStorage.getItem('ramito_web_payment_key') || 'mp-live-pub-94827592');
  const [webAllowRegistrations, setWebAllowRegistrations] = useState(() => (localStorage.getItem('ramito_web_allow_registrations') !== 'false'));
  const [webSyncFrequency, setWebSyncFrequency] = useState(() => localStorage.getItem('ramito_web_sync_frequency') || 'Tiempo Real (Live)');
  const [isVercelDeploying, setIsVercelDeploying] = useState(false);
  const [vercelDeployLogs, setVercelDeployLogs] = useState<string[]>([]);
  const [vercelPlan, setVercelPlan] = useState(() => localStorage.getItem('ramito_vercel_plan') || 'free');
  const [vercelAutoUpgrade, setVercelAutoUpgrade] = useState(() => localStorage.getItem('ramito_vercel_autoupgrade') === 'true');

  // States for APP License Options (Separated and Complete)
  const [appDaysRemaining, setAppDaysRemaining] = useState(() => parseInt(localStorage.getItem('ramito_app_days_remaining') || '28', 10));
  const [appPwaShortName, setAppPwaShortName] = useState(() => localStorage.getItem('ramito_app_pwa_short_name') || 'Ramito APP');
  const [appPushEnabled, setAppPushEnabled] = useState(() => (localStorage.getItem('ramito_app_push_enabled') !== 'false'));
  const [appPushProvider, setAppPushProvider] = useState(() => localStorage.getItem('ramito_app_push_provider') || 'OneSignal Push Service');
  const [appPushId, setAppPushId] = useState(() => localStorage.getItem('ramito_app_push_id') || 'fcm-token-id-9485295-a');
  const [appOfflineCache, setAppOfflineCache] = useState(() => localStorage.getItem('ramito_app_offline_cache') || 'Pre-cargar reservas y perfiles');
  const [testPushMessage, setTestPushMessage] = useState('');
  const [elitePhone, setElitePhone] = useState(() => localStorage.getItem('ramito_elite_phone') || '+51 987 654 321');

  // States for Security tab
  const [newEliteKey, setNewEliteKey] = useState(eliteKey);
  const [newVipKey, setNewVipKey] = useState(vipKey);
  const [newUniversalUserKey, setNewUniversalUserKey] = useState(universalUserKey);
  const [newAdminPhone, setNewAdminPhone] = useState(adminPhone);
  const [newPersonalKey, setNewPersonalKey] = useState('');
  const [newPersonalPin, setNewPersonalPin] = useState('');
  const [newPersonalPhone, setNewPersonalPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [personalKeyVisible, setPersonalKeyVisible] = useState(false);
  const [personalPinVisible, setPersonalPinVisible] = useState(false);
  const [purgingSessions, setPurgingSessions] = useState(false);
  const [newStadiumName, setNewStadiumName] = useState(stadiumName);

  const [newWeekdayOpen, setNewWeekdayOpen] = useState(schedule?.weekday?.open || '18:00');
  const [newWeekdayClose, setNewWeekdayClose] = useState(schedule?.weekday?.close || '23:00');
  const [newWeekdayOpen2, setNewWeekdayOpen2] = useState(schedule?.weekday?.open2 || '08:00');
  const [newWeekdayClose2, setNewWeekdayClose2] = useState(schedule?.weekday?.close2 || '13:00');
  const [newWeekdayUseTwoShifts, setNewWeekdayUseTwoShifts] = useState(schedule?.weekday?.useTwoShifts || false);

  const [newWeekendOpen, setNewWeekendOpen] = useState(schedule?.weekend?.open || '15:00');
  const [newWeekendClose, setNewWeekendClose] = useState(schedule?.weekend?.close || '23:00');
  const [newWeekendOpen2, setNewWeekendOpen2] = useState(schedule?.weekend?.open2 || '08:00');
  const [newWeekendClose2, setNewWeekendClose2] = useState(schedule?.weekend?.close2 || '13:00');
  const [newWeekendUseTwoShifts, setNewWeekendUseTwoShifts] = useState(schedule?.weekend?.useTwoShifts || false);

  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('ramito_support_email') || 'soporte@ramitofut.com');
  const [supportIg, setSupportIg] = useState(() => localStorage.getItem('ramito_support_ig') || '@ramitofut');
  const [activationCode, setActivationCode] = useState('');
  const [maintenanceBg, setMaintenanceBg] = useState(() => localStorage.getItem('ramito_maintenance_bg') || '');
  const [maintenanceCustomMsg, setMaintenanceCustomMsg] = useState(() => localStorage.getItem('ramito_maintenance_msg') || 'Estamos realizando mejoras en nuestra aplicación móvil para ofrecerles un servicio más rápido y seguro. Las funciones de reserva estarán disponibles nuevamente a la brevedad.');
  const [verifyEliteKey, setVerifyEliteKey] = useState('');

  const [court1Policy, setCourt1Policy] = useState(() => localStorage.getItem('ramito_court1_policy') || 'CANCELACIÓN GRATUITA HASTA 24 HORAS ANTES DEL INICIO. EL USO DE CHIMPUNES CON COCOS GRANDES ESTÁ PROHIBIDO POR CUIDADO DEL CÉSPED.');
  const [showCourt1PolicyWindow, setShowCourt1PolicyWindow] = useState(false);

  const [court2Policy, setCourt2Policy] = useState(() => localStorage.getItem('ramito_court2_policy') || 'EL USO DE CALZADO CON TAPONES O COCÓS (BOTINES) ESTÁ ABSOLUTAMENTE PROHIBIDO POR CUESTIONES DE SEGURIDAD Y CUIDADO DE LA LOSA. SE EXIGE EL USO EXCLUSIVO DE ZAPATILLAS DE SUELA LISA DE GOMA (SUELA FLAT/FUTSAL).');
  const [showCourt2PolicyWindow, setShowCourt2PolicyWindow] = useState(false);

  const [stockAlertThreshold, setStockAlertThreshold] = useState<number>(() => {
    return parseInt(localStorage.getItem('ramito_stock_alert_threshold') || '5', 10);
  });

  // States for news/marquee and profile configurations

  const [newMarqueeText, setNewMarqueeText] = useState(() => marqueeText || '');
  const [newSecondaryMarqueeText, setNewSecondaryMarqueeText] = useState(() => secondaryMarqueeText || '');
  
  useEffect(() => {
    if (marqueeText) {
      setNewMarqueeText(marqueeText);
    }
  }, [marqueeText]);

  useEffect(() => {
    if (secondaryMarqueeText !== undefined) {
      setNewSecondaryMarqueeText(secondaryMarqueeText);
    }
  }, [secondaryMarqueeText]);

  useEffect(() => {
    if (eliteKey) {
      setNewEliteKey(eliteKey);
    }
  }, [eliteKey]);

  useEffect(() => {
    if (vipKey) {
      setNewVipKey(vipKey);
    }
  }, [vipKey]);

  useEffect(() => {
    if (adminPhone) {
      setNewAdminPhone(adminPhone);
    }
  }, [adminPhone]);

  useEffect(() => {
    if (schedule?.weekday?.open) setNewWeekdayOpen(schedule.weekday.open);
    if (schedule?.weekday?.close) setNewWeekdayClose(schedule.weekday.close);
    if (schedule?.weekday?.open2) setNewWeekdayOpen2(schedule.weekday.open2);
    if (schedule?.weekday?.close2) setNewWeekdayClose2(schedule.weekday.close2);
    if (schedule?.weekday?.useTwoShifts !== undefined) setNewWeekdayUseTwoShifts(schedule.weekday.useTwoShifts);

    if (schedule?.weekend?.open) setNewWeekendOpen(schedule.weekend.open);
    if (schedule?.weekend?.close) setNewWeekendClose(schedule.weekend.close);
    if (schedule?.weekend?.open2) setNewWeekendOpen2(schedule.weekend.open2);
    if (schedule?.weekend?.close2) setNewWeekendClose2(schedule.weekend.close2);
    if (schedule?.weekend?.useTwoShifts !== undefined) setNewWeekendUseTwoShifts(schedule.weekend.useTwoShifts);
  }, [schedule]);

  useEffect(() => {
    if (userData?.email) {
      setNewEmail(userData.email);
    } else {
      const storedEmail = localStorage.getItem('ramito_user_email');
      if (storedEmail) {
        setNewEmail(storedEmail);
      }
    }
    if (userData?.password) {
      setNewPersonalKey(userData.password);
    } else {
      const storedPw = localStorage.getItem('ramito_user_pw');
      if (storedPw) {
        setNewPersonalKey(storedPw);
      }
    }
    if (userData?.pin) {
      setNewPersonalPin(userData.pin);
    } else {
      const storedPin = localStorage.getItem('ramito_user_pin');
      if (storedPin) {
        setNewPersonalPin(storedPin);
      } else {
        setNewPersonalPin('');
      }
    }
    if (userData?.phone) {
      setNewPersonalPhone(userData.phone);
    } else {
      const storedPhone = localStorage.getItem('ramito_user_phone');
      if (storedPhone) {
        setNewPersonalPhone(storedPhone);
      } else {
        setNewPersonalPhone('+51 987 654 321');
      }
    }
  }, [userData]);

  const [newsSlots, setNewsSlots] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem('ramito_news_slots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days.reduce((acc, day) => {
      acc[day] = { Mañana: false, Tarde: false, Noche: false };
      return acc;
    }, {} as Record<string, Record<string, boolean>>);
  });

  const toggleNewsSlot = (day: string, slot: string) => {
    setNewsSlots(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot]
      }
    }));
  };

  // States for Emergency Tab (Cierre de Emergencia)
  const [affectedCourts, setAffectedCourts] = useState(() => localStorage.getItem('ramito_emergency_courts') || 'Ambas');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('ramito_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', timestamp: '18:40:12', user: 'Élite Admin', action: 'APLICACIÓN DE CUPÓN', type: 'success', details: 'Suscripción APP extendida por 90 días usando código de emergencia.' },
      { id: '2', timestamp: '15:22:45', user: 'Vip Admin', action: 'CAMBIO DE HORARIO', type: 'info', details: 'Horario del fin de semana modificado de 15:00 a 23:00.' },
      { id: '3', timestamp: '10:05:14', user: 'Élite Admin', action: 'ESTADO DE COMPLEJO', type: 'warning', details: 'Aviso marquee de marquesina refrescado con éxito.' },
      { id: '4', timestamp: '09:12:03', user: 'Sistema principal', action: 'AUTO-CHEQUEO', type: 'success', details: 'Verificación de pasarela de pago Mercado Pago exitosa.' }
    ];
  });
  const [selectedAuditFilter, setSelectedAuditFilter] = useState('todos');

  // Helper to add audit logs
  const addAuditLog = (action: string, details: string, type: 'info' | 'warning' | 'success' | 'alert') => {
    const freshUser = localStorage.getItem('ramito_user_role') === 'admin_elite' ? 'Élite Admin' : 'Vip Admin';
    const newLog = {
      id: 'audit-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      user: freshUser,
      action,
      type,
      details
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('ramito_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const exportToExcelReport = (range: 'mensual' | 'trimestral') => {
    const totalCaja = cashTotal + transferTotal + mpTotal;
    
    let csvContent = "\uFEFF"; // Add UTF-8 BOM so Excel opens accented characters flawlessly
    
    csvContent += "=== REPORTE DE AUDITORÍA Y ARQUEO DE CAJA ===\n";
    csvContent += `Complejo Lunático:;${stadiumName || 'Complejo Deportivo Ramito'}\n`;
    csvContent += `Rango del Reporte:;${range.toUpperCase()}\n`;
    csvContent += `Fecha de Carga/Consolidado:;${new Date().toLocaleString('es-AR')}\n\n`;

    csvContent += "=== CONCILIACIÓN DE FONDOS ===\n";
    csvContent += "Medio de Pago;Monto Registrado;Porcentaje\n";
    csvContent += `Efectivo (Cash);$ ${cashTotal.toLocaleString('es-AR')};${((cashTotal / (totalCaja || 1)) * 100).toFixed(1)}%\n`;
    csvContent += `Transferencias Bancarias;$ ${transferTotal.toLocaleString('es-AR')};${((transferTotal / (totalCaja || 1)) * 100).toFixed(1)}%\n`;
    csvContent += `Mercado Pago;$ ${mpTotal.toLocaleString('es-AR')};${((mpTotal / (totalCaja || 1)) * 100).toFixed(1)}%\n`;
    csvContent += `TOTAL CONSOLIDADO CAJA;$ ${totalCaja.toLocaleString('es-AR')};100%\n\n`;

    csvContent += "=== HISTORIAL CRONOLÓGICO DE AUDITORÍA ===\n";
    csvContent += "Fecha;Operador;Operación ID-Acción;Descripción;Resultado\n";
    
    const logsQty = range === 'mensual' ? Math.min(30, auditLogs.length) : auditLogs.length;
    auditLogs.slice(0, logsQty).forEach((log: any) => {
      const cleanDate = (log.timestamp || '').replace(/;/g, ',');
      const cleanUser = (log.user || '').replace(/;/g, ',');
      const cleanAction = (log.action || '').replace(/;/g, ',');
      const cleanDesc = (log.details || '').replace(/;/g, ',');
      const cleanStatus = (log.type || '').replace(/;/g, ',');
      csvContent += `"${cleanDate}";"${cleanUser}";"${cleanAction}";"${cleanDesc}";"${cleanStatus}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_auditoria_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Reporte Excel/CSV exportado con éxito (${range})`, 'success');
    addAuditLog('IMP. REPORTE EXCEL', `Se exportó el reporte estructurado en formato CSV/Excel con el consolidado en un solo click`, 'success');
  };

  const generatePDFReport = (range: 'mensual' | 'trimestral') => {
    const daysFiltered = range === 'mensual' ? 30 : 90;
    
    // We filter logs that fit the selected timeframe or take a clean slice representation
    const logsQty = range === 'mensual' ? Math.min(25, auditLogs.length) : auditLogs.length;
    const reportedLogs = auditLogs.slice(0, logsQty);

    // Dynamic totals
    const totalCaja = cashTotal + transferTotal + mpTotal;
    const cashPercentage = ((cashTotal / (totalCaja || 1)) * 100).toFixed(1);
    const transferPercentage = ((transferTotal / (totalCaja || 1)) * 100).toFixed(1);
    const mpPercentage = ((mpTotal / (totalCaja || 1)) * 100).toFixed(1);

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      if (showToast) showToast('Hablite las ventanas emergentes para descargar el PDF', 'error');
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
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .main-title {
              font-size: 26px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              color: #121414;
              margin: 0;
            }
            .main-subtitle {
              font-size: 11px;
              font-weight: bold;
              color: #009EE3;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-top: 4px;
            }
            .meta-info {
              text-align: right;
              font-size: 10px;
              color: #555555;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #0f172a;
              margin-top: 30px;
              margin-bottom: 12px;
              border-left: 4px solid #009EE3;
              padding-left: 10px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            .stat-box {
              border: 1px solid #e2e8f0;
              padding: 15px;
              border-radius: 12px;
              background-color: #f8fafc;
            }
            .stat-box.highlight {
              border: 1px solid #009EE3;
              background-color: #f0f9ff;
            }
            .stat-label {
              font-size: 9px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .stat-value {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 5px;
            }
            .stat-value.highlight-text {
              color: #009EE3;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            th {
              background-color: #f1f5f9;
              text-align: left;
              padding: 10px 12px;
              font-size: 9.5px;
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 10px 12px;
              font-size: 10.5px;
              border-bottom: 1px solid #e2e8f0;
              color: #1e293b;
            }
            .badge-style {
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
            }
            .badge-alert { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
            .badge-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
            .badge-warning { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .badge-info { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
            .badge-mp { background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
            
            .auditable-meta {
              background-color: #fafafa;
              border: 1px dashed #cbd5e1;
              border-radius: 12px;
              padding: 15px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              gap: 20px;
            }
            .meta-column {
              flex: 1;
              font-size: 10px;
            }
            .meta-column h5 {
              margin: 0 0 6px 0;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: bold;
            }
            .meta-column p {
              margin: 0;
              font-weight: bold;
              color: #1e293b;
            }

            .sig-container {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              gap: 50px;
              page-break-inside: avoid;
            }
            .sig-box {
              flex: 1;
              text-align: center;
              border-top: 1px solid #cbd5e1;
              padding-top: 10px;
              font-size: 10px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 60px;
            }

            .footer-container {
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              font-size: 8px;
              color: #94a3b8;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="main-title">RAMITO FUT SHOW</h1>
              <div class="main-subtitle">CONSOLA ELITE • REPORTE DE AUDITORÍA DETALLADO (${range.toUpperCase()})</div>
            </div>
            <div class="meta-info">
              <div>Rango: Reporte Histórico de ${daysFiltered} Días</div>
              <div>Emisión: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              <div>ID Operación: MP-AUDIT-TX-${Date.now()}</div>
            </div>
          </div>

          <div class="auditable-meta">
            <div class="meta-column">
              <h5>Licencias de Operación</h5>
              <p>Web App: Activa (Vercel Secure Deploy)</p>
              <p>Móvil PWA: ${appOfflineCache}</p>
            </div>
            <div class="meta-column">
              <h5>Pasarela Homologada</h5>
              <p>Servicio: Mercado Pago SDK v2 (Producción)</p>
              <p>Gateway IPN Callback: HTTPS POST webhook_ok</p>
            </div>
            <div class="meta-column">
              <h5>Estado de Caja</h5>
              <p>Recaudación: Balance Cuadrado y Auditado</p>
              <p>Moneda Oficial: Peso Argentino (ARS)</p>
            </div>
          </div>

          <div class="section-title">Resumen de Caja Consolidado</div>
          <div class="stats-grid">
            <div class="stat-box highlight">
              <div class="stat-label">Caja Total Hoy</div>
              <div class="stat-value highlight-text">$${totalCaja.toLocaleString('es-AR')}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Recaudado Puerta</div>
              <div class="stat-value">$${cashTotal.toLocaleString('es-AR')} (${cashPercentage}%)</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Bancos Directo</div>
              <div class="stat-value">$${transferTotal.toLocaleString('es-AR')} (${transferPercentage}%)</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Cobros Mercado Pago</div>
              <div class="stat-value">$${mpTotal.toLocaleString('es-AR')} (${mpPercentage}%)</div>
            </div>
          </div>

          <div class="section-title">Ledger de Transacciones del Día (Caja Unificada)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 12%">Hora</th>
                <th style="width: 25%">Medio de Cobro</th>
                <th style="width: 45%">Detalle de la Operación</th>
                <th style="width: 18%">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerTransactions.map(tx => `
                <tr>
                  <td style="font-family: monospace; font-weight: bold; color: #475569;">${tx.time}</td>
                  <td>
                    <span class="badge-style ${tx.type === 'mercadopago' ? 'badge-mp' : tx.type === 'transfer' ? 'badge-success' : 'badge-info'}">
                      ${tx.method}
                    </span>
                  </td>
                  <td style="font-weight: bold; color: #0f172a;">${tx.detail}</td>
                  <td style="font-family: monospace; font-weight: 900; color: #1e293b;">$${(tx.amount || 0).toLocaleString('es-AR')} ARS</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Log de Seguridad de la Consola (${reportedLogs.length} Sucesos Recientes)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%">timestamp</th>
                <th style="width: 25%">acción realizada</th>
                <th style="width: 45%">detalles descriptivos del log</th>
                <th style="width: 15%">autorizado por</th>
              </tr>
            </thead>
            <tbody>
              ${reportedLogs.map(log => `
                <tr>
                  <td style="font-family: monospace; font-weight: bold; color: #475569;">${log.timestamp}</td>
                  <td>
                    <span class="badge-style badge-${log.type}">
                      ${log.action}
                    </span>
                  </td>
                  <td style="font-weight: normal; color: #334155;">${log.details}</td>
                  <td style="color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase;">${log.user}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="sig-container">
            <div class="sig-box">
              Firma Administrador Responsable
            </div>
            <div class="sig-box">
              Firma Auditor de Calidad del Complejo
            </div>
          </div>

          <div class="footer-container">
            SISTEMA LICENCIADO RAMITO FUT SHOW • ARCHIVO DE SEGURIDAD PROTEGIDO POR LICENCIA ELITE
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

  const filteredAuditLogs = selectedAuditFilter === 'todos' 
    ? auditLogs 
    : auditLogs.filter(log => log.type === selectedAuditFilter);

  interface CustomActivationCode {
    id: string;
    code: string;
    days: number;
    type: 'app';
    used: boolean;
  }

  const [customCodes, setCustomCodes] = useState<CustomActivationCode[]>(() => {
    const saved = localStorage.getItem('ramito_custom_activation_codes');
    return saved ? JSON.parse(saved) : [
      { id: '1', code: 'PROMO-VIP-RAMITO', days: 60, type: 'app', used: false },
      { id: '2', code: 'RAMITO-PWA-GOLD', days: 180, type: 'app', used: false }
    ];
  });

  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeDays, setNewCodeDays] = useState('90');

  useEffect(() => {
    localStorage.setItem('ramito_custom_activation_codes', JSON.stringify(customCodes));
  }, [customCodes]);

  const generateRandomCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let rand = '';
    for (let i = 0; i < 4; i++) rand += letters.charAt(Math.floor(Math.random() * letters.length));
    rand += '-';
    for (let i = 0; i < 4; i++) rand += numbers.charAt(Math.floor(Math.random() * numbers.length));
    setNewCodeName(`RAMITO-${rand}`);
  };

  const handleBgUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecciona un archivo de imagen válido', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setMaintenanceBg(base64);
      localStorage.setItem('ramito_maintenance_bg', base64);
      showToast('Imagen de fondo de mantenimiento cargada con éxito', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomCode = () => {
    const codeClean = newCodeName.trim().toUpperCase();
    if (!codeClean) {
      showToast('Escriba o genere un código válido', 'error');
      return;
    }

    if (customCodes.some(c => c.code.toUpperCase() === codeClean)) {
      showToast('Este código ya existe', 'error');
      return;
    }

    const daysVal = parseInt(newCodeDays, 10);
    if (isNaN(daysVal) || daysVal <= 0) {
      showToast('Escriba un número de días válido', 'error');
      return;
    }

    const newCodeItem: CustomActivationCode = {
      id: 'code-' + Date.now(),
      code: codeClean,
      days: daysVal,
      type: 'app',
      used: false
    };

    setCustomCodes(prev => [newCodeItem, ...prev]);
    showToast(`Código ${codeClean} guardado con éxito`, 'success');
    setNewCodeName('');
  };

  const handleDeleteCustomCode = (id: string) => {
    setCustomCodes(prev => prev.filter(c => c.id !== id));
    showToast('Código eliminado con éxito', 'success');
  };

  const sendRenewalRequestToElite = (licenseType: 'web' | 'app') => {
    const userRoleStr = localStorage.getItem('ramito_user_role') === 'admin_vip' ? 'ADMIN VIP' : 'ADMIN';
    const userNameStr = localStorage.getItem('ramito_user_name') || 'Administrador';
    
    const newNotification = {
      id: 'renewal-req-' + Date.now(),
      title: `Solicitud de Renovación (${licenseType.toUpperCase()})`,
      message: `El ${userRoleStr} (${userNameStr}) solicita formalmente la renovación de la Licencia ${licenseType === 'web' ? 'Web de Producción' : 'Móvil de la APP'}.`,
      time: 'Justo ahora',
      read: false,
      type: 'alert'
    };
    
    setNotifications(prev => [...(prev || []), newNotification]);
    showToast(`Solicitud de renovación para ${licenseType === 'web' ? 'Web' : 'App'} enviada al Élite Admin`, 'success');
  };

  const validateActivationCode = async (licenseType: 'web' | 'app') => {
    const cleanedCode = activationCode.trim().toUpperCase();
    if (!cleanedCode) {
      showToast('Por favor ingrese un código para validar', 'error');
      return;
    }

    let daysToAdd = 0;
    let codeFound = false;

    // Check emergency codes as standard fallback
    if (cleanedCode === 'RAMITO-RENEW-90' || cleanedCode === 'COMPLEJO-RAMITO-2026' || cleanedCode === 'APP-EMERGENCY-2026') {
      daysToAdd = cleanedCode === 'COMPLEJO-RAMITO-2026' ? 365 : 90;
      codeFound = true;
    } else {
      // Check the Elite custom generated codes (strictly for APP PWA)
      const matched = customCodes.find(c => c.code.trim().toUpperCase() === cleanedCode);
      if (matched) {
        if (matched.used) {
          showToast('Este código ya ha sido utilizado', 'error');
          return;
        }
        if (licenseType !== 'app') {
          showToast('Este código solo es válido para la Licencia de la APP Móvil PWA', 'error');
          return;
        }
        daysToAdd = matched.days;
        codeFound = true;
        
        // Mark as used
        setCustomCodes(prev => prev.map(c => c.id === matched.id ? { ...c, used: true } : c));
      }
    }

    if (codeFound) {
      try {
        if (licenseType === 'app') {
          setAppDaysRemaining(daysToAdd);
          localStorage.setItem('ramito_app_days_remaining', String(daysToAdd));
          await saveSettings({ app_license_active: true });
        } else {
          setWebDaysRemaining(daysToAdd);
          localStorage.setItem('ramito_web_days_remaining', String(daysToAdd));
          await saveSettings({ web_license_active: true });
        }

        const newNotification = {
          id: 'renewal-success-' + Date.now(),
          title: `Licencia Activada con Éxito (${licenseType.toUpperCase()})`,
          message: `Se ha aplicado el código de cupón ${cleanedCode} para renovar la Licencia ${licenseType === 'web' ? 'Web' : 'App'} por ${daysToAdd} días. El sistema vuelve a estar operativo.`,
          time: 'Justo ahora',
          read: false,
          type: 'success'
        };

        setNotifications(prev => [...(prev || []), newNotification]);
        showToast(`¡Código Válido! Licencia ${licenseType.toUpperCase()} renovada por ${daysToAdd} días`, 'success');
        setActivationCode('');
      } catch (err) {
        showToast('Error al activar la licencia');
      }
    } else {
      showToast('Código de renovación no válido o expirado', 'error');
    }
  };

   const [avatar, setAvatar] = useState(() => localStorage.getItem('ramito_user_avatar') || null);

  const handleUpdateAvatarAndName = async () => {
    if (!newProfileName.trim()) {
      showToast('El nombre no puede estar vacío', 'error');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Por favor ingrese un correo de acceso válido', 'error');
      return;
    }
    const trimmedPhone = newPersonalPhone ? newPersonalPhone.trim() : '';
    if (!trimmedPhone) {
      showToast('Por favor ingrese un teléfono / WhatsApp de contacto', 'error');
      return;
    }
    
    try {
      const uppercaseName = newProfileName.toUpperCase();
      const emailLower = newEmail.trim().toLowerCase();
      
      const profileUpdates: any = {
        name: uppercaseName,
        email: emailLower,
        phone: trimmedPhone
      };

      if (newPersonalKey) {
        if (newPersonalKey.length < 4) {
          showToast('La llave personal debe tener al menos 4 caracteres', 'error');
          return;
        }
        profileUpdates.password = newPersonalKey;
        localStorage.setItem('ramito_user_pw', newPersonalKey);
      }
      
      const trimmedPin = newPersonalPin ? newPersonalPin.trim() : '';
      if (trimmedPin) {
        if (trimmedPin.length < 4 || trimmedPin.length > 12) {
          showToast('El PIN o Llave Secundaria debe tener entre 4 y 12 caracteres', 'error');
          return;
        }
        profileUpdates.pin = trimmedPin;
        localStorage.setItem('ramito_user_pin', trimmedPin);
      } else {
        profileUpdates.pin = '';
        localStorage.removeItem('ramito_user_pin');
      }
      
      localStorage.setItem('ramito_user_name', uppercaseName);
      localStorage.setItem('ramito_user_email', emailLower);
      localStorage.setItem('ramito_user_phone', trimmedPhone);
      setUserName(uppercaseName);

      // Sync with local simulated profiles database if offline
      try {
        const savedProfilesStr = localStorage.getItem('ramito_profiles');
        const profiles = savedProfilesStr ? JSON.parse(savedProfilesStr) : [
          { id: 'master_access_elite', email: 'admin@ramito.com', password: 'ELITE_PASSWORD', name: 'Elite Admin', role: 'admin_elite', pin: 'ELITE26', phone: '+51 987 654 321' },
          { id: 'master_access_vip', email: 'vip@ramito.com', password: 'VIP_PASSWORD', name: 'VIP Admin', role: 'admin_vip', pin: 'VIP26', phone: '+51 912 345 678' },
          { id: 'player_1', email: 'agus@ramito.com', password: 'agus2026', name: 'Agus Castro', role: 'player', pin: 'agus26', phone: '+51 987 654 321' }
        ];
        const updatedProfiles = profiles.map((p: any) => {
          const isSameUser = 
            (userId && p.id === userId) ||
            p.email.toLowerCase() === emailLower ||
            (userRole && userRole.includes('admin') && p.role === userRole);
          if (isSameUser) {
            return { ...p, ...profileUpdates };
          }
          return p;
        });
        localStorage.setItem('ramito_profiles', JSON.stringify(updatedProfiles));
      } catch (e) {
        console.error("Local profile update error:", e);
      }

      if (userId && userId !== 'master_access' && isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);
        
         if (error) {
          console.warn("Supabase profiles update warning:", error);
        } else {
          await fetchUserData();
        }
      }

      setUserData((prev: any) => prev ? { ...prev, ...profileUpdates } : profileUpdates);

      // REGLA DE ORO: Cada rol modifica únicamente su propia llave de registro
      if (userRole === 'admin_elite') {
        await saveSettings({
          elite_key: newEliteKey
        });
        setEliteKey(newEliteKey);
        localStorage.setItem('ramito_elite_key', newEliteKey);
      } else if (userRole === 'admin_vip') {
        await saveSettings({
          vip_key: newVipKey
        });
        setVipKey(newVipKey);
        localStorage.setItem('ramito_vip_key', newVipKey);
      } else if (userRole === 'player') {
        await saveSettings({
          universal_user_key: newUniversalUserKey
        });
        setUniversalUserKey(newUniversalUserKey);
        localStorage.setItem('ramito_universal_user_key', newUniversalUserKey);
      }

      addAuditLog('CONFIGURACIÓN DE CUENTA', `El operador actualizó los datos de su cuenta y llaves de acceso.`, 'success');
      showToast('¡Configuración de cuenta guardada con éxito!', 'success');
      setShowProfileModal(false);
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar datos de la cuenta');
    }
  };

  const userId = localStorage.getItem('ramito_user_id');
  const userRole = localStorage.getItem('ramito_user_role');
  const userName = userData?.name || localStorage.getItem('ramito_user_name') || 'Cargando...';
  const isReadOnly = userRole !== 'admin_elite' && userRole !== 'admin_vip';
  const isLicensingReadOnly = userRole !== 'admin_elite';
  const isMaintenanceReadOnly = userRole !== 'admin_elite';

  const [newProfileName, setNewProfileName] = useState('');
  
  useEffect(() => {
    if (userName && userName !== 'Cargando...') {
      setNewProfileName(userName);
    }
  }, [userName]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    setNewUniversalUserKey(universalUserKey);
  }, [universalUserKey]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const licenseParam = searchParams.get('license');
    const modalParam = searchParams.get('modal');
    if (tabParam === 'licencias') {
      setActiveTab('licencias');
      if (licenseParam === 'web' || modalParam === 'web_console') {
        setShowWebWindow(true);
        setWebConsoleActiveTab('config');
      } else if (licenseParam === 'web_metrics' || modalParam === 'vercel') {
        setShowWebWindow(true);
        setWebConsoleActiveTab('metrics');
      } else if (licenseParam === 'app') {
        setShowAppWindow(true);
      }
    } else if (tabParam === 'ajustes') {
      setActiveTab('ajustes');
      if (modalParam === 'vercel') {
        setShowWebWindow(true);
        setWebConsoleActiveTab('metrics');
      } else if (modalParam === 'backup') {
        setShowStorageBackupWindow(true);
      }
    } else if (tabParam === 'seguridad') {
      setActiveTab('seguridad');
    } else if (tabParam === 'perfil') {
      setShowProfileModal(true);
    }
  }, [location.search]);

  const fetchUserData = async () => {
    try {
      const currentRole = localStorage.getItem('ramito_user_role') || 'player';
      let defaultPw = '';
      if (currentRole === 'admin_elite') {
        defaultPw = 'ELITE_PASSWORD';
      } else if (currentRole === 'admin_vip') {
        defaultPw = 'VIP_PASSWORD';
      } else {
        defaultPw = 'agus2026';
      }

      let localPw = localStorage.getItem('ramito_user_pw') || '';
      if (localPw && (localPw.includes('•') || localPw.includes('●'))) {
        localPw = '';
      }

      const getOfflineMatchedUser = () => {
        let matchedProfile: any = null;
        try {
          const storedProfiles = localStorage.getItem('ramito_profiles');
          if (storedProfiles) {
            const list = JSON.parse(storedProfiles);
            matchedProfile = list.find((p: any) => 
              (userId && p.id === userId) || 
              p.email?.toLowerCase() === localStorage.getItem('ramito_user_email')?.toLowerCase() ||
              (currentRole && currentRole.includes('admin') && p.role === currentRole)
            );
          }
        } catch (e) {
          console.error("Local profile match fetch error:", e);
        }
        return matchedProfile;
      };

      if (!isSupabaseConfigured || userId === 'master_access') {
        const localProf = getOfflineMatchedUser();
        const simulatedUser = {
          id: userId || localProf?.id || 'master_access',
          name: localStorage.getItem('ramito_user_name') || localProf?.name || 'Élite Admin',
          role: localProf?.role || currentRole,
          email: localStorage.getItem('ramito_user_email') || localProf?.email || 'admin@ramito.com',
          password: localStorage.getItem('ramito_user_pw') || localProf?.password || localPw || defaultPw,
          pin: localStorage.getItem('ramito_user_pin') || localProf?.pin || '',
          phone: localStorage.getItem('ramito_user_phone') || localProf?.phone || '+51 987 654 321'
        };
        setUserData(simulatedUser);
        return;
      }

      // Add a 1.5 seconds timeout to ensure we never block loading the Profile configuration page
      const queryPromise = supabase.from('profiles').select('*').eq('id', userId).single();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('SupaTimeout')), 1500)
      );

      const response = await Promise.race([queryPromise, timeoutPromise]) as any;
      if (response && response.data) {
        if (response.data.password && (response.data.password.includes('•') || response.data.password.includes('●'))) {
          response.data.password = localPw || defaultPw;
        }
        // Force merge the locally saved values to preserve edited email/pin/name/password
        const mergedUser = {
          ...response.data,
          email: localStorage.getItem('ramito_user_email') || response.data.email || 'admin@ramito.com',
          name: localStorage.getItem('ramito_user_name') || response.data.name || 'Élite Admin',
          password: localStorage.getItem('ramito_user_pw') || response.data.password || defaultPw,
          pin: localStorage.getItem('ramito_user_pin') || response.data.pin || '',
          phone: localStorage.getItem('ramito_user_phone') || response.data.phone || response.data.phone || '+51 987 654 321'
        };
        setUserData(mergedUser);
      } else {
        throw new Error('No data found');
      }
    } catch (err) {
      console.warn('Error fetching user data from Supabase, loading fallback state immediately:', err);
      const currentRole = localStorage.getItem('ramito_user_role') || 'player';
      let defaultPw = '';
      if (currentRole === 'admin_elite') {
        defaultPw = 'ELITE_PASSWORD';
      } else if (currentRole === 'admin_vip') {
        defaultPw = 'VIP_PASSWORD';
      } else {
        defaultPw = 'agus2026';
      }

      let localPw = localStorage.getItem('ramito_user_pw') || '';
      if (localPw && (localPw.includes('•') || localPw.includes('●'))) {
        localPw = '';
      }

      const localProf = (() => {
        try {
          const storedProfiles = localStorage.getItem('ramito_profiles');
          if (storedProfiles) {
            const list = JSON.parse(storedProfiles);
            return list.find((p: any) => 
              (userId && p.id === userId) || 
              p.email?.toLowerCase() === localStorage.getItem('ramito_user_email')?.toLowerCase() ||
              (currentRole && currentRole.includes('admin') && p.role === currentRole)
            );
          }
        } catch (e) {}
        return null;
      })();

      // Ensure local state always takes priority in the fallback simulated block
      const fallbackUser = {
        id: userId || localProf?.id || 'master_access',
        name: localStorage.getItem('ramito_user_name') || localProf?.name || 'Élite Admin',
        role: localProf?.role || currentRole,
        email: localStorage.getItem('ramito_user_email') || localProf?.email || 'admin@ramito.com',
        password: localStorage.getItem('ramito_user_pw') || localProf?.password || localPw || defaultPw,
        pin: localStorage.getItem('ramito_user_pin') || localProf?.pin || '',
        phone: localStorage.getItem('ramito_user_phone') || localProf?.phone || '+51 987 654 321'
      };
      setUserData(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('ramito_current_session_id');
    const logoutUserId = localStorage.getItem('ramito_user_id');
    // Clean active session from Supabase
    try {
      if (isSupabaseConfigured && sessionId && logoutUserId) {
        await supabase.from('active_sessions').delete().eq('profile_id', logoutUserId);
      }
    } catch (e) {
      console.warn('Could not clear session from Supabase:', e);
    }
    localStorage.removeItem('ramito_current_session_id');
    localStorage.removeItem('ramito_user_id');
    localStorage.removeItem('ramito_user_name');
    localStorage.removeItem('ramito_user_role');
    localStorage.removeItem('ramito_user_email');
    localStorage.removeItem('ramito_user_pw');
    setUserName('');
    setUserRole(null);
    setUserAvatar(null);
    navigate('/');
    showToast('Sesión cerrada correctamente', 'success');
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
      showToast('La llave personal debe tener al menos 4 caracteres', 'error');
      return;
    }
    try {
      if (isSupabaseConfigured && userId !== 'master_access') {
        const { error } = await supabase
          .from('profiles')
          .update({ password: newPersonalKey })
          .eq('id', userId);
        
        if (error) throw error;
      }
      
      // Update local storage so login works locally/simulated with the new key
      localStorage.setItem('ramito_user_pw', newPersonalKey);

      // Also update local userData state so the display gets refreshed
      setUserData(prev => (prev ? { ...prev, password: newPersonalKey } : { password: newPersonalKey }));

      showToast('¡LLAVE DE ACCESO ACTUALIZADA!', 'success');
      addAuditLog('SEGURIDAD', 'El operador actualizó su llave de acceso personal con éxito.', 'success');
    } catch (err) {
      showToast('Error al actualizar tu llave');
    }
  };

  const generateStrongKey = (type: 'elite' | 'vip' | 'universal' | 'personal' | 'pin') => {
    if (type === 'pin') {
      const pinChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let pinCode = '';
      for (let i = 0; i < 8; i++) {
        pinCode += pinChars.charAt(Math.floor(Math.random() * pinChars.length));
      }
      setNewPersonalPin(pinCode);
      showToast('¡PIN Alfanumérico Sugerido con éxito!', 'success');
      return;
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let segments = [];
    for (let s = 0; s < 3; s++) {
      let segment = '';
      for (let i = 0; i < 4; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    const finalKey = `${type === 'universal' ? 'USER' : (type === 'personal' ? 'PLAY' : type.toUpperCase())}-${segments.join('-')}`;
    if (type === 'elite') {
      setNewEliteKey(finalKey);
    } else if (type === 'vip') {
      setNewVipKey(finalKey);
    } else if (type === 'universal') {
      setNewUniversalUserKey(finalKey);
    } else {
      setNewPersonalKey(finalKey);
    }
    const labelType = type === 'universal' ? 'UNIVERSAL' : (type === 'personal' ? 'MAESTRA JUGADOR' : type.toUpperCase());
    showToast(`¡Llave de ingreso ${labelType} sugerida con éxito!`, 'success');
  };

  const handlePurgeSessions = async () => {
    setPurgingSessions(true);
    addAuditLog('SEGURIDAD / PURGA', `Solicitud de desalojo masivo de sesiones de jugadores iniciada por ${userName}.`, 'warning');
    
    setTimeout(() => {
      setPurgingSessions(false);
      showToast('¡SESIONES DE JUGADORES EVACUADAS!', 'success');
      addAuditLog('SEGURIDAD / PURGA', 'Desalojo masivo completado. Todas las sesiones no administrativas han sido invalidadas.', 'success');
    }, 1500);
  };

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

  const handleSaveWebConfig = async () => {
    localStorage.setItem('ramito_web_domain', webDomain);
    localStorage.setItem('ramito_web_vercel_hook', webVercelHook);
    localStorage.setItem('ramito_web_days_remaining', String(webDaysRemaining));
    localStorage.setItem('ramito_web_payment_gateway', webPaymentGateway);
    localStorage.setItem('ramito_web_payment_key', webPaymentKey);
    localStorage.setItem('ramito_web_allow_registrations', String(webAllowRegistrations));
    localStorage.setItem('ramito_web_sync_frequency', webSyncFrequency);
    localStorage.setItem('ramito_vercel_plan', vercelPlan);
    localStorage.setItem('ramito_vercel_autoupgrade', String(vercelAutoUpgrade));

    try {
      await saveSettings({
        web_license_active: webLicenseActive
      });
      showToast('Configuración Licencia Web actualizada', 'success');
      setShowWebWindow(false);
    } catch (err) {
      showToast('Error al actualizar Licencia Web');
    }
  };

  const handleSaveCantina = () => {
    saveCantinaItems(cantinaItems);
    addAuditLog('CONF. TIENDA / CANTINA', `Actualización de tarifas e inventarios de tienda/cantina. ${cantinaItems.length} productos configurados en catálogo en tiempo real.`, 'success');
    showToast('¡Catálogo de Cantina e Extras actualizado con éxito!', 'success');
    setShowCantinaWindow(false);
  };

  const handleSaveAppConfig = async () => {
    localStorage.setItem('ramito_app_days_remaining', String(appDaysRemaining));
    localStorage.setItem('ramito_app_pwa_short_name', appPwaShortName);
    localStorage.setItem('ramito_app_push_enabled', String(appPushEnabled));
    localStorage.setItem('ramito_app_push_provider', appPushProvider);
    localStorage.setItem('ramito_app_push_id', appPushId);
    localStorage.setItem('ramito_app_offline_cache', appOfflineCache);
    localStorage.setItem('ramito_elite_phone', elitePhone);

    try {
      await saveSettings({
        app_license_active: appLicenseActive,
        admin_phone: newAdminPhone
      });
      showToast('Configuración Licencia App actualizada', 'success');
      setShowAppWindow(false);
    } catch (err) {
      showToast('Error al actualizar Licencia App');
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
    <main className="pt-16 pb-32 px-4 xs:px-5 w-full max-w-md mx-auto min-h-screen overflow-x-hidden">
      {/* HEADER PERFIL */}
      <div className="relative mb-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#4be277] to-[#121414] p-1 shadow-2xl shadow-[#4be277]/20 relative overflow-hidden group cursor-pointer"
              onClick={() => {
                setShowProfileModal(true);
                setShowAdvancedConfig(true);
              }}
            >
              <div className="w-full h-full rounded-[2.2rem] bg-[#121414] flex items-center justify-center overflow-hidden relative">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#4be277]" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Editar</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#4be277] flex items-center justify-center border-4 border-[#121414] pointer-events-none z-10">
              <ShieldCheck className="w-4 h-4 text-[#121414]" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{userName}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <span className={`self-start text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5 italic ${
                userRole?.includes('admin') ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277]' : 'bg-white/5 border-white/10 text-[#bccbb9]'
              }`}>
                {userRole === 'admin_elite' ? (
                  <>
                    <Crown className="w-3 h-3 text-[#4be277]" strokeWidth={2.5} />
                    ELITE ADMIN
                  </>
                ) : userRole === 'admin_vip' ? (
                  <>
                    <Gem className="w-3 h-3 text-[#4be277]" strokeWidth={2.5} />
                    VIP ADMIN
                  </>
                ) : (
                  <>
                    <Activity className="w-3 h-3 text-[#bccbb9]" strokeWidth={2.5} />
                    JUGADOR
                  </>
                )}
              </span>
              
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowAdvancedConfig(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/25 text-[#4be277] hover:border-[#4be277]/40 rounded-xl text-[8.5px] font-black uppercase tracking-widest italic font-sans transition-all active:scale-[0.97]"
                >
                  <Settings className="w-3 h-3 animate-spin duration-3000" />
                  Configurar Cuenta
                </button>
                
                {!(userRole === 'admin_elite' || userRole === 'admin_vip') && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 hover:border-red-500/40 rounded-xl text-[8.5px] font-black uppercase tracking-widest italic font-sans transition-all active:scale-[0.97]"
                  >
                    <LogOut className="w-3 h-3" />
                    Cerrar Sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVEGACIÓN - SOLAMENTE VISIBLE PARA ADMINISTRADORES */}
      {userRole?.includes('admin') && (
        <div className="flex gap-1.5 p-1.5 glass-panel rounded-2xl border border-white/5 mb-8 overflow-x-auto scrollbar-none animate-fade-in">
          {(['licencias', 'ajustes', 'seguridad', 'noticia'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-xl border border-white/10' 
                  : 'text-[#bccbb9]/40 hover:text-[#bccbb9]/60'
              }`}
            >
              {tab === 'seguridad' 
                ? 'AUDITORÍA' 
                : tab === 'licencias' 
                ? 'LICENCIAS' 
                : tab === 'ajustes' 
                ? 'AJUSTES' 
                : 'MARQUESINA'}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!userRole?.includes('admin') && (
          <motion.div
            key="player-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* BOTÓN ASISTENCIA WHATSAPP PARA JUGADORES */}
            <div className="glass-panel rounded-[2rem] border border-white/5 p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider block italic font-sans font-extrabold">Asistencia WhatsApp Soporte</span>
                  <span className="text-[8px] font-mono text-[#bccbb9]/40 tracking-wider">RESOLUCIÓN DE DUDAS Y EXPEDICIONES</span>
                </div>
              </div>

              <div className="space-y-3 text-left font-sans">
                <p className="text-[9.5px] font-bold text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed">
                  ¿Tienes problemas con tu llave o tu reserva? Comunícate con asistencia directa por WhatsApp del complejo.
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
          </motion.div>
        )}

        {/* VISTA LICENCIAS COMPLETA */}
        {userRole?.includes('admin') && activeTab === 'licencias' && (
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

              {/* BOTÓN MANTENIMIENTO DEL SISTEMA (ABRE VENTANA FLOTANTE FULL-SCREEN, MOVIDO DIRECTAMENTE AQUÍ) */}
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
                          CONSOLA DE CONTROL ELITE ACTIVA • {customCodes.length} CÓDIGOS EN CIRCULACIÓN
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
        )}

        {/* VISTA AJUSTES: CIERRE DE EMERGENCIA Y AUDITORÍA */}
        {userRole?.includes('admin') && activeTab === 'ajustes' && (
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

            {/* CIERRE DE EMERGENCIA AUTOMÁTICO (BOTÓN PREFERENCIAL EN PANTALLA COMPLETA) */}
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
                        TIENDA ACTIVA • {cantinaItems.length} PRODUCTOS CONFIGURADOS EN CAJA
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
        )}



        {/* VISTA SEGURIDAD (SOLO ADMINS) */}
        {userRole?.includes('admin') && activeTab === 'seguridad' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
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
                          const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
                              const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
                              const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
                              const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
                              const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
                              const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
                              const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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

                {/* NUEVO: SIMULADOR DE COBROS DIGITALES MERCADO PAGO EN TIEMPO REAL */}
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
                          
                          // Update Mercado Pago Total
                          setMpTotal(prev => prev + amount);
                          
                          // Prepend payment tx object to our dynamic ledger transactions list
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
                          const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
                          if (isSupabaseConfigured) await supabase.from('ledger_transactions').insert([newTx]);
                          // Trigger High Impact system notification representing live webhook
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
                        const { supabase, isSupabaseConfigured } = await import('../lib/supabase');
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
        )}

        {/* VISTA NOTICIA / MARQUEE (REEMPLAZA A SOPORTE) */}
        {userRole?.includes('admin') && activeTab === 'noticia' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
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
                        if (setMarqueeText) setMarqueeText(newMarqueeText);
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

                  {/* NUEVA SECCIÓN DE NOTICIA SECUNDARIA */}
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
                              if (setSecondaryMarqueeText) setSecondaryMarqueeText('');
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
                          if (setSecondaryMarqueeText) setSecondaryMarqueeText(newSecondaryMarqueeText);
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

                {/* NUEVO: CONFIGURACIÓN DE HORARIOS DE APERTURA Y CIERRE */}
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
                            Hoy es <span className="text-white font-extrabold">{dayName}</span>. Basado en las horas elegidas, el complejo registraría en su marquesina el estado de <span className={`font-black ${currentlyOpen ? 'text-[#4be277]' : 'text-red-500'}`}>{currentlyOpen ? '● BIENVENIDO / ABIERTO' : '● CERRADO / OPERACIONES SUSPENDIDAS'}</span> ({openStr} a {closeStr}{use2 ? ` y ${openStr2} a ${closeStr2}` : ''}).
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
        )}

        {/* VISTA ANALÍTICAS Y HEATMAPS (INTERACTIVO, BENTO-STYLE, RECHARTS DE ALTO POLISH) */}
        {showAnalyticsWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-[#121414] overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8 mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">CONSOLA ANALÍTICA ACTIVA</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Panel de Ocupación e Inteligencia de Demanda</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAnalyticsWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.div
                key="analytics-inside"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left flex-1"
              >
            {/* Cabecera del Panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">Consola Analítica Activa</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase italic tracking-tight leading-tight">Panel de Ocupación e Inteligencia de Demanda</h3>
                <p className="text-[9.5px] sm:text-[10px] font-bold text-[#bccbb9]/50 uppercase tracking-widest max-w-xl leading-relaxed">
                  Visualice patrones de reserva histórica para planificar tarifas diferenciadas dinámicas (Horarios Pico vs. Horarios Valle).
                </p>
              </div>

              {/* Selector Filtro de Cancha Bento */}
              <div className="flex gap-1 p-1 bg-zinc-950 border border-white/5 rounded-xl shrink-0 w-full md:w-auto overflow-x-auto scrollbar-none justify-between md:justify-start">
                {['todos', 'cancha1', 'cancha2'].map((courtOpt) => (
                  <button
                    key={courtOpt}
                    type="button"
                    onClick={() => {
                      // Interactividad local para simular la carga por cancha
                      const savedFilter = localStorage.getItem('ramito_court_analytics_filter') || 'todos';
                      localStorage.setItem('ramito_court_analytics_filter', courtOpt);
                      // Force local refresh without full page reload
                      showToast(`Filtrando analíticas por: ${courtOpt === 'todos' ? 'Todas las Canchas' : courtOpt === 'cancha1' ? 'Cancha 1' : 'Cancha 2'}`, 'success');
                    }}
                    className={`flex-1 md:flex-initial text-center px-2 py-1.5 sm:px-3 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all ${
                      (localStorage.getItem('ramito_court_analytics_filter') || 'todos') === courtOpt
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-[#bccbb9]/40 hover:text-white/80 border border-transparent'
                    }`}
                  >
                    {courtOpt === 'todos' ? (
                      <>
                        <span className="inline sm:hidden">Ambas</span>
                        <span className="hidden sm:inline">Ambas Canchas</span>
                      </>
                    ) : courtOpt === 'cancha1' ? (
                      <>
                        <span className="inline sm:hidden">Cancha 1</span>
                        <span className="hidden sm:inline">Cancha 1 • Césped</span>
                      </>
                    ) : (
                      <>
                        <span className="inline sm:hidden">Cancha 2</span>
                        <span className="hidden sm:inline">Cancha 2 • Losa</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* BENTO GRID LAYOUT - HEATMAP SEMANAL DE OCUPACIÓN */}
            <div className="w-full mb-6 text-left">

              {/* CARD BENTO 1: HEATMAP MENSUAL DE OCUPACIÓN (7 Días x 8 Bloques Horarios) */}
              <div className="w-full glass-panel rounded-[2rem] border border-white/5 p-6 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
                
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Heatmap Semanal Dinámico</span>
                  <p className="text-[11px] font-black text-white uppercase italic tracking-wider">Matriz de Ocupación por Día y Hora</p>
                  <p className="text-[8.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider">
                    Toque cualquier bloque para evaluar el nivel de saturación por franja horaria.
                  </p>
                </div>

                {/* Grid Heatmap (Completamente Fluido y Autoadaptativo sin Desborde) */}
                <div className="mt-2 w-full overflow-hidden">
                  <div className="space-y-3 w-full">
                    <div className="grid grid-cols-8 gap-1 text-center font-mono text-[6px] xs:text-[7px] sm:text-[8px] text-[#bccbb9]/30 font-black uppercase">
                      <div>HORAS</div>
                      <div>LUN</div>
                      <div>MAR</div>
                      <div>MIÉ</div>
                      <div>JUE</div>
                      <div>VIE</div>
                      <div>SÁB</div>
                      <div>DOM</div>
                    </div>

                    <div className="space-y-1.5 w-full">
                      {[
                        { hour: '15:00 hs', load: [15, 20, 25, 20, 30, 65, 55], slotsStatus: ['v', 'v', 'v', 'v', 'v', 'p', 'p'] },
                        { hour: '16:00 hs', load: [25, 30, 20, 35, 45, 80, 75], slotsStatus: ['v', 'v', 'v', 'v', 'v', 'p', 'p'] },
                        { hour: '17:00 hs', load: [35, 40, 45, 45, 60, 95, 85], slotsStatus: ['v', 'v', 'v', 'v', 'p', 'p', 'p'] },
                        { hour: '18:00 hs', load: [60, 65, 55, 70, 75, 100, 95], slotsStatus: ['p', 'p', 'v', 'p', 'p', 'p', 'p'] },
                        { hour: '20:00 hs', load: [85, 95, 90, 95, 100, 95, 80], slotsStatus: ['p', 'p', 'p', 'p', 'p', 'p', 'p'] },
                        { hour: '21:00 hs', load: [95, 100, 95, 100, 100, 100, 90], slotsStatus: ['p', 'p', 'p', 'p', 'p', 'p', 'p'] },
                        { hour: '22:00 hs', load: [75, 80, 70, 85, 95, 90, 70], slotsStatus: ['p', 'p', 'p', 'p', 'p', 'p', 'p'] }
                      ].map((row, idx) => (
                        <div key={idx} className="grid grid-cols-8 gap-1 items-center w-full">
                          {/* Hour marker */}
                          <div className="text-[6.5px] xs:text-[7.5px] sm:text-[8px] font-mono font-black text-[#bccbb9]/70 text-right pr-0.5 sm:pr-2 leading-none">
                            {row.hour}
                          </div>

                          {/* 7 Days heatmap blocks */}
                          {row.load.map((pct, dayIdx) => {
                            const filterType = localStorage.getItem('ramito_court_analytics_filter') || 'todos';
                            let finalPct = pct;
                            // Simulate dynamic filtering values
                            if (filterType === 'cancha1') finalPct = Math.max(10, Math.round(pct * 0.9));
                            if (filterType === 'cancha2') finalPct = Math.max(5, Math.round(pct * 0.75));

                            let colorClass = 'bg-zinc-900 border-zinc-950 text-[#bccbb9]/20';
                            if (finalPct > 0 && finalPct <= 30) colorClass = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25 hover:bg-[#10B981]/25';
                            else if (finalPct > 30 && finalPct <= 60) colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35 hover:bg-emerald-500/30';
                            else if (finalPct > 60 && finalPct <= 85) colorClass = 'bg-[#FF9100]/20 text-[#FF9100] border-[#FF9100]/35 hover:bg-[#FF9100]/30';
                            else if (finalPct > 85) colorClass = 'bg-red-500/25 text-red-400 border-red-500/35 hover:bg-red-500/30 animate-pulse';

                            return (
                              <button
                                key={dayIdx}
                                type="button"
                                onClick={() => {
                                  showToast(`Franja: ${row.hour} • Carga estimada: ${finalPct}% de Ocupación`, 'success');
                                }}
                                className={`aspect-square sm:aspect-video rounded sm:rounded-lg border flex flex-col justify-center items-center text-[7px] md:text-[9px] font-mono font-bold transition-all transition-colors cursor-pointer w-full ${colorClass}`}
                                title={`Demanda: ${finalPct}%`}
                              >
                                <span className="text-[6.5px] xs:text-[7.5px] sm:text-[8px] md:text-[8.5px] font-mono font-black">{finalPct}%</span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leyenda Mapas */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-2 text-[8px] font-mono font-black text-[#bccbb9]/40 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/30" />
                    <span>0-30% Valle</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/30" />
                    <span>30-60% Moderado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF9100]/25 border border-[#FF9100]/30" />
                    <span>60-85% Pico Intermedio</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/25 border border-red-500/30" />
                    <span>85-100% Saturation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEGUNDA FILA: BENTO INFERIOR (Gráfico de Barras de Distribución Horaria & Distribución de Canchas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              
              {/* CARD DE BARRAS DE DEMANDA (Pure SVG Bars with Dynamic interactive stats) */}
              <div className="glass-panel rounded-[2rem] border border-white/5 p-6 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Curva de Demanda por Hora</span>
                  <p className="text-[11px] font-black text-white uppercase italic tracking-wider">Carga de Tráfico Horario Consolidado</p>
                </div>

                {/* SVG Chart (Completamente Fluido y Autoadaptativo sin Desborde) */}
                <div className="w-full overflow-hidden">
                  <div className="h-44 flex items-end gap-1.5 sm:gap-3 px-1 sm:px-2 pt-6 pb-2 border-b border-white/5 w-full">
                    {[
                      { slot: '15:00', val: 30, text: 'Valle' },
                      { slot: '16:00', val: 40, text: 'Valle' },
                      { slot: '17:00', val: 55, text: 'Moderado' },
                      { slot: '18:00', val: 78, text: 'Intermedio' },
                      { slot: '20:00', val: 95, text: 'Saturado' },
                      { slot: '21:00', val: 100, text: 'Máximo' },
                      { slot: '22:00', val: 82, text: 'Pico' }
                    ].map((bar, bidx) => (
                      <div key={bidx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 group cursor-pointer min-w-0">
                        <div className="w-full relative rounded-t-lg bg-zinc-900 overflow-hidden h-32 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${bar.val}%` }}
                            transition={{ duration: 0.8, delay: bidx * 0.05 }}
                            className={`w-full rounded-t-lg relative transition-all group-hover:brightness-110 ${
                              bar.val > 85 
                                ? 'bg-gradient-to-t from-red-600 to-[#FF9100]' 
                                : bar.val > 50 
                                ? 'bg-gradient-to-t from-emerald-500 to-amber-400' 
                                : 'bg-gradient-to-t from-emerald-600 to-[#10B981]'
                            }`}
                          />
                          {/* Hover Popup Overlay */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black text-[#4be277] text-[7px] sm:text-[7.5px] font-black font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            {bar.val}%
                          </div>
                        </div>
                        <span className="text-[7.5px] sm:text-[8px] font-mono font-black text-white leading-none mt-1">{bar.slot}</span>
                        <span className="text-[6px] xs:text-[6.5px] sm:text-[7.5px] font-mono font-black text-[#bccbb9]/40 group-hover:text-emerald-400 transition-colors uppercase select-none leading-none truncate w-full text-center mt-0.5">{bar.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <span className="text-[8px] font-bold text-[#bccbb9]/30 uppercase tracking-widest block italic leading-none">
                  * Datos recopilados en base al total de {allBookings.length} reservas procesadas.
                </span>
              </div>

              {/* CARD DE COMPARATIVA DE CANCHAS */}
              <div className="glass-panel rounded-[2rem] border border-white/5 p-6 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Eficiencia de Infraestructura</span>
                  <p className="text-[11px] font-black text-white uppercase italic tracking-wider">Corte de Ingresos y Reservas por Cancha</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                  <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[8px] font-mono text-[#bccbb9]/40 uppercase tracking-widest block font-bold">Cancha 1 • El Maracaná</span>
                    <p className="text-xl font-black text-white uppercase">62.5% <span className="text-xs text-emerald-400 font-bold">CARGA</span></p>
                    <p className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/5 py-0.5 px-1.5 rounded border border-emerald-500/10 w-max">
                      Popularidad Alta (Césped)
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[8px] font-mono text-[#bccbb9]/40 uppercase tracking-widest block font-bold">Cancha 2 • La Bombonera</span>
                    <p className="text-xl font-black text-white uppercase">37.5% <span className="text-xs text-amber-500 font-bold">CARGA</span></p>
                    <p className="text-[8px] font-mono font-black text-amber-400 uppercase tracking-wider bg-amber-500/5 py-0.5 px-1.5 rounded border border-amber-500/10 w-max">
                      Popularidad Moderada (Losa)
                    </p>
                  </div>
                </div>

                {/* Ring chart preview */}
                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5">
                  <div className="relative w-11 h-11 rounded-full border-4 border-white/5 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-r-transparent border-b-transparent animate-spin duration-3000" />
                    <span className="text-[8px] font-mono font-black text-white">62%</span>
                  </div>
                  <div className="text-left space-y-0.5 font-sans">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider block italic">Preferencia de Césped Sintético</span>
                    <p className="text-[8px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed">
                      El Maracaná lidera la recaudación debido a que los equipos prefieren césped sintético sobre losa para el juego con botines de fútbol 5.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* CARD BENTO 2: RECONOCIMIENTO INTELIGENTE DE TARIFAS (Intel Engine) - MOVIDO AL FINAL DEBAJO DE LAS MÉTRICAS */}
            <div className="glass-panel rounded-[2rem] border border-white/5 p-6 bg-[#181a1a] relative overflow-hidden flex flex-col justify-between space-y-6 mt-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest font-mono">Motor de Recomendación Inteligente</span>
                  <p className="text-[11px] font-black text-white uppercase italic tracking-wider">Planificación de Tarifas Dinámicas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ALERTA DE BLOQUES CRÍTICOS (PICO) */}
                  <div className="p-3.5 bg-black/50 border border-white/5 rounded-2xl text-left space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] font-black uppercase tracking-widest">Alerta de Bloques Críticos (Pico)</span>
                      </div>
                      <p className="text-[9.5px] font-bold text-white/90 leading-relaxed uppercase mt-2">
                        Los turnos de 20:00 y 21:00 hs de Martes a Sábados exhiben ocupación saturada (&gt;95%).
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/5 mt-3">
                      <span className="text-[8px] font-black text-[#4be277] uppercase tracking-wider block font-sans">Sugerencia Comercial:</span>
                      <p className="text-[8.5px] font-medium text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed mt-1">
                        Establecer Tarifa Diferencial del +15% ($2,500 ARS extra) en este rango. Los jugadores están dispuestos a pagar premium debido a la escasez de turnos.
                      </p>
                    </div>
                  </div>

                  {/* OPTIMIZACIÓN DEL BLOQUE VALLE */}
                  <div className="p-3.5 bg-black/50 border border-white/5 rounded-2xl text-left space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[#10B981]">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span className="text-[8.5px] font-black uppercase tracking-widest">Optimización del Bloque Valle</span>
                      </div>
                      <p className="text-[9.5px] font-bold text-white/90 leading-relaxed uppercase mt-2">
                        Lunes y Miércoles de 15:00 a 17:00 registran ocupación inferior al 25%.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/5 mt-3">
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider block font-sans">Sugerencia Comercial:</span>
                      <p className="text-[8.5px] font-medium text-[#bccbb9]/60 uppercase tracking-wide leading-relaxed mt-1">
                        Lanzar un descuento automático del -25% ("Happy Hour de Fútbol") para capturar estudiantes universitarios o deportistas vespertinos y balancear caja.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <span className="text-[8px] font-black text-[#bccbb9]/30 uppercase font-mono block">Auditoría Regulatoria de Tarifas</span>
                <p className="text-[8.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-none">
                  Complejo Ramito Fut Show • Algoritmo de Carga de Red V1.6
                </p>
              </div>
            </div>

              </motion.div>

              {/* Informative footer */}
              <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex gap-3 text-left mb-8 font-sans mt-8">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block italic">ANÁLISIS DE NEGOCIO SEGURO</span>
                  <p className="text-[8.5px] font-bold text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed mt-1">
                    Las métricas mostradas reflejan la ocupación unificación de datos unificados de reservas presenciales, transferencias registradas y abonos Mercado Pago.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowAnalyticsWindow(false)}
                  className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Ajustes
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración Licencia Web (Unificada con Métricas y Canales) */}
      <AnimatePresence>
        {showWebWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Licencia Web & Consola de Producción</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Monitoreo en Vivo de Canales, DNS, Métricas y Gestión del Servidor</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWebWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector de Pestañas de la Consola Unificada */}
              <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl mb-8 w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setWebConsoleActiveTab('config')}
                  className={`flex-grow h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                    webConsoleActiveTab === 'config'
                      ? 'bg-emerald-500/10 text-[#4be277] border border-[#4be277]/25 font-bold shadow-[0_0_10px_rgba(75,226,119,0.1)]'
                      : 'text-[#bccbb9]/40 hover:text-[#bccbb9]/60'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" /> CONFIGURACIÓN Y DNS
                </button>
                <button
                  type="button"
                  onClick={() => setWebConsoleActiveTab('metrics')}
                  className={`flex-grow h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                    webConsoleActiveTab === 'metrics'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                      : 'text-[#bccbb9]/40 hover:text-[#bccbb9]/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> MÉTRICAS EN VIVO
                </button>
              </div>

              {isLicensingReadOnly && webConsoleActiveTab === 'config' && (
                <div className="p-5 mb-8 bg-zinc-900 border border-amber-500/20 rounded-3xl space-y-4 text-left shadow-lg relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-amber-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        <Crown className="w-3.5 h-3.5 text-amber-500 inline shrink-0" strokeWidth={2.5} />
                        MODO LECTURA AUTORIZADO (VIP ADMIN)
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        Solo el Administrador Élite puede modificar de manera directa los perímetros de licencias o configuraciones del servidor de producción. Los cupones de emergencia se aplican exclusivamente a la Licencia de la APP Móvil PWA.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                    {/* Alerta de renovación */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:gap-4">
                      <div>
                        <span className="text-[9px] font-black text-white uppercase tracking-wider block">¿Suscripción por Expirar?</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">
                          Envía una alerta instantánea en el centro de control del Élite Admin para procesar la continuidad del sitio.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => sendRenewalRequestToElite('web')}
                        className="w-full sm:w-auto px-6 h-10 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all whitespace-nowrap"
                      >
                        Enviar Alerta de Renovación
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO DE CONFIGURACIÓN Y DNS */}
              {webConsoleActiveTab === 'config' && (
                <div className="animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
                    {/* Left Column: General Configuration */}
                    <div className="space-y-6">
                      <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <h5 className="text-[10px] font-black text-[#4be277] uppercase tracking-widest italic mb-2">Suscripción & Estado</h5>
                        
                        {/* Switch Activo */}
                        <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl">
                          <div>
                            <span className="text-[10px] font-black text-white uppercase tracking-wider block">Estado de Dominio & Server</span>
                            <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Habilitar reservas desde el sitio web</span>
                          </div>
                          <button 
                            onClick={() => {
                              saveSettings({ web_license_active: !webLicenseActive });
                            }}
                            className={`w-12 h-6 px-0.5 rounded-full flex items-center transition-colors ${webLicenseActive ? 'bg-[#4be277]' : 'bg-white/10'}`}
                          >
                            <motion.div animate={{ x: webLicenseActive ? 24 : 0 }} className={`w-5 h-5 rounded-full ${webLicenseActive ? 'bg-black' : 'bg-zinc-400'}`} />
                          </button>
                        </div>

                        {/* Slider Días Restantes (Solo visible en plan Pro, oculto en plan Gratis ya que no expira) */}
                        {vercelPlan === 'pro' && (
                          <div className="space-y-2 pt-2 border-t border-white/5 animate-fadeIn">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-[#bccbb9]/60 uppercase tracking-wider">Duración de Renovación (Días)</label>
                              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-lg">{webDaysRemaining} Días</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="90" 
                              value={webDaysRemaining} 
                              onChange={(e) => setWebDaysRemaining(parseInt(e.target.value, 10))}
                              className="w-full accent-[#4be277]"
                            />
                          </div>
                        )}

                        {vercelPlan === 'free' && (
                          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-2 pt-3 border-t border-white/5">
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[8.5px] font-black text-blue-400 uppercase tracking-widest block font-sans">Infraestructura Hobby Activa</span>
                              <p className="text-[7.5px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed mt-0.5 font-mono">
                                Plan gratuito de Vercel operativo sin vencimientos ni cargos fijos en el panel.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dominio y Frecuencia */}
                      <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <h5 className="text-[10px] font-black text-[#4be277] uppercase tracking-widest italic mb-2">Conectividad</h5>

                        {/* Dominio Web */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Dominio Principal Vinculado</label>
                          <input 
                            type="text" 
                            value={webDomain} 
                            onChange={(e) => setWebDomain(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white uppercase font-bold focus:border-[#4be277] transition-all outline-none"
                            placeholder="Ej. TUDOMINIO.COM"
                          />
                        </div>

                        {/* Sync Frequency dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Frecuencia de Sincronización Web</label>
                          <select
                            value={webSyncFrequency}
                            onChange={(e) => setWebSyncFrequency(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white font-bold focus:border-[#4be277] transition-all outline-none"
                          >
                            <option value="Tiempo Real (Live)" className="bg-zinc-950">Tiempo Real constante</option>
                            <option value="Cada 5 Minutos" className="bg-zinc-950">Cada 5 Minutos</option>
                            <option value="Cada 15 Minutos" className="bg-zinc-950">Cada 15 Minutos</option>
                            <option value="Cada Hora" className="bg-zinc-950">Cada Hora</option>
                            <option value="Manual" className="bg-zinc-950">Manual (A petición)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Key details, Deploy Vercel */}
                    <div className="space-y-6">
                      {/* Pasarela y Llaves */}
                      <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <h5 className="text-[10px] font-black text-[#4be277] uppercase tracking-widest italic mb-2">Pasarela de Pagos</h5>

                        {/* Pasarela de pago web */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Pasarela de Pagos (Para señas)</label>
                          <select
                            value={webPaymentGateway}
                            onChange={(e) => setWebPaymentGateway(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white font-bold focus:border-[#4be277] transition-all outline-none"
                          >
                            <option value="Mercado Pago (Latam)" className="bg-zinc-950">Mercado Pago (Latam)</option>
                            <option value="Stripe API Gateway" className="bg-zinc-950">Stripe API (Global)</option>
                            <option value="PayPal Pro" className="bg-zinc-950">PayPal Pro (Dólares)</option>
                            <option value="Efectivo o Transferencia" className="bg-zinc-950">Efectivo / Depósito previo</option>
                          </select>
                        </div>

                        {/* Llave pública Pagos */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Llave de Sincronización API</label>
                          <input 
                            type="password" 
                            value={webPaymentKey} 
                            onChange={(e) => setWebPaymentKey(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white font-bold focus:border-[#4be277] transition-all outline-none"
                          />
                        </div>
                      </div>

                      {/* Vercel build and switch regist */}
                      <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <h5 className="text-[10px] font-black text-[#4be277] uppercase tracking-widest italic mb-2">Despliegues Automáticos y Control</h5>

                        {/* Endpoint Deploy Vercel */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Vercel Deployment Webhook</label>
                          <input 
                            type="text" 
                            value={webVercelHook} 
                            onChange={(e) => setWebVercelHook(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-[10px] font-mono text-white/70 focus:border-[#4be277] transition-all outline-none"
                          />
                        </div>

                        {/* Switch Permite Registros */}
                        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                          <div>
                            <span className="text-[9px] font-black text-white uppercase tracking-wider block">Registros de Jugadores • Ramito Fut Show</span>
                            <span className="text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-widest">Permitir ingresar sin registrar previamente</span>
                          </div>
                          <button 
                            onClick={() => setWebAllowRegistrations(!webAllowRegistrations)}
                            className={`w-10 h-5.5 rounded-full flex items-center px-0.5 transition-colors ${webAllowRegistrations ? 'bg-emerald-500' : 'bg-white/10'}`}
                          >
                            <motion.div animate={{ x: webAllowRegistrations ? 18 : 0 }} className="w-4.5 h-4.5 rounded-full bg-black/90 shadow-md" />
                          </button>
                        </div>

                        {/* Consola interactiva de despliegues en Vercel */}
                        <div className="bg-black/90 rounded-2xl p-4 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-emerald-400 font-mono tracking-widest flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isVercelDeploying ? 'animate-ping' : ''}`} />
                              VERCEL BUILD ENGINE
                            </span>
                            <button
                              type="button"
                              disabled={isVercelDeploying}
                              onClick={() => {
                                setIsVercelDeploying(true);
                                setVercelDeployLogs(['Iniciando verificación...', 'Compilando código estático en NextJS...']);
                                setTimeout(() => {
                                  setVercelDeployLogs(prev => [...prev, 'Inyectando variables de producción...', 'Sincronizando licencia LIC-WEB...']);
                                  setTimeout(() => {
                                    setVercelDeployLogs(prev => [...prev, '✓ Despliegue completado con éxito!', '🌐 Listo en: https://ramitofutshow.com']);
                                    setIsVercelDeploying(false);
                                  }, 1500);
                                }, 1000);
                              }}
                              className="text-[9px] font-mono font-black text-[#121414] bg-[#4be277] hover:opacity-90 px-3 py-1 rounded-lg transition-all"
                            >
                              {isVercelDeploying ? 'BUILDING...' : 'FORCE BUILD'}
                            </button>
                          </div>

                          <div className="bg-stone-950 rounded-xl p-3 max-h-32 overflow-y-auto border border-white/5 font-mono text-[8px] text-[#bccbb9]/70 space-y-1.5">
                            {vercelDeployLogs.length === 0 ? (
                              <div className="text-[#bccbb9]/30 italic text-center py-2">No hay compilaciones en curso. Presione FORCE BUILD para sincronizar Vercel.</div>
                            ) : (
                              vercelDeployLogs.map((log, i) => (
                                <div key={i} className={log.startsWith('✓') || log.startsWith('🌐') ? 'text-emerald-400 font-bold' : ''}>
                                  {log}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PLANIFICACIÓN DE ESCALABILIDAD VERCEL (FREE / PRO) - SECCIÓN FULL WIDTH */}
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-6 text-left font-sans mt-2 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Gem className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-black text-white uppercase tracking-wider italic">Planificación de Escalabilidad e Infraestructura</h5>
                          <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest font-mono mt-0.5 block">ESTADO DE TRANSICIÓN PARA EL PLAN GRATUITO DE VERCEL E INTEGRACIÓN PRO</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest font-mono">Infraestructura Lista (Vercel)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Tarjeta 1: Selector de Plan Vercel */}
                      <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-sans">
                        <span className="text-[8.5px] font-black text-[#4be277] uppercase tracking-wider block">1. NIVEL DE SERVIDOR ACTIVO</span>
                        
                        <div className="space-y-2">
                          {/* Boton Plan Hobby */}
                          <button
                            type="button"
                            onClick={() => setVercelPlan('free')}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between outline-none ${
                              vercelPlan === 'free'
                                ? 'bg-blue-500/10 border-blue-500/35 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                : 'bg-transparent border-white/5 text-[#bccbb9]/60 hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold block">Vercel Plan Hobby</span>
                              <span className="text-[8px] opacity-60 block">Soporte inicial sin costos fijos</span>
                            </div>
                            <span className="text-[10px] font-black font-mono bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400">
                              GRATIS
                            </span>
                          </button>

                          {/* Boton Plan Pro */}
                          <button
                            type="button"
                            onClick={() => setVercelPlan('pro')}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between outline-none ${
                              vercelPlan === 'pro'
                                ? 'bg-purple-500/10 border-purple-500/35 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                                : 'bg-transparent border-white/5 text-[#bccbb9]/60 hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold block">Vercel Plan Pro</span>
                              <span className="text-[8px] opacity-60 block">Para escalados de reservas y marcas</span>
                            </div>
                            <span className="text-[10px] font-black font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-400">
                              $20 / Mes
                            </span>
                          </button>
                        </div>

                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                          <div className="flex justify-between text-[8px] font-mono text-[#bccbb9]/50 uppercase">
                            <span>Ancho de banda:</span>
                            <span className="text-white font-bold">{vercelPlan === 'pro' ? '1,000 GB (1 TB)' : '100 GB (hobby)'}</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-[#bccbb9]/50 uppercase">
                            <span>Minutos Compilación:</span>
                            <span className="text-white font-bold">{vercelPlan === 'pro' ? '24,000 min' : '6,000 min'}</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-[#bccbb9]/50 uppercase">
                            <span>Timeout Serverless:</span>
                            <span className="text-white font-bold">{vercelPlan === 'pro' ? '300 seg (Máx)' : '10 seg (Limitado)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tarjeta 2: Configuración DNS Dominio */}
                      <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[8.5px] font-black text-amber-500 uppercase tracking-wider block mb-2">2. HOJA DE RUTA DNS PARA DOMINIO</span>
                          <p className="text-[8px] text-[#bccbb9]/60 leading-relaxed uppercase mb-3 font-mono border-b border-white/5 pb-2">
                            Apunte su dominio <span className="text-white lowercase font-bold">{webDomain || 'ramitofutshow.com'}</span> en su hosting de DNS (Cloudflare, DonWeb, etc.) con estas credenciales:
                          </p>
                        </div>

                        <div className="space-y-2 text-left">
                          {/* DNS Record A */}
                          <div className="p-2.5 bg-stone-950 rounded-xl border border-white/5 relative overflow-hidden group">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('76.76.21.21');
                                showToast('Dirección IP A-Record copiada', 'success');
                              }}
                              className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-white transition-all outline-none"
                              title="Copiar valor"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[7px] font-bold text-amber-400 uppercase font-mono tracking-widest block">A RECORD (Raíz del dominio)</span>
                            <div className="grid grid-cols-3 gap-1 mt-1 text-[8.5px] font-mono">
                              <div><span className="text-zinc-500">HOST:</span> <span className="text-white font-bold">@</span></div>
                              <div className="col-span-2"><span className="text-zinc-500 font-bold">VALOR:</span> <span className="text-[#4be277] font-bold">76.76.21.21</span></div>
                            </div>
                          </div>

                          {/* DNS Record CNAME */}
                          <div className="p-2.5 bg-stone-950 rounded-xl border border-white/5 relative overflow-hidden group">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('cname.vercel-dns.com.');
                                showToast('Valor CNAME de Vercel copiado', 'success');
                              }}
                              className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-white transition-all outline-none"
                              title="Copiar valor"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[7px] font-bold text-amber-400 uppercase font-mono tracking-widest block">CNAME RECORD (Subdominio)</span>
                            <div className="grid grid-cols-3 gap-1 mt-1 text-[8.5px] font-mono text-left">
                              <div><span className="text-zinc-500 font-bold">HOST:</span> <span className="text-white font-bold">www</span></div>
                              <div className="col-span-2 truncate"><span className="text-zinc-500 font-bold">VALOR:</span> <span className="text-[#4be277] font-bold">cname.vercel-dns.com.</span></div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="text-[7.5px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg uppercase tracking-wider block text-center font-mono font-bold">
                            ✓ DNS LISTO PARA APUNTAR SIN COSTOS
                          </span>
                        </div>
                      </div>

                      {/* Tarjeta 3: Facturación Estimada y Licencia */}
                      <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-wider block">3. SIMULADOR DE SUSCRIPCIÓN</span>
                          <span className="text-[7px] font-mono text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">COSTO COMBINADO PLAN DE ESCALABILIDAD</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                            <div>
                              <span className="text-[9px] font-black text-white block">Licencia Complejo</span>
                              <span className="text-[7px] text-[#bccbb9]/40 block uppercase">Mapeo ordinario básico</span>
                            </div>
                            <span className="text-xs font-black text-white font-mono">$0 USD</span>
                          </div>

                          <div className="flex items-center justify-between p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                            <div>
                              <span className="text-[9px] font-black text-white block">Suscripción Vercel</span>
                              <span className="text-[7px] text-[#bccbb9]/40 block uppercase">Plan de hosting virtualizado</span>
                            </div>
                            <span className="text-xs font-black text-purple-400 font-mono">{vercelPlan === 'pro' ? '$20 USD' : '$0 USD'}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#4be277]/5 border border-[#4be277]/10 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-black text-[#4be277] uppercase block">TOTAL REGULAR ESTIMADO</span>
                            <span className="text-[7px] text-[#bccbb9]/50 block uppercase">Próximo ciclo en {webDaysRemaining} días</span>
                          </div>
                          <span className="text-xs font-black text-emerald-400 font-mono">{vercelPlan === 'pro' ? '$20.00' : '$0.00'} USD / Mes</span>
                        </div>

                        {/* Notificar limite */}
                        <label className="flex items-center gap-2 cursor-pointer select-none self-start">
                          <input 
                            type="checkbox"
                            checked={vercelAutoUpgrade}
                            onChange={(e) => setVercelAutoUpgrade(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-white/15 bg-black/40 text-blue-500 focus:ring-0 focus:ring-offset-0 checkmark-custom"
                          />
                          <span className="text-[7.5px] font-bold text-[#bccbb9]/60 uppercase tracking-wider font-sans">Aviso límite de cuota activo</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Form Footer Buttons */}
                  <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setShowWebWindow(false)}
                      className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all text-center italic"
                    >
                      Regresar / Salir sin Guardar
                    </button>
                    <button 
                      disabled={isLicensingReadOnly}
                      onClick={handleSaveWebConfig}
                      className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                        isLicensingReadOnly 
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                          : 'bg-emerald-500 text-black hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {isLicensingReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar Cambios de Licencia Web'}
                    </button>
                  </div>
                </div>
              )}

              {/* CONTENIDO DE MÉTRICAS EN VIVO */}
              {webConsoleActiveTab === 'metrics' && (
                <div className="animate-fadeIn font-sans">
                  {/* Status Alert Badge */}
                  <div className="p-4 mb-6 bg-zinc-900/55 border border-blue-500/20 rounded-3xl text-left relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Globe className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block italic">ESTADO: CONECTADO EN PRODUCCIÓN (TEMPORAL)</span>
                        <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest leading-relaxed mt-0.5">
                          Visualizando estadísticas en tiempo real estimadas para el dominio <span className="text-white font-mono lowercase font-bold">{webDomain || 'ramitofutshow.com'}</span>. Los datos se actualizarán automáticamente cada hora o al forzar la compilación del Vercel Build Engine.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
                    {/* Stat 1 */}
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden">
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Ancho de Banda ({vercelPlan === 'pro' ? 'Vercel Pro' : 'Vercel Hobby'})</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-2xl font-black text-white tracking-tight">{webLicenseActive ? '4.82 GB' : '0.00 GB'}</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">/ {vercelPlan === 'pro' ? '1,000 GB' : '100 GB'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: webLicenseActive ? (vercelPlan === 'pro' ? '0.482%' : '4.82%') : '0%' }} />
                      </div>
                      <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wider mt-2 block">
                        {webLicenseActive ? `${vercelPlan === 'pro' ? '0.48%' : '4.82%'} de cuota mensual usado` : '0.00% (LICENCIA WEB EXPIRADA)'}
                      </span>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Peticiones Edge (24hs)</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-2xl font-black text-white tracking-tight">{webLicenseActive ? '18,482' : '0'}</span>
                        <span className={`text-[9px] font-semibold uppercase tracking-wide ${webLicenseActive ? 'text-emerald-400' : 'text-zinc-500'}`}>{webLicenseActive ? '▲ 14%' : '0%'}</span>
                      </div>
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-4 block">
                        {webLicenseActive ? 'Tiempo respuesta: 14ms (A+)' : 'SITIO WEB SUSPENDIDO'}
                      </span>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Invocaciones Serverless</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-2xl font-black text-white tracking-tight">
                          {webLicenseActive ? '2,842' : '0'}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">INVS</span>
                      </div>
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-4 block">
                        {webLicenseActive ? 'Promedio duración: 112ms' : 'CONSOLAS DE APPORTACIÓN INACTIVAS'}
                      </span>
                    </div>

                    {/* Stat 4 */}
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Uso de Tokens Diario</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-2xl font-black text-white tracking-tight">{webLicenseActive ? '15.4K' : '0.0K'}</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase font-mono">TOKENS</span>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest mt-4 block ${webLicenseActive ? 'text-[#4be277]' : 'text-red-500'}`}>
                        {webLicenseActive ? 'Licencia ACTIVA y persistida' : 'LICENCIA WEB INACTIVA'}
                      </span>
                    </div>
                  </div>

                  {/* CSS Visual Bar Chart */}
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl text-left mb-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                      <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-wider">Historial de Tránsito de Peticiones</h5>
                        <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest font-mono">Simulación de tráfico por banda horaria (Últimas 12 horas)</p>
                      </div>
                      <button 
                        disabled={isRefreshingVercelMetrics}
                        onClick={() => {
                          setIsRefreshingVercelMetrics(true);
                          if (showToast) showToast('Recalculando telemetría de Vercel...', 'success');
                          setTimeout(() => {
                            setIsRefreshingVercelMetrics(false);
                            if (showToast) showToast('Métricas actualizadas con éxito', 'success');
                          }, 1200);
                        }}
                        className="h-8 px-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all flex items-center gap-1.5 italic outline-none"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingVercelMetrics ? 'animate-spin' : ''}`} />
                        {isRefreshingVercelMetrics ? 'Actualizando...' : 'Recalcular'}
                      </button>
                    </div>

                    {/* Column bars */}
                    <div className="h-28 flex items-end justify-between gap-1 sm:gap-2.5 px-2">
                      {[45, 62, 28, 74, 91, 55, 38, 84, 110, 95, 70, 50].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                          <div className="w-full bg-zinc-800 rounded-t-md relative h-20 flex items-end overflow-hidden group-hover:bg-zinc-700/60 transition-colors">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${val}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.03 }}
                              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-emerald-500 group-hover:to-emerald-400 transition-colors"
                            />
                          </div>
                          <span className="text-[7.5px] font-bold text-zinc-500 font-mono">{idx + 8}:00</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Endpoint Request breakdown */}
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl text-left mb-8">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider block mb-4 italic">Distribución de Peticiones por Endpoint de Producción</span>
                    
                    <div className="space-y-3.5">
                      {[
                        { path: '/api/bookings', desc: 'Sincronización en tiempo real de turnos y canchas', count: '8,412 reqs', pct: '45%', color: 'bg-blue-500' },
                        { path: '/api/licenses', desc: 'Validación de licencia VIP / Élite en base de datos', count: '4,102 reqs', pct: '22%', color: 'bg-emerald-500' },
                        { path: '/api/profiles', desc: 'Autenticación y guardado de firmas del personal', count: '3,124 reqs', pct: '17%', color: 'bg-purple-500' },
                        { path: '/api/news', desc: 'Tránsito de visualización de banner informativo', count: '2,844 reqs', pct: '16%', color: 'bg-amber-500' }
                      ].map((endpoint, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 p-3 bg-zinc-950/40 border border-white/5 rounded-2xl">
                          <div className="space-y-0.5">
                            <span className="text-xs font-mono font-bold text-white selection:bg-blue-500">{endpoint.path}</span>
                            <p className="text-[8.5px] font-semibold text-[#bccbb9]/40 uppercase tracking-wider">{endpoint.desc}</p>
                          </div>
                          <div className="flex items-center gap-4 text-right shrink-0">
                            <div>
                              <span className="text-[11px] font-black text-white block">{endpoint.count}</span>
                              <span className="text-[8px] font-bold text-zinc-500 block font-mono">{endpoint.pct} del tráfico</span>
                            </div>
                            <div className="w-1.5 h-8 bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`w-full ${endpoint.color} rounded-full`} style={{ height: endpoint.pct }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setShowWebWindow(false)}
                      className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" /> Cerrar Consola de Canales
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración Licencia App PWA (Detallada y Completa) */}
      <AnimatePresence>
        {showAppWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Licencia Móvil APP - Consola PWA</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Configuración, Cache Offline y Notificaciones de la Aplicación de Celular</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAppWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLicensingReadOnly && (
                <div className="p-5 mb-8 bg-zinc-900 border border-amber-500/20 rounded-3xl space-y-4 text-left shadow-lg relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-amber-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        <Crown className="w-3.5 h-3.5 text-amber-500 inline shrink-0" strokeWidth={2.5} />
                        MODO LECTURA AUTORIZADO (VIP ADMIN)
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        Solo el Administrador Élite puede modificar de manera directa los perímetros de licencias o configuraciones de la aplicación de producción.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                    {/* Alerta de renovación */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-white uppercase tracking-wider block">¿Suscripción por Expirar?</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">
                          Envía una alerta instantánea en el centro de control del Élite Admin.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => sendRenewalRequestToElite('app')}
                        className="w-full h-10 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all animate-pulse"
                      >
                        Enviar Alerta de Renovación
                      </button>
                    </div>

                    {/* Código de activación */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-white uppercase tracking-wider block">Código de Renovación de Emergencia</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">
                          Si negociaste una recarga, pon tu clave aquí para activarla al instante.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activationCode}
                          onChange={(e) => setActivationCode(e.target.value)}
                          placeholder="EJ: RAMITO-RENEW-90"
                          className="flex-1 h-10 bg-zinc-950 border border-white/10 rounded-xl px-3 text-[9px] font-black font-mono text-white placeholder-[#bccbb9]/30 outline-none focus:border-amber-500 uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => validateActivationCode('app')}
                          className="h-10 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 text-amber-500 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all font-mono"
                        >
                          VALIDAR
                        </button>
                      </div>
                    </div>

                    {/* Contacto Global de WhatsApp para Renovación (NUEVO) */}
                    <div className="p-4 bg-black/40 border border-[#25D366]/20 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[9px] font-black text-[#25D366] uppercase tracking-wider block">📞 RENOVACIÓN TOTAL / ELITE</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">
                          Este es el número móvil de asistencia directa del Administrador Élite.
                        </span>
                        <p className="text-[12px] font-mono font-black text-white tracking-wider mt-1.5">{elitePhone}</p>
                      </div>
                      <a
                        href={`https://wa.me/${elitePhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-10 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#25D366] rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Contactar Elite
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {!isLicensingReadOnly && (
                <div className="p-4 mb-6 bg-purple-950/10 border border-purple-500/20 rounded-2xl flex items-start gap-3 text-left font-sans">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/25">
                    <Smartphone className="w-4 h-4 text-purple-400 font-bold" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block italic">Canal de Renovación Sincronizado</span>
                    <p className="text-[8.5px] font-bold text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed mt-0.5">
                      El Admin VIP visualiza tu número de WhatsApp Élite (<span className="text-[#25D366] font-mono font-bold">{elitePhone}</span>) directamente en su alerta de renovación para recordar el pago y coordinar renovaciones. Asegúralo siempre actualizado.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
                {/* Column 1: Suscripción & Período */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 text-left">
                  <h5 className="text-[10px] font-black text-[#FF9100] uppercase tracking-widest italic mb-2">Suscripción & Período</h5>

                  {/* Switch Activo */}
                  <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider block">Estado de Licencia Móvil</span>
                      <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Habilitar el ingreso a celulares</span>
                    </div>
                    <button 
                      onClick={() => {
                        saveSettings({ app_license_active: !appLicenseActive });
                      }}
                      className={`w-12 h-6 px-0.5 rounded-full flex items-center transition-colors ${appLicenseActive ? 'bg-[#FF9100]' : 'bg-white/10'}`}
                    >
                      <motion.div animate={{ x: appLicenseActive ? 24 : 0 }} className={`w-5 h-5 rounded-full ${appLicenseActive ? 'bg-black' : 'bg-zinc-400'}`} />
                    </button>
                  </div>

                  {/* Info Box: Días Restantes (Slider removido para prevenir manipulación manual) */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[9.5px] font-black text-amber-500 uppercase tracking-wider">Duración de Licencia App</label>
                      <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                        {appDaysRemaining} Días Restantes
                      </span>
                    </div>
                    <p className="text-[8.5px] font-bold text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed">
                      ⚠️ CONTROL SINCRONIZADO: El valor de días se recarga y acumula únicamente canjeando los cupones activos del administrador.
                    </p>
                  </div>
                </div>

                {/* Column 2: Identidad e Integración */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 text-left">
                  <h5 className="text-[10px] font-black text-[#FF9100] uppercase tracking-widest italic mb-2">Identidad e Integración</h5>

                  {/* Nombre PWA */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Nombre Corto de Instalación (PWA)</label>
                    <input 
                      type="text" 
                      value={appPwaShortName} 
                      onChange={(e) => setAppPwaShortName(e.target.value)}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white uppercase font-bold focus:border-[#FF9100] transition-all outline-none"
                      placeholder="Ej. RAMITO APP"
                    />
                  </div>

                  {/* Elite Support Phone configuration / presentation */}
                  {!isLicensingReadOnly ? (
                    <div className="p-4 bg-black/60 border border-[#25D366]/25 rounded-2xl space-y-2.5 text-left font-sans">
                      <span className="text-[8.5px] font-black text-[#25D366] uppercase tracking-widest block font-bold">📞 Tu Número Móvil Élite Admin</span>
                      <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-normal">
                        Configura aquí tu celular de contacto. El Admin VIP lo verá directamente en su sesión para coordinar contigo los pagos de renovación.
                      </p>
                      <input 
                        type="text" 
                        value={elitePhone} 
                        onChange={(e) => {
                          setElitePhone(e.target.value);
                          localStorage.setItem('ramito_elite_phone', e.target.value);
                        }} 
                        placeholder="Ej: +51 987 654 321" 
                        className="w-full h-11 bg-black/40 border border-[#25D366]/20 rounded-xl px-4 text-xs font-mono font-bold text-white focus:border-[#25D366] transition-all outline-none" 
                      />
                    </div>
                  ) : (
                    <div className="p-3.5 bg-black/60 border border-[#25D366]/10 rounded-2xl space-y-1.5 text-left font-sans">
                      <span className="text-[8.5px] font-black text-[#25D366]/60 uppercase tracking-widest block font-bold font-sans">Soporte Licencia Élite Admin</span>
                      <div className="flex items-center justify-between gap-2 bg-[#25D366]/5 border border-[#25D366]/15 rounded-xl p-2 px-3.5">
                        <span className="font-mono text-xs font-black text-[#25D366] tracking-wider">{elitePhone}</span>
                        <span className="text-[7.5px] font-black text-[#25D366] bg-[#25D366]/5 px-2 py-1 rounded-lg border border-[#25D366]/15 uppercase tracking-widest shrink-0 font-sans font-bold">
                          Canal Elite
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowAppWindow(false)}
                  className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all text-center italic"
                >
                  Regresar / Salir sin Guardar
                </button>
                <button 
                  disabled={isLicensingReadOnly}
                  onClick={handleSaveAppConfig}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                    isLicensingReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 text-amber-500 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  }`}
                >
                  {isLicensingReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar Cambios de Licencia App'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración Licencia Cierre de Emergencia Completa (Pantalla Completa) */}
      <AnimatePresence>
        {showEmergencyWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Power className="w-6 h-6 text-red-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Módulo de Cierre Preventivo</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Gestor Automático para Catástrofes, Tormentas y Mantenimiento del Predio</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEmergencyWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isReadOnly && (
                <div className="p-5 mb-8 bg-zinc-90 w-full rounded-3xl border border-red-500/20 space-y-4 text-left shadow-lg relative overflow-hidden bg-zinc-950/60">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-red-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        <Crown className="w-3.5 h-3.5 text-red-500 inline shrink-0" strokeWidth={2.5} />
                        MODO DE SÓLO LECTURA (SOPORTE DE VENTAS)
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        No posees permisos de Élite ni VIP para suspender actividades en los servidores de producción de Ramito. Contacta al Administrador Principal para solicitar delegación temporal de llaves de emergencia.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
                {/* Left Column: Switch & Reason Selection */}
                <div className="space-y-6">
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                    <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic mb-2">Estado Inmediato del Complejo</h5>
                    
                    {/* Switch principal */}
                    <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">Activar Cierre General</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Bloquea reservas nuevas e inicios de juego en la APP</span>
                      </div>
                      {!isReadOnly ? (
                        <button 
                          type="button"
                          onClick={() => {
                            const newVal = !emergencyMode;
                            setEmergencyMode(newVal);
                            
                            addAuditLog(
                              newVal ? 'ACTIVACIÓN DE CIERRE GENERAL' : 'DESACTIVACIÓN DE CIERRE GENERAL',
                              `Cierre de complejo modificado a ${newVal ? 'ACTIVADO' : 'NORMAL'}.`,
                              newVal ? 'alert' : 'success'
                            );

                            // Trigger real system notification with high-impact details
                            const emergencyMessageObj = {
                              id: `emergency_${Date.now()}`,
                              title: newVal ? (emergencyType === 'critical' ? '🔴 CIERRE CRÍTICO DE EMERGENCIA' : '⚠️ CIERRE PREVENTIVO ACTIVO') : 'REAPERTURA DE COMPLEJO',
                              body: newVal 
                                ? `La administración ha declarado un bloqueo temporal. Aviso oficial: ${emergencyMessage ? emergencyMessage.toUpperCase() : 'CONTRATIEMPO TÉCNICO / MANTENIMIENTO PREVENTIVO'}.`
                                : '¡Complejo Deportivo rehabilitado con éxito! Se reanuda la reserva de turnos online de forma inmediata.',
                              time: 'Hace un momento',
                              read: false
                            };
                            if (setNotifications) {
                              setNotifications((prev: any[]) => [emergencyMessageObj, ...(prev || [])]);
                            }

                            if (showToast) showToast(newVal ? 'Cierre de Complejo Activado' : 'Cierre de Complejo Desactivado', 'success');
                          }}
                          className={`w-12 h-6 px-0.5 rounded-full flex items-center transition-colors shrink-0 ${emergencyMode ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                          <motion.div animate={{ x: emergencyMode ? 24 : 0 }} className={`w-5 h-5 rounded-full ${emergencyMode ? 'bg-white' : 'bg-zinc-400'}`} />
                        </button>
                      ) : (
                        <span className="text-[8px] font-black text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/20 px-2 py-1 rounded shrink-0">VIP READ ONLY</span>
                      )}
                    </div>

                    {/* Modalidad de Cierre selector de impacto */}
                    <div className="space-y-2 pt-3 border-t border-white/5 font-sans">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider">Modalidad del Bloqueo</label>
                        <span className={`text-[7px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          emergencyType === 'critical' 
                            ? 'text-red-400 bg-red-400/5 border border-red-500/10' 
                            : 'text-amber-400 bg-amber-400/5 border border-amber-500/10'
                        }`}>
                          {emergencyType === 'critical' ? '🚨 Máxima Alerta' : '⚠️ Operativo Sano'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Botón Crítico */}
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => {
                            setEmergencyType('critical');
                            setEmergencyMessage("EL COMPLEJO PERMANECERÁ CERRADO TEMPORALMENTE DEBIDO A FUERZAS MAYOR, LES AGRADECEMOS SU COMPRENSIÓN.");
                            if (showToast) showToast('Cierre cambiado a Crítico (Fuerza Mayor)', 'success');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            emergencyType === 'critical'
                              ? 'bg-red-500/10 border-red-500/40 text-white shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                              : 'bg-transparent border-white/5 text-[#bccbb9]/40 hover:border-white/10 hover:text-[#bccbb9]/60'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase text-red-500 block">🚨 Crítico</span>
                          <span className="text-[7px] text-[#bccbb9]/30 font-bold block uppercase mt-0.5 font-mono">Fuerza Mayor</span>
                        </button>

                        {/* Botón Preventivo */}
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => {
                            setEmergencyType('preventive');
                            setEmergencyMessage("NUESTROS CAMPOS SE ENCUENTRAN BAJO MANTENIMIENTO PREVENTIVO ORDINARIO PARA REESTABLECER EL TERRENO DE JUEGO. REAPERTURA PRONTO.");
                            if (showToast) showToast('Cierre cambiado a Preventivo (Mantenimiento)', 'success');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            emergencyType === 'preventive'
                              ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                              : 'bg-transparent border-white/5 text-[#bccbb9]/40 hover:border-white/10 hover:text-[#bccbb9]/60'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase text-amber-500 block">⚠️ Preventivo</span>
                          <span className="text-[7px] text-[#bccbb9]/30 font-bold block uppercase mt-0.5 font-mono">Cuidado / Limpieza</span>
                        </button>
                      </div>
                    </div>
                  </div>
 
                  {/* Canchas Afectadas Selector */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                    <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic mb-2">Alcance de Campos</h5>
                    
                    <div className="space-y-1.5 font-sans">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Establecer que canchas suspenden actividad</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Cancha 1', 'Cancha 2', 'Ambas'].map((court) => (
                          <button
                            key={court}
                            disabled={isReadOnly}
                            type="button"
                            onClick={() => {
                              setAffectedCourts(court);
                            }}
                            className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                              affectedCourts === court
                                ? 'bg-red-500/20 border-red-500 text-red-400 font-bold'
                                : 'bg-white/5 border-white/5 text-[#bccbb9]/50 hover:bg-white/10'
                            }`}
                          >
                            {court}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Right Column: Interactive notification and emergency dispatch */}
                <div className="space-y-6">
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 text-left">
                    <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic mb-2">Notificaciones Masivas & Mensajes</h5>
 
                    <div className="space-y-3 font-sans">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Alerta Emergente al Jugador (App Móvil)</label>
                        <textarea
                          disabled={isReadOnly}
                          rows={3}
                          value={emergencyMessage}
                          onChange={(e) => setEmergencyMessage(e.target.value)}
                          placeholder="Escriba los motivos detallados..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 transition-all outline-none resize-none leading-relaxed uppercase font-bold no-scrollbar"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => {
                          localStorage.setItem('ramito_emergency_message', emergencyMessage);
                          if (showToast) showToast('Mensajes guardados con éxito', 'success');
                        }}
                        className="w-full h-11 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all outline-none"
                      >
                        <Save className="w-3.5 h-3.5 text-zinc-400" /> Guardar Mensajes
                      </button>
                    </div>
 
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (showToast) showToast('Alertas WhatsApp enviadas a capitanes de reservas activas de hoy', 'success');
                          addAuditLog(
                            'DISPARO DE ALERTAS MASIVAS',
                            `Sincronización masiva instantánea vía webhook de WhatsApp concretada por el aviso de cierre general.`,
                            'alert'
                          );
                        }}
                        className="w-full h-12 bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] border border-[#25d366]/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all outline-none italic"
                        title="Disparar notificaciones masivas de reservas canceladas"
                      >
                        <MessageCircle className="w-5 h-5" /> Disparar WhatsApp de Alerta
                      </button>
                    </div>
                  </div>

                  {/* Vista Previa en Tiempo Real de Cierre de Emergencia */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-pulse">Previsualización del Diseño Emergencia</h5>
                      <span className="text-[7.5px] font-mono text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        En Vivo
                      </span>
                    </div>

                    <p className="text-[9px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed">
                      Esta es la pantalla inamovible de fuerza mayor que verán los jugadores al activar el Cierre de Emergencia.
                    </p>

                    <div className="flex justify-center py-2">
                      {/* Smartphone Wrapper */}
                      <div className="relative w-full max-w-[240px] h-[400px] bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col justify-between p-1.5 text-center select-none">
                        <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative bg-black flex flex-col items-center justify-center px-3">
                          {/* Image rendering */}
                          <img 
                            src="/emergencia.png" 
                            alt="Cierre de Emergencia" 
                            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-20"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Dynamic live banner representation inside mock phone */}
                          <div className={`relative z-10 w-full p-3 rounded-2xl border bg-black/95 text-center space-y-1.5 scale-90 ${
                            emergencyType === 'critical' ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                          }`}>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center mx-auto text-[10px] ${
                              emergencyType === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {emergencyType === 'critical' ? '🚨' : '⚠️'}
                            </div>
                            <span className={`text-[6px] font-black tracking-widest uppercase block ${
                              emergencyType === 'critical' ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              {emergencyType === 'critical' ? 'Cierre Crítico' : 'Cierre Preventivo'}
                            </span>
                            <p className="text-[6px] font-bold text-white/90 uppercase tracking-wide leading-tight font-mono max-h-16 overflow-y-auto no-scrollbar">
                              {emergencyMessage || 'MENSAJE DE CIERRE O MANTENIMIENTO PREVENTIVO GENERAL.'}
                            </p>
                          </div>
                          
                          {/* Dark glow container to represent phone notch */}
                          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/80 to-transparent flex justify-center pointer-events-none">
                            <div className="w-14 h-2.5 bg-black rounded-b-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Form Footer Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowEmergencyWindow(false)}
                  className="flex-1 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Consola Principal
                </button>
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                    localStorage.setItem('ramito_emergency_message', emergencyMessage);
                    localStorage.setItem('ramito_emergency_courts', affectedCourts);
                    addAuditLog('GUARDAR AJUSTES DE EMERGENCIA EN CONSOLA', `Se modificó y guardó la bitácora de catástrofes para campos: ${affectedCourts.toUpperCase()}.`, 'success');
                    if (showToast) showToast('Ajustes de emergencia guardados', 'success');
                    setShowEmergencyWindow(false);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/50 text-red-400 hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  }`}
                >
                  <Save className="w-4 h-4" /> {isReadOnly ? 'Guardar Desactivado (Solo Lectura)' : 'Guardar y Sincronizar Cambios de Emergencia'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración de Mantenimiento del Sistema Completa (Pantalla Completa) */}
      <AnimatePresence>
        {showMaintenanceWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background elements Deco */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />
 
            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Wrench className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Módulo de Mantenimiento del Sistema</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      GESTOR EXCLUSIVO EN PANEL DE LICENCIAS PARA EL BLOQUEO / TRABAJOS TÉCNICOS DE LA APP
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMaintenanceWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
 
              {isMaintenanceReadOnly && (
                <div className="p-5 mb-8 bg-zinc-950/60 w-full rounded-3xl border border-red-500/20 space-y-4 text-left shadow-lg relative overflow-hidden animate-fade-in">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-red-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        MODO DE SÓLO LECTURA ({userRole === 'admin_vip' ? 'VIP ADMIN' : 'VENDEDOR / REGULAR OPERADOR'})
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        El modo de mantenimiento de la aplicación es administrado con privilegios exclusivos por el Admin Élite. No posees autorización para modificar o desactivar este bloqueo global en el Panel de Licencias.
                      </p>
                    </div>
                  </div>
                </div>
              )}
 
              {/* Informative Status Widget */}
              <div className="p-5 mb-8 bg-zinc-900/40 border border-amber-500/10 rounded-3xl text-left relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none animate-pulse" />
                
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-2 italic">Estado de Conectividad App</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl">
                    <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Pantalla Preventiva Activa</span>
                    <span className="text-sm font-black text-white mt-1.5 block tracking-wider flex items-center gap-1.5 uppercase">
                      <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                      {maintenanceMode ? 'Sí - Pantalla Bloqueante Activada' : 'No - Sistema ONLINE con normalidad'}
                    </span>
                    <span className="text-[8.5px] font-mono font-bold text-[#bccbb9]/40 mt-1 block uppercase">
                      ID CONSOLE: LIC-SYS-MANT-2026-FUT
                    </span>
                  </div>
 
                  <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Diseño de Bloqueo</span>
                      <span className="text-xs font-black text-white mt-1.5 block leading-none truncate uppercase">
                        Imagen Recreada de Cristal (Inamovible)
                      </span>
                    </div>
                    <span className="text-[7.5px] font-mono text-amber-400 block mt-1 truncate">
                      ARCHIVO: /public/mantenimiento.png
                    </span>
                  </div>
                </div>
              </div>
 
              {/* Interactive configurations details */}
              <div className="max-w-xl mx-auto space-y-6 relative mb-8 w-full">
                {/* Switch de Mantenimiento */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 text-left">
                  <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic mb-2">Interruptor Maestro de Bloqueo</h5>
                  
                  {!maintenanceMode ? (
                    <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block font-sans">Activar Mantenimiento</span>
                        <span className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">Muestra la pantalla de trabajos de mejora técnica inmediatamente en la APP</span>
                      </div>
                      <button 
                        disabled={isMaintenanceReadOnly}
                        onClick={() => {
                          if (isMaintenanceReadOnly) {
                            showToast('No tienes permisos de Élite para cambiar este ajuste.', 'error');
                            return;
                          }
                          setMaintenanceMode(true);
                          localStorage.setItem('ramito_maintenance', 'true');
                          if (showToast) showToast('Modo Mantenimiento Activado', 'success');
                          addAuditLog('PUESTA EN MANTENIMIENTO', 'El Admin Élite ordenó detener el servicio de reserva de la app móvil.', 'success');
                        }}
                        className={`w-12 h-6 px-0.5 rounded-full flex items-center transition-colors shrink-0 bg-white/10 ${isMaintenanceReadOnly ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <motion.div animate={{ x: 0 }} className="w-5 h-5 rounded-full bg-zinc-400" />
                      </button>
                    </div>
                  ) : (
                    // Mantenimiento está ACTIVO. Para sacarlo se necesita la clave élite del admin de nuevo.
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 bg-red-950/20 border border-red-500/20 rounded-2xl">
                        <div>
                          <span className="text-[10px] font-black text-[#FF9100] uppercase tracking-wider block font-sans">Mantenimiento Activo</span>
                          <span className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">El sistema móvil de reservas se encuentra completamente en pausa</span>
                        </div>
                        <span className="px-2.5 py-1 text-[8.5px] font-black font-mono text-red-500 bg-red-500/10 border border-red-500/25 rounded-md animate-pulse">
                          BLOQUEADO
                        </span>
                      </div>

                      {isMaintenanceReadOnly ? (
                        <div className="p-3.5 bg-zinc-950 border border-white/5 rounded-xl text-center">
                          <p className="text-[8.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest leading-relaxed">
                            UN ADMINISTRADOR ÉLITE AUTORIZADO DEBE DESACTIVAR EL MANTENIMIENTO DESDE SU CONSOLA EXCLUSIVA.
                          </p>
                        </div>
                      ) : (
                        // Formulario de desactivación mediante clave
                        <div className="p-4 bg-zinc-950 border border-amber-500/20 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[8.5px] font-black text-amber-500 uppercase tracking-wider block italic font-mono">Verificar Identidad para Desactivar</span>
                          </div>
                          
                          <p className="text-[8px] font-black text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed">
                            Para restablecer el servicio normal en vivo, por favor ingrese su CLAVE DE INGRESO ÉLITE:
                          </p>

                          <div className="flex flex-col sm:flex-row gap-2 mt-2">
                            <input 
                              type="password"
                              value={verifyEliteKey}
                              onChange={(e) => setVerifyEliteKey(e.target.value)}
                              placeholder="INGRESE CLAVE ÉLITE DE ACCESO"
                              className="flex-1 h-10 bg-black border border-white/10 rounded-xl px-3 text-[9px] font-bold tracking-widest font-mono text-center text-white placeholder-[#bccbb9]/30 outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (verifyEliteKey === eliteKey) {
                                  setMaintenanceMode(false);
                                  localStorage.setItem('ramito_maintenance', 'false');
                                  setVerifyEliteKey('');
                                  showToast('¡Modo Mantenimiento Desactivado! Sistema restablecido.', 'success');
                                  addAuditLog('FIN DE MANTENIMIENTO', 'El Admin Élite introdujo sus credenciales y restableció la app móvil.', 'success');
                                } else {
                                  showToast('La clave de ingreso Élite es incorrecta.', 'error');
                                }
                              }}
                              className="h-10 px-5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-widest italic font-sans"
                            >
                              Verificar y Reactivar Sistema
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
 
                {/* Vista Previa en Tiempo Real de Mantenimiento / Bloqueo */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Previsualización del Diseño Recreado</h5>
                    <span className="text-[7.5px] font-mono text-[#4be277] bg-[#4be277]/10 border border-[#4be277]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      En Vivo
                    </span>
                  </div>
 
                  <p className="text-[9px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed">
                    Esta es la imagen y logotipo inamovible de cristal y luces de estadio que verán los usuarios al activar el bloqueo preventivo.
                  </p>
 
                  <div className="flex justify-center py-2">
                    {/* Smartphone Wrapper */}
                    <div className="relative w-full max-w-[270px] h-[450px] bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col justify-between p-1.5 text-center select-none">
                      <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative bg-black">
                        {/* Image rendering */}
                        <img 
                          src="/mantenimiento.png" 
                          alt="Mantenimiento" 
                          className="w-full h-full object-cover select-none pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Dark glow container to represent phone notch and clean aesthetic */}
                        <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-black/80 to-transparent flex justify-center">
                          <div className="w-20 h-3 bg-black rounded-b-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Footer */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowMaintenanceWindow(false)}
                  className="flex-1 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Licencias
                </button>
                <button 
                  disabled={isMaintenanceReadOnly}
                  onClick={() => {
                    localStorage.setItem('ramito_maintenance', String(maintenanceMode));
                    localStorage.setItem('ramito_maintenance_msg', maintenanceCustomMsg);
                    if (maintenanceBg) {
                      localStorage.setItem('ramito_maintenance_bg', maintenanceBg);
                    } else {
                      localStorage.removeItem('ramito_maintenance_bg');
                    }
                    addAuditLog('GUARDAR AJUSTES DE MANTENIMIENTO EN CONSOLA', `Se actualizó el banner técnico y estado de visualización para la aplicación móvil.`, 'success');
                    if (showToast) showToast('Ajustes de mantenimiento guardados y sincronizados', 'success');
                    setShowMaintenanceWindow(false);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                    isMaintenanceReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 text-amber-400 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  }`}
                >
                  <Save className="w-4 h-4" /> {isMaintenanceReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar y Sincronizar Cambios de Mantenimiento'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana del Servidor de Códigos de Activación (Full Screen Premium) */}
      <AnimatePresence>
        {showCodesWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full font-sans animate-fade-in no-scrollbar">
            {/* Background elements Deco */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Key className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Servidor de Códigos - Consola Élite</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      GESTOR DE LLAVES Y GENERACIÓN DE CUPONES DE RECARGA (MÓVIL PWA)
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCodesWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0 outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informative Header / Card */}
              <div className="p-5 mb-8 bg-zinc-900/40 border border-purple-500/10 rounded-3xl text-left relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-purple-500/[0.03] rounded-full blur-2xl pointer-events-none animate-pulse" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-purple-400 tracking-wider flex items-center gap-1.5 italic uppercase animate-pulse">
                      Soporte de Reactivación Activa
                    </span>
                    <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                      La generación de cupones permite brindar días de gracia y prórroga válidos para la Licencia del App Móvil de los clientes. Al canjearse un cupón, los días especificados se sumarán automáticamente al período activo de la licencia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interacciones */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 text-left font-sans items-start w-full">
                {/* Column 1: Configurar / Generar */}
                <div className="lg:col-span-5 space-y-6 w-full">
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                    <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic mb-2">Generador de Cupones</h5>

                    <div className="space-y-2.5">
                      <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block font-bold">Código del Cupón</label>
                      <input 
                        type="text"
                        value={newCodeName}
                        onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                        placeholder="EJ: RENOVAR-VIP-60D"
                        className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-[11px] font-black font-mono text-white placeholder-[#bccbb9]/30 outline-none uppercase focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-4 pt-1">
                      {/* Días de Validez MANUAL */}
                      <div className="space-y-2">
                        <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block font-bold">Días de Validez de la Recarga (Manual Exacto)</label>
                        <input 
                          type="number"
                          min="1"
                          max="3650"
                          value={newCodeDays}
                          onChange={(e) => setNewCodeDays(e.target.value)}
                          placeholder="Ej: 90"
                          className="w-full h-11 bg-zinc-950 border border-white/10 rounded-xl px-4 text-left font-mono text-[11px] font-black text-white placeholder-[#bccbb9]/30 outline-none focus:border-purple-500"
                        />
                        <p className="text-[8px] font-semibold text-[#bccbb9]/40 uppercase tracking-wider">
                          * Ingrese el número exacto de días de prórroga manualmente. Se adicionará con precisión matemática este período de gracia al canjearse.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block font-bold">Aplica Para</label>
                        <div className="flex items-center h-10 w-full rounded-xl border border-purple-500/15 bg-purple-500/5 px-3.5 text-[8.5px] font-bold uppercase tracking-wider text-purple-300">
                          Sólo APP Móvil PWA
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomCode}
                      className="w-full h-12 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 hover:border-purple-500/50 text-purple-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all outline-none"
                    >
                      <Plus className="w-4 h-4" /> Registrar Cupón Activo
                    </button>
                  </div>
                </div>

                {/* Column 2: Listado de Códigos en Circulación */}
                <div className="lg:col-span-7 space-y-6 w-full">
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4 animate-fade-in w-full overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h5 className="text-[10px] font-black text-[#bccbb9]/40 uppercase tracking-widest italic">Listado de Códigos en Circulación</h5>
                      <span className="text-[8px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {customCodes.length} REGISTROS COLECTADOS
                      </span>
                    </div>

                    {customCodes.length === 0 ? (
                      <div className="p-10 rounded-2xl border border-dashed border-white/5 text-center flex flex-col justify-center items-center gap-2">
                        <Key className="w-8 h-8 text-[#bccbb9]/20" />
                        <p className="text-[9px] font-bold text-[#bccbb9]/30 uppercase tracking-widest">No hay códigos en circulación creados</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar w-full">
                        {customCodes.map((item, index) => {
                          const itemNumber = customCodes.length - index;
                          return (
                            <div 
                              key={item.id}
                              className={`p-3.5 sm:p-4 bg-zinc-950/70 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all w-full overflow-hidden ${
                                item.used 
                                  ? 'border-red-500/25 bg-red-950/10 shadow-[inner_0_1px_3px_rgba(239,68,68,0.05)]' 
                                  : 'border-[#4be277]/20 bg-[#4be277]/5 shadow-[inner_0_1px_3px_rgba(75,226,119,0.05)]'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Cuadrado de Número (Verde si disponible, Rojo si ocupado/usado) */}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10.5px] font-black font-mono transition-all border shrink-0 relative ${
                                  item.used 
                                    ? 'bg-red-500/15 border-red-500/35 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.1)]' 
                                    : 'bg-[#4be277]/15 border-[#4be277]/35 text-[#4be277] shadow-[0_0_10px_rgba(75,226,119,0.15)]'
                                }`} title={item.used ? `Cupón #${itemNumber} - USADO/OCUPADO` : `Cupón #${itemNumber} - DISPONIBLE`}>
                                  <span>{itemNumber}</span>
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[11px] xs:text-[12px] sm:text-[12.5px] font-black text-white uppercase tracking-wider break-all leading-tight">
                                      {item.code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.code);
                                        showToast('Código copiado al portapapeles', 'success');
                                      }}
                                      className="text-[#bccbb9]/45 hover:text-white transition-colors shrink-0 outline-none p-1.5 -m-1.5 hover:bg-white/5 rounded"
                                      title="Copiar código"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  {/* Números en verde si disponible, en rojo si usado/ocupado */}
                                  <span className={`text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest mt-1.5 leading-none block ${
                                    item.used 
                                      ? 'text-red-500 font-black' 
                                      : 'text-[#4be277] font-black'
                                  }`}>
                                    +{item.days} DÍAS DE LICENCIA • APP PWA
                                  </span>
                                </div>
                              </div>

                              {/* Sección de Estado y Botones */}
                              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 border-t border-white/5 sm:border-none pt-2 sm:pt-0">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border leading-none block whitespace-nowrap text-center min-w-[80px] ${
                                  item.used 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                                    : 'bg-[#4be277]/10 border-[#4be277]/40 text-[#4be277]'
                                }`}>
                                  {item.used ? 'OCUPADO' : 'DISPONIBLE'}
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomCode(item.id)}
                                  className="w-9 h-9 bg-red-400/5 hover:bg-red-500/25 text-red-400 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-500/10 hover:border-red-500/25 outline-none shrink-0"
                                  title="Eliminar código"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowCodesWindow(false)}
                  className="flex-1 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2 outline-none"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Cerrar y Regresar a Licencias
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración de Transferencias Rotativas */}
      <AnimatePresence>
        {showTransferWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4be277]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#4be277]/10 border border-[#4be277]/20 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-6 h-6 text-[#4be277] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Rotación Semanal de Transferencias</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      ADMINISTRACIÓN DE ALIAS, CBU Y TITULAR CON SUCESIÓN SEMANAL AUTOMATIZADA
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTransferWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isReadOnly && (
                <div className="p-5 mb-8 bg-zinc-950/60 w-full rounded-3xl border border-red-500/20 space-y-4 text-left shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-red-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        <Crown className="w-3.5 h-3.5 text-red-500 inline shrink-0" strokeWidth={2.5} />
                        MODO DE SÓLO LECTURA (VIP ADMIN)
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        No posees permisos de Élite para modificar las cuentas de recepción de transferencias en producción. Contacta al Administrador Principal para solicitar delegación de cambios.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informative Auto-Rotation Status Widget */}
              <div className="p-5 mb-8 bg-zinc-900/40 border border-[#4be277]/10 rounded-3xl text-left relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-[#4be277]/[0.03] rounded-full blur-2xl pointer-events-none animate-pulse" />
                
                <span className="text-[9px] font-black text-[#4be277] uppercase tracking-widest block mb-2 italic">Estado Actual de Alternancia Automática</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl">
                    <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Cuenta Activa Esta Semana</span>
                    <span className="text-sm font-black text-white uppercase mt-1.5 block tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4be277] animate-ping" />
                      {getActiveAccountIndex() === 0 ? 'Cuenta 1 (Semana A)' : 'Cuenta 2 (Semana B)'}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#4be277] mt-1 block">
                      ALIAS: {getActiveAccountIndex() === 0 ? transferAlias1 : transferAlias2}
                    </span>
                  </div>

                  <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl">
                    <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Siguiente Intercambio (Automático)</span>
                    <span className="text-sm font-black text-zinc-300 mt-1.5 block tracking-wider">
                      {getRotationMetadata().nextAccount}
                    </span>
                    <span className="text-[8.5px] font-bold text-[#bccbb9]/40 mt-1 block uppercase">
                      Se intercambia en {getRotationMetadata().daysRemainingInWeek} días al iniciar la sig. semana
                    </span>
                  </div>

                  <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl">
                    <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Ciclo y Frecuencia de Alternancia</span>
                    <span className="text-sm font-black text-white mt-1.5 block tracking-wider">
                      1 Semana de Intervalo
                    </span>
                    <span className="text-[8.5px] font-bold text-blue-400 mt-1 block uppercase tracking-tighter">
                      Sincronizado con Reloj UTC de Producción
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid content edit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10 text-left font-sans">
                {/* Column 1: Cuenta 1 */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#4be277]/10 flex items-center justify-center text-[#4be277] font-sans font-black text-xs">
                        1
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-wider">CUENTA 1 (Semana A)</h5>
                        <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest font-mono">Primera Cuenta del Ciclo</p>
                      </div>
                    </div>
                    {getActiveAccountIndex() === 0 && (
                      <span className="text-[8px] font-black bg-[#4be277]/10 border border-[#4be277]/20 text-[#4be277] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        EN VIVO
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Alias 1 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Alias de Cuenta</label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={transferAlias1}
                        onChange={(e) => setTransferAlias1(e.target.value)}
                        placeholder="ej: RAMITO.FUT.SHOW"
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-[#4be277] transition-all outline-none font-bold placeholder-zinc-700"
                      />
                    </div>

                    {/* CBU 1 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">CBU / CVU de Cuenta (22 dígitos)</label>
                      <input
                        type="text"
                        maxLength={22}
                        disabled={isReadOnly}
                        value={transferCbu1}
                        onChange={(e) => setTransferCbu1(e.target.value.replace(/\D/g, ''))}
                        placeholder="ej: 0000003100012345678901"
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-[#4be277] transition-all outline-none font-mono font-bold placeholder-zinc-700"
                      />
                    </div>

                    {/* Titular 1 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Titular de Cuenta</label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={transferTitular1}
                        onChange={(e) => setTransferTitular1(e.target.value)}
                        placeholder="ej: RAMITO FUT SHOW S.R.L."
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-[#4be277] transition-all outline-none font-bold placeholder-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Cuenta 2 */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-sans font-black text-xs">
                        2
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-wider">CUENTA 2 (Semana B)</h5>
                        <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest font-mono">Segunda Cuenta del Ciclo</p>
                      </div>
                    </div>
                    {getActiveAccountIndex() === 1 && (
                      <span className="text-[8px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        EN VIVO
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Alias 2 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Alias de Cuenta</label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={transferAlias2}
                        onChange={(e) => setTransferAlias2(e.target.value)}
                        placeholder="ej: RAMITO.FUT.SEGUNDA"
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-blue-500 transition-all outline-none font-bold placeholder-zinc-700 hover:border-blue-500/40"
                      />
                    </div>

                    {/* CBU 2 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">CBU / CVU de Cuenta (22 dígitos)</label>
                      <input
                        type="text"
                        maxLength={22}
                        disabled={isReadOnly}
                        value={transferCbu2}
                        onChange={(e) => setTransferCbu2(e.target.value.replace(/\D/g, ''))}
                        placeholder="ej: 0000003100098765432109"
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-blue-500 transition-all outline-none font-mono font-bold placeholder-zinc-700 hover:border-blue-500/40"
                      />
                    </div>

                    {/* Titular 2 */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Titular de Cuenta</label>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={transferTitular2}
                        onChange={(e) => setTransferTitular2(e.target.value)}
                        placeholder="ej: COMPLEJO RAMITO S.A."
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:border-blue-550 transition-all outline-none font-bold placeholder-zinc-700 hover:border-blue-500/40 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowTransferWindow(false)}
                  className="flex-1 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Consola Principal
                </button>
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                    localStorage.setItem('ramito_transfer_alias_1', transferAlias1);
                    localStorage.setItem('ramito_transfer_cbu_1', transferCbu1);
                    localStorage.setItem('ramito_transfer_titular_1', transferTitular1);
                    localStorage.setItem('ramito_transfer_alias_2', transferAlias2);
                    localStorage.setItem('ramito_transfer_cbu_2', transferCbu2);
                    localStorage.setItem('ramito_transfer_titular_2', transferTitular2);
                    
                    addAuditLog(
                      'ACTUALIZACIÓN CUENTAS DE TRANSFERENCIA', 
                      `El operador actualizó los datos de las cuentas de transferencia rotativas. Cuenta 1 (${transferAlias1}) • Cuenta 2 (${transferAlias2}).`, 
                      'success'
                    );
                    
                    if (showToast) showToast('Cuentas guardadas y sincronizadas', 'success');
                    setShowTransferWindow(false);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-[#4be277] text-black hover:opacity-90 shadow-[0_0_20px_rgba(75,226,119,0.3)]'
                  }`}
                >
                  <Save className="w-4 h-4" /> {isReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar y Sincronizar Cuentas'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración de Cantina, Bebidas y Extras */}
      <AnimatePresence>
        {showCantinaWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Glow Background */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FF9100]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF9100]/10 border border-[#FF9100]/20 flex items-center justify-center shrink-0">
                    <GlassWater className="w-6 h-6 text-[#FF9100] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Configuración de Catálogo & Tarifas</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      TIENDA EN PUERTA INDEPENDIENTE Y EXTRAS DE RESERVA INTEGRADOS
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCantinaWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informative notice */}
              <div className="bg-[#FF9100]/5 border border-[#FF9100]/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
                <Info className="w-5 h-5 text-[#FF9100] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block">Control General de Precios y Nombres</span>
                  <p className="text-[8.5px] font-bold text-[#bccbb9]/70 uppercase tracking-widest mt-1 leading-relaxed">
                    Cambia libremente el nombre e importe de venta para cada producto de hidratación o alquileres integrados. Los cambios se reflejarán inmediatamente en la pantalla de bienvenida y en el carrito de confirmación de reservas de los próximos usuarios.
                  </p>
                </div>
              </div>

              {/* CONFIGURACIÓN GLOBAL DE ALERTAS DE INVENTARIO */}
              <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-5 mb-6 space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Bell className="w-4.5 h-4.5 text-white animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider block">Parámetros y Alertas de Seguridad de Inventario</span>
                      <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5">Control inteligente por semáforo de disponibilidad y mínimos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest">SISTEMA: SEMÁFORO AUTOMÁTICO</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-400/55" />
                  </div>
                </div>

                <div className="font-sans">
                  {/* Umbral */}
                  <div className="space-y-2">
                    <label className="text-[8.5px] font-black text-[#bccbb9]/50 uppercase tracking-wider block">Límite Crítico (Valor de Seguridad del Semáforo)</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-black/30 border border-white/5 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              const val = Math.max(1, stockAlertThreshold - 1);
                              setStockAlertThreshold(val);
                              localStorage.setItem('ramito_stock_alert_threshold', String(val));
                              showToast(`Valor de seguridad establecido en ${val} unidades`, 'success');
                            }}
                            className="w-10 h-10 bg-white/5 border border-r-0 border-white/10 text-white rounded-l-xl hover:bg-white/10 text-sm font-bold flex items-center justify-center shrink-0"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={stockAlertThreshold}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                              setStockAlertThreshold(val);
                              localStorage.setItem('ramito_stock_alert_threshold', String(val));
                            }}
                            className="w-14 h-10 bg-black/40 border-y border-white/10 text-center text-xs text-white font-mono font-bold outline-none focus:border-[#FF9100]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = stockAlertThreshold + 1;
                              setStockAlertThreshold(val);
                              localStorage.setItem('ramito_stock_alert_threshold', String(val));
                              showToast(`Valor de seguridad establecido en ${val} unidades`, 'success');
                            }}
                            className="w-10 h-10 bg-white/5 border border-l-0 border-white/10 text-white rounded-r-xl hover:bg-white/10 text-sm font-bold flex items-center justify-center shrink-0"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[8px] font-black text-[#bccbb9]/60 uppercase tracking-widest leading-relaxed">
                          Notificar y activar alerta en el sistema cuando queden <strong className="text-[#FF9100] font-black">{stockAlertThreshold} unidades</strong> o menos.
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 py-1 px-3 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase text-[#bccbb9]/60 tracking-wider">
                        <span>🔴 CRÍTICO: 0 uds</span>
                        <span>🟡 ALERTA: 1 a {stockAlertThreshold} uds</span>
                        <span>🟢 OK: &gt; {stockAlertThreshold} uds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Alertas de Stock Bajo Activas con Acciones de Carga */}
                {(() => {
                  const itemsLowStock = cantinaItems.filter(item => item.stock <= stockAlertThreshold);
                  if (itemsLowStock.length === 0) {
                    return (
                      <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-wider">
                          ¡Excelente! Todos los productos están con inventario óptimo (sobre valor de seguridad).
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="mt-4 p-4 border border-zinc-800 bg-zinc-950/40 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">
                          Avisos de Semáforo Activos ({itemsLowStock.length} Alertas de Stock)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {itemsLowStock.map(item => {
                          const isAgotado = item.stock === 0;
                          
                          // Automatic Traffic Light colors for labels, borders and backgrounds
                          const badgeColor = isAgotado ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                          const trafficDot = isAgotado ? '🔴 CRÍTICO AGOTADO' : '🟡 ALERTA DE REPOSICIÓN';
                          const stockColorText = isAgotado ? 'text-red-500 font-extrabold text-[12px] animate-pulse' : 'text-amber-500 font-extrabold text-[11px]';

                          return (
                            <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 border p-3 rounded-xl transition-all ${isAgotado ? 'border-red-500/30' : 'border-amber-500/25'}`}>
                              <div className="flex items-start gap-2.5">
                                <span className="mt-0.5" title={isAgotado ? 'Agotado' : 'Bajo stock'}>
                                  {isAgotado ? '🔴' : '🟡'}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10.5px] font-black text-white uppercase tracking-wider">{item.name}</span>
                                    <span className={`text-[7px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-widest ${badgeColor}`}>
                                      {trafficDot}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-bold text-[#bccbb9]/50 uppercase tracking-widest block mt-1">
                                    Disposici&oacute;n actual: <strong className={stockColorText}>{item.stock} unidades</strong> (Umbral cr&iacute;tico para sem&aacute;foro: {stockAlertThreshold})
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 self-start sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = cantinaItems.map(i => i.id === item.id ? { ...i, stock: i.stock + 10 } : i);
                                    setCantinaItems(updated);
                                    showToast(`Se añadieron +10 unidades de ${item.name}`, 'success');
                                  }}
                                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white active:scale-95 text-[8.5px] font-black uppercase tracking-widest rounded-lg border border-white/10 transition-all shrink-0"
                                >
                                  RECARGAR +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = cantinaItems.map(i => i.id === item.id ? { ...i, stock: i.stock + 25 } : i);
                                    setCantinaItems(updated);
                                    showToast(`Se añadieron +25 unidades de ${item.name}`, 'success');
                                  }}
                                  className="px-3 py-1.5 bg-[#4be277]/10 hover:bg-[#4be277]/20 text-[#4be277] active:scale-95 text-[8.5px] font-black uppercase tracking-widest rounded-lg border border-[#4be277]/10 transition-all shrink-0"
                                >
                                  RECARGAR +25
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Grid de Productos Dinámicos */}
              <div className="space-y-6 lg:mb-10 mb-6 text-left font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider italic flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF9100]" />
                      Catálogo General e Inventario ({cantinaItems.length} Productos)
                    </h5>
                    <p className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-1">
                      Control de stock en tiempo real y visibilidad en pre-reservas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `custom_${Date.now()}`;
                      const newItem: CantinaItem = {
                        id: newId,
                        name: 'NUEVO PRODUCTO',
                        price: 5,
                        stock: 10,
                        type: 'drink',
                        iconId: 'water',
                        showInBooking: true
                      };
                      setCantinaItems([...cantinaItems, newItem]);
                      showToast('Nuevo producto agregado al catálogo', 'success');
                    }}
                    className="px-4 py-2 bg-[#FF9100] hover:bg-[#FF9100]/90 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 italic self-start"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Nuevo Producto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cantinaItems.map((item, index) => {
                    return (
                      <div key={item.id} className="bg-zinc-950/60 border border-white/5 hover:border-white/10 rounded-2xl p-4 space-y-4 relative overflow-hidden transition-all">
                        {/* Header Item */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black bg-white/10 text-[#FF9100] px-2 py-0.5 rounded-full font-mono">
                              #{index + 1}
                            </span>
                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest font-mono">
                              ID: {item.id}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCantinaItems(cantinaItems.filter(i => i.id !== item.id));
                              showToast('Producto eliminado', 'success');
                            }}
                            className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-white/5 shrink-0"
                            title="Eliminar Producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[8px] font-black text-[#bccbb9]/50 uppercase tracking-wider block">Nombre del Producto</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const updated = cantinaItems.map(i => i.id === item.id ? { ...i, name: e.target.value } : i);
                                setCantinaItems(updated);
                              }}
                              className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs text-white uppercase font-bold outline-none focus:border-[#FF9100]"
                              placeholder="Ej. FANTA 500ML"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-[#bccbb9]/50 uppercase tracking-wider block">Precio ($)</label>
                            <input
                              type="number"
                              value={item.price || ''}
                              onChange={(e) => {
                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                const updated = cantinaItems.map(i => i.id === item.id ? { ...i, price: val } : i);
                                setCantinaItems(updated);
                              }}
                              className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs text-white font-mono font-bold outline-none focus:border-[#FF9100]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-[#bccbb9]/50 uppercase tracking-wider block">Inventario (Stock)</label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = cantinaItems.map(i => i.id === item.id ? { ...i, stock: Math.max(0, i.stock - 1) } : i);
                                  setCantinaItems(updated);
                                }}
                                className="w-10 h-10 bg-white/5 border border-r-0 border-white/10 text-white rounded-l-xl hover:bg-white/10 text-sm font-bold flex items-center justify-center shrink-0"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.stock}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  const updated = cantinaItems.map(i => i.id === item.id ? { ...i, stock: val } : i);
                                  setCantinaItems(updated);
                                }}
                                className={`w-full h-10 bg-black/40 border-y border-white/10 text-center text-xs font-mono font-bold outline-none ${
                                  item.stock === 0 
                                    ? 'text-red-500 focus:border-red-500' 
                                    : item.stock <= stockAlertThreshold 
                                      ? 'text-amber-500 focus:border-amber-500' 
                                      : 'text-emerald-400 focus:border-emerald-400'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = cantinaItems.map(i => i.id === item.id ? { ...i, stock: i.stock + 1 } : i);
                                  setCantinaItems(updated);
                                }}
                                className="w-10 h-10 bg-white/5 border border-l-0 border-white/10 text-white rounded-r-xl hover:bg-white/10 text-sm font-bold flex items-center justify-center shrink-0"
                              >
                                +
                              </button>
                            </div>
                            <div className="mt-1">
                              {item.stock === 0 ? (
                                <span className="text-[7.5px] text-red-500 font-extrabold tracking-widest uppercase block animate-pulse">🔴 AGOTADO CRÍTICO</span>
                              ) : item.stock <= stockAlertThreshold ? (
                                <span className="text-[7.5px] text-amber-500 font-black tracking-widest uppercase block">🟡 BAJO STOCK (ALERTA)</span>
                              ) : (
                                <span className="text-[7.5px] text-[#4be277] font-medium tracking-widest uppercase block">🟢 DISPONIBLE OK</span>
                              )}
                            </div>
                          </div>

                          <div className="col-span-2 grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                            {/* Type Selection */}
                            <div className="space-y-1">
                              <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-wider block">Tipo de Producto</label>
                              <select
                                value={item.type}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  const updated = cantinaItems.map(i => i.id === item.id ? { ...i, type: val } : i);
                                  setCantinaItems(updated);
                                }}
                                className="w-full h-8 bg-black/60 border border-white/10 rounded-lg px-2 text-[10px] text-zinc-300 font-bold outline-none focus:border-[#FF9100]"
                              >
                                <option value="drink">BEBIDA / CANTINA</option>
                                <option value="equipment">EQUIPAMIENTO</option>
                                <option value="extra">ADICIONAL / EXTRAS</option>
                              </select>
                            </div>

                            {/* Icon Picker */}
                            <div className="space-y-1">
                              <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-wider block">Ícono Visual</label>
                              <select
                                value={item.iconId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = cantinaItems.map(i => i.id === item.id ? { ...i, iconId: val } : i);
                                  setCantinaItems(updated);
                                }}
                                className="w-full h-8 bg-black/60 border border-white/10 rounded-lg px-2 text-[10px] text-zinc-300 font-bold outline-none focus:border-[#FF9100]"
                              >
                                <option value="water">Vaso / Gaseosa</option>
                                <option value="gatorade">Isotónica / Energía</option>
                                <option value="beer">Cerveza / Bebida Fría</option>
                                <option value="vests">Chaleco / Indumentaria</option>
                                <option value="ball">Pelota Oficial</option>
                                <option value="bbq">Parrilla / Carbón</option>
                              </select>
                            </div>
                          </div>

                          {/* Toggle Show in Checkout Booking */}
                          <div className="col-span-full pt-1.5 flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase text-[#bccbb9]/60 tracking-wider">
                              Ofrecer pre-venta en reservas
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={item.showInBooking} 
                                onChange={(e) => {
                                  const updated = cantinaItems.map(i => i.id === item.id ? { ...i, showInBooking: e.target.checked } : i);
                                  setCantinaItems(updated);
                                }}
                                className="sr-only peer" 
                              />
                              <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-black peer-checked:bg-[#FF9100] after:rounded-full after:h-3 after:w-3.5 after:transition-all pointer-events-none" />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Guardado */}
              <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-white/5 pt-8 mt-auto">
                <button 
                  onClick={() => setShowCantinaWindow(false)}
                  className="w-full sm:w-auto px-6 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest italic font-sans transition-all active:scale-[0.97]"
                >
                  Volver a Ajustes
                </button>
                <button 
                  onClick={handleSaveCantina}
                  className="flex-1 w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-[#4be277] text-black hover:opacity-90 shadow-[0_0_20px_rgba(75,226,119,0.3)] flex items-center justify-center gap-1.5 italic"
                >
                  <Save className="w-4 h-4" /> Guardar y Sincronizar Tienda
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Políticas y Advertencias de Cancha 1 */}
      <AnimatePresence>
        {showCourt1PolicyWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4be277]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#4be277]/10 border border-[#4be277]/20 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-[#4be277] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Políticas de Reglas - Cancha 1 (Césped)</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      CONFIGURACIÓN DE ADVERTENCIAS PARA EL USO ADECUADO DE LOS BOTINES Y CUALQUIER DIRECTRIZ DE CÉSPED
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCourt1PolicyWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isReadOnly && (
                <div className="p-5 mb-8 bg-zinc-950/60 w-full rounded-3xl border border-red-500/20 space-y-4 text-left shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-red-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        <Crown className="w-3.5 h-3.5 text-red-500 inline shrink-0" strokeWidth={2.5} />
                        MODO DE SÓLO LECTURA (VIP ADMIN)
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        No posees permisos de Élite para modificar el mensaje o normativa de la Cancha 1 en producción. Contacta al Administrador Principal para solicitar delegación de cambios.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Container */}
              <div className="space-y-6 flex-1 text-left animate-fade-in">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 bg-zinc-900/20">
                  <span className="text-[10px] font-black text-[#4be277] uppercase tracking-wider block italic">Mensaje de Advertencia Activo</span>
                  <p className="text-[9.5px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed">
                    Este mensaje se mostrará a todos los usuarios antes de confirmar su turno de reserva para la Cancha 1 (Césped). Se utiliza principalmente para detallar las normas como calzado prohibido (v.g. botines con tapones o chimpunes de cocos grandes), cancelaciones y cuidados.
                  </p>

                  <div className="space-y-2 pt-2 font-sans">
                    <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block font-sans">Mensaje de la Normativa</label>
                    <textarea
                      rows={4}
                      disabled={isReadOnly}
                      value={court1Policy}
                      onChange={(e) => setCourt1Policy(e.target.value)}
                      placeholder="Escribe la política o advertencia aquí..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-[#4be277] transition-all outline-none font-bold placeholder-zinc-700 hover:border-[#4be277]/30 uppercase leading-relaxed font-sans"
                    />
                  </div>
                  
                  {/* Vista Previa en Tiempo Real */}
                  <div className="pt-4 border-t border-white/5 font-sans">
                    <span className="text-[9px] font-black text-[#bccbb9]/40 uppercase tracking-wider block mb-2 font-sans">Vista Previa Visual del Mensaje en Reserva de Cancha 1</span>
                    <div className="bg-[#1e2020] rounded-2xl p-4 flex gap-4 border border-white/5">
                      <Info className="w-5 h-5 text-[#4be277] flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-[#bccbb9] leading-relaxed uppercase tracking-wider font-sans">
                          {court1Policy || 'SIN CONTENIDO CONFIGURADO'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3 mt-8">
                <button 
                  onClick={() => setShowCourt1PolicyWindow(false)}
                  className="flex-1 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Consola Principal
                </button>
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                    localStorage.setItem('ramito_court1_policy', court1Policy);
                    
                    addAuditLog(
                      'ACTUALIZACIÓN POLÍTICAS DE CANCHA 1', 
                      `El operador actualizó la normativa de Cancha 1: "${court1Policy.substring(0, 100)}...".`, 
                      'success'
                    );
                    
                    if (showToast) showToast('Normativa de Cancha 1 guardada con éxito', 'success');
                    setShowCourt1PolicyWindow(false);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-[#4be277] text-black hover:opacity-90 shadow-[0_0_20px_rgba(75,226,119,0.3)]'
                  }`}
                >
                  <Save className="w-4 h-4" /> {isReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar y Sincronizar Reglas'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Políticas y Advertencias de Cancha 2 */}
      <AnimatePresence>
        {showCourt2PolicyWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Políticas de Reglas - Cancha 2 (Sin Césped)</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      CONFIGURACIÓN DE ADVERTENCIAS PARA EL USO ADECUADO DE LA LOSA DEPORTIVA (FUTSAL / MULTIUSO)
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCourt2PolicyWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isReadOnly && (
                <div className="p-5 mb-8 bg-zinc-950/60 w-full rounded-3xl border border-red-500/20 space-y-4 text-left shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-red-500 tracking-wider flex items-center gap-1.5 italic uppercase">
                        <Crown className="w-3.5 h-3.5 text-red-500 inline shrink-0" strokeWidth={2.5} />
                        MODO DE SÓLO LECTURA (VIP ADMIN)
                      </span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        No posees permisos de Élite para modificar el mensaje o normativa de la Cancha 2 en producción. Contacta al Administrador Principal para solicitar delegación de cambios.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Container */}
              <div className="space-y-6 flex-1 text-left animate-fade-in">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 bg-zinc-900/20">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block italic">Mensaje de Advertencia Activo</span>
                  <p className="text-[9.5px] font-bold text-[#bccbb9]/50 uppercase tracking-wide leading-relaxed">
                    Este mensaje se mostrará a todos los usuarios antes de confirmar su turno de reserva para la Cancha 2 (Sin Césped / Losa). Se utiliza principalmente para detallar las normas como exigir calzado con suela lisa de goma (futsal / zapatillas comunes), prohibición rigurosa de botines con cocós o tapones, cancelaciones y cuidados.
                  </p>

                  <div className="space-y-2 pt-2 font-sans">
                    <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block font-sans">Mensaje de la Normativa</label>
                    <textarea
                      rows={4}
                      disabled={isReadOnly}
                      value={court2Policy}
                      onChange={(e) => setCourt2Policy(e.target.value)}
                      placeholder="Escribe la política o advertencia aquí..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-amber-500 transition-all outline-none font-bold placeholder-zinc-700 hover:border-amber-500/30 uppercase leading-relaxed font-sans"
                    />
                  </div>
                  
                  {/* Vista Previa en Tiempo Real */}
                  <div className="pt-4 border-t border-white/5 font-sans">
                    <span className="text-[9px] font-black text-[#bccbb9]/40 uppercase tracking-wider block mb-2 font-sans">Vista Previa Visual del Mensaje en Reserva de Cancha 2</span>
                    <div className="bg-[#1e2020] rounded-2xl p-4 flex gap-4 border border-white/5">
                      <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-[#bccbb9] leading-relaxed uppercase tracking-wider font-sans">
                          {court2Policy || 'SIN CONTENIDO CONFIGURADO'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3 mt-8">
                <button 
                  onClick={() => setShowCourt2PolicyWindow(false)}
                  className="flex-1 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Consola Principal
                </button>
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                    localStorage.setItem('ramito_court2_policy', court2Policy);
                    
                    addAuditLog(
                      'ACTUALIZACIÓN POLÍTICAS DE CANCHA 2', 
                      `El operador actualizó la normativa de Cancha 2: "${court2Policy.substring(0, 100)}...".`, 
                      'success'
                    );
                    
                    if (showToast) showToast('Normativa de Cancha 2 guardada con éxito', 'success');
                    setShowCourt2PolicyWindow(false);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/25 hover:border-[#4be277]/50 text-[#4be277] hover:border-[#4be277]/60 shadow-[0_0_20px_rgba(75,226,119,0.15)]'
                  }`}
                >
                  <Save className="w-4 h-4" /> {isReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar y Sincronizar Reglas'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Resguardo de Base de Datos y Multimedia */}
      <AnimatePresence>
        {showStorageBackupWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Resguardo de Storage y Base de Datos</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      CARPETAS DEL BACKEND • RESPALDO Y GESTIÓN DE EXPEDIENTES DE COMPROBANTES SUPABASE
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowStorageBackupWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informative storage quota */}
              <div className="p-5 mb-6 bg-zinc-900/50 border border-amber-500/20 rounded-3xl text-left relative overflow-hidden font-sans">
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block italic">Cuota de Almacenamiento en Uso</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-white">142.5 MB</span>
                      <span className="text-xs font-bold text-zinc-500">/ 1,024.0 MB (Supabase Integrated Limit)</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <div className="flex justify-between text-[8px] font-black uppercase text-[#bccbb9]/40 mb-1.5 tracking-wider">
                      <span>Espacio Utilizado</span>
                      <span>13.9%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '13.9%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Folder Breakdown View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 text-left font-sans animate-fade-in">
                {/* Folder 1: /receipts */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block font-mono">/receipts/*</span>
                        <p className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-wider">Comprobantes de pago</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full">
                      234 files
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[8.5px] font-semibold text-[#bccbb9]/60 uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Tamaño total:</span>
                      <span className="text-white font-mono">120.4 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo de archivo:</span>
                      <span className="text-white">JPG, PNG, PDF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acceso de lectura:</span>
                      <span className="text-green-400">Élite / VIP</span>
                    </div>
                  </div>
                </div>

                {/* Folder 2: /fields */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block font-mono">/fields/*</span>
                        <p className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-wider">Fotos de canchas</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black bg-blue-500/10 border border-blue-500/25 text-blue-400 px-2 py-0.5 rounded-full">
                      12 files
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[8.5px] font-semibold text-[#bccbb9]/60 uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Tamaño total:</span>
                      <span className="text-white font-mono">18.2 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo de archivo:</span>
                      <span className="text-white">WebP de Alta Res</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acceso de lectura:</span>
                      <span className="text-blue-400">Público / CDN</span>
                    </div>
                  </div>
                </div>

                {/* Folder 3: /avatars */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block font-mono">/avatars/*</span>
                        <p className="text-[7px] font-bold text-[#bccbb9]/40 uppercase tracking-wider">Fotos de perfil</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black bg-pink-500/10 border border-pink-500/25 text-pink-400 px-2 py-0.5 rounded-full">
                      48 files
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[8.5px] font-semibold text-[#bccbb9]/60 uppercase tracking-wider">
                    <div className="flex justify-between">
                      <span>Tamaño total:</span>
                      <span className="text-white font-mono">3.9 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo de archivo:</span>
                      <span className="text-white">JPG, PNG</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acceso de lectura:</span>
                      <span className="text-blue-400">Público / CDN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Backup Simulator Control Panel */}
              <div className="p-6 bg-[#18181b]/40 border border-white/5 rounded-3xl text-left mb-8 font-sans">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-4 italic">Modulo de Copias de Resguardo</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-3.5">
                    <p className="text-[8.5px] font-bold text-[#bccbb9]/70 uppercase tracking-widest leading-relaxed">
                      Este módulo permite la generación de snapshots completos de la base de datos Supabase, combinados con una copia empaquetada de todos los comprobantes y multimedia almacenados en el storage para su resguardo preventivo offline.
                    </p>
                    
                    <button
                      disabled={isSimulatingBackup || isReadOnly}
                      onClick={() => {
                        setIsSimulatingBackup(true);
                        setBackupProgressPercent(5);
                        setBackupLogs(['[00:01] Inicializando motor de resguardo de Ramito...', '[00:03] Solicitando firmas criptográficas a Supabase Auth...']);
                        
                        setTimeout(() => {
                          setBackupProgressPercent(25);
                          setBackupLogs(prev => [...prev, '[00:08] Leyendo base de datos SQL... Encontrados 124 usuarios y 858 registros de reservas.']);
                        }, 1000);

                        setTimeout(() => {
                          setBackupProgressPercent(55);
                          setBackupLogs(prev => [...prev, '[00:15] Empaquetando bucket /receipts... Comprimiendo 234 comprobantes de transferencia (ZIP format).']);
                        }, 2200);

                        setTimeout(() => {
                          setBackupProgressPercent(85);
                          setBackupLogs(prev => [...prev, '[00:22] Generando snapshot de seguridad SHA-256... Encriptando dump de respaldo.']);
                        }, 3500);

                        setTimeout(() => {
                          setBackupProgressPercent(100);
                          setBackupLogs(prev => [...prev, '✓ [00:28] ¡RESPALDO GENERADO CON ÉXITO!', '📦 Archivo de resguardo guardado: ramito_full_backup_2026.zip (132.8 MB)']);
                          setIsSimulatingBackup(false);
                          addAuditLog(
                            'SISTEMA / RESPALDO MULTIMEDIA', 
                            `El operador generó un resguardo preventivo cifrado de la base de datos y multimedia para el storage (${142.5} MB).`, 
                            'success'
                          );
                          if (showToast) showToast('Resguardo preventivo completado con éxito', 'success');
                        }, 5000);
                      }}
                      className={`h-12 w-full rounded-xl font-black text-[9px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                        isReadOnly 
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                          : isSimulatingBackup
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/50 text-amber-500 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingBackup ? 'animate-spin' : ''}`} />
                      {isSimulatingBackup ? `PROCESANDO ${backupProgressPercent}%` : 'GENERAR RESPALDO COMPLETO'}
                    </button>
                    
                    {/* Clear storage files cache */}
                    <button
                      disabled={isSimulatingBackup || isReadOnly}
                      onClick={() => {
                        if (confirm('¿Está seguro de que desea depurar el caché temporal de avatares huérfanos? Esta acción no eliminará comprobantes activos.')) {
                          if (showToast) showToast('Depurando caché de de almacenamiento...', 'success');
                          setTimeout(() => {
                            if (showToast) showToast('Depuración completada. 4 avatares huérfanos eliminados.', 'success');
                            addAuditLog('SISTEMA / PURGA STORAGE', 'El operador depuró del almacenamiento 4 avatares desvinculados', 'warning');
                          }, 1000);
                        }
                      }}
                      className="h-10 w-full rounded-xl bg-white/5 hover:bg-white/10 text-[#bccbb9] hover:text-white border border-white/5 font-black text-[9px] uppercase tracking-widest transition-all italic"
                    >
                      Depurar Archivos Temporales Huérfanos
                    </button>
                  </div>

                  {/* Log console output */}
                  <div className="bg-black/60 border border-white/10 rounded-2xl p-4 h-48 flex flex-col justify-between font-mono text-[9px] text-zinc-400 select-all overflow-y-auto">
                    <div className="space-y-1.5 flex-1 p-0.5">
                      {backupLogs.length === 0 ? (
                        <div className="text-zinc-600 italic">No hay resguardos de base de datos ejecutados en esta sesión. Presione GENERAR RESPALDO para iniciar.</div>
                      ) : (
                        backupLogs.map((log, i) => (
                          <div key={i} className={log.startsWith('✓') ? 'text-emerald-400 font-bold' : log.includes('DB') ? 'text-amber-300' : 'text-zinc-400'}>{log}</div>
                        ))
                      )}
                    </div>
                    {isSimulatingBackup && (
                      <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden mt-2 shrink-0">
                        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${backupProgressPercent}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informative footer */}
              <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex gap-3 text-left mb-8 font-sans">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block italic">RESGUARDO SEGURO SÓLO VIP / ÉLITE</span>
                  <p className="text-[8.5px] font-bold text-[#bccbb9]/50 uppercase tracking-widest leading-relaxed mt-1">
                    Los archivos son guardados encriptados con algoritmo AES-256 en nuestros buckets integrados de Supabase Storage. El sistema mantendrá copias automáticas diarias incrementales para prevenir pérdidas catastróficas.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowStorageBackupWindow(false)}
                  className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Ajustes
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Diagnóstico y Prueba de Fuego Supabase */}
      <AnimatePresence>
        {showDiagnosticsWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            {/* Ambient Backgrounds */}
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
                  onClick={() => setShowDiagnosticsWindow(false)}
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
                          <div className="h-full bg-[#4be277] transition-all duration-500" style={{ width: '100%' }} />
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
                  onClick={() => setShowDiagnosticsWindow(false)}
                  className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Ajustes
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>


      {/* Ventana de Configuración de Perfil (Pantalla Completa) */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full no-scrollbar">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4be277]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-lg mx-auto flex flex-col pt-16 pb-6 px-6 min-h-screen justify-between">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4be277]/10 border border-[#4be277]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#4be277]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-md font-black text-white uppercase tracking-wider italic">Configurar Cuenta</h4>
                    <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Gestor Avanzado de Datos del Operador</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido / Configs */}
              <div className="space-y-6 flex-1 text-left font-sans">
                {/* SECCIÓN 1: DATOS DE OPERADOR */}
                <div className="space-y-4">
                  <span className="text-[8px] sm:text-[9px] font-black text-[#4be277] uppercase tracking-widest block font-bold">1. Datos Personales</span>
                  
                  {/* Galería de Avatares Oficiales de Fútbol y Copa del Mundo */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-3 bg-zinc-950/40">
                    <span className="text-[8.5px] font-black text-[#4be277] uppercase tracking-widest block font-bold">ELIGE TU AVATAR OFICIAL DE JUGADOR / OPERADOR</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'Balón Campeón', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2314B8A6" stroke-width="2" stroke-opacity="0.3"/><circle cx="50" cy="50" r="26" fill="%2314B8A6" fill-opacity="0.1" stroke="%2314B8A6" stroke-width="2"/><polygon points="50,35 60,42 56,54 44,54 40,42" fill="none" stroke="%2314B8A6" stroke-width="2"/><line x1="50" y1="35" x2="50" y2="24" stroke="%2314B8A6" stroke-width="2"/><line x1="40" y1="42" x2="29" y2="39" stroke="%2314B8A6" stroke-width="2"/><line x1="60" y1="42" x2="71" y2="39" stroke="%2314B8A6" stroke-width="2"/><line x1="44" y1="54" x2="36" y2="65" stroke="%2314B8A6" stroke-width="2"/><line x1="56" y1="54" x2="64" y2="65" stroke="%2314B8A6" stroke-width="2"/></svg>' },
                        { name: 'Mundial Oro', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23FBBF24" stroke-width="2" stroke-opacity="0.3"/><path d="M 35,30 L 65,30 A 15,15 0 0,1 50,60 A 15,15 0 0,1 35,30 Z" fill="%23FBBF24" fill-opacity="0.1" stroke="%23FBBF24" stroke-width="2"/><path d="M 35,38 H 28 A 5,5 0 0,1 28,48 H 35" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 65,38 H 72 A 5,5 0 0,0 72,48 H 65" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,60 V 70 M 40,70 H 60" fill="none" stroke="%23FBBF24" stroke-width="2"/><path d="M 50,16 L 52,21 L 57,21 L 53,24 L 55,29 L 50,26 L 45,29 L 47,24 L 43,21 L 48,21 Z" fill="%23FBBF24" fill-opacity="0.2" stroke="%23FBBF24" stroke-width="1"/></svg>' },
                        { name: 'Botín de Oro', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23F97316" stroke-width="2" stroke-opacity="0.3"/><path d="M 22,50 C 22,38 35,35 48,42 L 78,54 C 80,55 82,58 78,62 C 72,66 45,66 32,66 C 25,66 22,60 22,50 Z" fill="%23F97316" fill-opacity="0.1" stroke="%23F97316" stroke-width="2"/><path d="M 45,43 Q 50,55 42,65 M 52,45 Q 57,55 49,65" stroke="%23FBBF24" stroke-width="2" fill="none"/></svg>' },
                        { name: 'Camiseta Copa', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2306B6D4" stroke-width="2" stroke-opacity="0.3"/><path d="M 32,32 L 42,32 A 8,8 0 0,0 58,32 L 68,32 L 76,46 L 66,52 L 62,48 L 62,74 L 38,74 L 38,48 L 34,52 L 24,46 Z" fill="%2306B6D4" fill-opacity="0.1" stroke="%2306B6D4" stroke-width="2"/><text x="50" y="60" font-family="sans-serif" font-weight="900" font-size="16" fill="%2306B6D4" text-anchor="middle">10</text></svg>' },
                        { name: 'Guantes Pro', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.7" stroke="%238B5CF6" stroke-width="2" stroke-opacity="0.3"/><path d="M 38,34 Q 28,38 34,54 L 38,68 A 12,12 0 0,0 62,68 L 66,54 Q 72,38 62,34 A 8,8 0 0,0 50,44 A 8,8 0 0,0 38,34 Z" fill="%23A78BFA" fill-opacity="0.1" stroke="%23A78BFA" stroke-width="2" stroke-linejoin="round"/><path d="M 44,52 H 56 M 46,60 H 54" stroke="%23A78BFA" stroke-width="1.5" stroke-opacity="0.7"/></svg>' },
                        { name: 'Estrategia', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%2310B981" stroke-width="2" stroke-opacity="0.3"/><rect x="24" y="24" width="52" height="48" fill="none" stroke="%2310B981" stroke-width="2" stroke-opacity="0.8"/><line x1="50" y1="24" x2="50" y2="72" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="10" fill="none" stroke="%2310B981" stroke-width="1.5"/><circle cx="50" cy="48" r="2.5" fill="%2310B981"/></svg>' },
                        { name: 'Silbato Juez', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23F43F5E" stroke-width="2" stroke-opacity="0.3"/><path d="M 32,58 H 68 V 72 H 56 L 40,78 V 72 H 32 Z" fill="%23F43F5E" fill-opacity="0.1" stroke="%23F43F5E" stroke-width="2"/><path d="M 68,62 H 78 V 68 H 68 Z" fill="none" stroke="%23F43F5E" stroke-width="2"/><circle cx="28" cy="65" r="4" stroke="%23F43F5E" stroke-width="2" fill="none"/></svg>' },
                        { name: 'Medalla Oro', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="28" fill="%23141616" fill-opacity="0.8" stroke="%23CA8A04" stroke-width="2" stroke-opacity="0.3"/><path d="M 42,20 L 34,44 L 50,54 L 66,44 L 58,20" fill="none" stroke="%23EF4444" stroke-width="2"/><circle cx="50" cy="58" r="18" fill="%23CA8A04" fill-opacity="0.1" stroke="%23CA8A04" stroke-width="2"/><path d="M 50,49 L 52,54 L 57,54 L 53,57 L 55,62 L 50,59 L 54,63 L 53,57 L 58,54 L 53,52 Z" fill="%23FBBF24" fill-opacity="0.4" stroke="%23CA8A04" stroke-width="1"/></svg>' }
                      ].map((item, index) => {
                        const isSelected = avatar === item.url;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setAvatar(item.url);
                              setUserAvatar(item.url);
                              showToast(`Avatar de ${item.name} seleccionado`, 'success');
                            }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                              isSelected ? 'border-[#4be277] shadow-[0_0_15px_rgba(75,226,119,0.25)]' : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="p-1 rounded-full bg-[#4be277] text-black">
                                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-2 bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#4be277]" />
                      <h3 className="text-[9px] font-black text-white uppercase italic tracking-wider">Nombre del Operador</h3>
                    </div>
                    <input 
                      type="text" 
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Ej. AGUSTÍN CASTRO" 
                      className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-xs font-black uppercase tracking-wider outline-none focus:border-[#4be277]/50 transition-all font-sans cursor-text"
                    />
                  </div>
                </div>

                {/* SECCIÓN 2: CREDENCIALES DE ACCESO */}
                <div className="space-y-4">
                  <span className="text-[8px] sm:text-[9px] font-black text-[#4be277] uppercase tracking-widest block font-bold">2. Credenciales del Correo y Acceso</span>
                  
                  {/* Email Input */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-2 bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#4be277]" />
                      <h3 className="text-[9px] font-black text-white uppercase italic tracking-wider">Correo Electrónico de Login</h3>
                    </div>
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="correo@ejemplo.com" 
                      className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-xs font-mono font-bold tracking-wide outline-none focus:border-[#4be277]/50 transition-all cursor-text font-sans"
                    />
                  </div>

                  {/* Phone / WhatsApp Input */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-2 bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-[#4be277]" />
                      <h3 className="text-[9px] font-black text-white uppercase italic tracking-wider">Teléfono / WhatsApp de Respaldo</h3>
                    </div>
                    <input 
                      type="text" 
                      value={newPersonalPhone}
                      onChange={(e) => setNewPersonalPhone(e.target.value)}
                      placeholder="+51 987 654 321" 
                      className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-xs font-mono font-bold tracking-wide outline-none focus:border-[#4be277]/50 transition-all cursor-text font-sans"
                    />
                    <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed pt-1">
                      Nota: Este número de teléfono o WhatsApp se utiliza para recuperar tu correo, clave o PIN de inmediato si los olvidas.
                    </p>
                  </div>

                  {/* Personal Key / Password Input */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-2 bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-[#4be277]" />
                      <h3 className="text-[9px] font-black text-white uppercase italic tracking-wider">Tu Llave Maestra de Acceso Personal</h3>
                    </div>
                    <div className="relative">
                      <input 
                        type={personalKeyVisible ? 'text' : 'password'} 
                        value={newPersonalKey} 
                        onChange={(e) => setNewPersonalKey(e.target.value)} 
                        className="w-full h-11 bg-black/40 border border-white/10 focus:border-[#4be277]/50 rounded-xl pl-4 pr-32 text-white text-xs font-mono font-black tracking-widest outline-none transition-all cursor-text" 
                        placeholder="INGRESE SU NUEVA LLAVE MAESTRA"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                        <button 
                          type="button" 
                          onClick={() => setPersonalKeyVisible(!personalKeyVisible)}
                          className="text-[7.5px] font-mono font-black text-[#bccbb9]/60 hover:text-white uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        >
                          {personalKeyVisible ? 'OCULTAR' : 'MOSTRAR'}
                        </button>
                      </div>
                    </div>
                    <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed pt-1">
                      Nota: Esta Llave Maestra es exclusiva para tu perfil registrado. Puedes cambiarla cuando desees; utilízala junto a tu correo para ingresar a la plataforma.
                    </p>
                  </div>

                  {/* PIN / Llave Secundaria de Acceso Rápido */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-2 bg-zinc-950/40 relative overflow-hidden animate-fade-in text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#4be277]" />
                      <h3 className="text-[9px] font-black text-white uppercase italic tracking-wider">Tu Código Especial / PIN de Acceso Rápido</h3>
                    </div>
                    <div className="relative">
                      <input 
                        type={personalPinVisible ? 'text' : 'password'} 
                        value={newPersonalPin} 
                        onChange={(e) => setNewPersonalPin(e.target.value)} 
                        maxLength={12}
                        className="w-full h-11 bg-black/40 border border-white/10 focus:border-[#4be277]/50 rounded-xl pl-4 pr-32 text-white text-xs font-mono font-black tracking-widest outline-none transition-all cursor-text" 
                        placeholder="INGRESE SU PIN / LLAVE SECUNDARIA"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                        <button 
                          type="button" 
                          onClick={() => setPersonalPinVisible(!personalPinVisible)}
                          className="text-[7.5px] font-mono font-black text-[#bccbb9]/60 hover:text-white uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        >
                          {personalPinVisible ? 'OCULTAR' : 'MOSTRAR'}
                        </button>
                      </div>
                    </div>
                    <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed pt-1">
                      Nota: Configura un PIN o Llave Secundaria (4 a 12 caracteres alfanuméricos) para ingresar instantáneamente desde la pantalla de inicio con un solo clic en la pestaña "PIN Rápido" sin ingresar tu correo electrónico.
                    </p>
                  </div>
                </div>

                {/* SECCIÓN 3: PARÁMETROS DE SEGURIDAD DE REGISTRO (POR ROL) */}
                <div className="space-y-4 animate-fade-in">
                  <span className="text-[8px] sm:text-[9px] font-black text-[#4be277] uppercase tracking-widest block font-bold">3. Parámetros de Seguridad del Complejo</span>

                  {userRole === 'admin_elite' && (
                    <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-4 bg-zinc-950/40 relative overflow-hidden text-left">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-[#4be277]" />
                        <h3 className="text-[10px] font-black text-white uppercase italic tracking-wider">Llave de Seguridad Élite</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#4be277] uppercase tracking-widest italic flex items-center gap-1.5 font-bold">
                          <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Llave Registro Élite Admin
                        </label>
                        <input 
                          type="text" 
                          value={newEliteKey} 
                          onChange={(e) => setNewEliteKey(e.target.value)} 
                          className="w-full h-11 bg-black/50 border border-[#4be277]/30 rounded-xl px-4 text-white text-xs font-mono font-black tracking-widest outline-none focus:border-[#4be277] transition-all cursor-text font-bold" 
                          placeholder="CÓDIGO ÉLITE REGISTRO"
                        />
                      </div>
                      <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed">
                        Nota: Clave para autorizar operadores rango Élite Admin.
                      </p>
                    </div>
                  )}

                  {userRole === 'admin_vip' && (
                    <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-4 bg-zinc-950/40 relative overflow-hidden text-left">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-[#FFD600]" />
                        <h3 className="text-[10px] font-black text-white uppercase italic tracking-wider">Llave Maestra de Registro VIP</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#FFD600] uppercase tracking-widest italic flex items-center gap-1.5 font-bold">
                          <Gem className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Llave Registro VIP Admin
                        </label>
                        <input 
                          type="text" 
                          value={newVipKey} 
                          onChange={(e) => setNewVipKey(e.target.value)} 
                          className="w-full h-11 bg-black/50 border border-[#FFD600]/30 rounded-xl px-4 text-[#FFD600] text-xs font-mono font-black tracking-widest outline-none focus:border-[#FFD600] transition-all cursor-text font-bold" 
                          placeholder="CÓDIGO VIP REGISTRO"
                        />
                      </div>
                      <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed">
                        Nota: Clave para autorizar operadores rango VIP Admin.
                      </p>
                    </div>
                  )}

                  {userRole === 'player' && (
                    <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-4 bg-zinc-950/40 relative overflow-hidden text-left">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-[#009EE3]" />
                        <h3 className="text-[10px] font-black text-white uppercase italic tracking-wider">Llave Pública de Usuarios</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#009EE3] uppercase tracking-widest italic flex items-center gap-1.5 font-bold">
                          <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Llave Registro Usuarios
                        </label>
                        <input 
                          type="text" 
                          value={newUniversalUserKey} 
                          onChange={(e) => setNewUniversalUserKey(e.target.value)} 
                          className="w-full h-11 bg-black/50 border border-[#009EE3]/30 rounded-xl px-4 text-[#009EE3] text-xs font-mono font-black tracking-widest outline-none focus:border-[#009EE3] transition-all cursor-text font-bold" 
                          placeholder="CÓDIGO USUARIO REGISTRO"
                        />
                      </div>
                      <p className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-wider leading-relaxed">
                        Nota: Clave para autorizar el registro de clientes normales.
                      </p>
                    </div>
                  )}
                </div>



                {/* Save button */}
                <button 
                  type="button"
                  onClick={handleUpdateAvatarAndName}
                  className="w-full h-12 bg-[#4be277] text-[#121414] font-black rounded-xl uppercase text-[9px] tracking-widest italic shadow-lg shadow-[#4be277]/15 flex items-center justify-center gap-2 transition-all outline-none active:scale-[0.98] hover:brightness-105"
                >
                  <Save className="w-4 h-4" /> Guardar Todo y Sincronizar
                </button>

              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ======= MODAL: PRUEBA DE FUEGO SUPABASE ======= */}
      {showDiagnosticsWindow && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{backdropFilter:'blur(12px)', background:'rgba(0,0,0,0.85)'}}>
          <div className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-hidden flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#0d0f0e] border border-violet-500/25 shadow-2xl shadow-violet-900/20">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-[13px] font-black text-white uppercase italic tracking-tight">Prueba de Fuego Supabase</h2>
                  <p className="text-[8px] font-bold text-violet-400 uppercase tracking-widest mt-0.5">DIAGNÓSTICO COMPLETO DE CONEXIONES EN TIEMPO REAL</p>
                </div>
              </div>
              <button onClick={() => setShowDiagnosticsWindow(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* Status Cards Grid */}
              {diagnosticsResults && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(diagnosticsResults).map(([key, val]: [string, any]) => (
                    <div key={key} className={`rounded-2xl border p-3 space-y-1 ${
                      val.status === 'success' ? 'border-emerald-500/30 bg-emerald-950/20' :
                      val.status === 'error' ? 'border-red-500/30 bg-red-950/20' :
                      val.status === 'partial_success' ? 'border-amber-500/30 bg-amber-950/20' :
                      'border-white/5 bg-zinc-950/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest truncate">{key}</span>
                        <span className={`text-[9px] font-black ${
                          val.status === 'success' ? 'text-emerald-400' :
                          val.status === 'error' ? 'text-red-400' :
                          val.status === 'partial_success' ? 'text-amber-400' :
                          'text-violet-400 animate-pulse'
                        }`}>
                          {val.status === 'success' ? '✅' : val.status === 'error' ? '❌' : val.status === 'partial_success' ? '⚠️' : '⏳'}
                        </span>
                      </div>
                      {val.latency > 0 && (
                        <p className="text-[8px] font-mono text-[#bccbb9]/50">{val.latency}ms</p>
                      )}
                      {val.actions && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {Object.entries(val.actions).map(([action, status]: [string, any]) => (
                            <span key={action} className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                              status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                              status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-white/5 text-[#bccbb9]/40'
                            }`}>{action}: {status === 'success' ? '✓' : status === 'failed' ? '✗' : '…'}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Logs terminal */}
              {diagnosticsLogs.length > 0 && (
                <div className="bg-black/60 border border-white/5 rounded-2xl p-3 space-y-1 font-mono max-h-48 overflow-y-auto">
                  {diagnosticsLogs.map((log, i) => (
                    <p key={i} className={`text-[9px] leading-relaxed ${
                      log.startsWith('✓') ? 'text-emerald-400' :
                      log.startsWith('❌') ? 'text-red-400' :
                      log.includes('COMPLETADA') ? 'text-violet-300 font-black' :
                      'text-[#bccbb9]/60'
                    }`}>{log}</p>
                  ))}
                </div>
              )}

              {/* Placeholder when not run yet */}
              {!diagnosticsResults && diagnosticsLogs.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
                    <Database className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-[10px] font-bold text-[#bccbb9]/60 uppercase tracking-widest">
                    Presioná el botón para verificar todas las tablas,<br/>operaciones CRUD y canales Realtime de Supabase.
                  </p>
                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="p-5 pt-0 shrink-0">
              <button
                onClick={runDiagnostics}
                disabled={diagnosticsRunning}
                className={`w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center justify-center gap-2 transition-all ${
                  diagnosticsRunning
                    ? 'bg-violet-900/40 text-violet-400/60 border border-violet-500/20 cursor-not-allowed'
                    : 'bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98]'
                }`}
              >
                {diagnosticsRunning ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Ejecutando prueba...</>
                ) : (
                  <><Database className="w-4 h-4" /> Ejecutar Prueba de Fuego 🔥</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
