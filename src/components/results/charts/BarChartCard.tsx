"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BarChartData } from "@/lib/calculator";
import type { CurrencyDef } from "@/lib/schema";
import { formatCurrency } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface BarChartCardProps {
  chart: BarChartData;
  currency: CurrencyDef;
}

export function BarChartCard({ chart, currency }: BarChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{chart.title}</CardTitle>
        {chart.description && <CardDescription>{chart.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--page-border)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--brand-muted)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={70}
                tick={{ fill: "var(--brand-muted)", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, currency, { compact: true })}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in srgb, var(--brand-primary) 8%, transparent)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--page-border)",
                  background: "var(--page-surface)",
                  color: "var(--page-fg)",
                }}
                formatter={(value) => [formatCurrency(Number(value), currency), ""]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={90}>
                {chart.data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
