---
sidebar_position: 2
title: "Training"
description: "How users and administrators train the spam classifier, which actions create training samples, how often the model is trained, and how to check its state."
---

The [classifier](/docs/spamfilter/classifier/) is only as good as the examples it learns from. These examples are training samples: messages labelled as spam or as ham (legitimate mail).

Samples come from three sources. Users create them by moving messages into or out of the Junk folder. Administrators can upload labelled messages. Finally, [automatic learning](/docs/spamfilter/classifier/autolearn) adds messages whose classification is certain. The samples are collected continuously, and the classifier uses them at its next training run.

## Training by users

Users train the classifier through their mail client, without any setting of their own. Sorting mail into and out of the Junk folder is something they do anyway, and each of the following actions also creates a sample from the message:

| Action | IMAP | JMAP | Sample |
|---|---|---|---|
| Moving or copying a message into the Junk folder | `MOVE`, `COPY` | `Email/set` adding the Junk mailbox, `Email/copy` | Spam |
| Moving a message out of the Junk folder, except into Trash | `MOVE`, `COPY` | `Email/set` removing the Junk mailbox | Ham |
| Marking a message as junk | `STORE +FLAGS ($Junk)` | `Email/set` adding `$junk` | Spam |
| Marking a message as not junk | `STORE +FLAGS ($NotJunk)` or `-FLAGS ($Junk)` | `Email/set` adding `$notjunk` or removing `$junk` | Ham |
| Uploading a message into the Junk folder or with one of these flags | `APPEND` | `Email/import`, `Email/set` | Spam or ham |
| Uploading a message into the Inbox without these flags | `APPEND` | `Email/set` | Ham |

The "junk" and "not junk" buttons of most mail clients perform one of these actions. Deleting a message, or moving it to Trash, creates no sample, because a deleted message may be unwanted without being spam. For the same reason, an IMAP flag change on a message in Trash creates no ham sample either.

The model is shared by all users of the server, with an additional component for each account ([Classification model](/docs/spamfilter/classifier/#classification-model)). A sample created by one user therefore influences, to a lesser degree, the classification of messages for every other user. Users who never mark messages still benefit from those who do.

Two cases deserve attention. Uploading a mailbox into the Inbox over IMAP, as migration tools do, also creates a ham sample for each message, so a migration trains the classifier as a side effect. For accounts that use [encryption at rest](/docs/encryption), messages delivered by SMTP become samples only when the user has allowed it in the encryption settings, because a sample keeps a copy of the message.

## Uploading samples

A new server has no history to learn from, and waiting for users to report enough spam takes time. Administrators can instead add labelled messages directly, for example to train a new server with an existing collection of spam and ham.

Each sample is a [SpamTrainingSample](/docs/ref/object/spam-training-sample), found in the WebUI under <!-- breadcrumb:SpamTrainingSample --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg> Spam Samples<!-- /breadcrumb:SpamTrainingSample -->. Creating one takes two steps. The message is first uploaded as a blob. The sample is then created with three fields: the `blobId` of the upload, the label in `isSpam` and, optionally, the `accountId` of the account whose per-account weights it should train. Without an account, the sample trains the shared weights only. Samples can be created and destroyed, but not modified.

## Training runs

Samples do not change the model as they arrive. The model is trained on a schedule instead, every [`trainInterval`](/docs/ref/object/spam-classifier#traininterval) on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton, found in the WebUI under <!-- breadcrumb:SpamClassifier --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Classifier<!-- /breadcrumb:SpamClassifier -->. The interval is <!-- default:SpamClassifier.trainInterval -->12 hours<!-- /default --> by default, and setting the field to `null` disables scheduled training.

Each run incorporates the samples added since the previous run. The updated model is stored in the [blob store](/docs/storage/blob) and loaded by every node, so that all nodes of a cluster classify with the same model. In a cluster, one node performs each training run.

A model trained on too few samples of one kind classifies unreliably, so training waits for enough of both. A training run takes place only when at least [`minSpamSamples`](/docs/ref/object/spam-classifier#minspamsamples) spam samples and [`minHamSamples`](/docs/ref/object/spam-classifier#minhamsamples) ham samples exist, <!-- default:SpamClassifier.minSpamSamples -->100<!-- /default --> and <!-- default:SpamClassifier.minHamSamples -->100<!-- /default --> by default. Until then, the run is skipped with the event `spam.model-not-ready`, and messages are not classified. Lowering the thresholds makes the classifier start sooner, with less accurate results at first.

The samples are also unbalanced by nature. Users mostly report spam and rarely ham, because legitimate mail needs no action. A model trained only on the new samples would therefore drift towards spam. To prevent this, the classifier keeps a reservoir of recent samples of each kind, up to [`reservoirCapacity`](/docs/ref/object/spam-classifier#reservoircapacity), and trains with the less frequent kind as well when new samples of it are scarce.

Samples are retained after training, for [`holdSamplesFor`](/docs/ref/object/spam-classifier#holdsamplesfor), <!-- default:SpamClassifier.holdSamplesFor -->180 days<!-- /default --> by default. Keeping them allows the model to be trained again from them, for example after its [hyperparameters](/docs/spamfilter/classifier/hyperparameters) have changed. A longer retention gives a retrained model more history, at the cost of storing more samples.

The following object body trains every six hours and keeps samples for 90 days:

```json
{
  "trainInterval": 21600000,
  "holdSamplesFor": 7776000000
}
```

A training run can also be started at any time, with a [task](/docs/management/tasks-actions/tasks) of type `SpamFilterMaintenance`. Its `maintenanceType` selects what to do. `train` trains with the samples added since the last run, and `retrain` trains again with all retained samples. `abort` stops a run in progress, and `reset` deletes the model and returns the classifier to its untrained state.

## Checking the classifier

When the classifier does not behave as expected, the first question is whether it is trained at all. Its state is visible in the log. `spam.train-started` and `spam.train-completed` mark each training run. `spam.model-loaded` is logged when a node loads a new model, and `spam.model-not-ready` when there are not yet enough samples. `spam.train-sample-added`, at the `debug` level, is logged for each new sample.

The samples themselves can be listed with `x:SpamTrainingSample/query`, optionally filtered by `accountId`, or from the command line:

```sh
stalwart-cli query SpamTrainingSample
stalwart-cli query SpamTrainingSample --where accountId=<account id>
```

Each sample shows the sender, the subject, the label and the time it expires. The list therefore shows whether a user's actions are producing samples, and whether both kinds have reached the minimum.
