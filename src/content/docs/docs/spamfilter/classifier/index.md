---
sidebar_position: 1
title: "Overview"
description: "How the statistical spam classifier works: what it learns from, how its probability becomes a score, the model variants and their memory use."
---

The rules of the [spam filter](/docs/spamfilter/) recognise patterns that are known in advance, and they treat every server alike. Spam and legitimate mail differ from one server to the next, though: the newsletters its users read, the language they write in, the campaigns that target them. The statistical classifier adapts the filter to that local mail.

It learns from the messages that users mark as spam or as legitimate mail. For each new message, it then estimates the probability that the message is spam, and that probability becomes part of the score.

## Classification model

The classifier is a linear model, a logistic regression. It works on features extracted from the message, which are the words of the subject and body, header properties, sender and link domains, and other signals of the analysis. Each feature has a learned weight, and the weighted sum of the features of a message gives the probability that it is spam. Because the model is linear, the contribution of each feature to a decision is its weight.

Text produces very large and sparse feature sets: many distinct words, few of them present in any one message. The model is trained with the FTRL-Proximal algorithm ([McMahan et al., 2013](https://dl.acm.org/doi/10.1145/2487575.2488200)), which suits such feature sets. It adapts the learning rate of each feature separately, and it drives the weights of uninformative features to zero, which keeps the model compact.

Features are not stored by name. A hash function maps each one to one of a fixed number of weights, a technique called feature hashing ([Weinberger et al., 2009](https://arxiv.org/abs/0902.2206)). The model therefore has a fixed size, whatever the number of distinct words and domains it encounters. The price is that different features occasionally share a weight, a collision. Collisions add a small amount of noise, which the regularisation of the model tolerates.

There is one model per server, made of two parts. The shared weights are trained by all users. The weights specific to an account are trained only by that account's samples. Each message is classified with the shared weights plus the weights of the recipient's account.

The two parts serve different purposes. The shared part lets every user benefit from a spam campaign that others have already reported. The per-account part lets the classifier learn individual preferences, for example that one user wants a newsletter that others mark as spam. Because of the per-account part, a message for several local recipients is classified separately for each of them.

A new classifier knows nothing, so it needs at least <!-- default:SpamClassifier.minSpamSamples -->100<!-- /default --> spam and <!-- default:SpamClassifier.minHamSamples -->100<!-- /default --> ham samples before it is trained for the first time. Until then, it does not classify messages, and messages receive no classifier tag. [Training](/docs/spamfilter/classifier/training) describes how samples are collected.

## From probability to score

Like every other finding, the classifier's result enters the score through a tag. The probability is turned into one of seven tags, whose scores the rule set defines:

| Probability | Tag | Score |
|---|---|---|
| below 0.15 | `PROB_HAM_HIGH` | -8.0 |
| 0.15 to below 0.25 | `PROB_HAM_MEDIUM` | -6.0 |
| 0.25 to below 0.40 | `PROB_HAM_LOW` | -2.0 |
| 0.40 to below 0.60 | `PROB_SPAM_UNCERTAIN` | 0.0 |
| 0.60 to below 0.75 | `PROB_SPAM_LOW` | 2.0 |
| 0.75 to below 0.85 | `PROB_SPAM_MEDIUM` | 6.0 |
| 0.85 and above | `PROB_SPAM_HIGH` | 8.0 |

The classifier's influence on the final score therefore grows with its confidence. An uncertain probability adds nothing, and the other findings of the filter can confirm or outweigh even a confident one. The scores can be changed like those of any tag ([Scores](/docs/spamfilter/settings/scores)).

[Rules](/docs/spamfilter/rules) and the [AI classifier](/docs/spamfilter/ai/) can also use the probability directly, in the `spam_probability` variable. Because the message may be classified for several recipients, the variable holds the average probability across the local recipients of the message, from `0` to `1`, or `-1` when the classifier did not run. The `X-Spam-Score` header reports the same value as `avg_confidence`.

## Model variants

The classifier is configured on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton, found in the WebUI under <!-- breadcrumb:SpamClassifier --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Classifier<!-- /breadcrumb:SpamClassifier -->. Its [`model`](/docs/ref/object/spam-classifier#model) field selects one of three variants:

| Variant | Description |
|---|---|
| `FtrlFh` (default) | FTRL-Proximal with feature hashing. |
| `FtrlCcfh` | FTRL-Proximal with cuckoo feature hashing ([Gao et al., 2018](https://www.ijcai.org/proceedings/2018/0295.pdf)), which gives each feature several candidate weights and learns which one to use, reducing the effect of collisions at the cost of a second, smaller model and more computation per message. |
| `Disabled` | No classification and no training. |

The choice between the two FTRL variants comes down to collisions. Collisions become more frequent as the number of distinct features grows, which happens when many accounts train their own weights. `FtrlCcfh` is intended for servers where collisions limit the accuracy of the classifier, and it uses more memory and processing per message than `FtrlFh`. A larger model, set with the hyperparameters, is the other way to reduce collisions ([Hyperparameters](/docs/spamfilter/classifier/hyperparameters)).

The following object body selects the default variant with its default settings:

```json
{
  "model": {
    "@type": "FtrlFh"
  }
}
```

Changing the variant or its size discards what the current model has learned. The new model must then be trained again from the retained samples.
