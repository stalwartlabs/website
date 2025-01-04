---
sidebar_position: 12
---

# Greylisting

Greylisting is a method where an email server temporarily rejects emails from unknown senders. In essence, when an email from an unfamiliar source arrives, the server sends back a "try again later" message. Legitimate email servers, following standard email protocols, will attempt to resend the email after a short delay. Most spammers, on the other hand, don't bother with resending, and hence, the email never gets through.

The primary criterion for greylisting is a triplet: the sender's IP address, the sender's email address, and the recipient's email address. Stalwart Mail Server employs this triplet to apply greylisting for a duration of 30 days.

In the ongoing battle against unwanted emails, greylisting stands as one of the various techniques employed to thwart the efforts of spammers. But like all tools, it comes with its own set of advantages and challenges.

## Advantages

- **Efficiency**: Greylisting is effective against bulk email senders who do not use standard retry mechanisms. By simply delaying the acceptance of emails, a significant amount of spam can be curtailed.
- **Low Overhead**: Unlike content-based filters, greylisting doesn't require the server to scan the content of each email, thus conserving computational resources.

## Challenges

- **Delay in Email Delivery**: One of the foundational principles of email is its near-instantaneous delivery. Greylisting introduces a deliberate delay, potentially disrupting time-sensitive communications.
- **Adaptive Spammers**: With the rise in the use of greylisting, many spammers have adapted their tactics to include retry mechanisms, thus diminishing the efficacy of greylisting as a standalone spam prevention technique.

## Configuration

Greylisting can be enabled in Stalwart Mail Server by specifying the amount of time a sender should be greylisted. This can be done by setting the `spam-filter.grey-list.duration` property in the configuration file.

For example, to greylist a sender for 30 days:

```toml
[spam-filter.grey-list]
duration = "30d"
```
