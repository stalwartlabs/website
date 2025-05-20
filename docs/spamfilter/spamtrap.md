---
sidebar_position: 13
---

# Spamtrap

The ongoing war against spam requires innovative and multifaceted strategies. One such strategy, known as a spam trap, serves as a deceptive mechanism to lure in spammers, thereby allowing for the identification and mitigation of spam sources.

A spam trap is an email address specifically set up to attract spam. These addresses are not used for regular communication and do not belong to real users. Any email sent to a spam trap address is, by definition, unsolicited, making it a reliable indicator of spam or other malicious activities.

One of the significant advantages of a spam trap is its ability to aid in the continual training and refining of spam classifiers. When a message is received in the spam trap, it provides a clear sample of spam. Stalwart automatically utilizes these trapped messages to train its [spam classifier](/docs/spamfilter/classifier), ensuring the classifier remains updated with the latest spam patterns and tactics.

The list of spam trap email addresses can be customized by administrators and is located in the `spam-trap` lookup list. When a message is identified as having entered the spam trap, it is tagged with the `SPAMTRAP` label. By default, this tag is associated with a "discard" action, ensuring that the spam message is immediately discarded and doesn't reach any real inbox.

However, recognizing the diverse needs of different setups, Stalwart provides flexibility in how the `SPAMTRAP` tag is handled. Administrators can alter the default behavior associated with this tag by making adjustments in the [Spam scores](/docs/spamfilter/settings/scores).

In essence, the spam trap serves as both a honeypot to identify spammers and a valuable resource for improving the accuracy of spam detection mechanisms.