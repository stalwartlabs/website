---
title: "MtaQueueSenderVariable"
description: "Variables available in expression contexts referencing MtaQueueSenderVariable."
custom_edit_url: null
---



Variables available in expression contexts that reference `MtaQueueSenderVariable`.

| Variable | Description |
|---|---|
| `sender` | Envelope sender of the message |
| `sender_domain` | Domain of the envelope sender |
| `priority` | Message priority (number, from -9 to 9, 0 when not set) |
| `recipients` | List of all recipient addresses of the original message, not only those the notification reports on |