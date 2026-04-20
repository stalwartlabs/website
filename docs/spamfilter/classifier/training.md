---
sidebar_position: 2
---

# Training

The spam classifier is trained periodically to incorporate newly collected samples into the model. By default, training runs every 12 hours, though the interval can be adjusted to better match the size, load, and dynamics of the deployment. Shorter intervals allow faster adaptation to new patterns; longer intervals reduce computational overhead.

In clustered deployments, training is coordinated so that a single node is responsible for executing the training process. This avoids redundant work and ensures that the model is updated in a consistent and deterministic manner. During each training cycle, all training samples added since the previous cycle, whether through user labelling, administrator uploads, or automatic learning, are incorporated into the model. The training process then updates the model parameters using these samples, applying the configured optimisation and regularisation settings.

Once training completes successfully, the updated model is serialised and stored in the [blob store](/docs/storage/blob). From there it is distributed to all nodes in the cluster and activated for inference. This deployment step ensures that every node evaluates messages using the same model state, providing consistent classification behaviour across the system.

## Training samples

A training sample is a labelled email message that is used by the classifier to learn how to distinguish spam from ham. In Stalwart, training samples are obtained primarily through user interaction, when users explicitly tag messages as spam or ham. Administrators may also upload labelled messages directly (for example to bootstrap the system, incorporate curated datasets, or correct systematic classification errors). Each sample contributes features and an associated label that inform the statistical model during training.

Training samples are persisted as [SpamTrainingSample](/docs/ref/object/spam-training-sample) objects (found in the WebUI under <!-- breadcrumb:SpamTrainingSample --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg> Spam Samples<!-- /breadcrumb:SpamTrainingSample -->), one per labelled message.

Stalwart can be configured to retain training samples for a defined period (180 days by default). Retaining samples allows the model to be retrained when necessary, rather than relying solely on incremental updates. Retraining may be required to remove the influence of outdated data, to account for changes in message patterns over long time horizons, or to apply modified model hyperparameters such as regularisation strength, learning rates, or feature-space size. By keeping a bounded history of labelled messages, the system provides a controlled mechanism for revisiting past training decisions without unbounded storage growth.

The spam classifier requires a minimum number of training samples before it begins making classification decisions. By default, the threshold is 100 ham samples and 100 spam samples. This requirement exists to ensure that the model has observed enough examples from both classes to estimate meaningful parameters. Logistic regression relies on statistical regularities across features, and with too few samples the learned weights are unstable, poorly calibrated, and highly sensitive to noise. Enforcing a minimum sample count reduces the risk of arbitrary or misleading classifications during the early stages of deployment and ensures that the classifier begins operating only once it has a minimally representative view of both legitimate and unwanted mail.

## Reservoir sampling

Stalwart's spam classifier is trained in an online setting, meaning that model updates occur incrementally as new labelled data becomes available. Each time a user tags a message as spam or ham, the classifier incorporates that observation into its parameter updates. This approach allows the model to adapt continuously to changing message patterns, emerging spam campaigns, and evolving user preferences, without requiring periodic batch retraining or offline processing.

A central challenge in online learning is maintaining class balance. In binary classification tasks such as spam detection, class balance refers to the relative proportion of positive and negative training examples, here spam and ham. In real-world mail systems, user feedback is rarely balanced: users tend to tag spam far more frequently than ham, because legitimate messages often require no action. If left uncorrected, this imbalance biases the classifier toward overpredicting the majority class, reduces sensitivity to minority-class signals, and degrades probability calibration.

To mitigate this effect, Stalwart employs reservoir sampling as a mechanism for managing training data under imbalance. Reservoir sampling is a randomised algorithm for maintaining a representative subset of a data stream using a fixed amount of memory. As new labelled messages arrive, the algorithm decides probabilistically whether to include each sample in the reservoir, ensuring that over time the reservoir approximates a uniform sample of the full stream, regardless of its length.

In the context of spam classification, Stalwart maintains separate reservoirs for training samples, with particular attention to the minority class. When users disproportionately label messages as spam, ham samples are retained in the reservoir so that they continue to contribute to model updates even when new ham labels are infrequent. This prevents the model from "forgetting" legitimate mail patterns and helps preserve a stable decision boundary. Conversely, when the imbalance shifts in the opposite direction, the same mechanism ensures that spam examples remain adequately represented.

By combining online training with reservoir sampling, the classifier achieves both responsiveness and stability. New information is incorporated immediately, while the retained sample reservoirs provide a form of controlled memory that counteracts skewed feedback patterns. This design allows Stalwart to learn effectively from user behaviour in realistic, imbalanced environments without resorting to ad hoc weighting schemes or expensive retraining cycles.

## Configuration

Training behaviour is configured on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton (found in the WebUI under <!-- breadcrumb:SpamClassifier --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Classifier<!-- /breadcrumb:SpamClassifier -->). The relevant fields are:

- [`trainFrequency`](/docs/ref/object/spam-classifier#trainfrequency): how often the classifier is retrained using newly collected samples. Default `"12h"`. Adjusting this interval balances adaptation speed against computational load.
- [`holdSamplesFor`](/docs/ref/object/spam-classifier#holdsamplesfor): how long training samples are retained. Default `"180d"`. Retaining samples enables retraining with historical data when necessary.
- [`minSpamSamples`](/docs/ref/object/spam-classifier#minspamsamples): minimum number of spam training samples required before the classifier begins making decisions. Default `100`.
- [`minHamSamples`](/docs/ref/object/spam-classifier#minhamsamples): minimum number of ham training samples required before the classifier begins making decisions. Default `100`.
- [`reservoirCapacity`](/docs/ref/object/spam-classifier#reservoircapacity): maximum number of training samples retained in the reservoir used for balancing class representation. Default `1024`.

Example overriding the defaults to train every six hours and to keep samples for only 30 days:

```json
{
  "trainFrequency": "6h",
  "holdSamplesFor": "30d",
  "minSpamSamples": 100,
  "minHamSamples": 100,
  "reservoirCapacity": 1024
}
```
