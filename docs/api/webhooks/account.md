---
sidebar_position: 3
---

# Account events

## account.over-quota

Triggered when an account exceeds its quota and contains the following fields:

- `accountId` (u32): The ID of the account.
- `quotaLimit` (u64): The quota limit.
- `quotaUsed` (u64): The quota used.
- `objectSize` (u64): The size of the object that caused the account to go over quota.

Example:

```json
{
    "accountId": 1,
    "quotaLimit": 1048576,
    "quotaUsed": 1048577,
    "objectSize": 1024
}
```

