"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { getLastUpdateTime } from "@/lib/database"

export function LastUpdateInfo() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLastUpdate() {
      try {
        const time = await getLastUpdateTime()
        setLastUpdate(time)
      } catch (error) {
        console.error("Erro ao buscar última atualização:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLastUpdate()

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchLastUpdate, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        <Clock className="h-3 w-3 animate-spin" />
        <span>Carregando...</span>
      </div>
    )
  }

  if (!lastUpdate) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
        <Clock className="h-3 w-3" />
        <span>Sem atualizações</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3" />
        <span className="font-medium">Última atualização:</span>
      </div>
      <span className="text-xs">{formatDate(lastUpdate)}</span>
    </div>
  )
}
