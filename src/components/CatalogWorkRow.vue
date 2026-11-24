<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CatalogKind, CatalogWork } from '@/api/catalog'

const props = defineProps<{ kind: CatalogKind; work: CatalogWork; statusLabel: string }>()
const coverFailed = ref(false)
const date = computed(() => props.kind === 'anime' ? props.work.airDate : props.work.publishDate)
const type = computed(() => props.kind === 'anime' ? props.work.broadcastType : props.work.bookType)
const credits = computed(() => [
  ...new Set([
    ...props.work.persons.map(({ personName }) => personName),
    ...props.work.companies.map(({ companyName }) => companyName),
  ]),
].filter(Boolean).join(' · '))

// 同一作品换用新封面时重新加载，单张失效图片只影响当前行。
watch(() => props.work.coverImageUrl, () => { coverFailed.value = false })
</script>

<template>
  <article class="catalog-work">
    <img
      v-if="work.coverImageUrl && !coverFailed"
      class="catalog-cover"
      :src="work.coverImageUrl"
      :alt="`${work.name}封面`"
      loading="lazy"
      @error="coverFailed = true"
    >
    <span v-else class="catalog-cover catalog-cover-empty">
      {{ coverFailed ? '封面加载失败' : '暂无封面' }}
    </span>
    <div class="catalog-work-info">
      <h3>{{ work.name }}</h3>
      <p v-if="work.aliasNames.length" class="catalog-work-alias">{{ work.aliasNames.join(' · ') }}</p>
      <p class="catalog-work-meta">
        <time v-if="date" :datetime="date">{{ date }}</time>
        <span v-else>日期未知</span>
        <span v-if="type">{{ type.name }}</span>
        <span v-if="work.adaptationType">{{ work.adaptationType.name }}</span>
        <span class="catalog-work-status">{{ statusLabel }}</span>
      </p>
      <p v-if="credits" class="catalog-work-credits">{{ credits }}</p>
      <ul v-if="work.tags.length" class="catalog-work-tags" aria-label="作品标签">
        <li v-for="tag in work.tags" :key="tag.id">{{ tag.name }}</li>
      </ul>
    </div>
  </article>
</template>
