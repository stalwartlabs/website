---
sidebar_position: 1
---

# Overview

Stalwart’s spam classifier is a statistical learning system designed to make explicit, auditable decisions about whether a message should be treated as spam or ham. At its core, the classifier is a linear machine learning model trained using logistic regression. Linear models provide predictable behavior, fast inference, and well-understood convergence properties, which are essential for a mail system that must operate continuously and at scale.

Training and online updates are performed using the [FTRL-Proximal](https://dl.acm.org/doi/10.1145/2487575.2488200) (Follow-The-Regularized-Leader) optimizer. FTRL-Proximal is particularly well suited to sparse, high-dimensional feature spaces such as those encountered in email classification. It combines the benefits of adaptive per-feature learning rates with L1 and L2 regularization, allowing the model to converge quickly while naturally driving uninformative features toward zero. This results in a compact model that adapts rapidly to new data, remains numerically stable under continuous updates, and avoids uncontrolled growth in parameter size as new features appear.

To efficiently represent the extremely large number of potential features extracted from message content, headers, and metadata, the classifier relies on feature hashing as described in [Feature Hashing for Large Scale Multitask Learning](https://arxiv.org/abs/0902.2206). Instead of maintaining an explicit dictionary of all observed features, each feature is deterministically mapped into a fixed-size parameter space. This approach provides constant memory usage, eliminates the need for feature bookkeeping, and allows the model to scale to millions of distinct signals with predictable resource consumption. While hash collisions are possible, in practice they introduce bounded noise that the learning algorithm can tolerate, especially when combined with regularization.

For large deployments, specifically those with more than 100,000 users, Stalwart employs cuckoo feature hashing as described in [Cuckoo feature hashing: dynamic weight sharing for sparse analytics](https://dl.acm.org/doi/10.5555/3304889.3304956). Cuckoo feature hashing reduces collision rates while preserving the memory efficiency of traditional feature hashing. This allows the classifier to maintain higher accuracy and more stable learning behavior in environments where the volume and diversity of features would otherwise lead to excessive interference.

The classifier learns continuously from user feedback. When users mark messages as spam or ham, these labels are incorporated into the training process and directly influence future classification decisions. Over time, the model learns the statistical patterns that distinguish unwanted messages from legitimate correspondence, adapting automatically as those patterns evolve. In addition to individual learning, Stalwart supports collaborative filtering: signals derived from one user’s classifications can be shared, in a controlled manner, to improve detection for other users. This enables faster recognition of new spam campaigns without requiring every user to encounter them independently.

At the same time, the system respects user-specific preferences. Users may define their own criteria for what constitutes spam or ham, and these preferences are learned alongside global patterns. The result is a classifier that combines global knowledge with local adaptation, providing consistent behavior across the system while still allowing individual users to influence how their mail is classified.

## Feature Hashing

The spam classifier operates in a feature space that is extremely large, sparse, and continuously evolving. Message content, headers, structural properties, and metadata can easily give rise to millions of distinct features, many of which may only be observed a small number of times. Explicitly storing and managing a dictionary that maps each feature to a unique index would be prohibitively expensive in both memory and maintenance cost. To address this, Stalwart uses feature hashing as its primary feature representation technique.

Feature hashing, sometimes referred to as the “hashing trick,” maps each feature to an index in a fixed-size vector using a hash function, as described in [Feature Hashing for Large Scale Multitask Learning](https://arxiv.org/abs/0902.2206). Instead of allocating new parameters for every newly observed feature, the hash function deterministically assigns the feature to one of a fixed number of bins. The classifier then learns weights for these bins rather than for individual features. Because the dimensionality of the model is fixed in advance, memory usage is predictable and bounded, independent of the number of distinct features encountered over time.

The paper shows that feature hashing preserves the essential geometry of the original feature space under reasonable assumptions. Collisions, where multiple features map to the same index, introduce noise rather than systematic bias. For linear models trained with regularization, this noise is typically well controlled and has little impact on accuracy in practice. Feature hashing also has important practical advantages: it avoids costly dictionary lookups, enables constant-time feature insertion, and works naturally with online learning algorithms such as FTRL-Proximal. For these reasons, standard feature hashing is the default and preferred representation in Stalwart, as it provides the best performance characteristics and simplest implementation.

As the scale of the system increases, however, the probability and impact of hash collisions also increase. This becomes particularly relevant in deployments where a very large number of users contribute individual training data. When users tag messages as spam or ham, the classifier effectively learns user-specific and shared patterns, increasing the diversity of active features. At sufficient scale, collisions between unrelated but informative features can begin to degrade classification accuracy.

To address this, Stalwart supports cuckoo feature hashing, based on the approach described in [Cuckoo feature hashing: dynamic weight sharing for sparse analytics](https://www.ijcai.org/proceedings/2018/0295.pdf). Cuckoo feature hashing extends the basic hashing trick by using multiple hash functions and a small associative structure inspired by cuckoo hashing. Each feature can be placed in one of several candidate locations, significantly reducing collision rates compared to single-hash schemes, while still maintaining a fixed memory footprint. The paper demonstrates that this approach retains the computational efficiency of feature hashing while improving accuracy in high-load regimes where collisions would otherwise dominate.

In practice, standard feature hashing should be used whenever possible, as it is faster and simpler, and its collision behavior is well tolerated by linear models in most environments. Cuckoo feature hashing should be enabled when there is evidence of accuracy degradation attributable to hash collisions, or proactively in large-scale deployments. As a conservative guideline, systems with more than 100,000 users who actively train the classifier by tagging messages as spam or ham should use cuckoo feature hashing to reduce collision-induced interference and maintain stable classification performance.

## Classifier Tags

The spam classifier produces a continuous output that represents the model’s estimated likelihood that a message is spam. More precisely, the classifier computes a posterior probability derived from the logistic regression model, with values in the range ([0, 1]), where lower values indicate a higher likelihood of ham and higher values indicate a higher likelihood of spam. This probabilistic output is not used directly in the global spam score. Instead, it is mapped to discrete classifier tags, each of which contributes a predefined score to the overall evaluation.

This mapping serves two purposes. First, it translates a continuous probability into a small, interpretable set of outcomes that can be reasoned about and configured. Second, it allows the classifier’s influence to be combined with other, non-statistical signals using the same scoring framework.

The probability-to-tag mapping is defined as follows. If the estimated probability (p) is below 0.15, the message is tagged as `PROB_HAM_HIGH`. If (p) is below 0.25, it is tagged as `PROB_HAM_MEDIUM`. If (p) is below 0.40, it is tagged as `PROB_HAM_LOW`. Probabilities below 0.60 result in the tag `PROB_SPAM_UNCERTAIN`, which represents an ambiguous classification. If (p) is below 0.75, the tag is `PROB_SPAM_LOW`. If (p) is below 0.85, the tag is `PROB_SPAM_MEDIUM`. Any higher finite probability results in the tag `PROB_SPAM_HIGH`. In the unlikely event that the probability is not a finite number, the classifier falls back to `PROB_SPAM_UNCERTAIN`.

Each of these tags is associated with a default score that contributes to the global spam score. Strong ham indications produce negative scores, strong spam indications produce positive scores, and uncertain outcomes contribute no score. By default, the scores are assigned as follows. `PROB_HAM_HIGH` contributes −8.0, `PROB_HAM_MEDIUM` contributes −6.0, and `PROB_HAM_LOW` contributes −2.0. The `PROB_SPAM_UNCERTAIN` tag contributes 0.0. On the spam side, `PROB_SPAM_LOW` contributes 2.0, `PROB_SPAM_MEDIUM` contributes 6.0, and `PROB_SPAM_HIGH` contributes 8.0.

This design ensures that the classifier’s influence on the final decision is proportional to its confidence, while still allowing other components of the spam filtering system to reinforce or counterbalance its assessment.

## Configuration

The spam classifier is enabled and configured through the `spam-filter.classifier.model` setting. This setting selects which classifier backend to run (or disables classification entirely). Possible values are:

- `ftrl-fh`: Enables the classifier using **FTRL-Proximal** training with **standard feature hashing**. This is the recommended default for most deployments due to its simplicity, speed, and predictable memory usage.
- `ftrl-ccfh`: Enables the classifier using **FTRL-Proximal** training with **cuckoo feature hashing**. This reduces hash collisions compared to standard feature hashing and is intended for large-scale deployments (for example, when many users actively train the classifier) or when collisions are suspected to impact accuracy.
- `disabled`: Disables the spam classifier. No model inference is performed and feedback-based training updates are not applied.

By default, Stalwart uses the `ftrl-fh` model, which provides a good balance of performance and resource usage for typical deployments.

Example:

```toml
[spam-filter.classifier]
model = "ftrl-fh"
```

