<template>
  <div class="cls">
    <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spam classifier flow">
      <defs>
        <linearGradient id="cls-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--brand)" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="var(--brand)" stop-opacity="0.15"/>
        </linearGradient>
      </defs>

      <!-- Stage boxes -->
      <g class="cls__stages">
        <g class="cls__stage" transform="translate(90 140)">
          <rect x="-70" y="-30" width="140" height="60" rx="10"/>
          <text class="cls__stage-name">Tokens</text>
          <text class="cls__stage-sub" y="16">words, headers, URLs</text>
        </g>
        <g class="cls__stage" transform="translate(280 140)">
          <rect x="-70" y="-30" width="140" height="60" rx="10"/>
          <text class="cls__stage-name">Hashed features</text>
          <text class="cls__stage-sub" y="16">fixed-size space</text>
        </g>
        <g class="cls__stage cls__stage--brand" transform="translate(470 140)">
          <rect x="-70" y="-30" width="140" height="60" rx="10"/>
          <text class="cls__stage-name">FTRL weights</text>
          <text class="cls__stage-sub" y="16">~4 MB RAM</text>
        </g>
        <g class="cls__stage" transform="translate(640 140)">
          <rect x="-50" y="-30" width="100" height="60" rx="10"/>
          <text class="cls__stage-name">Score</text>
        </g>
      </g>

      <!-- Arrows -->
      <g stroke="url(#cls-edge)" stroke-width="2" fill="none">
        <line x1="160" y1="140" x2="210" y2="140"/>
        <line x1="350" y1="140" x2="400" y2="140"/>
        <line x1="540" y1="140" x2="590" y2="140"/>
      </g>

      <!-- Feedback loop -->
      <path d="M 640 110 C 640 60, 470 60, 470 110" fill="none" stroke="var(--brand)" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="555" y="50" class="cls__loop">user feedback updates weights</text>

      <!-- Address-book signal -->
      <g transform="translate(280 250)">
        <rect x="-90" y="-22" width="180" height="44" rx="22" fill="var(--surface)" stroke="var(--border-strong)"/>
        <text class="cls__signal">address book ⇒ ham bias</text>
      </g>
      <line x1="280" y1="225" x2="280" y2="180" stroke="var(--brand)" stroke-opacity="0.4" stroke-dasharray="3 3"/>
    </svg>
  </div>
</template>

<style scoped>
.cls {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  aspect-ratio: 720 / 320;
  max-height: 32vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.cls svg { width: 100%; height: 100%; overflow: visible; }
.cls__stage rect {
  fill: var(--surface);
  stroke: var(--border-strong);
  stroke-width: 1;
}
.cls__stage--brand rect {
  fill: var(--brand-soft);
  stroke: var(--brand);
}
.cls__stage-name {
  fill: var(--text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}
.cls__stage--brand .cls__stage-name { fill: var(--brand); }
.cls__stage-sub {
  fill: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 9px;
  text-anchor: middle;
  dominant-baseline: middle;
  letter-spacing: 0.04em;
}
.cls__loop {
  fill: var(--brand);
  font-family: var(--font-mono);
  font-size: 10px;
  text-anchor: middle;
  letter-spacing: 0.04em;
}
.cls__signal {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>
