import { DashboardHeader } from "@/components/dashboard-header"
import { Overview } from "@/components/overview"
import { RecentPayments } from "@/components/recent-payments"
import { StatsCards } from "@/components/stats-cards"
import { TopFunds } from "@/components/top-funds"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Usando dados simulados para demonstração. Em um ambiente de produção, estes dados seriam obtidos da API
            real.
          </AlertDescription>
        </Alert>

        <StatsCards />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Overview />
          <TopFunds />
        </div>
        <RecentPayments />
      </div>
    </main>
  )
}
