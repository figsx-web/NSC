import { RevenueRecord, Account } from "@/lib/supabase/types"
import { parseISO } from "date-fns"
import { DashboardRegion } from "@/hooks/use-dashboard-data"

export function calculateTotals(
    records: RevenueRecord[],
    accountFilter?: string,
    region: DashboardRegion = "usa"
) {
    let totalGMV = 0
    let totalSales = 0
    let totalCommission29 = 0
    let totalCommission30 = 0

    const recordsToCalculate =
        accountFilter && accountFilter !== "all"
            ? records.filter((record) => record.account_id === accountFilter)
            : records

    recordsToCalculate.forEach((record) => {
        // Exclude bonus accounts from GMV
        const bonusAccountId = region === "uk" ? "UK-BONUSES" : "C-BONUSES"
        const isBonus = record.account_id === bonusAccountId

        if (!isBonus) {
            totalGMV += record.gmv
        }
        totalSales += record.sales
        totalCommission29 += record.commission_29
        totalCommission30 += record.commission_30
    })

    return { totalGMV, totalSales, totalCommission29, totalCommission30 }
}

export function calculateGeralTotals(
    records: RevenueRecord[],
    accounts: Account[],
    accountFilter?: string,
    exchangeRate: number = 5.6
) {
    let filtered = records
    if (accountFilter && accountFilter !== "all") {
        filtered = filtered.filter((r) => r.account_id === accountFilter)
    }

    // Helper to identify region from account ID since country might be missing in older records
    const getRegion = (accountId: string) => {
        if (accountId.startsWith("UK-")) return "uk"
        if (accountId.startsWith("ALE-")) return "ale"
        return "usa"
    }

    const usdToBrl = exchangeRate
    const gbpToBrl = exchangeRate * 1.36 // Approx 7.50 / 5.50
    const eurToBrl = exchangeRate * 1.18 // Approx 6.50 / 5.50

    const totals = filtered.reduce((acc, record) => {
        const region = getRegion(record.account_id)
        let rate = usdToBrl
        let commission = record.commission_29 // Default to 29 (USA)

        if (region === "uk") {
            rate = gbpToBrl
            commission = record.commission_30
        } else if (region === "ale") {
            rate = eurToBrl
            commission = record.commission_30 // Ale uses commission_30 column
        }

        return {
            totalGMV: acc.totalGMV + (record.gmv * rate),
            totalSales: acc.totalSales + record.sales,
            totalCommission: acc.totalCommission + (commission * rate)
        }
    }, { totalGMV: 0, totalSales: 0, totalCommission: 0 })

    return {
        totalGMV: totals.totalGMV,
        totalSales: totals.totalSales,
        totalCommission29: totals.totalCommission, // Stored here for compatibility
        totalCommission30: 0,
    }
}

export function prepareChartData(
    records: RevenueRecord[],
    convertToBrl: boolean = false,
    exchangeRate: number = 5.6
) {
    const usdToBrl = exchangeRate
    const gbpToBrl = exchangeRate * 1.36
    const eurToBrl = exchangeRate * 1.18

    const getRateAndCommission = (record: RevenueRecord) => {
        if (record.account_id.startsWith("UK-")) return { rate: gbpToBrl, comm: record.commission_30 || 0 }
        if (record.account_id.startsWith("ALE-")) return { rate: eurToBrl, comm: record.commission_30 || 0 }
        return { rate: usdToBrl, comm: record.commission_29 || 0 }
    }

    const dailyData = records.reduce(
        (acc, record) => {
            const dateStr = typeof record.date === 'string' ? record.date : new Date(record.date).toISOString()
            const day = parseISO(dateStr).getDate()

            if (!acc[day]) {
                acc[day] = { day: day, gmv: 0, sales: 0, commission: 0 }
            }

            if (convertToBrl) {
                const { rate, comm } = getRateAndCommission(record)
                acc[day].gmv += record.gmv * rate
                acc[day].commission += comm * rate
            } else {
                // Original behavior (mixed sum, acceptable for single-region views)
                acc[day].gmv += record.gmv
                acc[day].commission += (record.commission_29 || 0) + (record.commission_30 || 0)
            }

            acc[day].sales += record.sales
            return acc
        },
        {} as Record<number, { day: number; gmv: number; sales: number; commission: number }>,
    )

    return Object.values(dailyData).sort((a, b) => a.day - b.day)
}

export function calculateBonusTotals(records: RevenueRecord[], region: DashboardRegion) {
    const bonusAccountId = region === "uk" ? "UK-BONUSES" : "C-BONUSES"
    const bonusRecords = records.filter((record) => record.account_id === bonusAccountId)

    let totalBonusUSD = 0

    bonusRecords.forEach((record) => {
        totalBonusUSD += record.gmv
    })

    return { totalBonusUSD }
}
