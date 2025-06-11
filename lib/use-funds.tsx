"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { ApiFund } from "./api"

interface Fund {
  ticker: string
  name: string
  shares: number
  price: number
  dividendYield: number
  totalValue: number
  sector?: string
  lastDividend?: number
  pvp?: number
}

interface Payment {
  ticker: string
  date: string
  valuePerShare: number
  shares: number
}

interface FundsContextType {
  funds: Fund[]
  payments: Payment[]
  totalDividends: number
  averageYield: string
  isLoading: boolean
  addFund: (fund: Fund) => void
  removeFund: (ticker: string) => void
  addPayment: (payment: Payment) => void
  updateFundPrice: (ticker: string, price: number) => void
  addFundToPortfolio: (apiFund: ApiFund, shares?: number) => void
  updateFund: (ticker: string, shares: number, price: number) => void
}

const FundsContext = createContext<FundsContextType | undefined>(undefined)

// Mock initial data
const initialFunds: Fund[] = [
  {
    ticker: "XPLG11",
    name: "XP Log Fundo de Investimento Imobiliário",
    shares: 100,
    price: 112.5,
    dividendYield: 7.8,
    totalValue: 11250.0,
  },
  {
    ticker: "HGLG11",
    name: "CSHG Logística FII",
    shares: 80,
    price: 145.2,
    dividendYield: 6.9,
    totalValue: 11616.0,
  },
  {
    ticker: "KNRI11",
    name: "Kinea Real Estate Equity FII",
    shares: 120,
    price: 97.35,
    dividendYield: 8.2,
    totalValue: 11682.0,
  },
  {
    ticker: "HSML11",
    name: "HSI Mall Fundo de Investimento Imobiliário",
    shares: 150,
    price: 87.65,
    dividendYield: 7.1,
    totalValue: 13147.5,
  },
  {
    ticker: "VISC11",
    name: "Vinci Shopping Centers FII",
    shares: 200,
    price: 89.45,
    dividendYield: 7.5,
    totalValue: 17890.0,
  },
]

const initialPayments: Payment[] = [
  {
    ticker: "XPLG11",
    date: "2024-04-15",
    valuePerShare: 0.85,
    shares: 100,
  },
  {
    ticker: "HGLG11",
    date: "2024-04-10",
    valuePerShare: 0.92,
    shares: 80,
  },
  {
    ticker: "KNRI11",
    date: "2024-04-12",
    valuePerShare: 0.78,
    shares: 120,
  },
  {
    ticker: "XPLG11",
    date: "2024-03-15",
    valuePerShare: 0.82,
    shares: 100,
  },
  {
    ticker: "HGLG11",
    date: "2024-03-10",
    valuePerShare: 0.88,
    shares: 80,
  },
  {
    ticker: "KNRI11",
    date: "2024-03-12",
    valuePerShare: 0.75,
    shares: 120,
  },
]

export function FundsProvider({ children }: { children: React.ReactNode }) {
  const [funds, setFunds] = useState<Fund[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fiiTrackerFunds")
        return saved ? JSON.parse(saved) : initialFunds
      } catch (error) {
        console.error("Erro ao carregar fundos do localStorage:", error)
        return initialFunds
      }
    }
    return initialFunds
  })

  const [payments, setPayments] = useState<Payment[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fiiTrackerPayments")
        return saved ? JSON.parse(saved) : initialPayments
      } catch (error) {
        console.error("Erro ao carregar pagamentos do localStorage:", error)
        return initialPayments
      }
    }
    return initialPayments
  })

  const [isLoading, setIsLoading] = useState(false)

  // Calculate total dividends from the last month
  const totalDividends = payments
    .filter((p) => {
      try {
        const paymentDate = new Date(p.date)
        const now = new Date()
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1))
        return paymentDate >= lastMonth
      } catch (error) {
        console.error("Erro ao processar data de pagamento:", error)
        return false
      }
    })
    .reduce((sum, payment) => sum + payment.valuePerShare * payment.shares, 0)

  // Calculate average yield
  const averageYield =
    funds.length > 0 ? (funds.reduce((sum, fund) => sum + fund.dividendYield, 0) / funds.length).toFixed(2) : "0.00"

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fiiTrackerFunds", JSON.stringify(funds))
      } catch (error) {
        console.error("Erro ao salvar fundos no localStorage:", error)
      }
    }
  }, [funds])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fiiTrackerPayments", JSON.stringify(payments))
      } catch (error) {
        console.error("Erro ao salvar pagamentos no localStorage:", error)
      }
    }
  }, [payments])

  // Add a new fund
  const addFund = useCallback((fund: Fund) => {
    setFunds((prev) => [...prev, fund])
  }, [])

  // Remove a fund
  const removeFund = useCallback((ticker: string) => {
    setFunds((prev) => prev.filter((fund) => fund.ticker !== ticker))
  }, [])

  // Add a new payment
  const addPayment = useCallback((payment: Payment) => {
    setPayments((prev) => [...prev, payment])
  }, [])

  // Update fund price
  const updateFundPrice = useCallback((ticker: string, price: number) => {
    if (!ticker || typeof price !== "number" || isNaN(price) || price <= 0) {
      console.error(`Tentativa de atualizar preço com valores inválidos: ticker=${ticker}, price=${price}`)
      return
    }

    setFunds((prev) =>
      prev.map((fund) => (fund.ticker === ticker ? { ...fund, price, totalValue: fund.shares * price } : fund)),
    )
  }, [])

  // Add fund from API to portfolio
  const addFundToPortfolio = useCallback((apiFund: ApiFund, shares = 100) => {
    setFunds((prev) => {
      const existingFund = prev.find((f) => f.ticker === apiFund.ticker)

      if (existingFund) {
        // Update existing fund
        return prev.map((fund) =>
          fund.ticker === apiFund.ticker
            ? {
                ...fund,
                price: apiFund.price,
                dividendYield: apiFund.dividendYield,
                shares: fund.shares + shares, // Adicionar mais cotas
                totalValue: (fund.shares + shares) * apiFund.price,
                lastDividend: apiFund.lastDividend,
                sector: apiFund.sector,
                pvp: apiFund.pvp,
              }
            : fund,
        )
      } else {
        // Add new fund
        const newFund: Fund = {
          ticker: apiFund.ticker,
          name: apiFund.name,
          shares: shares,
          price: apiFund.price,
          dividendYield: apiFund.dividendYield,
          totalValue: shares * apiFund.price,
          sector: apiFund.sector,
          lastDividend: apiFund.lastDividend,
          pvp: apiFund.pvp,
        }

        return [...prev, newFund]
      }
    })
  }, [])

  // Atualizar um fundo existente
  const updateFund = useCallback((ticker: string, shares: number, price: number) => {
    setFunds((prev) => {
      // Criar uma nova array para evitar mutações diretas
      return prev.map((fund) => {
        if (fund.ticker === ticker) {
          // Criar um novo objeto para o fundo atualizado
          return {
            ...fund,
            shares,
            price,
            totalValue: shares * price,
          }
        }
        return fund
      })
    })
  }, [])

  const contextValue = {
    funds,
    payments,
    totalDividends,
    averageYield,
    isLoading,
    addFund,
    removeFund,
    addPayment,
    updateFundPrice,
    addFundToPortfolio,
    updateFund,
  }

  return <FundsContext.Provider value={contextValue}>{children}</FundsContext.Provider>
}

export function useFunds() {
  const context = useContext(FundsContext)
  if (context === undefined) {
    throw new Error("useFunds must be used within a FundsProvider")
  }
  return context
}
