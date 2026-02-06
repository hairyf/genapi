<template>
  <div class="flex flex-col bg-[var(--ui-bg)] text-[var(--ui-text)]">
    <div class="px-4 pt-4 border-b border-[var(--ui-border)] bg-[var(--ui-bg-muted)] flex-shrink-0">
      <div class="flex gap-4 items-center flex-wrap">
        <Select
          v-model="selectedPreset"
          :options="presetOptions"
          @change="handlePresetChange"
        />
        <Select
          v-model="selectedMode"
          :options="modeOptions"
          @change="handleModeChange"
        />
      </div>
    </div>
    <div class="flex">
      <div class="flex flex-col flex-1 border-r border-[var(--ui-border)] min-w-0">
        <div
          class="px-4 py-3 border-b border-[var(--ui-border)] bg-[var(--ui-bg-muted)] flex items-center font-medium text-sm flex-shrink-0 text-[var(--ui-text)]">
          Swagger JSON
        </div>
        <CodeHighlighter
          v-model="swaggerJson"
          :highlighted="jsonHighlighted"
          :editable="true"
          placeholder="请输入 Swagger/OpenAPI JSON..."
          @input="handleJsonChange"
        />
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <div
          class="px-4 py-3 border-b border-[var(--ui-border)] bg-[var(--ui-bg-muted)] flex items-center font-medium text-sm flex-shrink-0">
          <Tabs
            v-model="activeTab"
            :tabs="tabs"
          />
        </div>
        <CodeHighlighter
          :model-value="activeCode"
          :highlighted="codeHighlighted"
          :editable="false"
          placeholder="代码将在这里显示..."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { createHighlighter, type Highlighter } from 'shiki'
import Select from './Select.vue'
import Tabs from './Tabs.vue'
import CodeHighlighter from './CodeHighlighter.vue'

// undocs/Nuxt uses @nuxtjs/color-mode: useColorMode().value is the active theme ('light' | 'dark' etc.)
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const theme = computed(() => isDark.value ? 'github-dark' : 'github-light')
const swaggerJson = ref(`{
  "swagger": "2.0",
  "info": {
    "title": "Example API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "Get users",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/User"
              }
            }
          }
        }
      }
    }
  },
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        }
      }
    }
  }
}`)

const selectedPreset = ref('axios')
const selectedMode = ref('ts')
const activeTab = ref<'main' | 'type'>('main')
const generatedCode = ref<{ main?: string; type?: string }>({})
const highlighter = ref<Highlighter | null>(null)

const supportsSchema = computed(() => {
  return selectedPreset.value === 'fetch' || selectedPreset.value === 'ofetch'
})

const presetOptions = computed(() => [
  { value: 'axios', label: 'axios' },
  { value: 'fetch', label: 'fetch' },
  { value: 'ky', label: 'ky' },
  { value: 'got', label: 'got' },
  { value: 'ofetch', label: 'ofetch' },
  { value: 'uni', label: 'uni' },
])

const modeOptions = computed(() => {
  const options = [
    { value: 'ts', label: 'TypeScript' },
    { value: 'js', label: 'JavaScript' },
  ]
  if (supportsSchema.value) {
    options.push({ value: 'schema', label: 'Schema' })
  }
  return options
})

const tabs = computed(() => {
  const items = [
    { value: 'main', label: 'index.ts' },
  ]
  if (generatedCode.value.type) {
    items.push({ value: 'type', label: 'index.type.ts' })
  }
  return items
})

const activeCode = computed(() => {
  if (activeTab.value === 'main') {
    return generatedCode.value.main || ''
  } else {
    return generatedCode.value.type || ''
  }
})

const jsonHighlighted = computed(() => {
  if (!highlighter.value || !swaggerJson.value.trim()) {
    return ''
  }
  return highlighter.value.codeToHtml(swaggerJson.value, {
    lang: 'json',
    theme: theme.value,
  })
})

const codeHighlighted = computed(() => {
  if (!highlighter.value || !activeCode.value)
    return ''
  const lang = activeTab.value === 'type' ? 'typescript' : (selectedMode.value === 'ts' ? 'typescript' : 'javascript')
  return highlighter.value.codeToHtml(activeCode.value, {
    lang,
    theme: theme.value,
  })
})

function handlePresetChange() {
  // 如果当前模式是 schema 但新预设不支持，切换到 ts
  if (selectedMode.value === 'schema' && !supportsSchema.value) {
    selectedMode.value = 'ts'
  }
}

function handleModeChange() {
  // 如果选择了 schema 但当前预设不支持，切换到 fetch
  if (selectedMode.value === 'schema' && !supportsSchema.value) {
    selectedPreset.value = 'fetch'
  }
}

async function generateCode() {
  if (!swaggerJson.value.trim()) {
    return
  }

  const jsonData = JSON.parse(swaggerJson.value)

  const response = await $fetch<{ main?: string; type?: string; error?: string }>('/api/generate', {
    method: 'POST',
    body: {
      swagger: jsonData,
      preset: selectedPreset.value,
      mode: selectedMode.value,
    },
  })

  if (response.error) {
    return
  }

  generatedCode.value = {
    main: response.main || '',
    type: response.type || '',
  }

  // 如果有类型文件，默认显示主文件
  if (generatedCode.value.main) {
    activeTab.value = 'main'
  }
}

function handleJsonChange() {
  // 自动生成代码
  if (!swaggerJson.value.trim()) {
    generatedCode.value = {}
    return
  }
  debouncedGenerateCode()
}

// 使用 VueUse 的防抖函数
const debouncedGenerateCode = useDebounceFn(generateCode, 500)

// 监听预设和模式变化，自动生成代码
watch([selectedPreset, selectedMode], debouncedGenerateCode, { immediate: true })

// 初始化 shiki 高亮器
onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: ['github-dark'],
    langs: ['json', 'typescript', 'javascript'],
  })
})
</script>

<style scoped>
/* 响应式布局 */
@media (max-width: 768px) {
  .flex.flex-1.overflow-hidden.min-h-0 {
    flex-direction: column;
  }

  .flex.flex-col.flex-1.border-r {
    border-right: none;
    border-bottom: 1px solid var(--ui-border);
  }
}
</style>
