---
sidebar_position: 4
---

# DKIM key rotation

Periodic DKIM key rotation limits the impact of key compromise and is a recommended operational practice for any mail domain that signs outbound messages. When rotation is enabled, the server takes over the full lifecycle of DKIM keys for a domain: generating new keys on schedule, publishing them in DNS ahead of use, switching signing over to the new key, and retiring old keys once they are no longer required for verification of in-flight messages.

Signing of outgoing messages and verification of incoming signatures are not covered on this page. For signing configuration and behaviour see [DKIM signing](/docs/mta/authentication/dkim/sign); for verification of inbound messages see [DKIM verification](/docs/mta/authentication/dkim/verify). The Domain object owns only the rotation side of the lifecycle described below.

## Enabling automatic rotation

Rotation is controlled by the [`dkimManagement`](/docs/ref/object/domain#dkimmanagement) field on the [Domain](/docs/ref/object/domain) object. The `Manual` variant leaves [DkimSignature](/docs/ref/object/dkim-signature) (found in the WebUI under <!-- breadcrumb:DkimSignature --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures<!-- /breadcrumb:DkimSignature -->) objects under the operator's direct control; new keys are not generated and DNS publication is handled as part of manual DNS management. The `Automatic` variant carries the rotation schedule:

- [`algorithms`](/docs/ref/object/domain#algorithms) lists the signing algorithms to use when generating new keys. The default provisions both `Dkim1Ed25519Sha256` and `Dkim1RsaSha256`, so receiving verifiers that do not yet support Ed25519 still find an RSA key.
- [`selectorTemplate`](/docs/ref/object/domain#selectortemplate) produces the DNS selector for each new key. The template supports `{algorithm}`, `{hash}`, `{version}`, `{date-<fmt>}` (with chrono strftime), `{epoch}`, and `{random}`; the default `v{version}-{algorithm}-{date-%Y%m%d}` yields selectors such as `v1-ed25519-20260101`.
- [`rotateAfter`](/docs/ref/object/domain#rotateafter) sets how often a fresh key is generated, defaulting to `90d`.
- [`retireAfter`](/docs/ref/object/domain#retireafter) sets how long the superseded key's DNS record remains published after the cutover, defaulting to `7d`.
- [`deleteAfter`](/docs/ref/object/domain#deleteafter) sets how long the retired key's material is retained on the server before permanent deletion, defaulting to `30d`.

Automatic rotation requires the Domain to have automatic DNS management enabled, since the rotation logic both writes and later removes DKIM DNS records. See [DNS records](/docs/domains/dns-records) for the DNS-side setup.

## Rotation lifecycle

Each [DkimSignature](/docs/ref/object/dkim-signature) carries a [`stage`](/docs/ref/object/dkim-signature#stage) field that tracks its position in the rotation lifecycle, together with a [`nextTransitionAt`](/docs/ref/object/dkim-signature#nexttransitionat) timestamp indicating when the next transition is due. The four stages are:

- **pending**: the key has been generated and is scheduled for DNS publication, but is not yet visible to remote verifiers. Signing continues with the current active key.
- **active**: the key is published in DNS and is used to sign outgoing messages. For each algorithm in [`algorithms`](/docs/ref/object/domain#algorithms), at most one signature is active at a time.
- **retiring**: a newer key has taken over signing, but the DNS record for this key remains published so that messages signed before the cutover still verify. The retiring key no longer signs new messages.
- **retired**: the DNS record has been removed. The key material is still retained on the server for diagnostic purposes until it is permanently deleted.

## Cutover sequence

When the server determines that a rotation is due for a given algorithm, the sequence is:

1. A new DkimSignature is created in the **pending** stage and the corresponding public key is pushed to the DnsServer as part of the domain's managed records.
2. The DnsServer polls until propagation of the new selector is confirmed; the transition from **pending** to **active** is driven by that confirmation, not by a fixed wall-clock delay. Once propagation is observed, the new key transitions to **active** and the previous active key transitions to **retiring**. Signing switches to the new selector at this point.
3. After [`retireAfter`](/docs/ref/object/domain#retireafter) elapses, the retiring key transitions to **retired** and the DNS record for its selector is removed.
4. After [`deleteAfter`](/docs/ref/object/domain#deleteafter) further elapses, the retired DkimSignature is deleted from the store.

The schedule for the next rotation is rearmed from [`rotateAfter`](/docs/ref/object/domain#rotateafter) relative to the activation of the new key.

## Triggering a rotation manually

Rotation runs automatically on the schedule above, but it can also be driven on demand. Rotation is performed by the DKIM management task, which is the `DkimManagement` variant of the [Task](/docs/ref/object/task) object. Triggering the task for a domain evaluates the current keys against the configured schedule and advances any transition that is due (generation, cutover, retirement, and deletion).

Running the task on its own does not force a fresh key to be generated before [`rotateAfter`](/docs/ref/object/domain#rotateafter) has elapsed. To force an emergency rotation (for example, when a key is suspected to be compromised), first set [`nextTransitionAt`](/docs/ref/object/dkim-signature#nexttransitionat) on the DkimSignature to the current time, then trigger the `DkimManagement` task. On that run the task sees that a rotation is due and generates the replacement key immediately.
