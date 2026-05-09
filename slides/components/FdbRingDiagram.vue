<template>
  <div class="fdb">
    <svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FoundationDB cluster topology">
      <defs>
        <radialGradient id="fdb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stop-color="var(--brand)" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="var(--brand)" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Stalwart nodes on the left -->
      <g class="fdb__nodes">
        <g v-for="(y, i) in [80, 160, 240]" :key="i" :transform="`translate(70 ${y})`">
          <rect x="-58" y="-22" width="116" height="44" rx="10"/>
          <text>Stalwart</text>
        </g>
      </g>

      <!-- Edges from each Stalwart node to ring centre -->
      <g stroke="var(--brand)" stroke-opacity="0.35" stroke-width="1.25" fill="none">
        <line x1="128" y1="80"  x2="320" y2="160"/>
        <line x1="128" y1="160" x2="320" y2="160"/>
        <line x1="128" y1="240" x2="320" y2="160"/>
      </g>

      <!-- FDB ring (glow + ring + 6 nodes around) -->
      <circle cx="380" cy="160" r="110" fill="url(#fdb-glow)"/>
      <circle cx="380" cy="160" r="84" fill="none" stroke="var(--brand)" stroke-opacity="0.55" stroke-dasharray="4 4"/>
      <g class="fdb__ring">
        <g v-for="(p, i) in ring" :key="i" :transform="`translate(${380 + p[0]} ${160 + p[1]})`">
          <circle r="14"/>
          <text>{{ i + 1 }}</text>
        </g>
      </g>

      <!-- Caption strip -->
      <g transform="translate(380 290)">
        <rect x="-110" y="-16" width="220" height="32" rx="16" fill="var(--brand-soft)" stroke="var(--brand)"/>
        <text class="fdb__caption" text-anchor="middle" dominant-baseline="middle">strict serializable ACID</text>
      </g>

      <text x="380" y="60" class="fdb__label" text-anchor="middle">FoundationDB</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
const r = 84;
const angles = [-90, -30, 30, 90, 150, 210];
const ring = angles.map(a => {
  const rad = (a * Math.PI) / 180;
  return [Math.cos(rad) * r, Math.sin(rad) * r] as [number, number];
});
</script>

<style scoped>
.fdb {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  aspect-ratio: 540 / 320;
  max-height: 50vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.fdb svg { width: 100%; height: 100%; overflow: visible; }

.fdb__nodes rect {
  fill: var(--surface);
  stroke: var(--border-strong);
}
.fdb__nodes text {
  fill: var(--text);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}

.fdb__ring circle {
  fill: var(--brand-soft);
  stroke: var(--brand);
  stroke-width: 1.25;
}
.fdb__ring text {
  fill: var(--brand);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
}

.fdb__label {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fdb__caption {
  fill: var(--brand);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
