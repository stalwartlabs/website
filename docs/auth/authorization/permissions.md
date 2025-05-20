---
sidebar_position: 2
---

# Permissions

Permissions in Stalwart determine the specific actions and resources that a user, group, or entity is allowed to access. Permissions allow administrators to control fine-grained access to various operations within the mail server, providing a clear distinction between what actions an entity can or cannot perform. Permissions can be assigned directly to [individuals](/docs/auth/principals/individual), [groups](/docs/auth/principals/group), [roles](/docs/auth/authorization/roles), or even entire [tenants](/docs/auth/authorization/tenants), giving administrators comprehensive control over access policies.

To simplify the management of permissions, multiple permissions can be grouped together into [roles](/docs/auth/authorization/roles). Assigning roles to users or groups allows administrators to more easily manage access by bundling related permissions rather than having to assign them individually.

## Effective Permissions

Each principal type in Stalwart (such as individuals, groups, or roles) has two important fields related to permissions: `enabledPermissions` and `disabledPermissions`. The **effective permissions** for an individual are calculated using a combination of permissions from various levels:

- **Enabled Permissions**:  
   - Start with the `enabledPermissions` assigned directly to the **individual**.
   - Combine these with the `enabledPermissions` of any **roles** that are assigned to the individual.
   - Finally, intersect these with the `enabledPermissions` of the **tenant** to which the individual belongs.
- **Disabled Permissions**:  
   - Any permissions explicitly listed in the `disabledPermissions` field of the **individual**, **roles**, or **tenant** are subtracted from the total. This ensures that even if a permission is enabled at one level, it will be disabled if explicitly restricted at another.

This mechanism allows for a flexible yet precise approach to access control, ensuring that permissions are layered and can be modified at various levels to suit the needs of the organization.

## Permissions vs. ACLs

It's important to note that permissions in Stalwart are distinct from Access Control Lists (ACLs). 

- **Permissions**: Defined by the **administrator**, permissions control access to specific resources and actions within the mail server itself. These determine what a user or entity is allowed to do globally within the system, such as managing settings, accessing logs, or sending emails.
- **Access Control Lists (ACLs)**: Managed by **users** and are used to grant other users or groups access to their emails, folders, or other specific data. ACLs, typically controlled via the IMAP ACL extension or JMAP, regulate how one user's data is shared with others and are applied on a per-folder or per-resource basis.

In summary, permissions are centrally controlled by administrators to define what actions and resources can be accessed by whom, while ACLs give users control over how their own data is shared and accessed by others. Together, they offer robust and flexible security and access control within the Stalwart environment.

## Available Permissions

Stalwart provides a wide range of permissions that can be assigned to users, groups, roles, or tenants. These permissions cover various aspects of the mail server, including managing users, domains, settings, and more. The following table lists the available permissions as well as the [built-in roles](/docs/auth/authorization/roles) that include them:

| Permission | Description | Admin role | Tenant admin role | User role  |
|-----------------|--------------------|--------------------|--------------------|--------------------|
|`ai-model-interact`|Interact with AI models|:white_check_mark:|||
|`api-key-create`|Create new API keys|:white_check_mark:|:white_check_mark:||
|`api-key-delete`|Remove API keys|:white_check_mark:|:white_check_mark:||
|`api-key-get`|Retrieve specific API keys|:white_check_mark:|:white_check_mark:||
|`api-key-list`|View API keys|:white_check_mark:|:white_check_mark:||
|`api-key-update`|Modify API keys|:white_check_mark:|:white_check_mark:||
|`authenticate`|Authenticate|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`authenticate-oauth`|Authenticate via OAuth|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`blob-fetch`|Retrieve arbitrary blobs|:white_check_mark:|||
|`dav-cal-acl`|Manage access control lists for calendar entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-copy`|Copy calendar entries to new locations|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-delete`|Remove calendar entries or collections|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-free-busy-query`|Query free/busy time information for scheduling|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-get`|Download calendar entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-lock`|Lock calendar entries to prevent concurrent modifications|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-mk-col`|Create new calendar collections|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-move`|Move calendar entries to new locations|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-multi-get`|Retrieve multiple calendar entries in a single request|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-prop-find`|Retrieve properties of calendar entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-prop-patch`|Modify properties of calendar entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-put`|Upload or modify calendar entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-cal-query`|Search for calendar entries matching criteria|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-acl`|Manage access control lists for address book entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-copy`|Copy address book entries to new locations|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-delete`|Remove address book entries or collections|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-get`|Download address book entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-lock`|Lock address book entries to prevent concurrent modifications|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-mk-col`|Create new address book collections|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-move`|Move address book entries to new locations|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-multi-get`|Retrieve multiple address book entries in a single request|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-prop-find`|Retrieve properties of address book entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-prop-patch`|Modify properties of address book entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-put`|Upload or modify address book entries|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-card-query`|Search for address book entries matching criteria|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-expand-property`|Expand properties that reference other resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-acl`|Manage access control lists for file resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-copy`|Copy file resources to new locations|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-delete`|Remove file resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-get`|Download file resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-lock`|Lock file resources to prevent concurrent modifications|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-mk-col`|Create new file collections or directories|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-move`|Move file resources to new locations|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-prop-find`|Retrieve properties of file resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-prop-patch`|Modify properties of file resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-file-put`|Upload or modify file resources|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-principal-acl`|Set principal properties for access control|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-principal-list`|List available principals in the system|:white_check_mark:|||
|`dav-principal-match`|Match principals based on specified criteria|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-principal-search`|Search for principals by property values|:white_check_mark:|||
|`dav-principal-search-prop-set`|Define property sets for principal searches|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`dav-sync-collection`|Synchronize collection changes with client|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`delete-system-folders`|Delete of system folders|:white_check_mark:|||
|`dkim-signature-create`|Create DKIM signatures for email authentication|:white_check_mark:|:white_check_mark:||
|`dkim-signature-get`|Retrieve DKIM signature information|:white_check_mark:|:white_check_mark:||
|`domain-create`|Add new email domains|:white_check_mark:|:white_check_mark:||
|`domain-delete`|Remove email domains|:white_check_mark:|:white_check_mark:||
|`domain-get`|Retrieve specific domain information|:white_check_mark:|:white_check_mark:||
|`domain-list`|View list of email domains|:white_check_mark:|:white_check_mark:||
|`domain-update`|Modify domain information|:white_check_mark:|:white_check_mark:||
|`email-receive`|Receive emails|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`email-send`|Send emails|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`fts-reindex`|Rebuild the full-text search index|:white_check_mark:|||
|`group-create`|Add new user groups|:white_check_mark:|:white_check_mark:||
|`group-delete`|Remove user groups|:white_check_mark:|:white_check_mark:||
|`group-get`|Retrieve specific group information|:white_check_mark:|:white_check_mark:||
|`group-list`|View list of user groups|:white_check_mark:|:white_check_mark:||
|`group-update`|Modify group information|:white_check_mark:|:white_check_mark:||
|`imap-acl-get`|Retrieve ACLs via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-acl-set`|Set ACLs via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-append`|Append messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-authenticate`|Authenticate via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-capability`|Retrieve server capabilities via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-copy`|Copy messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-create`|Create mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-delete`|Delete mailboxes or messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-enable`|Enable IMAP extensions|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-examine`|Examine mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-expunge`|Expunge deleted messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-fetch`|Fetch messages or metadata via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-id`|Retrieve server ID via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-idle`|Use IMAP IDLE command|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-list`|List mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-list-rights`|List rights via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-lsub`|List subscribed mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-move`|Move messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-my-rights`|Retrieve own rights via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-namespace`|Retrieve namespaces via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-rename`|Rename mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-search`|Search messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-select`|Select mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-sort`|Sort messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-status`|Retrieve mailbox status via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-store`|Modify message flags via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-subscribe`|Subscribe to mailboxes via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`imap-thread`|Thread messages via IMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`impersonate`|Act on behalf of another user|:white_check_mark:|||
|`incoming-report-delete`|Remove incoming DMARC, TLS and ARF reports|:white_check_mark:|:white_check_mark:||
|`incoming-report-get`|Retrieve specific incoming DMARC, TLS and ARF reports|:white_check_mark:|:white_check_mark:||
|`incoming-report-list`|View incoming DMARC, TLS and ARF reports|:white_check_mark:|:white_check_mark:||
|`individual-create`|Add new user accounts|:white_check_mark:|:white_check_mark:||
|`individual-delete`|Remove user accounts|:white_check_mark:|:white_check_mark:||
|`individual-get`|Retrieve specific account information|:white_check_mark:|:white_check_mark:||
|`individual-list`|View list of user accounts|:white_check_mark:|:white_check_mark:||
|`individual-update`|Modify user account information|:white_check_mark:|:white_check_mark:||
|`jmap-blob-copy`|Copy blobs via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-blob-get`|Retrieve blobs via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-blob-lookup`|Look up blobs via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-blob-upload`|Upload blobs via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-echo`|Perform JMAP echo requests|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-changes`|Track email changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-copy`|Copy emails via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-get`|Retrieve emails via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-import`|Import emails via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-parse`|Parse emails via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-query`|Perform email queries via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-query-changes`|Track email query changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-set`|Modify emails via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-submission-changes`|Track email submission changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-submission-get`|Retrieve email submission info via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-submission-query`|Perform email submission queries via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-submission-query-changes`|Track email submission query changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-email-submission-set`|Modify email submission settings via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-identity-changes`|Track identity changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-identity-get`|Retrieve user identities via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-identity-set`|Modify user identities via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-mailbox-changes`|Track mailbox changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-mailbox-get`|Retrieve mailboxes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-mailbox-query`|Perform mailbox queries via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-mailbox-query-changes`|Track mailbox query changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-mailbox-set`|Modify mailboxes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-principal-get`|Retrieve principal information via JMAP|:white_check_mark:|:white_check_mark:||
|`jmap-principal-query`|Perform principal queries via JMAP|:white_check_mark:|:white_check_mark:||
|`jmap-principal-query-changes`|Track principal query changes via JMAP|:white_check_mark:|:white_check_mark:||
|`jmap-push-subscription-get`|Retrieve push subscriptions via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-push-subscription-set`|Modify push subscriptions via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-quota-changes`|Track quota changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-quota-get`|Retrieve quota information via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-quota-query`|Perform quota queries via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-quota-query-changes`|Track quota query changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-search-snippet`|Retrieve search snippets via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-sieve-script-get`|Retrieve Sieve scripts via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-sieve-script-query`|Perform Sieve script queries via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-sieve-script-query-changes`|Track Sieve script query changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-sieve-script-set`|Modify Sieve scripts via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-sieve-script-validate`|Validate Sieve scripts via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-thread-changes`|Track thread changes via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-thread-get`|Retrieve email threads via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-vacation-response-get`|Retrieve vacation responses via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`jmap-vacation-response-set`|Modify vacation responses via JMAP|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`logs-view`|Access system logs|:white_check_mark:|||
|`mailing-list-create`|Create new mailing lists|:white_check_mark:|:white_check_mark:||
|`mailing-list-delete`|Remove mailing lists|:white_check_mark:|:white_check_mark:||
|`mailing-list-get`|Retrieve specific mailing list information|:white_check_mark:|:white_check_mark:||
|`mailing-list-list`|View list of mailing lists|:white_check_mark:|:white_check_mark:||
|`mailing-list-update`|Modify mailing list information|:white_check_mark:|:white_check_mark:||
|`manage-encryption`|Manage encryption-at-rest settings|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`manage-passwords`|Manage account passwords|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`message-queue-delete`|Remove messages from the queue|:white_check_mark:|:white_check_mark:||
|`message-queue-get`|Retrieve specific messages from the queue|:white_check_mark:|:white_check_mark:||
|`message-queue-list`|View message queue|:white_check_mark:|:white_check_mark:||
|`message-queue-update`|Modify queued messages|:white_check_mark:|:white_check_mark:||
|`metrics-list`|View stored metrics|:white_check_mark:|||
|`metrics-live`|View real-time metrics|:white_check_mark:|||
|`oauth-client-create`|Create new OAuth clients|:white_check_mark:|||
|`oauth-client-delete`|Remove OAuth clients|:white_check_mark:|||
|`oauth-client-get`|Retrieve specific OAuth clients|:white_check_mark:|||
|`oauth-client-list`|View OAuth clients|:white_check_mark:|||
|`oauth-client-override`|Override OAuth client settings|:white_check_mark:|||
|`oauth-client-registration`|Register OAuth clients|:white_check_mark:|||
|`oauth-client-update`|Modify OAuth clients|:white_check_mark:|||
|`outgoing-report-delete`|Remove outgoing DMARC and TLS reports|:white_check_mark:|:white_check_mark:||
|`outgoing-report-get`|Retrieve specific outgoing DMARC and TLS reports|:white_check_mark:|:white_check_mark:||
|`outgoing-report-list`|View outgoing DMARC and TLS reports|:white_check_mark:|:white_check_mark:||
|`pop3-authenticate`|Authenticate via POP3|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`pop3-dele`|Mark messages for deletion via POP3|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`pop3-list`|List messages via POP3|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`pop3-retr`|Retrieve messages via POP3|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`pop3-stat`|Retrieve mailbox statistics via POP3|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`pop3-uidl`|Retrieve unique IDs via POP3|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`principal-create`|Create new principals|:white_check_mark:|:white_check_mark:||
|`principal-delete`|Remove principals|:white_check_mark:|:white_check_mark:||
|`principal-get`|Retrieve specific principal information|:white_check_mark:|:white_check_mark:||
|`principal-list`|View list of principals|:white_check_mark:|:white_check_mark:||
|`principal-update`|Modify principal information|:white_check_mark:|:white_check_mark:||
|`purge-account`|Purge user accounts|:white_check_mark:|||
|`purge-blob-store`|Purge the blob storage|:white_check_mark:|||
|`purge-data-store`|Purge the data storage|:white_check_mark:|||
|`purge-in-memory-store`|Purge the in-memory storage|:white_check_mark:|||
|`restart`|Restart the email server|:white_check_mark:|||
|`role-create`|Create new roles|:white_check_mark:|:white_check_mark:||
|`role-delete`|Remove roles|:white_check_mark:|:white_check_mark:||
|`role-get`|Retrieve specific role information|:white_check_mark:|:white_check_mark:||
|`role-list`|View list of roles|:white_check_mark:|:white_check_mark:||
|`role-update`|Modify role information|:white_check_mark:|:white_check_mark:||
|`settings-delete`|Remove system settings|:white_check_mark:|||
|`settings-list`|View system settings|:white_check_mark:|||
|`settings-reload`|Refresh system settings|:white_check_mark:|||
|`settings-update`|Modify system settings|:white_check_mark:|||
|`sieve-authenticate`|Authenticate for Sieve script management|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-check-script`|Validate Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-delete-script`|Delete Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-get-script`|Retrieve Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-have-space`|Check available space for Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-list-scripts`|List Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-put-script`|Upload Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-rename-script`|Rename Sieve scripts|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`sieve-set-active`|Set active Sieve script|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`spam-filter-classify`|Classify emails with the spam filter|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`spam-filter-train`|Train the spam filter|:white_check_mark:|:white_check_mark:|:white_check_mark:|
|`spam-filter-update`|Modify spam filter settings|:white_check_mark:|||
|`tenant-create`|Add new tenants|:white_check_mark:|||
|`tenant-delete`|Remove tenants|:white_check_mark:|||
|`tenant-get`|Retrieve specific tenant information|:white_check_mark:|||
|`tenant-list`|View list of tenants|:white_check_mark:|||
|`tenant-update`|Modify tenant information|:white_check_mark:|||
|`tracing-get`|Retrieve specific trace information|:white_check_mark:|||
|`tracing-list`|View stored traces|:white_check_mark:|||
|`tracing-live`|Perform real-time tracing|:white_check_mark:|||
|`troubleshoot`|Perform troubleshooting|:white_check_mark:|||
|`undelete`|Restore deleted items|:white_check_mark:|:white_check_mark:||
|`unlimited-requests`|Perform unlimited requests|:white_check_mark:|||
|`unlimited-uploads`|Upload unlimited data|:white_check_mark:|||
|`webadmin-update`|Modify web admin interface settings|:white_check_mark:|||
