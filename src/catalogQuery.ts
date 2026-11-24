import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { CatalogKind } from '@/api/catalog'

export type CatalogSort = 'new' | 'old' | 'name'

export interface CatalogQuery {
  keyword: string
  typeId?: number
  adaptationTypeId?: number
  status?: number
  year: string
  tagIds: number[]
  sort: CatalogSort
  pageNum: number
}

// 公开目录统一每页 20 条，旧链接中的每页条数不参与查询。
const defaultPageSize = 20
const sortFields = {
  new: { sortBy: 'DATE', sortDirection: 'DESC' },
  old: { sortBy: 'DATE', sortDirection: 'ASC' },
  name: { sortBy: 'NAME', sortDirection: 'ASC' },
} as const

function typeKey(kind: CatalogKind) {
  return kind === 'anime' ? 'broadcastTypeId' : 'bookTypeId'
}

function first(value: LocationQuery[string] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

function integer(value: string, min = 1) {
  const number = Number(value)
  return /^\d+$/.test(value) && Number.isSafeInteger(number) && number >= min &&
    number <= 2_147_483_647 ? number : undefined
}

// URL 是已应用条件的来源，保留可分享的筛选组合并去重重复标签。
export function readCatalogQuery(kind: CatalogKind, query: LocationQuery): CatalogQuery {
  const year = first(query.year)
  return {
    keyword: first(query.keyword).trim(),
    typeId: integer(first(query[typeKey(kind)])),
    adaptationTypeId: integer(first(query.adaptationTypeId)),
    status: integer(first(query.status), 0),
    year: year === 'UNKNOWN' || (/^\d{4}$/.test(year) && Number(year) > 0) ? year : '',
    tagIds: [...new Set([query.tagIds].flat().flatMap((value) => {
      const id = integer(value ?? '')
      return id === undefined ? [] : [id]
    }))],
    sort: query.sortBy === 'NAME' ? 'name' : query.sortDirection === 'ASC' ? 'old' : 'new',
    pageNum: integer(first(query.pageNum)) ?? 1,
  }
}

export function catalogRouteQuery(kind: CatalogKind, query: CatalogQuery): LocationQueryRaw {
  return {
    keyword: query.keyword || undefined,
    [typeKey(kind)]: query.typeId,
    adaptationTypeId: query.adaptationTypeId,
    status: query.status,
    year: query.year || undefined,
    tagIds: query.tagIds.length ? query.tagIds : undefined,
    ...(query.sort === 'new' ? {} : sortFields[query.sort]),
    pageNum: query.pageNum === 1 ? undefined : query.pageNum,
  }
}

export function catalogRequestQuery(kind: CatalogKind, query: CatalogQuery) {
  const result = new URLSearchParams({
    ...sortFields[query.sort],
    pageNum: String(query.pageNum),
    pageSize: String(defaultPageSize),
  })
  for (const [key, raw] of Object.entries(catalogRouteQuery(kind, query))) {
    if (raw === undefined || raw === null) continue
    if (Array.isArray(raw)) {
      for (const value of raw) if (value != null) result.append(key, String(value))
    } else result.set(key, String(raw))
  }
  return result
}
