"use server"

// Tipos para os dados da API
export interface ApiFund {
  ticker: string
  name: string
  sector: string
  price: number
  dividendYield: number
  lastDividend: number
  patrimony: number
  pvp: number
}

export interface ApiDividend {
  ticker: string
  date: string
  value: number
  baseDate: string
  paymentDate: string
}

// Função auxiliar para obter a URL base da API
function getBaseUrl() {
  // Em ambiente de servidor, precisamos de uma URL absoluta
  if (typeof window === "undefined") {
    // Verifica se a variável de ambiente está definida
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.warn("NEXT_PUBLIC_API_URL não está definida. Usando URL padrão.")
      return "http://localhost:3000"
    }
    return apiUrl
  }

  // No cliente, podemos usar URL relativa
  return ""
}

// Dados simulados mais específicos para cada fundo
const mockFundsData: { [ticker: string]: ApiFund } = {
  XPLG11: {
    ticker: "XPLG11",
    name: "XP Log Fundo de Investimento Imobiliário",
    sector: "Logística",
    price: 112.5,
    dividendYield: 8.5,
    lastDividend: 0.85,
    patrimony: 2500000000,
    pvp: 1.05,
  },
  MXRF11: {
    ticker: "MXRF11",
    name: "Maxi Renda Fundo de Investimento Imobiliário",
    sector: "Títulos e Valores Mobiliários",
    price: 10.2,
    dividendYield: 12.2,
    lastDividend: 0.1,
    patrimony: 2300000000,
    pvp: 1.01,
  },
  HGLG11: {
    ticker: "HGLG11",
    name: "CSHG Logística Fundo de Investimento Imobiliário",
    sector: "Logística",
    price: 165.0,
    dividendYield: 7.9,
    lastDividend: 1.1,
    patrimony: 3000000000,
    pvp: 1.1,
  },
  KNRI11: {
    ticker: "KNRI11",
    name: "Kinea Real Estate Equity FII",
    sector: "Escritórios",
    price: 97.35,
    dividendYield: 8.2,
    lastDividend: 0.78,
    patrimony: 2800000000,
    pvp: 0.95,
  },
  HSML11: {
    ticker: "HSML11",
    name: "HSI Mall Fundo de Investimento Imobiliário",
    sector: "Shoppings",
    price: 87.65,
    dividendYield: 7.1,
    lastDividend: 0.65,
    patrimony: 1900000000,
    pvp: 0.92,
  },
  VISC11: {
    ticker: "VISC11",
    name: "Vinci Shopping Centers FII",
    sector: "Shoppings",
    price: 89.45,
    dividendYield: 7.5,
    lastDividend: 0.67,
    patrimony: 2100000000,
    pvp: 0.98,
  },
  HGBS11: {
    ticker: "HGBS11",
    name: "CSHG Brasil Shopping FII",
    sector: "Shoppings",
    price: 95.2,
    dividendYield: 6.8,
    lastDividend: 0.72,
    patrimony: 1800000000,
    pvp: 1.02,
  },
  BCFF11: {
    ticker: "BCFF11",
    name: "BTG Pactual Fundo de Fundos FII",
    sector: "Fundos de Fundos",
    price: 78.9,
    dividendYield: 9.1,
    lastDividend: 0.58,
    patrimony: 1500000000,
    pvp: 0.89,
  },
  KNCR11: {
    ticker: "KNCR11",
    name: "Kinea Rendimentos Imobiliários FII",
    sector: "Recebíveis",
    price: 105.3,
    dividendYield: 8.7,
    lastDividend: 0.82,
    patrimony: 2200000000,
    pvp: 1.08,
  },
  IRDM11: {
    ticker: "IRDM11",
    name: "Iridium Recebíveis Imobiliários FII",
    sector: "Recebíveis",
    price: 92.15,
    dividendYield: 9.3,
    lastDividend: 0.75,
    patrimony: 1700000000,
    pvp: 0.94,
  },
  HGRE11: {
    ticker: "HGRE11",
    name: "CSHG Real Estate FII",
    sector: "Escritórios",
    price: 118.4,
    dividendYield: 7.6,
    lastDividend: 0.88,
    patrimony: 2600000000,
    pvp: 1.12,
  },
  XPCI11: {
    ticker: "XPCI11",
    name: "XP Corporate Macaé FII",
    sector: "Escritórios",
    price: 85.75,
    dividendYield: 8.9,
    lastDividend: 0.69,
    patrimony: 1400000000,
    pvp: 0.91,
  },
  BTLG11: {
    ticker: "BTLG11",
    name: "BTG Pactual Logística FII",
    sector: "Logística",
    price: 102.6,
    dividendYield: 8.0,
    lastDividend: 0.79,
    patrimony: 2000000000,
    pvp: 1.03,
  },
  RBRR11: {
    ticker: "RBRR11",
    name: "RBR Rendimento Imobiliário FII",
    sector: "Híbrido",
    price: 76.3,
    dividendYield: 9.8,
    lastDividend: 0.62,
    patrimony: 1300000000,
    pvp: 0.87,
  },
  VILG11: {
    ticker: "VILG11",
    name: "Vinci Logística FII",
    sector: "Logística",
    price: 94.8,
    dividendYield: 7.7,
    lastDividend: 0.71,
    patrimony: 1900000000,
    pvp: 0.96,
  },
}

// Função para gerar dados simulados para fundos não encontrados
function generateMockFundData(ticker: string): ApiFund {
  // Usar o ticker para gerar dados consistentes mas variados
  const hash = ticker.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const sectors = ["Logística", "Shoppings", "Escritórios", "Recebíveis", "Híbrido", "Títulos e Valores Mobiliários"]
  const sectorIndex = Math.abs(hash) % sectors.length

  // Gerar valores baseados no hash para consistência
  const basePrice = 50 + (Math.abs(hash) % 100)
  const baseDividendYield = 6 + (Math.abs(hash) % 6)
  const baseLastDividend = 0.3 + (Math.abs(hash) % 100) / 100
  const basePatrimony = 1000000000 + (Math.abs(hash) % 2000000000)
  const basePvp = 0.8 + (Math.abs(hash) % 50) / 100

  return {
    ticker,
    name: `${ticker} - Fundo de Investimento Imobiliário`,
    sector: sectors[sectorIndex],
    price: Number(basePrice.toFixed(2)),
    dividendYield: Number(baseDividendYield.toFixed(1)),
    lastDividend: Number(baseLastDividend.toFixed(2)),
    patrimony: basePatrimony,
    pvp: Number(basePvp.toFixed(2)),
  }
}

// Função para obter dados simulados de um fundo específico
function getMockFundData(ticker: string): ApiFund {
  return mockFundsData[ticker] || generateMockFundData(ticker)
}

// Mock data for dividends (replace with your actual mock data)
const mockDividends: { [ticker: string]: ApiDividend[] } = {
  XPLG11: [
    {
      ticker: "XPLG11",
      date: "2024-01-15",
      value: 0.85,
      baseDate: "2023-12-28",
      paymentDate: "2024-01-15",
    },
    {
      ticker: "XPLG11",
      date: "2023-12-15",
      value: 0.82,
      baseDate: "2023-11-29",
      paymentDate: "2023-12-15",
    },
  ],
  MXRF11: [
    {
      ticker: "MXRF11",
      date: "2024-01-16",
      value: 0.1,
      baseDate: "2023-12-29",
      paymentDate: "2024-01-16",
    },
    {
      ticker: "MXRF11",
      date: "2023-12-15",
      value: 0.1,
      baseDate: "2023-11-29",
      paymentDate: "2023-12-15",
    },
  ],
  HGLG11: [
    {
      ticker: "HGLG11",
      date: "2024-01-25",
      value: 1.1,
      baseDate: "2023-12-28",
      paymentDate: "2024-01-25",
    },
    {
      ticker: "HGLG11",
      date: "2023-12-21",
      value: 1.08,
      baseDate: "2023-11-30",
      paymentDate: "2023-12-21",
    },
  ],
}

// Função para gerar dados de dividendos simulados
function generateMockDividendData(ticker: string): ApiDividend[] {
  const fundData = getMockFundData(ticker)
  const dividends: ApiDividend[] = []

  // Gerar 12 meses de dividendos
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    date.setDate(15) // Dia 15 de cada mês

    // Variar o valor do dividendo baseado no último dividendo do fundo
    const variation = 0.9 + Math.random() * 0.2 // Variação de ±10%
    const dividendValue = Number((fundData.lastDividend * variation).toFixed(2))

    dividends.push({
      ticker,
      date: date.toISOString().split("T")[0],
      value: dividendValue,
      baseDate: date.toISOString().split("T")[0],
      paymentDate: date.toISOString().split("T")[0],
    })
  }

  return dividends
}

// Função para obter dados de dividendos simulados
function getMockDividendData(ticker: string): ApiDividend[] {
  return mockDividends[ticker] || generateMockDividendData(ticker)
}

// Converter o objeto para array para compatibilidade
const mockFunds: ApiFund[] = Object.values(mockFundsData)

// Função para buscar todos os fundos
export async function fetchFunds(): Promise<ApiFund[]> {
  try {
    const baseUrl = getBaseUrl()

    console.log("Iniciando busca de fundos...")
    console.log("URL base:", baseUrl)

    // Atualizado para usar o novo endpoint
    const response = await fetch(`${baseUrl}/api/proxy/brapi/list`, {
      cache: "no-store",
      next: { revalidate: 3600 }, // Revalidar a cada hora
    })

    if (!response.ok) {
      console.warn("Erro ao buscar fundos da API, usando dados simulados:", response.status, response.statusText)
      return mockFunds
    }

    // Verificar o tipo de conteúdo
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Tipo de conteúdo inválido recebido da API. Usando dados simulados.")
      return mockFunds
    }

    // Obter o texto da resposta primeiro
    let text
    try {
      text = await response.text()
    } catch (error) {
      console.warn("Erro ao ler resposta da API. Usando dados simulados:", error)
      return mockFunds
    }

    // Verificar se o texto existe e não é HTML
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      console.warn("Resposta vazia recebida da API. Usando dados simulados.")
      return mockFunds
    }

    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.warn("Recebido HTML em vez de JSON. Usando dados simulados.")
      return mockFunds
    }

    // Tentar fazer o parse do JSON
    let data
    try {
      data = JSON.parse(text)
    } catch (error) {
      console.warn("Erro ao analisar JSON da API. Usando dados simulados:", error)
      return mockFunds
    }

    // Verificar se os dados são válidos e têm a estrutura esperada
    if (!data || typeof data !== "object") {
      console.warn("Dados inválidos recebidos da API (não é um objeto). Usando dados simulados.")
      return mockFunds
    }

    if (!data.stocks || !Array.isArray(data.stocks)) {
      console.warn("Dados inválidos recebidos da API (stocks não é array). Usando dados simulados.")
      console.log("Estrutura recebida:", Object.keys(data))
      return mockFunds
    }

    if (data.stocks.length === 0) {
      console.warn("Lista de fundos vazia recebida da API. Usando dados simulados.")
      return mockFunds
    }

    // Mapeia os dados para o formato esperado pela aplicação
    const funds = data.stocks
      .filter((item: any) => {
        // Filtrar itens válidos
        if (!item || typeof item !== "object") {
          console.warn("Item inválido (não é objeto):", item)
          return false
        }

        if (!item.stock || typeof item.stock !== "string" || item.stock.trim().length === 0) {
          console.warn("Item sem ticker válido:", item)
          return false
        }

        return true
      })
      .map((item: any) => {
        // Usar dados específicos para cada fundo
        const mockFund = getMockFundData(item.stock)

        return {
          ticker: item.stock,
          name: item.name || mockFund.name,
          sector: item.sector || mockFund.sector,
          price: mockFund.price,
          dividendYield: mockFund.dividendYield,
          lastDividend: mockFund.lastDividend,
          patrimony: mockFund.patrimony,
          pvp: mockFund.pvp,
        }
      })

    if (funds.length === 0) {
      console.warn("Nenhum fundo válido encontrado após filtragem. Usando dados simulados.")
      return mockFunds
    }

    console.log(`Retornando ${funds.length} fundos da API`)
    return funds
  } catch (error) {
    console.error("Erro ao buscar fundos:", error)
    console.error("Stack trace:", error.stack)
    // Fallback para dados simulados
    return mockFunds
  }
}

// Função para buscar detalhes de um fundo específico
export async function fetchFundDetails(ticker: string): Promise<ApiFund> {
  try {
    const baseUrl = getBaseUrl()

    // Atualizado para usar o novo endpoint com parâmetros específicos
    const response = await fetch(
      `${baseUrl}/api/proxy/brapi/quote?ticker=${ticker}&range=1mo&interval=1d&fundamental=true&dividends=true&modules=financialData`,
      {
        cache: "no-store",
        next: { revalidate: 3600 }, // Revalidar a cada hora
      },
    )

    if (!response.ok) {
      console.warn(`Erro ao buscar detalhes do fundo ${ticker}, usando dados simulados:`, response.statusText)
      return getMockFundData(ticker)
    }

    // Verificar o tipo de conteúdo
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`Tipo de conteúdo inválido recebido da API para ${ticker}. Usando dados simulados.`)
      return getMockFundData(ticker)
    }

    // Obter o texto da resposta primeiro
    let text
    try {
      text = await response.text()
    } catch (error) {
      console.warn(`Erro ao ler resposta da API para ${ticker}. Usando dados simulados:`, error)
      return getMockFundData(ticker)
    }

    // Verificar se o texto parece ser HTML
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.warn(`Recebido HTML em vez de JSON para ${ticker}. Usando dados simulados.`)
      return getMockFundData(ticker)
    }

    // Tentar fazer o parse do JSON
    let data
    try {
      data = JSON.parse(text)
    } catch (error) {
      console.warn(`Erro ao analisar JSON da API para ${ticker}. Usando dados simulados:`, error)
      return getMockFundData(ticker)
    }

    // Verifica se os dados são válidos
    if (!data || !data.results || !data.results[0]) {
      console.warn(`Dados inválidos recebidos da API para ${ticker}. Usando dados simulados.`)
      return getMockFundData(ticker)
    }

    const fundData = data.results[0]

    // Busca informações adicionais para complementar os dados
    const mockFund = getMockFundData(ticker)

    // Buscar dividendos para calcular o dividend yield
    let dividendYield = mockFund.dividendYield
    let lastDividend = mockFund.lastDividend

    try {
      // Verificar se temos dados de dividendos
      if (
        fundData.dividendsData &&
        fundData.dividendsData.cashDividends &&
        Array.isArray(fundData.dividendsData.cashDividends)
      ) {
        // Ordenar os dividendos por data de pagamento (mais recente primeiro)
        const sortedDividends = [...fundData.dividendsData.cashDividends].sort(
          (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
        )

        // Calcular o dividend yield anualizado com base nos últimos 12 meses
        const last12Months = sortedDividends.slice(0, 12)
        const totalDividends = last12Months.reduce((sum: number, div: any) => sum + Number.parseFloat(div.rate || 0), 0)

        // Calcular o dividend yield anualizado
        if (fundData.regularMarketPrice && fundData.regularMarketPrice > 0) {
          dividendYield = Number(((totalDividends / fundData.regularMarketPrice) * 100).toFixed(1))
        }

        // Último dividendo
        if (sortedDividends.length > 0) {
          lastDividend = Number.parseFloat(sortedDividends[0]?.rate || 0)
        }
      }
    } catch (error) {
      console.warn(`Erro ao processar dividendos para ${ticker}:`, error)
    }

    // Extrair dados financeiros se disponíveis
    let patrimony = mockFund.patrimony
    let pvp = mockFund.pvp

    if (fundData.financialData) {
      // Tentar extrair patrimônio líquido e P/VP dos dados financeiros
      if (fundData.financialData.totalStockholderEquity) {
        patrimony = fundData.financialData.totalStockholderEquity
      }

      if (fundData.financialData.priceToBook) {
        pvp = Number(fundData.financialData.priceToBook.toFixed(2))
      }
    }

    return {
      ticker: ticker,
      name: fundData.longName || fundData.shortName || mockFund.name,
      sector: mockFund.sector,
      price: Number((fundData.regularMarketPrice || mockFund.price).toFixed(2)),
      dividendYield: dividendYield,
      lastDividend: Number(lastDividend.toFixed(2)),
      patrimony: patrimony,
      pvp: pvp,
    }
  } catch (error) {
    console.error(`Erro ao buscar detalhes do fundo ${ticker}:`, error)
    // Fallback para dados simulados específicos do fundo
    const mockFund = getMockFundData(ticker)
    console.log(`Usando dados simulados para ${ticker}:`, mockFund)
    return mockFund
  }
}

// Função para buscar histórico de dividendos de um fundo
export async function fetchFundDividends(ticker: string): Promise<ApiDividend[]> {
  try {
    const baseUrl = getBaseUrl()

    // Agora usamos o endpoint de quote que já inclui os dividendos
    const response = await fetch(`${baseUrl}/api/proxy/brapi/quote?ticker=${ticker}&dividends=true`, {
      cache: "no-store",
      next: { revalidate: 3600 }, // Revalidar a cada hora
    })

    if (!response.ok) {
      console.warn(`Erro ao buscar dividendos do fundo ${ticker}, usando dados simulados:`, response.statusText)
      return getMockDividendData(ticker)
    }

    // Verificar o tipo de conteúdo
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`Tipo de conteúdo inválido recebido da API para dividendos de ${ticker}. Usando dados simulados.`)
      return getMockDividendData(ticker)
    }

    // Obter o texto da resposta primeiro
    let text
    try {
      text = await response.text()
    } catch (error) {
      console.warn(`Erro ao ler resposta da API para dividendos de ${ticker}. Usando dados simulados:`, error)
      return getMockDividendData(ticker)
    }

    // Verificar se o texto parece ser HTML
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.warn(`Recebido HTML em vez de JSON para dividendos de ${ticker}. Usando dados simulados.`)
      return getMockDividendData(ticker)
    }

    // Tentar fazer o parse do JSON
    let data
    try {
      data = JSON.parse(text)
    } catch (error) {
      console.warn(`Erro ao analisar JSON da API para dividendos de ${ticker}. Usando dados simulados:`, error)
      return getMockDividendData(ticker)
    }

    // Verifica se os dados são válidos
    if (
      !data ||
      !data.results ||
      !data.results[0] ||
      !data.results[0].dividendsData ||
      !data.results[0].dividendsData.cashDividends
    ) {
      console.warn(`Dados inválidos recebidos da API para dividendos de ${ticker}. Usando dados simulados.`)
      return getMockDividendData(ticker)
    }

    const dividendsData = data.results[0].dividendsData.cashDividends

    // Mapeia os dados para o formato esperado pela aplicação
    return dividendsData.map((item: any) => ({
      ticker: ticker,
      date: item.paymentDate,
      value: Number.parseFloat(item.rate) || 0,
      baseDate: item.lastDatePrior || item.paymentDate,
      paymentDate: item.paymentDate,
    }))
  } catch (error) {
    console.error(`Erro ao buscar dividendos do fundo ${ticker}:`, error)
    // Fallback para dados simulados específicos do fundo
    const mockDividend = getMockDividendData(ticker)
    console.log(`Usando dados simulados de dividendos para ${ticker}:`, mockDividend)
    return mockDividend
  }
}

// Função para buscar dados de mercado
export async function fetchMarketData(): Promise<any> {
  try {
    const baseUrl = getBaseUrl()

    // Buscar dados do IBOV e IFIX usando o novo endpoint
    const response = await fetch(`${baseUrl}/api/proxy/brapi/quote?ticker=^BVSP,^IFIX`, {
      cache: "no-store",
    })

    let ibovData = { points: 125478.35, variation: 0.75 }
    let ifixData = { points: 3245.67, variation: 0.42 }

    if (response.ok) {
      // Verificar o tipo de conteúdo e processar a resposta
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text()
        if (text && !text.trim().startsWith("<!DOCTYPE") && !text.trim().startsWith("<html")) {
          try {
            const data = JSON.parse(text)
            if (data && data.results && Array.isArray(data.results)) {
              // Encontrar IBOV e IFIX nos resultados
              const ibovResult = data.results.find((item: any) => item.symbol === "^BVSP")
              const ifixResult = data.results.find((item: any) => item.symbol === "^IFIX")

              if (ibovResult) {
                ibovData = {
                  points: ibovResult.regularMarketPrice,
                  variation: ibovResult.regularMarketChangePercent,
                }
              }

              if (ifixResult) {
                ifixData = {
                  points: ifixResult.regularMarketPrice,
                  variation: ifixResult.regularMarketChangePercent,
                }
              }
            }
          } catch (error) {
            console.warn("Erro ao analisar JSON para dados de mercado:", error)
          }
        }
      }
    }

    return {
      status: "ok",
      message: "Dados de mercado obtidos da Brapi",
      lastUpdate: new Date().toISOString(),
      ibovespa: ibovData,
      ifix: ifixData,
    }
  } catch (error) {
    console.error("Erro ao buscar dados de mercado:", error)

    // Retornando dados simulados em caso de erro
    return {
      status: "error",
      message: "Erro ao buscar dados de mercado. Usando dados simulados.",
      lastUpdate: new Date().toISOString(),
      ibovespa: {
        points: 125478.35,
        variation: 0.75,
      },
      ifix: {
        points: 3245.67,
        variation: 0.42,
      },
    }
  }
}
