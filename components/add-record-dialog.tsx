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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Account {
  id: string
  name: string
}

interface AddRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddRecord: (record: {
    date: string
    account: string
    gmv: number
    sales: number
    commission: number
  }) => void
  accounts: Account[]
}

export function AddRecordDialog({ open, onOpenChange, onAddRecord, accounts }: AddRecordDialogProps) {
  const [date, setDate] = useState<Date>()
  const [selectedAccount, setSelectedAccount] = useState("")
  const [gmv, setGmv] = useState("")
  const [sales, setSales] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isBonusAccount, setIsBonusAccount] = useState(false)
  const [commission, setCommission] = useState("")

  // Adicionar useEffect para detectar mudança de conta
  useEffect(() => {
    setIsBonusAccount(selectedAccount === "C-BONUSES")
  }, [selectedAccount])

  const gmvValue = Number.parseFloat(gmv) || 0

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!date) {
      newErrors.date = "Selecione uma data"
    }

    if (!selectedAccount) {
      newErrors.account = "Selecione uma conta"
    }

    if (!gmv || Number.parseFloat(gmv) <= 0) {
      newErrors.gmv = "Digite um valor de GMV válido"
    }

    // Só validar vendas se não for conta de bônus
    if (!isBonusAccount && (!sales || Number.parseInt(sales) <= 0)) {
      newErrors.sales = "Digite uma quantidade de vendas válida"
    }

    // Validar comissão se não for conta de bônus
    if (!isBonusAccount && (!commission || Number.parseFloat(commission) < 0)) {
      newErrors.commission = "Digite um valor de comissão válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Formatar data como YYYY-MM-DD sem conversão de timezone
    const formattedDate = format(date!, "yyyy-MM-dd")

    // Para conta de bônus, usar valores padrão
    const record = {
      date: formattedDate,
      account: selectedAccount,
      gmv: Number.parseFloat(gmv),
      sales: isBonusAccount ? 1 : Number.parseInt(sales), // 1 venda padrão para bônus
      commission: isBonusAccount ? 0 : Number.parseFloat(commission), // 0 comissão para bônus
    }

    onAddRecord(record)

    // Limpar formulário
    setDate(undefined)
    setSelectedAccount("")
    setGmv("")
    setSales("")
    setCommission("")
    setErrors({})
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDate(undefined)
      setSelectedAccount("")
      setGmv("")
      setSales("")
      setCommission("")
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Registro</DialogTitle>
          <DialogDescription>
            Adicione um novo registro de faturamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Data */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} initialFocus />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
              </div>
            </div>

            {/* Conta */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                Conta
              </Label>
              <div className="col-span-3">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .sort((a, b) => {
                        // Bonus account comes first
                        if (a.id === 'C-BONUSES') return -1;
                        if (b.id === 'C-BONUSES') return 1;

                        // Then sort C-000 accounts in ascending order
                        return a.id.localeCompare(b.id);
                      })
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.account && <p className="text-sm text-red-500 mt-1">{errors.account}</p>}
              </div>
            </div>

            {/* GMV */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gmv" className="text-right">
                {isBonusAccount ? "Valor do Bônus" : "GMV"}
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="gmv"
                    type="number"
                    step="0.01"
                    min="0"
                    value={gmv}
                    onChange={(e) => setGmv(e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                {errors.gmv && <p className="text-sm text-red-500 mt-1">{errors.gmv}</p>}
              </div>
            </div>

            {/* Quantidade de Vendas - Só mostrar se não for bônus */}
            {!isBonusAccount && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sales" className="text-right">
                  Qtd Vendas
                </Label>
                <div className="col-span-3">
                  <Input
                    id="sales"
                    type="number"
                    min="1"
                    value={sales}
                    onChange={(e) => setSales(e.target.value)}
                    placeholder="0"
                  />
                  {errors.sales && <p className="text-sm text-red-500 mt-1">{errors.sales}</p>}
                </div>
              </div>
            )}

            {/* Comissão Manual - Só mostrar se não for bônus */}
            {!isBonusAccount && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commission" className="text-right">
                  Comissão
                </Label>
                <div className="col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="commission"
                      type="number"
                      step="0.01"
                      min="0"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                  {errors.commission && <p className="text-sm text-red-500 mt-1">{errors.commission}</p>}
                </div>
              </div>
            )}

            {/* Informação especial para bônus */}
            {isBonusAccount && gmvValue > 0 && (
              <div className="grid gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300">💰 Bônus Registrado:</h4>
                <div className="text-sm">
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="ml-2 font-medium text-purple-600">
                      ${gmvValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Em Reais (5.60):</span>
                    <span className="ml-2 font-medium text-purple-600">
                      {(gmvValue * 5.6).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">100% direto para o seu bolso! 🎉</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Adicionar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
