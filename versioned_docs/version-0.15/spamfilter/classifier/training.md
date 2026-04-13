---
sidebar_position: 2
---

# Training

The spam classifier is trained periodically to incorporate newly collected training samples into the model. By default, training is performed every 12 hours, although this interval can be adjusted by the administrator to better suit the size, load, and dynamics of the deployment. Shorter intervals allow faster adaptation to new patterns, while longer intervals reduce computational overhead.

In clustered deployments, training is coordinated so that a single node is responsible for executing the training process. This avoids redundant work and ensures that the model is updated in a consistent and deterministic manner. During each training cycle, all training samples that have been added since the previous cycle, whether through user labeling, administrator uploads, or automatic learning, are incorporated into the model. The training process updates the model parameters using these samples, applying the configured optimization and regularization settings.

Once training completes successfully, the updated model is serialized and stored in the [blob store](/docs/storage/blob). From there, it is distributed to all nodes in the cluster and activated for inference. This deployment step ensures that every node evaluates messages using the same model state, providing consistent classification behavior across the entire system.

## Training Samples

A training sample is a labeled email message that is used by the classifier to learn how to distinguish spam from ham. In Stalwart, training samples are obtained primarily through user interaction, when users explicitly tag messages as spam or ham. In addition, administrators may upload labeled messages directly, for example to bootstrap the system, incorporate curated datasets, or correct systematic classification errors. Each training sample contributes features and an associated label that inform the statistical model during training.

Stalwart can be configured to retain training samples for a defined period of time (180 days by default). Retaining samples allows the model to be retrained when necessary, rather than relying solely on incremental updates. Retraining may be required to remove the influence of outdated data, to account for changes in message patterns over long time horizons, or to apply modified model hyperparameters such as regularization strength, learning rates, or feature space size. By keeping a bounded history of labeled messages, the system provides a controlled mechanism for revisiting past training decisions without unbounded storage growth.

The spam classifier requires a minimum number of training samples before it begins making classification decisions. By default, this threshold is set to 100 ham samples and 100 spam samples. This requirement exists to ensure that the model has observed enough examples from both classes to estimate meaningful parameters. Logistic regression relies on statistical regularities across features, and with too few samples the learned weights are unstable, poorly calibrated, and highly sensitive to noise. Enforcing a minimum sample count reduces the risk of arbitrary or misleading classifications during the early stages of deployment and ensures that the classifier begins operating only once it has a minimally representative view of both legitimate and unwanted mail.

## Reservoir Sampling

Stalwart’s spam classifier is trained in an online setting, meaning that model updates occur incrementally as new labeled data becomes available. Each time a user tags a message as spam or ham, the classifier incorporates that observation into its parameter updates. This approach allows the model to adapt continuously to changing message patterns, emerging spam campaigns, and evolving user preferences, without requiring periodic batch retraining or offline processing.

A central challenge in online learning is maintaining class balance. In binary classification tasks such as spam detection, class balance refers to the relative proportion of positive and negative training examples, in this case spam and ham. In real-world mail systems, user feedback is rarely balanced. Users tend to tag spam far more frequently than ham, because legitimate messages often require no action. If left uncorrected, this imbalance can bias the classifier toward overpredicting the majority class, reduce sensitivity to minority-class signals, and degrade probability calibration.

To mitigate this effect, Stalwart employs reservoir sampling as a mechanism for managing training data under imbalance. Reservoir sampling is a randomized algorithm for maintaining a representative subset of a data stream using a fixed amount of memory. As new labeled messages arrive, the algorithm decides probabilistically whether to include each sample in the reservoir, ensuring that, over time, the reservoir approximates a uniform sample of the full stream, regardless of its length.

In the context of spam classification, Stalwart maintains separate reservoirs for training samples, with particular attention to the minority class. When users disproportionately label messages as spam, ham samples are retained in the reservoir so that they continue to contribute to model updates even when new ham labels are infrequent. This prevents the model from “forgetting” legitimate mail patterns and helps preserve a stable decision boundary. Conversely, when the imbalance shifts in the opposite direction, the same mechanism ensures that spam examples remain adequately represented.

By combining online training with reservoir sampling, the classifier achieves both responsiveness and stability. New information is incorporated immediately, while the retained sample reservoirs provide a form of controlled memory that counteracts skewed feedback patterns. This design allows Stalwart to learn effectively from user behavior in realistic, imbalanced environments without resorting to ad hoc weighting schemes or expensive retraining cycles.

## Configuration

The following configuration options are available for the spam classifier’s training process:

- `spam-filter.classifier.training.frequency`: Specifies how often the spam classifier should be retrained using newly collected training samples. The default value is `12h` (every 12 hours). Adjusting this interval allows administrators to balance adaptation speed against computational load.
- `spam-filter.classifier.samples.hold-for`: Defines the duration for which training samples are retained. The default is `180d` (180 days). Retaining samples enables retraining with historical data when necessary.
- `spam-filter.classifier.samples.min-spam`: Sets the minimum number of spam training samples required before the classifier begins making decisions. The default is `100`. This threshold ensures that the model has sufficient data to learn meaningful patterns.
- `spam-filter.classifier.samples.min-ham`: Sets the minimum number of ham training samples required before the classifier begins making decisions. The default is `100`. This threshold ensures that the model has sufficient data to learn meaningful patterns.
- `spam-filter.classifier.samples.reservoir-capacity`: Specifies the maximum number of training samples to retain in the reservoir for balancing class representation. The default is `1024`. This capacity helps manage memory usage while maintaining effective class balance during online learning.

Example:

```toml
[spam-filter.classifier.training]
frequency = "6h"

[spam-filter.classifier.samples]
hold-for = "30d"
min-spam = 100
min-ham = 100
reservoir-capacity = 1024
```

