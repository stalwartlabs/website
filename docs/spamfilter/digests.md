---
sidebar_position: 9
---

# Collaborative digests

Collaborative spam detection networks such as Pyzor, Razor, and DCC rely on message digests. When a user identifies an email as spam, the system generates a unique hash of the message and shares it across the network. Incoming messages are then compared against the repository of spam hashes; if a hash matches, the message is flagged. The principle is straightforward: once one participant in the network identifies a spam wave, all other participants are immediately protected from the same messages.

## Pyzor

Pyzor is an open-source collaborative spam detection system that uses collective intelligence to identify and filter spam. When users across the network mark messages as spam, Pyzor creates and shares their hashes; it also tracks messages users have reported as legitimate, reducing the risk that genuine mail is mistakenly flagged.

### Configuration

Pyzor is configured through the [SpamPyzor](/docs/ref/object/spam-pyzor) singleton (found in the WebUI under <!-- breadcrumb:SpamPyzor --><!-- /breadcrumb:SpamPyzor -->). It is enabled by default and points at the public Pyzor server `public.pyzor.org` with a five-second lookup timeout.

Relevant fields are:

- [`enable`](/docs/ref/object/spam-pyzor#enable): enables or disables Pyzor.
- [`host`](/docs/ref/object/spam-pyzor#host): the Pyzor server hostname.
- [`port`](/docs/ref/object/spam-pyzor#port): the Pyzor server port.
- [`timeout`](/docs/ref/object/spam-pyzor#timeout): maximum time to wait for a response before the check is treated as failed.
- [`blockCount`](/docs/ref/object/spam-pyzor#blockcount): minimum number of times a hash must appear in the Pyzor blocklist for the message to be considered.
- [`allowCount`](/docs/ref/object/spam-pyzor#allowcount): minimum number of times a hash must appear in the Pyzor allowlist for the message to be considered.
- [`ratio`](/docs/ref/object/spam-pyzor#ratio): the ratio of blocklist hits to allowlist hits above which the message is treated as spam.

Example configuration matching the default public server:

```json
{
  "enable": true,
  "host": "public.pyzor.org",
  "port": 24441,
  "timeout": "5s",
  "blockCount": 5,
  "allowCount": 10,
  "ratio": 0.2
}
```
