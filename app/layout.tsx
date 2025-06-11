import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FundsProvider } from "@/lib/use-funds"
import { Toaster } from "@/components/ui/use-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FII Tracker - Controle de Fundos Imobiliários",
  description: "Acompanhe seus investimentos em fundos imobiliários de forma simples e eficiente.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FundsProvider>{children}</FundsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
