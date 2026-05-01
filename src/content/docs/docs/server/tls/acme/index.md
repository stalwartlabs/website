---
sidebar_position: 1
title: "Overview"
---

The Automatic Certificate Management Environment (ACME) protocol automates the issuance, installation, and renewal of TLS certificates. Instead of generating a certificate signing request and driving the process by hand, an ACME client interacts with a Certificate Authority (CA) over a standard API to prove control of a domain and to fetch or renew a certificate.

For a mail server, which must keep a valid certificate in place at all times for every host it serves, automation removes a recurring operational task. Renewals happen well before the current certificate expires, so there is no window in which a missed renewal interrupts service.

ACME also removes a class of manual error. Generating CSRs, placing files in the right location, and restarting services by hand are all steps where something can be skipped or mis-entered; the ACME client handles them deterministically. This is particularly useful for small operations that cannot dedicate a person to certificate hygiene.

Used together with a free CA such as Let's Encrypt, ACME also removes the cost associated with certificate procurement, lowering the barrier to running a TLS-protected service.

Stalwart implements ACME directly. See [Challenge types](/docs/server/tls/acme/challenges) for the supported domain-validation methods and [Configuration](/docs/server/tls/acme/configuration) for how to register an ACME provider on the server.
