"use client"

import { TrendingUp } from "lucide-react"

interface ChartFallbackProps {
  data: Array<{ day: number; gmv: number; sales: number }>
}

export function ChartFallback({ data }: ChartFallbackProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/5">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum dado disponível</p>
          <p className="text-sm text-muted-foreground">Adicione registros para ver o gráfico</p>
        </div>
      </div>
    )
  }

  const maxGMV = Math.max(...data.map((d) => d.gmv))

  return (
    <div className="w-full h-[400px] p-4 bg-background">
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Visualização Simplificada dos Dados</span>
        </div>

        <div className="flex-1 flex items-end justify-between gap-2 border-b border-l border-muted-foreground/20 p-4">
          {data.map((item, index) => {
            const height = (item.gmv / maxGMV) * 100
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  ${item.gmv.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <div
                  className="w-8 bg-primary rounded-t transition-all duration-300 hover:opacity-80"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`Dia ${item.day}: $${item.gmv.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                />
                <div className="text-xs font-medium">{item.day}</div>
              </div>
            )
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground mt-2">Dia do Mês</div>
      </div>
    </div>
  )
}

export default ChartFallback
