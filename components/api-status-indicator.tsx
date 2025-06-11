"use client"

import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Tenta buscar um fundo específico para verificar se a API está funcionando
        const response = await fetch("/api/check-api-status")

        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
          setMessage(data.message)
        } else {
          setStatus("offline")
          setMessage(`Erro ao verificar o status da API: ${response.status}`)
        }
      } catch (error) {
        setStatus("offline")
        setMessage("Erro ao verificar o status da API. Verifique sua conexão.")
        console.error("Erro ao verificar API:", error)
      }
    }

    checkApiStatus()

    // Verificar o status a cada 5 minutos
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (status === "loading") {
    return (
      <div className="flex items-center">
        <div className="h-3 w-3 rounded-full bg-gray-400 animate-pulse"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center cursor-help">
            <div className={`h-3 w-3 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`}></div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
