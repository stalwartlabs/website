<template>
  <div class="wc">
    <div class="wc__viz">
      <BrowserFrame
        :src="current.src"
        :alt="current.alt || current.title"
        :url="current.url"
        :glow="current.glow"
      />
    </div>
    <div class="wc__copy">
      <div class="eyebrow">Step {{ idx + 1 }} of {{ steps.length }}</div>
      <h2 class="wc__title">{{ current.title }}</h2>
      <p class="wc__body">{{ current.body }}</p>
      <div class="wc__pager" aria-hidden="true">
        <span
          v-for="(_, i) in steps"
          :key="i"
          class="wc__dot"
          :class="{ 'wc__dot--active': i === idx }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BrowserFrame from "./BrowserFrame.vue";

interface Step {
  src: string;
  title: string;
  body: string;
  url?: string;
  alt?: string;
  glow?: boolean;
}

const props = defineProps<{
  steps: Step[];
  clicks: number;
}>();

const idx = computed(() =>
  Math.min(Math.max(0, props.clicks ?? 0), props.steps.length - 1)
);
const current = computed(() => props.steps[idx.value]);
</script>

<style scoped>
.wc {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  align-items: center;
  margin-top: 0.4rem;
}
.wc__viz {
  min-width: 0;
}
.wc__copy {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.wc__title {
  font-size: clamp(1.4rem, 2.4vw, 1.85rem);
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
  letter-spacing: -0.01em;
  color: var(--text);
}
.wc__body {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.55;
  margin: 0;
}
.wc__pager {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.6rem;
}
.wc__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--surface-3);
  transition: background var(--t-mid) var(--ease),
              transform var(--t-mid) var(--ease-emph);
}
.wc__dot--active {
  background: var(--brand);
  transform: scale(1.25);
}
</style>
