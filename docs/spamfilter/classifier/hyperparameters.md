---
sidebar_position: 3
---

# Hyperparameters

Hyperparameters are configuration values that control how the model is structured and how learning is performed. Unlike model parameters, which are learned from data during training, hyperparameters are fixed in advance and determine properties such as the size of the feature space, the behavior of the optimizer, and how input features are scaled. Correct hyperparameter choices are essential for stable training and reliable classification behavior.

## Features space size

By default, the classifier uses a feature space of size 2²⁰. The feature space defines the number of distinct weight slots available to the model after feature hashing has been applied. Each extracted feature is mapped, via hashing, to one of these slots, and the corresponding weight contributes to the final classification score. A larger feature space reduces the probability of collisions between unrelated features, improving accuracy at the cost of increased memory usage. A smaller feature space conserves memory but increases collision rates. The default value represents a balance that works well for most deployments.

## Features normalization

Before features are presented to the classifier, Stalwart applies feature normalization to improve numerical stability and learning efficiency. By default, sublinear term frequency scaling is used, implemented as a log1p transformation. This reduces the influence of very frequent features by compressing their magnitude, while still preserving relative differences. In practice, this helps prevent repeated tokens or patterns from dominating the model purely due to frequency.

After scaling, features are L2-normalized using the Euclidean norm. This step ensures that the overall feature vector has unit length, making the classifier’s predictions less sensitive to variations in message length and feature count. L2 normalization also improves the behavior of gradient-based optimization methods such as FTRL by keeping updates well-conditioned.

Both sublinear term frequency scaling and L2 normalization are enabled by default and are suitable for most environments. They can be disabled if necessary, for example to integrate with externally normalized features or for experimental purposes, but doing so may affect training stability and classification quality.

## FTRL optimizer settings

The classifier is trained using the FTRL-Proximal optimizer, which exposes several hyperparameters that influence learning dynamics. The parameter α controls the base learning rate and determines how aggressively the model updates its weights in response to new samples. The parameter β stabilizes learning by smoothing adaptive learning rates over time. The L1 ratio and L2 ratio control the strength of L1 and L2 regularization respectively, influencing sparsity and weight magnitude.

These settings interact in subtle ways and have a significant impact on convergence, stability, and generalization. For this reason, the default values have been chosen to provide robust behavior across a wide range of workloads. Modifying them is not recommended unless the reader has a solid background in machine learning and a clear understanding of the trade-offs involved.

## Configuration

The spam classifier’s hyperparameters are configured through the `spam-filter.classifier.features` and `spam-filter.classifier.parameters` settings. The following options are available:

- `spam-filter.classifier.features.log-scale`: When set to `true`, enables sublinear term frequency scaling using a log1p transformation. The default value is `true`.
- `spam-filter.classifier.features.l2-normalize`: When set to `true`, enables L2 normalization of feature vectors. The default value is `true`.
- `spam-filter.classifier.parameters.features`: Specifies the size of the feature space as a power of two. For example, a value of `20` corresponds to a feature space of size 2²⁰ (1,048,576). The default value is `20`.
- `spam-filter.classifier.parameters.alpha`: Sets the FTRL learning rate. The default value is `2.0`.
- `spam-filter.classifier.parameters.beta`: Sets the FTRL smoothing parameter. The default value is `1.0`.
- `spam-filter.classifier.parameters.l1`: Sets the FTRL L1 regularization strength. The default value is `0.001`.
- `spam-filter.classifier.parameters.l2`: Sets the FTRL L2 regularization strength. The default value is `0.0001`.

When using Cuckoo Feature Hashing, separate hyperparameters can be specified under the `spam-filter.classifier.parameters.ccfh` table. These have the same meanings as above but configure the indicator training process specifically for cuckoo feature hashing.

- `spam-filter.classifier.parameters.ccfh.features`: Specifies the size of the feature space as a power of two for cuckoo feature hashing. The default value is `18` (2¹⁸ = 262,144).
- `spam-filter.classifier.parameters.ccfh.alpha`: Sets the FTRL learning rate for cuckoo feature hashing. The default value is `2.0`.
- `spam-filter.classifier.parameters.ccfh.beta`: Sets the FTRL smoothing parameter for cuckoo feature hashing. The default value is `1.0`.
- `spam-filter.classifier.parameters.ccfh.l1`: Sets the FTRL L1 regularization strength for cuckoo feature hashing. The default value is `0.001`.
- `spam-filter.classifier.parameters.ccfh.l2`: Sets the FTRL L2 regularization strength for cuckoo feature hashing. The default value is `0.0001`.

Example:

```toml

[spam-filter.classifier.features]
log-scale = true # Enable sublinear term frequency scaling
l2-normalize = true # Enable L2 normalization of feature vectors

[spam-filter.classifier.parameters]
features = 20 # Feature space size as a power of two (2^20 = 1,048,576)
alpha = 2.0 # FTRL learning rate
beta = 1.0 # FTRL smoothing parameter
l1 = 0.001 # FTRL L1 regularization strength
l2 = 0.0001 # FTRL L2 regularization strength

[spam-filter.classifier.parameters.ccfh]
features = 18 # Feature space size as a power of two (2^20 = 1,048,576)
alpha = 2.0 # FTRL learning rate
beta = 1.0 # FTRL smoothing parameter
l1 = 0.001 # FTRL L1 regularization strength
l2 = 0.0001 # FTRL L2 regularization strength

```