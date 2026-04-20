---
sidebar_position: 9
---

# Collaborative digests

Collaborative spam detection networks such as Pyzor, Razor, and DCC rely on message digests. When a user identifies an email as spam, the system generates a unique hash of the message and shares it across the network. Incoming messages are then compared against the repository of spam hashes; if a hash matches, the message is flagged. The principle is straightforward: once one participant in the network identifies a spam wave, all other participants are immediately protected from the same messages.

## Pyzor

Pyzor is an open-source collaborative spam detection system that uses collective intelligence to identify and filter spam. When users across the network mark messages as spam, Pyzor creates and shares their hashes; it also tracks messages users have reported as legitimate, reducing the risk that genuine mail is mistakenly flagged.

### Configuration

Pyzor is configured through the [SpamPyzor](/docs/ref/object/spam-pyzor) singleton (found in the WebUI under <!-- breadcrumb:SpamPyzor --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Pyzor<!-- /breadcrumb:SpamPyzor -->). It is enabled by default and points at the public Pyzor server `public.pyzor.org` with a five-second lookup timeout.

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
