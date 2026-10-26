<template>
  <div class="four">
    <div class="four__tile" v-for="t in tiles" :key="t.title">
      <span class="four__eyebrow">{{ t.eyebrow }}</span>
      <h3 class="four__title">{{ t.title }}</h3>
      <p class="four__body">{{ t.body }}</p>
      <div class="four__viz">
        <svg :viewBox="`0 0 200 80`" preserveAspectRatio="xMidYMid meet">
          <g v-for="(p, i) in t.dots" :key="i">
            <circle :cx="p[0]" :cy="p[1]" r="6" :fill="p[2] === 'b' ? 'var(--brand)' : 'var(--surface-3)'" />
          </g>
          <g v-for="(l, i) in t.lines || []" :key="`l${i}`">
            <line :x1="l[0]" :y1="l[1]" :x2="l[2]" :y2="l[3]" stroke="var(--brand)" stroke-opacity="0.5" stroke-width="1"/>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tiles = [
  {
    eyebrow: "01 / Single node",
    title: "One process, every protocol",
    body: "Suitable for evaluation and small organisations. The same product, scaled down.",
    dots: [[100, 40, "b"]],
  },
  {
    eyebrow: "02 / Cluster",
    title: "Any node serves any protocol",
    body: "Three or more nodes share a distributed data store; capacity grows by adding nodes.",
    dots: [[60, 40, "b"], [100, 40, "b"], [140, 40, "b"]],
    lines: [[60, 40, 100, 40], [100, 40, 140, 40]],
  },
  {
    eyebrow: "03 / Orchestrated",
    title: "Kubernetes, Mesos, Docker Swarm",
    body: "Lifecycle and scaling are owned by the orchestrator; cluster coordination keeps state in step.",
    dots: [[50, 30, "b"], [80, 50, "b"], [120, 30, "b"], [150, 50, "b"]],
    lines: [[50, 30, 80, 50], [80, 50, 120, 30], [120, 30, 150, 50]],
  },
  {
    eyebrow: "04 / Multi-region",
    title: "Nodes split across regions",
    body: "Data store + geo-replicated blob storage; global load balancing or DNS-based routing.",
    dots: [[40, 30, "b"], [70, 30, "b"], [130, 50, "b"], [160, 50, "b"]],
    lines: [[40, 30, 70, 30], [130, 50, 160, 50], [70, 30, 130, 50]],
  },
];
</script>

<style scoped>
.four {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.four__tile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: grid;
  grid-template-columns: 1fr 130px;
  grid-template-rows: auto auto 1fr;
  column-gap: 1rem;
}
.four__eyebrow {
  grid-column: 1 / 2;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 0.2rem;
}
.four__title {
  grid-column: 1 / 2;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}
.four__body {
  grid-column: 1 / 2;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0 0;
}
.four__viz {
  grid-column: 2 / 3;
  grid-row: 1 / 4;
  align-self: center;
}
.four__viz svg { width: 100%; }
</style>
