"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { EditAccountDialog } from "./edit-account-dialog"
import { DeleteAccountDialog } from "./delete-account-dialog"

interface Account {
  id: string
  name: string
  country?: string
  isActive?: boolean
}

interface AccountsManagementProps {
  accounts: Account[]
  onAddAccount: () => void
  onUpdateAccount: (accountId: string, name: string, country: string, isActive: boolean) => void
  onDeleteAccount: (accountId: string) => void
  region?: "usa" | "uk" | "ale" // Adicionando "ale" ao tipo
  onRegionChange?: (region: "usa" | "uk" | "ale") => void // Adicionando "ale" ao tipo
}

export function AccountsManagement({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  region = "usa",
  onRegionChange,
}: AccountsManagementProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 10

  const handleUpdateAccount = (accountId: string, name: string, country: string, isActive: boolean) => {
    onUpdateAccount(accountId, name, country, isActive)
    setEditingAccount(null)
  }

  const handleDeleteAccount = () => {
    if (deletingAccount) {
      onDeleteAccount(deletingAccount.id)
      setDeletingAccount(null)
    }
  }

  const handleRegionChange = (newRegion: "usa" | "uk" | "ale") => {
    // Adicionando "ale" ao tipo
    setCurrentPage(1)
    setSearchTerm("")
    onRegionChange?.(newRegion)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const getRegionLabel = (regionCode: "usa" | "uk" | "ale") => {
    switch (regionCode) {
      case "usa":
        return { icon: "🇺🇸", name: "EUA", fullName: "Estados Unidos" }
      case "uk":
        return { icon: "🇬🇧", name: "UK", fullName: "Reino Unido" }
      case "ale":
        return { icon: "👤", name: "ALE", fullName: "Ale" }
    }
  }

  const filteredAccounts = accounts.filter(
    (account) =>
      account.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (a.id === "C-BONUSES") return -1
    if (b.id === "C-BONUSES") return 1
    return a.id.localeCompare(b.id, undefined, { numeric: true })
  })

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAccounts = sortedAccounts.slice(startIndex, endIndex)

  const regionInfo = getRegionLabel(region)

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={onAddAccount} className="bg-blue-500 hover:bg-blue-600 h-9 px-3 py-1 gap-1">
          <Plus className="w-4 h-4" />
          Nova Conta
        </Button>

        <Select value={region} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-auto min-w-[140px] h-9 px-3 py-1 gap-2">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{regionInfo.icon}</span>
                <span>Contas {regionInfo.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usa">
              <div className="flex items-center gap-2">
                <span>🇺🇸</span>
                <span>Contas EUA</span>
              </div>
            </SelectItem>
            <SelectItem value="uk">
              <div className="flex items-center gap-2">
                <span>🇬🇧</span>
                <span>Contas UK</span>
              </div>
            </SelectItem>
            <SelectItem value="ale">
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span>Contas ALE</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar contas..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{regionInfo.icon}</span>
            Gerenciar Contas {regionInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAccounts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchTerm ? (
                <>
                  <p className="text-lg mb-2">Nenhuma conta encontrada</p>
                  <p className="text-sm">Tente pesquisar com outros termos</p>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">Nenhuma conta cadastrada</p>
                  <p className="text-sm">Clique em "Nova Conta" para começar</p>
                </>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>ID da Conta</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              account.isActive !== false ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {account.isActive !== false ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{account.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{regionInfo.icon}</span>
                          <span className="text-sm">{regionInfo.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingAccount(account)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingAccount(account)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, sortedAccounts.length)} de {sortedAccounts.length}{" "}
                    contas
                    {searchTerm && ` (filtradas)`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EditAccountDialog
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        onUpdateAccount={handleUpdateAccount}
        account={editingAccount}
      />

      <DeleteAccountDialog
        open={!!deletingAccount}
        onOpenChange={(open) => !open && setDeletingAccount(null)}
        onConfirm={handleDeleteAccount}
        account={deletingAccount}
      />
    </>
  )
}
