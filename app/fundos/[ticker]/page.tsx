import { DashboardHeader } from "@/components/dashboard-header"
import { FundDetail } from "@/components/fund-detail"

export default function FundDetailPage({
  params,
}: {
  params: { ticker: string }
}) {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <FundDetail ticker={params.ticker} />
      </div>
    </main>
  )
}
