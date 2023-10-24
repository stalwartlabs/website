---
sidebar_position: 2
---

# Scores

As mentioned in the [tags and scores](/docs/spamfilter/overview#tags-and-scores) section, the spam filter's analysis of incoming messages yields a series of tags, each with a corresponding score. To determine the email's overall classification (spam or ham), scores associated with these tags play a crucial role.

The configuration of these scores is done in the `etc/spamfilter/maps/scores.map` file. Each line in the `scores.map` file denotes a tag and its corresponding action or score. The format used is:

```
TAG [score|"discard"|"reject"]
```

- **Score**: Tags can be assigned either a positive or negative score. A positive score suggests that the presence of this tag increases the likelihood of the message being spam. Conversely, a negative score indicates that the tag's presence makes the message more likely to be legitimate or ham.
- **Discard and Reject Flags**: Instead of a numeric score, tags can also be assigned one of two special flags:
   - **"discard"**: If an email contains a tag with this flag, the entire message will be discarded, meaning it won't reach the recipient's mailbox.
   - **"reject"**: When an email is found with a tag having this flag, the message will be rejected. Typically, the sending server will be notified of this rejection.

For example, consider the following entries from the `scores.map` file:

```
BAYES_HAM -3.0
RBL_SPAMHAUS_DROP 7.0
SPAM_TRAP discard
```

- `BAYES_HAM -3.0`: This line indicates that if the Bayesian filter determines the email to be ham (not spam), a score of -3.0 will be applied, reducing the overall likelihood of the message being classified as spam.
- `RBL_SPAMHAUS_DROP 7.0`: If the email's sender IP is found on the SPAMHAUS_DROP list, a score of 7.0 is added, increasing the chance of the email being categorized as spam.
- `SPAM_TRAP discard`: If the message triggers a spam trap, the action taken is to discard the message, preventing it from reaching the intended recipient.

