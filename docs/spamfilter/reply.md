---
sidebar_position: 9
---

# Reply Tracking

Ensuring the seamless flow of legitimate communication while filtering out spam is a challenge that Stalwart Mail Server adeptly addresses with its Reply Tracking feature. This mechanism plays a crucial role in recognizing and prioritizing genuine email exchanges over potential spam.

## Trusted Replies

Whenever an authenticated user sends an email through Stalwart Mail Server, the system automatically captures and stores the Message ID of that email. This data is retained in the server's databases for a duration of up to 30 days (which is configurable from the `spam-filter` Sieve script). Now, when an incoming email is received by the server, the spam filter scrutinizes its 'References' and 'In-Reply-To' headers, looking for any of the stored Message IDs. If a match is found, it signifies that the incoming email is a reply to a message previously sent by an authenticated user of the server.

Recognizing the genuine nature of such email exchanges, the spam filter labels the incoming message with the `TRUSTED_REPLY` tag. This tag carries a negative score, categorizing the message as 'ham' or legitimate. Consequently, this ensures that genuine replies to authentic communications are not mistakenly flagged as spam, thereby facilitating uninterrupted and trust-worthy email interactions.

## Auto-learning

Stalwart Mail Server also offers the capability to utilize these genuine interactions for enhancing its spam classification accuracy. This is achieved through an automatic training mechanism built into the server. When the server identifies a trusted reply, it can automatically feed this message to the spam classifier, labeling it as 'ham' or legitimate. This process helps the classifier better understand and recognize genuine email patterns, thereby refining its accuracy in distinguishing between spam and legitimate emails.

For administrators wishing to harness this feature, the configuration is straightforward. In the `spam-filter` Sieve script, there's a variable named `AUTOLEARN_REPLIES_HAM`. By setting this variable to `true`, the server is instructed to automatically train the spam classifier using trusted replies. While this feature is enabled by default, administrators have the flexibility to toggle it as per their preferences.
