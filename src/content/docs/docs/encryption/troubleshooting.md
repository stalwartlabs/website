---
sidebar_position: 9
title: "Troubleshooting"
description: "Diagnose encryption problems: stored messages that stay unencrypted or cannot be decrypted, gateway messages sent in plain text or bounced, external keys that are never fetched or harvested, and the events and metrics to watch."
---

Encryption problems fall into two groups. Either a message that should be encrypted is not, or an encrypted message cannot be read. The server cannot see inside the messages it encrypted, so the evidence comes from its events, from the fields of the keys involved and from the recipient's mail client. This page goes through the common symptoms in that order, and closes with the events and metrics that follow encryption over time.

## Stored messages are not encrypted

When an account receives messages in plain text although encryption at rest is enabled, check the following causes in order:

- The server-wide switch [`atRestEnable`](/docs/ref/object/encryption#atrestenable) is disabled.
- The account's `encryptionAtRest` setting is `Disabled`, or was enabled only after the messages arrived. Encryption applies only to messages stored after it is enabled.
- The account's key is no longer usable. The server then stores messages unencrypted and records `encryption.encryption-skipped` with the reason, such as `Expired`, `Revoked` or `KeyNotFound`. The PublicKey shows the `unusable` warning. Register a new key and select it.
- The message was uploaded by a client, for example a sent copy, and the account has not enabled `encryptOnAppend`. A JMAP draft with the `$draft` keyword is never encrypted, and neither is a message copied or moved from another mailbox.
- The message was already encrypted when it arrived, by its sender, and was stored as it was.

The [Encryption at rest](/docs/encryption/at-rest#messages-that-are-encrypted) page describes these rules.

## Client cannot decrypt a message

When a mail client shows an encrypted message as an attachment or reports a decryption error, the client either lacks the right private key or cannot read the format. For messages encrypted at rest, compare the `fingerprints` of the account's PublicKey with the fingerprint shown by the client. When they differ, the client does not hold the private key for the registered key, which is the most common cause.

When the keys match, the format is the likely problem:

- An S/MIME key with `authenticatedEncryption` enabled produces messages that Apple Mail and Thunderbird before version 154 cannot read. Disable the switch for new messages; messages already stored stay in that format.
- An S/MIME certificate on a NIST curve produces, by default, messages that Outlook reads but that gpgsm and KMail reject. Enabling `strictKeyWrapEncoding` reverses this, for encryption at rest only. Apple Mail reads neither form, and needs an RSA certificate.
- An OpenPGP key with a post-quantum subkey, when every key in the PublicKey has one, produces messages that Thunderbird and GnuPG in its default configuration cannot read, even if the keys also have classical subkeys. The `postQuantum` capability points to this case. The same clients cannot read messages for version 6 keys or native X25519 and X448 subkeys, as the `keyType` shows; see [Client support](/docs/encryption/pgp#client-support).
- An S/MIME certificate with an X25519, X448 or ML-KEM key produces messages that no common mail client reads; the first two are flagged `noKnownDecryptor`.

A message stored with a key is readable only with that key's private key. Messages stored before a key change need the old private key, and no setting on the server can change that.

For the gateway, the recipient's client is outside the administrator's control. When a recipient reports that they cannot decrypt, check that the key the server holds is the one the recipient uses, by comparing the `fingerprint` of the external key, and replace it when the recipient has a new key. The gateway always uses the Outlook-compatible key wrap encoding for elliptic-curve S/MIME certificates; a recipient whose client rejects it needs an RSA certificate or an OpenPGP key instead. For S/MIME recipients on Apple Mail or older Thunderbird releases, check that the record's `authenticatedEncryption` is off and that its `smimeCiphers` and `smimeOaep` do not announce AES-256-GCM together with RSA-OAEP, which also selects authenticated encryption. Recipients whose client does not support header protection see `[...]` as the Subject in the message list, and the real Subject at the top of the decrypted message; this is the effect of the default `baseline` [header protection](/docs/encryption/gateway#header-protection).

## Gateway sends plain text

An `opportunistic` recipient receives the original message whenever the gateway finds no usable key. The event `encryption.gateway-plaintext` records the cases where the policy asked for encryption but no key was usable. The causes are, in order:

- The gateway is disabled, or the [outbound policy](/docs/encryption/gateway#outbound-policy) returns `disable` for the recipient, as the default policy does for local domains. No event is recorded in these cases.
- No external key exists for the recipient's address. Keys are matched by the full address, in lower case.
- The key record exists but has no key yet: an `Automatic` record that has not completed a fetch. See [Automatic key is never fetched](#automatic-key-is-never-fetched).
- The record is disabled, or its key has expired, has been revoked or no longer parses.
- The key's kind is not listed in `gatewayMethods`.
- The key's trust is below the minimum that `gatewayMinTrust` returns for the recipient. With the default minimum, keys from HKP key servers, Autocrypt keys without a signature and S/MIME certificates without a valid chain are not used.
- The message is signed and `gatewayEncryptSigned` is disabled. No event is recorded.
- The message was queued before the key was added. The decision is made once, when the message is accepted, and a key added later does not affect messages already in the queue.

## Recipient bounces with 5.7.5

A delivery status notification with the status `5.7.5` and a reason starting with `Encryption required:` comes from the gateway, which records it with the event `encryption.gateway-bounced`. The reason identifies the cause:

- `No usable encryption key for this recipient`: the policy returned `required`, and the recipient has no usable key, for one of the reasons listed under [Gateway sends plain text](#gateway-sends-plain-text). Add or fix the key, or change the policy for that recipient.
- `The encryption policy could not be evaluated`: the outbound policy or the minimum trust expression failed for this recipient, or returned a value that is not a mode or a trust level. An empty policy, reported at startup with `Empty outbound policy: recipients are rejected until it is fixed`, causes this for every recipient.
- `The message could not be parsed for encryption`: the message is damaged. Every recipient with a key bounces, including opportunistic ones.
- `The message could not be encrypted`: encryption with the recipient's key failed.

Local recipients that bounce with `No usable encryption key for this recipient` point to a policy that returns `required` for local domains, which have no external keys.

## Automatic key is never fetched

An `Automatic` record stays empty while every fetch fails or finds nothing. Its `lastChecked` field shows when the server last obtained an answer, and `nextCheckAt` when it will try again. Each fetch is recorded with the event `encryption.key-lookup`, which carries the method and its result (`found`, `notFound`, `temporaryFailure` or `bogus`); this event is logged at the debug level, so the [tracing level](/docs/telemetry/tracing/) must include it. The causes depend on the method:

- For every method: the gateway is disabled, in which case the maintenance task does nothing; the key that the source returns does not name the address, or has expired; or its kind is not listed in `gatewayMethods`, in which case it is never stored.
- `dnssec`: the DNS resolver does not validate DNSSEC, the recipient's zone is not signed, or the SMIMEA record uses a usage, selector or matching type that the server does not accept. A failing validation is recorded with `encryption.dnssec-bogus`.
- `wkd`: the domain does not publish a Web Key Directory, or publishes it at the other of the two locations. The server uses the advanced location whenever the host `openpgpkey.<domain>` exists, and does not fall back to the direct one.
- `vks`: the address has no verified key on keys.openpgp.org, or the service has asked the server to slow down.
- `hkp`: `hkpServers` is empty, or a server URL does not use `https://` or `hkps://`.
- Network: the server has no direct internet access, or [`discoveryProxy`](/docs/ref/object/encryption#discoveryproxy) is invalid, which is reported at startup.

A key that was fetched but is then not used is usually below the minimum trust: `hkp` keys are `unverified`.

## Harvested key never appears

The server harvests a key only from a message that meets every [condition](/docs/encryption/harvesting#qualifying-messages). When a correspondent's key does not appear, check that the gateway is enabled, that `harvestKeys` allows the sender's domain, that the message passed DMARC (a sender domain without a DMARC policy never does) and was not classified as spam, and that its signature or Autocrypt header names exactly the `From` address. An address that already has a `Manual` or `Automatic` record never receives a harvested key. Each stored key is recorded with `encryption.key-harvested`.

## Key change waits for approval

A record whose `status` is `pendingApproval` has received a new key that the server would not accept on its own, recorded with `encryption.key-change`. The current key stays in use. Confirm the new key with the recipient, then set `status` to `active` to accept it or `rejected` to block it, as described in [Pending approval](/docs/encryption/external-keys#pending-approval).

## Events and metrics

The server records the encryption events in the `encryption` category, all listed in the [event reference](/docs/ref/events). The ones to follow are:

- `encryption.at-rest-encrypted` and `encryption.encryption-skipped`, for encryption at rest. A rising number of skipped encryptions points to expired keys.
- `encryption.gateway-encrypted`, `encryption.gateway-plaintext` and `encryption.gateway-bounced`, for the gateway's decision on each recipient.
- `encryption.key-harvested` and `encryption.key-change`, for keys learned from mail and replacements that wait for approval.
- `encryption.crl-fetch-failed` and `encryption.dnssec-bogus`, for problems with revocation lists and DNSSEC.

Each of these events is also counted as a [metric](/docs/ref/metrics), and the histogram `encryption.key-lookup-time` measures how long discovery fetches take. An [alert](/docs/telemetry/alerts) on `encryption.gateway-bounced` or `encryption.key-change` brings bounces and pending key changes to the administrator's attention.
