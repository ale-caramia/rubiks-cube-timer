import type { Session, TimeEntry } from '../types/timer';

export interface WeekGroup {
  weekKey: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  sessions: Session[];
}

export interface MonthGroup {
  monthKey: string;
  year: number;
  month: number;
  sessions: Session[];
  weeks: WeekGroup[];
}

// Get ISO week number for a date
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Get start of week (Monday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of week (Sunday)
const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Group sessions by month and week
export const groupSessionsByMonthAndWeek = (sessions: Session[]): MonthGroup[] => {
  const monthMap = new Map<string, MonthGroup>();

  // Sort sessions from newest to oldest
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const session of sortedSessions) {
    const date = new Date(session.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        monthKey,
        year,
        month,
        sessions: [],
        weeks: []
      });
    }

    const monthGroup = monthMap.get(monthKey)!;
    monthGroup.sessions.push(session);

    // Add to week group
    const weekNumber = getWeekNumber(date);
    const weekKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;

    let weekGroup = monthGroup.weeks.find(w => w.weekKey === weekKey);
    if (!weekGroup) {
      weekGroup = {
        weekKey,
        weekNumber,
        startDate: getWeekStart(date),
        endDate: getWeekEnd(date),
        sessions: []
      };
      monthGroup.weeks.push(weekGroup);
    }
    weekGroup.sessions.push(session);
  }

  // Sort months from newest to oldest
  const sortedMonths = Array.from(monthMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  // Sort weeks within each month from newest to oldest
  for (const monthGroup of sortedMonths) {
    monthGroup.weeks.sort((a, b) => b.weekNumber - a.weekNumber);
  }

  return sortedMonths;
};

// Get all time entries from a list of sessions
export const getAllTimeEntries = (sessions: Session[]): TimeEntry[] => {
  return sessions.flatMap(s => s.times);
};

// Calculate aggregated stats for a group of sessions
export const getGroupStats = (sessions: Session[]) => {
  const allTimes = sessions.flatMap(s => s.times.map(t => t.time));

  if (allTimes.length === 0) {
    return {
      count: 0,
      sessionCount: sessions.length,
      best: null,
      worst: null,
      average: null,
      ao5: null,
      ao12: null
    };
  }

  const sorted = [...allTimes].sort((a, b) => a - b);

  // Calculate Ao5 (average of 5, removing best and worst)
  let ao5: number | null = null;
  if (allTimes.length >= 5) {
    const last5 = allTimes.slice(-5);
    const sorted5 = [...last5].sort((a, b) => a - b);
    const middle3 = sorted5.slice(1, 4);
    ao5 = middle3.reduce((a, b) => a + b, 0) / 3;
  }

  // Calculate Ao12 (average of 12, removing best and worst)
  let ao12: number | null = null;
  if (allTimes.length >= 12) {
    const last12 = allTimes.slice(-12);
    const sorted12 = [...last12].sort((a, b) => a - b);
    const middle10 = sorted12.slice(1, 11);
    ao12 = middle10.reduce((a, b) => a + b, 0) / 10;
  }

  return {
    count: allTimes.length,
    sessionCount: sessions.length,
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    average: allTimes.reduce((a, b) => a + b, 0) / allTimes.length,
    ao5,
    ao12
  };
};

// Format month name for display
export const formatMonthName = (year: number, month: number, locale: string): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
};

// Format week range for display
export const formatWeekRange = (startDate: Date, endDate: Date, locale: string): string => {
  const start = startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const end = endDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return `${start} - ${end}`;
};
