---
sidebar_position: 2
---

# Internal

The internal directory handles crucial tasks such as authenticating credentials (usernames and passwords), validating email addresses, and storing various user-specific settings like disk quotas and group memberships. Using an internal directory is suitable for environments where Stalwart is the primary system for email management and no external user management systems are in place. In this setup, all account management tasks, such as creating new user accounts, updating passwords, and setting quotas, are performed directly within Stalwart Mail Server. This offers a straightforward and integrated approach to user management.

Internally, the internal directory utilizes one of the supported [data stores](/docs/storage/data) to maintain and retrieve user details. This integration ensures that user information is stored and accessed efficiently, leveraging the capabilities of the chosen data store.

## Configuration

The following configuration settings are available for the internal directory, which are specified under the `directory.<name>` section of the configuration file:

- `type`: Indicates the type of directory, which has to be set to `"internal"`.
- `store`: Specifies the name of the [data store](/docs/storage/data) to use for storing user information.

## Account management

Account management can be performed using the [web-admin](/docs/management/webadmin/overview) interface or the [REST API](/docs/api/management/overview).

