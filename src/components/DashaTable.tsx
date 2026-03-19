import { DashaCycle, formatDate, getPlanetColor } from '@/lib/numerology';

interface DashaTableProps {
  cycles: DashaCycle[];
  currentDate: Date;
}

const DashaTable = ({ cycles, currentDate }: DashaTableProps) => {
  const now = currentDate.getTime();

  // Find current MD index
  const currentMdIdx = cycles.findIndex(
    c => now >= c.mahadasha.start.getTime() && now < c.mahadasha.end.getTime()
  );

  return (
    <div className="space-y-6">
      {/* Mahadasha Overview */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Mahadasha Periods</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="table-header-cell">Planet</th>
                <th className="table-header-cell">#</th>
                <th className="table-header-cell">Years</th>
                <th className="table-header-cell">Start</th>
                <th className="table-header-cell">End</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c, i) => {
                const isCurrent = i === currentMdIdx;
                return (
                  <tr key={i} className={isCurrent ? 'bg-primary/10' : 'hover:bg-secondary/50'}>
                    <td className={`table-data-cell font-semibold ${getPlanetColor(c.mahadasha.planet)}`}>
                      {c.mahadasha.planet}
                    </td>
                    <td className="table-data-cell number-cell">{c.mahadasha.planetNumber}</td>
                    <td className="table-data-cell number-cell">
                      {Math.round((c.mahadasha.end.getTime() - c.mahadasha.start.getTime()) / (365.25 * 86400000))}y
                    </td>
                    <td className="table-data-cell font-mono text-xs">{formatDate(c.mahadasha.start)}</td>
                    <td className="table-data-cell font-mono text-xs">{formatDate(c.mahadasha.end)}</td>
                    <td className="table-data-cell">
                      {isCurrent && <span className="text-xs font-semibold text-primary">● Active</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Antardasha & PD Detail */}
      {currentMdIdx >= 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Antardasha in {cycles[currentMdIdx].mahadasha.planet} MD
          </h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  <th className="table-header-cell">AD Planet</th>
                  <th className="table-header-cell">#</th>
                  <th className="table-header-cell">Start</th>
                  <th className="table-header-cell">End</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {cycles[currentMdIdx].antardashas.map((adGroup, j) => {
                  const ad = adGroup.antardasha;
                  const isCurrentAd = now >= ad.start.getTime() && now < ad.end.getTime();
                  return (
                    <tr key={j} className={isCurrentAd ? 'bg-primary/10' : 'hover:bg-secondary/50'}>
                      <td className={`table-data-cell font-semibold ${getPlanetColor(ad.planet)}`}>
                        {ad.planet}
                      </td>
                      <td className="table-data-cell number-cell">{ad.planetNumber}</td>
                      <td className="table-data-cell font-mono text-xs">{formatDate(ad.start)}</td>
                      <td className="table-data-cell font-mono text-xs">{formatDate(ad.end)}</td>
                      <td className="table-data-cell">
                        {isCurrentAd && <span className="text-xs font-semibold text-primary">● Active</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashaTable;
