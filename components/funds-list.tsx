"use client"

import { useState, useCallback, memo } from "react"
import { Search, TrendingUp, ArrowUpDown, MoreHorizontal, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFunds } from "@/lib/use-funds"
import Link from "next/link"
import { EditFundDialog } from "./edit-fund-dialog"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Componente de linha de tabela memorizado para evitar re-renderizações desnecessárias
const FundRow = memo(
  ({
    fund,
    onEdit,
    onRemove,
  }: {
    fund: any
    onEdit: (ticker: string) => void
    onRemove: (ticker: string) => void
  }) => {
    return (
      <TableRow>
        <TableCell>
          <div className="font-medium">{fund.ticker}</div>
          <div className="text-sm text-muted-foreground">{fund.name}</div>
        </TableCell>
        <TableCell>{fund.shares}</TableCell>
        <TableCell>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(fund.price)}
        </TableCell>
        <TableCell>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(fund.totalValue)}
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
            <span>{fund.dividendYield}%</span>
          </div>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/fundos/${fund.ticker}`}>Ver detalhes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(fund.ticker)}>Editar</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRemove(fund.ticker)}
              >
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  },
)
FundRow.displayName = "FundRow"

export function FundsList() {
  const { funds, removeFund } = useFunds()
  const [searchQuery, setSearchQuery] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const router = useRouter()

  const filteredFunds = funds.filter(
    (fund) =>
      fund.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fund.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Usar useCallback para evitar recriações desnecessárias da função
  const handleEdit = useCallback((ticker: string) => {
    setSelectedTicker(ticker)
    setEditDialogOpen(true)
  }, [])

  // Usar useCallback para evitar recriações desnecessárias da função
  const handleEditDialogChange = useCallback((open: boolean) => {
    setEditDialogOpen(open)
    if (!open) {
      // Limpa o ticker selecionado quando o diálogo é fechado
      setTimeout(() => {
        setSelectedTicker(null)
      }, 300)
    }
  }, [])

  // Função para remover um fundo com confirmação
  const handleRemoveFund = useCallback(
    (ticker: string) => {
      if (window.confirm(`Tem certeza que deseja remover o fundo ${ticker}?`)) {
        removeFund(ticker)
        toast({
          title: "Fundo removido",
          description: `${ticker} foi removido do seu portfólio.`,
          duration: 3000,
        })
      }
    },
    [removeFund],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fundos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 md:w-[300px]"
        />
      </div>

      {funds.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você ainda não adicionou nenhum fundo ao seu portfólio. Use o botão "Adicionar Fundo" no cabeçalho para
            começar.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <span>Fundo</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Cotas</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <span>Dividend Yield</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunds.length > 0 ? (
                filteredFunds.map((fund) => (
                  <FundRow key={fund.ticker} fund={fund} onEdit={handleEdit} onRemove={handleRemoveFund} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {funds.length > 0 ? "Nenhum fundo encontrado" : "Nenhum fundo adicionado"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Renderizar o diálogo apenas quando necessário */}
      {editDialogOpen && (
        <EditFundDialog open={editDialogOpen} onOpenChange={handleEditDialogChange} ticker={selectedTicker} />
      )}
    </div>
  )
}
