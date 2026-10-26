<template>
  <div class="cards">
    <div
      v-for="(c, i) in items"
      :key="c.name"
      v-click
      class="cards__item"
      :class="`cards__item--${i % 4}`"
    >
      <span class="cards__name">{{ c.name }}</span>
      <span class="cards__role">{{ c.role }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: { name: string; role: string }[];
}>();
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  margin-top: 1rem;
}
.cards__item {
  background: rgba(20, 20, 30, 0.7);
  border: 1px solid rgba(120, 120, 150, 0.25);
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  backdrop-filter: blur(2px);
  animation: float 8s ease-in-out infinite;
}
.cards__item--0 { animation-delay: -1.0s; }
.cards__item--1 { animation-delay: -2.5s; }
.cards__item--2 { animation-delay: -4.5s; }
.cards__item--3 { animation-delay: -6.5s; }

.cards__name {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text);
}
.cards__role {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .cards__item { animation: none; }
}
</style>
