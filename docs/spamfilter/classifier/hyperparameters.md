---
sidebar_position: 3
---

# Hyperparameters

Hyperparameters are configuration values that control how the classifier model is structured and how learning is performed. Unlike model parameters, which are learned from data during training, hyperparameters are fixed in advance and determine properties such as the size of the feature space, the behaviour of the optimiser, and how input features are scaled. Correct hyperparameter choices are essential for stable training and reliable classification.

Hyperparameters live on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton (found in the WebUI under <!-- breadcrumb:SpamClassifier --><!-- /breadcrumb:SpamClassifier -->), inside the selected model variant. The `FtrlFh` variant uses feature hashing; the `FtrlCcfh` variant uses cuckoo feature hashing and carries a second, dedicated hyperparameter set for the cuckoo indicator.

## Feature space size

By default the classifier uses a feature space of size 2²⁰. The feature space defines the number of distinct weight slots available to the model after feature hashing has been applied. Each extracted feature is mapped, via hashing, to one of these slots, and the corresponding weight contributes to the final classification score. A larger feature space reduces the probability of collisions between unrelated features, improving accuracy at the cost of increased memory usage. A smaller feature space conserves memory but increases collision rates. The default represents a balance that works well for most deployments.

The feature-space size is set through [`numFeatures`](/docs/ref/object/spam-classifier#numfeatures) on the [`parameters`](/docs/ref/object/spam-classifier#parameters) object, expressed as the exponent of 2 (so `"20"` corresponds to 2²⁰).

## Feature normalisation

Before features are presented to the classifier, Stalwart applies feature normalisation to improve numerical stability and learning efficiency. By default, sublinear term-frequency scaling is used, implemented as a `log1p` transformation. This reduces the influence of very frequent features by compressing their magnitude, while still preserving relative differences. In practice, this prevents repeated tokens or patterns from dominating the model purely because of frequency.

After scaling, features are L2-normalised using the Euclidean norm. This step ensures that the overall feature vector has unit length, making predictions less sensitive to variations in message length and feature count. L2 normalisation also improves the behaviour of gradient-based optimisation methods such as FTRL by keeping updates well-conditioned.

Sublinear term-frequency scaling and L2 normalisation are both enabled by default and are suitable for most environments. They can be disabled when integrating externally normalised features or for experimental purposes, though doing so may affect training stability and classification quality. The corresponding fields on each model variant are [`featureLogScale`](/docs/ref/object/spam-classifier#featurelogscale) and [`featureL2Normalize`](/docs/ref/object/spam-classifier#featurel2normalize).

## FTRL optimiser settings

The classifier is trained using the FTRL-Proximal optimiser, which exposes several hyperparameters that influence learning dynamics. The parameter α controls the base learning rate and determines how aggressively the model updates its weights in response to new samples. The parameter β stabilises learning by smoothing adaptive learning rates over time. The L1 ratio and L2 ratio control the strength of L1 and L2 regularisation respectively, influencing sparsity and weight magnitude.

These settings interact in subtle ways and have a significant impact on convergence, stability, and generalisation. The default values have been chosen to provide stable behaviour across a wide range of workloads, and modifying them is not recommended without a solid background in machine learning and a clear understanding of the trade-offs involved.

The optimiser parameters live on the `FtrlParameters` nested type at [`parameters.alpha`](/docs/ref/object/spam-classifier#alpha), [`parameters.beta`](/docs/ref/object/spam-classifier#beta), [`parameters.l1Ratio`](/docs/ref/object/spam-classifier#l1ratio), and [`parameters.l2Ratio`](/docs/ref/object/spam-classifier#l2ratio), alongside [`parameters.numFeatures`](/docs/ref/object/spam-classifier#numfeatures).

## Configuration

Configure the model variant and its hyperparameters through the [`model`](/docs/ref/object/spam-classifier#model) field on SpamClassifier. For the default `FtrlFh` variant, the fields are:

- [`featureLogScale`](/docs/ref/object/spam-classifier#featurelogscale): when `true`, enables sublinear term-frequency scaling. Default `true`.
- [`featureL2Normalize`](/docs/ref/object/spam-classifier#featurel2normalize): when `true`, enables L2 normalisation of feature vectors. Default `true`.
- [`parameters.numFeatures`](/docs/ref/object/spam-classifier#numfeatures): feature-space size as a power of two. Default `"20"` (2²⁰ = 1,048,576).
- [`parameters.alpha`](/docs/ref/object/spam-classifier#alpha): FTRL learning rate. Default `2.0`.
- [`parameters.beta`](/docs/ref/object/spam-classifier#beta): FTRL smoothing parameter. Default `1.0`.
- [`parameters.l1Ratio`](/docs/ref/object/spam-classifier#l1ratio): FTRL L1 regularisation strength. Default `0.001`.
- [`parameters.l2Ratio`](/docs/ref/object/spam-classifier#l2ratio): FTRL L2 regularisation strength. Default `0.0001`.

Example showing the defaults explicitly:

```json
{
  "model": {
    "@type": "FtrlFh",
    "featureLogScale": true,
    "featureL2Normalize": true,
    "parameters": {
      "numFeatures": "20",
      "alpha": 2.0,
      "beta": 1.0,
      "l1Ratio": 0.001,
      "l2Ratio": 0.0001
    }
  }
}
```

When cuckoo feature hashing is in use (the `FtrlCcfh` variant), a second set of hyperparameters applies specifically to the cuckoo indicator training process. These are carried on [`indicatorParameters`](/docs/ref/object/spam-classifier#indicatorparameters) and have the same meaning as the primary `parameters` object. By default the indicator uses a feature-space size of 2¹⁸ (262,144). Example:

```json
{
  "model": {
    "@type": "FtrlCcfh",
    "featureLogScale": true,
    "featureL2Normalize": true,
    "parameters": {
      "numFeatures": "20",
      "alpha": 2.0,
      "beta": 1.0,
      "l1Ratio": 0.001,
      "l2Ratio": 0.0001
    },
    "indicatorParameters": {
      "numFeatures": "18",
      "alpha": 2.0,
      "beta": 1.0,
      "l1Ratio": 0.001,
      "l2Ratio": 0.0001
    }
  }
}
```
