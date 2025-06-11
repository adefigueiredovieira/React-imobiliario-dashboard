"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Tipagens
interface FundInfo {
  name: string;
  sector: string;
  currentPrice: number;
  changePercent: number;
  logo: string;
}

interface Dividend {
  month: string;
  dividend: number;
  yield: number;
}

// Função para buscar informações do fundo
async function getFundInfo(ticker: string): Promise<FundInfo> {
  const apiUrl = `https://brapi.dev/api/quote/${ticker}?token=seu_token_aqui`;
  const fallbackData = {
    name: ticker,
    sector: "Indefinido",
    currentPrice: 0,
    changePercent: 0,
    logo: "",
  };

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!response.ok) return fallbackData;

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return fallbackData;

    const { results } = await response.json();
    if (!results || results.length === 0) return fallbackData;

    const result = results[0];
    return {
      name: result.longName || result.shortName,
      sector: result.sector,
      currentPrice: result.regularMarketPrice,
      changePercent: result.regularMarketChangePercent,
      logo: result.logourl,
    };
  } catch {
    return fallbackData;
  }
}

// Função para buscar histórico de dividendos
async function getDividendHistory(ticker: string): Promise<Dividend[]> {
  const apiUrl = `https://brapi.dev/api/quote/${ticker}/dividends?token=seu_token_aqui`;
  const fallbackData = [
    { month: "Janeiro", dividend: 0.6, yield: 0.72 },
    { month: "Fevereiro", dividend: 0.62, yield: 0.74 },
  ];

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!response.ok) return fallbackData;

    const contentType = response.headers.get("content-type");
    if (!contentType.includes("application/json")) return fallbackData;

    const { dividends } = await response.json();
    if (!dividends || dividends.length === 0) return fallbackData;

    return dividends.map((d: any) => ({
      month: new Date(d.paymentDate).toLocaleString("pt-BR", { month: "long" }),
      dividend: d.dividend,
      yield: d.yield,
    }));
  } catch {
    return fallbackData;
  }
}

// Componente principal
export default function SearchFund() {
  const [ticker, setTicker] = useState("");
  const [fund, setFund] = useState<FundInfo | null>(null);
  const [dividends, setDividends] = useState<Dividend[]>([]);

  const handleSearch = async () => {
    if (!ticker) return;
    const fundData = await getFundInfo(ticker);
    const dividendData = await getDividendHistory(ticker);
    setFund(fundData);
    setDividends(dividendData);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <Input
        placeholder="Digite o ticker do fundo (ex: XPML11)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      {fund && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {fund.logo && (
                <Image
                  src={fund.logo}
                  alt={fund.name}
                  width={32}
                  height={32}
                  className="rounded"
                />
              )}
              {fund.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">{fund.sector}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {fund.currentPrice.toFixed(2)}</div>
            <Badge
              variant={fund.changePercent >= 0 ? "success" : "destructive"}
              className="mt-2"
            >
              {fund.changePercent.toFixed(2)}%
            </Badge>
          </CardContent>
        </Card>
      )}

      {dividends.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Histórico de Dividendos</h3>
          {dividends.map((dividend, index) => (
            <Card key={index}>
              <CardContent className="flex justify-between p-4">
                <span>{dividend.month}</span>
                <span>R$ {dividend.dividend.toFixed(2)} ({dividend.yield.toFixed(2)}%)</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
