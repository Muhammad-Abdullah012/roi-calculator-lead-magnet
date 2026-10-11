"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { ProjectionChartData } from "@/lib/calculator";
import type { CurrencyDef } from "@/lib/schema";
import { formatCurrency } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface ProjectionChartCardProps {
  chart: ProjectionChartData;
  currency: CurrencyDef;
}

export function ProjectionChartCard({ chart, currency }: ProjectionChartCardProps) {
  const labelKey = "month";
  const count = Math.max(...chart.series.map((series) => series.points.length));

  const data = Array.from({ length: count }, (_, month) => {
    const row: Record<string, number> = { [labelKey]: month };
    for (const series of chart.series) {
      row[series.label] = series.points[month]?.value ?? 0;
    }
    return row;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chart.title}</CardTitle>
        {chart.description && <CardDescription>{chart.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--page-border)" />
              <XAxis
                dataKey={labelKey}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--brand-muted)", fontSize: 12 }}
                tickFormatter={(value) => `M${value}`}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={70}
                tick={{ fill: "var(--brand-muted)", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--page-border)",
                  background: "var(--page-surface)",
                  color: "var(--page-fg)",
                }}
                labelFormatter={(value) => `Month ${value}`}
                formatter={(value, name) => [formatCurrency(Number(value), currency), String(name)]}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: "var(--brand-muted)" }}
              />
              {chart.series.map((series) => (
                <Line
                  key={series.label}
                  type="monotone"
                  dataKey={series.label}
                  stroke={series.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
