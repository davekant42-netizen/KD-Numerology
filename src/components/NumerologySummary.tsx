import { getRootNumber, getDestinyNumber, reduceToSingle } from '@/lib/numerology';

interface NumerologySummaryProps {
  dob: Date;
}

const NumerologySummary = ({ dob }: NumerologySummaryProps) => {
  const rootNumber = getRootNumber(dob);
  const destinyNumber = getDestinyNumber(dob);
  const daySum = dob.getDate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-card p-5 gold-glow border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Root Number</p>
        <p className="text-5xl font-mono font-bold text-primary">{rootNumber}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Day: {dob.getDate()} → {daySum > 9 ? `${daySum} → ${rootNumber}` : rootNumber}
        </p>
      </div>
      <div className="rounded-lg bg-card p-5 gold-glow border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Destiny Number</p>
        <p className="text-5xl font-mono font-bold text-primary">{destinyNumber}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {dob.getDate()} + {dob.getMonth() + 1} + {reduceToSingle(dob.getFullYear())} → {destinyNumber}
        </p>
      </div>
    </div>
  );
};

export default NumerologySummary;
