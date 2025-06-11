import { type NextRequest, NextResponse } from "next/server"
import { BRAPI_BASE_URL, addApiKeyToUrl } from "@/lib/brapi-config"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get("ticker")

    if (!ticker) {
      return NextResponse.json({ error: "Ticker não fornecido" }, { status: 400 })
    }

    const url = addApiKeyToUrl(`${BRAPI_BASE_URL}/quote/${ticker}?dividends=true`)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar dividendos: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar dividendos:", error)
    return NextResponse.json({ error: "Erro ao buscar dividendos" }, { status: 500 })
  }
}
