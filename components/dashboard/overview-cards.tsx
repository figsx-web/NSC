import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp, User } from "lucide-react"

interface OverviewCardsProps {
    totalGMV: number
    totalSales: number
    totalCommission29: number
    totalCommission30: number
    region: string
}

export function OverviewCards({
    totalGMV,
    totalSales,
    totalCommission29,
    totalCommission30,
    region,
}: OverviewCardsProps) {
    const getCurrencySymbol = () => {
        if (region === "uk") return "£"
        if (region === "ale") return "€"
        if (region === "usa") return "$"
        return "R$"
    }

    const locale = region === "uk" ? "en-GB" : region === "ale" ? "de-DE" : region === "geral" ? "pt-BR" : "en-US"
    const symbol = getCurrencySymbol()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GMV Total {region === "geral" && "(BRL)"}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {symbol}{" "}
                        {totalGMV.toLocaleString(locale, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total de vendas</p>
                </CardContent>
            </Card>

            {(region === "usa" || region === "geral") && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            Comissão {region === "geral" ? "Total (BRL)" : "29%"}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {symbol}{" "}
                            {totalCommission29.toLocaleString(locale, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {(region === "uk" || region === "ale") && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Comissão 30%</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {symbol}{" "}
                            {totalCommission30.toLocaleString(locale, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
