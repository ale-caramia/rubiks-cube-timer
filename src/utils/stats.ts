import type { Session, Stats, TimeEntry } from '../types/timer';

export const getStats = (times: number[]): Stats | null => {
  if (times.length === 0) return null;
  const sorted = [...times].sort((a, b) => a - b);
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    average: times.reduce((a, b) => a + b, 0) / times.length,
    count: times.length
  };
};

export const calculateAo5 = (times: number[]): number | null => {
  if (times.length < 5) return null;
  const last5 = times.slice(-5);
  const sorted = [...last5].sort((a, b) => a - b);
  const middle3 = sorted.slice(1, 4);
  return middle3.reduce((a, b) => a + b, 0) / 3;
};

export const calculateAo12 = (times: number[]): number | null => {
  if (times.length < 12) return null;
  const last12 = times.slice(-12);
  const sorted = [...last12].sort((a, b) => a - b);
  const middle10 = sorted.slice(1, 11);
  return middle10.reduce((a, b) => a + b, 0) / 10;
};

export const calculateBestAo5 = (times: number[]): number | null => {
  if (times.length < 5) return null;
  let best = Infinity;
  for (let i = 0; i <= times.length - 5; i++) {
    const segment = times.slice(i, i + 5);
    const sorted = [...segment].sort((a, b) => a - b);
    const middle3 = sorted.slice(1, 4);
    const avg = middle3.reduce((a, b) => a + b, 0) / 3;
    best = Math.min(best, avg);
  }
  return best === Infinity ? null : best;
};

export const calculateBestAo12 = (times: number[]): number | null => {
  if (times.length < 12) return null;
  let best = Infinity;
  for (let i = 0; i <= times.length - 12; i++) {
    const segment = times.slice(i, i + 12);
    const sorted = [...segment].sort((a, b) => a - b);
    const middle10 = sorted.slice(1, 11);
    const avg = middle10.reduce((a, b) => a + b, 0) / 10;
    best = Math.min(best, avg);
  }
  return best === Infinity ? null : best;
};

export const filterTimesByDate = (entries: TimeEntry[], days: number): TimeEntry[] => {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return entries.filter(entry => entry.timestamp >= cutoff);
};

export const getTimeBasedStats = (entries: TimeEntry[]) => {
  if (entries.length === 0) {
    return { count: 0, average: null, best: null, worst: null };
  }

  const times = entries.map(e => e.time);
  const sorted = [...times].sort((a, b) => a - b);

  return {
    count: times.length,
    average: times.reduce((a, b) => a + b, 0) / times.length,
    best: sorted[0],
    worst: sorted[sorted.length - 1]
  };
};

export const getDailyStats = (sessions: Session[]) => {
  const allEntries = sessions.flatMap(s => s.times);
  return getTimeBasedStats(filterTimesByDate(allEntries, 1));
};

export const getWeeklyStats = (sessions: Session[]) => {
  const allEntries = sessions.flatMap(s => s.times);
  return getTimeBasedStats(filterTimesByDate(allEntries, 7));
};

export const getMonthlyStats = (sessions: Session[]) => {
  const allEntries = sessions.flatMap(s => s.times);
  return getTimeBasedStats(filterTimesByDate(allEntries, 30));
};
