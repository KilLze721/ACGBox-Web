export type CatalogKind = 'anime' | 'book'

export interface CatalogOption {
  id: number
  name: string
}

export interface CatalogFilters {
  broadcastTypes?: CatalogOption[]
  bookTypes?: CatalogOption[]
  adaptationTypes: CatalogOption[]
  statuses: CatalogOption[]
  years: number[]
  hasUnknownYear: boolean
  tags: CatalogOption[]
}

export interface CatalogWork {
  id: number
  name: string
  aliasNames: string[]
  coverImageUrl: string | null
  status: number
  adaptationType: CatalogOption | null
  tags: CatalogOption[]
  persons: { personName: string }[]
  companies: { companyName: string }[]
  airDate?: string | null
  broadcastType?: CatalogOption | null
  publishDate?: string | null
  bookType?: CatalogOption | null
}

export interface CatalogPage {
  pageNum: number
  pageSize: number
  pages: number
  total: number
  rows: CatalogWork[]
}

// 公开接口使用同源代理，不读取管理端登录状态或发送管理令牌。
async function getCatalog<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`/api/web/${path}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('资料读取失败，请稍后重试。')
  const result: { code: number; message?: string; data?: T } = await response.json()
  if (result.code !== 200 || result.data == null)
    throw new Error(result.message || '资料读取失败，请稍后重试。')
  return result.data
}

export function getCatalogPage(kind: CatalogKind, query: URLSearchParams, signal: AbortSignal) {
  return getCatalog<CatalogPage>(`${kind}/page?${query}`, signal)
}

export function getCatalogFilters(kind: CatalogKind, signal: AbortSignal) {
  return getCatalog<CatalogFilters>(`${kind}/filters`, signal)
}
