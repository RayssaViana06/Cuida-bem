export const toISODate = (d) =>  // Date|string -> 'YYYY-MM-DD'
  (typeof d === 'string') ? d.slice(0, 10) : d?.toISOString()?.slice(0, 10);

export const toTimeHHMM = (d) => {  // Date|string -> 'HH:MM'
  if (!d) return '';
  if (typeof d === 'string') {
    // '09:00' já está ok
    if (/^\d{2}:\d{2}$/.test(d)) return d;
    // ISO '2025-11-08T09:00:00Z'
    const m = d.match(/T(\d{2}:\d{2})/);
    return m ? m[1] : '';
  }
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};
