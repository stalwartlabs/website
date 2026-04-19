---
title: SpamClassifier
description: Configures the spam classifier model, training parameters, and auto-learning settings.
custom_edit_url: null
---

# SpamClassifier

Configures the spam classifier model, training parameters, and auto-learning settings.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Classifier

## Fields


##### `model`

> Type: [<code>SpamClassifierModel</code>](#spamclassifiermodel) · required
>
> The spam classifier model to use.


##### `learnHamFromCard`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to automatically learn ham messages from senders in the user's address book.


##### `learnSpamFromRblHits`

> Type: <code>UnsignedInt</code> · default: `2` · max: 100
>
> Number of DNSBL servers that list the sender to auto-learn as spam


##### `learnSpamFromTraps`

> Type: <code>Boolean</code> · default: `true`
>
> Train as spam messages sent to spam trap addresses


##### `holdSamplesFor`

> Type: <code>Duration</code> · default: `"180d"`
>
> Duration to hold training samples for


##### `minHamSamples`

> Type: <code>UnsignedInt</code> · default: `100` · max: 10000 · min: 1
>
> Minimum number of ham samples required for training


##### `minSpamSamples`

> Type: <code>UnsignedInt</code> · default: `100` · max: 10000 · min: 1
>
> Minimum number of spam samples required for training


##### `reservoirCapacity`

> Type: <code>UnsignedInt</code> · default: `1024` · max: 100000 · min: 100
>
> The capacity of the training sample reservoir


##### `trainFrequency`

> Type: <code>Duration?</code> · default: `"12h"`
>
> Frequency to train the spam classifier


##### `learnHamFromReply`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to automatically learn ham messages that are replies to messages sent by the recipient.



## JMAP API

The SpamClassifier singleton is available via the `urn:stalwart:jmap` capability.


### `x:SpamClassifier/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSpamClassifierGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamClassifier/get",
          {
            "ids": [
              "singleton"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:SpamClassifier/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSpamClassifierUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamClassifier/set",
          {
            "update": {
              "singleton": {
                "model": {
                  "@type": "FtrlFh",
                  "featureL2Normalize": true,
                  "featureLogScale": true,
                  "parameters": {
                    "numFeatures": "20"
                  }
                }
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get spam-classifier
```


### Update

```sh
stalwart-cli update spam-classifier --field description='Updated'
```



## Nested types


### SpamClassifierModel {#spamclassifiermodel}

Defines the model used for spam classification.


- **`FtrlFh`**: FTRL-Proximal + Feature Hashing. Carries the fields of [`SpamClassifierFtrlFh`](#spamclassifierftrlfh).
- **`FtrlCcfh`**: FTRL-Proximal + Cuckoo Feature Hashing. Carries the fields of [`SpamClassifierFtrlCcfh`](#spamclassifierftrlccfh).
- **`Disabled`**: Disabled. No additional fields.




#### SpamClassifierFtrlFh {#spamclassifierftrlfh}

Defines a spam classifier model using FTRL-Proximal optimization with feature hashing.



##### `parameters`

> Type: [<code>FtrlParameters</code>](#ftrlparameters) · default: `{"numFeatures":"20"}`
>
> Hyperparameters for the FTRL-FH model


##### `featureL2Normalize`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to L2-normalize feature values in the spam classifier


##### `featureLogScale`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to apply sublinear scaling to feature values in the spam classifier





##### FtrlParameters {#ftrlparameters}

Hyperparameters for the FTRL-Proximal optimization algorithm.



##### `alpha`

> Type: <code>Float</code> · default: `2` · min: 0
>
> The alpha parameter for the FTRL-Proximal algorithm


##### `beta`

> Type: <code>Float</code> · default: `1` · min: 0
>
> The beta parameter for the FTRL-Proximal algorithm


##### `numFeatures`

> Type: [<code>ModelSize</code>](#modelsize) · default: `"20"`
>
> The number of parameters (2^n)


##### `l1Ratio`

> Type: <code>Float</code> · default: `0.001` · min: 0
>
> The L1 regularization parameter for the FTRL-Proximal algorithm


##### `l2Ratio`

> Type: <code>Float</code> · default: `0.0001` · min: 0
>
> The L2 regularization parameter for the FTRL-Proximal algorithm





#### SpamClassifierFtrlCcfh {#spamclassifierftrlccfh}

Defines a spam classifier model using FTRL-Proximal optimization with cuckoo feature hashing.



##### `indicatorParameters`

> Type: [<code>FtrlParameters</code>](#ftrlparameters) · default: `{"numFeatures":"18"}`
>
> Hyperparameters for the indicator features in the FTRL-CCFH model


##### `parameters`

> Type: [<code>FtrlParameters</code>](#ftrlparameters) · default: `{"numFeatures":"20"}`
>
> Hyperparameters for the FTRL-FH model


##### `featureL2Normalize`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to L2-normalize feature values in the spam classifier


##### `featureLogScale`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to apply sublinear scaling to feature values in the spam classifier





## Enums


### ModelSize {#modelsize}



| Value | Label |
|---|---|
| `16` | 65k |
| `17` | 131k |
| `18` | 262k |
| `19` | 524k |
| `20` | 1M |
| `21` | 2M |
| `22` | 4M |
| `23` | 8M |
| `24` | 16M |
| `25` | 33M |
| `26` | 67M |
| `27` | 134M |
| `28` | 268M |


