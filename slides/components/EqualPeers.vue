<template>
  <div class="peers">
    <svg viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Equal peers, no leaders">
      <!-- Mesh edges -->
      <g stroke="var(--brand)" stroke-opacity="0.35" stroke-width="1" fill="none">
        <line v-for="(e, i) in edges" :key="i" :x1="nodes[e[0]][0]" :y1="nodes[e[0]][1]" :x2="nodes[e[1]][0]" :y2="nodes[e[1]][1]"/>
      </g>

      <g v-for="(n, i) in nodes" :key="i" :transform="`translate(${n[0]} ${n[1]})`" class="peers__node" :class="{ 'peers__node--down': i === 4 }">
        <circle r="22"/>
        <text class="peers__node-text" text-anchor="middle" dominant-baseline="middle">{{ String(i + 1) }}</text>
        <circle v-if="i !== 4" r="32" class="peers__pulse" :style="{ animationDelay: `${i * 0.4}s` }" fill="none"/>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const nodes: [number, number][] = [
  [120, 60],
  [360, 60],
  [60, 200],
  [240, 160],
  [420, 200],
  [180, 280],
  [340, 280],
];
const edges: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 3], [1, 4],
  [2, 3], [2, 5], [3, 4], [3, 5], [3, 6],
  [4, 6], [5, 6],
];
</script>

<style scoped>
.peers {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  aspect-ratio: 480 / 320;
  max-height: 50vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.peers svg { width: 100%; height: 100%; overflow: visible; }
.peers__node circle {
  fill: var(--brand-soft);
  stroke: var(--brand);
  stroke-width: 1.5;
}
.peers__node--down circle {
  fill: var(--surface-3);
  stroke: var(--text-dim);
  stroke-dasharray: 3 3;
  opacity: 0.5;
}
.peers__node-text {
  fill: var(--brand);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}
.peers__node--down .peers__node-text {
  fill: var(--text-dim);
}

@keyframes peers-pulse {
  0%   { transform: scale(0.85); opacity: 0.7; }
  100% { transform: scale(1.4);  opacity: 0; }
}
.peers__pulse {
  stroke: var(--brand);
  stroke-width: 1;
  transform-box: fill-box;
  transform-origin: center;
  animation: peers-pulse 2.4s var(--ease-emph) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .peers__pulse { animation: none; opacity: 0; }
}
</style>
