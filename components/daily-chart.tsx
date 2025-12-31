"use client"

import { useState } from "react"

interface ChartData {
  day: number
  gmv: number
  sales: number
}

interface DailyChartProps {
  data: ChartData[]
}

export function DailyChart({ data }: DailyChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Use only real data
  const chartData = data || []

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Nenhum dado disponível</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Adicione registros para ver o gráfico</p>
        </div>
      </div>
    )
  }

  const maxGMV = Math.max(...chartData.map((d) => d.gmv))
  const minGMV = Math.min(...chartData.map((d) => d.gmv))
  const range = maxGMV - minGMV

  // Função para calcular posição Y do ponto
  const getYPosition = (value: number) => {
    if (range === 0) return 50 // Se todos os valores são iguais, centralizar
    return ((maxGMV - value) / range) * 80 + 10 // 10% margem superior, 80% área útil
  }

  // Função para calcular posição X do ponto
  const getXPosition = (index: number) => {
    return (index / (chartData.length - 1)) * 100
  }

  // Gerar pontos da linha SVG
  const generatePath = () => {
    return chartData
      .map((item, index) => {
        const x = getXPosition(index)
        const y = getYPosition(item.gmv)
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  return (
    <div className="w-full h-[400px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0">
      <div className="w-full h-full flex flex-col p-4">
        {/* Área do gráfico */}
        <div className="flex-1 relative">
          {/* Grid de fundo - Linhas horizontais */}
          <div className="absolute inset-0 flex flex-col justify-between py-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-gray-300 dark:border-gray-600 border-dashed opacity-50" />
            ))}
          </div>

          {/* Labels do eixo Y */}
          <div className="absolute left-0 top-8 bottom-8 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 font-medium w-16">
            <span className="text-right pr-2">
              ${maxGMV >= 1000 ? `${(maxGMV / 1000).toFixed(1)}k` : maxGMV.toFixed(0)}
            </span>
            <span className="text-right pr-2">
              $
              {Math.round(maxGMV * 0.75) >= 1000
                ? `${(Math.round(maxGMV * 0.75) / 1000).toFixed(1)}k`
                : Math.round(maxGMV * 0.75)}
            </span>
            <span className="text-right pr-2">
              $
              {Math.round(maxGMV * 0.5) >= 1000
                ? `${(Math.round(maxGMV * 0.5) / 1000).toFixed(1)}k`
                : Math.round(maxGMV * 0.5)}
            </span>
            <span className="text-right pr-2">
              $
              {Math.round(maxGMV * 0.25) >= 1000
                ? `${(Math.round(maxGMV * 0.25) / 1000).toFixed(1)}k`
                : Math.round(maxGMV * 0.25)}
            </span>
            <span className="text-right pr-2">
              ${minGMV >= 1000 ? `${(minGMV / 1000).toFixed(1)}k` : minGMV.toFixed(0)}
            </span>
          </div>

          {/* Área da linha */}
          <div className="absolute left-16 right-4 top-8 bottom-16">
            {/* SVG para a linha */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Área preenchida abaixo da linha */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Área preenchida */}
              <path d={`${generatePath()} L ${getXPosition(chartData.length - 1)} 100 L 0 100 Z`} fill="url(#areaGradient)" />

              {/* Linha principal */}
              <path
                d={generatePath()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
            </svg>

            {/* Pontos com tooltip no hover */}
            {chartData.map((item, index) => {
              const xPercent = getXPosition(index)
              const yPercent = getYPosition(item.gmv)

              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                  }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Tooltip - só aparece no hover */}
                  {hoveredPoint === index && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap z-20 border">
                      <div className="font-bold">
                        ${item.gmv >= 1000 ? `${(item.gmv / 1000).toFixed(1)}k` : item.gmv.toFixed(0)}
                      </div>
                      <div className="text-gray-300 dark:text-gray-600">{item.sales} vendas</div>
                      {/* Seta do tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                    </div>
                  )}

                  {/* Ponto da linha */}
                  <div
                    className={`w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-900 rounded-full shadow-lg transition-all duration-200 cursor-pointer relative z-10 ${hoveredPoint === index ? "w-4 h-4 scale-110" : ""}`}
                  >
                    {/* Efeito de pulso para o ponto atual (último) */}
                    {index === chartData.length - 1 && (
                      <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dias no eixo X */}
          <div className="absolute left-16 right-4 bottom-8 flex justify-between">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="text-xs font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded transform -translate-x-1/2"
              >
                {item.day}
              </div>
            ))}
          </div>

          {/* Eixos principais */}
          <div className="absolute bottom-16 left-16 right-4 h-0.5 bg-gray-400 dark:bg-gray-500"></div>
          <div className="absolute bottom-16 left-16 top-8 w-0.5 bg-gray-400 dark:bg-gray-500"></div>
        </div>

        {/* Label do eixo X */}
        <div className="flex justify-center items-center mt-2"></div>
      </div>
    </div>
  )
}
