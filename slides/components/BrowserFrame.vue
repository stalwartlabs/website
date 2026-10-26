<template>
  <figure class="bf" :class="{ 'bf--glow': glow, 'bf--bare': bare }">
    <div v-if="!bare" class="bf__chrome">
      <span class="bf__dot bf__dot--r" />
      <span class="bf__dot bf__dot--y" />
      <span class="bf__dot bf__dot--g" />
      <span class="bf__url">{{ url || "admin.stalw.art" }}</span>
    </div>
    <img class="bf__img" :src="src" :alt="alt" />
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
  url?: string;
  glow?: boolean;
  bare?: boolean;
}>();
</script>

<style scoped>
.bf {
  margin: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-1);
  display: flex;
  flex-direction: column;
  max-height: 60vh;
}
.bf--glow {
  box-shadow: var(--frame-shadow);
}
.bf--bare {
  border: none;
  background: transparent;
  box-shadow: none;
  max-height: none;
}
.bf__chrome {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.7rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}
.bf__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.bf__dot--r { background: #ff5f57; }
.bf__dot--y { background: #febc2e; }
.bf__dot--g { background: #28c840; }
.bf__url {
  margin-left: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg);
  padding: 0.18rem 0.55rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  min-width: 240px;
  text-align: center;
}
.bf__img {
  display: block;
  width: 100%;
  height: auto;
  min-height: 0;
  flex: 1 1 auto;
  object-fit: contain;
  object-position: top;
}
.bf--bare .bf__img {
  max-height: none;
}
</style>
