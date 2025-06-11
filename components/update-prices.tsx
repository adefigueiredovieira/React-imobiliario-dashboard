"use client"

import { useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFunds } from "@/lib/use-funds"
import { fetchFundDetails } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function UpdatePrices() {
  const { funds, updateFundPrice } = useFunds()
  const [updating, setUpdating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [updatedCount, setUpdatedCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  const handleUpdatePrices = async () => {
    if (funds.length === 0) {
      toast({
        title: "Nenhum fundo para atualizar",
        description: "Adicione fundos ao seu portfólio primeiro.",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    setProgress(0)
    setUpdatedCount(0)
    setErrorCount(0)

    const total = funds.length
    let updated = 0
    let errors = 0

    try {
      for (const fund of funds) {
        try {
          // Adicionar um pequeno atraso entre as requisições para evitar sobrecarga
          if (updated > 0 || errors > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          const fundDetails = await fetchFundDetails(fund.ticker)

          if (fundDetails) {
            updateFundPrice(fund.ticker, fundDetails.price)
            updated++
          }
        } catch (error) {
          console.error(`Erro ao atualizar ${fund.ticker}:`, error)
          errors++
        } finally {
          setProgress(Math.round(((updated + errors) / total) * 100))
          setUpdatedCount(updated)
          setErrorCount(errors)
        }
      }

      toast({
        title: "Atualização concluída",
        description: `${updated} fundos atualizados. ${errors} erros.`,
        variant: errors > 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Erro durante a atualização de preços:", error)
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro ao atualizar os preços dos fundos.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (funds.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Atualizar Preços</CardTitle>
          <CardDescription>Atualiza os preços de todos os fundos do seu portfólio com dados da API</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Adicione fundos ao seu portfólio para poder atualizar os preços.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualizar Preços</CardTitle>
        <CardDescription>Atualiza os preços de todos os fundos do seu portfólio com dados da API</CardDescription>
      </CardHeader>
      <CardContent>
        {updating && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground">
              Atualizando... {updatedCount} concluídos, {errorCount} erros
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdatePrices} disabled={updating} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${updating ? "animate-spin" : ""}`} />
          {updating ? "Atualizando..." : "Atualizar Todos os Preços"}
        </Button>
      </CardFooter>
    </Card>
  )
}
