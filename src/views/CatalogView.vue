<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCatalogFilters, getCatalogPage } from '@/api/catalog'
import type { CatalogFilters as Filters, CatalogKind, CatalogPage } from '@/api/catalog'
import { catalogRequestQuery, catalogRouteQuery, readCatalogQuery } from '@/catalogQuery'
import type { CatalogQuery, CatalogSort } from '@/catalogQuery'
import CatalogFilters from '@/components/CatalogFilters.vue'
import CatalogWorkRow from '@/components/CatalogWorkRow.vue'
import '@/assets/catalog.css'

const props = defineProps<{ kind: CatalogKind }>()
const route = useRoute()
const router = useRouter()
const query = computed(() => readCatalogQuery(props.kind, route.query))
const keyword = ref(query.value.keyword)
const resultsTitle = ref<HTMLElement>()
const page = ref<CatalogPage>()
const filters = ref<Filters>()
const listLoading = ref(true)
const listError = ref(false)
const filtersLoading = ref(true)
const filtersError = ref(false)
const retryList = ref(0)
const retryFilters = ref(0)
const sortOptions: { value: CatalogSort; label: string; title: string }[] = [
  { value: 'new', label: '最新', title: '日期从新到旧' },
  { value: 'old', label: '最早', title: '日期从旧到新' },
  { value: 'name', label: '名称', title: '按作品名称排序' },
]
const typeLabel = computed(() => props.kind === 'anime' ? '放送类型' : '书籍类型')
const statusLabel = computed(() => props.kind === 'anime' ? '放送状态' : '连载状态')
const workType = computed(() => props.kind === 'anime' ? filters.value?.broadcastTypes : filters.value?.bookTypes)
const applied = computed(() => {
  const { keyword, typeId, adaptationTypeId, status, year, tagIds } = query.value
  const chips: { key: string; label: string; clear: Partial<CatalogQuery> }[] = []
  if (keyword) chips.push({ key: 'keyword', label: keyword, clear: { keyword: '' } })
  if (typeId !== undefined)
    chips.push({ key: 'type', label: workType.value?.find(({ id }) => id === typeId)?.name ?? typeLabel.value, clear: { typeId: undefined } })
  if (adaptationTypeId !== undefined)
    chips.push({ key: 'adaptation', label: filters.value?.adaptationTypes.find(({ id }) => id === adaptationTypeId)?.name ?? '改编类型', clear: { adaptationTypeId: undefined } })
  if (status !== undefined)
    chips.push({ key: 'status', label: filters.value?.statuses.find(({ id }) => id === status)?.name ?? statusLabel.value, clear: { status: undefined } })
  if (year) chips.push({ key: 'year', label: year === 'UNKNOWN' ? '年份未知' : `${year} 年`, clear: { year: '' } })
  for (const id of tagIds)
    chips.push({ key: `tag-${id}`, label: filters.value?.tags.find((tag) => tag.id === id)?.name ?? '已选标签', clear: { tagIds: tagIds.filter((tag) => tag !== id) } })
  return chips
})
const pageNumbers = computed(() => {
  const last = page.value?.pages ?? 0
  const current = page.value?.pageNum ?? 1
  const nearby = [1, current - 1, current, current + 1, last]
  const pages = [...new Set(nearby)].filter((number) => number >= 1 && number <= last)
  return pages.flatMap((number, index) =>
    (pages[index - 1] ?? number) < number - 1 ? [`gap-${number}`, number] : [number],
  )
})

watch([() => props.kind, () => query.value.keyword], () => { keyword.value = query.value.keyword })

// 目录列表与筛选项独立读取，切换路由时取消旧请求，避免旧结果覆盖新条件。
watch([() => props.kind, () => route.fullPath, retryList], async ([kind], _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  listLoading.value = true
  listError.value = false
  page.value = undefined
  const current = query.value
  try {
    const result = await getCatalogPage(kind, catalogRequestQuery(kind, current), controller.signal)
    if (controller.signal.aborted) return
    if (current.pageNum > Math.max(1, result.pages)) {
      await router.replace({
        name: kind,
        query: catalogRouteQuery(kind, { ...current, pageNum: Math.max(1, result.pages) }),
      })
    } else page.value = result
  } catch {
    if (!controller.signal.aborted) listError.value = true
  } finally {
    if (!controller.signal.aborted) listLoading.value = false
  }
}, { immediate: true })

watch([() => props.kind, retryFilters], async ([kind], _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  filtersLoading.value = true
  filtersError.value = false
  filters.value = undefined
  try {
    const result = await getCatalogFilters(kind, controller.signal)
    if (!controller.signal.aborted) filters.value = result
  } catch {
    if (!controller.signal.aborted) filtersError.value = true
  } finally {
    if (!controller.signal.aborted) filtersLoading.value = false
  }
}, { immediate: true })

function changeQuery(patch: Partial<CatalogQuery>) {
  return router.push({
    name: props.kind,
    query: catalogRouteQuery(props.kind, { ...query.value, pageNum: 1, ...patch }),
  })
}

function clearQuery() {
  keyword.value = ''
  return changeQuery(readCatalogQuery(props.kind, {}))
}

async function goToPage(pageNum: number) {
  await changeQuery({ pageNum })
  await nextTick()
  resultsTitle.value?.focus()
}

function workStatus(status: number) {
  return filters.value?.statuses.find(({ id }) => id === status)?.name ?? '状态未知'
}
</script>

<template>
  <section class="catalog-intro" aria-labelledby="catalog-title">
    <div class="intro-title">
      <span class="intro-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="kind === 'anime'">
            <rect x="3.5" y="5.5" width="17" height="12" rx="2" />
            <path d="M9 21h6m-4.5-12 4 2.5-4 2.5z" />
          </template>
          <path v-else d="M12 6.5a8 8 0 0 0-8.5-1v13a8 8 0 0 1 8.5 1 8 8 0 0 1 8.5-1v-13a8 8 0 0 0-8.5 1Zm0 0v13" />
        </svg>
      </span>
      <h1 id="catalog-title">{{ kind === 'anime' ? '动画查询' : '书籍查询' }}</h1>
    </div>
    <form class="catalog-search" role="search" aria-label="作品搜索" @submit.prevent="changeQuery({ keyword: keyword.trim() })">
      <label class="catalog-search-field">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" stroke-linecap="round" />
        </svg>
        <input
          v-model="keyword"
          type="search"
          aria-label="搜索作品名称、别名或系列"
          placeholder="搜索作品名称、别名或系列"
          autocomplete="off"
        >
      </label>
      <button class="catalog-primary" type="submit">搜索</button>
    </form>
  </section>
  <div class="catalog-directory">
    <CatalogFilters
      :kind="kind"
      :filters="filters"
      :query="query"
      :active-count="applied.length"
      :loading="filtersLoading"
      :error="filtersError"
      @change="changeQuery"
      @clear="clearQuery"
      @retry="retryFilters++"
    />
    <section class="catalog-results catalog-panel" aria-labelledby="catalog-results-title" :aria-busy="listLoading">
      <header class="catalog-result-head">
        <div class="catalog-result-heading">
          <h2 id="catalog-results-title" ref="resultsTitle" class="catalog-section-title" tabindex="-1">作品目录</h2>
          <p v-if="page" class="catalog-result-count" role="status">
            共 {{ page.total }} {{ kind === 'anime' ? '部' : '本' }}<template v-if="page.pages > 1">
              · 第 {{ page.pageNum }} / {{ page.pages }} 页
            </template>
          </p>
        </div>
        <div class="catalog-options catalog-sort" role="group" aria-label="结果排序">
          <span>排序</span>
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="catalog-option"
            type="button"
            :title="option.title"
            :aria-pressed="query.sort === option.value"
            @click="changeQuery({ sort: option.value })"
          >{{ option.label }}</button>
        </div>
      </header>
      <div v-if="applied.length" class="catalog-applied" role="group" aria-label="已选条件">
        <button
          v-for="chip in applied"
          :key="chip.key"
          class="catalog-chip"
          type="button"
          :aria-label="`移除条件 ${chip.label}`"
          @click="changeQuery(chip.clear)"
        >{{ chip.label }} <span aria-hidden="true">×</span></button>
      </div>
      <div v-if="listLoading" class="catalog-state" role="status">正在读取作品…</div>
      <div v-else-if="listError" class="catalog-state">
        <h3 role="alert">作品读取失败</h3>
        <p>请稍后重试。</p>
        <button class="catalog-quiet" type="button" @click="retryList++">重试</button>
      </div>
      <div v-else-if="!page?.rows.length" class="catalog-state">
        <h3>{{ applied.length ? '没有找到符合条件的作品' : '暂无公开作品' }}</h3>
        <template v-if="applied.length">
          <p>可以缩短关键词或调整筛选条件。</p>
          <button class="catalog-quiet" type="button" @click="clearQuery">清空条件</button>
        </template>
      </div>
      <template v-else>
        <CatalogWorkRow
          v-for="work in page.rows"
          :key="`${kind}-${work.id}`"
          :kind="kind"
          :work="work"
          :status-label="workStatus(work.status)"
        />
        <nav v-if="page.pages > 1" class="catalog-paging" aria-label="结果分页">
          <button
            type="button"
            class="catalog-quiet catalog-page-button"
            aria-label="上一页"
            :disabled="page.pageNum <= 1"
            @click="goToPage(page.pageNum - 1)"
          >‹</button>
          <template v-for="number in pageNumbers" :key="number">
            <button
              v-if="typeof number === 'number'"
              class="catalog-quiet catalog-page-button"
              type="button"
              :aria-label="`第 ${number} 页`"
              :aria-current="number === page.pageNum ? 'page' : undefined"
              @click="goToPage(number)"
            >{{ number }}</button>
            <span v-else aria-hidden="true">…</span>
          </template>
          <button
            type="button"
            class="catalog-quiet catalog-page-button"
            aria-label="下一页"
            :disabled="page.pageNum >= page.pages"
            @click="goToPage(page.pageNum + 1)"
          >›</button>
        </nav>
      </template>
    </section>
  </div>
</template>
