---
title: "EncryptionModeConstant"
description: "Constants available in expression contexts referencing EncryptionModeConstant."
custom_edit_url: null
---



Constants available in expression contexts that reference `EncryptionModeConstant`.

| Constant | Description |
|---|---|
| `disable` | Do not encrypt |
| `opportunistic` | Encrypt when the recipient has a usable key, otherwise deliver in plaintext |
| `required` | Encrypt, bouncing the message when the recipient has no usable key |