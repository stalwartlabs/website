---
sidebar_position: 4
---

# Manage Database

The message store is designed to be largely self-sufficient, requiring minimal maintenance from administrators. However, there are certain tasks that necessitate manual intervention. These tasks include operations such as deleting accounts or renaming them. While these actions do need to be done manually, they can also be automated through the use of the HTTP API. 

## Delete an account

Stalwart Mail Server relies on external [directories](/docs/directory/overview) for user authentication, and as such, it doesn't directly track when a user account has been deleted from this directory. This means that if an account is deleted in the external directory, the information corresponding to that account still resides in the Mail Server's database. In order to fully remove an account, administrators need to use the `database delete` command from the command line interface (CLI). This command will erase the account's data from the Mail Server's database, ensuring the account is completely removed from all aspects of the system.

For example, to delete the account `john`:

```bash
$ stalwart-cli -u https://jmap.example.org database delete john
```

## Rename an account

Stalwart Mail Server assigns a unique identifier to every new user who logs into the system. This identifier is used to link the user to their account data stored within the mail server. When a username is altered in the external directory, the Mail Server does not automatically detect this change, which may lead to a misalignment between the user's new name and the associated account data. 

To resolve this, Stalwart Mail Server provides a CLI command `database rename` which can be used to update the system with the user's new username. By executing this command and providing the old and new usernames, the administrator can ensure that the unique identifier previously assigned to that account is correctly associated with the new username, maintaining access to the user's existing account data.

For example, to rename the account `john` to `john.doe`:

```bash
$ stalwart-cli -u https://jmap.example.org database rename john john.doe
```

## Purge expired blobs

Stalwart Mail Server runs an automated [maintenance task](/docs/storage/blob/overview#blob-purging) that periodically deletes expired blobs, which are essentially data objects such as emails or Sieve scripts. This task helps manage storage space by removing data objects that are no longer needed. 
However, there might be situations when an administrator needs to initiate this process manually, perhaps to immediately free up storage space or troubleshoot storage-related issues. In these cases, Stalwart Mail Server provides a CLI command called `purge`.

```bash
$ stalwart-cli -u https://jmap.example.org database purge
```

