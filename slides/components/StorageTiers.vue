<template>
  <div class="tiers">
    <svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stalwart storage tiers">
      <!-- Stalwart core -->
      <g transform="translate(380 70)">
        <rect x="-110" y="-30" width="220" height="60" rx="14" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.5"/>
        <text class="tiers__core" text-anchor="middle" dominant-baseline="middle">Stalwart</text>
        <text class="tiers__core-sub" y="16" text-anchor="middle">JMAP + IMAP + SMTP + DAV</text>
      </g>

      <!-- Arrows from core to each tier -->
      <g stroke="var(--brand)" stroke-opacity="0.4" stroke-width="1.5" fill="none">
        <line x1="380" y1="100" x2="100" y2="220"/>
        <line x1="380" y1="100" x2="290" y2="220"/>
        <line x1="380" y1="100" x2="470" y2="220"/>
        <line x1="380" y1="100" x2="660" y2="220"/>
      </g>

      <!-- Four tiers (boxes widened to fit longer subtitles) -->
      <g class="tiers__tier" transform="translate(100 250)">
        <rect x="-90" y="-44" width="180" height="88" rx="12"/>
        <text class="tiers__tier-name" y="-18">Data</text>
        <text class="tiers__tier-sub" y="2">metadata, indexes</text>
        <text class="tiers__tier-sub2" y="20">RocksDB, FoundationDB</text>
        <text class="tiers__tier-sub2" y="32">PostgreSQL, MySQL, SQLite</text>
      </g>
      <g class="tiers__tier" transform="translate(290 250)">
        <rect x="-90" y="-44" width="180" height="88" rx="12"/>
        <text class="tiers__tier-name" y="-18">Blob</text>
        <text class="tiers__tier-sub" y="2">message bodies</text>
        <text class="tiers__tier-sub2" y="20">S3, Ceph, Azure</text>
        <text class="tiers__tier-sub2" y="32">filesystem</text>
      </g>
      <g class="tiers__tier" transform="translate(470 250)">
        <rect x="-90" y="-44" width="180" height="88" rx="12"/>
        <text class="tiers__tier-name" y="-18">Search</text>
        <text class="tiers__tier-sub" y="2">full-text indexes</text>
        <text class="tiers__tier-sub2" y="20">internal, Meilisearch</text>
        <text class="tiers__tier-sub2" y="32">Elastic, OpenSearch</text>
      </g>
      <g class="tiers__tier" transform="translate(660 250)">
        <rect x="-90" y="-44" width="180" height="88" rx="12"/>
        <text class="tiers__tier-name" y="-18">In-memory</text>
        <text class="tiers__tier-sub" y="2">counters, sessions</text>
        <text class="tiers__tier-sub2" y="20">Redis, Valkey</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.tiers {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  aspect-ratio: 760 / 360;
  max-height: 50vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.6rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.tiers svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.tiers__core {
  fill: var(--brand);
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tiers__core-sub {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}
.tiers__tier rect {
  fill: var(--surface);
  stroke: var(--border-strong);
}
.tiers__tier-name {
  fill: var(--text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
}
.tiers__tier-sub {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 9px;
  text-anchor: middle;
  dominant-baseline: middle;
}
.tiers__tier-sub2 {
  fill: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 8.5px;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>
