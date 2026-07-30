import Link from "next/link";
import { Workflow } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, hsl(var(--brand) / 0.12), transparent 60%)",
        }}
      />

      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
          <Workflow className="size-4" />
        </span>
        <span>PipeFlow CRM</span>
      </Link>

      <div className="w-full">{children}</div>
    </div>
  );
}
