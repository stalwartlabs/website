<template>
  <div class="badges" :class="{ 'badges--center': center }">
    <span v-for="p in resolved" :key="p" class="badges__item">{{ p }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    protocols?: string[];
    center?: boolean;
  }>(),
  {
    protocols: () => ["JMAP", "IMAP", "POP3", "SMTP", "CalDAV", "CardDAV", "WebDAV", "ManageSieve"],
    center: false,
  }
);

const resolved = computed(() => props.protocols);
</script>

<style scoped>
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.badges--center { justify-content: center; }
.badges__item {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--text);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
}
</style>
