# Marketing visuals audit

Working doc tracking the screenshot and diagram state for every visual slot
under `src/content/pages`. Each row in the status table is one slot in one
page; status is one of:

```
[OK]  visual in place (screenshot or code), fits the section, no duplicate
[P]   placeholder, awaiting a decision
```

Placeholders now have concrete alternative proposals further down. Every
proposal is one of:

```
(D)  hand-author an SVG diagram as an Astro component, register in src/lib/diagrams.ts
(M)  hand-author an SVG "mock UI" component (an idealised, on-brand
     rendering of a WebUI surface; cleaner than a real screenshot)
(C)  ship as a `kind: code` block (immediate, but flat for marketing
     unless the language is itself visually rich; treated as a fallback)
(X)  drop the visual entirely, change `kind: feature` to `kind: list` so the
     section reads without an empty visual slot
```

JSON configuration dumps don't carry their weight on a marketing page; for
sections where the underlying object is just a form, the visual proposal
leads with a diagram or mock and treats the JSON as a fallback only. Sieve,
iCalendar, vCard and PROPFIND examples carry real signal (they look like
their domain) and are kept as primary options where they fit.

## Asset inventory

### Screenshots in `public/images/webadmin/` referenced by marketing pages

```
accounts-list.png          mail-server.yml multi-tenancy
calendar-edit.png          collaboration.yml hero
calendar-share.png         collaboration.yml sharing
dashboard-connections.png  mail-server.yml hero
dashboard-delivery.png     home.yml hero, mta.yml hero       <-- shared by two pages
dashboard-performance.png  enterprise.yml hero
dashboard-security.png     anti-spam.yml hero
dashboard-security-home.png home.yml defence built in
dashboard-storage.png      home.yml backends
delivery-test-trace.png    mta.yml transport security
dmarc-report-detail.png    mta.yml sender authentication
dmarc-reports-list.png     anti-spam.yml DMARC
live-tracing.png           mta.yml web admin, enterprise.yml live telemetry  <-- shared
log-viewer.png             (orphan; no longer referenced)
masked-email.png           enterprise.yml masked email
network-settings.png       mail-server.yml web admin
queue-delivery-detail.png  mta.yml virtual queues
tasks-scheduled.png        mail-server.yml DKIM rotation
```

### Files in `public/images/webadmin/` not currently referenced by marketing pages

```
account-settings.png       (referenced by v0.15 docs)
dashboard-network.png      (replaced by dashboard-connections.png)
dashboard-overview.png     (orphan after home hero swap to dashboard-delivery)
delivery-trace.png         (referenced by v0.15 docs)
dmarc-report.png           (referenced by v0.15 docs)
edit-user.png              (referenced by v0.15 docs)
log-viewer.png             (orphan after mta web admin swap to live-tracing)
tasks.png                  (referenced by v0.15 docs)
```

## Status by page

```
home.yml
  H. Hero ............................. [OK]  dashboard-delivery.png
  3. Enhanced security ................ [P]   see P-home-security
  4. Backends adapt ................... [OK]  dashboard-storage.png
  5. Unified collaboration ............ [P]   see P-home-collab
  6. Defence built in ................. [OK]  dashboard-security-home.png
  7. Built to scale ................... [P]   see P-cluster

mail-server.yml
  H. Hero ............................. [OK]  dashboard-connections.png
  1. JMAP ............................. [P]   see P-jmap
  2. IMAP and POP3 .................... [P]   see P-imap
  3. Automated DNS .................... [P]   see P-dns
  4. Automated DKIM rotation .......... [OK]  tasks-scheduled.png
  5. ACME and TLS ..................... [P]   see P-acme
  6. Autoconfig and Autodiscover ...... [P]   see P-autoconfig
  7. Multi-tenancy and quotas ......... [OK]  accounts-list.png
  8. Sieve scripting .................. [P]   see P-sieve
  9. Web admin ........................ [OK]  network-settings.png

mta.yml
  H. Hero ............................. [OK]  dashboard-delivery.png
  1. Sender authentication ............ [OK]  dmarc-report-detail.png
  2. Transport security ............... [OK]  delivery-test-trace.png
  3. Distributed virtual queues ....... [OK]  queue-delivery-detail.png
  4. Filter pipeline .................. [P]   see P-smtp-pipeline
  5. Envelope and message rewriting ... [P]   see P-rewrite
  6. Web admin ........................ [OK]  live-tracing.png
  7. High availability ................ [P]   see P-mta-cluster

anti-spam.yml
  H. Hero ............................. [OK]  dashboard-security.png
  1. Statistical classifier ........... [P]   see P-classifier
  2. LLM-driven analysis .............. [P]   see P-llm
  3. DNSBL and Pyzor .................. [P]   see P-dnsbl
  4. DMARC, SPF, DKIM, ARC ............ [OK]  dmarc-reports-list.png
  5. Phishing protection .............. [P]   see P-phishing
  6. Sender reputation ................ [P]   see P-reputation
  7. ASN and country blocking ......... [P]   see P-asn
  8. Auto-banning ..................... [P]   see P-autoban
  9. Upstream filters ................. [P]   see P-upstream-filters

collaboration.yml
  H. Hero ............................. [OK]  calendar-edit.png
  1. Calendars ........................ [P]   see P-collab-calendars
  2. Scheduling ....................... [P]   see P-itip-imip
  3. Contacts ......................... [P]   see P-collab-contacts
  4. File storage ..................... [P]   see P-collab-files
  5. Sharing .......................... [OK]  calendar-share.png
  6. Notifications .................... [P]   see P-valarm-email

enterprise.yml
  H. Hero ............................. [OK]  dashboard-performance.png
  1. Multi-tenancy .................... [P]   see P-tenants
  2. Branding ......................... [P]   see P-branding
  3. Account archiving ................ [P]   see P-archive
  4. Live telemetry ................... [OK]  live-tracing.png
  5. AI-assisted spam filtering ....... [P]   see P-ent-ai
  6. Masked email ..................... [OK]  masked-email.png
  7. Read replicas .................... [P]   see P-read-replicas

architecture.yml
  H. Hero ............................. [P]   see P-architecture
  2. High availability ................ [P]   see P-cluster (shared)

managed-email.yml
  4. Architecture ..................... [P]   see P-managed-cluster

migration.yml
  3. Tooling .......................... [P]   see P-migration
```

Totals
```
[OK]  19 slots resolved
[P]   27 slots awaiting a decision (see proposals below)
      ----
      46 slots
```

## Pending visuals: alternatives

For each pending slot, the proposal lists 1-3 ranked alternatives. The
**first** in each entry is the recommended path. Pick the letter (`(C)`
code, `(D)` SVG diagram component, `(M)` SVG mock component, `(X)` drop)
inline next to each entry to converge on a plan.

---

### P-home-security (home.yml line 119)
**Section**: Enhanced security. **Currently**: placeholder for diagram.

- **(D) Security stack diagram** — three-layer SVG: encryption-at-rest (mailbox layer) at the bottom, transport security (DANE / MTA-STS / TLS-RPT) in the middle, ACME-managed TLS at the top. A small lock icon at each layer, brand-coloured.
- (D) Variant: side-by-side "wire" and "store" lockups, showing the message encrypted on the wire and again at rest.
- (X) Drop and switch to `kind: list` so the section reads as a clean bullet list without an empty visual slot.

### P-home-collab (home.yml line 162)
**Section**: Unified collaboration. **Currently**: placeholder for screenshot.

- **(D) Single-identity diagram** — one user/identity circle in the centre, four protocol pillars around it (Mail, Calendar, Contacts, Files) all sharing the same auth and quota base layer. Reinforces the "one identity / one quota / one backup" line in the body.
- (M) Mock collage: three small framed UI panels (calendars / contacts / files) clipped together; lighter touch than a real screenshot.
- (X) Drop and switch to `kind: list`.

### P-cluster (home.yml line 209, architecture.yml line 62)
**Section**: Built to scale (home), High availability (architecture). **Currently**: placeholder for diagram.

- **(D) Cluster topology** — single Astro component, registered as `cluster`, reused on both pages. Multiple Stalwart nodes in a mesh, each labelled with the protocols it serves; one shared distributed data store + blob store underneath; no external coordinator. A subtle "+ node" arrow at the edge to communicate scaling.
- (D) Variant with a dedicated outbound MTA role on one node, to anchor the shared use with `P-mta-cluster`.

### P-jmap (mail-server.yml line 50)
**Section**: JMAP. **Currently**: placeholder for diagram.

- **(C) Code block** showing a JMAP request and the matching push frame:
  ```yaml
  visual:
    kind: code
    lang: json
    filename: jmap-session.json
    body: |
      // Single round-trip pulls everything new since the last state.
      {
        "using": ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
        "methodCalls": [
          ["Email/changes", { "accountId": "u1", "sinceState": "42" }, "0"],
          ["Email/get",     { "accountId": "u1",
                              "#ids": { "resultOf": "0", "name": "Email/changes", "path": "/created" },
                              "properties": ["subject", "from", "receivedAt"] }, "1"]
        ]
      }
      // Then the WebSocket pushes a single frame when state advances:
      // { "@type": "StateChange", "changed": { "u1": { "Email": "43" } } }
  ```
- (D) JMAP push diagram: client <-> JMAP HTTP endpoint with a parallel WebSocket "StateChange" channel.

### P-imap (mail-server.yml line 71)
**Section**: IMAP and POP3. **Currently**: placeholder for screenshot.

- **(D) Client compatibility grid** — six to eight client tiles (Apple Mail, Outlook, Thunderbird, GNOME Evolution, K-9 Mail, generic iOS/Android) each with a small protocol pill (IMAP4rev2, POP3, ManageSieve). Lines from each tile converge on a Stalwart pill at the bottom. Sells "no client left behind" at a glance.
- (D) Protocol bridge: a vertical Stalwart pillar in the middle, clients on the left, mail store on the right; horizontal arrows for IMAP / IMAPS / POP3 / STLS labelled with their RFC numbers. More technical-evaluator friendly.
- (C) `NetworkListener` JSON as a last-resort fallback (kept because the schema accepts `kind: code`):
  ```json
  {
    "name": "IMAP4 over TLS",
    "bind": ["[::]:993"],
    "protocol": "Imap",
    "useTls": true,
    "tlsImplicit": true
  }
  ```
- (X) Drop.

### P-dns (mail-server.yml line 92)
**Section**: Automated DNS. **Currently**: placeholder for screenshot.

- **(D) "Records published" tile** — a stylised mini zone file as SVG: a column of `MX`, `SPF`, `DKIM`, `DMARC`, `TLSA`, `MTA-STS`, `TLS-RPT`, `CAA`, `autoconfig`, `autodiscover` rows, each with a small green check pill labelled "managed". The list visually anchors what "automated DNS" actually means. A subtle Stalwart logo in the corner ties it to the product.
- (D) Provider fan-out: Stalwart in the centre, arrows pulsing out to Cloudflare / Route 53 / Google Cloud DNS / DigitalOcean / OVH provider logos, plus a dynamic-DNS arrow with `TSIG / SIG(0)` for self-hosted authoritative servers.
- (D) Before/after split: chaotic hand-edited zone on the left ("DKIM key was rotated, did anyone update DNS?"), tidy reconciled zone on the right with a "managed by Stalwart" header.
- (C) `Domain` JSON fallback:
  ```json
  {
    "name": "example.com",
    "dnsManagement": {
      "@type": "Automatic",
      "dnsServerId": "dns-cloudflare",
      "publishRecords": [
        "mx","spf","dkim","dmarc","tlsa",
        "mtaSts","tlsRpt","caa",
        "autoConfig","autoConfigLegacy","autoDiscover"
      ]
    }
  }
  ```

### P-acme (mail-server.yml line 138)
**Section**: ACME and TLS. **Currently**: placeholder for screenshot.

- **(D) Certificate lifecycle ring** — a circular timeline (or dial) marked at `issued` -> `60d` -> `30d (renewal triggered)` -> `renewed` -> `published` -> `TLSA refreshed` -> back to `issued`. The visual loops, conveying "no manual step ever required". Pair with a subtle background of stacked certs ticking through the cycle.
- (D) "Ten-year uptime" timeline — horizontal timeline with cert chevrons, each replaced before expiry; an annotation marks `0 expiry-related outages` at the right. Sells the operational pitch.
- (D) ACME order flow: challenge issued -> CA validates -> cert returned -> TLSA record refreshed -> served. Useful for the technical evaluator.
- (C) `AcmeProvider` JSON fallback:
  ```json
  {
    "name": "letsencrypt",
    "directory": "https://acme-v02.api.letsencrypt.org/directory",
    "challengeType": "Tls-Alpn-01",
    "contact": ["admin@example.com"],
    "renewBefore": "30d"
  }
  ```

### P-autoconfig (mail-server.yml line 162)
**Section**: Autoconfig and Autodiscover. **Currently**: placeholder for screenshot.

- **(D) Phone-screen mock** — a stylised smartphone frame with the "Add account" sheet showing only the email/password fields (no host/port). A tiny progress-tick beside the email field reads `Found settings for example.com`. Communicates the outcome ("client just works") without showing config.
- (D) Probe-and-response flow: client device on the left, three labelled probe arrows reaching out for `autoconfig.<domain>/...`, `autodiscover.<domain>/...` and `_imaps._tcp.<domain>` SRV; one return arrow carries "IMAP / SMTP / CalDAV / CardDAV settings". Three probes, one good answer.
- (D) Format coverage tile: three rows for Mozilla Autoconfig (Thunderbird logo), Microsoft Autodiscover v1+v2 (Outlook logo), modern UA Autoconfig (generic phone), each with a green check. Sells the "old and new clients both covered" line.
- (C) Autoconfig XML response fallback (it does look like its domain, but the body is long):
  ```xml
  <clientConfig version="1.1">
    <emailProvider id="example.com">
      <incomingServer type="imap">
        <hostname>mail.example.com</hostname><port>993</port>
        <socketType>SSL</socketType>
        <authentication>password-cleartext</authentication>
      </incomingServer>
      <outgoingServer type="smtp">...</outgoingServer>
    </emailProvider>
  </clientConfig>
  ```

### P-sieve (mail-server.yml line 203)
**Section**: Sieve scripting. **Currently**: placeholder for screenshot.

- **(C) Sieve code block** — Sieve scripts are themselves visually distinctive (the syntax reads like an English ruleset and we have `lang: sieve` aliased), so this is one of the few cases where a code block carries marketing weight on its own:
  ```yaml
  visual:
    kind: code
    lang: sieve
    filename: filter.sieve
    body: |
      require ["fileinto", "imap4flags", "vacation", "envelope"];

      # Newsletters land in their own folder.
      if header :contains "List-Id" "@" {
        fileinto "INBOX/Newsletters";
        stop;
      }

      # Tag and route alerts from monitoring.
      if envelope :is "from" "alerts@monitoring.example.com" {
        addflag "\\Flagged";
        fileinto "INBOX/Alerts";
        stop;
      }

      # Out-of-office reply, once per sender per week.
      vacation :days 7
        "I am away until Monday. Will reply on return.";
  ```
- (D) "Trusted vs sandboxed" diagram: split panel showing a user script in a sandbox box (no IP banning, no envelope rewriting) next to an admin trusted script wired into SMTP stages with elevated permissions. Sells the two-tier execution story.

### P-smtp-pipeline (mta.yml line 131)
**Section**: Filter pipeline. **Currently**: placeholder for diagram.

- **(D) SMTP stages diagram** — horizontal flow: `connect -> EHLO -> AUTH -> MAIL -> RCPT -> DATA`. Under each stage, a stack of four processor pills (Sieve, milter, MTA Hooks, built-in filter), with the ones that fire at that stage filled in and the rest dimmed. Visually communicates "every stage is programmable".
- (C) Sieve snippet hooked into a `mail` stage:
  ```yaml
  visual:
    kind: code
    lang: sieve
    filename: smtp-filter.sieve
    body: |
      require ["envelope", "reject", "expressions", "extlists"];

      # Reject envelope-from with no rDNS at MAIL FROM.
      if eval "iprev.result != 'pass'" {
        reject "451 4.7.25 No reverse DNS for connecting IP.";
      }

      # Hand the message to Rspamd (configured as a milter) at DATA time.
      if envelope :is "to" "@example.com" {
        # built-in filter + milter both run; combined score decides outcome.
      }
  ```

### P-rewrite (mta.yml line 153)
**Section**: Envelope and message rewriting. **Currently**: placeholder for screenshot.

- **(D) Before/after envelope diagram** — message envelope on the left with `From: alice@old.example.com` / `Subject: ...` / no disclaimer / `Attachment: invoice.exe`; an arrow through a "Stalwart filter" pill in the middle; envelope on the right with `From: alice@new.example.com`, an `X-Disclaimer` header chip glowing, and the executable attachment crossed out. Visual immediately tells the policy-enforcement story.
- (D) Stage-tagged rule strip: the SMTP stages from `P-smtp-pipeline` with three small rule cards (header rewrite, address rewrite, attachment strip) hovering above the stages they fire at.
- (C) Sieve script fallback (works in this slot because Sieve syntax is itself recognisable):
  ```yaml
  visual:
    kind: code
    lang: sieve
    filename: rewrite.sieve
    body: |
      require ["editheader", "envelope", "variables"];

      # Append a compliance disclaimer to outbound mail.
      if envelope :matches "from" "*@example.com" {
        addheader :last "X-Disclaimer"
          "Confidential. See https://example.com/legal";
      }

      # Normalise legacy domain in envelope-from.
      if envelope :is "from" "*@old.example.com" {
        set :localpart "addr" "${envelope.from}";
        redirect "${addr}@new.example.com";
      }
  ```

### P-mta-cluster (mta.yml line 196)
**Section**: High availability. **Currently**: placeholder for diagram.

- **(D) Distributed-queue diagram** — variant of the shared `cluster` component focused on the SMTP queue: shared queue store in the centre, multiple Stalwart nodes each pulling work, one node down (greyed) without any messages stranded, optional dedicated outbound nodes off to one side.
- Could be the same Astro component as `P-cluster` with a different prop / layer, or a dedicated component sharing the same node + storage primitives.

### P-classifier (anti-spam.yml line 51)
**Section**: Statistical classifier. **Currently**: placeholder for diagram.

- **(D) FTRL pipeline diagram** — input message -> tokeniser -> feature hash -> sparse weights -> score, with a feedback loop arrow back from a small "user marks as spam/ham" icon. Address-book lane joining as a "known correspondent" pre-classification arrow.
- (C) Configuration snippet showing the `SpamClassifier` object:
  ```yaml
  visual:
    kind: code
    lang: json
    filename: SpamClassifier
    body: |
      {
        "model": "FtrlProximal",
        "alpha": 0.1,
        "l1Ratio": 0.001,
        "l2Ratio": 0.0001,
        "numFeatures": 524288,
        "featureL2Normalize": true,
        "featureLogScale": true,
        "trainFrequency": "1h",
        "minHamSamples": 100,
        "minSpamSamples": 100,
        "reservoirCapacity": 10000,
        "holdSamplesFor": "30d",
        "learnHamFromCard": true,
        "learnHamFromReply": true,
        "learnSpamFromRblHits": true,
        "learnSpamFromTraps": true
      }
  ```

### P-llm (anti-spam.yml line 74)
**Section**: LLM-driven analysis. **Currently**: placeholder for screenshot.

- **(D) "Uncertain to LLM" decision diagram** — incoming messages enter a classifier box; "high-confidence ham" and "high-confidence spam" exit straight to inbox/reject; "uncertain" branches into an LLM endpoint card showing OpenAI / Anthropic / self-hosted Llama logos as supported providers; the LLM's verdict feeds back into the score. Pulses on the uncertain branch.
- (D) Verdict mock card: a stylised AI-analysis result tile, e.g. `Verdict: phishing-suspected` `Confidence: 0.94` `Why: lookalike domain + invoice urgency`. Looks like a forensic readout an evaluator would want.
- (D) "Bring your own model" tile: stack of provider logos (OpenAI, Anthropic, vLLM, LocalAI, generic OpenAI-compatible) all flowing through a single Stalwart endpoint badge. Pairs well with `P-ent-ai`.
- (C) Sieve fallback (similarly recognisable as `P-sieve`):
  ```yaml
  visual:
    kind: code
    lang: sieve
    filename: ai-classify.sieve
    body: |
      require ["spamfilter", "expressions", "imap4flags"];

      # Hand uncertain messages to the LLM for a second opinion.
      if eval "spam.score > -1.0 && spam.score < 1.0" {
        if eval "ai.classify('llama-3.1-8b',
                              'Reply phishing/legit/promo: '
                                + headers.subject + '\n\n' + body.text)
                  == 'phishing'" {
          addflag "\\Junk";
          addheader "X-Stalwart-AI" "phishing-suspected";
        }
      }
  ```

### P-dnsbl (anti-spam.yml line 96)
**Section**: DNSBL and Pyzor. **Currently**: placeholder for screenshot.

- **(D) Multi-source query fan-in** — incoming message at the top, four parallel arrows fanning out to provider chips (Spamhaus ZEN, SURBL, Spamhaus DBL, Pyzor), responses converging into a single score badge at the bottom. Each arrow tagged with what it queries (IP, URL, domain, content hash). Sells the "many sources, one decision" story.
- (D) Forensic-style "hits per source" readout for one example message: an envelope on the left, three small chips on the right showing `Spamhaus-ZEN: hit (IP)`, `SURBL: hit (URL in body)`, `Pyzor: hit (digest)`, with a final score chip. Looks like the kind of debug pane an operator would screenshot.
- (D) Pyzor collaborative network: stylised globe with dotted nodes representing public Pyzor contributors, lines pulsing as digests are shared.
- (C) `SpamDnsblServer` JSON fallback:
  ```json
  [
    {"@type":"Ip",     "name":"spamhaus-zen", "zone":"zen.spamhaus.org", "tag":"RBL_SPAMHAUS"},
    {"@type":"Url",    "name":"surbl-multi",  "zone":"multi.surbl.org",  "tag":"RBL_SURBL"},
    {"@type":"Domain", "name":"spamhaus-dbl", "zone":"dbl.spamhaus.org", "tag":"RBL_DBL"}
  ]
  ```

### P-phishing (anti-spam.yml line 141)
**Section**: Phishing protection. **Currently**: placeholder for diagram.

- **(D) Phishing axes diagram** — three lanes feeding a central score: "homograph URL", "sender spoof", "lookalike domain". A separate "trusted reply" lane subtracts. Each lane labelled with one concrete example (e.g. `paypaр.com` for homograph, `chase-banking.example.com` for lookalike).
- (M) Annotated phishing email mock: a fake email with three callout pills pointing at the suspicious bits.

### P-reputation (anti-spam.yml line 166)
**Section**: Sender reputation. **Currently**: placeholder for screenshot.

- **(M) SVG mock of the reputation table** — five rows with stylised IP / ASN / domain / email columns, score bar + "ham/spam leaning" pill. Same chrome as `BrowserFrame` so it sits next to real screenshots without looking out of place.
- (D) Four-axis reputation diagram (IP / ASN / domain / email), each as a "scale" pulling toward ham or spam.
- (X) Drop and switch to `kind: list`.

### P-asn (anti-spam.yml line 184)
**Section**: ASN and country blocking. **Currently**: placeholder for screenshot.

- **(D) World map SVG** with a few countries highlighted as blocked (use the existing world-map asset if there is one, otherwise a simplified equirectangular outline). Labels for "block / score / log" modes.
- (C) `SpamRule` JSON fallback (the `asn`/`country` expression syntax needs to be confirmed against the docs before this lands; shape only):
  ```json
  [
    {"name":"block-known-spam-asn",     "priority":100, "condition":"asn == 199524 || asn == 208046", "tag":"BLOCKED_ASN"},
    {"name":"score-high-risk-country",  "priority":90,  "condition":"country in ['CN','RU']",          "tag":"HIGH_RISK_COUNTRY"}
  ]
  ```

### P-autoban (anti-spam.yml line 211)
**Section**: Auto-banning. **Currently**: placeholder for screenshot.

- **(D) Four-category gauges** — four small radial gauges side by side: `auth-failure`, `abuse`, `loiter`, `scan`. Each fills toward its threshold; one gauge hits its limit, an arrow shoots from it to a stylised "banned IP" chip below. Visual encodes the four-axis tracking and the threshold mechanism in one image.
- (D) Attack-and-ban timeline: vertical timeline of one IP's events: 5 failed auths in 10 min -> red "BAN" pulse -> silence for 24h. Pairs with the brute-force narrative.
- (M) Stylised live ban list mock: WebUI-frame mock with five rows showing reason badges (auth / abuse / loiter / scan), source IP, and a remaining-time pill. Cleaner and more on-brand than a real screenshot.
- (C) `Security` JSON fallback:
  ```json
  {
    "authBanRate":    {"count": 5,  "period": "10m"}, "authBanPeriod":  "24h",
    "abuseBanRate":   {"count": 50, "period": "5m"},  "abuseBanPeriod": "12h",
    "loiterBanRate":  {"count": 3,  "period": "30s"}, "loiterBanPeriod": "1h",
    "scanBanRate":    {"count": 10, "period": "1m"},  "scanBanPeriod":  "7d"
  }
  ```

### P-upstream-filters (anti-spam.yml line 228)
**Section**: Upstream filters. **Currently**: placeholder for diagram.

- **(D) Filter chain diagram** — built-in filter pipeline as the spine; side arrows to optional Rspamd / SpamAssassin / ClamAV through `milter`, plus a parallel HTTP arrow through MTA Hooks. Reuse the `P-smtp-pipeline` SMTP stage rail as the base if both diagrams ship; otherwise standalone.
- (C) `MtaMilter` + `MtaHook` JSON fallback:
  ```jsonc
  // MtaMilter (Rspamd over the milter protocol)
  { "name":"rspamd", "hostname":"rspamd.internal", "port":11332,
    "stages":["Data"], "tempFailOnError":true }

  // MtaHook (HTTP + JSON filter, Bearer auth)
  { "name":"virus-scan", "url":"https://av.internal/scan", "stages":["Data"],
    "httpAuth":{"@type":"Bearer","bearerToken":{"@type":"Value","secret":"$AV_TOKEN"}} }
  ```

### P-collab-calendars (collaboration.yml line 50)
**Section**: Calendars. **Currently**: placeholder for screenshot.

- **(M) SVG calendar grid mock** — a stylised week view with three colour-coded events; not a real client capture, but visually clearly "a calendar".
- (X) Drop and switch to `kind: list`. The page already opens with the calendar settings hero; a second calendar visual one section down may be redundant.

### P-itip-imip (collaboration.yml line 75)
**Section**: Scheduling. **Currently**: placeholder for diagram.

- **(D) iTIP/iMIP fan-out diagram** — organiser node -> Stalwart scheduler -> two paths: "internal CalDAV peers (iTIP)" and "external attendees (iMIP via email)". Reply path collected back to organiser's calendar.
- (C) iCalendar VEVENT body:
  ```yaml
  visual:
    kind: code
    lang: text
    filename: meeting.ics
    body: |
      BEGIN:VCALENDAR
      VERSION:2.0
      METHOD:REQUEST
      BEGIN:VEVENT
      UID:42-2026@example.com
      DTSTART:20260520T100000Z
      DTEND:20260520T110000Z
      ORGANIZER:mailto:alice@example.com
      ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:bob@example.com
      ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:carol@example.org
      SUMMARY:Quarterly review
      END:VEVENT
      END:VCALENDAR
  ```

### P-collab-contacts (collaboration.yml line 98)
**Section**: Contacts. **Currently**: placeholder for screenshot.

- **(D) Multi-device sync visual** — one stylised contact card in the centre (avatar + name + email + phone), arrows to four device frames around it (laptop, iPhone, Android, web client). Arrows are labelled `CardDAV` and `JMAP for Contacts`. A small annotation tags Stalwart as the source of truth. Sells "in step across every device" directly.
- (D) Address-book signal loop: contact card on the left, an arrow into the spam classifier on the right with a label `weighted -2.0 toward ham`, plus a second arrow into the calendar scheduler with `pre-filled attendees`. Communicates the "address book pays off elsewhere" body line.
- (M) WebUI-frame mock of the address book: avatar / name / email columns, two contacts with a `Shared with team-sales` badge.
- (C) vCard 4.0 fallback (visually distinct as a recognisable standard format):
  ```yaml
  visual:
    kind: code
    lang: text
    filename: alice.vcf
    body: |
      BEGIN:VCARD
      VERSION:4.0
      FN:Alice Example
      ORG:Example Corp;Engineering
      EMAIL;TYPE=work;PREF=1:alice@example.com
      TEL;TYPE="cell,voice";VALUE=uri:tel:+1-555-0101
      ADR;TYPE=work:;;1 Example Way;Springfield;OR;97477;US
      END:VCARD
  ```

### P-collab-files (collaboration.yml line 122)
**Section**: File storage. **Currently**: placeholder for screenshot.

- **(M) SVG file-browser mock** — left rail with a folder tree (`Inbox / Calendars / Files / Shared with me`), main pane with five rows (folder + four files with size and modified columns), a quota bar at the bottom showing `2.1 GB of 5 GB` (the same quota the mailbox uses, which is the section's pitch). Looks like a real file UI without committing to a specific brand.
- (D) Unified-quota visual: a horizontal quota bar split into two stacked segments labelled `Mail (1.6 GB)` and `Files (0.5 GB)`, with the cap on the right. Drives home "the same quota that caps a mailbox caps its files".
- (D) Share-permissions overlay: one folder card in the centre, three principal chips below it with `Read / Write / Manage` toggles next to each, communicating ACL granularity.
- (C) WebDAV PROPFIND XML fallback (still recognisable as a standards-compliant surface):
  ```yaml
  visual:
    kind: code
    lang: xml
    filename: PROPFIND /files/alice/
    body: |
      <D:multistatus xmlns:D="DAV:">
        <D:response>
          <D:href>/files/alice/Reports/Q1.pdf</D:href>
          <D:propstat><D:prop>
            <D:displayname>Q1.pdf</D:displayname>
            <D:getcontentlength>183271</D:getcontentlength>
            <D:getcontenttype>application/pdf</D:getcontenttype>
          </D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat>
        </D:response>
      </D:multistatus>
  ```

### P-valarm-email (collaboration.yml line 165)
**Section**: Notifications. **Currently**: placeholder for diagram.

- **(D) VALARM email path diagram** — small VEVENT box with a VALARM trigger, a server icon catching the trigger, and an envelope leaving for the attendee. Annotation: "fires from the server, even if the calendar app is closed".
- (C) VALARM excerpt:
  ```yaml
  visual:
    kind: code
    lang: text
    filename: reminder.ics
    body: |
      BEGIN:VEVENT
      UID:42-2026@example.com
      DTSTART:20260520T100000Z
      SUMMARY:Quarterly review
      BEGIN:VALARM
      ACTION:EMAIL
      TRIGGER:-PT15M
      ATTENDEE:mailto:bob@example.com
      SUMMARY:Reminder: Quarterly review starts in 15 minutes
      DESCRIPTION:Conference room B; agenda attached.
      END:VALARM
      END:VEVENT
  ```

### P-tenants (enterprise.yml line 56)
**Section**: Multi-tenancy. **Currently**: placeholder for screenshot.

- **(M) SVG tenants mock** — three tenant rows with quota bars (disk + principal count) and a directory backend pill (LDAP / OIDC / internal). Same `BrowserFrame` chrome so it reads as part of the WebUI.
- (D) Isolation diagram: shared infrastructure with three sealed tenant compartments, each carrying its own identity backend.
- (X) Drop and switch to `kind: list`.

### P-branding (enterprise.yml line 76)
**Section**: Branding. **Currently**: placeholder for screenshot.

- **(M) SVG side-by-side mock** — two miniature WebUI panes, each with a different placeholder logo and accent colour, one under `acme.com`, one under `globex.com`. Cleanest way to show the white-label story without two real branded captures.
- (X) Drop and switch to `kind: list`.

### P-archive (enterprise.yml line 100)
**Section**: Account archiving. **Currently**: placeholder for screenshot.

- **(D) "Archive vs restore-from-backup" comparison** — two columns: "Restore from backup" (large clock icon, multi-step list: locate tape -> restore N hours -> mount -> extract one mailbox), versus "Restore from archive" (small clock, single step: select message -> restore). Drives home the operational pain solved.
- (D) Time-travel scrubber: a horizontal timeline with a sliding marker; archived items appear/disappear as the marker moves through the retention window. Could animate.
- (M) SVG archived-items mock: WebUI-frame mock with three rows (from / subject / received / `Restore` pill), one selected, plus a `Restore selected` button at the top.
- (C) CLI fallback (visually OK because terminal output reads as forensic):
  ```yaml
  visual:
    kind: code
    lang: bash
    filename: restore.sh
    body: |
      # Restore one user's deleted mail from the last 7 days.
      stalwart-cli archive restore \
        --account alice@example.com \
        --since 7d

      # Restore a single message by archive ID.
      stalwart-cli archive restore \
        --message-id 01HZ4N9P5K7QJYD0VG3R8X2WBC
  ```

### P-ent-ai (enterprise.yml line 154)
**Section**: AI-assisted spam filtering. **Currently**: placeholder for screenshot.

- **(D) "Bring your own model"** — a row of provider logos (OpenAI, Anthropic, vLLM, LocalAI, "any OpenAI-compatible") all flowing into a single Stalwart endpoint badge labelled `OpenAI-compatible`. Two arrows leave the badge: one into the spam classifier (auto-call on uncertain), one into a Sieve script icon (operator call). Sells two stories at once: provider portability and the dual integration surface.
- (D) Decision diagram (shared with `P-llm`): classifier -> uncertain branch -> LLM endpoint -> verdict feeds back. If both pages share the same component, register as one diagram and reference it from both YAMLs.
- (D) Sieve loop visual: a Sieve script card on the left hands a question to an `AiModel` card on the right, the answer comes back as a tag the script then routes on. Clean and on-brand.
- (C) `AiModel` JSON fallback:
  ```json
  {
    "name": "local-llama",
    "url": "https://llm.internal/v1",
    "model": "llama-3.1-70b-instruct",
    "modelType": "Chat",
    "temperature": 0.3,
    "timeout": "8s",
    "httpAuth": {
      "@type": "Bearer",
      "bearerToken": {"@type":"Value","secret":"$LLM_TOKEN"}
    }
  }
  ```

### P-read-replicas (enterprise.yml line 199)
**Section**: Read replicas and sharded storage. **Currently**: placeholder for diagram.

- **(D) Replicas + shards diagram** — primary store on the left, two read replicas to its right with "read traffic" arrows; underneath, a sharded blob storage row (3-4 shards) and a sharded in-memory row (3-4 shards). Writes route to the primary, reads fan out.
- (C) Storage config TOML showing `read-replica` and `sharded` blocks side-by-side.

### P-architecture (architecture.yml line 24)
**Section**: Architecture (hero). **Currently**: placeholder for diagram.

- **(D) Layered architecture diagram** — top: ingress listeners (SMTP / IMAP / JMAP / POP3 / CalDAV / CardDAV / WebDAV / ManageSieve). Middle: core protocol handlers + filter pipeline + scheduler. Bottom: pluggable backends (data store / blob / search / directory / DNS / in-memory) drawn as swappable cards. The previous `architecture` Astro component sat in this slot; redesigning it for the current visual language is the minimum lift.
- (D) Variant: exploded-axonometric of the same layers, more "hero" feeling.

### P-managed-cluster (managed-email.yml line 92)
**Section**: Architecture (managed). **Currently**: placeholder for diagram.

- **(D) Managed cluster diagram** — variant of `P-cluster` with operations annotations (provisioning / upgrades / backup / monitoring as labels around the edge), and an explicit dedicated outbound MTA role.
- (D) Region/availability map: managed regions with the data-residency arrow loop ("data stays in the chosen region for the lifetime of the account").

### P-migration (migration.yml line 75)
**Section**: Tooling. **Currently**: placeholder for diagram.

- **(D) Migration flow diagram** — left column source servers (Postfix, Cyrus, Exchange, MDaemon, hMailServer, Courier, Zimbra) each with the protocol Stalwart reads them with (IMAP / CalDAV / on-disk). Middle: migration CLI box with "dry-run / bulk / delta" pills. Right: Stalwart cluster with a JMAP write arrow into it.
- (C) CLI invocation:
  ```yaml
  visual:
    kind: code
    lang: bash
    filename: migrate.sh
    body: |
      # Dry run produces a per-account report (mailbox count, message
      # count, total size, anomalies) without writing anything.
      stalwart-cli migrate \
        --source imap://imap.old.example.com \
        --account alice@example.com \
        --dry-run

      # Bulk pass; resumable.
      stalwart-cli migrate \
        --source imap://imap.old.example.com \
        --accounts-file accounts.csv \
        --parallel 16

      # Final delta after the cutover window opens.
      stalwart-cli migrate \
        --source imap://imap.old.example.com \
        --accounts-file accounts.csv \
        --since 24h
  ```

## Suggested execution order (recommended)

The visuals-first approach trades immediacy for marketing weight. Most of
the pending work is now SVG components rather than YAML edits, so the order
is "build the highest-leverage components first".

1. **Shared diagram components first.** A small set of components covers
   many slots. Build these once, reference from multiple YAMLs:
   - `cluster` (home Built to scale, architecture HA, mta HA, managed
     architecture; 4 slots)
   - `smtp-pipeline` (mta filter pipeline, anti-spam upstream filters; 2
     slots)
   - `llm-decision` (anti-spam LLM, enterprise AI; 2 slots)
   - `dns-fan-out` or `dns-records-tile` (mail-server DNS; 1 slot, but
     thematically reusable on home backends section if needed)

   That covers ~9 slots from 4 components.

2. **Per-page diagrams next**, in priority order by page traffic:
   home (security stack, collab unified), architecture (hero), anti-spam
   (classifier, phishing, dnsbl-fan-in, autoban-gauges, sender-reputation),
   mta (envelope rewrite before/after), mail-server (acme lifecycle,
   autoconfig probe, imap client grid), collaboration (itip-imip,
   contacts-sync, valarm-email), enterprise (read-replicas,
   archive-vs-backup, byo-model), migration (source-to-stalwart flow).

3. **UI mocks** for the remaining surfaces where a stylised SVG reads
   better than either a real screenshot or a diagram: tenants list,
   branding side-by-side, archive list, reputation table, file browser,
   ASN block list (mock or world map).

4. **Code blocks where the language carries marketing weight**: ship
   `Sieve` (P-sieve), `iCalendar` (P-itip-imip), `vCard` (P-collab-contacts),
   `PROPFIND` (P-collab-files), `JMAP JSON` (P-jmap), `Sieve+LLM` (P-llm),
   `CLI` (P-archive, P-migration). These are immediate wins (no component
   work) and the languages themselves look like their domain. They can
   either replace or sit alongside the SVG version (the schema only allows
   one visual per slot, so the choice is per page).

5. **JSON config fallbacks last.** Every `(C) JSON` in this doc is a
   fallback only; reach for them if a section ships before its SVG is ready,
   then swap once the SVG lands.

6. **Open questions to resolve up front.** A few slots still need a call
   between mock and drop: `home-collab`, `collab-calendars`, `tenants`,
   `reputation`, `archive`. Pick a letter on each before drawing.

Mark each entry above with the chosen letter and I will start executing.
