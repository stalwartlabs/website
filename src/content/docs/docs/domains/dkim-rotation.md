---
sidebar_position: 4
title: "DKIM key rotation"
description: "Automatic generation and rotation of a domain's DKIM signing keys: the schedule, the stages of a key, what happens without automatic DNS management, and forcing a rotation."
---

DKIM lets a receiving server verify that a message was signed by the domain it claims to come from. The domain signs with a private key and publishes the matching public key in DNS. Signing keys are long-lived secrets. A key that leaks, or that has been in use for years, lets others sign mail in the domain's name until the key's DNS record is removed. Rotating the keys regularly limits that exposure.

Rotation by hand is a sequence of careful steps, and automatic DKIM management takes them over. With it, Stalwart generates a domain's signing keys and replaces them on a schedule. It publishes each new key in DNS before the key is used, and removes the old keys once messages signed with them are no longer likely to be verified.

This page covers key management. How messages are signed is described in [DKIM signing](/docs/mta/authentication/dkim/sign), which also describes how to create keys managed by hand. How incoming signatures are checked is described in [DKIM verification](/docs/mta/authentication/dkim/verify).

## Enabling automatic management

Automatic management is enabled with the `Automatic` variant of the domain's [`dkimManagement`](/docs/ref/object/domain#dkimmanagement). The setup wizard and the WebUI select it for new domains. The keys are [DkimSignature](/docs/ref/object/dkim-signature) objects (found in the WebUI under <!-- breadcrumb:DkimSignature --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures<!-- /breadcrumb:DkimSignature -->). All settings of the variant are optional. They answer three questions: which keys to keep, what to name them, and how quickly to replace them.

The key types to maintain are listed in [`algorithms`](/docs/ref/object/domain#algorithms). Out of the box, the server keeps an Ed25519 key and an RSA key (<!-- default:Domain.algorithms -->`Dkim1Ed25519Sha256` and `Dkim1RsaSha256`<!-- /default -->), and signs every message with both. Ed25519 keys are short and fast, but not every verifier supports them, and the RSA signature covers those verifiers. Generated RSA keys have 2048 bits.

[DKIM2](/docs/mta/authentication/dkim/dkim2) keys are maintained in the same way once their types, `Dkim2RsaSha256`, `Dkim2Ed25519Sha256` or the post-quantum `Dkim2MlDsa44Ed25519Sha512`, are added to the list, and [Choosing an algorithm](/docs/mta/authentication/dkim/dkim2#choosing-an-algorithm) compares them.

Every key is published under a selector, the name at which its public record is found (`<selector>._domainkey.<domain>`). Selectors let several keys coexist in DNS, which is what makes a rotation without interruption possible. They are built from [`selectorTemplate`](/docs/ref/object/domain#selectortemplate), which can use the variables `{algorithm}`, `{hash}`, `{version}`, `{date-<format>}` (a strftime format), `{epoch}` and `{random}`. The default template, <!-- default:Domain.selectorTemplate -->`v{version}-{algorithm}-{date-%Y%m%d}`<!-- /default -->, produces selectors such as `v1-ed25519-20260101`. Every rotation needs a new selector, so a custom template must contain a date, the epoch or `{random}`.

Three durations set the pace of the rotation:

- A key signs for [`rotateAfter`](/docs/ref/object/domain#rotateafter), <!-- default:Domain.rotateAfter -->90 days<!-- /default --> unless changed, before it is replaced.
- The replaced key's record then stays in DNS for [`retireAfter`](/docs/ref/object/domain#retireafter), <!-- default:Domain.retireAfter -->7 days<!-- /default -->, so that messages signed shortly before the change still verify.
- Once the record has been removed, the key is kept on the server for [`deleteAfter`](/docs/ref/object/domain#deleteafter), <!-- default:Domain.deleteAfter -->30 days<!-- /default -->, before it is deleted.

The following domain uses automatic DKIM management with an Ed25519 key only and a rotation every 180 days:

```json
{
  "name": "example.com",
  "dkimManagement": {
    "@type": "Automatic",
    "algorithms": {"Dkim1Ed25519Sha256": true},
    "rotateAfter": 15552000000
  }
}
```

## Without automatic DNS management

Rotation needs [automatic DNS management](/docs/domains/dns-records) on the domain, with `dkim` among its `publishRecords`, because each rotation publishes a new record and later removes the old one.

Without it, automatic DKIM management does less. With manual DNS management, or without `dkim` in `publishRecords`, the server generates the keys once, as active keys that sign outgoing mail immediately, and never rotates them.

Until the records of such keys are published by hand, receivers cannot verify the signatures. Copy the DKIM records from the domain's zone file into the zone as soon as the domain is created.

Rotation can start later. Switching the domain to automatic DNS management, with `dkim` in `publishRecords`, starts the rotation schedule for the existing keys, counted from that moment. Without that switch, rotate such keys by hand, by creating new keys and publishing their records as described in [DKIM signing](/docs/mta/authentication/dkim/sign).

## Key stages

A key passes through four stages during its life, which decide whether its record is in DNS and whether it signs mail. Each DkimSignature has a [`stage`](/docs/ref/object/dkim-signature#stage), shown in the WebUI's list of DKIM signatures, and a [`nextTransitionAt`](/docs/ref/object/dkim-signature#nexttransitionat) time at which it moves to the next stage:

| Stage | Record in DNS | Signs mail |
|---|---|---|
| `pending` | Being published | No |
| `active` | Yes | Yes |
| `retiring` | Yes | No |
| `retired` | Removed | No |

At most one key per algorithm is active at a time.

## Rotation sequence

When a key has signed for `rotateAfter`, the server replaces it in four steps:

1. A new key is created in the `pending` stage and its record is published through the domain's DNS provider.
2. The server waits until the new record is visible in DNS, as described in [Propagation](/docs/domains/dns-records#propagation). Only then does the new key become `active` and the old one `retiring`, so mail is never signed with a key whose record is not yet published.
3. After `retireAfter`, the old key becomes `retired` and its record is removed from DNS.
4. After `deleteAfter`, the retired key is deleted.

The next rotation is scheduled `rotateAfter` after the new key became active. The steps run as `DkimManagement` [tasks](/docs/management/tasks-actions/tasks), so their progress and failures are visible in the task list.

### Failed steps

A step can fail because the DNS provider rejects an update, or because a new record does not become visible in time. Such a step is retried with growing intervals, and the key stays in its current stage until the step succeeds. The task records reasons such as `Failed to publish DKIM record <name>: <error>` or `DKIM record <name> did not propagate, will retry.`

Errors that retrying cannot fix end the task as failed. Examples are `No DKIM algorithms configured for domain`, `Failed to build DNS updater: <error>` and `Failed to generate DKIM selector: <error>`. When the domain is switched to manual DKIM management or deleted, its pending task is removed without running.

Removing the record at step 3 is retried like any other step, with the reason `Failed to remove DKIM record <name>: <error>.`, and the key stays retiring until it succeeds. Step 4 tries to remove the record again. When that fails, the failure is logged as `dns.record-deletion-failed`, and the key is deleted anyway, which can leave the record in DNS. Remove it by hand.

## Forcing a rotation

A key that may have been exposed should not wait for its scheduled rotation. Running a `DkimManagement` task for a domain advances every transition that is due, but it does not rotate a key before its time. To replace a key immediately, set the key's `nextTransitionAt` to the current time, then create a `DkimManagement` task for the domain. The task generates the replacement key and starts the sequence above.
