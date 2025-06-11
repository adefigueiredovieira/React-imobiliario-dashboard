"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect, useRef } from "react"
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
import type { ApiFund } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { fetchFunds } from "@/lib/api"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  ticker: z.string().min(1, {
    message: "Ticker é obrigatório",
  }),
  shares: z.coerce.number().min(1, {
    message: "Deve ter pelo menos 1 cota",
  }),
  price: z.coerce.number().min(0.01, {
    message: "O preço deve ser maior que zero",
  }),
})

interface AddFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fund?: ApiFund | null
}

export function AddFundDialog({ open, onOpenChange, fund }: AddFundDialogProps) {
  const { addFundToPortfolio } = useFunds()
  const router = useRouter()
  const [availableFunds, setAvailableFunds] = useState<ApiFund[]>([])
  const [filteredFunds, setFilteredFunds] = useState<ApiFund[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFund, setSelectedFund] = useState<ApiFund | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
      shares: 100,
      price: 0,
    },
  })

  // Atualizar o formulário quando um fundo for passado como prop
  useEffect(() => {
    if (fund && open) {
      setSelectedFund(fund)
      form.setValue("ticker", fund.ticker)
      form.setValue("price", fund.price)
    }
  }, [fund, open, form])

  // Carregar a lista de fundos disponíveis
  useEffect(() => {
    async function loadFunds() {
      setLoading(true)
      try {
        console.log("Carregando lista de fundos...")
        const funds = await fetchFunds()

        if (funds && Array.isArray(funds)) {
          setAvailableFunds(funds)
          console.log(`${funds.length} fundos carregados com sucesso`)
        } else {
          console.warn("Dados de fundos inválidos recebidos")
          setAvailableFunds([])
          toast({
            title: "Aviso",
            description:
              "Não foi possível carregar a lista completa de fundos. Você ainda pode adicionar fundos manualmente.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar fundos:", error)
        setAvailableFunds([])
        toast({
          title: "Erro",
          description:
            "Não foi possível carregar a lista de fundos disponíveis. Você pode adicionar fundos manualmente digitando o ticker.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      loadFunds()
    }
  }, [open])

  // Filtrar fundos conforme o usuário digita
  useEffect(() => {
    const ticker = form.watch("ticker")
    if (ticker && ticker.length > 0) {
      const filtered = availableFunds.filter(
        (fund) =>
          fund.ticker.toLowerCase().includes(ticker.toLowerCase()) ||
          fund.name.toLowerCase().includes(ticker.toLowerCase()),
      )
      setFilteredFunds(filtered.slice(0, 10)) // Limitar a 10 resultados
    } else {
      setFilteredFunds([])
    }
  }, [form.watch("ticker"), availableFunds])

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Atualizar o preço quando um fundo for selecionado
  useEffect(() => {
    if (selectedFund) {
      form.setValue("ticker", selectedFund.ticker)
      form.setValue("price", selectedFund.price)
    }
  }, [selectedFund, form])

  const handleSelectFund = (fund: ApiFund) => {
    setSelectedFund(fund)
    form.setValue("ticker", fund.ticker)
    form.setValue("price", fund.price)
    setShowSuggestions(false)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Se temos um fundo selecionado, usamos ele
      if (selectedFund) {
        addFundToPortfolio(selectedFund, values.shares)
      } else {
        // Caso contrário, procuramos pelo ticker
        const fund = availableFunds.find((f) => f.ticker === values.ticker.toUpperCase())
        if (fund) {
          addFundToPortfolio(fund, values.shares)
        } else {
          // Se não encontrarmos, criamos um fundo básico
          addFundToPortfolio(
            {
              ticker: values.ticker.toUpperCase(),
              name: values.ticker.toUpperCase(),
              price: values.price,
              dividendYield: 0,
              sector: "Não informado",
              lastDividend: 0,
              patrimony: 0,
              pvp: 0,
            },
            values.shares,
          )
        }
      }

      toast({
        title: "Fundo adicionado",
        description: `${values.ticker.toUpperCase()} foi adicionado ao seu portfólio.`,
        onClose: () => {
          router.refresh()
        },
        duration: 3000,
      })

      form.reset()
      setSelectedFund(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao adicionar fundo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o fundo.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Fundo</DialogTitle>
          <DialogDescription>Adicione um novo fundo ao seu portfólio.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ticker do Fundo</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite o ticker ou nome do fundo..."
                        onFocus={() => setShowSuggestions(true)}
                        ref={inputRef}
                        autoComplete="off"
                      />
                    </FormControl>
                    {showSuggestions && filteredFunds.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md"
                      >
                        <div className="max-h-[200px] overflow-auto p-1">
                          {filteredFunds.map((fund) => (
                            <div
                              key={fund.ticker}
                              className={cn(
                                "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm",
                                selectedFund?.ticker === fund.ticker
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground",
                              )}
                              onClick={() => handleSelectFund(fund)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{fund.ticker}</span>
                                <span className="text-xs text-muted-foreground">{fund.name}</span>
                              </div>
                              {selectedFund?.ticker === fund.ticker && <Check className="h-4 w-4" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Adicionar ao Portfólio"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
