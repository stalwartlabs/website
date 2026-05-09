<template>
  <div class="ear">
    <svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Encryption at rest flow">
      <!-- Inbound message -->
      <g transform="translate(80 140)" class="ear__step">
        <rect x="-70" y="-30" width="140" height="60" rx="10"/>
        <text class="ear__step-name">Plaintext</text>
        <text class="ear__step-sub" y="14">incoming message</text>
      </g>

      <!-- Public key fetch -->
      <g transform="translate(290 140)" class="ear__step ear__step--brand">
        <rect x="-90" y="-30" width="180" height="60" rx="10"/>
        <text class="ear__step-name">Per-user public key</text>
        <text class="ear__step-sub" y="14">S/MIME or OpenPGP</text>
      </g>

      <!-- Encrypted at rest -->
      <g transform="translate(540 140)" class="ear__step">
        <rect x="-90" y="-30" width="180" height="60" rx="10"/>
        <text class="ear__step-name">Ciphertext</text>
        <text class="ear__step-sub" y="14">stored on disk</text>
      </g>

      <!-- Arrows -->
      <g stroke="var(--brand)" stroke-opacity="0.5" stroke-width="2" fill="none">
        <line x1="150" y1="140" x2="200" y2="140"/>
        <line x1="380" y1="140" x2="450" y2="140"/>
      </g>

      <!-- Operator annotation -->
      <g transform="translate(540 240)">
        <rect x="-130" y="-20" width="260" height="40" rx="20" fill="var(--surface)" stroke="var(--border-strong)"/>
        <text class="ear__caption" text-anchor="middle" dominant-baseline="middle">operator sees metadata, never the body</text>
      </g>
      <line x1="540" y1="170" x2="540" y2="220" stroke="var(--brand)" stroke-opacity="0.4" stroke-dasharray="3 3"/>

      <!-- No private key annotation -->
      <g transform="translate(290 60)">
        <rect x="-110" y="-20" width="220" height="40" rx="20" fill="var(--brand-soft)" stroke="var(--brand)"/>
        <text class="ear__caption ear__caption--brand" text-anchor="middle" dominant-baseline="middle">no private keys on the server</text>
      </g>
      <line x1="290" y1="80" x2="290" y2="110" stroke="var(--brand)" stroke-opacity="0.4" stroke-dasharray="3 3"/>
    </svg>
  </div>
</template>

<style scoped>
.ear {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  aspect-ratio: 720 / 280;
  max-height: 30vh;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.5rem 0.8rem;
  box-shadow: var(--shadow-1);
}
.ear svg { width: 100%; height: 100%; overflow: visible; }
.ear__step rect {
  fill: var(--surface);
  stroke: var(--border-strong);
}
.ear__step--brand rect {
  fill: var(--brand-soft);
  stroke: var(--brand);
  stroke-width: 1.5;
}
.ear__step-name {
  fill: var(--text);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}
.ear__step--brand .ear__step-name { fill: var(--brand); }
.ear__step-sub {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 9px;
  text-anchor: middle;
  dominant-baseline: middle;
}
.ear__caption {
  fill: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}
.ear__caption--brand { fill: var(--brand); }
</style>
