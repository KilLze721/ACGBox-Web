import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

// 沿用原型的存储键与夜晚默认值，存储不可用时仍可切换。
const themeKey = 'acgbox-public-catalog-theme'

function readTheme(): 'day' | 'night' {
  try {
    return localStorage.getItem(themeKey) === 'day' ? 'day' : 'night'
  } catch {
    return 'night'
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
