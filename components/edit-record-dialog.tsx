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
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Account {
  id: string
  name: string
}

interface RevenueRecordData {
  id: string
  date: string
  account: string
  gmv: number
  sales: number
  commission29: number
  commission30: number
}

interface EditRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateRecord: (recordId: string, record: {
    date: string
    account: string
    gmv: number
    sales: number
    commission: number
  }) => void
  accounts: Account[]
  record: RevenueRecordData | null
}

export function EditRecordDialog({ open, onOpenChange, onUpdateRecord, accounts, record }: EditRecordDialogProps) {
  const [date, setDate] = useState<Date>()
  const [selectedAccount, setSelectedAccount] = useState("")
  const [gmv, setGmv] = useState("")
  const [sales, setSales] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isBonusAccount, setIsBonusAccount] = useState(false);

  const [commission, setCommission] = useState("")

  // Initialize fields when record changes or dialog opens
  useEffect(() => {
    if (record && open) {
      // Parse a data diretamente sem conversão de timezone
      // Isso garante que a data mostrada seja exatamente a data salva
      const parsedDate = parseISO(record.date)

      setDate(parsedDate)
      setSelectedAccount(record.account)
      setGmv(record.gmv.toString())
      setSales(record.sales.toString())
      // Use logic to determine initial commission value - use whichever is present or sum if needed
      // Logic: If commission29 > 0 use that, else if commission30 > 0 use that.
      // Or just sum them since usually only one should be active per record conceptually with new logic.
      const initialCommission = (record.commission29 || 0) + (record.commission30 || 0)
      setCommission(initialCommission > 0 ? initialCommission.toString() : "")

      setErrors({})
      setIsBonusAccount(accounts.find(acc => acc.id === record.account)?.name.toLowerCase().includes('bonus') || false);
    }
  }, [record, open, accounts])

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

    if (!validateForm() || !record) {
      return
    }

    // Formatar data como YYYY-MM-DD sem conversão de timezone
    const formattedDate = format(date!, "yyyy-MM-dd")

    // Create updated record
    const updatedRecord = {
      date: formattedDate,
      account: selectedAccount,
      gmv: Number.parseFloat(gmv),
      sales: isBonusAccount ? 1 : Number.parseInt(sales),
      commission: Number.parseFloat(commission),
    }

    onUpdateRecord(record.id, updatedRecord)
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
      setIsBonusAccount(false);
    }
    onOpenChange(newOpen)
  }

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    setIsBonusAccount(accounts.find(acc => acc.id === accountId)?.name.toLowerCase().includes('bonus') || false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Registro</DialogTitle>
          <DialogDescription>
            Altere os dados do registro de faturamento.
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
                <Select value={selectedAccount} onValueChange={handleAccountChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
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
                GMV
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

            {/* Quantidade de Vendas */}
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

            {/* Comissões Manual */}
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
