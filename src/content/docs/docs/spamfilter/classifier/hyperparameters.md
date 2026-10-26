---
sidebar_position: 4
title: "Hyperparameters"
description: "The settings that define the size of the classifier model, how features are scaled and how the FTRL-Proximal optimiser learns, and the consequences of changing them."
---

Training adjusts the weights of the classifier, but some settings are fixed before training begins and shape how it proceeds. These are the hyperparameters: the number of weights, how features are scaled, and how fast and how strongly the optimiser adjusts the weights.

The hyperparameters are part of the model variant selected in [`model`](/docs/ref/object/spam-classifier#model) on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton, found in the WebUI under <!-- breadcrumb:SpamClassifier --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Classifier<!-- /breadcrumb:SpamClassifier -->. The defaults suit most servers. The one setting with a practical trade-off is the size of the model.

A change has a cost. Changing a hyperparameter changes the meaning of the weights already learned, so the existing weights no longer fit the new model. After a change, train the model again from the retained samples, with a `SpamFilterMaintenance` [task](/docs/management/tasks-actions/tasks) whose `maintenanceType` is `retrain`. Samples are kept for [`holdSamplesFor`](/docs/ref/object/spam-classifier#holdsamplesfor), <!-- default:SpamClassifier.holdSamplesFor -->180 days<!-- /default --> by default, so the retrained model learns from up to that much history ([Training](/docs/spamfilter/classifier/training)).

## Model size

[`numFeatures`](/docs/ref/object/spam-classifier#numfeatures) in [`parameters`](/docs/ref/object/spam-classifier#parameters) sets the number of weights of the model, as a power of two. The range runs from `16` (65536 weights) to `28` (about 268 million weights). The default is <!-- default:SpamClassifier.numFeatures -->`20`<!-- /default -->, about one million weights.

The size is a trade-off between accuracy and resources. Every feature is hashed to one of these weights, so a larger model makes it less likely that two unrelated features share a weight. The price is memory on every node and space in the blob store, both of which double with each step of `numFeatures`.

## Feature scaling

Raw feature counts would let the length of a message and the repetition of a word distort the result. Before a message is classified, the counts of its features are therefore scaled in two steps.

The first step, [`featureLogScale`](/docs/ref/object/spam-classifier#featurelogscale), replaces each count with its logarithm (`log(1 + count)`), so that a word repeated many times does not dominate the message. It is <!-- default:SpamClassifier.featureLogScale as=enabled -->enabled<!-- /default --> by default.

The second step, [`featureL2Normalize`](/docs/ref/object/spam-classifier#featurel2normalize), scales the feature vector of the message to unit length, so that long and short messages are classified on the same scale. It is <!-- default:SpamClassifier.featureL2Normalize as=enabled -->enabled<!-- /default --> by default.

## Optimiser

The optimiser is the algorithm that adjusts the weights after each sample. The FTRL-Proximal optimiser has four parameters, also in `parameters`:

| Field | Effect |
|---|---|
| [`alpha`](/docs/ref/object/spam-classifier#alpha) | Base learning rate: how far each sample moves the weights. |
| [`beta`](/docs/ref/object/spam-classifier#beta) | Smoothing of the per-feature learning rates in the early stage of learning. |
| [`l1Ratio`](/docs/ref/object/spam-classifier#l1ratio) | L1 regularisation: how strongly weights of rarely useful features are driven to zero. |
| [`l2Ratio`](/docs/ref/object/spam-classifier#l2ratio) | L2 regularisation: how strongly large weights are reduced. |

These parameters interact, and their effect on accuracy can only be judged by measuring the classifier on the server's own mail. Change them only together with such a measurement.

## Cuckoo feature hashing

Cuckoo feature hashing gives each feature several candidate weights, and a second, smaller model learns which candidate each feature uses. The `FtrlCcfh` variant therefore has two sets of the same fields: `parameters` for the main model, and [`indicatorParameters`](/docs/ref/object/spam-classifier#indicatorparameters) for the smaller one. The default size of the smaller model is smaller than that of the main model.

The following object body selects cuckoo feature hashing with a larger main model:

```json
{
  "model": {
    "@type": "FtrlCcfh",
    "parameters": {"numFeatures": "22"},
    "indicatorParameters": {"numFeatures": "18"}
  }
}
```
