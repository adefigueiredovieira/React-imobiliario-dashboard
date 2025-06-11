"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { useFunds } from "@/lib/use-funds"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TopFunds() {
  const { funds } = useFunds()
  const topFunds = funds.slice(0, 5)

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Melhores Fundos</CardTitle>
        <CardDescription>Por dividend yield no último mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {topFunds.map((fund) => (
            <div className="flex items-center" key={fund.ticker}>
              <div className="mr-4 space-y-1">
                <p className="text-sm font-medium leading-none">{fund.ticker}</p>
                <p className="text-sm text-muted-foreground">{fund.name}</p>
              </div>
              <div className="ml-auto font-medium">{fund.dividendYield}%</div>
            </div>
          ))}
          <div className="flex justify-center">
            <Link href="/fundos">
              <Button variant="outline" className="flex gap-1">
                Ver todos os fundos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
