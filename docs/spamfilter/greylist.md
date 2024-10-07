---
sidebar_position: 11
---

# Greylisting

In the ongoing battle against unwanted emails, greylisting stands as one of the various techniques employed to thwart the efforts of spammers. But like all tools, it comes with its own set of advantages and challenges.

## How it works

Greylisting is a method where an email server temporarily rejects emails from unknown senders. In essence, when an email from an unfamiliar source arrives, the server sends back a "try again later" message. Legitimate email servers, following standard email protocols, will attempt to resend the email after a short delay. Most spammers, on the other hand, don't bother with resending, and hence, the email never gets through.

The primary criterion for greylisting is a triplet: the sender's IP address, the sender's email address, and the recipient's email address. Stalwart Mail Server employs this triplet to apply greylisting for a duration of 30 days.

## Advantages

- **Efficiency**: Greylisting is effective against bulk email senders who do not use standard retry mechanisms. By simply delaying the acceptance of emails, a significant amount of spam can be curtailed.
- **Low Overhead**: Unlike content-based filters, greylisting doesn't require the server to scan the content of each email, thus conserving computational resources.

## Challenges

- **Delay in Email Delivery**: One of the foundational principles of email is its near-instantaneous delivery. Greylisting introduces a deliberate delay, potentially disrupting time-sensitive communications.
- **Adaptive Spammers**: With the rise in the use of greylisting, many spammers have adapted their tactics to include retry mechanisms, thus diminishing the efficacy of greylisting as a standalone spam prevention technique.

## Configuration

The parameters governing greylisting, including the triplet criteria, can be fine-tuned to suit specific requirements from the `greylist` Sieve script.

:::tip Note

By default, greylisting is disabled in Stalwart Mail Server to ensure immediate email delivery. Administrators wishing to employ greylisting need to uncomment the `session.rcpt.script` setting within the configuration file.

:::

In conclusion, while greylisting can be a potent tool in the anti-spam arsenal, it's essential to weigh its benefits against its potential drawbacks, especially in environments where email timeliness is paramount.
