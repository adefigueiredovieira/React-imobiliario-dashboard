import { NextResponse } from "next/server"
import {
  BRAPI_BASE_URL,
  BRAPI_TOKEN,
  addApiKeyToUrl,
  getStandardHeaders,
  MONITORING_ENDPOINTS,
} from "@/lib/brapi-config"

// Função para verificar o status de um endpoint específico
async function checkEndpoint(endpoint: string) {
  try {
    const startTime = performance.now()

    // Verificar se temos uma chave de API antes de fazer a requisição
    if (!BRAPI_TOKEN || BRAPI_TOKEN.trim() === "") {
      return {
        status: "offline",
        responseTime: 0,
        message: "Chave da API não configurada ou vazia",
        authError: true,
      }
    }

    let url: string

    // Construir URLs específicas para cada endpoint
    if (endpoint.includes("/quote/XPLG11")) {
      // Para o endpoint de quote específico, usar URL simples com token
      url = `${BRAPI_BASE_URL}/api/quote/XPLG11?token=${BRAPI_TOKEN}`
    } else if (endpoint.includes("/quote/list")) {
      url = addApiKeyToUrl(`${BRAPI_BASE_URL}${endpoint}`)
    } else if (endpoint.includes("/available")) {
      url = addApiKeyToUrl(`${BRAPI_BASE_URL}${endpoint}`)
    } else {
      url = addApiKeyToUrl(`${BRAPI_BASE_URL}${endpoint}`)
    }

    console.log(`Verificando endpoint: ${endpoint}`)
    console.log(`URL construída: ${url.replace(/token=[^&]*/, "token=***")}`) // Log sem expor o token
    console.log(`Token configurado: ${BRAPI_TOKEN ? "Sim" : "Não"}`)
    console.log(`Tamanho do token: ${BRAPI_TOKEN ? BRAPI_TOKEN.length : 0}`)

    const response = await fetch(url, {
      method: "GET",
      headers: getStandardHeaders(),
      cache: "no-store",
      next: { revalidate: 0 },
    })

    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    console.log(`Resposta do endpoint ${endpoint}: ${response.status} ${response.statusText}`)

    // Verificar erros de autenticação específicos
    if (response.status === 401) {
      console.warn(`Erro 401 (Unauthorized) no endpoint ${endpoint}`)
      return {
        status: "offline",
        responseTime,
        message: "Token de API inválido ou expirado (401)",
        authError: true,
      }
    }

    if (response.status === 403) {
      console.warn(`Erro 403 (Forbidden) no endpoint ${endpoint}`)
      return {
        status: "offline",
        responseTime,
        message: "Acesso negado - verifique permissões do token (403)",
        authError: true,
      }
    }

    if (response.status === 429) {
      console.warn(`Erro 429 (Rate Limit) no endpoint ${endpoint}`)
      return {
        status: "offline",
        responseTime,
        message: "Limite de requisições excedido (429)",
        authError: false,
      }
    }

    if (!response.ok) {
      console.warn(`Endpoint ${endpoint} retornou status ${response.status}: ${response.statusText}`)
      return {
        status: "offline",
        responseTime,
        message: `Erro HTTP: ${response.status} - ${response.statusText}`,
      }
    }

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`Endpoint ${endpoint} retornou tipo de conteúdo inválido: ${contentType}`)
      return {
        status: "offline",
        responseTime,
        message: `Tipo de conteúdo inválido: ${contentType}`,
      }
    }

    // Tentar ler a resposta
    const text = await response.text()
    if (!text || text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.warn(`Endpoint ${endpoint} retornou HTML em vez de JSON`)
      return {
        status: "offline",
        responseTime,
        message: "Retornou HTML em vez de JSON - possível erro de autenticação",
        authError: true,
      }
    }

    // Tentar fazer parse do JSON
    try {
      const data = JSON.parse(text)

      // Verificar se há mensagens de erro na resposta
      if (data.error) {
        console.warn(`Endpoint ${endpoint} retornou erro: ${data.error}`)
        return {
          status: "offline",
          responseTime,
          message: `Erro da API: ${data.error}`,
          authError: data.error.toLowerCase().includes("auth") || data.error.toLowerCase().includes("token"),
        }
      }

      // Verificar se a resposta contém dados válidos
      if (endpoint.includes("/quote/list")) {
        if (!data.stocks || !Array.isArray(data.stocks)) {
          return {
            status: "offline",
            responseTime,
            message: "Resposta não contém lista de stocks válida",
          }
        }
      } else if (endpoint.includes("/quote/")) {
        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
          return {
            status: "offline",
            responseTime,
            message: "Resposta não contém dados de cotação válidos",
          }
        }
      } else if (endpoint.includes("/available")) {
        if (!data.stocks || !Array.isArray(data.stocks)) {
          return {
            status: "offline",
            responseTime,
            message: "Resposta não contém lista de ativos disponíveis",
          }
        }
      }

      console.log(`Endpoint ${endpoint} funcionando corretamente`)
      console.log(`Dados recebidos:`, JSON.stringify(data).substring(0, 200) + "...")

      return {
        status: "online",
        responseTime,
        message: "Endpoint funcionando corretamente",
        dataPreview:
          endpoint.includes("/quote/") && data.results
            ? `${data.results.length} resultado(s) encontrado(s)`
            : "Dados válidos recebidos",
      }
    } catch (parseError) {
      console.warn(`Endpoint ${endpoint} retornou JSON inválido:`, parseError)
      return {
        status: "offline",
        responseTime,
        message: "JSON inválido na resposta",
      }
    }
  } catch (error) {
    console.error(`Erro ao verificar endpoint ${endpoint}:`, error)
    return {
      status: "offline",
      responseTime: 0,
      message: `Erro de conexão: ${error.message || "Erro desconhecido"}`,
    }
  }
}

export async function GET() {
  try {
    console.log("=== VERIFICAÇÃO DE STATUS DA API BRAPI ===")
    console.log("Chave da API configurada:", BRAPI_TOKEN ? "Sim" : "Não")
    console.log("Tamanho da chave:", BRAPI_TOKEN ? BRAPI_TOKEN.length : 0)
    console.log(
      "Preview da chave:",
      BRAPI_TOKEN ? `${BRAPI_TOKEN.substring(0, 4)}...${BRAPI_TOKEN.substring(BRAPI_TOKEN.length - 4)}` : "N/A",
    )
    console.log("URL base:", BRAPI_BASE_URL)
    console.log("Método de autenticação: Token via parâmetro de query")

    // Verificar os endpoints específicos
    const results = await Promise.all([
      checkEndpoint(MONITORING_ENDPOINTS.QUOTE_TICKER),
      checkEndpoint(MONITORING_ENDPOINTS.QUOTE_LIST),
      checkEndpoint(MONITORING_ENDPOINTS.AVAILABLE),
    ])

    // Verificar se temos erros de autenticação
    const hasAuthErrors = results.some((result) => result.authError)

    console.log("Resultados da verificação:")
    results.forEach((result, index) => {
      const endpoints = [
        MONITORING_ENDPOINTS.QUOTE_TICKER,
        MONITORING_ENDPOINTS.QUOTE_LIST,
        MONITORING_ENDPOINTS.AVAILABLE,
      ]
      console.log(`${endpoints[index]}: ${result.status} - ${result.message}`)
      if (result.dataPreview) {
        console.log(`  Preview: ${result.dataPreview}`)
      }
    })

    // Mapear os resultados para os nomes dos endpoints
    const endpointStatus = {
      [MONITORING_ENDPOINTS.QUOTE_TICKER]: results[0],
      [MONITORING_ENDPOINTS.QUOTE_LIST]: results[1],
      [MONITORING_ENDPOINTS.AVAILABLE]: results[2],
    }

    // Determinar o status geral
    const onlineEndpoints = Object.values(endpointStatus).filter((status) => status.status === "online")
    const totalEndpoints = Object.values(endpointStatus).length

    let overallStatus: string
    if (onlineEndpoints.length === totalEndpoints) {
      overallStatus = "online"
    } else if (onlineEndpoints.length === 0) {
      overallStatus = "offline"
    } else {
      overallStatus = "partial"
    }

    console.log(`Status geral: ${overallStatus} (${onlineEndpoints.length}/${totalEndpoints} online)`)
    console.log("Erros de autenticação detectados:", hasAuthErrors)

    return NextResponse.json({
      status: overallStatus,
      endpoints: endpointStatus,
      summary: {
        total: totalEndpoints,
        online: onlineEndpoints.length,
        offline: totalEndpoints - onlineEndpoints.length,
      },
      authError: hasAuthErrors,
      apiKeyConfigured: !!(BRAPI_TOKEN && BRAPI_TOKEN.trim() !== ""),
      apiKeyLength: BRAPI_TOKEN ? BRAPI_TOKEN.length : 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao verificar status da API:", error)
    return NextResponse.json(
      {
        status: "error",
        message: `Erro ao verificar status: ${error.message || "Erro desconhecido"}`,
        endpoints: {},
        summary: {
          total: 0,
          online: 0,
          offline: 0,
        },
        authError: false,
        apiKeyConfigured: !!(BRAPI_TOKEN && BRAPI_TOKEN.trim() !== ""),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
