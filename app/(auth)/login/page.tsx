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

export const metadata: Metadata = {
  title: "Entrar | PipeFlow CRM",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Acesse o pipeline de vendas da sua empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Não tem uma conta?&nbsp;
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Criar conta grátis
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
