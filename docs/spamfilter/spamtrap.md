---
sidebar_position: 12
---

# Spamtrap

A spam trap is an email address set up specifically to attract spam. These addresses are not used for regular communication and do not belong to real users, so any message sent to one is, by definition, unsolicited. Spam traps therefore provide a reliable indicator of spam activity.

Beyond flagging individual messages, spam traps also help train and refine the [spam classifier](/docs/spamfilter/classifier/overview). Each message received at a trap address is treated as a clear spam sample; Stalwart can automatically add it to the training data so that the classifier adapts to the latest spam tactics.

The list of spam trap addresses is maintained as an in-memory lookup list entry. Each trap address is a [MemoryLookupKey](/docs/ref/object/memory-lookup-key) (found in the WebUI under <!-- breadcrumb:MemoryLookupKey --><!-- /breadcrumb:MemoryLookupKey -->) in the `spam-trap` namespace. When a delivery matches a configured trap address, the message is tagged with `SPAMTRAP`. By default, this tag is associated with the `Discard` action (via a [SpamTag](/docs/ref/object/spam-tag) object), so messages hitting a trap are dropped silently and never reach a real inbox.

Administrators can change the action associated with the `SPAMTRAP` tag by editing the corresponding [SpamTag](/docs/ref/object/spam-tag) entry under the [Spam scores](/docs/spamfilter/settings/scores) configuration.

Automatic learning from spam traps is controlled by [`learnSpamFromTraps`](/docs/ref/object/spam-classifier#learnspamfromtraps) on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton.

<!-- review: The previous docs referred to the spam-trap list by the lookup identifier `spam-trap`. Confirm that the namespace used for trap addresses on MemoryLookupKey in the current schema is still `spam-trap`, or update the prose to reflect the current namespace. -->
