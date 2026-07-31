"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { dealStageOptions, dealStages } from "@/components/kanban/deal-stage";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockOwners } from "@/lib/mock-data";
import type { Deal, DealStage } from "@/types/deal";
import type { Lead } from "@/types/lead";

const dealSchema = z.object({
  title: z.string().min(2, "Informe o título do negócio."),
  value: z.coerce.number().positive("Informe um valor maior que zero."),
  leadId: z.string().min(1, "Selecione o lead vinculado."),
  ownerName: z.string().min(1, "Selecione um responsável."),
  stage: z.enum(dealStages as [DealStage, ...DealStage[]]),
  dueDate: z.string().min(1, "Informe o prazo."),
});

export type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormProps {
  leads: Lead[];
  defaultValues?: Partial<Deal>;
  defaultStage?: DealStage;
  submitLabel: string;
  onSubmit: (values: DealFormValues) => Promise<void> | void;
}

export function DealForm({ leads, defaultValues, defaultStage, submitLabel, onSubmit }: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      value: defaultValues?.value ?? 0,
      leadId: defaultValues?.leadId ?? leads[0]?.id ?? "",
      ownerName: defaultValues?.ownerName ?? mockOwners[0],
      stage: defaultValues?.stage ?? defaultStage ?? "novo_lead",
      dueDate: defaultValues?.dueDate ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      title: defaultValues?.title ?? "",
      value: defaultValues?.value ?? 0,
      leadId: defaultValues?.leadId ?? leads[0]?.id ?? "",
      ownerName: defaultValues?.ownerName ?? mockOwners[0],
      stage: defaultValues?.stage ?? defaultStage ?? "novo_lead",
      dueDate: defaultValues?.dueDate ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  async function handleSubmit(values: DealFormValues) {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do negócio</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Plano Pro anual — Empresa X" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor estimado (R$)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={100} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="leadId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead vinculado</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lead" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} · {lead.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockOwners.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa</FormLabel>
                <Select value={field.value} onValueChange={(value) => field.onChange(value as DealStage)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dealStageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
}
