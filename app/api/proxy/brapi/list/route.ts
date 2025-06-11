import { type NextRequest, NextResponse } from "next/server"
import { BRAPI_BASE_URL, addApiKeyToUrl, getStandardHeaders, BRAPI_TOKEN } from "@/lib/brapi-config"

// Dados simulados para fallback
const mockListData = {
  stocks: [
    { stock: "XPLG11", name: "XP Log" },
    { stock: "MXRF11", name: "Maxi Renda" },
    { stock: "HGLG11", name: "CSHG Logística" },
    { stock: "KNRI11", name: "Kinea Real Estate" },
    { stock: "HSML11", name: "HSI Mall" },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Verificar se temos token configurado
    if (!BRAPI_TOKEN || BRAPI_TOKEN.trim() === "") {
      console.warn("Token da API não configurado, usando dados simulados")
      return NextResponse.json(mockListData)
    }

    // Endpoint para listar FIIs disponíveis
    const url = addApiKeyToUrl(`${BRAPI_BASE_URL}/api/available`)

    console.log("Buscando lista de FIIs com URL:", url.replace(/token=[^&]*/, "token=***"))
    console.log("Usando token via parâmetro de query")

    const response = await fetch(url, {
      headers: getStandardHeaders(),
      cache: "no-store",
      next: { revalidate: 86400 }, // Revalidar a cada 24 horas
    })

    if (!response.ok) {
      console.warn(`Erro ao buscar lista de FIIs: ${response.status} ${response.statusText}. Usando dados simulados.`)

      // Se for erro de autenticação, retornar erro específico
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: `Erro de autenticação: ${response.status}` }, { status: response.status })
      }

      return NextResponse.json(mockListData)
    }

    // Verificar o tipo de conteúdo
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Tipo de conteúdo inválido recebido da API. Usando dados simulados.")
      return NextResponse.json(mockListData)
    }

    // Obter o texto da resposta primeiro
    const text = await response.text()

    // Verificar se o texto parece ser HTML
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.warn("Recebido HTML em vez de JSON. Usando dados simulados.")
      return NextResponse.json(mockListData)
    }

    // Tentar fazer o parse do JSON
    try {
      const data = JSON.parse(text)

      // Verificar se há erro na resposta
      if (data.error) {
        console.warn("API retornou erro:", data.error)
        return NextResponse.json({ error: data.error }, { status: 400 })
      }

      // Verificar se os dados estão no formato esperado
      if (!data.stocks || !Array.isArray(data.stocks)) {
        console.warn("Dados da API não estão no formato esperado. Usando dados simulados.")
        return NextResponse.json(mockListData)
      }

      // Validar cada item da lista
      const validStocks = data.stocks.filter((item: any) => {
        return item && typeof item === "object" && item.stock && typeof item.stock === "string"
      })

      if (validStocks.length === 0) {
        console.warn("Nenhum item válido encontrado na resposta da API. Usando dados simulados.")
        return NextResponse.json(mockListData)
      }

      console.log(`Lista de FIIs recebida com sucesso: ${validStocks.length} itens`)
      return NextResponse.json({ stocks: validStocks })
    } catch (error) {
      console.warn("Erro ao analisar JSON da API. Usando dados simulados:", error)
      return NextResponse.json(mockListData)
    }
  } catch (error) {
    console.error("Erro ao buscar lista de FIIs:", error)
    return NextResponse.json(mockListData)
  }
}
