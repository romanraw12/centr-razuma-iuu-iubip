export interface SupabaseClientConfig {
  url: string
  publishableKey: string
  schema: string
}

export interface SystemConfig {
  apiUrl: string
  projectId: string
  apiToken: string
  /** Название сайта: подставляется в <title> и og-мета (см. usePageMeta). */
  siteName?: string
  supabase?: SupabaseClientConfig
}

export interface AuthUser {
  id: string
  email: string | null
}

declare global {
  interface Window {
    __APP_CONFIG__?: SystemConfig
  }
}