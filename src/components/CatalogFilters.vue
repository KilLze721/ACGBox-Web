<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CatalogFilters, CatalogKind } from '@/api/catalog'
import type { CatalogQuery } from '@/catalogQuery'

const props = defineProps<{
  kind: CatalogKind
  filters: CatalogFilters | undefined
  query: CatalogQuery
  activeCount: number
  loading: boolean
  error: boolean
}>()
const emit = defineEmits<{
  change: [patch: Partial<CatalogQuery>]
  clear: []
  retry: []
}>()

const expanded = ref(false)
const decade = ref(2020)
const availableYears = computed(() => new Set((props.filters?.years ?? []).map(Number)))
const yearSection = computed(() => props.kind === 'anime' ? '放送年份' : '首次发表年份')
const groups = computed(() => [
  {
    key: 'typeId', label: props.kind === 'anime' ? '放送类型' : '书籍类型',
    options: (props.kind === 'anime' ? props.filters?.broadcastTypes : props.filters?.bookTypes) ?? [],
  },
  { key: 'adaptationTypeId', label: '改编类型', options: props.filters?.adaptationTypes ?? [] },
  {
    key: 'status', label: props.kind === 'anime' ? '放送状态' : '连载状态',
    options: props.filters?.statuses ?? [],
  },
] as const)
const yearCells = computed(() =>
  Array.from({ length: 10 }, (_, index) => decade.value + 9 - index).filter((year) => year > 0),
)
const yearToDecade = (year: number) => Math.floor(year / 10) * 10

// 从历史记录恢复特定年份时展示对应年代，切换目录时收起手机筛选面板。
watch([() => props.kind, () => props.query.year, availableYears], () => {
  const year = Number(props.query.year) || Math.max(0, ...availableYears.value) || new Date().getFullYear()
  decade.value = yearToDecade(year)
}, { immediate: true })
watch(() => props.kind, () => { expanded.value = false })

function toggleTag(id: number) {
  const tags = props.query.tagIds
  emit('change', { tagIds: tags.includes(id) ? tags.filter((tag) => tag !== id) : [...tags, id] })
}

function yearValue(year: number) {
  return String(year).padStart(4, '0')
}
</script>

<template>
  <aside class="catalog-sidebar catalog-panel" aria-label="作品筛选">
    <button
      class="catalog-mobile-filters"
      type="button"
      aria-controls="catalog-filter-body"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span>筛选作品<span v-if="activeCount"> · 已选 {{ activeCount }} 项</span></span>
      <span aria-hidden="true">{{ expanded ? '⌃' : '⌄' }}</span>
    </button>
    <div id="catalog-filter-body" class="catalog-filter-body">
      <header class="catalog-filter-head">
        <h2 class="catalog-section-title">筛选作品</h2>
        <button class="catalog-text-button" type="button" @click="emit('clear')">清空条件</button>
      </header>
      <p v-if="loading" class="catalog-hint" role="status">正在读取筛选项…</p>
      <div v-else-if="error" class="catalog-filter-error">
        <p role="alert">筛选项读取失败。</p>
        <button class="catalog-quiet" type="button" @click="emit('retry')">重试</button>
      </div>
      <template v-else-if="filters">
        <section v-for="group in groups" :key="group.key" class="catalog-facet">
          <h3 :id="`catalog-filter-${group.key}`">{{ group.label }}</h3>
          <div class="catalog-options" role="group" :aria-labelledby="`catalog-filter-${group.key}`">
            <button
              type="button"
              class="catalog-option"
              :aria-pressed="query[group.key] === undefined"
              :aria-label="`全部${group.label}`"
              @click="emit('change', { [group.key]: undefined })"
            >全部</button>
            <button
              v-for="option in group.options"
              :key="option.id"
              type="button"
              class="catalog-option"
              :aria-pressed="query[group.key] === option.id"
              @click="emit('change', { [group.key]: option.id })"
            >{{ option.name }}</button>
          </div>
        </section>
        <section class="catalog-facet">
          <h3 id="catalog-filter-year">{{ yearSection }}</h3>
          <div class="catalog-calendar" role="group" aria-labelledby="catalog-filter-year">
            <div class="catalog-calendar-nav">
              <button
                class="catalog-quiet"
                type="button"
                aria-label="上一个年代"
                :disabled="decade <= 0"
                @click="decade -= 10"
              >‹</button>
              <span role="status">{{ decade }}–{{ decade + 9 }}</span>
              <button
                class="catalog-quiet"
                type="button"
                aria-label="下一个年代"
                :disabled="decade >= 9990"
                @click="decade += 10"
              >›</button>
            </div>
            <div class="catalog-years">
              <button
                class="catalog-option"
                type="button"
                aria-label="全部年份"
                :aria-pressed="!query.year"
                @click="emit('change', { year: '' })"
              >全部</button>
              <button
                v-for="year in yearCells"
                :key="year"
                class="catalog-option"
                type="button"
                :disabled="!availableYears.has(year) && query.year !== yearValue(year)"
                :aria-pressed="query.year === yearValue(year)"
                @click="emit('change', { year: yearValue(year) })"
              >{{ yearValue(year) }}</button>
              <button
                class="catalog-option"
                type="button"
                :disabled="!filters.hasUnknownYear && query.year !== 'UNKNOWN'"
                :aria-pressed="query.year === 'UNKNOWN'"
                @click="emit('change', { year: 'UNKNOWN' })"
              >未知</button>
            </div>
          </div>
        </section>
        <section class="catalog-facet">
          <h3 id="catalog-filter-tags">标签</h3>
          <p v-if="filters.tags.length" class="catalog-hint" id="catalog-tags-hint">
            多选时须同时包含所选标签
          </p>
          <p v-else class="catalog-hint">暂无可用标签</p>
          <div
            v-if="filters.tags.length"
            class="catalog-options"
            role="group"
            aria-labelledby="catalog-filter-tags"
            aria-describedby="catalog-tags-hint"
          >
            <button
              v-for="tag in filters.tags"
              :key="tag.id"
              class="catalog-option"
              type="button"
              :aria-pressed="query.tagIds.includes(tag.id)"
              @click="toggleTag(tag.id)"
            >{{ tag.name }}</button>
          </div>
        </section>
      </template>
    </div>
  </aside>
</template>
