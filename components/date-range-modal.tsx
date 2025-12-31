"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DateRangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (startDate: Date, endDate: Date) => void
  onClear: () => void
}

export function DateRangeModal({ open, onOpenChange, onApply, onClear }: DateRangeModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate)
      onOpenChange(false)
    }
  }

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onClear()
    onOpenChange(false)
  }

  const isApplyDisabled = !startDate || !endDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5" />
            Selecionar Período Personalizado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:gap-6 space-y-4 lg:space-y-0">
            {/* Data de Início */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium">Data de Início</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ptBR}
                  className="w-full [&_.rdp-table]:w-full [&_.rdp-cell]:text-sm"
                  disabled={(date) => date > new Date() || (endDate && date > endDate)}
                />
              </div>
              {startDate && (
                <p className="text-xs text-muted-foreground">
                  Selecionado: {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </div>

            {/* Data de Fim */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium">Data de Fim</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  locale={ptBR}
                  className="w-full [&_.rdp-table]:w-full [&_.rdp-cell]:text-sm"
                  disabled={(date) => date > new Date() || (startDate && date < startDate)}
                />
              </div>
              {endDate && (
                <p className="text-xs text-muted-foreground">
                  Selecionado: {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          {/* Resumo do período selecionado */}
          {startDate && endDate && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Período: {format(startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto bg-transparent">
            Limpar Filtro
          </Button>
          <Button onClick={handleApply} disabled={isApplyDisabled} className="w-full sm:w-auto">
            Aplicar Filtro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
