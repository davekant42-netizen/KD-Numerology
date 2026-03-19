import { DailyDashaEntry, formatDate, getPlanetColor } from '@/lib/numerology';

interface DailyDashaTableProps {
  entries: DailyDashaEntry[];
  currentDate: Date;
}

const DailyDashaTable = ({ entries, currentDate }: DailyDashaTableProps) => {
  const todayStr = currentDate.toDateString();

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary">
            <th className="table-header-cell">Date</th>
            <th className="table-header-cell">Day</th>
            <th className="table-header-cell">MD</th>
            <th className="table-header-cell">AD</th>
            <th className="table-header-cell">PD</th>
            <th className="table-header-cell">PD#</th>
            <th className="table-header-cell">Wkday#</th>
            <th className="table-header-cell">Daily Dasha</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const isToday = e.date.toDateString() === todayStr;
            const dayName = e.date.toLocaleDateString('en', { weekday: 'short' });
            return (
              <tr key={i} className={isToday ? 'bg-primary/10' : 'hover:bg-secondary/50'}>
                <td className="table-data-cell font-mono text-xs">{formatDate(e.date)}</td>
                <td className="table-data-cell text-xs">{dayName}</td>
                <td className={`table-data-cell text-xs ${getPlanetColor(e.mdPlanet)}`}>{e.mdPlanet}</td>
                <td className={`table-data-cell text-xs ${getPlanetColor(e.adPlanet)}`}>{e.adPlanet}</td>
                <td className={`table-data-cell text-xs ${getPlanetColor(e.pdPlanet)}`}>{e.pdPlanet}</td>
                <td className="table-data-cell number-cell">{e.pdNumber}</td>
                <td className="table-data-cell number-cell">{e.weekdayNumber}</td>
                <td className="table-data-cell">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 font-mono font-bold text-primary text-lg">
                    {e.dailyDasha}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DailyDashaTable;
