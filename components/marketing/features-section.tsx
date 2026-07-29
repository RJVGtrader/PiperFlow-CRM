import {
  KanbanSquare,
  Users,
  History,
  Building2,
  BarChart3,
  Search,
} from "lucide-react";

const features = [
  {
    icon: KanbanSquare,
    title: "Pipeline Kanban",
    description:
      "Arraste negócios entre as etapas — de Novo Lead a Fechado Ganho — e veja o funil inteiro de uma só vez.",
  },
  {
    icon: Users,
    title: "Gestão de leads",
    description:
      "Cadastre leads com nome, e-mail, telefone, empresa e cargo. Busque e filtre por status ou responsável.",
  },
  {
    icon: History,
    title: "Timeline de atividades",
    description:
      "Registre ligações, e-mails, reuniões e notas — tudo organizado cronologicamente na página do lead.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    description:
      "Crie um workspace por empresa ou cliente e convide colaboradores com papéis de admin ou membro.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de métricas",
    description:
      "Acompanhe total de leads, negócios abertos, valor do pipeline e taxa de conversão em tempo real.",
  },
  {
    icon: Search,
    title: "Busca e filtros",
    description:
      "Encontre qualquer lead ou negócio rapidamente com busca e filtros por status, responsável e data.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que seu time precisa para vender mais
          </h2>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Sem a complexidade de automação de marketing. Só as ferramentas que realmente movem o
            ponteiro em vendas.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
