<template>
   <div
      v-if="highlighted"
      ref="highlightRef"
      class="p-4 font-mono text-sm leading-relaxed pointer-events-none [&_pre]:!p-3 [&_pre]:!m-0 [&_pre]:!rounded [&_pre]:!bg-transparent [&_pre]:!leading-3"
      v-html="highlighted"
    />
    <div
      v-else-if="!highlighted"
      class="p-4 font-mono text-sm leading-relaxed flex items-center justify-center"
    >
      <pre class="m-0 whitespace-pre-wrap break-words text-[var(--ui-text-muted)] italic">
        {{ placeholder }}
      </pre>
    </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  highlighted?: string
  editable?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  placeholder: '代码将在这里显示...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  input: [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', target.value)
}
</script>

<style scoped>
/* 代码高亮样式 */
:deep(.shiki) {
  margin: 0;
  padding: 0;
  background: transparent !important;
}

:deep(.shiki code) {
  background: transparent !important;
}
</style>
