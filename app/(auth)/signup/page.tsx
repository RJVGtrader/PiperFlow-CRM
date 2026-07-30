import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Criar conta | PipeFlow CRM",
};

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Criar conta grátis</CardTitle>
          <CardDescription>Grátis para até 2 colaboradores. Sem cartão de crédito.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Já tem uma conta?&nbsp;
          <Link href="/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
