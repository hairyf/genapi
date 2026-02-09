<template>
   <div
      v-if="highlighted"
      ref="highlightRef"
      class="p-4 font-mono text-sm leading-relaxed pointer-events-none [&_pre]:!p-3 [&_pre]:!m-0 [&_pre]:!rounded [&_pre]:!bg-transparent [&_pre]:!leading-3 [&_pre]:!whitespace-pre-wrap [&_pre]:break-words"
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
  highlighted?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Code will appear here...',
})
</script>

<style scoped>
/* Code highlighting styles */
:deep(.shiki) {
  margin: 0;
  padding: 0;
  background: transparent !important;
}

:deep(.shiki code) {
  background: transparent !important;
}
</style>
