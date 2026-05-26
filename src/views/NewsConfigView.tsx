import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * NewsConfigView
 * Pantalla de configuración de horarios de noticias para administradores.
 * Permite activar/desactivar bloques de tiempo (Mañana, Tarde, Noche) para cada día.
 * Los cambios se guardan mediante saveSettings del contexto de la aplicación.
 */
export default function NewsConfigView() {
  const { saveSettings, showToast } = useApp();
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const slots = ['Mañana', 'Tarde', 'Noche'];

  const initialSchedule = daysOfWeek.reduce((acc, day) => {
    acc[day] = { Mañana: false, Tarde: false, Noche: false } as Record<string, boolean>;
    return acc;
  }, {} as Record<string, Record<string, boolean>>);

  const [schedule, setSchedule] = useState(initialSchedule);

  const toggleSlot = (day: string, slot: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }));
  };

  const handleSave = async () => {
    try {
      await saveSettings({ schedule });
      showToast('Horarios de noticias guardados', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al guardar horarios', 'error');
    }
  };

  return (
    <main className="pt-16 pb-32 px-5 max-w-lg mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6"
      >
        <button onClick={() => window.history.back()} className="absolute top-4 right-4 text-[#bccbb9] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-white uppercase mb-4 text-center">
          Configuración de Noticias
        </h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-sm font-medium text-white">{day}</span>
              <div className="flex gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(day, slot)}
                    className={`px-2 py-1 text-xs rounded ${schedule[day][slot] ? 'bg-[#4be277] text-black' : 'bg-white/5 text-white'} transition-colors`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded hover:bg-white/10 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#4be277] text-black font-bold rounded hover:opacity-90 transition"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </main>
  );
}
