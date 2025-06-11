import { DashboardHeader } from "@/components/dashboard-header"
import { ApiDashboard } from "@/components/api-dashboard"

export const metadata = {
  title: "Dashboard de API - FII Tracker",
  description: "Monitore o status e uso da API Brapi no FII Tracker",
}

export default function ApiDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de API</h2>
        </div>
        <ApiDashboard />
      </div>
    </main>
  )
}
