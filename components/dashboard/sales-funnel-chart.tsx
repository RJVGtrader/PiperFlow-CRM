"use client";

import { Funnel, FunnelChart, LabelList } from "recharts";

import { dealStageConfig } from "@/components/kanban/deal-stage";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import type { FunnelStageData } from "@/lib/metrics";
import { formatCurrency } from "@/lib/utils";

interface SalesFunnelChartProps {
  stages: FunnelStageData[];
  lostDeals: number;
}

const chartConfig = Object.fromEntries(
  Object.entries(dealStageConfig).map(([stage, config]) => [
    stage,
    { label: config.label, color: config.color },
  ])
) satisfies ChartConfig;

function formatPercent(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

function pluralizeDeals(count: number) {
  return `${count} ${count === 1 ? "negócio" : "negócios"}`;
}

export function SalesFunnelChart({ stages, lostDeals }: SalesFunnelChartProps) {
  const data = stages.map((item) => ({
    ...item,
    label: dealStageConfig[item.stage].label,
    fill: `var(--color-${item.stage})`,
  }));

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
        <FunnelChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              const item = payload?.[0]?.payload as (typeof data)[number] | undefined;
              if (!active || !item) return null;

              return (
                <div className="grid min-w-[11rem] gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-xl">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />
                    {item.label}
                  </div>
                  <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Chegaram aqui</span>
                    <span className="font-mono font-medium text-foreground">{item.reached}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Nesta etapa agora</span>
                    <span className="font-mono font-medium text-foreground">{item.current}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-muted-foreground">
                    <span>Valor na etapa</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Funnel
            dataKey="reached"
            data={data}
            nameKey="label"
            stroke="hsl(var(--card))"
            strokeWidth={2}
          >
            <LabelList
              dataKey="reached"
              position="center"
              className="fill-[#0C0C0E] font-mono text-sm font-semibold"
              stroke="none"
            />
          </Funnel>
        </FunnelChart>
      </ChartContainer>

      <ol className="space-y-1">
        {data.map((item, index) => {
          const previous = data[index - 1];
          const stepRate =
            previous && previous.reached > 0 ? item.reached / previous.reached : null;

          return (
            <li key={item.stage} className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: dealStageConfig[item.stage].color }}
              />
              <span className="min-w-0 flex-1 truncate text-foreground">{item.label}</span>
              <span className="font-mono font-semibold text-foreground">{item.reached}</span>
              <span className="w-12 text-right text-xs text-muted-foreground">
                {stepRate === null ? "—" : formatPercent(stepRate)}
              </span>
            </li>
          );
        })}

        <li className="mt-2 border-t border-border px-2 pt-3 text-xs text-muted-foreground">
          % = avanço em relação à etapa anterior.{" "}
          {lostDeals > 0 && `${pluralizeDeals(lostDeals)} em Fechado Perdido ficam fora do funil.`}
        </li>
      </ol>
    </div>
  );
}
