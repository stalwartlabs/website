<template>
  <figure class="tf">
    <div class="tf__chrome">
      <span class="tf__dot tf__dot--r" />
      <span class="tf__dot tf__dot--y" />
      <span class="tf__dot tf__dot--g" />
      <span v-if="title" class="tf__title">{{ title }}</span>
    </div>
    <div class="tf__body">
      <slot />
    </div>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style scoped>
.tf {
  margin: 0;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-1);
}
.tf__chrome {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.tf__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.tf__dot--r { background: #ff5f57; }
.tf__dot--y { background: #febc2e; }
.tf__dot--g { background: #28c840; }
.tf__title {
  margin-left: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* Body lays each direct child as its own block,
   so each <div> in the slot becomes a terminal line.
   Whitespace inside a single <div> is preserved (`pre`-like). */
.tf__body {
  padding: 0.85rem 1.1rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--text);
  overflow-x: auto;
}
/* Every div inside the body becomes a terminal line. The outer ones
   are direct slot children; nested ones come from v-click wrappers
   and similar inline grouping. */
.tf__body :deep(div) {
  display: block;
  white-space: pre;
}
.tf__body :deep(.prompt) { color: var(--text-dim); }
.tf__body :deep(.cmd)    { color: var(--text); }
.tf__body :deep(.ok)     { color: #6cd07a; }
.tf__body :deep(.warn)   { color: #f0c674; }
.tf__body :deep(.muted)  { color: var(--text-muted); }
.tf__body :deep(.brand)  { color: var(--brand); }
</style>
