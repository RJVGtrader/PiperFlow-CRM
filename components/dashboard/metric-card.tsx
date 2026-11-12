import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Linha de contexto abaixo do valor (ex.: "3 ganhos de 6 fechados"). */
  description: string;
}

export function MetricCard({ label, value, icon: Icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex size-8 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Icon className="size-4" />
          </div>
        </div>

        <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">{value}</p>

        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
