"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Record {
  id: string
  date: string
  account: string
  gmv: number
  sales: number
  commission29: number
  commission30: number
}

interface DeleteRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  record: Record | null
}

export function DeleteRecordDialog({ open, onOpenChange, onConfirm, record }: DeleteRecordDialogProps) {
  if (!record) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Registro</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este registro de faturamento?
            <br />
            <br />
            <div className="bg-muted p-3 rounded-lg text-sm">
              <div>
                <strong>Data:</strong> {formatDate(record.date)}
              </div>
              <div>
                <strong>Conta:</strong> {record.account}
              </div>
              <div>
                <strong>GMV:</strong> ${record.gmv.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div>
                <strong>Vendas:</strong> {record.sales}
              </div>
            </div>
            <br />
            <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Excluir Registro
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
