export function parseSeguimientoDate(dateStr: string) {
  if (!dateStr) return null;
  
  const normalized = dateStr.trim().toUpperCase();
  const parts = normalized.split(/\s+/);
  if (parts.length < 2) return null;
  
  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');
  
  if (dateParts.length !== 3 || timeParts.length < 2) return null;
  
  let hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
  
  // Ajuste por A.M. / P.M.
  if (parts.length > 2) {
    const ampm = parts[2];
    if (ampm.includes('P') && hours < 12) {
      hours += 12;
    } else if (ampm.includes('A') && hours === 12) {
      hours = 0;
    }
  }
  
  return new Date(
    parseInt(dateParts[2]), // Año
    parseInt(dateParts[1]) - 1, // Mes (0-11)
    parseInt(dateParts[0]), // Día
    hours,
    minutes,
    seconds
  );
}
