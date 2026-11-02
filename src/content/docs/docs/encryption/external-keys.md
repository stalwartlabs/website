---
sidebar_position: 4
title: "External keys"
description: "The public keys of remote recipients that the encryption gateway encrypts with: manual and automatically refreshed keys, the discovery methods WKD, keys.openpgp.org, HKP and DNSSEC, trust levels, key changes and approval, and the refresh schedule."
---

The [encryption gateway](/docs/encryption/gateway) can only encrypt for a recipient whose public key it already holds. These keys of remote recipients are external keys. Each one is an [ExternalPublicKey](/docs/ref/object/external-public-key) object, found in the WebUI under <!-- breadcrumb:ExternalPublicKey/ --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › External Public Keys<!-- /breadcrumb:ExternalPublicKey/ -->, and it ties one email address to one OpenPGP key or one S/MIME certificate.

External keys belong to the whole server: every local sender who writes to an address uses the same key. A wrong key would expose the mail of every sender to whoever holds the matching private key, so external keys are system administrator objects: the `sysExternalPublicKey` permissions belong to the superuser role, and tenant administrators do not see them unless a role grants those permissions. External keys are unrelated to the [PublicKey](/docs/ref/object/public-key) objects that local users register for [encryption at rest](/docs/encryption/at-rest).

The gateway never searches for a key while it sends a message. A search at send time would reveal to a third party whom local users write to, and it would delay every message to a recipient without a key. An address therefore has a key only when a record for it exists, created in one of three ways: an administrator enters the key, an administrator creates a record that the server keeps up to date from a discovery method, or the server [harvests](/docs/encryption/harvesting) the key from signed mail that the address sends.

## Key sources

The [`source`](/docs/ref/object/external-public-key#source) field records how a record was created, and it cannot be changed afterwards:

- `Manual` is a key that an administrator pasted in. It is the most trusted kind of key, and the server never replaces it.
- `Automatic` is a record that names an address and one discovery method, without a key. The server fetches the key from that method, and fetches it again regularly to follow changes.
- `HarvestedSmime`, `HarvestedPgp` and `Autocrypt` are keys that the server learned from received mail. Only the server creates these records; a client that tries to create one receives `Harvested keys are created by the server.`

Each address can have only one record, whatever its source. Creating a second record for an address fails with a `primaryKeyViolation` error that names the existing record. To replace a key with one from another source, for example a harvested key with a manual one, delete the existing record first.

The source of a record cannot be changed afterwards; an attempt fails with `The source of an external public key cannot be changed.` Only a `Manual` record accepts a new `key` from a client; on other records, a `key` sent by a client is ignored, because the server maintains it. Changing the `emailAddress` of an `Automatic` record clears its key and fetches the key of the new address; the address of a harvested record cannot be changed, and an attempt fails with `The address of a harvested key cannot be changed.`

### Add a key manually

A manual key is the right choice for a recipient whose key was obtained through a reliable channel: exchanged in person, published on a partner's website, or sent by their IT department. Create an ExternalPublicKey with the address in `emailAddress`, the key in `key` as an ASCII-armoured OpenPGP key or a PEM certificate, and a `Manual` source. The following object adds an S/MIME certificate for one recipient:

```json
{
  "emailAddress": "alice@partner.example.com",
  "description": "Certificate received from Partner IT, 2026-10",
  "source": {"@type": "Manual"},
  "key": "-----BEGIN CERTIFICATE-----\nMIIF...\n-----END CERTIFICATE-----"
}
```

The server checks the key as it does for [encryption at rest](/docs/encryption/at-rest#keys), with the same errors, and fills in the read-only fields `kind`, `keyType`, `fingerprint`, `capabilities` and `expiresAt`. A record holds exactly one key: text with several OpenPGP keys or several end-entity certificates is refused with `An external public key must hold a single key or certificate.` An S/MIME certificate may come with its intermediate certificates. The server does not check that the key names the record's address, which allows a key to be used for an alias, but makes it all the more important to enter the right key.

## Discovery methods

Many organisations publish the public keys of their users, so that correspondents can find them. An `Automatic` record lets the server use such a publication: the administrator names the address and one method, and the server fetches the key and keeps it current. The following object asks the server to follow the key that the recipient's domain publishes in its Web Key Directory:

```json
{
  "emailAddress": "bob@partner.example.com",
  "source": {"@type": "Automatic", "method": "wkd"}
}
```

Saving a new `Automatic` record starts a fetch at once. Until the fetch succeeds, the record has no key, and the gateway treats the recipient as having none. Any `key` given with an `Automatic` record is ignored.

The method decides where the key comes from and how far it can be trusted. Four methods are available.

`wkd`, the [Web Key Directory](https://datatracker.ietf.org/doc/draft-koch-openpgp-webkey-service/), fetches an OpenPGP key that the recipient's own domain publishes over HTTPS. Because the domain itself vouches for the key, it is a good source for organisations that run one. The server first looks up the host `openpgpkey.<domain>`; when it exists, it uses the advanced URL `https://openpgpkey.<domain>/.well-known/openpgpkey/<domain>/hu/<hash>?l=<local-part>`, and otherwise the direct URL `https://<domain>/.well-known/openpgpkey/hu/<hash>?l=<local-part>`. There is no fallback from one to the other.

`vks` fetches an OpenPGP key from keys.openpgp.org, at `https://keys.openpgp.org/vks/v1/by-email/<address>`. That service publishes a key for an address only after confirming, by email, that the owner of the address uploaded it. The server limits itself to 50 requests per 50 minutes to the service, and pauses for the time the service asks when it reports too many requests.

`hkp` asks the key servers listed in [`hkpServers`](/docs/ref/object/encryption#hkpservers), in order, with the HKP protocol, and uses the first answer that contains a key. Classic key servers accept any key for any address without verification, so these keys carry the lowest trust level and are not used under the default [minimum trust](/docs/encryption/gateway#minimum-trust). Each server URL must use `https://` or `hkps://`; any other scheme is reported at startup with `Keyserver <url> must use https or hkps.`, and requests to it fail. With no servers configured, `hkp` records never find a key.

`dnssec` reads the key from DNS: an OpenPGP key from an OPENPGPKEY record ([RFC 7929](https://www.rfc-editor.org/rfc/rfc7929)) at `<hash>._openpgpkey.<domain>`, and an S/MIME certificate from an SMIMEA record ([RFC 8162](https://www.rfc-editor.org/rfc/rfc8162)) at `<hash>._smimecert.<domain>`. DNSSEC signatures prove that the domain published the record, which makes these keys `verified`. The method has three requirements:

- The [DNS resolver](/docs/server/dns/resolver) must validate DNSSEC and be reachable over TCP, as for [DANE](/docs/mta/transport-security/dane). When it cannot validate, every `dnssec` fetch fails temporarily.
- Only a validated answer counts. An answer from an unsigned zone counts as no key, and a bogus answer, one whose signatures fail, is treated as a temporary failure and recorded with the event `encryption.dnssec-bogus`.
- Only SMIMEA records that carry the full certificate (selector 0, matching type 0) with usage `PKIX-EE` (1) or `DANE-EE` (3) are used, and the certificate must name the address. A `PKIX-EE` certificate must also chain to a [trusted root](/docs/encryption/smime-trust).

DNS records come with a lifetime, and RFC 7929 does not allow keeping the key beyond it. The server therefore limits the key's `expiresAt` to the end of the record's TTL and fetches it again shortly before. When the server finds both an OPENPGPKEY and an SMIMEA record for an address that has no key yet, it stores the S/MIME certificate; a record that already holds a key keeps its kind.

Whatever the method, a fetch only stores a key of a kind listed in [`gatewayMethods`](/docs/ref/object/encryption#gatewaymethods). With only S/MIME listed, for example, `wkd`, `vks` and `hkp` records, which return OpenPGP keys, never receive one.

Whatever the method, the server keeps only keys that belong to the address. From an OpenPGP response, it keeps a key only when one of its user IDs is the record's address, and it removes the other user IDs from the stored copy, so the stored key reveals nothing about the owner's other addresses. Expired and unusable keys in a response are ignored.

### Privacy

Every fetch tells the operator of the source which address the server is interested in: the recipient's domain for `wkd` and `dnssec`, and the operator of the key server for `vks` and `hkp`. A record that is refreshed daily reveals this every day. This is the price of keeping keys current automatically, and it is the reason the server never fetches keys for addresses that have no record.

### Network access

Fetches use HTTPS only, and the server connects only to public addresses: a URL or a redirect that points to a private or reserved address, or to a special-use domain, is refused. At most three redirects are followed, a response may not exceed 256 KiB, and each fetch is limited by [`sourceTimeout`](/docs/ref/object/encryption#sourcetimeout), <!-- default:Encryption.sourceTimeout -->5 seconds<!-- /default --> by default. The discovery settings are part of the [Encryption](/docs/ref/object/encryption) singleton, under <!-- breadcrumb:Encryption/EncryptionDiscovery --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Key Discovery<!-- /breadcrumb:Encryption/EncryptionDiscovery -->.

Servers that reach the internet only through a proxy set it in [`discoveryProxy`](/docs/ref/object/encryption#discoveryproxy). The proxy carries the key fetches and also the certificate and revocation list downloads of [S/MIME trust](/docs/encryption/smime-trust); DNS lookups, including the `wkd` host check and the `dnssec` method, do not go through it. With a proxy, the server checks the host name of each URL, but it cannot check the address that the proxy connects to. An invalid proxy URL is reported at startup, and every fetch then fails.

## Trust levels

Keys from different sources deserve different degrees of confidence, and the gateway uses only keys that reach the [minimum trust](/docs/encryption/gateway#minimum-trust) set for a recipient. The server assigns each key a [`trust`](/docs/ref/object/external-public-key#trust) level from its source:

| Trust | Meaning | Keys that receive it |
|---|---|---|
| `manual` | An administrator vouched for the key | Manual keys, and keys whose change an administrator approved on a record that is not `Automatic` |
| `verified` | A cryptographic proof binds the key to the address | `dnssec` keys; harvested S/MIME certificates with a valid chain to a trusted root |
| `discovered` | The recipient's domain or a verifying directory published the key | `wkd` and `vks` keys |
| `harvested` | The key came with authenticated mail from the address | Autocrypt keys from a message whose OpenPGP signature the key itself verifies |
| `unverified` | Nothing vouches for the key | `hkp` keys; Autocrypt keys without a valid signature; S/MIME certificates without a valid chain |

The levels are ordered from the highest, `manual`, to the lowest, `unverified`. A harvested record can rise in trust when the same key arrives again with better evidence, and the daily [revocation check](/docs/encryption/smime-trust#revocation) of harvested S/MIME certificates can lower it.

## Key changes

Keys change: people replace lost devices, certificates expire and are renewed, and organisations rotate keys. The server must accept a legitimate new key without help, yet refuse a key that an attacker substitutes, for example by sending a forged signed message or by uploading a key to a key server. How it handles a new key depends on where the key comes from and on the record it would replace.

### Automatic replacement

A new key replaces the current one directly in the following cases, unless the record is pinned:

- The record is `Automatic`. The administrator chose the source, so the source speaks for the address: when it starts serving a different key, the server switches at the next fetch. As long as the source still serves the key the record holds, the server keeps it, even if another key appears beside it.
- The new key is `verified` and its trust is at least that of the current key.
- The current key is `unverified` and the new key ranks higher.
- The current key has expired.
- Both keys are OpenPGP keys and the current key has certified the new one for the record's address, which is how OpenPGP users announce a successor key.

A harvested key of the other kind (an S/MIME certificate replacing an OpenPGP key, or the reverse) replaces a harvested record only when it ranks higher; otherwise it is ignored. Harvested keys never replace or queue on `Manual` and `Automatic` records, and a record that is disabled ignores new keys.

### Pending approval

Any other new key waits for a decision. The server stores it in the record's `nextKey` fields, sets [`status`](/docs/ref/object/external-public-key#status) to `pendingApproval` and records the event `encryption.key-change`; the current key stays in use meanwhile. Only one key can wait at a time, and a newer candidate takes the place of an older one. The waiting keys are listed under <!-- breadcrumb:ExternalPublicKey/PendingExternalPublicKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Pending Key Changes<!-- /breadcrumb:ExternalPublicKey/PendingExternalPublicKey -->, with the `nextKeyType`, `nextFingerprint` and `nextExpiresAt` of each, so the administrator can compare them with the current key and confirm the new one with the recipient through another channel.

The decision is made by setting `status`:

- `active` approves the new key: it replaces the current one, and the record's trust becomes `manual`, because an administrator has now vouched for it. On an `Automatic` record the trust stays that of its method.
- `rejected` refuses the new key: its fingerprint is added to the record's `blockedFingerprints`, and the status returns to `active` with the current key. A blocked key is never accepted again for that record. A record remembers its 8 most recently blocked keys.
- `disabled` drops the waiting key without blocking it, and disables the record.

A record whose replacement key is still waiting when its current key expires switches to the waiting key at the next maintenance run, because the alternative is no key at all. A record other than `Automatic` that is promoted this way drops to `unverified` trust, since nobody approved the key. Between the expiry and that run, which can take a few minutes, the recipient has no usable key.

### Pinned keys

The [`pinned`](/docs/ref/object/external-public-key#pinned) switch stops every automatic replacement on a record: each new key waits for approval, whatever its source and trust, except a harvested key of the other kind, which is ignored. Pinning suits keys of important correspondents and `Automatic` records whose source the administrator does not want to trust blindly, since a compromised directory could otherwise substitute its own key at the next fetch.

### Revocation

A key's owner can revoke it, for example after losing the private key. The server learns of a revocation from the OpenPGP revocation signatures that an `Automatic` fetch returns, and from the revocation lists checked daily for harvested S/MIME certificates. A revoked key's fingerprint is blocked. When the record has a replacement key waiting and is not pinned, the waiting key takes over; otherwise the record is left without a key, and the recipient has none until a new key arrives. An `Automatic` record keeps being fetched, and the same fetch can fill it with a new key.

## Refresh schedule

The [task](/docs/management/tasks-actions/tasks) `ExternalPublicKeyMaintenance` keeps the records current. The server checks every 5 minutes whether any record is due, according to its [`nextCheckAt`](/docs/ref/object/external-public-key#nextcheckat) field, and starts the task when one is; in a cluster, the node that runs scheduled tasks does this. Saving a new `Automatic` record starts the task immediately. Each run collects due records until it has 1024 fetches or 1024 certificate checks, spends at most 5 minutes on certificate checks, and leaves the remainder for the next run.

Each record type follows its own schedule:

- An `Automatic` record is fetched again after [`keyRefreshInterval`](/docs/ref/object/encryption#keyrefreshinterval), <!-- default:Encryption.keyRefreshInterval -->1 day<!-- /default --> by default, or 10 minutes before its key expires when that is sooner. This brings the next fetch forward for `dnssec` records with a short DNS TTL. With a TTL below about 10 minutes, the key can lapse before the next run, and the recipient then has no key until the run completes.
- A harvested S/MIME certificate is checked for revocation once a day.
- `Manual`, `HarvestedPgp` and `Autocrypt` records are not checked, except when a replacement key is waiting for the current one to expire.

A fetch that fails, because the source is unreachable, times out, returns a server error or, for `vks`, asks the server to slow down, keeps the current key and is retried after a delay that grows with the time since the last successful check, from 5 minutes up to the refresh interval. A source that reports that it has no key for the address is a different case, and the outcome depends on the method. A `dnssec` record then loses its key and any key waiting for approval, unless it is pinned; an answer from an unsigned zone counts as no key here too. The other methods keep the key they hold. A source also counts as reporting no key when everything it returned was filtered out, for example because no key named the address, and `wkd`, `vks` and `hkp` treat any HTTP status other than 200 and server errors, such as 404 or 403, the same way.

## Limits

A key that the server fetches or harvests may not exceed 64 KiB; a larger one is ignored. The size of the key cache is set by [`externalPublicKeys`](/docs/ref/object/cache#externalpublickeys) in the [Cache](/docs/ref/object/cache) settings, and the lifetime of a cached "no key" answer by [`negativeCacheTtl`](/docs/ref/object/encryption#negativecachettl), <!-- default:Encryption.negativeCacheTtl -->1 day<!-- /default --> by default. Creating a record clears that answer at once.
