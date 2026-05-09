<template>
  <div class="fan">
    <svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DNSBL fan-in">
      <g class="fan__src" v-for="(s, i) in sources" :key="s" :transform="`translate(120 ${50 + i * 60})`">
        <rect x="-80" y="-22" width="160" height="44" rx="22"/>
        <text>{{ s }}</text>
      </g>

      <g stroke="var(--brand)" stroke-opacity="0.45" stroke-width="1.2" fill="none">
        <line v-for="(s, i) in sources" :key="i" x1="200" :y1="50 + i * 60" x2="500" y2="160"/>
      </g>

      <g transform="translate(560 160)" class="fan__sink">
        <rect x="-80" y="-30" width="160" height="60" rx="12"/>
        <text class="fan__sink-name">Spam score</text>
        <text class="fan__sink-sub" y="16">tunable weights</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const sources = ["Spamhaus (IP)", "URIBL (URL)", "Domain blocklists", "Content hashes", "Pyzor digests"];
</script>

<style scoped>
.fan {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  aspect-ratio: 720 / 320;
  max-height: 30vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.fan svg { width: 100%; height: 100%; overflow: visible; }
.fan__src rect {
  fill: var(--surface);
  stroke: var(--border-strong);
}
.fan__src text {
  fill: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}
.fan__sink rect {
  fill: var(--brand-soft);
  stroke: var(--brand);
  stroke-width: 1.5;
}
.fan__sink-name {
  fill: var(--brand);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
}
.fan__sink-sub {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 9px;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>
