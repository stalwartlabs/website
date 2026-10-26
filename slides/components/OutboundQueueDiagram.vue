<template>
  <div class="oq">
    <svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Outbound MTA cluster role">
      <!-- Ingest source on the left -->
      <g class="oq__edge" transform="translate(60 160)">
        <rect x="-50" y="-22" width="100" height="44" rx="22"/>
        <text>Ingest</text>
      </g>

      <!-- MX target on the right -->
      <g class="oq__edge" transform="translate(540 160)">
        <rect x="-50" y="-22" width="100" height="44" rx="22"/>
        <text>MX</text>
      </g>

      <!-- Outbound MTA tier in the middle (3 stacked nodes) -->
      <g class="oq__plate">
        <rect x="200" y="40" width="200" height="160" rx="14"
              fill="var(--brand-soft)" stroke="var(--brand)"
              stroke-opacity="0.45" stroke-dasharray="4 4"/>
        <text x="300" y="32" class="oq__label" text-anchor="middle">Outbound MTA tier</text>
      </g>
      <g class="oq__node">
        <g v-for="(y, i) in [70, 120, 170]" :key="i" :transform="`translate(300 ${y})`">
          <rect x="-70" y="-15" width="140" height="30" rx="8"/>
          <text>Node {{ i + 1 }}</text>
        </g>
      </g>

      <!-- Arrows: ingest -> MTA tier -> MX -->
      <g stroke="var(--brand)" stroke-opacity="0.55" stroke-width="2" fill="none">
        <line x1="110" y1="160" x2="195" y2="120"/>
        <line x1="405" y1="120" x2="490" y2="160"/>
      </g>

      <!-- Shared queue band below -->
      <g transform="translate(300 260)">
        <rect x="-130" y="-22" width="260" height="44" rx="14"
              fill="var(--surface)" stroke="var(--border-strong)"/>
        <text class="oq__queue" text-anchor="middle" dominant-baseline="middle">shared queue (any node, any message)</text>
      </g>
      <line x1="300" y1="200" x2="300" y2="238"
            stroke="var(--brand)" stroke-opacity="0.5"
            stroke-width="1.5" stroke-dasharray="4 4"/>
    </svg>
  </div>
</template>

<style scoped>
.oq {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  aspect-ratio: 600 / 320;
  max-height: 45vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.oq svg { width: 100%; height: 100%; overflow: visible; }

.oq__edge rect {
  fill: var(--surface);
  stroke: var(--border-strong);
}
.oq__edge text {
  fill: var(--text);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}

.oq__node rect {
  fill: var(--bg-elev);
  stroke: var(--brand);
  stroke-width: 1.25;
}
.oq__node text {
  fill: var(--brand);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}

.oq__label {
  fill: var(--brand);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.oq__queue {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
}
</style>
