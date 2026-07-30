import Link from "next/link";
import { UserX } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export default function LeadNotFound() {
  return (
    <div className="space-y-6">
      <Link
        href="/leads"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Voltar para Leads
      </Link>

      <EmptyState
        icon={UserX}
        title="Lead não encontrado"
        description="Esse lead não existe ou foi removido."
      />
    </div>
  );
}
