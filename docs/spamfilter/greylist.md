---
sidebar_position: 11
---

# Greylisting

Greylisting temporarily rejects messages from unknown senders. When a message from an unfamiliar source arrives, the server returns a "try again later" response. Legitimate MTAs follow standard retry logic and will attempt the delivery again after a short delay, at which point the message is accepted. Many spam senders do not retry, so their messages never get through.

The decision to greylist is based on a triplet: the sender's IP address, the sender's email address, and the recipient's email address. A given triplet is held in the greylist for a configurable duration.

## Advantages

- **Effective against bulk senders**: greylisting stops senders that do not implement proper retry mechanisms, which captures a significant amount of spam.
- **Low overhead**: unlike content-based filters, greylisting does not scan the body of each message and therefore consumes few resources.

## Challenges

- **Delivery delay**: greylisting introduces a deliberate delay, potentially disrupting time-sensitive communications.
- **Adaptive senders**: many bulk senders have adopted retry logic, reducing the efficacy of greylisting as a standalone technique.

## Configuration

Greylisting is configured through the [`greylistFor`](/docs/ref/object/spam-settings#greylistfor) field on the [SpamSettings](/docs/ref/object/spam-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->). The value is a duration that sets how long a triplet remains in the greylist; leaving the field unset disables greylisting. For example, setting `greylistFor` to `"30d"` keeps each triplet greylisted for thirty days.
