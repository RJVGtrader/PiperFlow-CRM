const columns = [
  {
    title: "Novo Lead",
    dot: "bg-slate-400",
    cards: [
      { title: "Consultoria Almeida", value: "R$ 4.200" },
      { title: "Studio Rocha", value: "R$ 1.800" },
    ],
  },
  {
    title: "Proposta Enviada",
    dot: "bg-amber-400",
    cards: [{ title: "Grupo Vitória", value: "R$ 12.500" }],
  },
  {
    title: "Fechado Ganho",
    dot: "bg-emerald-500",
    cards: [{ title: "Nortec Distribuidora", value: "R$ 8.900" }],
    highlight: true,
  },
];

export function PipelinePreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-brand/10 blur-2xl" aria-hidden />
      <div className="rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Pipeline de vendas</p>
          <span className="text-xs text-muted-foreground">R$ 27.400 em aberto</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-1">
                <span className={`size-1.5 rounded-full ${column.dot}`} aria-hidden />
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {column.title}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {column.cards.map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-md border p-2.5 text-left shadow-sm ${
                      column.highlight
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                        : "border-border bg-background"
                    }`}
                  >
                    <p className="truncate text-xs font-medium">{card.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
