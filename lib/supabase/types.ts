// TypeScript types for database tables
export interface Account {
  id: string
  account_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface RevenueRecord {
  id: string
  date: string
  account_id: string
  gmv: number
  sales: number
  commission_29: number
  commission_30: number
  created_at: string
  updated_at: string
}

export interface DashboardSettings {
  id: string
  exchange_rate: number
  last_updated: string
  updated_by: string
}

export interface InspirationalQuote {
  id: string
  quote: string
  author: string
  profession: string
  created_at: string
}
