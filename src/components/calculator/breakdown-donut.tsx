import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatEuro } from "@/lib/tax/format";

export type Slice = { name: string; value: number; color: string };

export function BreakdownDonut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: Slice[];
  centerLabel: string;
  centerValue: string;
}) {
  const data = slices.filter((s) => s.value > 0);

  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="94%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [formatEuro(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {centerLabel}
        </span>
        <span className="num text-xl font-semibold">{centerValue}</span>
      </div>
    </div>
  );
}
