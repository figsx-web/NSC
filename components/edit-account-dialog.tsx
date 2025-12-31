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

interface EditAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateAccount: (accountId: string, name: string, country: string, isActive: boolean) => void
  account: { id: string; name: string; country?: string; isActive?: boolean } | null
}

export function EditAccountDialog({ open, onOpenChange, onUpdateAccount, account }: EditAccountDialogProps) {
  const [name, setName] = useState("")
  const [country, setCountry] = useState<string>("")
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState("")

  // Initialize form when account changes or dialog opens
  useEffect(() => {
    if (account && open) {
      setName(account.name)
      setCountry(account.country || (account.id.startsWith("UK-") ? "UK" : "USA"))
      setIsActive(account.isActive ?? true)
      setError("")
    }
  }, [account, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Digite um nome para a conta")
      return
    }

    if (!country) {
      setError("Selecione um país")
      return
    }

    if (!account) return

    onUpdateAccount(account.id, name.trim(), country, isActive)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("")
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
          <DialogTitle>Editar Conta</DialogTitle>
          <DialogDescription>
            Altere as informações da conta {account?.id}. O ID da conta não pode ser alterado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-id" className="text-right">
                ID
              </Label>
              <div className="col-span-3">
                <Input id="account-id" value={account?.id || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">O ID da conta não pode ser alterado</p>
              </div>
            </div>

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
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError("")
                  }}
                  placeholder="Nome da conta"
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
