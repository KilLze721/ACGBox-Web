import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

// 只有明确保存的夜晚优先于白天默认值，存储不可用时仍可切换。
const themeKey = 'acgbox-public-catalog-theme'

function readTheme(): 'day' | 'night' {
  try {
    return localStorage.getItem(themeKey) === 'night' ? 'night' : 'day'
  } catch {
    return 'day'
  }
}

export const useCatalogTheme = defineStore('catalogTheme', () => {
  const mode = ref(readTheme())

  watchEffect(() => {
    document.documentElement.dataset.theme = mode.value
  })

  function toggle() {
    mode.value = mode.value === 'day' ? 'night' : 'day'
    try {
      localStorage.setItem(themeKey, mode.value)
    } catch {
      // 存储受限时仅保留当前页面的主题状态。
    }
  }

  return { mode, toggle }
})
