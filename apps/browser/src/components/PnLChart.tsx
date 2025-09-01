
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * The chart will use game history points passed in via props.
 * Provide an array of { date: string; pnl: number } OR raw history with pnl strings like "+$12.50".
 * If no data is provided, it will render an empty axis.
 */
export type PnLPoint = { date: string; pnl: number };

function coerceHistoryToPoints(history?: { date: string; pnl: string | number }[]): PnLPoint[] {
  if (!history?.length) return [];
  // Sort by date ascending if possible (expects ISO-like or yyyy-mm-dd)
  const sorted = [...history].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return isNaN(da) || isNaN(db) ? 0 : da - db;
  });

  // Build cumulative PnL over time
  let running = 0;
  return sorted.map((g) => {
    const n = typeof g.pnl === 'number' ? g.pnl : parseFloat(String(g.pnl).replace(/[^-0-9.]/g, '')) || 0;
    running += n;
    // Format date as short label if needed
    const d = new Date(g.date);
    const label = isNaN(d.getTime())
      ? g.date
      : `${d.getMonth() + 1}/${d.getDate()}`;
    return { date: label, pnl: Number(running.toFixed(2)) };
  });
}

export const PnLChart = ({ history }: { history?: { date: string; pnl: string | number }[] }) => {
  const points = coerceHistoryToPoints(history);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          {/* Define a subtle green gradient for the line stroke */}
          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.08)"
          />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--foreground))"
            fontSize={13}
            fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
            height={36}
            tickMargin={8}
            tick={{
              fill: 'hsl(var(--foreground))',
              fontSize: 13
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            fontSize={13}
            fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
            width={60}
            tickMargin={8}
            tick={{
              fill: 'hsl(var(--foreground))',
              fontSize: 13
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickFormatter={(value) => `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--bg-panel))',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontSize: '12px',
              color: 'hsl(var(--text-primary))',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(6px)',
            }}
            labelStyle={{ color: 'hsl(var(--accent-purple))', fontWeight: 600 }}
            formatter={(value: number) => [
              <span style={{ color: '#22c55e', fontWeight: 600 }}>{`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>, 
              'PnL'
            ]}
          />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="url(#greenGradient)"
            strokeWidth={3}
            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
            activeDot={{
              r: 6,
              stroke: '#22c55e',
              strokeWidth: 2,
              fill: 'hsl(var(--background))'
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
