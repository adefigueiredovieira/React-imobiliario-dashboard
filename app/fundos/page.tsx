import { FundsList } from "@/components/funds-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { UpdatePrices } from "@/components/update-prices"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function FundosPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Meus Fundos</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <FundsList />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
              <UpdatePrices />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
