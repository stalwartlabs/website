---
sidebar_position: 9
---

# Maintenance

Stalwart Mail Server includes an automated maintenance process designed to manage and optimize the use of server space. This process runs periodically to ensure efficient space utilization and maintain the performance and reliability of the mail server. The maintenance process performs several critical functions to manage storage space across user accounts.

Firstly, it permanently removes emails that users have marked for deletion. This step is crucial for reclaiming space that is occupied by unwanted emails, ensuring that only relevant communications are stored. Additionally, the process expunges old messages from the "Deleted Items" and "Junk Mail" folders. By automatically removing these messages based on predefined retention policies, the server maintains efficient storage management, preventing unnecessary clutter.

Another significant function of the maintenance process involves the deletion of old entries from the changelog. Stalwart Mail Server utilizes a changelog to support synchronization features such as the IMAP CONDSTORE extension and JMAP, which are essential for maintaining consistent states across mail clients and the server. Cleaning up outdated entries from the changelog not only helps in reducing storage overhead but also ensures that the synchronization mechanisms operate efficiently without being bogged down by irrelevant data.

## Schedule

The schedule for the maintenance task is configured using a simplified [cron-like syntax](/docs/configuration/values/cron) and the frequency of the cleanup is determined by the `jmap.account.purge.frequency` attribute of the configuration file. 

For example, to run the job every day at midnight local time, you would add the following to your configuration file:

```toml
[jmap.account.purge]
frequency = "0 0 *"
```

## Auto-Expunge

The auto-expunge feature in Stalwart Mail Server automates the management of email storage by systematically removing older messages from specific folders within all user accounts. This functionality is designed to help maintain an organized and efficient mailbox, reducing clutter and optimizing server storage usage.

Auto-expunge operates by automatically deleting messages that have been in the "Deleted Items" and "Junk Mail" folders for a specified duration. By default, this duration is set to 30 days. Messages that are older than this period are expunged from the mailboxes, ensuring that only relatively recent messages that might still hold relevance or need further review are retained.

The time frame for retaining messages in the "Deleted Items" and "Junk Mail" folders can be adjusted according to organizational needs or specific compliance requirements. This is managed through the `jmap.email.auto-expunge` setting in the configuration file which expects a duration or `false` to disable the feature. 

For example:

```toml 
[jmap.email]
auto-expunge = "30d"
```

## Changes History

Stalwart Mail Server maintains a changelog, known as the changes history, which is crucial for the synchronization process between the server and client email applications. This functionality is essential for clients using modern email protocols such as JMAP and for IMAP clients that support the `CONDSTORE`/`QRESYNC` extensions.

The changes history records modifications to mailboxes and messages, enabling email clients to synchronize changes efficiently without the need to fetch a complete snapshot of the mailbox state. Keeping a changelog ensures that clients such as JMAP and those IMAP clients equipped with the `CONDSTORE` or `QRESYNC` capabilities can track and reflect changes made elsewhere, maintaining consistency across different platforms and devices.

While maintaining a changelog is vital for synchronization, it is also important to manage the size of the changelog to conserve disk space and maintain server performance. Stalwart Mail Server is configured to automatically delete entries in the changes history that are older than 30 days by default. This policy helps in balancing between providing sufficient history for client synchronization and optimizing disk space usage.

The duration for which changes are kept can be adjusted to meet specific needs or compliance requirements. This is managed through the `jmap.protocol.changes.max-history` setting in the configuration file which expects a duration or `false` to disable the feature. 

For example:

```toml
[jmap.protocol.changes]
max-history = "30d"
```
