"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Settings,
  Loader2,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutDialog } from "@/components/logout-dialog"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { AddRecordDialog } from "@/components/add-record-dialog"
import { EditRecordDialog } from "@/components/edit-record-dialog"
import { DeleteRecordDialog } from "@/components/delete-record-dialog"
import { CurrencyConverter } from "@/components/currency-converter"
import { LastUpdateInfo } from "@/components/last-update-info"
import { AccountsManagement } from "@/components/accounts-management"
import { GMVProgressBar } from "@/components/gmv-progress-bar"
import { GMVProgressBarUK } from "@/components/gmv-progress-bar-uk"
import { GMVProgressBarAle } from "@/components/gmv-progress-bar-ale"
import { MobileDashboard } from "@/components/mobile-dashboard"


import { useIsMobile } from "@/hooks/use-mobile"
import { createClient } from "@/lib/supabase/client"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter } from "next/navigation"
import { parseISO } from "date-fns"

// New Imports
import { useDashboardData, DashboardRegion } from "@/hooks/use-dashboard-data"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { calculateTotals, calculateBonusTotals, calculateGeralTotals, prepareChartData } from "@/lib/dashboard-utils"
import { createAccount, updateAccount, deleteAccount, createRevenueRecord, updateRevenueRecord, deleteRevenueRecord, Region } from "@/lib/database"

// Explicit type import to avoid any conflation
import type { Account } from "@/lib/supabase/types"

// Types
interface LocalRecord {
  id: string
  date: string
  account: string
  gmv: number
  sales: number
  commission29: number
  commission30: number
  account_id?: string
  commission_29: number
  commission_30: number
  commission: number
}

// Helper to bridge old record structure with new
const mapRecordToLocal = (record: any): LocalRecord => {
  const isUkOrAle = record.account_id ? (record.account_id.startsWith("UK-") || record.account_id.startsWith("ALE-")) : false;
  return {
    id: record.id,
    date: record.date,
    account: record.account_id || record.account,
    gmv: record.gmv,
    sales: record.sales,
    // Ensure all required fields are present
    commission29: record.commission_29 || 0,
    commission30: record.commission_30 || 0,
    // Optional helpers
    commission: isUkOrAle ? (record.commission_30 || 0) : (record.commission_29 || 0),
    account_id: record.account_id,
    commission_29: record.commission_29 || 0,
    commission_30: record.commission_30 || 0,
  }
}

const formatDateBrasilia = (dateString: string) => {
  try {
    const parsedDate = parseISO(dateString)
    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }
}

export default function Dashboard() {
  // State
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined })
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [currentView, setCurrentView] = useState<"dashboard" | "accounts">("dashboard")
  const [selectedRegion, setSelectedRegion] = useState<DashboardRegion>("usa")
  const [accountsRegion, setAccountsRegion] = useState<Region>("usa")

  const { theme, setTheme } = useTheme()
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  // Dialog State
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false)
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false)
  const [editingRecord, setEditingRecord] = useState<LocalRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<LocalRecord | null>(null)

  // Hooks
  const router = useRouter()
  const isMobile = useIsMobile()

  // Determine which region to fetch data for
  const regionForData = currentView === "accounts" ? accountsRegion : selectedRegion

  const {
    accounts,
    filteredRecords,
    loading,
    exchangeRate,
    refreshData,
    error
  } = useDashboardData(regionForData as DashboardRegion, selectedAccount, selectedStatus, dateFilter, dateRange)

  // Derived State
  const totals = useMemo(() => {
    if (selectedRegion === "geral") {
      return calculateGeralTotals(filteredRecords, accounts, selectedAccount, exchangeRate)
    }
    return calculateTotals(filteredRecords, selectedAccount, selectedRegion)
  }, [filteredRecords, accounts, selectedAccount, selectedRegion, exchangeRate])

  const chartData = useMemo(() => {
    return prepareChartData(filteredRecords, selectedRegion === "geral", exchangeRate)
  }, [filteredRecords, selectedRegion, exchangeRate])

  const bonusTotals = useMemo(() => {
    return calculateBonusTotals(filteredRecords, selectedRegion)
  }, [filteredRecords, selectedRegion])

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10
  const paginationData = useMemo(() => {
    const totalRecords = filteredRecords.length
    const totalPages = Math.ceil(totalRecords / recordsPerPage)
    const startIndex = (currentPage - 1) * recordsPerPage
    const endIndex = startIndex + recordsPerPage
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

    return { records: paginatedRecords, totalRecords, totalPages, hasNextPage: currentPage < totalPages, hasPrevPage: currentPage > 1 }
  }, [filteredRecords, currentPage])

  // Helper for Table Display
  const getRecordCurrency = (record: any) => {
    if (record.account_id.startsWith("UK-")) return "GBP"
    if (record.account_id.startsWith("ALE-")) return "EUR"
    return "USD"
  }

  const getRecordCommission = (record: any) => {
    if (record.account_id.startsWith("UK-") || record.account_id.startsWith("ALE-")) {
      return record.commission_30
    }
    return record.commission_29
  }

  // Handlers
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleCustomDateChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRange({ from: startDate || undefined, to: endDate || undefined })
  }

  const handleExchangeRateUpdate = async (rate: number) => {
    // Implement if needed
  }

  const handleAddAccount = async (accountId: string, name: string, country: string, isActive: boolean) => {
    try {
      await createAccount(accountId, name, accountsRegion)
      refreshData()
    } catch (error) {
      console.error(error)
      alert("Erro ao criar conta")
    }
  }

  const handleUpdateAccount = async (accountId: string, name: string, country: string, isActive: boolean) => {
    try {
      await updateAccount(accountId, name, accountsRegion)
      refreshData()
    } catch (error) {
      console.error(error)
      alert("Erro ao atualizar conta")
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId, accountsRegion)
      refreshData()
    } catch (error) {
      console.error(error)
      alert("Erro ao excluir conta: " + (error as Error).message)
    }
  }

  // Record Operations
  const handleAddRecord = async (newRecord: any) => {
    try {
      const region = selectedRegion // Use selectedRegion directly, supporting 'ale'

      const isUkOrAle = region === "uk" || region === "ale"

      await createRevenueRecord({
        date: newRecord.date,
        account_id: newRecord.account,
        gmv: newRecord.gmv,
        sales: newRecord.sales,
        commission_29: isUkOrAle ? 0 : newRecord.commission,
        commission_30: isUkOrAle ? newRecord.commission : 0
      }, region as Region)
      refreshData()
      setShowAddRecordDialog(false)
    } catch (error) {
      console.error("Erro ao adicionar registro", error)
    }
  }

  const handleUpdateRecord = async (recordId: string, updatedRecord: any) => {
    try {
      const region = selectedRegion // Use selectedRegion directly, supporting 'ale'

      const isUkOrAle = region === "uk" || region === "ale"

      await updateRevenueRecord(recordId, {
        date: updatedRecord.date,
        account_id: updatedRecord.account,
        gmv: updatedRecord.gmv,
        sales: updatedRecord.sales,
        commission_29: isUkOrAle ? 0 : updatedRecord.commission,
        commission_30: isUkOrAle ? updatedRecord.commission : 0
      }, region as Region)
      refreshData()
      setEditingRecord(null)
    } catch (error) {
      console.error("Erro ao atualizar registro", error)
    }
  }

  const handleDeleteRecord = async () => {
    if (!deletingRecord) return
    try {
      const region = selectedRegion // Use selectedRegion directly
      await deleteRevenueRecord(deletingRecord.id, region as Region)
      refreshData()
      setDeletingRecord(null)
    } catch (error) {
      console.error("Erro ao deletar registro", error)
    }
  }



  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    )
  }

  if (isMobile) return <MobileDashboard />

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar
            currentView={currentView} // Passing currentView to sidebar
            onNavigate={(view) => {
              if (view === "accounts") {
                // Default to USA or keep current if valid region
                setAccountsRegion("usa")
              }
              setCurrentView(view)
            }}
          />
          <SidebarInset className="flex-1">
            <div className="flex flex-col h-full">
              <header className="flex items-center h-16 px-4 border-b shrink-0 bg-background z-10 sticky top-0">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {currentView === "dashboard" ? "Visão Geral" : "Gerenciar Contas"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="ml-auto flex items-center space-x-4">
                  {currentView === "dashboard" && (
                    <Tabs value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as DashboardRegion)}>
                      <TabsList>
                        <TabsTrigger value="geral">Geral</TabsTrigger>
                        <TabsTrigger value="usa">USA</TabsTrigger>
                        <TabsTrigger value="uk">UK</TabsTrigger>
                        <TabsTrigger value="ale">Ale</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                  {currentView === "accounts" && (
                    <Select value={accountsRegion} onValueChange={(v) => setAccountsRegion(v as Region)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a região" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usa">Contas USA</SelectItem>
                        <SelectItem value="uk">Contas UK</SelectItem>
                        <SelectItem value="ale">Contas ALE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={toggleTheme}
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                  {currentView === "dashboard" && (
                    <Button size="sm" onClick={() => setShowAddRecordDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Registro
                    </Button>
                  )}
                  <LastUpdateInfo />
                  <Button variant="ghost" size="icon" onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              <main className="flex-1">
                <div className="p-8 overflow-auto">
                  <div className="max-w-7xl mx-auto">
                    {/* Error Banner */}
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Erro ao carregar dados: </strong>
                        <span className="block sm:inline">{error}</span>
                      </div>
                    )}
                    {currentView === "dashboard" ? (
                      <>
                        {/* Header Card for Geral */}
                        {selectedRegion === "geral" && (
                          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-3xl font-bold mb-2">Visão Geral Global</h2>
                                  <p className="text-blue-100">Consolidado de todas as operações (USA + UK + ALE)</p>
                                </div>

                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Progress Bars */}
                        {/* Progress Bars - Passing Commission instead of GMV */}
                        {selectedRegion === "usa" && <GMVProgressBar currentGMV={totals.totalCommission29 + totals.totalCommission30} />}
                        {selectedRegion === "uk" && <GMVProgressBarUK currentGMV={totals.totalCommission29 + totals.totalCommission30} />}
                        {selectedRegion === "ale" && <GMVProgressBarAle currentGMV={totals.totalCommission29 + totals.totalCommission30} />}

                        {/* Main Chart Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
                          <div className="xl:col-span-4 h-[400px]">
                            <RevenueChart
                              data={chartData}
                              title={`Comissão Diária ${selectedRegion.toUpperCase()}`}
                              region={selectedRegion}
                            />
                          </div>
                          <div className="xl:col-span-1">
                            {/* Only show CurrencyConverter for individual regions where rate manip matters */}
                            {selectedRegion !== "geral" && (
                              <CurrencyConverter
                                totalCommission29={totals.totalCommission29}
                                totalCommission30={totals.totalCommission30}
                                exchangeRate={exchangeRate}
                                onExchangeRateUpdate={handleExchangeRateUpdate}
                                bonusTotalUSD={bonusTotals.totalBonusUSD}
                                dateFilter={dateFilter}
                                onDateFilterChange={setDateFilter}
                                region={selectedRegion === "ale" ? "ale" : selectedRegion === "uk" ? "uk" : "usa"}
                                customStartDate={dateRange.from}
                                customEndDate={dateRange.to}
                                onCustomDateChange={handleCustomDateChange}
                              />
                            )}
                            {selectedRegion === "geral" && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-sm text-muted-foreground">Filtro de Data</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Select value={dateFilter} onValueChange={setDateFilter}>
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
                                    </SelectContent>
                                  </Select>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>

                        {/* Overview Cards */}
                        <OverviewCards
                          totalGMV={totals.totalGMV}
                          totalSales={totals.totalSales}
                          totalCommission29={totals.totalCommission29}
                          totalCommission30={totals.totalCommission30}
                          region={selectedRegion}
                        />

                        {/* Filters */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por conta" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas as contas</SelectItem>
                              {accounts.map((acc: Account) => (
                                <SelectItem key={acc.account_id} value={acc.account_id}>{acc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="active">Ativas</SelectItem>
                              <SelectItem value="inactive">Inativas</SelectItem>
                            </SelectContent>
                          </Select>

                        </div>

                        {/* Records Table */}
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Registros</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Data</TableHead>
                                  <TableHead>Conta</TableHead>
                                  <TableHead className="text-right">GMV</TableHead>
                                  <TableHead className="text-right">Vendas</TableHead>
                                  <TableHead className="text-right">Comissão</TableHead>
                                  <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginationData.records.length === 0 ? (
                                  <TableRow><TableCell colSpan={6} className="text-center py-8">Nenhum registro</TableCell></TableRow>
                                ) : (
                                  paginationData.records.map((record: any) => {
                                    const currency = getRecordCurrency(record)
                                    const locale = currency === "GBP" ? "en-GB" : currency === "EUR" ? "de-DE" : "en-US"
                                    const commission = getRecordCommission(record)

                                    return (
                                      <TableRow key={record.id}>
                                        <TableCell>{formatDateBrasilia(record.date)}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{record.account_id}</Badge>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {record.gmv.toLocaleString(locale, { style: 'currency', currency: currency })}
                                        </TableCell>
                                        <TableCell className="text-right">{record.sales}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                          {(commission || 0).toLocaleString(locale, { style: 'currency', currency: currency })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingRecord(mapRecordToLocal(record))}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="outline" size="sm" onClick={() => setDeletingRecord(mapRecordToLocal(record))} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })
                                )}
                              </TableBody>
                            </Table>
                            {/* Pagination Controls */}
                            <div className="flex justify-between mt-4 items-center">
                              <Button disabled={!paginationData.hasPrevPage} onClick={() => setCurrentPage((p: number) => p - 1)} variant="outline">Anterior</Button>
                              <span className="text-sm text-muted-foreground">Página {currentPage} de {paginationData.totalPages || 1}</span>
                              <Button disabled={!paginationData.hasNextPage} onClick={() => setCurrentPage((p: number) => p + 1)} variant="outline">Próxima</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <AccountsManagement
                        accounts={accounts.map((acc: Account) => ({ id: acc.account_id, name: acc.name, country: (acc as any).country || "USA", isActive: (acc as any).is_active ?? true }))}
                        onAddAccount={() => setShowAddAccountDialog(true)}
                        onUpdateAccount={handleUpdateAccount}
                        onDeleteAccount={handleDeleteAccount}
                        region={accountsRegion}
                        onRegionChange={setAccountsRegion}
                      />
                    )}
                  </div>
                </div>
              </main>
            </div>
          </SidebarInset>

          <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} onConfirm={handleLogout} />
          <AddAccountDialog
            open={showAddAccountDialog}
            onOpenChange={setShowAddAccountDialog}
            onAddAccount={handleAddAccount}
            existingAccounts={accounts.map((acc: Account) => acc.account_id)}
            defaultCountry={accountsRegion === "usa" ? "USA" : accountsRegion === "uk" ? "UK" : "ALE"}
          />
          <AddRecordDialog
            open={showAddRecordDialog}
            onOpenChange={setShowAddRecordDialog}
            onAddRecord={handleAddRecord}
            accounts={accounts.map((acc: Account) => ({ id: acc.account_id, name: acc.name, country: (acc as any).country || "USA", isActive: true }))}
          />
          <EditRecordDialog
            open={!!editingRecord}
            onOpenChange={(open) => !open && setEditingRecord(null)}
            onUpdateRecord={handleUpdateRecord}
            accounts={accounts.map((acc: Account) => ({ id: acc.account_id, name: acc.name, country: (acc as any).country || "USA", isActive: true }))}
            record={editingRecord}
          />
          <DeleteRecordDialog
            open={!!deletingRecord}
            onOpenChange={(open) => !open && setDeletingRecord(null)}
            onConfirm={handleDeleteRecord}
            record={deletingRecord}
          />
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
