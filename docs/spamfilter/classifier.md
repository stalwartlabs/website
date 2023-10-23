---
sidebar_position: 3
---

# Spam Classifier

Built into Stalwart Mail Server is a spam classifier designed to effectively identify and manage unsolicited emails. This classifier is hybrid in nature, leveraging the strengths of two popular statistical methods: **Naive Bayes** and **Inverse Chi-Square**. Depending on the specific characteristics and nuances of a given message, the classifier intelligently chooses between these two methods to ensure optimal accuracy in spam detection.

Before delving into the classification process, each incoming message undergoes a series of preparatory steps:

- **Language Detection**: The classifier first determines the primary language of the message. This ensures that subsequent processes, like word stemming, are tailored to the specific linguistic structure and idiosyncrasies of the detected language.
- **Stop Word Removal**: Common words that don't contribute significantly to the meaning of the text, known as "stop words," are removed. This step reduces noise and allows the classifier to focus on words that are more indicative of the message's intent.
- **Word Stemming**: The classifier then reduces words to their base or root form. For instance, "running" becomes "run." This process, called stemming, ensures that words with similar meanings, despite being in different forms, are treated as equivalents, thereby enhancing the classifier's analytical capability.

The classifier then employs a tokenization technique known as **Orthogonal Sparse Bigrams (OSB)** with a window size of 5. In OSB tokenization, the message is analyzed in chunks, where each chunk (or window) comprises five words. Bigrams, which are pairs of words, are extracted from this window in various combinations. These bigrams are orthogonal, meaning they capture relationships between non-adjacent words within the window, ensuring a comprehensive understanding of the message's context and structure. This technique aids in identifying patterns and relationships in the text that are crucial for accurate spam classification.

## Training

Ensuring the efficiency of the spam classifier necessitates regular training, adapting it to ever-evolving email trends and patterns. This training can be undertaken in two distinct manners:

- **Manual Training**: Users or administrators can manually feed the classifier with samples of spam and legitimate emails. This hands-on approach allows for targeted refinement, especially useful when addressing specific or novel types of unsolicited emails.
- **Automatic Training**: The classifier is also designed to self-train, automatically refining its parameters when an email's spam score surpasses a predetermined threshold. This automated approach ensures that the classifier remains up-to-date with minimal human intervention.

Central to this training process is the configuration of the **AUTOLEARN_SPAM_HAM_BALANCE** variable, accessible via the `config.sieve` file. This variable plays a pivotal role in ensuring the balance between learned spam (unsolicited) and ham (legitimate) emails.

```sieve
# Keep difference for spam/ham learns for at least this value
let "AUTOLEARN_SPAM_HAM_BALANCE" "0.9";
```

The spam/ham balance is essentially a mechanism to maintain a relative equilibrium between the number of spam and ham emails the classifier learns from. By setting the `AUTOLEARN_SPAM_HAM_BALANCE` to "0.9", for instance, we ensure that the difference between the counts of learned spam and ham emails remains at least 0.9. This balance is crucial as it prevents the classifier from becoming biased towards one category over the other, ensuring that it remains effective in discerning both spam and legitimate emails.

## Classification

For the spam classifier to function at its optimum, it relies on a set of parameters that guide its decision-making process. These parameters are finely tunable, allowing administrators to adapt the classifier to specific environments or challenges. The parameters for the classifier are configurable from the `etc/spamfilter/scripts/bayes_classify.sieve` sieve script. 

The key parameters are:

- **Minimum Token Hits (default: 2)**: This parameter specifies the least number of occurrences a token must have in the training data to be considered in the classification process. By setting this to 2, it means that a token (or word/phrase) must have appeared at least twice in previous emails for it to influence the classification of a new email. This helps in filtering out noise and focuses on repetitive patterns that are more indicative of spam or ham.
- **Minimum Tokens (default: 11)**: For an email to be classified, it should contain at least this number of tokens. If an email has fewer tokens than this threshold, the classifier might skip it. This ensures that the classifier has sufficient data to make an informed decision.
- **Minimum Probability Strength (default: 0.05)**: This is a threshold for the strength of the token's probability to influence classification. Tokens with a probability strength less than this value won't significantly sway the classification. This ensures that only tokens with a clear inclination towards being spam or ham play a role in the decision-making process.
- **Minimum Learns (default: 200)**: Before the classifier becomes operational, it needs to learn from a minimum number of emails to ensure its judgments are based on a substantial data set. This parameter sets that baseline. Until the classifier has learned from at least 200 emails (spam and ham combined), it might not begin its classification.

When the classifier determines that a message leans towards being spam, it assigns the `BAYES_SPAM` tag. This tag carries a positive score, signifying a higher likelihood of the message being unsolicited. Conversely, if the classifier deems a message to likely be legitimate or 'ham,' it appends the `BAYES_HAM` tag. This tag is associated with a negative score, indicating a lower probability of the message being spam. These tags, along with their respective scores, provide a clear and concise summary of the classifier's judgment, aiding further in the filtering process.

## Automatic learning

The process of training the spam classifier doesn't always necessitate manual intervention. With the autolearn feature, the system is equipped to use its existing knowledge and automatically train itself based on the scores of incoming messages. This dynamic learning approach ensures that the classifier continually adapts to evolving email patterns, enhancing its accuracy over time.

Here's how autolearning works: If an incoming message's score significantly exceeds or falls below certain thresholds, the system will automatically treat it as a sample of spam or ham, respectively, and use it to train the classifier. This approach leverages the system's current understanding to further refine its future judgments.

Key parameters governing the autolearn feature can be configured from the `etc/spamfilter/scripts/config.sieve` file:

- **AUTOLEARN_ENABLE (default: "true")**: This parameter determines whether the autolearn feature is active. By setting this to "true", the system will automatically train the classifier based on the defined score thresholds.
- **AUTOLEARN_HAM_THRESHOLD (default: "-0.5")**: If an email's score is equal to or greater than this threshold (in this case, -0.5), it is deemed to be a legitimate email or 'ham'. The classifier will then use this message to learn characteristics of legitimate emails.
- **AUTOLEARN_SPAM_THRESHOLD (default: "6.0")**: Conversely, if an email's score is equal to or less than this threshold (in this instance, 6.0), the system perceives it as spam. This message will then serve as a sample to train the classifier on spam attributes.

By adjusting these parameters, administrators can fine-tune the autolearn feature to the unique demands of their email environment. This automated training mechanism ensures the spam classifier remains agile and responsive to the ever-changing landscape of email communications.