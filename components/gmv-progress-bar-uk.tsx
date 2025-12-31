"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface GMVProgressBarUKProps {
  currentGMV: number // Keeping prop name for compatibility, but receives commission
}

export function GMVProgressBarUK({ currentGMV: currentCommission }: GMVProgressBarUKProps) {
  const targetCommission = 30000 // £30k
  const progressPercentage = Math.min((currentCommission / targetCommission) * 100, 100)

  // Marcos de progresso em libras
  const milestones = [
    { value: 3000, label: "£3k", position: 10 },
    { value: 7500, label: "£7.5k", position: 25 },
    { value: 15000, label: "£15k", position: 50 },
    { value: 30000, label: "£30k", position: 100 },
  ]

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}k`
    }
    return `£${value.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span className="mr-2">🇬🇧</span>
              <h2 className="text-xl font-semibold">Meta de Comissão - TikTok Shop UK (Tempo Todo)</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentCommission)}</div>
              <div className="text-sm text-muted-foreground">
                de {formatCurrency(targetCommission)} ({progressPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative">
            {/* Background Bar */}
            <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Milestone Markers */}
            {milestones.map((milestone, index) => {
              const isReached = currentCommission >= milestone.value
              const isLastMilestone = milestone.value === targetCommission

              return (
                <div
                  key={milestone.value}
                  className="absolute top-0 transform -translate-x-1/2"
                  style={{ left: `${milestone.position}%` }}
                >
                  {/* Marker Line - Gato para £30k */}
                  {isLastMilestone ? (
                    <div className="flex items-center justify-center w-6 h-6">
                      <span className="text-lg">🍺</span>
                    </div>
                  ) : (
                    <div className={`w-0.5 h-6 ${isReached ? "bg-white" : "bg-gray-400 dark:bg-gray-500"}`} />
                  )}

                  {/* Marker Label */}
                  <div className="absolute top-7 transform -translate-x-1/2">
                    <div
                      className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${isReached
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      style={{ fontSize: "10px" }}
                    >
                      {milestone.label}
                    </div>

                    {/* Achievement Badge - Apenas para marcos que não são o último */}
                    {isReached && !isLastMilestone && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-900">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress Stats */}
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-10">
            <div>
              Restam:{" "}
              <span className="font-medium text-foreground">{formatCurrency(Math.max(0, targetCommission - currentCommission))}</span>
            </div>
            <div>
              Próxima meta:{" "}
              <span className="font-medium text-foreground">
                {(() => {
                  const nextMilestone = milestones.find((m) => currentCommission < m.value)
                  if (nextMilestone) {
                    return `${nextMilestone.label} (${formatCurrency(nextMilestone.value - currentCommission)} restantes)`
                  }
                  return "🍺 Meta alcançada!"
                })()}
              </span>
            </div>
          </div>

          {/* Achievement Message */}
          {progressPercentage >= 100 && (
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-4xl mb-2">🍺</div>
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                Cheers! Meta de £{targetCommission / 1000}k alcançada! 🎉
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Você superou a meta em {formatCurrency(currentCommission - targetCommission)} - Ótimo trabalho!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
