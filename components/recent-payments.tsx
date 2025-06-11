"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFunds } from "@/lib/use-funds"

export function RecentPayments() {
  const { payments } = useFunds()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
        <CardDescription>Últimos recebimentos de dividendos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="font-medium">Fundo</div>
            <div className="font-medium">Data</div>
            <div className="font-medium">Valor por Cota</div>
            <div className="font-medium">Cotas</div>
            <div className="font-medium">Total</div>
          </div>
          <div className="divide-y">
            {payments.map((payment) => (
              <div key={`${payment.ticker}-${payment.date}`} className="grid gap-2 py-4 md:grid-cols-3 lg:grid-cols-5">
                <div className="font-medium">{payment.ticker}</div>
                <div>{new Date(payment.date).toLocaleDateString("pt-BR")}</div>
                <div>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(payment.valuePerShare)}
                </div>
                <div>{payment.shares}</div>
                <div>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(payment.valuePerShare * payment.shares)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver histórico completo
        </Button>
      </CardFooter>
    </Card>
  )
}
