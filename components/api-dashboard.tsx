"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Activity,
  BarChart3,
  Clock,
  Key,
  ShieldAlert,
} from "lucide-react"
import { BRAPI_BASE_URL, MONITORING_ENDPOINTS } from "@/lib/brapi-config"

interface EndpointStatus {
  endpoint: string
  status: "online" | "offline" | "loading"
  responseTime: number
  message: string
  lastChecked: Date
  authError?: boolean
}

interface ApiUsage {
  dailyRequests: number
  monthlyRequests: number
  dailyLimit: number
  monthlyLimit: number
}

interface ApiStatusResponse {
  status: string
  endpoints: Record<string, any>
  summary?: {
    total: number
    online: number
    offline: number
  }
  authError?: boolean
  apiKeyConfigured?: boolean
  timestamp: string
}

export function ApiDashboard() {
  const [endpointStatuses, setEndpointStatuses] = useState<EndpointStatus[]>([])
  const [apiUsage, setApiUsage] = useState<ApiUsage>({
    dailyRequests: 0,
    monthlyRequests: 0,
    dailyLimit: 100,
    monthlyLimit: 15000,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [overallStatus, setOverallStatus] = useState<string>("loading")
  const [statusSummary, setStatusSummary] = useState({ total: 0, online: 0, offline: 0 })
  const [history, setHistory] = useState<Array<{ endpoint: string; status: string; timestamp: Date }>>([])
  const [hasAuthError, setHasAuthError] = useState(false)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true)

  // Verificar se a chave da API está configurada
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_FII_API_KEY || ""
    console.log("Verificando configuração da chave da API...")
    console.log("Chave encontrada:", key ? "Sim" : "Não")
    console.log("Tamanho da chave:", key.length)

    if (key && key.length > 8) {
      const maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
      setApiKey(maskedKey)
      setApiKeyConfigured(true)
      console.log("Chave mascarada:", maskedKey)
    } else {
      setApiKeyConfigured(false)
      console.log("Chave da API não configurada ou muito curta")
    }
  }, [])

  // Função para verificar o status da API
  const checkApiStatus = async () => {
    setIsRefreshing(true)
    setLastRefresh(new Date())

    // Inicializar endpoints como loading
    const initialEndpoints: EndpointStatus[] = [
      {
        endpoint: MONITORING_ENDPOINTS.QUOTE_TICKER,
        status: "loading",
        responseTime: 0,
        message: "Verificando...",
        lastChecked: new Date(),
      },
      {
        endpoint: MONITORING_ENDPOINTS.QUOTE_LIST,
        status: "loading",
        responseTime: 0,
        message: "Verificando...",
        lastChecked: new Date(),
      },
      {
        endpoint: MONITORING_ENDPOINTS.AVAILABLE,
        status: "loading",
        responseTime: 0,
        message: "Verificando...",
        lastChecked: new Date(),
      },
    ]

    setEndpointStatuses(initialEndpoints)

    try {
      console.log("Verificando status da API...")
      const response = await fetch("/api/check-brapi-status", {
        cache: "no-store",
      })

      if (response.ok) {
        const data: ApiStatusResponse = await response.json()
        console.log("Dados recebidos:", data)

        // Verificar problemas de autenticação
        setHasAuthError(!!data.authError)
        setApiKeyConfigured(!!data.apiKeyConfigured)

        // Atualizar status geral
        setOverallStatus(data.status)

        if (data.summary) {
          setStatusSummary(data.summary)
        }

        // Atualizar status dos endpoints
        const updatedEndpoints: EndpointStatus[] = Object.entries(data.endpoints).map(([endpoint, statusData]) => ({
          endpoint,
          status: statusData.status as "online" | "offline",
          responseTime: statusData.responseTime || 0,
          message: statusData.message || "",
          authError: statusData.authError,
          lastChecked: new Date(),
        }))

        setEndpointStatuses(updatedEndpoints)

        // Adicionar ao histórico
        updatedEndpoints.forEach((endpoint) => {
          setHistory((prev) => [
            { endpoint: endpoint.endpoint, status: endpoint.status, timestamp: new Date() },
            ...prev.slice(0, 19),
          ])
        })
      } else {
        console.error("Erro na resposta da API:", response.status)
        // Marcar todos como offline em caso de erro
        const offlineEndpoints = initialEndpoints.map((endpoint) => ({
          ...endpoint,
          status: "offline" as const,
          message: `Erro HTTP: ${response.status}`,
        }))
        setEndpointStatuses(offlineEndpoints)
        setOverallStatus("offline")
        setStatusSummary({ total: initialEndpoints.length, online: 0, offline: initialEndpoints.length })
      }
    } catch (error) {
      console.error("Erro ao verificar status da API:", error)
      // Marcar todos como offline em caso de erro
      const offlineEndpoints = initialEndpoints.map((endpoint) => ({
        ...endpoint,
        status: "offline" as const,
        message: "Erro de conexão",
      }))
      setEndpointStatuses(offlineEndpoints)
      setOverallStatus("offline")
      setStatusSummary({ total: initialEndpoints.length, online: 0, offline: initialEndpoints.length })
    }

    // Simular dados de uso da API
    setApiUsage({
      dailyRequests: Math.floor(Math.random() * 50) + 10,
      monthlyRequests: Math.floor(Math.random() * 500) + 100,
      dailyLimit: 100,
      monthlyLimit: 15000,
    })

    setIsRefreshing(false)
  }

  // Verificar status ao carregar o componente
  useEffect(() => {
    checkApiStatus()
  }, [])

  // Função para formatar a data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  // Função para obter o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "loading":
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  // Função para obter a cor do badge de status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "online":
        return "default"
      case "offline":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Função para obter a cor do texto do status geral
  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "offline":
        return "text-red-500"
      case "partial":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  // Função para obter o texto do status geral
  const getOverallStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "offline":
        return "Offline"
      case "partial":
        return "Parcialmente Online"
      case "loading":
        return "Verificando..."
      default:
        return "Desconhecido"
    }
  }

  // Função para obter nome amigável do endpoint
  const getEndpointDisplayName = (endpoint: string) => {
    if (endpoint.includes("/quote/list")) {
      return "Quote List"
    } else if (endpoint.includes("/quote/")) {
      return "Quote (Ticker)"
    } else if (endpoint.includes("/available")) {
      return "Available Stocks"
    }
    return endpoint
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-medium">Status da API Brapi</h3>
          <p className="text-sm text-muted-foreground">Monitore o status e uso da API de fundos imobiliários</p>
        </div>
        <Button onClick={checkApiStatus} disabled={isRefreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar Status"}
        </Button>
      </div>

      {lastRefresh && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Última atualização: {formatDate(lastRefresh)}
        </div>
      )}

      {!apiKeyConfigured && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Chave da API não configurada</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>A chave da API Brapi não está configurada corretamente.</p>
            <div className="text-sm">
              <p>
                <strong>Para configurar:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>
                  Obtenha uma chave da API em{" "}
                  <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="underline">
                    brapi.dev
                  </a>
                </li>
                <li>
                  Adicione a variável de ambiente <code className="bg-muted px-1 rounded">FII_API_KEY</code> ou{" "}
                  <code className="bg-muted px-1 rounded">NEXT_PUBLIC_FII_API_KEY</code>
                </li>
                <li>Reinicie a aplicação</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasAuthError && apiKeyConfigured && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Erro de autenticação</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>A chave da API está configurada, mas ocorreu um erro de autenticação.</p>
            <div className="text-sm">
              <p>
                <strong>Possíveis causas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Chave da API inválida ou expirada</li>
                <li>Chave da API não tem permissões necessárias</li>
                <li>Limite de requisições excedido</li>
                <li>Problema temporário no serviço Brapi</li>
              </ul>
              <p className="mt-2">
                <strong>Chave atual:</strong> <code className="bg-muted px-1 rounded">{apiKey}</code>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Este dashboard mostra informações sobre a API Brapi utilizada para obter dados de fundos imobiliários.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              <div className={`text-2xl font-bold ${getOverallStatusColor(overallStatus)}`}>
                {getOverallStatusText(overallStatus)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statusSummary.online} de {statusSummary.total} endpoints online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições Diárias</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiUsage.dailyRequests}</div>
            <Progress value={(apiUsage.dailyRequests / apiUsage.dailyLimit) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {apiUsage.dailyRequests} de {apiUsage.dailyLimit} (
              {Math.round((apiUsage.dailyRequests / apiUsage.dailyLimit) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições Mensais</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiUsage.monthlyRequests}</div>
            <Progress value={(apiUsage.monthlyRequests / apiUsage.monthlyLimit) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {apiUsage.monthlyRequests} de {apiUsage.monthlyLimit} (
              {Math.round((apiUsage.monthlyRequests / apiUsage.monthlyLimit) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chave da API</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono font-bold">{apiKey || "Não configurada"}</div>
            <p className={`text-xs mt-2 ${apiKey ? "text-green-500" : "text-red-500"}`}>
              {apiKey ? "Chave configurada" : "Configure a chave da API nas variáveis de ambiente"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">Status dos Endpoints</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Endpoints</CardTitle>
              <CardDescription>Verifique o status de cada endpoint da API Brapi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpointStatuses.map((status) => (
                  <div key={status.endpoint} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.status)}
                      <div>
                        <div className="font-medium">{getEndpointDisplayName(status.endpoint)}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.endpoint} -{" "}
                          {status.status === "loading"
                            ? "Verificando..."
                            : `${status.message} - ${status.responseTime}ms`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(status.status)}>
                        {status.status === "loading"
                          ? "Verificando"
                          : status.status === "online"
                            ? "Online"
                            : "Offline"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Verificações</CardTitle>
              <CardDescription>Histórico das últimas verificações de status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{item.endpoint}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</div>
                    </div>
                    <Badge variant={item.status === "online" ? "default" : "destructive"}>
                      {item.status === "online" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da API</CardTitle>
              <CardDescription>Detalhes da configuração atual da API Brapi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">URL Base</div>
                    <div className="font-medium">{BRAPI_BASE_URL}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Chave da API</div>
                    <div className="font-medium font-mono">{apiKey || "Não configurada"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Limite Diário</div>
                    <div className="font-medium">{apiUsage.dailyLimit} requisições</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Limite Mensal</div>
                    <div className="font-medium">{apiUsage.monthlyLimit} requisições</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Endpoints Monitorados</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">QUOTE (Ticker)</div>
                      <div className="text-muted-foreground">{MONITORING_ENDPOINTS.QUOTE_TICKER}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">QUOTE LIST</div>
                      <div className="text-muted-foreground">{MONITORING_ENDPOINTS.QUOTE_LIST}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">AVAILABLE</div>
                      <div className="text-muted-foreground">{MONITORING_ENDPOINTS.AVAILABLE}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Proxy</CardTitle>
              <CardDescription>Detalhes sobre o proxy da API implementado no FII Tracker</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Endpoints do Proxy</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">/api/proxy/brapi/quote</div>
                      <div className="text-muted-foreground">Cotações de fundos</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">/api/proxy/brapi/list</div>
                      <div className="text-muted-foreground">Lista de fundos disponíveis</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Configuração de Cache</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">Tempo de cache</div>
                      <div className="text-muted-foreground">1 hora</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">Estratégia</div>
                      <div className="text-muted-foreground">Revalidar sob demanda</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
