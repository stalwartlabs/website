---
sidebar_position: 1
---

# Overview

DomainKeys Identified Mail (DKIM) is an email-authentication method that verifies the authenticity of an email message using public-key cryptography. A digital signature is added to the message header; the signature can be verified against a public key published in DNS under the sending domain. DKIM prevents email spoofing and allows recipients to confirm that a message genuinely originated from the claimed domain.

With DKIM enabled, outgoing messages carry one or more signatures that help build sender reputation, reduce the chance of legitimate messages being marked as spam, and improve overall email security.

DKIM signatures are defined as [DkimSignature](/docs/ref/object/dkim-signature) objects (found in the WebUI under <!-- breadcrumb:DkimSignature --><!-- /breadcrumb:DkimSignature -->). Each signature is a multi-variant object: the `Dkim1Ed25519Sha256` variant is used for Ed25519 signatures and the `Dkim1RsaSha256` variant for RSA signatures. See the [signing](/docs/mta/authentication/dkim/sign) and [verifying](/docs/mta/authentication/dkim/verify) pages for details.
