// ============ CORE NUMEROLOGY ============

export function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

export function getRootNumber(dob: Date): number {
  return reduceToSingle(dob.getDate());
}

export function getDestinyNumber(dob: Date): number {
  const d = dob.getDate();
  const m = dob.getMonth() + 1;
  const y = dob.getFullYear();
  return reduceToSingle(d + m + reduceToSingle(y));
}

// ============ VIMSHOTTARI DASHA ============

export interface PlanetDasha {
  planet: string;
  years: number;
  number: number; // numerology number
}

export const DASHA_ORDER: PlanetDasha[] = [
  { planet: 'Ketu',    years: 7,  number: 7 },
  { planet: 'Venus',   years: 20, number: 6 },
  { planet: 'Sun',     years: 6,  number: 1 },
  { planet: 'Moon',    years: 10, number: 2 },
  { planet: 'Mars',    years: 7,  number: 9 },
  { planet: 'Rahu',    years: 18, number: 4 },
  { planet: 'Jupiter', years: 16, number: 3 },
  { planet: 'Saturn',  years: 19, number: 8 },
  { planet: 'Mercury', years: 17, number: 5 },
];

const TOTAL_DASHA_YEARS = 120;

// Weekday (JS 0=Sun..6=Sat) to planet number mapping
const WEEKDAY_TO_PLANET_NUMBER: Record<number, number> = {
  0: 1, // Sunday → Sun
  1: 2, // Monday → Moon
  2: 9, // Tuesday → Mars
  3: 5, // Wednesday → Mercury
  4: 3, // Thursday → Jupiter
  5: 6, // Friday → Venus
  6: 8, // Saturday → Saturn
};

export function getWeekdayPlanetNumber(date: Date): number {
  return WEEKDAY_TO_PLANET_NUMBER[date.getDay()];
}

export function getWeekdayPlanetName(date: Date): string {
  const num = getWeekdayPlanetNumber(date);
  return DASHA_ORDER.find(d => d.number === num)?.planet ?? '';
}

// Determine starting Mahadasha from Destiny Number
function getStartingDashaIndex(destinyNumber: number): number {
  const idx = DASHA_ORDER.findIndex(d => d.number === destinyNumber);
  return idx >= 0 ? idx : 0;
}

export interface DashaPeriod {
  planet: string;
  planetNumber: number;
  start: Date;
  end: Date;
}

export interface DashaCycle {
  mahadasha: DashaPeriod;
  antardashas: {
    antardasha: DashaPeriod;
    pratyantarDashas: DashaPeriod[];
  }[];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function planetAtIndex(startIdx: number, offset: number): PlanetDasha {
  return DASHA_ORDER[(startIdx + offset) % 9];
}

export function calculateDashaCycles(dob: Date): DashaCycle[] {
  const destinyNum = getDestinyNumber(dob);
  const startIdx = getStartingDashaIndex(destinyNum);
  const cycles: DashaCycle[] = [];
  let currentDate = new Date(dob);

  for (let i = 0; i < 9; i++) {
    const mdPlanet = planetAtIndex(startIdx, i);
    const mdDays = (mdPlanet.years / TOTAL_DASHA_YEARS) * TOTAL_DASHA_YEARS * 365.25;
    const mdEnd = addDays(currentDate, mdDays);

    const md: DashaPeriod = {
      planet: mdPlanet.planet,
      planetNumber: mdPlanet.number,
      start: new Date(currentDate),
      end: mdEnd,
    };

    const antardashas: DashaCycle['antardashas'] = [];
    let adDate = new Date(currentDate);

    for (let j = 0; j < 9; j++) {
      const adPlanet = planetAtIndex(startIdx + i, j);
      const adDays = (mdPlanet.years * adPlanet.years / TOTAL_DASHA_YEARS) * 365.25;
      const adEnd = addDays(adDate, adDays);

      const ad: DashaPeriod = {
        planet: adPlanet.planet,
        planetNumber: adPlanet.number,
        start: new Date(adDate),
        end: adEnd,
      };

      const pratyantarDashas: DashaPeriod[] = [];
      let pdDate = new Date(adDate);

      for (let k = 0; k < 9; k++) {
        const pdPlanet = planetAtIndex(startIdx + i + j, k);
        const pdDays = (mdPlanet.years * adPlanet.years * pdPlanet.years / (TOTAL_DASHA_YEARS * TOTAL_DASHA_YEARS)) * 365.25;
        const pdEnd = addDays(pdDate, pdDays);

        pratyantarDashas.push({
          planet: pdPlanet.planet,
          planetNumber: pdPlanet.number,
          start: new Date(pdDate),
          end: pdEnd,
        });

        pdDate = pdEnd;
      }

      antardashas.push({ antardasha: ad, pratyantarDashas });
      adDate = adEnd;
    }

    cycles.push({ mahadasha: md, antardashas });
    currentDate = mdEnd;
  }

  return cycles;
}

// ============ DAILY DASHA ============

export interface DailyDashaEntry {
  date: Date;
  pdPlanet: string;
  pdNumber: number;
  weekdayNumber: number;
  dailyDasha: number;
  mdPlanet: string;
  adPlanet: string;
}

export function calculateDailyDasha(
  cycles: DashaCycle[],
  fromDate: Date,
  days: number
): DailyDashaEntry[] {
  const entries: DailyDashaEntry[] = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(fromDate, i);
    const { md, ad, pd } = findDashaForDate(cycles, date);

    if (!pd) continue;

    const weekdayNum = getWeekdayPlanetNumber(pd.start);
    const rawSum = weekdayNum + pd.planetNumber;
    const dailyDasha = reduceToSingle(rawSum);

    entries.push({
      date,
      pdPlanet: pd.planet,
      pdNumber: pd.planetNumber,
      weekdayNumber: weekdayNum,
      dailyDasha,
      mdPlanet: md?.planet ?? '',
      adPlanet: ad?.planet ?? '',
    });
  }

  return entries;
}

export function findDashaForDate(
  cycles: DashaCycle[],
  date: Date
): { md?: DashaPeriod; ad?: DashaPeriod; pd?: DashaPeriod } {
  const t = date.getTime();

  for (const cycle of cycles) {
    if (t < cycle.mahadasha.start.getTime() || t >= cycle.mahadasha.end.getTime()) continue;

    for (const adGroup of cycle.antardashas) {
      if (t < adGroup.antardasha.start.getTime() || t >= adGroup.antardasha.end.getTime()) continue;

      for (const pd of adGroup.pratyantarDashas) {
        if (t >= pd.start.getTime() && t < pd.end.getTime()) {
          return { md: cycle.mahadasha, ad: adGroup.antardasha, pd };
        }
      }
    }
  }

  return {};
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getPlanetColor(planet: string): string {
  const colors: Record<string, string> = {
    Sun: 'text-amber-400',
    Moon: 'text-slate-300',
    Mars: 'text-red-400',
    Mercury: 'text-emerald-400',
    Jupiter: 'text-yellow-300',
    Venus: 'text-pink-300',
    Saturn: 'text-blue-400',
    Rahu: 'text-purple-400',
    Ketu: 'text-orange-400',
  };
  return colors[planet] ?? '';
}
