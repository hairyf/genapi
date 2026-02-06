<template>
  <div class="flex gap-1">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="[
        'px-4 p-0 bg-transparent border-none border-b-2 border-transparent cursor-pointer font-medium text-sm transition-colors',
        modelValue === tab.value
          ? 'text-[var(--ui-primary)] border-b-2 border-[var(--ui-primary)]'
          : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
      ]"
      @click="handleTabClick(tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  value: string
  label: string
}

interface Props {
  modelValue: string
  tabs: Tab[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

function handleTabClick(value: string) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
