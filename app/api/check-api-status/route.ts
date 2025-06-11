import { NextResponse } from "next/server"

export async function GET() {
  function getBaseUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.warn("NEXT_PUBLIC_API_URL não está definida. Usando URL padrão.")
      return "http://localhost:3000"
    }
    return apiUrl
  }

  const baseUrl = getBaseUrl()

  const endpoints = [
    {
      name: "Brapi",
      url: `${baseUrl}/api/proxy/brapi/quote?ticker=XPLG11`
    },
    {
      name: "Auth Service",
      url: `${baseUrl}/api/auth/healthcheck`
    },
    {
      name: "Database",
      url: `${baseUrl}/api/db/healthcheck`
    }
  ]

  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      try {
        const res = await fetch(endpoint.url, { cache: "no-store" })
        if (!res.ok) {
          return {
            name: endpoint.name,
            status: "offline",
            message: `Erro HTTP: ${res.status}`
          }
        }

        const data = await res.json()
        return {
          name: endpoint.name,
          status: data.status || "online",
          message: data.message || "OK"
        }
      } catch (err) {
        return {
          name: endpoint.name,
          status: "offline",
          message: "Erro de rede ou no endpoint"
        }
      }
    })
  )

  const statusSummary = results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { name: "unknown", status: "offline", message: "Erro desconhecido" }
  )

  return NextResponse.json(
    {
      overallStatus: statusSummary.some((s) => s.status === "offline")
        ? "parcialmente offline"
        : "online",
      dependencies: statusSummary
    },
    { status: 200 }
  )
}
