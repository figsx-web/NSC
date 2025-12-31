import { createClient } from "@/lib/supabase/client"
import type { Account, RevenueRecord, DashboardSettings, InspirationalQuote } from "@/lib/supabase/types"

export type Region = "usa" | "uk" | "ale"

// ===== UNIFIED ACCOUNTS =====
export async function getAccounts(region: Region = "usa"): Promise<Account[]> {
  const supabase = createClient()
  const table = getTableName(region, "accounts")

  try {
    const { data, error } = await supabase.from(table).select("*").order("account_id")

    if (error) {
      // Fallback specifically for ALE if table doesn't exist yet
      if (region === "ale" && (
        (error.message.includes("relation") && error.message.includes("does not exist")) ||
        error.message.includes("Could not find the table")
      )) {
        return []
      }
      console.error(`Erro ao buscar contas (${region}):`, error)
      throw error
    }

    return data || []
  } catch (error: any) {
    console.error(`Erro ao buscar contas (${region}):`, error)
    if (region === "ale") return []
    throw error
  }
}

export async function createAccount(accountId: string, name?: string, region: Region = "usa"): Promise<Account> {
  const supabase = createClient()
  const table = getTableName(region, "accounts")

  const { data, error } = await supabase
    .from(table)
    .insert({
      account_id: accountId,
      name: name || `Conta ${accountId}`,
    })
    .select()
    .single()

  if (error) {
    console.error(`Erro ao criar conta (${region}):`, error)
    throw error
  }

  return data
}

export async function updateAccount(
  accountId: string,
  name: string,
  region: Region = "usa"
): Promise<Account> {
  const supabase = createClient()
  const table = getTableName(region, "accounts")

  const { data, error } = await supabase
    .from(table)
    .update({ name })
    .eq("account_id", accountId)
    .select()
    .single()

  if (error) {
    console.error(`Erro ao atualizar conta (${region}):`, error)
    throw error
  }

  return data
}

export async function deleteAccount(accountId: string, region: Region = "usa"): Promise<void> {
  const supabase = createClient()
  const tableAccounts = getTableName(region, "accounts")
  const tableRecords = getTableName(region, "records")

  // Primeiro verificar se há registros associados
  const { data: records } = await supabase
    .from(tableRecords)
    .select("id")
    .eq("account_id", accountId)
    .limit(1)

  if (records && records.length > 0) {
    throw new Error(`Não é possível excluir conta ${region.toUpperCase()} com registros associados. Exclua os registros primeiro.`)
  }

  const { error } = await supabase.from(tableAccounts).delete().eq("account_id", accountId)

  if (error) {
    console.error(`Erro ao deletar conta (${region}):`, error)
    throw error
  }
}

// ===== UNIFIED REVENUE RECORDS =====
export async function getRevenueRecords(region: Region = "usa"): Promise<RevenueRecord[]> {
  const supabase = createClient()
  const table = getTableName(region, "records")

  const { data, error } = await supabase.from(table).select("*").order("date", { ascending: false })

  if (error) {
    if (region === "ale" && (
      (error.message.includes("relation") && error.message.includes("does not exist")) ||
      error.message.includes("Could not find the table")
    )) {
      return []
    }
    console.error(`Erro ao buscar registros (${region}):`, error)
    throw error
  }

  return data || []
}

export async function createRevenueRecord(
  record: {
    date: string
    account_id: string
    gmv: number
    sales: number
    commission_29: number
    commission_30: number
  },
  region: Region = "usa"
): Promise<RevenueRecord> {
  const supabase = createClient()
  const table = getTableName(region, "records")

  const { data, error } = await supabase.from(table).insert(record).select().single()

  if (error) {
    console.error(`Erro ao criar registro (${region}):`, error)
    throw error
  }

  return data
}

export async function updateRevenueRecord(
  id: string,
  updates: {
    date?: string
    account_id?: string
    gmv?: number
    sales?: number
    commission_29?: number
    commission_30?: number
  },
  region: Region = "usa"
): Promise<RevenueRecord> {
  const supabase = createClient()
  const table = getTableName(region, "records")

  const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single()

  if (error) {
    console.error(`Erro ao atualizar registro (${region}):`, error)
    throw error
  }

  return data
}

export async function deleteRevenueRecord(id: string, region: Region = "usa"): Promise<void> {
  const supabase = createClient()
  const table = getTableName(region, "records")

  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) {
    console.error(`Erro ao deletar registro (${region}):`, error)
    throw error
  }
}

// ===== HELPER: Table Name Selector =====
function getTableName(region: Region, type: "accounts" | "records"): string {
  if (region === "usa") {
    return type === "accounts" ? "accounts" : "revenue_records"
  }
  if (region === "uk") {
    return type === "accounts" ? "accounts_uk" : "revenue_records_uk"
  }
  if (region === "ale") {
    return type === "accounts" ? "accounts_ale" : "revenue_records_ale" // Assuming this will exist
  }
  return type === "accounts" ? "accounts" : "revenue_records"
}

// ===== LEGACY EXPORTS (DEPRECATED - For backward compat while refactoring) =====
// Uses the new unified functions under the hood where possible
export const getAccountsUK = () => getAccounts("uk")
export const createAccountUK = (id: string, name?: string) => createAccount(id, name, "uk")
export const updateAccountUK = (id: string, name: string) => updateAccount(id, name, "uk")
export const deleteAccountUK = (id: string) => deleteAccount(id, "uk")

export const getAccountsALE = () => getAccounts("ale")
export const createAccountALE = (id: string, name?: string) => createAccount(id, name, "ale")
export const updateAccountALE = (id: string, name: string) => updateAccount(id, name, "ale")
export const deleteAccountALE = (id: string) => deleteAccount(id, "ale")

export const getRevenueRecordsUK = () => getRevenueRecords("uk")
export const createRevenueRecordUK = (data: any) => createRevenueRecord(data, "uk")
export const updateRevenueRecordUK = (id: string, data: any) => updateRevenueRecord(id, data, "uk")
export const deleteRevenueRecordUK = (id: string) => deleteRevenueRecord(id, "uk")

// ALE Records not explicitly in original file, but good to add fallback if needed
// For now, only accounts_ale exists according to previous file

export async function getLastUpdateTime(region: Region = "usa"): Promise<string | null> {
  const supabase = createClient()
  const table = getTableName(region, "records")

  const { data, error } = await supabase
    .from(table)
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data.updated_at
}

export const getLastUpdateTimeUK = () => getLastUpdateTime("uk")

// ===== DASHBOARD SETTINGS =====
export async function getDashboardSettings(): Promise<DashboardSettings | null> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("dashboard_settings").select("*").limit(1)

    if (error) {
      console.error("Erro ao buscar configurações:", error)
      return await createDefaultSettings()
    }

    if (!data || data.length === 0) {
      return await createDefaultSettings()
    }

    if (data.length > 1) {
      // Cleanup duplicates
      const idsToDelete = data.slice(1).map((config) => config.id)
      if (idsToDelete.length > 0) {
        await supabase.from("dashboard_settings").delete().in("id", idsToDelete)
      }
      return data[0]
    }

    return data[0]
  } catch (error) {
    console.error("Erro inesperado ao buscar configurações:", error)
    return await createDefaultSettings()
  }
}

async function createDefaultSettings(): Promise<DashboardSettings> {
  const supabase = createClient()
  try {
    await supabase.from("dashboard_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    const { data, error } = await supabase
      .from("dashboard_settings")
      .insert({
        exchange_rate: 5.6,
        updated_by: "System",
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao criar configurações padrão:", error)
    return {
      id: "default",
      exchange_rate: 5.6,
      last_updated: new Date().toISOString(),
      updated_by: "System",
    }
  }
}

export async function updateExchangeRate(rate: number): Promise<DashboardSettings> {
  const supabase = createClient()
  try {
    const currentSettings = await getDashboardSettings()

    if (!currentSettings || currentSettings.id === "default") {
      const { data, error } = await supabase
        .from("dashboard_settings")
        .insert({
          exchange_rate: rate,
          updated_by: "Admin",
        })
        .select()
        .single()

      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from("dashboard_settings")
      .update({
        exchange_rate: rate,
        updated_by: "Admin",
      })
      .eq("id", currentSettings.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Erro ao atualizar cotação:", error)
    throw error
  }
}

// ===== INSPIRATIONAL QUOTES =====
export async function getRandomQuote(): Promise<InspirationalQuote | null> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.from("inspirational_quotes").select("*")

    if (error || !data || data.length === 0) {
      return {
        id: "default",
        quote: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.",
        author: "Nelson Mandela",
        profession: "Líder e Educador",
        created_at: new Date().toISOString(),
      }
    }

    const randomIndex = Math.floor(Math.random() * data.length)
    return data[randomIndex]
  } catch (error) {
    console.error("Erro inesperado ao buscar frase:", error)
    return {
      id: "default",
      quote: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.",
      author: "Nelson Mandela",
      profession: "Líder e Educador",
      created_at: new Date().toISOString(),
    }
  }
}

export async function getAllQuotes(): Promise<InspirationalQuote[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("inspirational_quotes").select("*").order("author")

  if (error) {
    console.error("Erro ao buscar todas as frases:", error)
    throw error
  }

  return data || []
}
