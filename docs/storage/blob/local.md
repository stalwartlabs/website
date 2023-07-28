---
sidebar_position: 2
---

# Local

When using local storage, email messages are stored in the local disk using the Maildir format. This popular storage format stores each email message as a separate file within a specific directory structure, which reduces the need for file locks and optimizes operations such as message delivery and deletion.

The path to the local blob store is configured with the `store.blob.local.path` attribute. For example:

```toml
[store.blob.local]
path = "/opt/stalwart-mail/data/blobs"
```

:::tip Hint

In this example, your users' email messages will be stored under `/opt/stalwart-mail/data/blobs/<account_id>/Maildir`. Where `<account_id>` is the unique identifier of the user's account.

:::
