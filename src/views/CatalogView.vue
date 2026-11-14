<script setup lang="ts">
/** 两个目录路由共用基础版式，当前仅显示目录入口状态。 */
defineProps<{ kind: 'anime' | 'book' }>()
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
    <p>目录数据尚未接入。</p>
  </section>
</template>
