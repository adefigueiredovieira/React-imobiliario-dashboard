"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ApiStatus() {
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
  }, [])

  if (status === "loading") {
    return null
  }

  return (
    <Alert variant={status === "online" ? "default" : "destructive"} className="mb-4">
      <div className="flex items-center gap-2">
        {status === "online" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  )
}
