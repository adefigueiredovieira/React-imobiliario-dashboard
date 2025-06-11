"use client"

import Link from "next/link"
import { Plus, Search, Database } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ApiStatusIndicator } from "./api-status-indicator"
import { AddFundDialog } from "./add-fund-dialog"

export function DashboardHeader() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">FII Tracker</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ApiStatusIndicator />
            <Link href="/fundos">
              <Button variant="ghost">Meus Fundos</Button>
            </Link>
          </div>
          <Link href="/buscar">
            <Button variant="ghost">
              <Search className="mr-2 h-4 w-4" />
              Buscar Fundos
            </Button>
          </Link>
          <Link href="/api-dashboard">
            <Button variant="ghost">
              <Database className="mr-2 h-4 w-4" />
              API Dashboard
            </Button>
          </Link>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Fundo
          </Button>
          <ModeToggle />
        </nav>
      </div>
      <AddFundDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </header>
  )
}
