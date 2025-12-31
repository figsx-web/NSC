"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Gift, Calendar } from "lucide-react"
import { DateRangeModal } from "./date-range-modal"

interface CurrencyConverterProps {
  totalCommission29: number
  totalCommission30: number
  exchangeRate: number
  onExchangeRateUpdate: (rate: number) => void
  bonusTotalUSD: number
  dateFilter: string
  onDateFilterChange: (filter: string) => void
  region?: "usa" | "uk" | "ale"
  customStartDate?: Date
  customEndDate?: Date
  onCustomDateChange?: (startDate: Date | null, endDate: Date | null) => void
}

export function CurrencyConverter({
  totalCommission29,
  totalCommission30,
  bonusTotalUSD,
  dateFilter,
  onDateFilterChange,
  region = "usa",
  customStartDate,
  customEndDate,
  onCustomDateChange,
}: CurrencyConverterProps) {
  const [currentRate, setCurrentRate] = useState<string>("5.50")
  const [showDateModal, setShowDateModal] = useState(false)

  // Update default rate when region changes
  useEffect(() => {
    if (region === "uk") {
      setCurrentRate("7.50")
    } else if (region === "ale") {
      setCurrentRate("6.50")
    } else {
      setCurrentRate("5.50")
    }
  }, [region])

  // Atualizar labels baseado na região
  const fromCurrency = region === "usa" ? "USD" : region === "uk" ? "GBP" : "EUR"
  const toCurrency = "BRL"
  const rate = Number.parseFloat(currentRate) || 5.5

  // Logic: For USA, use totalCommission29. For others (UK, Ale), use totalCommission30.
  const commissionSourceValue = region === "usa" ? totalCommission29 : totalCommission30
  const commissionBRL = commissionSourceValue * rate
  const bonusTotalBRL = bonusTotalUSD * rate

  const formatBRL = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    })
  }

  const formatSourceCurrency = (value: number) => {
    const currency = region === "usa" ? "USD" : region === "uk" ? "GBP" : "EUR"
    const locale = region === "usa" ? "en-US" : region === "uk" ? "en-GB" : "de-DE"
    return value.toLocaleString(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    })
  }

  const handleDateFilterChange = (value: string) => {
    if (value === "custom") {
      setShowDateModal(true)
    } else {
      onDateFilterChange(value)
      // Limpar datas personalizadas quando selecionar outro filtro
      if (onCustomDateChange) {
        onCustomDateChange(null, null)
      }
    }
  }

  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    if (onCustomDateChange) {
      onCustomDateChange(startDate, endDate)
    }
    onDateFilterChange("custom")
  }

  const handleCustomDateClear = () => {
    if (onCustomDateChange) {
      onCustomDateChange(null, null)
    }
    onDateFilterChange("all")
  }

  return (
    <div className="space-y-4">
      {/* Filtro de Período */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="14days">Últimos 14 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="all">Tempo todo</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <DateRangeModal
        open={showDateModal}
        onOpenChange={setShowDateModal}
        onApply={handleCustomDateApply}
        onClear={handleCustomDateClear}
      />

      {/* Campo de Cotação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            Cotação {fromCurrency} → {toCurrency}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2">
            <Label htmlFor="exchange-rate" className="text-sm whitespace-nowrap">
              1 {fromCurrency} =
            </Label>
            <Input
              id="exchange-rate"
              type="number"
              step="0.01"
              min="0"
              value={currentRate}
              onChange={(e) => setCurrentRate(e.target.value)}
              placeholder="5.50"
              className="w-20 text-center text-sm"
            />
            <span className="text-sm text-muted-foreground">BRL</span>
          </div>
        </CardContent>
      </Card>

      {/* Comissão em BRL */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {/* Change title for non-USA regions */}
          <CardTitle className="text-sm font-medium">
            {region === "usa" ? "Comissão 29% (BRL)" : "Comissão (BRL)"}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-xl font-bold text-green-600">{rate > 0 ? formatBRL(commissionBRL) : "R$ 0,00"}</div>
            <div className="text-xs text-muted-foreground">
              {formatSourceCurrency(commissionSourceValue)} × {rate.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bônus Total em BRL - Only show for USA */}
      {region === "usa" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bônus Total (BRL)</CardTitle>
            <Gift className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-xl font-bold text-purple-600">{rate > 0 ? formatBRL(bonusTotalBRL) : "R$ 0,00"}</div>
              <div className="text-xs text-muted-foreground">
                {formatSourceCurrency(bonusTotalUSD)} × {rate.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
