<template>
  <div class="pipe">
    <svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SMTP filter pipeline">
      <defs>
        <linearGradient id="pipe-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--brand)" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="var(--brand)" stop-opacity="0.2"/>
        </linearGradient>
      </defs>

      <!-- Stage rail -->
      <line x1="40" y1="120" x2="760" y2="120" stroke="url(#pipe-edge)" stroke-width="2"/>

      <g v-for="(s, i) in stages" :key="s" :transform="`translate(${stageX(i)} 120)`" class="pipe__stage">
        <circle r="14" />
        <text y="-26" class="pipe__stage-name">{{ s }}</text>
      </g>

      <!-- Hooks below the rail, alternating between near and far rows -->
      <g class="pipe__hooks">
        <g
          v-for="h in hooks"
          :key="h.label"
          :transform="`translate(${stageX(h.stage)} ${hookY(h.row)})`"
        >
          <line
            x1="0" y1="-100" x2="0" :y2="-30"
            stroke="var(--brand)" stroke-opacity="0.4" stroke-dasharray="3 3"
          />
          <rect x="-54" y="-22" width="108" height="40" rx="8"/>
          <text class="pipe__hook-text">{{ h.label }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const stages = ["CONNECT", "EHLO", "AUTH", "MAIL FROM", "RCPT TO", "DATA", "QUEUE"];

interface Hook { stage: number; label: string; row: 0 | 1; }
const hooks: Hook[] = [
  { stage: 1, label: "Sieve",       row: 0 },
  { stage: 3, label: "Milter",      row: 1 },
  { stage: 4, label: "MTA Hooks", row: 0 },
  { stage: 5, label: "Spam filter",   row: 1 },
];

const stageX = (i: number) => 80 + i * (640 / (stages.length - 1));
const hookY = (row: 0 | 1) => 220 + row * 80;
defineExpose({ stages, hooks });
</script>

<style scoped>
.pipe {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  aspect-ratio: 800 / 360;
  max-height: 50vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.pipe svg { width: 100%; height: 100%; overflow: visible; }
.pipe__stage circle {
  fill: var(--brand-soft);
  stroke: var(--brand);
  stroke-width: 1.5;
}
.pipe__stage-name {
  fill: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  letter-spacing: 0.06em;
}
.pipe__hooks rect {
  fill: var(--surface);
  stroke: var(--border-strong);
  stroke-width: 1;
}
.pipe__hook-text {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>
