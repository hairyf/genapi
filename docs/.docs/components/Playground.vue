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
          class="px-4 py-3 border-b min-h-[45px] border-[var(--ui-border)] bg-[var(--ui-bg-muted)] flex items-center font-medium text-sm flex-shrink-0 text-[var(--ui-text)]">
          Swagger JSON
        </div>
        <CodeHighlighter
          v-model="swaggerJson"
          :highlighted="jsonHighlighted"
          :editable="true"
          placeholder="Enter Swagger/OpenAPI JSON..."
          @input="handleJsonChange"
        />
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <div
          class="px-4 py-3 border-b min-h-[45px] border-[var(--ui-border)] bg-[var(--ui-bg-muted)] flex items-center font-medium text-sm flex-shrink-0">
          <Tabs
            v-if="tabs.length"
            v-model="activeTab"
            :tabs="tabs"
          />
        </div>
        <CodeHighlighter
          :model-value="activeCode"
          :highlighted="codeHighlighted"
          :editable="false"
          placeholder="Code will appear here..."
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
/** 当前选中的文件名，如 index.ts */
const activeTab = ref('index.ts')
/** 接口返回的文件列表，main 为 index.ts，type 为 index.type.ts 等 */
const generatedFiles = ref<{ filename: string; code: string }[]>([])
const highlighter = ref<Highlighter | null>(null)

const isTanstackPreset = computed(() => selectedPreset.value === 'tanstackQuery')
const supportsSchema = computed(() => {
  return selectedPreset.value === 'fetch' || selectedPreset.value === 'ofetch'
})

const presetOptions = computed(() => [
  { value: 'axios', label: 'axios' },
  { value: 'tanstackQuery', label: 'Tanstack Query' },
  { value: 'fetch', label: 'fetch' },
  { value: 'ky', label: 'ky' },
  { value: 'got', label: 'got' },
  { value: 'ofetch', label: 'ofetch' },
  { value: 'uni', label: 'uni' },
])

const modeOptions = computed(() => {
  if (isTanstackPreset.value) {
    return [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ]
  }
  const options = [
    { value: 'ts', label: 'typescript' },
    { value: 'js', label: 'javascript' },
  ]
  if (supportsSchema.value) {
    options.push({ value: 'schema', label: 'Schema' })
  }
  return options
})

const tabs = computed(() =>
  generatedFiles.value.map(file => ({
    value: file.filename,
    label: file.filename,
  })),
)

const activeCode = computed(() =>
  generatedFiles.value.find(f => f.filename === activeTab.value)?.code ?? '',
)

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
  const isTsLike = ['ts', 'react', 'vue'].includes(selectedMode.value)
  const isTypeFile = activeTab.value.endsWith('.type.ts')
  const lang = isTypeFile ? 'typescript' : (isTsLike ? 'typescript' : 'javascript')
  return highlighter.value.codeToHtml(activeCode.value, {
    lang,
    theme: theme.value,
  })
})

function handlePresetChange() {
  if (isTanstackPreset.value) {
    if (selectedMode.value !== 'react' && selectedMode.value !== 'vue') {
      selectedMode.value = 'react'
    }
  } else {
    if (selectedMode.value === 'schema' && !supportsSchema.value) {
      selectedMode.value = 'ts'
    }
    if (selectedMode.value === 'react' || selectedMode.value === 'vue') {
      selectedMode.value = 'ts'
    }
  }
}

function handleModeChange() {
  if (selectedMode.value === 'schema' && !supportsSchema.value) {
    selectedPreset.value = 'fetch'
  }
}

async function generateCode() {
  if (!swaggerJson.value.trim()) {
    return
  }

  JSON.parse(swaggerJson.value) // validate JSON

  const response = await $fetch<{ files?: { filename: string; code: string }[]; error?: string }>('/api/generate', {
    method: 'POST',
    body: {
      swagger: swaggerJson.value,
      preset: selectedPreset.value,
      mode: selectedMode.value,
    },
  })

  if (response.error || !response.files?.length) {
    return
  }

  generatedFiles.value = response.files
  activeTab.value = response.files[0].filename
}

function handleJsonChange() {
  // Auto-generate code
  if (!swaggerJson.value.trim()) {
    generatedFiles.value = []
    return
  }
  debouncedGenerateCode()
}

// Use VueUse debounce function
const debouncedGenerateCode = useDebounceFn(generateCode, 500)

// Watch preset and mode changes, auto-generate code
watch([selectedPreset, selectedMode], debouncedGenerateCode, { immediate: true })

// Initialize shiki highlighter
onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: ['github-dark'],
    langs: ['json', 'typescript', 'javascript'],
  })
})
</script>

<style scoped>
/* Responsive layout */
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
