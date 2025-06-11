import { type NextRequest, NextResponse } from "next/server"
import { BRAPI_BASE_URL, BRAPI_TOKEN } from "@/lib/brapi-config"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const endpoint = searchParams.get("endpoint")

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint não especificado" }, { status: 400 })
    }

    // Construir a URL completa para o endpoint
    let url = `${BRAPI_BASE_URL}${endpoint}`

    // Adicionar parâmetros específicos para cada endpoint para garantir uma resposta válida
    if (endpoint.includes("/quote")) {
      url += "?symbol=IBOV&token=" + BRAPI_TOKEN
    } else if (endpoint.includes("/dividends")) {
      url += "?symbol=XPLG11&token=" + BRAPI_TOKEN
    } else if (endpoint.includes("/available/fiis")) {
      url += "?token=" + BRAPI_TOKEN
    } else {
      // Para outros endpoints, apenas adicionar o token
      url += "?token=" + BRAPI_TOKEN
    }

    console.log("Verificando endpoint:", url)

    // Fazer a requisição para o endpoint
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "FII-Tracker/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    // Verificar se a resposta é bem-sucedida, independentemente do conteúdo
    if (!response.ok) {
      return NextResponse.json(
        {
          status: "offline",
          message: `Erro ao acessar o endpoint: ${response.status} ${response.statusText}`,
        },
        { status: 200 },
      )
    }

    // Verificar o tipo de conteúdo antes de tentar fazer o parse como JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        {
          status: "offline",
          message: `O endpoint retornou um tipo de conteúdo inválido: ${contentType}`,
        },
        { status: 200 },
      )
    }

    // Tentar obter o texto da resposta primeiro
    const text = await response.text()

    // Verificar se o texto parece ser JSON válido
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      return NextResponse.json(
        {
          status: "offline",
          message: "O endpoint retornou HTML em vez de JSON",
        },
        { status: 200 },
      )
    }

    // Tentar fazer o parse do JSON
    try {
      const data = JSON.parse(text)

      return NextResponse.json(
        {
          status: "online",
          message: "Endpoint está funcionando corretamente",
        },
        { status: 200 },
      )
    } catch (parseError) {
      return NextResponse.json(
        {
          status: "offline",
          message: `Erro ao analisar a resposta JSON: ${parseError.message}`,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Erro ao verificar endpoint:", error)
    return NextResponse.json(
      {
        status: "offline",
        message: `Erro ao verificar o endpoint: ${error.message || "Erro desconhecido"}`,
      },
      { status: 200 },
    )
  }
}
