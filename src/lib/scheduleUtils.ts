export type ScheduleDay = {
  morning: string;
  afternoon: string;
  night: string;
};

/**
 * Convierte el objeto scheduleDays en un texto de marquee legible.
 * Ejemplo de salida:
 * "Domingo 08:00-12:00 / 14:00-18:00 / 20:00-00:00 – Lunes 08:00-12:00 / 14:00-18:00 / 20:00-00:00 …"
 */
export function generarMarquee(scheduleDays: Record<string, ScheduleDay>): string {
  const orderedDays = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ];

  const parts = orderedDays.map((day) => {
    const d = scheduleDays[day];
    if (!d) return null;
    const { morning, afternoon, night } = d;
    const seg = [morning, afternoon, night]
      .filter(Boolean)
      .join(' / ');
    return `${capitalize(day)} ${seg}`;
  });

  return parts.filter(Boolean).join(' – ');
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
