"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { month: "Jan", yield: 5.2 },
  { month: "Fev", yield: 5.3 },
  { month: "Mar", yield: 5.8 },
  { month: "Abr", yield: 6.0 },
  { month: "Mai", yield: 5.9 },
  { month: "Jun", yield: 6.2 },
  { month: "Jul", yield: 6.4 },
  { month: "Ago", yield: 6.3 },
  { month: "Set", yield: 6.2 },
  { month: "Out", yield: 6.5 },
  { month: "Nov", yield: 6.7 },
  { month: "Dez", yield: 6.8 },
]

export function Overview() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Dividend Yield Mensal</CardTitle>
        <CardDescription>Histórico de rendimentos ao longo dos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer
          config={{
            yield: {
              label: "Yield %",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="yield"
                strokeWidth={2}
                activeDot={{
                  r: 6,
                  style: { fill: "var(--color-yield)", opacity: 0.8 },
                }}
                style={{
                  stroke: "var(--color-yield)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
