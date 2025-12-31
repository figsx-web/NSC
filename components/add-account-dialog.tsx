"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddAccount: (accountId: string, name: string, country: string, isActive: boolean) => void
  existingAccounts: string[]
  defaultCountry?: string // Adicionada prop para país padrão baseado na região
}

export function AddAccountDialog({
  open,
  onOpenChange,
  onAddAccount,
  existingAccounts,
  defaultCountry = "USA", // Valor padrão para país
}: AddAccountDialogProps) {
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [country, setCountry] = useState<string>("")
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && !country) {
      setCountry(defaultCountry)
    }
  }, [open, defaultCountry, country])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar país
    if (!country) {
      setError("Selecione um país")
      return
    }

    // Validar nome
    if (!accountName.trim()) {
      setError("Digite um nome para a conta")
      return
    }

    // Validar número da conta
    const number = Number.parseInt(accountNumber)
    if (isNaN(number) || number < 0 || number > 999) {
      setError("Digite um número entre 0 e 999")
      return
    }

    // Formatar ID da conta baseado no país
    const prefix = country === "USA" ? "C" : country === "UK" ? "UK" : "ALE"
    const accountId = `${prefix}-${number.toString().padStart(3, "0")}`

    // Verificar se já existe
    if (existingAccounts.includes(accountId)) {
      setError("Esta conta já existe")
      return
    }

    // Adicionar conta
    onAddAccount(accountId, accountName.trim(), country, isActive)

    // Limpar e fechar
    setAccountNumber("")
    setAccountName("")
    setCountry("")
    setIsActive(true)
    setError("")
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAccountNumber("")
      setAccountName("")
      setCountry("")
      setIsActive(true)
      setError("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Conta</DialogTitle>
          <DialogDescription>
            Crie uma nova conta do TikTok Shop. O ID será gerado automaticamente baseado no país selecionado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                País
              </Label>
              <div className="col-span-3">
                <Select
                  value={country}
                  onValueChange={(value) => {
                    setCountry(value)
                    setError("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">🇺🇸 Estados Unidos</SelectItem>
                    <SelectItem value="UK">🇬🇧 Reino Unido</SelectItem>
                    <SelectItem value="ALE">eur Contas ALE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">
                Nome
              </Label>
              <div className="col-span-3">
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value)
                    setError("")
                  }}
                  placeholder="Nome da conta"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-number" className="text-right">
                Número
              </Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {country === "USA" ? "C-" : country === "UK" ? "UK-" : country === "ALE" ? "ALE-" : "?-"}
                  </span>
                  <Input
                    id="account-number"
                    type="number"
                    min="0"
                    max="999"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value)
                      setError("")
                    }}
                    placeholder="000"
                    className="flex-1"
                  />
                </div>
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                {accountNumber && country && !error && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Conta: {country === "USA" ? "C-" : country === "UK" ? "UK-" : "ALE-"}
                    {accountNumber.padStart(3, "0")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is-active" className="text-right">
                Status
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="is-active" className="text-sm">
                  {isActive ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Conta Ativa
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Conta Inativa
                    </span>
                  )}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Criar Conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
