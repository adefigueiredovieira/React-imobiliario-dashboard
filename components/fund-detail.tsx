"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFunds } from "@/lib/use-funds"
import { ArrowLeftIcon, Building2, CalendarIcon, TrendingUp, Wallet, RefreshCw, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { ChartContainer, ChartTooltipContent } from "./ui/chart"
import { useEffect, useState } from "react"
import { fetchFundDetails, fetchFundDividends, type ApiDividend } from "@/lib/api"
import { Skeleton } from "./ui/skeleton"

export function FundDetail({ ticker }: { ticker: string }) {
  const { funds, payments, updateFundPrice } = useFunds()
  const fund = funds.find((f) => f.ticker.toLowerCase() === ticker.toLowerCase())
  const fundPayments = payments.filter((p) => p.ticker === ticker)

  const [loading, setLoading] = useState(false)
  const [apiDividends, setApiDividends] = useState<ApiDividend[]>([])
  const [dividendData, setDividendData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Função para buscar dados atualizados do fundo
  const fetchFundData = async () => {
    if (!fund) return

    setLoading(true)
    setError(null)

    try {
      // Buscar detalhes do fundo
      const fundDetails = await fetchFundDetails(fund.ticker)

      // Atualizar o preço do fundo no contexto
      if (fundDetails) {
        updateFundPrice(fund.ticker, fundDetails.price)
      }

      // Buscar histórico de dividendos
      const dividends = await fetchFundDividends(fund.ticker)
      setApiDividends(dividends)

      // Preparar dados para o gráfico
      if (dividends && dividends.length > 0) {
        const chartData = dividends
          .slice(0, 12)
          .reverse()
          .map((div) => ({
            month: new Date(div.date).toLocaleDateString("pt-BR", { month: "short" }),
            value: div.value,
          }))

        setDividendData(chartData)
      }
    } catch (err) {
      console.error("Erro ao buscar dados do fundo:", err)
      setError("Não foi possível carregar os dados atualizados do fundo.")
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados ao carregar o componente
  useEffect(() => {
    if (fund) {
      fetchFundData()
    }
  }, [fund])

  if (!fund) {
    return (
      <Alert>
        <AlertTitle>Fundo não encontrado</AlertTitle>
        <AlertDescription>
          Não encontramos o fundo com o ticker {ticker}.
          <Link href="/fundos" className="ml-2 underline">
            Voltar para lista de fundos
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/fundos">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{fund.ticker}</h1>
          <span className="text-xl text-muted-foreground">{fund.name}</span>
        </div>

        <Button variant="outline" size="sm" onClick={fetchFundData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Usando dados simulados para demonstração. Em um ambiente de produção, estes dados seriam obtidos da API real.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(fund.price)}
                </div>
                <p className="text-xs text-muted-foreground">Por cota</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(fund.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">{fund.shares} cotas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{fund.dividendYield.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Anual</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Dividendo</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(fund.lastDividend || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Por cota</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dividends">
        <TabsList>
          <TabsTrigger value="dividends">Dividendos</TabsTrigger>
          <TabsTrigger value="history">Histórico de Pagamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="dividends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Dividendos</CardTitle>
              <CardDescription>Pagamentos por cota nos últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    value: {
                      label: "Valor (R$)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dividendData.length > 0 ? dividendData : []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" name="Valor por cota" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Dividendos</CardTitle>
              <CardDescription>Resumo dos valores de dividendos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Média Mensal</div>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          apiDividends.length > 0
                            ? apiDividends.reduce((sum, div) => sum + div.value, 0) / apiDividends.length
                            : 0.85,
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Por cota</div>
                    </>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Anual</div>
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          apiDividends.length > 0 ? apiDividends.reduce((sum, div) => sum + div.value, 0) : 0.85 * 12,
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Por cota</div>
                    </>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Dividend Yield Médio</div>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{fund.dividendYield.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">Últimos 12 meses</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Todos os pagamentos recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor por Cota</TableHead>
                      <TableHead>Cotas</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiDividends.length > 0 ? (
                      apiDividends.map((dividend) => (
                        <TableRow key={dividend.date}>
                          <TableCell>{new Date(dividend.date).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(dividend.value)}
                          </TableCell>
                          <TableCell>{fund.shares}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(dividend.value * fund.shares)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : fundPayments.length > 0 ? (
                      fundPayments.map((payment) => (
                        <TableRow key={payment.date}>
                          <TableCell>{new Date(payment.date).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(payment.valuePerShare)}
                          </TableCell>
                          <TableCell>{payment.shares}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(payment.valuePerShare * payment.shares)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          Nenhum pagamento registrado para este fundo
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
