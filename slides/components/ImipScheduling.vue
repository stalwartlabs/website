<template>
  <div class="imip">
    <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="iMIP scheduling flow">
      <!-- Organiser -->
      <g transform="translate(120 140)" class="imip__node imip__node--brand">
        <rect x="-70" y="-30" width="140" height="60" rx="10"/>
        <text class="imip__name">Organiser</text>
        <text class="imip__sub" y="14">creates event</text>
      </g>

      <!-- Stalwart -->
      <g transform="translate(360 140)" class="imip__node">
        <rect x="-90" y="-30" width="180" height="60" rx="10"/>
        <text class="imip__name">Stalwart</text>
        <text class="imip__sub" y="14">CalDAV + JMAP</text>
      </g>

      <!-- Attendee -->
      <g transform="translate(600 140)" class="imip__node imip__node--brand">
        <rect x="-70" y="-30" width="140" height="60" rx="10"/>
        <text class="imip__name">Attendee</text>
        <text class="imip__sub" y="14">accepts / declines</text>
      </g>

      <!-- iMIP arrows -->
      <g stroke="var(--brand)" stroke-opacity="0.55" stroke-width="2" fill="none">
        <path d="M 190 130 L 270 130"/>
        <path d="M 270 150 L 190 150"/>
        <path d="M 450 130 L 530 130"/>
        <path d="M 530 150 L 450 150"/>
      </g>

      <text x="230" y="118" class="imip__edge">REQUEST</text>
      <text x="230" y="172" class="imip__edge">REPLY</text>
      <text x="490" y="118" class="imip__edge">iMIP email</text>
      <text x="490" y="172" class="imip__edge">RSVP</text>

      <!-- Free/busy lookup arc -->
      <path d="M 190 100 Q 360 30, 530 100" fill="none" stroke="var(--brand)" stroke-opacity="0.3" stroke-dasharray="4 4"/>
      <text x="360" y="40" class="imip__caption" text-anchor="middle">free/busy lookup</text>
    </svg>
  </div>
</template>

<style scoped>
.imip {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  aspect-ratio: 720 / 280;
  max-height: 38vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.imip svg { width: 100%; height: 100%; overflow: visible; }
.imip__node rect {
  fill: var(--surface);
  stroke: var(--border-strong);
}
.imip__node--brand rect {
  fill: var(--brand-soft);
  stroke: var(--brand);
}
.imip__name {
  fill: var(--text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}
.imip__node--brand .imip__name { fill: var(--brand); }
.imip__sub {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 9px;
  text-anchor: middle;
  dominant-baseline: middle;
}
.imip__edge {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 9px;
  text-anchor: middle;
  letter-spacing: 0.06em;
}
.imip__caption {
  fill: var(--brand);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}
</style>
