<script setup lang="ts">
/** 公开站壳层负责品牌导航和主题，目录内容由路由渲染。 */
import { RouterLink, RouterView } from 'vue-router'
import { useCatalogTheme } from './stores/catalogTheme'

const theme = useCatalogTheme()
</script>

<template>
  <header class="site-head">
    <div class="wrap masthead">
      <RouterLink class="brand" :to="{ name: 'anime' }" aria-label="ACGBox 首页">
        <span class="brand-mark" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
            <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
            <path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.2l8 4.5" />
          </svg>
        </span>
        ACGBox
      </RouterLink>
      <nav class="site-nav" aria-label="资料库分类">
        <RouterLink :to="{ name: 'anime' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="12" rx="2" />
            <path d="M9 21h6m-4.5-12 4 2.5-4 2.5z" />
          </svg>
          动画
        </RouterLink>
        <RouterLink :to="{ name: 'book' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 6.5a8 8 0 0 0-8.5-1v13a8 8 0 0 1 8.5 1 8 8 0 0 1 8.5-1v-13a8 8 0 0 0-8.5 1Zm0 0v13" />
          </svg>
          书籍
        </RouterLink>
      </nav>
      <button
        class="theme-toggle"
        type="button"
        aria-label="白天主题"
        :aria-pressed="theme.mode === 'day'"
        :title="theme.mode === 'day' ? '切换到夜晚' : '切换到白天'"
        @click="theme.toggle"
      >
        <svg v-if="theme.mode === 'day'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.6 15.2a8.8 8.8 0 0 1-11.8-11.8A8.8 8.8 0 1 0 20.6 15.2Z" />
          <path d="M17.5 3v5m-2.5-2.5h5" />
        </svg>
      </button>
    </div>
  </header>
  <main class="wrap">
    <RouterView />
  </main>
</template>
