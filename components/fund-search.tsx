"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, RefreshCw, TrendingUp, Building2, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AddFundDialog } from "./add-fund-dialog"
import { fetchFundDetails, fetchFundDividends, fetchFunds, type ApiFund, type ApiDividend } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "./ui/chart"

export function FundSearch() {
  const [availableFunds, setAvailableFunds] = useState<string[]>([])
  const [isLoadingFunds, setIsLoadingFunds] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFund, setSelectedFund] = useState<ApiFund | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [dividends, setDividends] = useState<ApiDividend[]>([])
  const [dividendData, setDividendData] = useState<any[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  // Buscar lista de fundos disponíveis
  const fetchAvailableFunds = useCallback(async () => {
    setIsLoadingFunds(true)
    setError(null)

    try {
      // Usar a função fetchFunds diretamente para obter a lista completa de fundos
      const fundsData = await fetchFunds()

      if (fundsData && fundsData.length > 0) {
        // Extrair apenas os códigos dos fundos
        const fundCodes = fundsData.map((item: ApiFund) => item.ticker)
        setAvailableFunds(fundCodes)
        console.log("Fundos carregados:", fundCodes.length)
      } else {
        throw new Error("Nenhum fundo encontrado")
      }
    } catch (error) {
      console.error("Erro ao buscar fundos:", error)
      setError("Não foi possível carregar a lista de fundos disponíveis.")
      // Definir uma lista vazia para evitar erros
      setAvailableFunds([])
    } finally {
      setIsLoadingFunds(false)
    }
  }, [])

  // Buscar detalhes de um fundo específico
  const fetchFundData = useCallback(async (ticker: string) => {
    setIsLoadingDetails(true)
    setError(null)

    try {
      // Buscar detalhes do fundo
      const fundDetails = await fetchFundDetails(ticker)
      setSelectedFund(fundDetails)

      // Buscar histórico de dividendos
      const dividendsData = await fetchFundDividends(ticker)
      setDividends(dividendsData)

      // Preparar dados para o gráfico
      if (dividendsData && dividendsData.length > 0) {
        const chartData = dividendsData
          .slice(0, 12)
          .reverse()
          .map((div) => ({
            month: new Date(div.date).toLocaleDateString("pt-BR", { month: "short" }),
            value: div.value,
          }))

        setDividendData(chartData)
      }
    } catch (error) {
      console.error(`Erro ao buscar dados do fundo ${ticker}:`, error)
      setError(`Não foi possível carregar os dados do fundo ${ticker}.`)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])

  // Carregar lista de fundos ao montar o componente
  useEffect(() => {
    fetchAvailableFunds()
  }, [fetchAvailableFunds])

  // Filtrar fundos conforme o usuário digita
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toUpperCase()
      const results = availableFunds.filter((ticker) => ticker.includes(query))
      setSearchResults(results.slice(0, 10)) // Limitar a 10 resultados
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [searchQuery, availableFunds])

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    if (!searchQuery) {
      toast({
        title: "Digite um código de fundo",
        description: "Por favor, digite o código de um fundo para pesquisar.",
        variant: "destructive",
      })
      return
    }

    const ticker = searchQuery.toUpperCase()
    setShowResults(false)
    fetchFundData(ticker)
  }

  // Função para selecionar um fundo da lista de resultados
  const handleSelectFund = (ticker: string) => {
    setSearchQuery(ticker)
    setShowResults(false)
    fetchFundData(ticker)
  }

  // Função para adicionar o fundo ao portfólio
  const handleAddFund = () => {
    if (selectedFund) {
      setShowAddDialog(true)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <div className="flex w-full items-center space-x-2">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Digite o código do fundo (ex: XPLG11)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full"
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  <ul className="py-1">
                    {searchResults.map((ticker) => (
                      <li
                        key={ticker}
                        className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelectFund(ticker)}
                      >
                        {ticker}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isLoadingDetails}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
          {isLoadingFunds && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center">
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Carregando lista de fundos...
            </div>
          )}
        </div>

        {selectedFund && (
          <Button onClick={handleAddFund} className="whitespace-nowrap">
            Adicionar ao Portfólio
          </Button>
        )}
      </div>

      {isLoadingDetails && (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
        </div>
      )}

      {selectedFund && !isLoadingDetails && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{selectedFund.ticker}</CardTitle>
                  <p className="text-muted-foreground">{selectedFund.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Setor:</div>
                  <div className="font-medium">{selectedFund.sector}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                    <CardTitle className="text-sm font-medium">Preço Atual</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(selectedFund.price)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold">{selectedFund.dividendYield.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">Anual</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                    <CardTitle className="text-sm font-medium">Último Dividendo</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(selectedFund.lastDividend || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Por cota</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                    <CardTitle className="text-sm font-medium">P/VP</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold">{selectedFund.pvp?.toFixed(2) || "N/A"}</div>
                    <p className="text-xs text-muted-foreground">Preço/Valor Patrimonial</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="dividends">
            <TabsList>
              <TabsTrigger value="dividends">Histórico de Dividendos</TabsTrigger>
              <TabsTrigger value="info">Informações</TabsTrigger>
            </TabsList>

            <TabsContent value="dividends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dividendos Mensais</CardTitle>
                </CardHeader>
                <CardContent>
                  {dividendData.length > 0 ? (
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
                          data={dividendData}
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
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>Não há dados de dividendos disponíveis para este fundo.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Fundo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Código</div>
                      <div className="font-medium">{selectedFund.ticker}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Nome</div>
                      <div className="font-medium">{selectedFund.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Setor</div>
                      <div className="font-medium">{selectedFund.sector}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Patrimônio</div>
                      <div className="font-medium">
                        {selectedFund.patrimony
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                              maximumFractionDigits: 0,
                            }).format(selectedFund.patrimony)
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Preço Atual</div>
                      <div className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(selectedFund.price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Dividend Yield</div>
                      <div className="font-medium">{selectedFund.dividendYield.toFixed(2)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Diálogo para adicionar o fundo ao portfólio */}
      <AddFundDialog open={showAddDialog} onOpenChange={setShowAddDialog} fund={selectedFund} />
    </div>
  )
}
