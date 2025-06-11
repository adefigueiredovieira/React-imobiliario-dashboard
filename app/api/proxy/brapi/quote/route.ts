import { type NextRequest, NextResponse } from "next/server"
import { buildQuoteUrl, getStandardHeaders, BRAPI_TOKEN } from "@/lib/brapi-config"

// Dados simulados para fallback
const mockQuoteData = {
  results: [
    {
      symbol: "XPLG11",
      shortName: "XP Log",
      longName: "XP Log Fundo de Investimento Imobiliário",
      currency: "BRL",
      regularMarketPrice: 100.5,
      regularMarketChangePercent: 1.5,
      dividendsData: {
        cashDividends: [
          {
            paymentDate: "2024-04-15T00:00:00.000Z",
            rate: 0.85,
          },
          {
            paymentDate: "2024-03-15T00:00:00.000Z",
            rate: 0.82,
          },
        ],
      },
    },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get("ticker")

    if (!ticker) {
      return NextResponse.json({ error: "Ticker não fornecido" }, { status: 400 })
    }

    // Verificar se temos token configurado
    if (!BRAPI_TOKEN || BRAPI_TOKEN.trim() === "") {
      console.warn("Token da API não configurado, usando dados simulados")
      return NextResponse.json(mockQuoteData)
    }

    // Parâmetros opcionais com valores padrão
    const range = searchParams.get("range") || "1mo"
    const interval = searchParams.get("interval") || "1d"
    const fundamental = searchParams.get("fundamental") === "true" || true
    const dividends = searchParams.get("dividends") === "true" || true
    const modules = searchParams.get("modules")?.split(",") || ["balanceSheetHistory"]

    // Construir a URL usando a função buildQuoteUrl
    const url = buildQuoteUrl([ticker], {
      range,
      interval,
      fundamental,
      dividends,
      modules,
    })

    console.log("Buscando dados do fundo com URL:", url.replace(/token=[^&]*/, "token=***"))
    console.log("Usando token via parâmetro de query")

    const response = await fetch(url, {
      headers: getStandardHeaders(),
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`Erro ao buscar dados do fundo: ${response.status} ${response.statusText}. Usando dados simulados.`)

      // Se for erro de autenticação, retornar erro específico
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: `Erro de autenticação: ${response.status}` }, { status: response.status })
      }

      return NextResponse.json(mockQuoteData)
    }

    // Verificar o tipo de conteúdo
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Tipo de conteúdo inválido recebido da API. Usando dados simulados.")
      return NextResponse.json(mockQuoteData)
    }

    // Obter o texto da resposta primeiro
    const text = await response.text()

    // Verificar se o texto parece ser HTML
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.warn("Recebido HTML em vez de JSON. Usando dados simulados.")
      return NextResponse.json(mockQuoteData)
    }

    // Tentar fazer o parse do JSON
    try {
      const data = JSON.parse(text)

      // Verificar se há erro na resposta
      if (data.error) {
        console.warn("API retornou erro:", data.error)
        return NextResponse.json({ error: data.error }, { status: 400 })
      }

      console.log(`Dados recebidos com sucesso para ${ticker}`)
      return NextResponse.json(data)
    } catch (error) {
      console.warn("Erro ao analisar JSON da API. Usando dados simulados:", error)
      return NextResponse.json(mockQuoteData)
    }
  } catch (error) {
    console.error("Erro ao buscar dados do fundo:", error)
    return NextResponse.json(mockQuoteData)
  }
}
