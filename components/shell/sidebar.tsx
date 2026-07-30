import { ShellNav } from "@/components/shell/shell-nav";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <ShellNav />
    </aside>
  );
}
