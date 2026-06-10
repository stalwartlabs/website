---
sidebar_position: 1
title: "Overview"
next: false
---

The steps up to this point are the same whatever software the source server runs, because they concern the new Stalwart deployment and the proxy, both of which behave identically regardless of where the accounts are being migrated from. The source server is the one component whose preparation depends on what it actually is, and that preparation is the subject of this step.

Two requirements are common to every source. The first is that the source must accept the proxy in front of it, so that connections arriving through the proxy reach the source with the real client address preserved rather than the proxy's. How that trust is expressed differs by software: a Stalwart source trusts the PROXY protocol on its listeners, while a Dovecot and Postfix stack trusts the proxy to announce the client over the XCLIENT and IMAP ID commands. The proxy was already told which of these to use when its destinations were configured, and this step configures the matching trust on the source itself. The second requirement is that the source must accept mail relayed to it from the new server, because the new deployment is the public mail exchanger from the cutover onward and relays back to the source every message addressed to an account that has not yet been migrated.

A third concern, advertising the proxy as the public address so that autodiscovering clients stay on it, applies only to sources that serve HTTP or JMAP. A Stalwart source does, and is configured accordingly; a Dovecot and Postfix stack does not serve either protocol, so it has nothing to advertise and the concern does not arise.

## Choosing the source

The pages below cover the source families the guide documents. Each is self-contained: the page for the source in use is the only one that applies, and the shared flow resumes at [starting the proxy](/docs/migration/guide/cutover/) once the source has been prepared.

- [An older Stalwart server](/docs/migration/guide/configure-source/stalwart-old/) prepares a Stalwart deployment of version 0.15 or below to sit behind the proxy and accept the relay, using the v0.15 management API.
- [Dovecot and Postfix](/docs/migration/guide/configure-source/dovecot-postfix/) prepares an on-premise Dovecot and Postfix stack, which is the foundation of many self-hosted mail systems including Mail-in-a-Box, mailcow and other Docker-based distributions, to trust the proxy over XCLIENT and to accept the relay through Postfix.

A source that is not listed but can be placed behind the proxy, that is, any on-premise IMAP, POP3 and SMTP server whose ports the operator controls, is prepared by satisfying the same two requirements: trusting the proxy to convey the real client address, and accepting mail relayed from the new server for accounts that have not yet moved. The Dovecot and Postfix page is the closest template for such a source, since it speaks the same XCLIENT and relay conventions that most legacy mail servers share.
