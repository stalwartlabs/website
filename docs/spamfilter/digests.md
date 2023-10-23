---
sidebar_position: 7
---

# Collaborative Digests

In the evolving world of cyber threats, collaborative spam detection emerges as one of the most potent tools in the fight against unsolicited emails. By harnessing the power of distributed networks and collective intelligence, collaborative spam detection provides a dynamic and ever-updating defense mechanism against spam.

Collaborative spam detection and filtering networks, like Pyzor, Razor, and DCC, primarily use message digests or hashes. When a user identifies an email as spam, these systems generate a unique hash or digest of that email. This hash is then shared across the network. When another user receives an email, its hash is compared against the repository of spam hashes. If a match is found, the email is flagged as spam.

The underlying principle is straightforward: if one user in the network identifies an email as spam, others in the network are immediately protected from that particular spam email, thanks to the shared hash.

## Pyzor

Pyzor is a prominent example of a collaborative spam detection system. It's an open-source tool that uses collective intelligence to identify and filter out spam. When users across the network mark emails as spam, Pyzor creates and shares their hashes. Conversely, it can also recognize legitimate emails, ensuring that genuine communications are not mistakenly flagged.

Pyzor is enabled by default in Stalwart Mail Server and it is configured to use the public Pyzor server at `public.pyzor.org` with a lookup timeout of 5 seconds. These settings can be changed from the `etc/spamfilter/scripts/pyzor.sieve` script.

