---
sidebar_position: 6
title: "S/MIME certificate trust"
description: "How Stalwart decides whether a remote recipient's S/MIME certificate is genuine: the bundled root certificates, private certificate authorities, chain building, intermediate certificate downloads and revocation lists."
---

Anyone can create a certificate that claims any email address, so a certificate on its own proves nothing. What makes an S/MIME certificate believable is the certificate authority that issued it: the authority checked that the applicant controls the address, and its signature on the certificate vouches for that check. The server trusts a certificate when it can follow these signatures, from the certificate through any intermediate authorities, up to a root authority it trusts. The path is called the certificate chain, and the trusted roots are trust anchors.

This works as it does for TLS certificates, with roots and rules specific to email. The server uses it to decide the [trust level](/docs/encryption/external-keys#trust-levels) of S/MIME certificates that the [encryption gateway](/docs/encryption/gateway) encrypts for. A certificate with a valid chain is `verified`; one without is `unverified`, and the default [minimum trust](/docs/encryption/gateway#minimum-trust) does not use it.

## Scope

The chain is checked for certificates that the server obtains on its own:

- Certificates [harvested](/docs/encryption/harvesting#smime-signatures) from signed messages, when they are learned and then once a day, together with the revocation check.
- Certificates fetched from SMIMEA records with usage `PKIX-EE`, when they are fetched. Records with usage `DANE-EE` rely on DNSSEC alone.

Certificates that an administrator enters as `Manual` external keys are not checked: the administrator vouches for them, and a self-signed certificate works. The same is true of the certificates that users register for [encryption at rest](/docs/encryption/at-rest), which only need to be valid and usable for encryption.

## Trust anchors

The settings described here belong to the [Encryption](/docs/ref/object/encryption) singleton, found in the WebUI under <!-- breadcrumb:Encryption/EncryptionTrust --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › S/MIME Trust<!-- /breadcrumb:Encryption/EncryptionTrust -->.

Stalwart includes the root certificates that Mozilla trusts for email, taken from the Common CA Database. When Mozilla stops trusting a root for certificates issued after a given date, that date is honoured too: a certificate issued later does not chain to it. The bundled roots are trusted while [`useBundledRoots`](/docs/ref/object/encryption#usebundledroots) is <!-- default:Encryption.useBundledRoots as=enabled -->enabled<!-- /default -->. Disabling it limits trust to the authorities that the administrator adds.

Organisations often issue S/MIME certificates from a private certificate authority, which no public root list contains. To trust the certificates of such a partner, add its root or intermediate certificate as an [SmimeTrustAnchor](/docs/ref/object/smime-trust-anchor), found in the WebUI under <!-- breadcrumb:SmimeTrustAnchor --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Trust Anchors<!-- /breadcrumb:SmimeTrustAnchor -->. The following object adds a partner's root authority:

```json
{
  "description": "Partner Corp internal CA",
  "certificate": "-----BEGIN CERTIFICATE-----\nMIIF...\n-----END CERTIFICATE-----",
  "enable": true
}
```

The `certificate` field must hold exactly one CA certificate; anything else is refused with `Must be a single CA certificate.` The server fills in `subject` and `expiresAt` from the certificate. Setting `enable` to false stops trusting the authority without deleting it. An anchor is trusted even after its own expiry date, so `expiresAt` serves as a reminder to replace it; the certificates below it must still be within their validity periods. At most 256 enabled anchors are used. Like external keys, trust anchors apply to the whole server and are system administrator objects, which tenant administrators do not see unless a role grants the `sysSmimeTrustAnchor` permissions. Changes apply to the next certificate check; certificates already rated keep their trust until they are checked again.

## Chain validation

To build the chain, the server starts from the recipient's certificate and the intermediate certificates that came with it, and looks for each certificate's issuer. It accepts a chain of the recipient's certificate and up to five intermediate certificates below the anchor when all of the following hold:

- Every certificate below the anchor is within its validity period. If one has expired, the chain is not valid.
- Every intermediate certificate is a CA certificate, may sign certificates, respects the path length and name constraints of the authorities above it, and does not exclude email protection in its extended key usage.
- The recipient's certificate allows email protection, or does not restrict its usage.
- No certificate below the anchor contains a critical extension the server does not understand.
- No certificate in the chain is signed with SHA-1.

Senders do not always include their intermediate certificates. When an issuer is missing, the server downloads it from the address that the certificate names in its Authority Information Access extension, which is usually plain HTTP; this is safe, because the downloaded certificate is accepted only if its signature fits. Up to 8 downloads are made per chain, each limited to 64 KiB and 30 seconds, and the whole check gives up after 45 seconds. A download that fails leaves the chain incomplete. A certificate harvested in that state is `unverified`; at the daily check, an already `verified` certificate gets the grace period described under [Revocation](#revocation); and a `PKIX-EE` SMIMEA fetch counts as a temporary failure and is retried. The downloads go through [`discoveryProxy`](/docs/ref/object/encryption#discoveryproxy) when one is set.

The server does not apply the CA/Browser Forum S/MIME rules on certificate profiles: any certificate that chains correctly to a trusted anchor is accepted.

## Revocation

A certificate authority revokes a certificate when its private key is compromised or its holder leaves, and it publishes the revoked serial numbers in a certificate revocation list (CRL). The server checks harvested S/MIME certificates against these lists once a day, during the [refresh schedule](/docs/encryption/external-keys#refresh-schedule) of external keys. There is no OCSP support, and the checks made when a certificate is first learned or fetched include no revocation check.

For each certificate due for its check, the server builds the chain again, downloads the revocation lists that the certificates name, and keeps them for the duration of that run. A list is used only when its signature is valid, it is current, and it covers the certificate. Downloads are limited to [`maxCrlSize`](/docs/ref/object/encryption#maxcrlsize), <!-- default:Encryption.maxCrlSize as=size -->20 MB<!-- /default --> by default, and to 64 lists per run; certificates whose lists were not downloaded because of that limit are checked at the next run.

The check has one of the following outcomes:

- A valid, unrevoked chain gives the certificate `verified` trust, which also promotes an `unverified` certificate whose chain has become complete.
- A revoked certificate is removed from its record and blocked, as described in [Revocation](/docs/encryption/external-keys#revocation), and the record drops to `unverified`.
- When a revocation list cannot be downloaded, the server records the event `encryption.crl-fetch-failed` with its URL. A `verified` certificate keeps its trust for up to 11 days after its last successful check, so a short outage of the authority's server does not demote it, and then drops to `unverified`. The same grace period applies when an intermediate certificate cannot be downloaded.
- When the check itself does not complete, for example because the chain download exceeds its time limit, the trust stays as it was and the check is repeated the next day.
- Any other failure, such as an expired chain or a chain to an untrusted root, gives the certificate `unverified` trust.

A record whose certificate was approved by an administrator has `manual` trust and is no longer checked.
