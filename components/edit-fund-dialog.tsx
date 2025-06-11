"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useFunds } from "@/lib/use-funds"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  shares: z.coerce.number().min(1, {
    message: "Deve ter pelo menos 1 cota",
  }),
  price: z.coerce.number().min(0.01, {
    message: "O preço deve ser maior que zero",
  }),
})

interface EditFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticker: string | null
}

export function EditFundDialog({ open, onOpenChange, ticker }: EditFundDialogProps) {
  const { funds, updateFund } = useFunds()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialValues, setInitialValues] = useState({ shares: 0, price: 0 })

  const fund = ticker ? funds.find((f) => f.ticker === ticker) : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  // Atualiza os valores do formulário quando o fundo muda
  useEffect(() => {
    if (fund && open) {
      const values = {
        shares: fund.shares,
        price: fund.price,
      }
      setInitialValues(values)
      form.reset(values)
    }
  }, [fund, form, open])

  // Limpa o formulário quando o diálogo é fechado
  useEffect(() => {
    if (!open) {
      // Pequeno timeout para garantir que o diálogo seja fechado antes de resetar o form
      setTimeout(() => {
        form.reset(initialValues)
      }, 100)
    }
  }, [open, form, initialValues])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!ticker || isSubmitting) return

    setIsSubmitting(true)

    try {
      updateFund(ticker, values.shares, values.price)

      toast({
        title: "Fundo atualizado",
        description: `${ticker} foi atualizado com sucesso.`,
        duration: 3000,
      })

      // Fechar o diálogo
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar fundo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o fundo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!fund) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isSubmitting) return // Previne fechamento durante submissão
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar {fund.ticker}</DialogTitle>
          <DialogDescription>Atualize os detalhes do fundo em seu portfólio.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Ticker</div>
                <div className="font-medium">{fund.ticker}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Nome</div>
                <div className="font-medium">{fund.name}</div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Cotas</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço por Cota (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              Valor total:{" "}
              <span className="font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(form.watch("price") * form.watch("shares"))}
              </span>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
