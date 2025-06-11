import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { FundSearch } from "@/components/fund-search"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

export const revalidate = 3600 // Revalidar a cada hora

function ErrorFallback() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Ocorreu um erro ao carregar a página de busca. Por favor, tente novamente mais tarde.
      </AlertDescription>
    </Alert>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}

export default function BuscarPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Buscar Fundos</h2>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Busque fundos imobiliários por código (ticker) para visualizar seus detalhes e adicionar ao seu portfólio.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Pesquisar FIIs</CardTitle>
            <CardDescription>
              Digite o código do fundo imobiliário (ex: XPLG11) para visualizar seus detalhes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<SearchSkeleton />}>
                <FundSearch />
              </Suspense>
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
