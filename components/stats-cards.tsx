"use client"

import { DollarSign, TrendingUp, BarChart3, Calendar } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFunds } from "@/lib/use-funds"

export function StatsCards() {
  const { funds, totalDividends, averageYield } = useFunds()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total em Fundos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              funds.reduce((acc, fund) => acc + fund.totalValue, 0),
            )}
          </div>
          <p className="text-xs text-muted-foreground">{funds.length} fundos em carteira</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dividend Yield Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageYield}%</div>
          <p className="text-xs text-muted-foreground">Anualizado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total em Dividendos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalDividends)}
          </div>
          <p className="text-xs text-muted-foreground">Último mês</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(1250.0)}
          </div>
          <p className="text-xs text-muted-foreground">Previsão para 15/05/2024</p>
        </CardContent>
      </Card>
    </div>
  )
}
