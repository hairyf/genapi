<template>
  <div class="flex items-center gap-2">
    <label v-if="label" class="font-medium text-sm text-[var(--ui-text)]">{{ label }}</label>
    <select :value="modelValue" @change="handleChange" class="select-input">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  label?: string
  options: Option[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', target.value)
}
</script>

<style scoped>
.select-input {
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg);
  color: var(--ui-text);
  min-width: 120px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
}

.select-input:hover {
  border-color: var(--ui-primary);
}

.select-input:focus {
  outline: none;
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 20%, transparent);
}
</style>
