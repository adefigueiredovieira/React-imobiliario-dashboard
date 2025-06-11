// Configuração da API Brapi
export const BRAPI_BASE_URL = "https://brapi.dev"
export const BRAPI_TOKEN = process.env.FII_API_KEY || process.env.NEXT_PUBLIC_FII_API_KEY || ""

// Função para adicionar a chave de API à URL
export function addApiKeyToUrl(url: string): string {
  // Verificar se a chave da API está disponível
  if (!BRAPI_TOKEN || BRAPI_TOKEN.trim() === "") {
    console.warn("Chave da API Brapi não configurada ou vazia!")
    return url // Retorna a URL sem token se não houver chave
  }

  // Verificar se a URL já tem a chave da API
  if (url.includes(`token=${BRAPI_TOKEN}`)) {
    return url
  }

  // Verificar se já existe um parâmetro token na URL
  if (url.includes("token=")) {
    // Substituir o token existente
    return url.replace(/token=[^&]*/, `token=${BRAPI_TOKEN}`)
  }

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}token=${BRAPI_TOKEN}`
}

// Função para construir URL de quote simples
export function buildSimpleQuoteUrl(ticker: string): string {
  return `${BRAPI_BASE_URL}/api/quote/${ticker}?token=${BRAPI_TOKEN}`
}

// Função para construir URL de quote com parâmetros corretos
export function buildQuoteUrl(
  symbols: string[],
  options: {
    range?: string
    interval?: string
    fundamental?: boolean
    dividends?: boolean
    modules?: string[]
  } = {},
): string {
  const {
    range = "1mo",
    interval = "1d",
    fundamental = true,
    dividends = true,
    modules = ["balanceSheetHistory"],
  } = options

  // Construir a URL base com símbolos
  const symbolsParam = symbols.join(",")
  const url = `${BRAPI_BASE_URL}/api/quote/${symbolsParam}`

  // Adicionar parâmetros de query
  const params = new URLSearchParams()
  params.append("token", BRAPI_TOKEN)
  params.append("range", range)
  params.append("interval", interval)

  if (fundamental) {
    params.append("fundamental", "true")
  }

  if (dividends) {
    params.append("dividends", "true")
  }

  if (modules.length > 0) {
    params.append("modules", modules.join(","))
  }

  return `${url}?${params.toString()}`
}

// Função para obter headers padrão (sem token de autenticação)
export function getStandardHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "User-Agent": "FII-Tracker/1.0",
    Accept: "application/json",
  }
}

// Função para verificar se a chave da API está configurada
export function isApiKeyConfigured(): boolean {
  return !!(BRAPI_TOKEN && BRAPI_TOKEN.trim() !== "")
}

// Função para obter informações sobre a configuração da API
export function getApiConfig() {
  return {
    baseUrl: BRAPI_BASE_URL,
    hasApiKey: isApiKeyConfigured(),
    keyLength: BRAPI_TOKEN ? BRAPI_TOKEN.length : 0,
    keyPreview: BRAPI_TOKEN
      ? `${BRAPI_TOKEN.substring(0, 4)}...${BRAPI_TOKEN.substring(BRAPI_TOKEN.length - 4)}`
      : null,
  }
}

// Endpoints da API Brapi
export const ENDPOINTS = {
  QUOTE: "/api/quote",
  QUOTE_LIST: "/api/quote/list",
  AVAILABLE: "/api/available",
  DIVIDENDS: "/api/quote/{ticker}/dividends",
}

// Endpoints específicos para monitoramento
export const MONITORING_ENDPOINTS = {
  QUOTE_TICKER: "/api/quote/XPLG11",
  QUOTE_LIST: "/api/quote/list",
  AVAILABLE: "/api/available",
}

// Parâmetros disponíveis para a API
export const VALID_RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]
export const VALID_INTERVALS = ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]
export const VALID_MODULES = [
  "summaryProfile",
  "balanceSheetHistory",
  "balanceSheetHistoryQuarterly",
  "defaultKeyStatistics",
  "incomeStatementHistory",
  "incomeStatementHistoryQuarterly",
  "financialData",
]
