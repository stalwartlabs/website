---
sidebar_position: 3
---

# Database

The spam filter relies on the default [in-memory store](/docs/storage/in-memory) in order to maintain and manage various crucial pieces of information. The information stored in the in-memory store is essential for the spam filter to function effectively and make informed decisions on incoming emails. Some of the key data stored in this store includes:

- **Bayes Classifier Weights**: The database retains the weights associated with each token as determined by the Bayes classifier. This enables the spam filter to learn and adapt over time by understanding patterns in incoming emails, enhancing its accuracy in distinguishing between spam and legitimate messages.
- **Message IDs for Tracking Replies**: The database maintains records of message IDs for emails sent by authenticated senders to effectively track replies. When a reply from a known sender is received, it's assigned a tag with a negative score. This practice is rooted in the understanding that a reply from a previously authenticated sender is likely legitimate, thereby reducing the probability of it being classified as spam. This tracking mechanism aids in ensuring genuine communication flows seamlessly without being inadvertently flagged as spam.
- **Reputation Tracking**: The reputation of various entities is stored and managed in the database. This includes the reputation of IP addresses, ASNs (Autonomous System Numbers), sender domains, and individual email addresses. By tracking the reputation, the system can make informed decisions on incoming emails based on the sender's historical behavior.

By default, during the installation process, the system is configured to use as spam database the same [data store](/docs/storage/in-memory) used to store emails and settings. This is the most straightforward approach, as it requires no additional configuration. However, some system administrators might prefer to use a different database for the spam filter such as [Redis](/docs/storage/backends/redis).
