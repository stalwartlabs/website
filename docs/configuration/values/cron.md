---
sidebar_position: 9
---

# Cron

Stalwart runs periodically automated tasks that perform essential maintenance to ensure efficient use of storage and optimal database operations. The schedule for these tasks is configured using a simplified cron-like syntax:

```txt
<minute> <hour> <week-day>
```

Where:

- ``<minute>``: minute to run the job, an integer ranging from 0 to 59.
- ``<hour>``: hour to run the job, an integer ranging from 0 to 23, or ``*`` to run the job every hour.
- ``<week-day>``: day of the week to run the job, ranging from ``1`` (Monday) to ``7`` (Sunday), or ``*`` to run the job every day. 

All values have to be specified using the server's local time. 

For example:

- to run the job every day at 3am local time the syntax would be `0 3 *`. 
- to run the job every Tuesday at 5:45am local time, the syntax would be `45 5 2`.

