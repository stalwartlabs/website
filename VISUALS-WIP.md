# Marketing visuals audit

Working doc tracking the screenshot and diagram state for every visual slot
under `src/content/pages`. Each row in the status table is one slot in one
page; status is one of:

```
[OK]  screenshot in place, fits the section, no duplicate
[SS]  screenshot needed (placeholder in place)
[DG]  diagram needed (placeholder in place)
```

The "Detail" column for `[SS]` and `[DG]` rows points at the spec section
below where we describe what the asset should show.

## Asset inventory

### Screenshots in `public/images/webadmin/` (only the ones used by marketing pages)

```
accounts-list.png          mail-server.yml multi-tenancy
calendar-edit.png          collaboration.yml hero
dashboard-overview.png     home.yml hero
dashboard-network.png      mail-server.yml hero
dashboard-delivery.png     mta.yml hero
dashboard-security.png     anti-spam.yml hero
dashboard-performance.png  enterprise.yml hero
dashboard-storage.png      home.yml backends
delivery-test-trace.png    mta.yml transport security
dmarc-report-detail.png    mta.yml sender authentication
dmarc-reports-list.png     anti-spam.yml DMARC
live-tracing.png           enterprise.yml live telemetry
log-viewer.png             mta.yml web admin
masked-email.png           enterprise.yml masked email
queue-delivery-detail.png  mta.yml virtual queues
tasks-scheduled.png        mail-server.yml DKIM rotation
```

Every screenshot is used in exactly one slot. No duplicates.

### Files in `public/images/webadmin/` that are no longer referenced by marketing pages

```
account-settings.png       (Account Manager / Account Settings form)
delivery-trace.png         (older delivery trace; replaced by delivery-test-trace.png)
dmarc-report.png           (older DMARC detail; replaced by dmarc-report-detail.png)
edit-user.png              (Directory / Edit user form)
network-settings.png       (Settings / Network defaults form)
tasks.png                  (older tasks list; replaced by tasks-scheduled.png)
```

These are still referenced from the v0.15 docs archive, so leave them on disk.

### Set-aside screenshots from the recent capture batch (no good marketing fit)

```
Screen Shot 2026-05-02 at 18.16.35.png    duplicate of dashboard-performance.png (older variant)
Screen Shot 2026-05-02 at 18.17.04.png    duplicate of dashboard-network.png (older variant)
Screen Shot 2026-05-02 at 18.19.47.png    DKIM management form (form-heavy; story is told by tasks-scheduled.png instead)
Screen Shot 2026-05-02 at 18.22.55.png    Account Manager 2FA QR setup (no marketing section currently calls out 2FA)
```

### Diagrams

The previous `cluster` and `architecture` Astro components are no longer
referenced from any page. All 6 former diagram slots are now placeholders
awaiting purpose-built diagrams (see specs further down).

## Status by page

```
home.yml
  H. Hero ............................. [OK]  dashboard-overview.png
  3. Enhanced security ................ [DG]  D-home-security
  4. Backends adapt ................... [OK]  dashboard-storage.png
  5. Unified collaboration ............ [SS]  S-home-collab
  6. Defence built in ................. [DG]  D-home-spam-pipeline
  7. Built to scale ................... [DG]  D-cluster

mail-server.yml
  H. Hero ............................. [OK]  dashboard-network.png
  1. JMAP ............................. [DG]  D-jmap
  2. IMAP and POP3 .................... [SS]  S-mail-imap
  3. Automated DNS .................... [SS]  S-mail-dns
  4. Automated DKIM rotation .......... [OK]  tasks-scheduled.png
  5. ACME and TLS ..................... [SS]  S-mail-acme
  6. Autoconfig and Autodiscover ...... [DG]  D-autoconfig
  7. Multi-tenancy and quotas ......... [OK]  accounts-list.png
  8. Sieve scripting .................. [SS]  S-mail-sieve
  9. Web admin ........................ [SS]  S-mail-webadmin

mta.yml
  H. Hero ............................. [OK]  dashboard-delivery.png
  1. Sender authentication ............ [OK]  dmarc-report-detail.png
  2. Transport security ............... [OK]  delivery-test-trace.png
  3. Distributed virtual queues ....... [OK]  queue-delivery-detail.png
  4. Filter pipeline .................. [DG]  D-smtp-pipeline
  5. Envelope and message rewriting ... [SS]  S-mta-rewrite
  6. Web admin ........................ [OK]  log-viewer.png
  7. High availability ................ [DG]  D-mta-cluster

anti-spam.yml
  H. Hero ............................. [OK]  dashboard-security.png
  1. Statistical classifier ........... [DG]  D-classifier
  2. LLM-driven analysis .............. [SS]  S-spam-llm
  3. DNSBL and Pyzor .................. [SS]  S-spam-dnsbl
  4. DMARC, SPF, DKIM, ARC ............ [OK]  dmarc-reports-list.png
  5. Phishing protection .............. [DG]  D-phishing
  6. Sender reputation ................ [SS]  S-spam-reputation
  7. ASN and country blocking ......... [SS]  S-spam-asn
  8. Auto-banning ..................... [SS]  S-spam-autoban
  9. Upstream filters ................. [DG]  D-upstream-filters

collaboration.yml
  H. Hero ............................. [OK]  calendar-edit.png
  1. Calendars ........................ [SS]  S-collab-calendars
  2. Scheduling ....................... [DG]  D-itip-imip
  3. Contacts ......................... [SS]  S-collab-contacts
  4. File storage ..................... [SS]  S-collab-files
  5. Sharing .......................... [SS]  S-collab-sharing
  6. Notifications .................... [DG]  D-valarm-email

enterprise.yml
  H. Hero ............................. [OK]  dashboard-performance.png
  1. Multi-tenancy .................... [SS]  S-ent-tenants
  2. Branding ......................... [SS]  S-ent-branding
  3. Account archiving ................ [SS]  S-ent-archive
  4. Live telemetry ................... [OK]  live-tracing.png
  5. AI-assisted spam filtering ....... [SS]  S-ent-ai
  6. Masked email ..................... [OK]  masked-email.png
  7. Read replicas .................... [DG]  D-read-replicas

architecture.yml
  H. Hero ............................. [DG]  D-architecture
  2. High availability ................ [DG]  D-cluster

managed-email.yml
  4. Architecture ..................... [DG]  D-managed-cluster

migration.yml
  3. Tooling .......................... [DG]  D-migration
```

Totals
```
[OK]  16 slots resolved
[SS]  17 slots needing screenshots
[DG]  13 slots needing diagrams
      ----
      46 visual slots total
```

## Pending screenshot specs

What we would need from a future capture batch.

### S-home-collab
**Page**: home.yml, Unified collaboration section.
**Caption hint**: A collaboration overview not duplicated from collaboration.yml hero.
**Suggestion**: A split or collage of calendars + contacts + files in the same WebUI, or a single "Day at a glance" view if such a surface exists.

### S-mail-imap
**Page**: mail-server.yml, IMAP and POP3 section.
**Caption hint**: IMAP/POP3 listener configuration.
**Suggestion**: `Settings / Network / Listeners` filtered to IMAP and POP3, showing port, TLS mode and bind interface for each. A real IMAP4 client mid-session against the WebUI is also acceptable.

### S-mail-dns
**Page**: mail-server.yml, Automated DNS section.
**Caption hint**: DNS provider integration with per-domain MX/SPF/DKIM/DMARC/TLSA records and "managed" badges.
**Suggestion**: Either the provider list (`Settings / DNS`) or the per-domain DNS records pane.

### S-mail-acme
**Page**: mail-server.yml, ACME and TLS section.
**Caption hint**: Certificate list with renewal countdown.
**Suggestion**: `Settings / TLS / Certificates` with at least one cert visible, expiry, next-renewal and ACME provider columns. EAB indicator if available.

### S-mail-sieve
**Page**: mail-server.yml, Sieve scripting section.
**Caption hint**: Sieve script editor with syntax highlight and a recently-edited script visible.
**Suggestion**: Account Manager `Sieve Scripts` pane with one script open in the editor; or the trusted-script list at server level.

### S-mail-webadmin
**Page**: mail-server.yml, Web admin section.
**Caption hint**: Representative WebUI overview not duplicated by the page hero (network dashboard) or other sections.
**Suggestion**: A self-service portal pane (password change + encryption-at-rest key management) — that surface is mentioned in the body and not yet shown anywhere on the marketing site.

### S-mta-rewrite
**Page**: mta.yml, Envelope and message rewriting section.
**Caption hint**: Sieve/expression-based rewriting rule editor.
**Suggestion**: A rule list plus an open rule with the expression body and a "rewrite header / strip attachment" example. Could alternatively be rendered as a `kind: code` block (the schema allows it on this page).

### S-spam-llm
**Page**: anti-spam.yml, LLM-driven analysis section.
**Caption hint**: AI Model configuration (provider, endpoint, auth, model name).
**Suggestion**: `Settings / AI` or `Settings / Spam Filter / AI Model` with one configured endpoint visible.

### S-spam-dnsbl
**Page**: anti-spam.yml, DNSBL and Pyzor section.
**Caption hint**: DNSBL provider list with zone, tag, weight columns.
**Suggestion**: `Settings / Spam Filter / DNSBL` (or wherever the providers live) with two or three providers configured.

### S-spam-reputation
**Page**: anti-spam.yml, Sender reputation section.
**Caption hint**: Per-IP/ASN/domain/email reputation table or greylist status.
**Suggestion**: A reputation overview, ideally one with non-trivial data (some senders ham-leaning, some spam-leaning), so the value of the section is visible at a glance.

### S-spam-asn
**Page**: anti-spam.yml, ASN and country blocking section.
**Caption hint**: ASN / country block-list editor.
**Suggestion**: The block-list table with at least one ASN and one country visible plus the mode column (block / score / log).

### S-spam-autoban
**Page**: anti-spam.yml, Auto-banning section.
**Caption hint**: Auto-ban list with reason, expiry and category filter.
**Suggestion**: The active bans table with reason badges (auth / relay / loitering / scanning) and remaining-time column.

### S-collab-calendars
**Page**: collaboration.yml, Calendars section.
**Caption hint**: A more visual calendars surface than the per-calendar settings form already used on the page hero.
**Suggestion**: Calendars list with sharing badges, or a free/busy lookup result for two attendees, or an event editor with attendees and recurrence.

### S-collab-contacts
**Page**: collaboration.yml, Contacts section.
**Caption hint**: CardDAV address-book view in the WebUI.
**Suggestion**: An address-book list with avatar, name, email columns and a sharing badge or two.

### S-collab-files
**Page**: collaboration.yml, File storage section.
**Caption hint**: WebDAV file storage view in the WebUI.
**Suggestion**: A folder tree with a file table and the per-account quota bar visible.

### S-collab-sharing
**Page**: collaboration.yml, Sharing section.
**Caption hint**: Sharing/ACL editor.
**Suggestion**: A single resource (calendar, address book or file collection) with the principals + R/W/Manage matrix open.

### S-ent-tenants
**Page**: enterprise.yml, Multi-tenancy section.
**Caption hint**: Tenants list with per-tenant disk and principal quota bars and the directory backend column.
**Suggestion**: At least three tenants, each with a different directory backend (LDAP / OIDC / internal) so the per-tenant identity story reads at a glance.

### S-ent-branding
**Page**: enterprise.yml, Branding section.
**Caption hint**: Two side-by-side WebUI views with different tenant logos and accent colours.
**Suggestion**: Composite of two captures (the same admin pane under two different brands), or the branding settings panel with the live preview.

### S-ent-archive
**Page**: enterprise.yml, Account archiving section.
**Caption hint**: Archived items list with from / subject / received columns.
**Suggestion**: The archive browser with a restore action visible, ideally with a mix of single-message and whole-folder restore candidates.

### S-ent-ai
**Page**: enterprise.yml, AI-assisted spam filtering section.
**Caption hint**: AI Model object configured with a hosted endpoint, used in a Sieve script.
**Suggestion**: AI model config + a small Sieve snippet calling it (could be split: screenshot of the model, code block of the Sieve call, or both as separate visuals). The schema allows `kind: code` on this page.

## Pending diagram specs

These should live as Astro components in `src/components/` and be registered
in [src/lib/diagrams.ts](src/lib/diagrams.ts) so they can be referenced from
YAML as `kind: diagram, id: <name>`. Use design tokens, not hard-coded colours.

### D-home-security
**Page**: home.yml, Enhanced security section.
**Idea**: A single stack image showing encryption-at-rest (mailbox layer) under transport security (DANE / MTA-STS / TLS-RPT) under ACME-managed TLS at the top, with a lock icon at each layer.

### D-home-spam-pipeline
**Page**: home.yml, Defence built in section.
**Idea**: Anti-spam scoring pipeline: incoming message -> DMARC/SPF/DKIM/ARC checks + statistical classifier + DNSBL + LLM (optional) -> single score -> reject / quarantine / inbox outcomes.

### D-cluster
**Used by**: home.yml Built to scale, architecture.yml High availability.
**Idea**: Multiple Stalwart nodes in a mesh, each serving every protocol, sharing one distributed data store and one blob store. No external coordinator. Optional dedicated outbound MTA role on one node.
**Note**: A single component can serve both placements (just re-reference the same id from both YAMLs once registered).

### D-jmap
**Page**: mail-server.yml, JMAP section.
**Idea**: Either (a) JMAP HTTP request/response with a parallel WebSocket push channel, annotated with `Mailbox/get`, `Email/changes`, `StateChange`; or (b) two columns "old IMAP poll loop" vs "new JMAP single round-trip + push" for contrast.

### D-autoconfig
**Page**: mail-server.yml, Autoconfig and Autodiscover section.
**Idea**: A client probing `autoconfig.example.com`, `autodiscover.example.com` and the SRV records, getting back IMAP/SMTP/CalDAV/CardDAV settings.

### D-smtp-pipeline
**Page**: mta.yml, Filter pipeline section. Could also be reused on anti-spam.yml Upstream filters with a small variation.
**Idea**: Horizontal SMTP stages (connect / EHLO / AUTH / MAIL / RCPT / DATA), each with the four processors (Sieve, milter, MTA Hooks, built-in filter) attached as parallel processors at the relevant stages.

### D-mta-cluster
**Page**: mta.yml, High availability section.
**Idea**: Distributed SMTP queue spanning multiple Stalwart nodes; any node can take over delivery for any message; dedicated outbound nodes optional.
**Note**: Could be a variant of D-cluster focused on the queue rather than the storage layer.

### D-classifier
**Page**: anti-spam.yml, Statistical classifier section.
**Idea**: Input message -> tokeniser -> feature hash -> FTRL weights -> score, with a feedback loop arrow back from "user marks as spam/ham".

### D-phishing
**Page**: anti-spam.yml, Phishing protection section.
**Idea**: Three lanes (homograph URL, sender spoof, lookalike domain) feeding a combined score; a separate trusted-reply lane subtracting from it.

### D-upstream-filters
**Page**: anti-spam.yml, Upstream filters section.
**Idea**: Built-in filter pipeline with side-arrows to optional Rspamd / SpamAssassin / ClamAV via milter and MTA Hooks. Could share a base with D-smtp-pipeline if scoped well.

### D-itip-imip
**Page**: collaboration.yml, Scheduling section.
**Idea**: Organiser -> Stalwart scheduler, fan-out to two outputs (internal CalDAV peers via iTIP, external attendees via iMIP over email), reply path collected back to organiser's calendar.

### D-valarm-email
**Page**: collaboration.yml, Notifications section.
**Idea**: VEVENT with VALARM trigger -> server-side email reminder fired independently of the client app's state.

### D-read-replicas
**Page**: enterprise.yml, Read replicas section.
**Idea**: Primary data store + N read replicas + sharded blob storage + sharded in-memory shards, with read traffic routed to replicas while writes go to the primary.

### D-architecture
**Page**: architecture.yml, hero.
**Idea**: Layered Stalwart architecture (ingress listeners on top, core protocol handlers in the middle, pluggable storage / search / directory / DNS / blob backends underneath). The previous `architecture` component was on this slot; a redesign can take its place.

### D-managed-cluster
**Page**: managed-email.yml, Architecture section.
**Idea**: Managed Stalwart cluster (multiple nodes per tenant, replicated data + sharded blob, dedicated outbound MTA role, ACME-managed TLS). Can share visual language with D-cluster.

### D-migration
**Page**: migration.yml, Tooling section.
**Idea**: Source servers (Postfix, Cyrus, Exchange, ...) -> migration CLI -> JMAP -> Stalwart cluster, with arrows annotated by the protocol used to read each source (IMAP / CalDAV / on-disk).
