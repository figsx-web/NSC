import { useState, useEffect, useMemo, useCallback } from "react"
import {
    getAccounts,
    getRevenueRecords,
    getDashboardSettings,
    type Region,
} from "@/lib/database"
import type { Account, RevenueRecord } from "@/lib/supabase/types"
import { isYesterday, isSameMonth, isSameYear, subMonths, subDays, isAfter, parseISO } from "date-fns"

export type DashboardRegion = Region | "geral"

export function useDashboardData(
    selectedRegion: DashboardRegion,
    selectedAccount: string,
    selectedStatus: string,
    dateFilter: string,
    dateRange: { from?: Date; to?: Date }
) {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [records, setRecords] = useState<RevenueRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [exchangeRate, setExchangeRate] = useState(5.6)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            // Clear previous data to avoid stale state if fetch fails
            setAccounts([])
            setRecords([])

            let loadedAccounts: Account[] = []
            let loadedRecords: RevenueRecord[] = []

            if (selectedRegion === "geral") {
                const [usaAccounts, ukAccounts, aleAccounts, usaRecords, ukRecords, aleRecords] = await Promise.all([
                    getAccounts("usa"),
                    getAccounts("uk"),
                    getAccounts("ale"),
                    getRevenueRecords("usa"),
                    getRevenueRecords("uk"),
                    getRevenueRecords("ale"),
                ])
                // Tag accounts with their source region to avoid ambiguity
                loadedAccounts = [
                    ...usaAccounts.map(a => ({ ...a, country: "USA" })),
                    ...ukAccounts.map(a => ({ ...a, country: "UK" })),
                    ...aleAccounts.map(a => ({ ...a, country: "ALE" }))
                ]
                loadedRecords = [...usaRecords, ...ukRecords, ...aleRecords]
            } else {
                const targetRegion = selectedRegion // Use the selected region directly (usa, uk, or ale)
                const accountsData = await getAccounts(targetRegion as Region)

                let regionTag = "USA"
                if (targetRegion === "uk") regionTag = "UK"
                if (targetRegion === "ale") regionTag = "ALE"

                loadedAccounts = accountsData.map(a => ({ ...a, country: regionTag }))
                loadedRecords = await getRevenueRecords(targetRegion as Region)
            }

            loadedAccounts = loadedAccounts.filter((acc) => acc.account_id !== "C-040")

            setAccounts(loadedAccounts)
            setRecords(loadedRecords)

            const settings = await getDashboardSettings()
            if (settings) {
                setExchangeRate(settings.exchange_rate)
            }
        } catch (error: any) {
            console.error("Erro ao carregar dados:", error)
            setError(error.message || "Erro desconhecido ao carregar dados")
        } finally {
            setLoading(false)
        }
    }, [selectedRegion])

    useEffect(() => {
        loadData()
    }, [loadData])

    const filteredRecords = useMemo(() => {
        let filtered = records

        if (selectedAccount && selectedAccount !== "all") {
            filtered = filtered.filter((record) => record.account_id === selectedAccount)
        }

        if (selectedStatus !== "all") {
            filtered = filtered.filter((record) => {
                const account = accounts.find((acc) => acc.account_id === record.account_id) as any
                if (selectedStatus === "active") {
                    return account?.is_active !== false
                } else if (selectedStatus === "inactive") {
                    return account?.is_active === false
                }
                return true
            })
        }

        filtered = filtered.filter((record) => {
            const recordDate = parseISO(record.date)
            const now = new Date()

            switch (dateFilter) {
                case "yesterday":
                    return isYesterday(recordDate)
                case "thisMonth":
                    return isSameMonth(recordDate, now) && isSameYear(recordDate, now)
                case "lastMonth":
                    const lastMonth = subMonths(now, 1)
                    return isSameMonth(recordDate, lastMonth) && isSameYear(recordDate, lastMonth)
                case "7days":
                    return isAfter(recordDate, subDays(now, 7))
                case "14days":
                    return isAfter(recordDate, subDays(now, 14))
                case "30days":
                    return isAfter(recordDate, subDays(now, 30))
                case "custom":
                    if (dateRange.from && dateRange.to) {
                        return recordDate >= dateRange.from && recordDate <= dateRange.to
                    }
                    return true
                default:
                    return true
            }
        })

        return filtered
    }, [records, selectedAccount, selectedStatus, dateRange, dateFilter, accounts])

    return {
        accounts,
        records,
        filteredRecords,
        loading,
        exchangeRate,
        error,
        refreshData: loadData,
    }
}
