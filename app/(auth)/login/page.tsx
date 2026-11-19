import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authHref, type AuthSearchParams } from "@/lib/app-url";

export const metadata: Metadata = {
  title: "Entrar | PipeFlow CRM",
};

const errorMessages: Record<string, string> = {
  link_invalido: "O link de confirmação é inválido ou expirou. Entre ou cadastre-se novamente.",
};

export default function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Acesse o pipeline de vendas da sua empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            next={searchParams.next}
            defaultEmail={searchParams.email}
            initialError={searchParams.error ? errorMessages[searchParams.error] : undefined}
          />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Não tem uma conta?&nbsp;
          <Link
            href={authHref("/signup", searchParams)}
            className="font-medium text-brand hover:underline"
          >
            Criar conta grátis
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
