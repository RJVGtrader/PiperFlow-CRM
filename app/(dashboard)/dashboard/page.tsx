import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Métricas de vendas e funil da sua equipe.</p>
      </div>

      <EmptyState
        icon={LayoutDashboard}
        title="Suas métricas aparecem aqui"
        description="Os cards de métricas e o gráfico de funil de vendas chegam na M6."
      />
    </div>
  );
}
