import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import NumerologySummary from '@/components/NumerologySummary';
import DashaTable from '@/components/DashaTable';
import DailyDashaTable from '@/components/DailyDashaTable';
import { calculateDashaCycles, calculateDailyDasha, findDashaForDate, formatDate, getPlanetColor } from '@/lib/numerology';

// Student lookup (expandable via students.json structure)
const STUDENTS: Record<string, { name: string; dob: string }> = {};

const Index = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const student = studentId ? STUDENTS[studentId] : null;

  const [dobInput, setDobInput] = useState(student?.dob ?? '');
  const [dailyDays, setDailyDays] = useState(30);

  const dob = useMemo(() => {
    if (!dobInput) return null;
    const d = new Date(dobInput + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [dobInput]);

  const cycles = useMemo(() => dob ? calculateDashaCycles(dob) : [], [dob]);

  const today = useMemo(() => new Date(), []);

  const currentDasha = useMemo(() => {
    if (!cycles.length) return null;
    return findDashaForDate(cycles, today);
  }, [cycles, today]);

  const dailyEntries = useMemo(() => {
    if (!cycles.length) return [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7); // show 7 days before today
    return calculateDailyDasha(cycles, startDate, dailyDays + 7);
  }, [cycles, today, dailyDays]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-primary tracking-tight">
              KD Numerology
            </h1>
            <p className="text-xs text-muted-foreground">Precision calculations • Data-driven insights</p>
          </div>
          {student && (
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{student.name}</p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* DOB Input */}
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={dobInput}
              onChange={e => setDobInput(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {dob && (
            <p className="text-sm text-muted-foreground pb-2">
              {formatDate(dob)} — {dob.toLocaleDateString('en', { weekday: 'long' })}
            </p>
          )}
        </div>

        {dob && (
          <>
            {/* Numerology Summary */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Core Numbers
              </h2>
              <NumerologySummary dob={dob} />
            </section>

            {/* Current Dasha at a glance */}
            {currentDasha?.md && (
              <section className="rounded-lg bg-card border border-border p-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Current Dasha — {formatDate(today)}
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Mahadasha</p>
                    <p className={`text-lg font-bold ${getPlanetColor(currentDasha.md.planet)}`}>
                      {currentDasha.md.planet}
                      <span className="ml-2 font-mono text-sm text-primary">{currentDasha.md.planetNumber}</span>
                    </p>
                  </div>
                  {currentDasha.ad && (
                    <div>
                      <p className="text-xs text-muted-foreground">Antardasha</p>
                      <p className={`text-lg font-bold ${getPlanetColor(currentDasha.ad.planet)}`}>
                        {currentDasha.ad.planet}
                        <span className="ml-2 font-mono text-sm text-primary">{currentDasha.ad.planetNumber}</span>
                      </p>
                    </div>
                  )}
                  {currentDasha.pd && (
                    <div>
                      <p className="text-xs text-muted-foreground">Pratyantar Dasha</p>
                      <p className={`text-lg font-bold ${getPlanetColor(currentDasha.pd.planet)}`}>
                        {currentDasha.pd.planet}
                        <span className="ml-2 font-mono text-sm text-primary">{currentDasha.pd.planetNumber}</span>
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Dasha Tables */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Dasha Hierarchy
              </h2>
              <DashaTable cycles={cycles} currentDate={today} />
            </section>

            {/* Daily Dasha */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Daily Dasha Forecast
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Days ahead:</label>
                  <select
                    value={dailyDays}
                    onChange={e => setDailyDays(Number(e.target.value))}
                    className="bg-card border border-border rounded px-2 py-1 text-xs font-mono text-foreground"
                  >
                    <option value={7}>7</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={90}>90</option>
                  </select>
                </div>
              </div>
              <DailyDashaTable entries={dailyEntries} currentDate={today} />
            </section>
          </>
        )}

        {!dob && (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted-foreground text-lg">Enter a Date of Birth to begin analysis</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
