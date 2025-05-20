---
sidebar_position: 11
---

# Sender Reputation

In the world of email communications, sender reputation plays a pivotal role in determining the credibility of messages. Just as personal or business reputations matter in real-life interactions, in the digital realm, sender reputation serves as a measure of trustworthiness. By tracking the reputation of senders, email servers can make more informed decisions about how to handle incoming messages.

Email is often used as a channel for spam, phishing, and other forms of malicious activities. One of the most effective ways to combat this is by assessing the historical behavior of senders. If a particular sender consistently sends genuine messages, their reputation is positive. Conversely, if they frequently send spam or malicious emails, their reputation drops. By considering the sender's reputation, the spam filter can adjust the spam score of incoming messages, ensuring that genuine emails are delivered while potential threats are flagged or filtered out.

## Overview

Stalwart's spam filter keeps tracks the past spam scores associated with various tokens related to the sender: their IP address, the Autonomous System Number (ASN), domain, and the email address itself. Once an initial spam score for a message is computed, it undergoes an adjustment based on the sender's reputation using the formula:

```
    new_score = calculated_score + (reputation - score) * 0.5
```

The reputation is derived using:

```
    reputation = reputation + (token_total_score / token_message_count * weight)
```

Here, `token_total_score` is the aggregate of all scores associated with a token, and `token_message_count` denotes the number of messages linked to that specific token. Each token type has an assigned weight, which influences its impact on the overall reputation:

- Sender address: 50%
- Sender domain: 20%
- IP address: 20%
- ASN: 10%

Upon determining the `new_score`, the original score (before adjustment) is archived in the database for each token type. This score is then "watered down" to ensure that recent scores exert a more significant influence than older ones. This diminishing influence is achieved by applying a factor of 0.98:

```
    token_score = (token_count + 1) * (original_score + 0.98 * token_score) / (0.98 * token_count + 1)
```

## Configuration

Administrators have the liberty to fine-tune the reputation factors and weights to best suit their needs. These following settings are available in the server's configuration file:

- `spam-filter.reputation.enable`: Enables or disables the sender reputation feature.
- `spam-filter.reputation.expiry`: The duration for which the reputation scores are retained.
- `spam-filter.reputation.score`: The adjustment factor for the spam score.
- `spam-filter.reputation.factor`: The diminishing factor for older scores.
- `spam-filter.reputation.weight.ip`: The weight assigned to the IP address.
- `spam-filter.reputation.weight.domain`: The weight assigned to the domain.
- `spam-filter.reputation.weight.asn`: The weight assigned to the ASN.
- `spam-filter.reputation.weight.sender`: The weight assigned to the sender address.

Example:

```toml
[spam-filter.reputation]
enable = true"
expiry = "30d"
score = "0.98"
factor = "0.5"

[spam-filter.reputation.weight]
ip = "0.2"
domain = "0.2"
asn = "0.1"
sender = "0.5"
```