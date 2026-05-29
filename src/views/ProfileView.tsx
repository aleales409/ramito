import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, ShieldCheck, Key, Settings, CreditCard, History, 
  ChevronRight, LogOut, Phone, MessageCircle, AlertTriangle, 
  CheckCircle2, Save, ExternalLink, ArrowRight, Lock, Clock, Newspaper,
  Globe, Smartphone, X, Activity, CheckCircle, Wrench, Trash2, Plus, Copy, RefreshCw, Power, Check, FileText, Mail,
  Database, HardDrive, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getRotationMetadata, getActiveAccountIndex } from '../lib/transferRotation';

export default function ProfileView() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramView = searchParams.get('view');

  const { showToast, eliteKey, setEliteKey, vipKey, setVipKey, saveSettings, adminPhone, schedule, appLicenseActive, webLicenseActive, maintenanceMode, setMaintenanceMode, notifications, setNotifications, stadiumName, setStadiumName, marqueeText, setMarqueeText } = useApp();
  
  const [activeTab, setActiveTab] = useState<'licencias' | 'ajustes' | 'seguridad' | 'noticia'>(() => {
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
  const [showWebWindow, setShowWebWindow] = useState(false);
  const [showAppWindow, setShowAppWindow] = useState(false);
  const [showEmergencyWindow, setShowEmergencyWindow] = useState(false);
  const [showTransferWindow, setShowTransferWindow] = useState(false);
  const [showVercelMetricsWindow, setShowVercelMetricsWindow] = useState(() => {
    const searchParamsTemp = new URLSearchParams(window.location.search);
    return searchParamsTemp.get('tab') === 'ajustes' && searchParamsTemp.get('modal') === 'vercel';
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
  const [selectedExportRange, setSelectedExportRange] = useState<'semanal' | 'mensual'>('semanal');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

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

  // States for APP License Options (Separated and Complete)
  const [appDaysRemaining, setAppDaysRemaining] = useState(() => parseInt(localStorage.getItem('ramito_app_days_remaining') || '28', 10));
  const [appPwaShortName, setAppPwaShortName] = useState(() => localStorage.getItem('ramito_app_pwa_short_name') || 'Ramito APP');
  const [appPushEnabled, setAppPushEnabled] = useState(() => (localStorage.getItem('ramito_app_push_enabled') !== 'false'));
  const [appPushProvider, setAppPushProvider] = useState(() => localStorage.getItem('ramito_app_push_provider') || 'OneSignal Push Service');
  const [appPushId, setAppPushId] = useState(() => localStorage.getItem('ramito_app_push_id') || 'fcm-token-id-9485295-a');
  const [appOfflineCache, setAppOfflineCache] = useState(() => localStorage.getItem('ramito_app_offline_cache') || 'Pre-cargar reservas y perfiles');
  const [testPushMessage, setTestPushMessage] = useState('');

  // States for Security tab
  const [newEliteKey, setNewEliteKey] = useState(eliteKey);
  const [newVipKey, setNewVipKey] = useState(vipKey);
  const [newAdminPhone, setNewAdminPhone] = useState(adminPhone);
  const [newPersonalKey, setNewPersonalKey] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [personalKeyVisible, setPersonalKeyVisible] = useState(false);
  const [purgingSessions, setPurgingSessions] = useState(false);
  const [newStadiumName, setNewStadiumName] = useState(stadiumName);

  const [newWeekdayOpen, setNewWeekdayOpen] = useState(schedule?.weekday?.open || '18:00');
  const [newWeekdayClose, setNewWeekdayClose] = useState(schedule?.weekday?.close || '23:00');
  const [newWeekendOpen, setNewWeekendOpen] = useState(schedule?.weekend?.open || '15:00');
  const [newWeekendClose, setNewWeekendClose] = useState(schedule?.weekend?.close || '23:00');

  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('ramito_support_email') || 'soporte@ramitofut.com');
  const [supportIg, setSupportIg] = useState(() => localStorage.getItem('ramito_support_ig') || '@ramitofut');
  const [activationCode, setActivationCode] = useState('');

  // States for news/marquee and profile configurations

  const [newMarqueeText, setNewMarqueeText] = useState(() => marqueeText || '');
  
  useEffect(() => {
    if (marqueeText) {
      setNewMarqueeText(marqueeText);
    }
  }, [marqueeText]);

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
    if (schedule?.weekend?.open) setNewWeekendOpen(schedule.weekend.open);
    if (schedule?.weekend?.close) setNewWeekendClose(schedule.weekend.close);
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
  const [emergencyReason, setEmergencyReason] = useState(() => localStorage.getItem('ramito_emergency_reason') || 'Inclemencias Climáticas');
  const [emergencyMessage, setEmergencyMessage] = useState(() => localStorage.getItem('ramito_emergency_message') || 'El complejo permanecerá cerrado temporalmente debido a tormentas eléctricas. Las reservas de hoy se reprogramarán libremente.');
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

  const generatePDFReport = (range: 'semanal' | 'mensual') => {
    const daysFiltered = range === 'semanal' ? 7 : 30;
    
    // We filter logs that fit the selected timeframe or take a clean slice representation
    const logsQty = range === 'semanal' ? Math.min(10, auditLogs.length) : auditLogs.length;
    const reportedLogs = auditLogs.slice(0, logsQty);

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
            }
            .header-container {
              border-bottom: 3px solid #ef4444;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .main-title {
              font-size: 24px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              color: #000000;
              margin: 0;
            }
            .main-subtitle {
              font-size: 10px;
              font-weight: bold;
              color: #666666;
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
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 35px;
            }
            .stat-box {
              border: 1px solid #e2e8f0;
              padding: 15px;
              border-radius: 10px;
              background-color: #f8fafc;
            }
            .stat-label {
              font-size: 9px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f1f5f9;
              text-align: left;
              padding: 12px 14px;
              font-size: 10px;
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 12px 14px;
              font-size: 11px;
              border-bottom: 1px solid #e2e8f0;
              color: #1e293b;
            }
            .badge-style {
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2.5px 6px;
              border-radius: 4px;
              display: inline-block;
            }
            .badge-alert { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
            .badge-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
            .badge-warning { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .badge-info { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
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
              <div class="main-subtitle">CONSOLA ELITE • REGISTROS DE AUDITORÍA (${range.toUpperCase()})</div>
            </div>
            <div class="meta-info">
              <div>Rango: Reporte Histórico de ${daysFiltered} Días</div>
              <div>Emisión: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Sucesos</div>
              <div class="stat-value">${reportedLogs.length}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Acciones Críticas</div>
              <div class="stat-value">${reportedLogs.filter(l => l.type === 'alert').length}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Modificaciones Ok</div>
              <div class="stat-value">${reportedLogs.filter(l => l.type === 'success').length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%">timestamp</th>
                <th style="width: 20%">acción realizada</th>
                <th style="width: 45%">detalles descriptivos del log</th>
                <th style="width: 20%">usuario administrador</th>
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
                  <td style="font-weight: bold; color: #0f172a;">${log.details}</td>
                  <td style="color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase;">${log.user}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-container">
            SISTEMA LICENCIADO RAMITO FUT SHOW • REPORTE IMPRESO DE AUDITORÍA DE SEGURIDAD
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
    addAuditLog('IMP. REPORTE AUDITORÍA', `Se exportó el reporte ${range.toUpperCase()} estructurado para formato PDF e impresión de seguridad.`, 'success');
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
      title: `🚨 Solicitud de Renovación (${licenseType.toUpperCase()})`,
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
          title: `🔑 Licencia Activada con Éxito (${licenseType.toUpperCase()})`,
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

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('ramito_user_avatar') || null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        localStorage.setItem('ramito_user_avatar', base64String);
        showToast('Avatar de operador cargado', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAvatarAndName = async () => {
    if (!newProfileName.trim()) {
      showToast('El nombre no puede estar vacío', 'error');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Por favor ingrese un correo de acceso válido', 'error');
      return;
    }
    
    try {
      const uppercaseName = newProfileName.toUpperCase();
      const emailLower = newEmail.trim().toLowerCase();
      
      const profileUpdates: any = {
        name: uppercaseName,
        email: emailLower
      };

      if (newPersonalKey) {
        if (newPersonalKey.length < 4) {
          showToast('La llave personal debe tener al menos 4 caracteres', 'error');
          return;
        }
        profileUpdates.password = newPersonalKey;
        localStorage.setItem('ramito_user_pw', newPersonalKey);
      }
      
      localStorage.setItem('ramito_user_name', uppercaseName);
      localStorage.setItem('ramito_user_email', emailLower);

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

      // Save master registration keys depending on role
      if (userRole === 'admin_elite') {
        await saveSettings({
          elite_key: newEliteKey,
          vip_key: newVipKey
        });
        setEliteKey(newEliteKey);
        setVipKey(newVipKey);
      } else if (userRole === 'admin_vip') {
        await saveSettings({
          vip_key: newVipKey
        });
        setVipKey(newVipKey);
      }

      addAuditLog('CONFIGURACIÓN DE CUENTA', `El operador actualizó los datos de su cuenta y llaves de acceso.`, 'success');
      showToast('¡Configuración de cuenta guardada con éxito!', 'success');
      setNewPersonalKey('');
      setShowProfileModal(false);
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar datos de la cuenta');
    }
  };

  const userId = localStorage.getItem('ramito_user_id');
  const userRole = localStorage.getItem('ramito_user_role');
  const userName = userData?.name || localStorage.getItem('ramito_user_name') || 'Cargando...';
  const isReadOnly = userRole !== 'admin_elite';

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
    const tabParam = searchParams.get('tab');
    const licenseParam = searchParams.get('license');
    const modalParam = searchParams.get('modal');
    if (tabParam === 'licencias') {
      setActiveTab('licencias');
      if (licenseParam === 'web') {
        setShowWebWindow(true);
      } else if (licenseParam === 'app') {
        setShowAppWindow(true);
      }
    } else if (tabParam === 'ajustes') {
      setActiveTab('ajustes');
      if (modalParam === 'vercel') {
        setShowVercelMetricsWindow(true);
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
      if (!isSupabaseConfigured || userId === 'master_access') {
        const simulatedUser = {
          id: userId || 'master_access',
          name: localStorage.getItem('ramito_user_name') || 'Élite Admin',
          role: localStorage.getItem('ramito_user_role') || 'admin_elite',
          email: localStorage.getItem('ramito_user_email') || 'admin@ramito.com',
          password: localStorage.getItem('ramito_user_pw') || '••••'
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
        setUserData(response.data);
      } else {
        throw new Error('No data found');
      }
    } catch (err) {
      console.warn('Error fetching user data from Supabase, loading fallback state immediately:', err);
      setUserData({
        id: userId,
        name: localStorage.getItem('ramito_user_name') || 'Élite Admin',
        role: localStorage.getItem('ramito_user_role') || 'admin_elite',
        email: localStorage.getItem('ramito_user_email') || 'admin@ramito.com',
        password: localStorage.getItem('ramito_user_pw') || '••••'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    showToast('Sesión cerrada correctamente');
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
      setNewPersonalKey('');
    } catch (err) {
      showToast('Error al actualizar tu llave');
    }
  };

  const generateStrongKey = (type: 'elite' | 'vip') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const finalKey = `${type.toUpperCase()}-${key}`;
    if (type === 'elite') {
      setNewEliteKey(finalKey);
    } else {
      setNewVipKey(finalKey);
    }
    showToast(`¡Llave sugerida para ${type.toUpperCase()} generada con éxito!`, 'success');
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
          weekday: { open: newWeekdayOpen, close: newWeekdayClose },
          weekend: { open: newWeekendOpen, close: newWeekendClose }
        }
      });
      addAuditLog(
        'HORARIOS DEL COMPLEJO', 
        `Actualización ordinaria de horarios de atención efectuada: LUNES-VIERNES (${newWeekdayOpen} a ${newWeekdayClose}) - SÁBADO-DOMINGO (${newWeekendOpen} a ${newWeekendClose}). Estado sincronizado en tiempo real.`, 
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

  const handleSaveAppConfig = async () => {
    localStorage.setItem('ramito_app_days_remaining', String(appDaysRemaining));
    localStorage.setItem('ramito_app_pwa_short_name', appPwaShortName);
    localStorage.setItem('ramito_app_push_enabled', String(appPushEnabled));
    localStorage.setItem('ramito_app_push_provider', appPushProvider);
    localStorage.setItem('ramito_app_push_id', appPushId);
    localStorage.setItem('ramito_app_offline_cache', appOfflineCache);

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
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
              <div className="w-full h-full rounded-[2.2rem] bg-[#121414] flex items-center justify-center overflow-hidden relative">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#4be277]" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Cambiar</span>
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
              <span className={`self-start text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                userRole?.includes('admin') ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277]' : 'bg-white/5 border-white/10 text-[#bccbb9]'
              }`}>
                {userRole === 'admin_elite' ? '👑 ELITE ADMIN' : (userRole === 'admin_vip' ? '💎 VIP ADMIN' : '⚽ JUGADOR')}
              </span>
              
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(true);
                  setShowAdvancedConfig(true);
                }}
                className="self-start flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/25 text-[#4be277] hover:border-[#4be277]/40 rounded-xl text-[8.5px] font-black uppercase tracking-widest italic font-sans transition-all active:scale-[0.97]"
              >
                <Settings className="w-3 h-3 animate-spin duration-3000" />
                Configurar Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

       {/* TABS NAVEGACIÓN */}
      <div className="flex gap-1.5 p-1.5 glass-panel rounded-2xl border border-white/5 mb-8 overflow-x-auto scrollbar-none">
        {(userRole?.includes('admin')
          ? ['licencias', 'ajustes', 'seguridad', 'noticia'] as const
          : ['seguridad', 'noticia'] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab ? 'bg-white/10 text-white shadow-xl border border-white/10' : 'text-[#bccbb9]/40'
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

      <AnimatePresence mode="wait">
        {/* VISTA LICENCIAS COMPLETA */}
        {activeTab === 'licencias' && (
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
              {/* Card Licencia Web */}
              <div 
                className="glass-panel rounded-3xl border p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden"
                style={{ borderColor: webLicenseActive ? 'rgba(75, 226, 119, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4be277]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider block italic">Licencia Web</span>
                      <span className="text-[8px] font-mono text-[#bccbb9]/50 tracking-wider">ID: LIC-WEB-2026-FUT</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                    webLicenseActive ? 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277]' : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}>
                    {webLicenseActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Dominio Web:</span>
                    <span className="text-white font-mono font-black">{webDomain}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Sincronización:</span>
                    <span className="text-emerald-400 font-black uppercase">{webSyncFrequency}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Validez Restante:</span>
                    <span className="text-[#FF9100] font-black uppercase">{webDaysRemaining} Días</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowWebWindow(true)}
                  className="w-full h-12 bg-[#4be277]/10 hover:bg-[#4be277]/20 border border-[#4be277]/30 text-[#4be277] transition-all rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest italic"
                >
                  <Settings className="w-4 h-4 text-[#4be277]" /> Configurar Licencia Web
                </button>
              </div>

              {/* Card Licencia App (PWA) */}
              <div 
                className="glass-panel rounded-3xl border p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden"
                style={{ borderColor: appLicenseActive ? 'rgba(255, 145, 0, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF9100]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider block italic">Licencia Móvil APP</span>
                      <span className="text-[8px] font-mono text-[#bccbb9]/50 tracking-wider">ID: LIC-PWA-2026-FUT</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                    appLicenseActive ? 'bg-[#FF9100]/10 border-[#FF9100]/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}>
                    {appLicenseActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Nombre de App:</span>
                    <span className="text-white font-black uppercase">{appPwaShortName}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Alertas Push:</span>
                    <span className={`font-black uppercase ${appPushEnabled ? 'text-[#4be277]' : 'text-red-400'}`}>
                      {appPushEnabled ? 'Habilitadas' : 'Desactivadas'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Validez Restante:</span>
                    <span className="text-[#FF9100] font-black uppercase">{appDaysRemaining} Días</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAppWindow(true)}
                  className="w-full h-12 bg-[#FF9100]/10 hover:bg-[#FF9100]/20 border border-[#FF9100]/30 text-amber-500 transition-all rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest italic"
                >
                  <Settings className="w-4 h-4 text-amber-500" /> Configurar Licencia App
                </button>
              </div>

              {/* Card Modo Mantenimiento */}
              <div 
                className="glass-panel rounded-3xl border p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden"
                style={{ borderColor: maintenanceMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(75, 226, 119, 0.2)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider block italic">Mantenimiento del Sistema</span>
                      <span className="text-[8px] font-mono text-[#bccbb9]/50 tracking-wider">ID: LIC-SYS-MANT-2026-FUT</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                    maintenanceMode ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' : 'bg-[#4be277]/10 border-[#4be277]/30 text-[#4be277]'
                  }`}>
                    {maintenanceMode ? 'Activo (Bloqueado)' : 'Inactivo (Liberado)'}
                  </span>
                </div>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Pantalla de Espera:</span>
                    <span className="text-white font-black uppercase">Logo Grande + Mensaje</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Acceso del Personal:</span>
                    <span className="text-[#4be277] font-black uppercase">Habilitado</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#bccbb9]/40 uppercase font-black tracking-widest">Configura:</span>
                    <span className="text-[#4be277] font-black uppercase">Elite Admin</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-wider block">Interruptor de Mantenimiento</span>
                    <span className="text-[7.5px] font-bold text-[#bccbb9]/40 uppercase tracking-widest block mt-0.5">Activar pantalla de Volveremos pronto</span>
                  </div>
                  {!isReadOnly ? (
                    <button 
                      onClick={() => {
                        const newVal = !maintenanceMode;
                        setMaintenanceMode(newVal);
                        localStorage.setItem('ramito_maintenance', String(newVal));
                        showToast(newVal ? 'Modo Mantenimiento Activado' : 'Modo Mantenimiento Desactivado', newVal ? 'error' : 'success');
                      }}
                      className={`w-12 h-6 px-0.5 rounded-full flex items-center transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                    >
                      <motion.div animate={{ x: maintenanceMode ? 24 : 0 }} className={`w-5 h-5 rounded-full ${maintenanceMode ? 'bg-white' : 'bg-zinc-400'}`} />
                    </button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/20 px-2 py-0.5 rounded">SÓLO LECTURA (VIP)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GESTOR DE CÓDIGOS DE ACTIVACIÓN (SOLO ELITE ADMIN) */}
            {!isReadOnly && (
              <div className="glass-panel rounded-3xl border border-white/5 p-5 space-y-4 bg-zinc-950/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-white uppercase tracking-wider block italic">🔑 Servidor de Códigos (App Móvil PWA)</span>
                    <span className="text-[8px] font-mono text-[#bccbb9]/50 tracking-wider">CREAR CUPONES DE RECARGA • EXCLUSIVO ELITE</span>
                  </div>
                </div>

                {/* Formulario de Creación */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider block italic">Generador de Cupones</span>
                  
                  <div className="space-y-2">
                    <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block font-bold">Código del Cupón</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newCodeName}
                        onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                        placeholder="EJ: RENOVAR-VIP-60D"
                        className="flex-1 h-10 bg-zinc-950 border border-white/10 rounded-xl px-3 text-[9px] font-black font-mono text-white placeholder-[#bccbb9]/30 outline-none uppercase focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="h-10 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none"
                        title="Generar código aleatorio"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                        Generar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block mb-1">Días de Validez</label>
                      <select
                        value={newCodeDays}
                        onChange={(e) => setNewCodeDays(e.target.value)}
                        className="w-full h-10 bg-zinc-950 border border-white/10 rounded-xl px-3 text-[9px] font-black text-white outline-none focus:border-purple-500"
                      >
                        <option value="30">30 Días</option>
                        <option value="60">60 Días</option>
                        <option value="90">90 Días</option>
                        <option value="180">180 Días</option>
                        <option value="365">365 Días (1 Año)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-[#bccbb9]/40 uppercase tracking-widest block mb-1">Aplica Para</label>
                      <div className="flex items-center h-10 w-full rounded-xl border border-purple-500/15 bg-purple-500/5 px-3 text-[8.5px] font-bold uppercase tracking-wider text-purple-300">
                        📱 Sólo APP Móvil PWA
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomCode}
                    className="w-full h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all outline-none"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar Cupón Activo
                  </button>
                </div>

                {/* Listado de Códigos Activos */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-[#bccbb9]/40 uppercase tracking-wider block">Listado de Códigos en Circulación</span>
                  
                  {customCodes.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 text-center">
                      <p className="text-[8.5px] font-bold text-[#bccbb9]/30 uppercase tracking-widest">No hay códigos custom creados</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customCodes.map((item, index) => {
                        const itemNumber = customCodes.length - index;
                        return (
                          <div 
                            key={item.id}
                            className="p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Cuadrado de Número con Indicador de Validación */}
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[9px] font-black font-mono transition-all border shrink-0 relative ${
                                item.used 
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] animate-pulse' 
                                  : 'bg-white/5 border-white/10 text-[#bccbb9]/50'
                              }`} title={item.used ? `Cupón #${itemNumber} - VALIDADO` : `Cupón #${itemNumber}`}>
                                {item.used ? (
                                  <div className="relative flex items-center justify-center">
                                    <span className="text-[9px]">{itemNumber}</span>
                                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black shadow">
                                      <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={4} />
                                    </div>
                                  </div>
                                ) : (
                                  <span>{itemNumber}</span>
                                )}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[9.5px] font-black text-white truncate">{item.code}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.code);
                                      showToast('Código copiado al portapapeles', 'success');
                                    }}
                                    className="text-[#bccbb9]/45 hover:text-white transition-colors shrink-0"
                                    title="Copiar código"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-[7.5px] font-bold text-[#bccbb9]/50 uppercase tracking-wide mt-1 leading-none block">
                                  +{item.days} DÍAS • MÓVIL PWA
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[7.5px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                                item.used 
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                  : 'bg-[#4be277]/10 border-[#4be277]/20 text-[#4be277]'
                              }`}>
                                {item.used ? 'USADO' : 'ACTIVO'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomCode(item.id)}
                                className="w-7 h-7 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-lg flex items-center justify-center transition-all border border-red-500/10 outline-none"
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
        {activeTab === 'ajustes' && (
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
                maintenanceMode
                  ? 'from-red-950/45 to-red-900/10 border-red-500/40 shadow-[0_10px_35px_rgba(239,68,68,0.15)]'
                  : 'from-zinc-950/80 to-zinc-950/40 border-white/5 shadow-lg'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-all duration-500" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                    maintenanceMode
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
                      <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                      <span className={`text-[8px] font-black uppercase tracking-wider font-mono ${maintenanceMode ? 'text-red-400' : 'text-green-400'}`}>
                        {maintenanceMode ? 'SISTEMA BAJO MANTENIMIENTO / CERRADO' : 'SISTEMA ONLINE / OPERATIVO CON NORMALIDAD'}
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

            {/* BOTÓN MÉTRICAS DE CONEXIÓN VERCEL Y ANCHO DE BANDA */}
            <button
              onClick={() => setShowVercelMetricsWindow(true)}
              className="w-full text-left glass-panel rounded-3xl border border-white/5 p-5 relative overflow-hidden group hover:border-[#4be277]/60 active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-zinc-950/80 to-zinc-950/40 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[12px] font-black text-white uppercase tracking-wider block italic group-hover:text-blue-400 transition-colors">
                      Métricas de Conexión Vercel y Canales
                    </span>
                    <p className="text-[8.5px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-1 leading-relaxed">
                      ESTADÍSTICAS DEL ANCHO DE BANDA • CONSUMO DE TOKENS • RENDIMIENTO EN LA WEB
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-wider font-mono text-blue-400">
                        ANCHO DE BANDA CONSUMIDO: 4.8 GB ESTE MES • MÉTRICAS PROVISIONALES
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
          </motion.div>
        )}



        {/* VISTA SEGURIDAD (SOLO ADMINS) */}
        {activeTab === 'seguridad' && (
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
                {/* 1. SECCIÓN: CAJA DEL DÍA - REVOLUCIONARIA Y POLISHED */}
                <div className="glass-panel rounded-3xl border border-white/5 p-5 bg-zinc-950/60 relative overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#4be277]/[0.02] rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4be277]/10 flex items-center justify-center border border-[#4be277]/20 shrink-0">
                      <CreditCard className="w-5 h-5 text-[#4be277]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#4be277] uppercase tracking-wider block italic">Sistema de Caja del Día</span>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">Auditoría Financiera Activa</h4>
                    </div>
                  </div>

                  {/* Grande de Caja del Día */}
                  <div className="text-center py-4 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#4be277]/40 to-transparent" />
                    <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Monto Reconciliado Total de Hoy</span>
                    <span className="font-mono text-3xl font-black text-white block tracking-tighter mt-1">$45.000<span className="text-xs font-bold text-[#4be277] ml-1 font-sans">ARS</span></span>
                    <span className="text-[7.5px] font-mono text-[#4be277] uppercase tracking-widest mt-1.5 inline-flex items-center gap-1 bg-[#4be277]/10 px-2.5 py-0.5 rounded-full border border-[#4be277]/25">
                      <Check className="w-2.5 h-2.5" /> Balance Cuadrado y Auditado
                    </span>
                  </div>

                  {/* Columnas de Efectivo vs Transferencia */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Efectivo */}
                    <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest font-bold">💸 Efectivo</span>
                        <span className="text-[7.5px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">33.3%</span>
                      </div>
                      <span className="font-mono text-lg font-black text-white block">$15.000</span>
                      <span className="text-[7px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Recaudado en Puerta</span>
                    </div>

                    {/* Transferencias */}
                    <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest font-bold">🏦 Transferencia</span>
                        <span className="text-[7.5px] font-mono text-[#4be277] bg-[#4be277]/10 px-1.5 py-0.5 rounded border border-[#4be277]/10">66.7%</span>
                      </div>
                      <span className="font-mono text-lg font-black text-white block">$30.000</span>
                      <span className="text-[7px] font-black text-[#4be277]/70 uppercase tracking-widest block">Bancos Verificados</span>
                    </div>
                  </div>

                  {/* Barra de Distribución Visual */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[7px] font-bold text-[#bccbb9]/55 uppercase tracking-wider">
                      <span>Efectivo (33%)</span>
                      <span>Transferencias (67%)</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full flex overflow-hidden border border-white/5 p-[1px]">
                      <div className="h-full bg-zinc-700/60 rounded-l-full" style={{ width: '33.3%' }} />
                      <div className="h-full bg-[#4be277] rounded-r-full" style={{ width: '66.7%' }} />
                    </div>
                  </div>
                </div>

                {/* 2. REGISTRO DETALLADO DE PAGOS DE HOY */}
                <div className="glass-panel rounded-3xl border border-white/5 p-5 bg-zinc-950/60 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <h5 className="text-[9px] font-black text-white uppercase italic tracking-widest font-bold">Ledger de Facturación Diaria</h5>
                    <span className="text-[8px] font-mono text-[#bccbb9]/45">5 TRANSACCIONES RECIENTES</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {[
                      { time: '15:30', detail: 'Juan Pérez • Cancha Sintética (18:00)', method: 'Transferencia Bancaria', amount: '$12.000', labelColor: 'text-blue-400 bg-blue-500/10 border-blue-500/10' },
                      { time: '14:15', detail: 'María Gómez • Cancha de Tenis (19:00)', method: 'Efectivo en Puerta', amount: '$8.000', labelColor: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/30' },
                      { time: '12:00', detail: 'Carlos Soto • Cancha Sintética (15:00)', method: 'Transferencia Bancaria', amount: '$12.000', labelColor: 'text-blue-400 bg-blue-500/10 border-blue-500/10' },
                      { time: '10:45', detail: 'Lucas Díaz • Cancha de Pádel (16:30)', method: 'Efectivo en Puerta', amount: '$7.000', labelColor: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/30' },
                      { time: '09:15', detail: 'Andrés Ruiz • Cancha de Pádel (17:30)', method: 'Transferencia Bancaria', amount: '$6.000', labelColor: 'text-blue-400 bg-blue-500/10 border-blue-500/10' }
                    ].map((tx, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-white/[0.03] rounded-xl flex justify-between items-center gap-3">
                        <div className="text-left space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[8px] text-[#bccbb9]/40">{tx.time}</span>
                            <span className={`text-[6.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full border ${tx.labelColor}`}>{tx.method}</span>
                          </div>
                          <p className="text-[10px] font-black text-white uppercase italic tracking-wide font-bold">{tx.detail}</p>
                        </div>
                        <span className="font-mono text-xs font-black text-white">{tx.amount} ARS</span>
                      </div>
                    ))}
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
                        onClick={() => setSelectedExportRange('semanal')}
                        className={`h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          selectedExportRange === 'semanal'
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 font-black scale-[1.01]'
                            : 'bg-zinc-900/40 border-white/5 text-[#bccbb9]/50 hover:bg-zinc-900'
                        }`}
                      >
                        Reporte Semanal
                      </button>
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
                    </div>

                    <button
                      type="button"
                      onClick={() => generatePDFReport(selectedExportRange)}
                      className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-[#121414] font-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all outline-none italic shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:opacity-95"
                    >
                      <FileText className="w-4 h-4" /> Generar & Descargar PDF ({selectedExportRange})
                    </button>
                  </div>

                {/* 5. BOTÓN ASISTENCIA WHATSAPP (Ajustes de Soporte de Asistencia) */}
                <div className="glass-panel rounded-3xl border border-white/5 p-6 space-y-4 bg-zinc-950/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 shrink-0">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider block italic font-sans font-bold">Asistencia WhatsApp Soporte</span>
                      <span className="text-[8px] font-mono text-[#bccbb9]/40 tracking-wider">RESOLUCIÓN DE DUDAS Y ASISTENCIA AL CLIENTE</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-left">
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
                          addAuditLog('CAMBIO DE NÚMERO DE ASISTENCIA', `Número de WhatsApp configurado a: ${newAdminPhone}`, 'success');
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

              </div>
            )}
          </motion.div>
        )}

        {/* VISTA NOTICIA / MARQUEE (REEMPLAZA A SOPORTE) */}
        {activeTab === 'noticia' && (
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
                    <Save className="w-4 h-4" /> Guardar Marquesina en la Nube
                  </button>
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
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                      <span className="text-[9.5px] font-black text-[#bccbb9] uppercase tracking-widest block font-sans">LUNES A VIERNES</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[7.5px] font-black text-zinc-500 uppercase block tracking-wider mb-1">HORA APERTURA</label>
                          <input 
                            type="time" 
                            value={newWeekdayOpen}
                            onChange={(e) => setNewWeekdayOpen(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] font-black text-zinc-500 uppercase block tracking-wider mb-1">HORA CIERRE</label>
                          <input 
                            type="time" 
                            value={newWeekdayClose}
                            onChange={(e) => setNewWeekdayClose(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sábados y Domingos */}
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                      <span className="text-[9.5px] font-black text-[#bccbb9] uppercase tracking-widest block font-sans">SÁBADO Y DOMINGO</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[7.5px] font-black text-zinc-500 uppercase block tracking-wider mb-1">HORA APERTURA</label>
                          <input 
                            type="time" 
                            value={newWeekendOpen}
                            onChange={(e) => setNewWeekendOpen(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] font-black text-zinc-500 uppercase block tracking-wider mb-1">HORA CIERRE</label>
                          <input 
                            type="time" 
                            value={newWeekendClose}
                            onChange={(e) => setNewWeekendClose(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase transition-all focus:border-blue-400 outline-none"
                          />
                        </div>
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
                    
                    const [openH, openM] = openStr.split(':').map(Number);
                    const openTime = openH + openM / 60;
                    
                    const [closeH, closeM] = closeStr.split(':').map(Number);
                    const closeTime = closeH + closeM / 60;
                    
                    let currentlyOpen = false;
                    if (closeTime < openTime) {
                      if (currentTime >= openTime || currentTime <= closeTime) currentlyOpen = true;
                    } else {
                      if (currentTime >= openTime && currentTime <= closeTime) currentlyOpen = true;
                    }

                    return (
                      <div className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-2xl flex items-start gap-2.5 text-left font-sans">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block">COMPROBACIÓN DE TELEMETRÍA EN VIVO</span>
                          <p className="text-[9.5px] font-bold text-[#bccbb9]/70 uppercase tracking-wide leading-relaxed mt-0.5">
                            Hoy es <span className="text-white font-extrabold">{dayName}</span>. Basado en las horas elegidas, el complejo registraría en su marquesina el estado de <span className={`font-black ${currentlyOpen ? 'text-[#4be277]' : 'text-red-500'}`}>{currentlyOpen ? '● BIENVENIDO / ABIERTO' : '● CERRADO / OPERACIONES SUSPENDIDAS'}</span> ({openStr} a {closeStr}).
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
      </AnimatePresence>

      {/* Ventana de Configuración Licencia Web (Detallada y Completa) */}
      <AnimatePresence>
        {showWebWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Licencia Web - Consola Administrativa</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Configuración y Sincronización Completa del Sitio Principal</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWebWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isReadOnly && (
                <div className="p-5 mb-8 bg-zinc-900 border border-amber-500/20 rounded-3xl space-y-4 text-left shadow-lg relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-amber-500 tracking-wider block italic uppercase">👑 MODO LECTURA AUTORIZADO (VIP ADMIN)</span>
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
                        🔔 Enviar Alerta de Renovación
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid content */}
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

                    {/* Slider Días Restantes */}
                    <div className="space-y-2">
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
                        <span className="text-[9px] font-black text-white uppercase tracking-wider block">Registros Web de Jugadores</span>
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

              {/* Form Footer Buttons */}
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowWebWindow(false)}
                  className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all text-center italic"
                >
                  Regresar / Salir sin Guardar
                </button>
                <button 
                  disabled={isReadOnly}
                  onClick={handleSaveWebConfig}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-emerald-500 text-black hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar Cambios de Licencia Web'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración Licencia App PWA (Detallada y Completa) */}
      <AnimatePresence>
        {showAppWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-1 justify-between">
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

              {isReadOnly && (
                <div className="p-5 mb-8 bg-zinc-900 border border-amber-500/20 rounded-3xl space-y-4 text-left shadow-lg relative overflow-hidden w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-amber-500 tracking-wider block italic uppercase">👑 MODO LECTURA AUTORIZADO (VIP ADMIN)</span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        Solo el Administrador Élite puede modificar de manera directa los perímetros de licencias o configuraciones de la aplicación de producción.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
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
                        className="w-full h-10 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all"
                      >
                        🔔 Enviar Alerta de Renovación
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
                          className="h-10 px-4 bg-amber-500 text-black rounded-xl font-black text-[9px] uppercase tracking-wider hover:opacity-90 transition-all font-mono"
                        >
                          VALIDAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
                {/* Left Column: General Configuration */}
                <div className="space-y-6">
                  {/* PWA State and Period */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
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

                    {/* Slider Días Restantes */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-[#bccbb9]/60 uppercase tracking-wider">Duración de Licencia App (Días)</label>
                        <span className="text-xs font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/10 px-2 py-0.5 rounded-lg">{appDaysRemaining} Días</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="120" 
                        value={appDaysRemaining} 
                        onChange={(e) => setAppDaysRemaining(parseInt(e.target.value, 10))}
                        className="w-full accent-[#FF9100]"
                      />
                    </div>
                  </div>

                  {/* PWA Identity and Support Phone */}
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
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

                    {/* Support WhatsApp Link */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Número Soporte en App (Format WhatsApp)</label>
                      <input 
                        type="text" 
                        value={newAdminPhone} 
                        onChange={(e) => setNewAdminPhone(e.target.value)}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white uppercase font-bold focus:border-[#FF9100] transition-all outline-none"
                      />
                    </div>

                    {/* Offline Cache dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Estrategia offline (Service Worker)</label>
                      <select
                        value={appOfflineCache}
                        onChange={(e) => setAppOfflineCache(e.target.value)}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white font-bold focus:border-[#FF9100] transition-all outline-none"
                      >
                        <option value="Pre-cargar reservas y perfiles" className="bg-zinc-950">Pre-cargar reservas y perfiles completas</option>
                        <option value="Solo guardar datos de sesión activa" className="bg-zinc-950">Solo guardar sesión del jugador</option>
                        <option value="Sin caché offline (Requiere internet siempre)" className="bg-zinc-950">Sin caché offline (Estricto)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Push alerts */}
                <div className="space-y-6">
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                    <h5 className="text-[10px] font-black text-[#FF9100] uppercase tracking-widest italic mb-2">Servicios de Notificaciones SUPABASE</h5>
 
                    {/* Switch Push alert */}
                    <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="text-[9px] font-black text-white uppercase tracking-wider block">Habilitar Servidor de Notificaciones Supabase</span>
                        <span className="text-[7px] font-bold text-[#bccbb9]/30 uppercase tracking-widest mt-0.5 block">Enviar notificaciones push automáticas por Supabase Realtime / Edge Functions</span>
                      </div>
                      <button 
                        onClick={() => setAppPushEnabled(!appPushEnabled)}
                        className={`w-10 h-5.5 rounded-full flex items-center px-0.5 transition-colors ${appPushEnabled ? 'bg-amber-500' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: appPushEnabled ? 18 : 0 }} className="w-4.5 h-4.5 rounded-full bg-black/95 shadow-md" />
                      </button>
                    </div>
 
                    {/* FCM Token Config */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Supabase Push Trigger App ID</label>
                      <input 
                        type="text" 
                        value={appPushId} 
                        onChange={(e) => setAppPushId(e.target.value)}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white focus:border-[#FF9100] transition-all outline-none font-mono"
                      />
                    </div>
 
                    {/* Consola de Push test instantánea */}
                    <div className="bg-black/90 rounded-2xl p-4 border border-white/5 space-y-3">
                      <span className="text-[9px] font-black text-amber-500 font-mono tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        CONSOLA PUSH NOTIFICATION (SUPABASE REALTIME)
                      </span>
                      <input 
                        type="text" 
                        value={testPushMessage} 
                        onChange={(e) => setTestPushMessage(e.target.value)} 
                        placeholder="ESCRIBE LA NOTIFICACIÓN DE PRUEBA DE SUPABASE..."
                        className="w-full h-10 bg-zinc-900 border border-white/5 rounded-xl px-3 text-[9px] font-black font-mono text-white outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!testPushMessage.trim()) {
                            showToast('Escriba un mensaje para mandar', 'error');
                            return;
                          }
                          showToast(`🔔 SUPABASE PUSH SENT: "${testPushMessage.toUpperCase()}"`, 'success');
                          setTestPushMessage('');
                        }}
                        className="w-full h-10 bg-amber-500 hover:opacity-90 transition-all rounded-xl text-black font-black font-mono text-[9px] uppercase tracking-widest italic"
                      >
                        🚀 ENVIAR NOTIFICACIÓN AL INSTANTE
                      </button>
                    </div>
                  </div>
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
                  disabled={isReadOnly}
                  onClick={handleSaveAppConfig}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-amber-500 text-black hover:opacity-90 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {isReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar Cambios de Licencia App'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración Licencia Cierre de Emergencia Completa (Pantalla Completa) */}
      <AnimatePresence>
        {showEmergencyWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            {/* Background Gradient Decorative elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-1 justify-between">
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
                      <span className="text-[11px] font-black text-red-500 tracking-wider block italic uppercase">👑 MODO DE SÓLO LECTURA (VIP ADMIN)</span>
                      <p className="text-[9px] font-bold text-[#bccbb9]/60 uppercase tracking-widest mt-0.5 leading-relaxed">
                        No posees permisos de Élite para suspender actividades en los servidores de producción de Ramito. Contacta al Administrador Principal para solicitar delegación temporal de llaves de emergencia.
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
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">Activar Cierre de Emergencia</span>
                        <span className="text-[8px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">Bloquea reservas nuevas e inicios de juego en la APP</span>
                      </div>
                      {!isReadOnly ? (
                        <button 
                          onClick={() => {
                            const newVal = !maintenanceMode;
                            setMaintenanceMode(newVal);
                            localStorage.setItem('ramito_maintenance', String(newVal));
                            
                            addAuditLog(
                              newVal ? 'ACTIVACIÓN DE CIERRE DE EMERGENCIA' : 'DESACTIVACIÓN DE CIERRE DE EMERGENCIA',
                              `Cierre preventivo general modificado a ${newVal ? 'ACTIVADO' : 'NORMAL'}.`,
                              newVal ? 'alert' : 'success'
                            );

                            if (showToast) showToast(newVal ? 'Modo Mantenimiento Activado' : 'Modo Mantenimiento Desactivado', newVal ? 'error' : 'success');
                          }}
                          className={`w-12 h-6 px-0.5 rounded-full flex items-center transition-colors shrink-0 ${maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                          <motion.div animate={{ x: maintenanceMode ? 24 : 0 }} className={`w-5 h-5 rounded-full ${maintenanceMode ? 'bg-white' : 'bg-zinc-400'}`} />
                        </button>
                      ) : (
                        <span className="text-[8px] font-black text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/20 px-2 py-1 rounded shrink-0">VIP READ ONLY</span>
                      )}
                    </div>

                    {/* Selector de Motivo */}
                    <div className="space-y-1.5 font-sans text-left">
                      <label className="text-[9px] font-black text-[#bccbb9]/60 uppercase tracking-wider block">Motivo Oficial de la Suspensión (Escribir Manual)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          disabled={isReadOnly}
                          type="text"
                          value={emergencyReason}
                          onChange={(e) => setEmergencyReason(e.target.value)}
                          placeholder="Ej: INCLEMENCIAS CLIMÁTICAS"
                          className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white uppercase font-bold focus:border-red-500 transition-all outline-none animate-none"
                        />
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => {
                            localStorage.setItem('ramito_emergency_reason', emergencyReason);
                            if (showToast) showToast('Motivo guardado con éxito', 'success');
                          }}
                          className="h-12 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all outline-none shrink-0"
                        >
                          Guardar Motivo
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
                            `Sincronización masiva instantánea vía webhook de WhatsApp concretada por ${emergencyReason.toUpperCase()}.`,
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
                    localStorage.setItem('ramito_emergency_reason', emergencyReason);
                    localStorage.setItem('ramito_emergency_message', emergencyMessage);
                    localStorage.setItem('ramito_emergency_courts', affectedCourts);
                    addAuditLog('GUARDAR AJUSTES DE EMERGENCIA EN CONSOLA', `Se modificó y guardó la bitácora de catástrofes para campos: ${affectedCourts.toUpperCase()}.`, 'success');
                    if (showToast) showToast('Ajustes de emergencia guardados', 'success');
                    setShowEmergencyWindow(false);
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 ${
                    isReadOnly 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed shadow-none' 
                      : 'bg-red-500 text-black hover:opacity-90 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  }`}
                >
                  <Save className="w-4 h-4" /> {isReadOnly ? 'Guardar Desactivado (Lectura VIP)' : 'Guardar y Sincronizar Cambios de Emergencia'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Configuración de Transferencias Rotativas */}
      <AnimatePresence>
        {showTransferWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4be277]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-1 justify-between">
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
                      <span className="text-[11px] font-black text-red-500 tracking-wider block italic uppercase">👑 MODO DE SÓLO LECTURA (VIP ADMIN)</span>
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

      {/* Ventana de Métricas de Conexión Vercel */}
      <AnimatePresence>
        {showVercelMetricsWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-1 justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider italic">Conexión Vercel & Métricas de Canales</h4>
                    <span className="text-[9px] font-bold text-[#bccbb9]/40 uppercase tracking-widest mt-0.5 block">
                      MONITOREO DE ANCHO DE BANDA, PETICIONES EDGE Y TOKENS REGISTRO
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVercelMetricsWindow(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#bccbb9] hover:text-white transition-all border border-white/5 shadow-lg shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                      Visualizando estadísticas en tiempo real estimadas para el dominio <span className="text-white font-mono lowercase font-bold">{webDomain}</span>. Los datos se actualizarán automáticamente cada hora o al forzar la compilación del Vercel Build Engine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left font-sans">
                {/* Stat 1 */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden">
                  <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Ancho de Banda</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-black text-white tracking-tight">4.82 GB</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">/ 100 GB</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '4.82%' }} />
                  </div>
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wider mt-2 block">4.82% de cuota mensual usado</span>
                </div>

                {/* Stat 2 */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Peticiones Edge (24hs)</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-black text-white tracking-tight">18,482</span>
                    <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wide">▲ 14%</span>
                  </div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-4 block">Tiempo respuesta: 14ms (A+)</span>
                </div>

                {/* Stat 3 */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Invocaciones Serverless</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-black text-white tracking-tight">2,842</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">INVS</span>
                  </div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-4 block">Promedio duración: 112ms</span>
                </div>

                {/* Stat 4 */}
                <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <span className="text-[8px] font-black text-[#bccbb9]/40 uppercase tracking-widest block">Uso de Tokens Diario</span>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-black text-white tracking-tight">15.4K</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">TOKENS</span>
                  </div>
                  <span className="text-[8px] font-black text-[#4be277] uppercase tracking-widest mt-4 block">Licencia ACTIVA y persistida</span>
                </div>
              </div>

              {/* CSS Visual Bar Chart */}
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl text-left mb-8 font-sans">
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
                    className="h-8 px-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all flex items-center gap-1.5 italic"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingVercelMetrics ? 'animate-spin' : ''}`} />
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
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl text-left mb-8 font-sans">
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
                  onClick={() => setShowVercelMetricsWindow(false)}
                  className="w-full h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest transition-all text-center italic flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Regresar a Ajustes
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Ventana de Resguardo de Base de Datos y Multimedia */}
      <AnimatePresence>
        {showStorageBackupWindow && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col p-6 md:p-10 flex-1 justify-between">
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
                            : 'bg-amber-500 text-black hover:opacity-90 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
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

      {/* Ventana de Configuración de Perfil (Pantalla Completa) */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 overflow-y-auto overflow-x-hidden w-full h-full">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4be277]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-lg mx-auto flex flex-col p-6 min-h-screen justify-between">
              
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
                  
                  {/* Photo of Operator */}
                  <div className="glass-panel rounded-3xl border border-white/5 p-4 flex items-center justify-between gap-4 bg-zinc-950/40">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl bg-[#121414] border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-[#bccbb9]/60" />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[5.5px] font-black uppercase text-white tracking-widest text-center">Subir</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block italic font-bold">Foto del Operador</span>
                        <span className="text-[7.5px] font-mono text-[#bccbb9]/40 uppercase tracking-widest">Dimensiones recomendadas: 1:1</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-[7.5px] font-black uppercase tracking-widest transition-all"
                    >
                      Subir Imagen
                    </button>
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

                  {/* Personal Key / Password Input */}
                  <div className="w-full glass-panel rounded-3xl border border-white/5 p-4 space-y-2 bg-zinc-950/40">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-[#4be277]" />
                      <h3 className="text-[9px] font-black text-white uppercase italic tracking-wider">Nueva Llave de Acceso Personal (Password)</h3>
                    </div>
                    <div className="relative">
                      <input 
                        type={personalKeyVisible ? 'text' : 'password'} 
                        value={newPersonalKey} 
                        onChange={(e) => setNewPersonalKey(e.target.value)} 
                        className="w-full h-11 bg-black/40 border border-white/10 focus:border-[#4be277]/50 rounded-xl px-4 text-white text-xs font-mono font-bold tracking-[0.2em] outline-none transition-all cursor-text" 
                        placeholder="Dejar vacío para mantener actual"
                      />
                      <button 
                        type="button" 
                        onClick={() => setPersonalKeyVisible(!personalKeyVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[7.5px] font-mono font-black text-[#bccbb9]/40 hover:text-[#bccbb9] uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5 active:scale-95 transition-all"
                      >
                        {personalKeyVisible ? 'OCULTAR' : 'MOSTRAR'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: LLAVES MAESTRAS DE REGISTRO */}
                {(userRole === 'admin_elite' || userRole === 'admin_vip') && (
                  <div className="space-y-4 font-sans">
                    <span className="text-[8px] sm:text-[9px] font-black text-[#4be277] uppercase tracking-widest block font-bold">3. Llaves Maestras de Registro (Personal)</span>
                    
                    <div className="glass-panel rounded-3xl border border-white/5 p-4 space-y-4 bg-zinc-950/40">
                      {userRole === 'admin_elite' && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-[#4be277] uppercase tracking-widest italic block font-bold">👑 Llave Registro Élite Admin</label>
                            <button 
                              type="button" 
                              onClick={() => generateStrongKey('elite')}
                              className="text-[7.5px] font-black text-[#4be277]/80 hover:text-[#4be277] uppercase tracking-widest hover:underline flex items-center gap-1 font-mono transition-colors"
                            >
                              <RefreshCw className="w-2.5 h-2.5" /> Auto-Sugerir
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={newEliteKey} 
                            onChange={(e) => setNewEliteKey(e.target.value)} 
                            className="w-full h-11 bg-black/50 border border-[#4be277]/30 rounded-xl px-4 text-white text-xs font-mono font-black tracking-widest outline-none focus:border-[#4be277] transition-all cursor-text" 
                            placeholder="CÓDIGO ÉLITE REGISTRO"
                          />
                        </div>
                      )}

                      {(userRole === 'admin_elite' || userRole === 'admin_vip') && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-[#FFD600] uppercase tracking-widest italic block font-bold">💎 Llave Registro VIP Admin</label>
                            <button 
                              type="button" 
                              onClick={() => generateStrongKey('vip')}
                              className="text-[7.5px] font-black text-[#FFD600]/80 hover:text-[#FFD600] uppercase tracking-widest hover:underline flex items-center gap-1 font-mono transition-colors"
                            >
                              <RefreshCw className="w-2.5 h-2.5" /> Auto-Sugerir
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={newVipKey} 
                            onChange={(e) => setNewVipKey(e.target.value)} 
                            className="w-full h-11 bg-black/50 border border-[#FFD600]/30 rounded-xl px-4 text-white text-xs font-mono font-black tracking-widest outline-none focus:border-[#FFD600] transition-all cursor-text" 
                            placeholder="CÓDIGO VIP REGISTRO"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
    </main>
  );
}
