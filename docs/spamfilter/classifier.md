---
sidebar_position: 3
---

# Bayes Classifier

Built into Stalwart is a spam classifier designed to effectively identify and manage unsolicited emails. This classifier is hybrid in nature, leveraging the strengths of two popular statistical methods: **Naive Bayes** and **Inverse Chi-Square**. Depending on the specific characteristics and nuances of a given message, the classifier intelligently chooses between these two methods to ensure optimal accuracy in spam detection.

Before delving into the classification process, each incoming message undergoes a series of preparatory steps:

- **Language Detection**: The classifier first determines the primary language of the message. This ensures that subsequent processes, like word stemming, are tailored to the specific linguistic structure and idiosyncrasies of the detected language.
- **Stop Word Removal**: Common words that don't contribute significantly to the meaning of the text, known as "stop words," are removed. This step reduces noise and allows the classifier to focus on words that are more indicative of the message's intent.
- **Word Stemming**: The classifier then reduces words to their base or root form. For instance, "running" becomes "run." This process, called stemming, ensures that words with similar meanings, despite being in different forms, are treated as equivalents, thereby enhancing the classifier's analytical capability.

The classifier then employs a tokenization technique known as **Orthogonal Sparse Bigrams (OSB)** with a window size of 5. In OSB tokenization, the message is analyzed in chunks, where each chunk (or window) comprises five words. Bigrams, which are pairs of words, are extracted from this window in various combinations. These bigrams are orthogonal, meaning they capture relationships between non-adjacent words within the window, ensuring a comprehensive understanding of the message's context and structure. This technique aids in identifying patterns and relationships in the text that are crucial for accurate spam classification.

The Bayes classifier is enabled by default in Stalwart, providing a robust defense against unwanted emails. However, administrators can disable it globally by setting the `spam-filter.bayes.enable` setting to `false`. 

## Training

Ensuring the efficiency of the spam classifier necessitates regular training, adapting it to ever-evolving email trends and patterns. This training can be undertaken in two distinct manners:

- **Manual Training**: Users or administrators can manually feed the classifier with samples of spam and legitimate emails. This hands-on approach allows for targeted refinement, especially useful when addressing specific or novel types of unsolicited emails.
- **Automatic Training**: The classifier is also designed to self-train, automatically refining its parameters when an email's spam score surpasses a predetermined threshold. This automated approach ensures that the classifier remains up-to-date with minimal human intervention.

Central to this training process is the configuration of the `spam-filter.bayes.classify.balance` setting, which plays a pivotal role in ensuring the balance between learned spam (unsolicited) and ham (legitimate) emails. The spam/ham balance is essentially a mechanism to maintain a relative equilibrium between the number of spam and ham emails the classifier learns from. By setting the `spam-filter.bayes.classify.balance` to "0.9", for instance, we ensure that the difference between the counts of learned spam and ham emails remains at least 0.9. This balance is crucial as it prevents the classifier from becoming biased towards one category over the other, ensuring that it remains effective in discerning both spam and legitimate emails.

## Classification

For the spam classifier to function at its optimum, it relies on a set of parameters that guide its decision-making process. These parameters are finely tunable, allowing administrators to adapt the classifier to specific environments or challenges.  

The key parameters are:

- **Minimum Token Hits (default: 2)**: The `spam-filter.bayes.classify.tokens.hits` setting specifies the least number of occurrences a token must have in the training data to be considered in the classification process. By setting this to 2, it means that a token (or word/phrase) must have appeared at least twice in previous emails for it to influence the classification of a new email. This helps in filtering out noise and focuses on repetitive patterns that are more indicative of spam or ham.
- **Minimum Tokens (default: 11)**: The `spam-filter.bayes.classify.tokens.min` setting indicates that, for an email to be classified, it should contain at least this number of tokens. If an email has fewer tokens than this threshold, the classifier might skip it. This ensures that the classifier has sufficient data to make an informed decision.
- **Minimum Probability Strength (default: 0.05)**: The `spam-filter.bayes.classify.strength"` setting is a threshold for the strength of the token's probability to influence classification. Tokens with a probability strength less than this value won't significantly sway the classification. This ensures that only tokens with a clear inclination towards being spam or ham play a role in the decision-making process.
- **Minimum Learns (default: 200)**: Before the classifier becomes operational, it needs to learn from a minimum number of emails to ensure its judgments are based on a substantial data set. The `spam-filter.bayes.classify.learns` setting sets that baseline. Until the classifier has learned from at least 200 emails (spam and ham combined), it might not begin its classification.
- **Spam threshold (default: 0.7)**: The `spam-filter.bayes.score.spam` setting determines the threshold at which an email is classified as spam. If the email's spam probability exceeds this threshold, it will be marked as spam. By default, this threshold is set at 0.7, indicating that an email is classified as spam if its spam probability is 70% or higher.
- **Ham threshold (default: 0.5)**: Conversely, the `spam-filter.bayes.score.ham` setting specifies the threshold for classifying an email as ham. If the email's ham probability exceeds this threshold, it will be marked as legitimate. The default ham threshold is 0.5, meaning that an email is classified as ham if its ham probability is 50% or higher.

When the classifier determines that a message leans towards being spam, it assigns the `BAYES_SPAM` tag. This tag carries a positive score, signifying a higher likelihood of the message being unsolicited. Conversely, if the classifier deems a message to likely be legitimate or 'ham,' it appends the `BAYES_HAM` tag. This tag is associated with a negative score, indicating a lower probability of the message being spam. These tags, along with their respective scores, provide a clear and concise summary of the classifier's judgment, aiding further in the filtering process.

## Automatic learning

The process of training the spam classifier doesn't always necessitate manual intervention. With the autolearn feature, the system is equipped to use its existing knowledge and automatically train itself based on the scores of incoming messages. This dynamic learning approach ensures that the classifier continually adapts to evolving email patterns, enhancing its accuracy over time.

Here's how autolearning works: If an incoming message's score significantly exceeds or falls below certain thresholds, the system will automatically treat it as a sample of spam or ham, respectively, and use it to train the classifier. This approach leverages the system's current understanding to further refine its future judgments.

The following parameters governing the autolearn feature can be configured:

- `spam-filter.bayes.auto-learn.enable` (default: "true"): This parameter determines whether the autolearn feature is active. By setting this to "true", the system will automatically train the classifier based on the defined score thresholds.
- `spam-filter.bayes.auto-learn.threshold.ham` (default: "-1.0"): If an email's score is equal to or greater than this threshold (in this case, -0.5), it is deemed to be a legitimate email or 'ham'. The classifier will then use this message to learn characteristics of legitimate emails.
- `spam-filter.bayes.auto-learn.threshold.spam` (default: "6.0"): Conversely, if an email's score is equal to or less than this threshold (in this instance, 6.0), the system perceives it as spam. This message will then serve as a sample to train the classifier on spam attributes.
- `spam-filter.bayes.auto-learn.trusted-reply` (default: "true"): This parameter determines whether the autolearn feature should consider [replies to trusted emails](/docs/spamfilter/reply) as legitimate. By setting this to "true", the classifier will treat replies to trusted emails as ham samples, aiding in the refinement of its ham classification.

By adjusting these parameters, administrators can fine-tune the autolearn feature to the unique demands of their email environment. This automated training mechanism ensures the spam classifier remains agile and responsive to the ever-changing landscape of email communications.

## Account training

Stalwart offers users the ability to train the spam classifier based on their individual preferences and email patterns. This user-specific training model allows users to refine the classifier's judgment by moving messages to and from the Junk Mail folder or by adding or removing the `$Junk` flag to messages.

When a user moves an email to the Junk Mail folder or adds the `$Junk` flag to a message, the classifier interprets this action as a signal that the email is spam. Conversely, moving an email out of the Junk Mail folder or removing the `$Junk` flag indicates that the email is legitimate or 'ham'. These user actions serve as training data for the classifier, enabling it to learn from individual user interactions and tailor its classification to each user's preferences.

### Configuration

By default, user-specific training is disabled in Stalwart. To enable this feature, administrators can set the `spam-filter.bayes.account.enable` parameter to `true`. This setting activates the user-specific training model, allowing users to train the spam classifier based on their interactions with emails.

### Thresholds

Just like the global classifier, the user-specific Bayes classifier employs two distinct thresholds to determine whether an email is spam or ham. These thresholds, namely the spam threshold and the ham threshold, are configurable parameters that influence the classifier's decision-making process.

- `spam-filter.bayes.account.score.spam` (default: "0.7"): This setting defines the threshold at which an email is classified as spam. If the email's spam probability exceeds this threshold, it will be marked as spam. By default, this threshold is set at 0.7, indicating that an email is classified as spam if its spam probability is 70% or higher.
- `spam-filter.bayes.account.score.ham` (default: "0.5"): Conversely, this setting specifies the threshold for classifying an email as ham. If the email's ham probability exceeds this threshold, it will be marked as legitimate. The default ham threshold is 0.5, meaning that an email is classified as ham if its ham probability is 50% or higher.

### Headers

The user-specific Bayes classifier can append headers to incoming messages to provide detailed insights into the classification process. These headers offer a transparent view of the classifier's decision-making, aiding administrators in understanding how emails are categorized and ensuring that the filtering process aligns with organizational policies.

Whether to include these headers and their names can be configured using the following settings:

- `spam-filter.header.bayes.enable` (default: "true"): This setting determines whether the Bayes classifier headers should be added to incoming messages. By setting this to "true", the headers will be included, offering detailed insights into the classification process.
- `spam-filter.header.bayes.name` (default: "X-Spam-Bayes"): This parameter specifies the name of the header added by the Bayes classifier. The default name is "X-Spam-Bayes". Administrators can customize this name to align with their organization's conventions or preferences.

```toml
[spam-filter.header.bayes]
enable = true
name = "X-Spam-Bayes"
``