"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, DollarSign, ShoppingCart, TrendingUp, Calendar, LogOut, Gift, BarChart3 } from "lucide-react"
import { LogoutDialog } from "@/components/logout-dialog"
import { DateRangeModal } from "@/components/date-range-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { getAccounts, getRevenueRecords, getAccountsUK, getRevenueRecordsUK } from "@/lib/database"
import { parseISO, isAfter, subDays, isYesterday, subMonths, isSameMonth, isSameYear } from "date-fns"

interface LocalAccount {
  id: string
  name: string
  country?: string
  isActive?: boolean
}

interface LocalRecord {
  id: string
  date: string
  account: string
  gmv: number
  sales: number
  commission29: number
  commission30: number
}

export function MobileDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<"usa" | "uk" | "geral" | "ale">("usa")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [accounts, setAccounts] = useState<LocalAccount[]>([])
  const [records, setRecords] = useState<LocalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState(5.5)
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [currentRate, setCurrentRate] = useState<string>("5.50")

  const getDefaultExchangeRate = (region: "usa" | "uk" | "geral" | "ale") => {
    return region === "usa" || region === "ale" ? 5.5 : region === "uk" ? 7.3 : 1
  }

  const getDefaultRateString = (region: "usa" | "uk" | "geral" | "ale") => {
    return region === "usa" || region === "ale" ? "5.50" : region === "uk" ? "7.30" : "1.00"
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        const defaultRate = getDefaultExchangeRate(selectedRegion)
        const defaultRateString = getDefaultRateString(selectedRegion)

        // Set default values immediately
        setExchangeRate(defaultRate)
        setCurrentRate(defaultRateString)
        setSelectedAccount("all")

        if (selectedRegion === "geral") {
          const accountsDataUSA = await getAccounts()
          const formattedAccountsUSA = accountsDataUSA.map((acc) => ({
            id: acc.account_id,
            name: acc.name,
            country: acc.country,
            isActive: acc.is_active,
          }))

          const recordsDataUSA = await getRevenueRecords()
          const formattedRecordsUSA = recordsDataUSA.map((record) => ({
            id: record.id,
            date: record.date,
            account: record.account_id,
            gmv: record.gmv,
            sales: record.sales,
            commission29: record.commission_29,
            commission30: record.commission_30,
          }))

          const accountsDataUK = await getAccountsUK()
          const formattedAccountsUK = accountsDataUK.map((acc) => ({
            id: acc.account_id,
            name: acc.name,
            country: acc.country,
            isActive: acc.is_active,
          }))

          const recordsDataUK = await getRevenueRecordsUK()
          const formattedRecordsUK = recordsDataUK.map((record) => ({
            id: record.id,
            date: record.date,
            account: record.account_id,
            gmv: record.gmv,
            sales: record.sales,
            commission29: record.commission_29,
            commission30: record.commission_30,
          }))

          setAccounts([...formattedAccountsUSA, ...formattedAccountsUK])
          setRecords([...formattedRecordsUSA, ...formattedRecordsUK])
        } else if (selectedRegion === "usa" || selectedRegion === "ale") {
          const accountsData = await getAccounts()
          const formattedAccounts = accountsData.map((acc) => ({
            id: acc.account_id,
            name: acc.name,
            country: acc.country,
            isActive: acc.is_active,
          }))
          setAccounts(formattedAccounts)

          const recordsData = await getRevenueRecords()
          const formattedRecords = recordsData.map((record) => ({
            id: record.id,
            date: record.date,
            account: record.account_id,
            gmv: record.gmv,
            sales: record.sales,
            commission29: record.commission_29,
            commission30: record.commission_30,
          }))
          setRecords(formattedRecords)
        } else {
          const accountsData = await getAccountsUK()
          const formattedAccounts = accountsData.map((acc) => ({
            id: acc.account_id,
            name: acc.name,
            country: acc.country,
            isActive: acc.is_active,
          }))
          setAccounts(formattedAccounts)

          const recordsData = await getRevenueRecordsUK()
          const formattedRecords = recordsData.map((record) => ({
            id: record.id,
            date: record.date,
            account: record.account_id,
            gmv: record.gmv,
            sales: record.sales,
            commission29: record.commission_29,
            commission30: record.commission_30,
          }))
          setRecords(formattedRecords)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedRegion])

  const filteredRecords = records.filter((record) => {
    if (selectedAccount && selectedAccount !== "all" && record.account !== selectedAccount) {
      return false
    }

    const recordDate = parseISO(record.date)
    const now = new Date()

    switch (dateFilter) {
      case "yesterday":
        return isYesterday(recordDate)
      case "thisMonth":
        return isSameMonth(recordDate, now) && isSameYear(recordDate, now)
      case "lastMonth":
        const lastMonth = subMonths(now, 1)
        return isSameMonth(recordDate, lastMonth) && isSameYear(recordDate, lastMonth)
      case "7days":
        return isAfter(recordDate, subDays(now, 7))
      case "14days":
        return isAfter(recordDate, subDays(now, 14))
      case "30days":
        return isAfter(recordDate, subDays(now, 30))
      case "custom":
        if (customStartDate && customEndDate) {
          return recordDate >= customStartDate && recordDate <= customEndDate
        }
        return true
      default:
        return true
    }
  })

  const totals = filteredRecords.reduce(
    (acc, record) => {
      if (selectedRegion === "geral") {
        // Convert to BRL based on country
        const account = accounts.find((a) => a.id === record.account)
        const isUSA = account?.country === "USA"
        const rate = isUSA ? 5.6 : 7.3

        return {
          totalGMV: acc.totalGMV + record.gmv * rate,
          totalSales: acc.totalSales + record.sales,
          totalCommission29: acc.totalCommission29 + (isUSA ? record.commission29 * rate : record.commission30 * rate),
          totalCommission30: 0,
        }
      } else {
        return {
          totalGMV: acc.totalGMV + record.gmv,
          totalSales: acc.totalSales + record.sales,
          totalCommission29: acc.totalCommission29 + record.commission29,
          totalCommission30: acc.totalCommission30 + record.commission30,
        }
      }
    },
    { totalGMV: 0, totalSales: 0, totalCommission29: 0, totalCommission30: 0 },
  )

  const bonusAccountId =
    selectedRegion === "usa" || selectedRegion === "ale" ? "C-BONUSES" : selectedRegion === "uk" ? "UK-BONUSES" : null
  const bonusRecords = bonusAccountId ? filteredRecords.filter((record) => record.account === bonusAccountId) : []

  const bonusTotalUSD = bonusRecords.reduce((sum, record) => sum + record.gmv, 0)

  const handleCustomDateChange = (startDate: Date | null, endDate: Date | null) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
  }

  const handleExchangeRateUpdate = (rate: number) => {
    setExchangeRate(rate)
  }

  const handleLogout = async () => {
    window.location.href = "/login"
  }

  const handleDateFilterChange = (value: string) => {
    if (value === "custom") {
      setShowDateModal(true)
    } else {
      setDateFilter(value)
      setCustomStartDate(null)
      setCustomEndDate(null)
    }
  }

  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
    setDateFilter("custom")
  }

  const handleCustomDateClear = () => {
    setCustomStartDate(null)
    setCustomEndDate(null)
    setDateFilter("all")
  }

  const handleExchangeRateChange = (value: string) => {
    setCurrentRate(value)
    const defaultRate = getDefaultExchangeRate(selectedRegion)
    const rate = Number.parseFloat(value) || defaultRate
    setExchangeRate(rate)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Menu Hambúrguer */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/cat-logo-black.png" alt="CatInfoMedia" />
              <AvatarFallback>CI</AvatarFallback>
            </Avatar>
            <h1 className="text-lg font-semibold">Dashboard TikTok Shop</h1>
          </div>

          {/* Adding theme toggle and menu in header */}
          <div className="flex items-center gap-2">
            <div className="scale-75">
              <ThemeToggle />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/cat-logo-black.png" alt="CatInfoMedia" />
                      <AvatarFallback>CI</AvatarFallback>
                    </Avatar>
                    CatInfoMedia
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  <Button
                    variant={selectedRegion === "geral" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRegion("geral")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard Geral
                  </Button>
                  <Button
                    variant={selectedRegion === "usa" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRegion("usa")}
                  >
                    <span className="mr-2">🇺🇸</span>
                    Dashboard EUA
                  </Button>
                  <Button
                    variant={selectedRegion === "uk" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRegion("uk")}
                  >
                    <span className="mr-2">🇬🇧</span>
                    Dashboard UK
                  </Button>
                  <Button
                    variant={selectedRegion === "ale" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedRegion("ale")}
                  >
                    <span className="mr-2">👤</span>
                    Dashboard Ale
                  </Button>

                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600"
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Deslogar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 space-y-4">
        {/* Cards na ordem solicitada */}

        {/* 0. Filtro por Conta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtrar por Conta</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                    {selectedRegion === "geral" && account.country && ` (${account.country})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 1. Período */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
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

        {/* 2. Cotação Dólar */}
        {selectedRegion !== "geral" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cotação {selectedRegion === "usa" || selectedRegion === "ale" ? "USD" : "GBP"} → BRL
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="exchange-rate" className="text-sm whitespace-nowrap">
                    1 {selectedRegion === "usa" || selectedRegion === "ale" ? "USD" : "GBP"} =
                  </Label>
                  <Input
                    id="exchange-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentRate}
                    onChange={(e) => handleExchangeRateChange(e.target.value)}
                    placeholder={selectedRegion === "usa" || selectedRegion === "ale" ? "5.50" : "7.30"}
                    className="w-20 text-center text-sm"
                  />
                  <span className="text-sm text-muted-foreground">BRL</span>
                </div>
                <div className="text-lg font-bold">R$ {exchangeRate.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Comissão 29% BRL */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedRegion === "geral"
                ? "Comissão Total (BRL)"
                : `Comissão ${selectedRegion === "uk" ? "30%" : "29%"} (BRL)`}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                R${" "}
                {selectedRegion === "geral"
                  ? totals.totalCommission29.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })
                  : (
                      (selectedRegion === "uk" ? totals.totalCommission30 : totals.totalCommission29) * exchangeRate
                    ).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
              </div>
              {selectedRegion !== "geral" && (
                <div className="text-xs text-muted-foreground">
                  {selectedRegion === "usa" || selectedRegion === "ale" ? "$" : "£"}
                  {(selectedRegion === "uk" ? totals.totalCommission30 : totals.totalCommission29).toLocaleString(
                    selectedRegion === "usa" || selectedRegion === "ale" ? "en-US" : "en-GB",
                    { minimumFractionDigits: 2 },
                  )}{" "}
                  × {exchangeRate.toFixed(2)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Bônus Total */}
        {selectedRegion !== "geral" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bônus Total (BRL)</CardTitle>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  R$ {(bonusTotalUSD * exchangeRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedRegion === "usa" || selectedRegion === "ale" ? "$" : "£"}
                  {bonusTotalUSD.toLocaleString(
                    selectedRegion === "usa" || selectedRegion === "ale" ? "en-US" : "en-GB",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. GMV Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              GMV Total{" "}
              {selectedRegion === "geral"
                ? "(BRL)"
                : selectedRegion === "usa" || selectedRegion === "ale"
                  ? "(USD)"
                  : "(GBP)"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedRegion === "geral"
                ? "R$ "
                : selectedRegion === "uk"
                  ? "£"
                  : selectedRegion === "usa" || selectedRegion === "ale"
                    ? "$"
                    : ""}
              {totals.totalGMV.toLocaleString(
                selectedRegion === "geral"
                  ? "pt-BR"
                  : selectedRegion === "usa" || selectedRegion === "ale"
                    ? "en-US"
                    : "en-GB",
                {
                  minimumFractionDigits: 2,
                },
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6. Vendas Totais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* 7. Comissão 29% USD/GBP */}
        {selectedRegion !== "geral" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissão {selectedRegion === "uk" ? "30%" : "29%"}{" "}
                {selectedRegion === "usa" || selectedRegion === "ale" ? "(USD)" : "(GBP)"}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {selectedRegion === "usa" || selectedRegion === "ale" ? "$" : "£"}
                {(selectedRegion === "uk" ? totals.totalCommission30 : totals.totalCommission29).toLocaleString(
                  selectedRegion === "usa" || selectedRegion === "ale" ? "en-US" : "en-GB",
                  { minimumFractionDigits: 2 },
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <DateRangeModal
        open={showDateModal}
        onOpenChange={setShowDateModal}
        onApply={handleCustomDateApply}
        onClear={handleCustomDateClear}
      />

      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={handleLogout} />
    </div>
  )
}
