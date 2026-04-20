---
sidebar_position: 1
---

# Overview

DomainKeys Identified Mail (DKIM) is an email-authentication method that verifies the authenticity of an email message using public-key cryptography. A digital signature is added to the message header; the signature can be verified against a public key published in DNS under the sending domain. DKIM prevents email spoofing and allows recipients to confirm that a message genuinely originated from the claimed domain.

With DKIM enabled, outgoing messages carry one or more signatures that help build sender reputation, reduce the chance of legitimate messages being marked as spam, and improve overall email security.

DKIM signatures are defined as [DkimSignature](/docs/ref/object/dkim-signature) objects (found in the WebUI under <!-- breadcrumb:DkimSignature --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures<!-- /breadcrumb:DkimSignature -->). Each signature is a multi-variant object: the `Dkim1Ed25519Sha256` variant is used for Ed25519 signatures and the `Dkim1RsaSha256` variant for RSA signatures. See the [signing](/docs/mta/authentication/dkim/sign) and [verifying](/docs/mta/authentication/dkim/verify) pages for details.
