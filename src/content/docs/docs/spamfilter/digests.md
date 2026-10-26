---
sidebar_position: 9
title: "Collaborative digests"
description: "Checking messages against the Pyzor network of spam digests: what is sent, how the answer is interpreted, and how to enable it."
---

A single server sees only its own share of a spam run, and a message whose content is new to it gives its other checks little to work with. Collaborative spam detection networks pool what many servers see. Their participants report the fingerprints of messages they consider spam, and the network keeps count.

A mail server that takes part computes the fingerprint, or digest, of each message it receives, and asks the network how often that digest has been reported. A message that many participants have reported is part of a spam run, even if its content is new to the server. Stalwart supports [Pyzor](https://www.pyzor.org), an open network of this kind.

## Pyzor

Pyzor is configured on the [SpamPyzor](/docs/ref/object/spam-pyzor) singleton, found in the WebUI under <!-- breadcrumb:SpamPyzor --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Pyzor<!-- /breadcrumb:SpamPyzor -->. It is <!-- default:SpamPyzor.enable as=enabled -->disabled<!-- /default --> by default.

### Digest

The digest has to match across copies of a spam run that differ in small details, so Stalwart computes it from a normalised version of the text. It takes the plain-text and HTML body parts and removes URLs, email addresses, IP addresses, long tokens and short lines. It then hashes a few selected lines with SHA-1. A message without enough text produces no digest, and is not checked.

### Privacy

The digest is sent to the Pyzor server in a single UDP request, as the anonymous Pyzor user, and the message itself is never sent. Enabling Pyzor nevertheless discloses some information to the operator of the Pyzor server: for every message received, a fingerprint of its text and the address of the querying server.

### Answer and tag

The server answers with two counts: how many times the digest has been reported as spam, and how many times it has been reported as legitimate (whitelisted). Both counts matter, because a digest that many participants consider legitimate should not be treated as spam merely because some have reported it.

The message receives the `PYZOR` tag, which scores 3.5 in the rule set, when the server's answer is successful and two conditions hold. The spam count must be greater than [`blockCount`](/docs/ref/object/spam-pyzor#blockcount). In addition, either the whitelist count is less than [`allowCount`](/docs/ref/object/spam-pyzor#allowcount), or the whitelist count divided by the spam count is less than [`ratio`](/docs/ref/object/spam-pyzor#ratio).

With the defaults, a digest reported as spam more than <!-- default:SpamPyzor.blockCount -->5<!-- /default --> times is tagged. It escapes the tag only when it has also been whitelisted at least <!-- default:SpamPyzor.allowCount -->10<!-- /default --> times and the whitelist reports amount to at least <!-- default:SpamPyzor.ratio -->0.2<!-- /default --> of the spam reports.

A request that fails or times out adds no tag, so an unreachable network never counts against a message. The failure is logged as `spam.pyzor-error`.

## Enabling Pyzor

Out of the box, the filter queries the public server <!-- default:SpamPyzor.host -->`public.pyzor.org`<!-- /default --> on UDP port <!-- default:SpamPyzor.port -->24441<!-- /default -->. Enabling Pyzor with the public network therefore needs only [`enable`](/docs/ref/object/spam-pyzor#enable). The following object body does that:

```json
{
  "enable": true
}
```

An organisation that runs its own Pyzor server points the filter to it by setting [`host`](/docs/ref/object/spam-pyzor#host) and [`port`](/docs/ref/object/spam-pyzor#port).

Pyzor adds a network round trip to every message. Each message waits for the Pyzor answer, up to [`timeout`](/docs/ref/object/spam-pyzor#timeout), before its score is final. [Tuning mail throughput](/docs/performance/mail-throughput) describes the effect of external lookups on capacity.

The participation is one-way. Stalwart queries Pyzor but does not report messages to it, so the server contributes nothing back to the network.
