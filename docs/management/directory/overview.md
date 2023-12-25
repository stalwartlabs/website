---
sidebar_position: 1
---

# Overview

The command-line interface includes a Directory Management tool which enables administrators to directly manage user accounts and groups within the Stalwart Mail Server. It provides functionalities like creating new users, updating passwords, managing email addresses, setting disk quotas, and handling group memberships. However, the availability and functionality of this tool depend significantly on the type of directory being used – whether it's the server's internal directory or an external directory system like LDAP or SQL.

## Internal Directory

The Directory Management tool in Stalwart Mail Server is exclusively available when using the [internal directory](/docs/directory/types/internal). With the internal directory, all aspects of user and group management are integrated within Stalwart Mail Server. This integration offers a streamlined and cohesive management experience.

## External Directory

When an external directory, such as LDAP or SQL, is used, the Stalwart Mail Server's internal Directory Management tool is not applicable. This is because the external directory is a separate system that manages user and group data independently of Stalwart Mail Server. In cases where an external directory is employed, all management tasks related to users and groups must be conducted through the external directory's own management system. 

It is however it still necessary to use the Directory Management tool to perform some tasks such as deleting accounts or renaming them.

### Delete an account

When an external directory is used for authentication, it is not possible for Stalwart Mail Server to directly track when a user account has been deleted from this directory. This means that if an account is deleted in the external directory, the information corresponding to that account still resides in the Mail Server's database. In order to fully remove an account, administrators need to use the `account delete` command from the command line interface (CLI). This command will erase the account's data from the Mail Server's database, ensuring the account is completely removed from all aspects of the system

### Rename an account

Stalwart Mail Server assigns a unique identifier to every new user who logs into the system. This identifier is used to link the user to their account data stored within the mail server. When a username is altered in the external directory, the Mail Server does not automatically detect this change, which may lead to a misalignment between the user's new name and the associated account data. To resolve this, Stalwart Mail Server provides a CLI command `account update` which can be used to update the system with the user's new username. By executing this command and providing the old and new usernames, the administrator can ensure that the unique identifier previously assigned to that account is correctly associated with the new username, maintaining access to the user's existing account data.

