---
title: Permissions
description: Permission identifiers accepted in role and credential assignments, grouped by category.
sidebar_position: 4
custom_edit_url: null
---

# Permissions

Permissions are identifiers granted to accounts, groups, tenants, roles, and credentials. Each identifier is referenced in JMAP payloads as a plain string.

The first section lists the baseline permissions declared in the permission schema. The second section lists the `sys*` permissions automatically generated for every server object (one category per object, covering `Get` / `Create` / `Update` / `Destroy` / `Query` for objects and `Get` / `Update` for singletons).

## Base permissions


### Admin


- **`impersonate`**: Act on behalf of another user
- **`unlimitedRequests`**: Bypass request rate limits
- **`unlimitedUploads`**: Bypass upload size and rate limits
- **`fetchAnyBlob`**: Retrieve arbitrary blobs, even those not owned by the account


### Calendar


- **`calendarAlarmsSend`**: Send calendar alarm notifications via email
- **`calendarSchedulingSend`**: Send calendar invitations and updates via email
- **`calendarSchedulingReceive`**: Process incoming calendar invitations and replies


### Dav


- **`davSyncCollection`**: Synchronize collection changes with client
- **`davExpandProperty`**: Expand properties that reference other resources
- **`davPrincipalAcl`**: Manage access control properties on principals
- **`davPrincipalList`**: List available principals in the system
- **`davPrincipalMatch`**: Match principals based on specified criteria
- **`davPrincipalSearch`**: Search for principals by property values
- **`davPrincipalSearchPropSet`**: Query which properties can be searched on principals


### DavCal


- **`davCalPropFind`**: Retrieve properties of calendar entries
- **`davCalPropPatch`**: Modify properties of calendar entries
- **`davCalGet`**: Download calendar entries
- **`davCalMkCol`**: Create new calendar collections
- **`davCalDelete`**: Remove calendar entries or collections
- **`davCalPut`**: Upload or modify calendar entries
- **`davCalCopy`**: Copy calendar entries to new locations
- **`davCalMove`**: Move calendar entries to new locations
- **`davCalLock`**: Lock calendar entries to prevent concurrent modifications
- **`davCalAcl`**: Manage access control lists for calendar entries
- **`davCalQuery`**: Search for calendar entries matching criteria
- **`davCalMultiGet`**: Retrieve multiple calendar entries in a single request
- **`davCalFreeBusyQuery`**: Query free/busy time information for scheduling


### DavCard


- **`davCardPropFind`**: Retrieve properties of address book entries
- **`davCardPropPatch`**: Modify properties of address book entries
- **`davCardGet`**: Download address book entries
- **`davCardMkCol`**: Create new address book collections
- **`davCardDelete`**: Remove address book entries or collections
- **`davCardPut`**: Upload or modify address book entries
- **`davCardCopy`**: Copy address book entries to new locations
- **`davCardMove`**: Move address book entries to new locations
- **`davCardLock`**: Lock address book entries to prevent concurrent modifications
- **`davCardAcl`**: Manage access control lists for address book entries
- **`davCardQuery`**: Search for address book entries matching criteria
- **`davCardMultiGet`**: Retrieve multiple address book entries in a single request


### DavFile


- **`davFilePropFind`**: Retrieve properties of file resources
- **`davFilePropPatch`**: Modify properties of file resources
- **`davFileGet`**: Download file resources
- **`davFileMkCol`**: Create new file collections or directories
- **`davFileDelete`**: Remove file resources
- **`davFilePut`**: Upload or modify file resources
- **`davFileCopy`**: Copy file resources to new locations
- **`davFileMove`**: Move file resources to new locations
- **`davFileLock`**: Lock file resources to prevent concurrent modifications
- **`davFileAcl`**: Manage access control lists for file resources


### Email


- **`emailSend`**: Send emails
- **`emailReceive`**: Receive emails


### Imap


- **`imapAuthenticate`**: Sign in to the IMAP server
- **`imapAclGet`**: View mailbox access control lists
- **`imapAclSet`**: Modify mailbox access control lists
- **`imapMyRights`**: View own permissions on a mailbox
- **`imapListRights`**: List available permission flags for a mailbox
- **`imapAppend`**: Upload messages to a mailbox
- **`imapCapability`**: Query supported IMAP extensions
- **`imapId`**: Query server identification and version
- **`imapCopy`**: Copy messages between mailboxes
- **`imapMove`**: Move messages between mailboxes
- **`imapCreate`**: Create new mailboxes
- **`imapDelete`**: Delete mailboxes or mark messages for deletion
- **`imapEnable`**: Activate optional IMAP extensions
- **`imapExpunge`**: Permanently remove messages marked for deletion
- **`imapFetch`**: Download message content and metadata
- **`imapIdle`**: Receive real-time notifications for mailbox changes
- **`imapList`**: List available mailboxes and their attributes
- **`imapLsub`**: List mailboxes the user is subscribed to
- **`imapNamespace`**: Query available mailbox namespace prefixes
- **`imapRename`**: Rename or move mailboxes
- **`imapSearch`**: Search messages by criteria
- **`imapSort`**: Retrieve messages in a specified sort order
- **`imapSelect`**: Open a mailbox for read-write access
- **`imapExamine`**: Open a mailbox for read-only access
- **`imapStatus`**: Query mailbox message counts and state
- **`imapStore`**: Set or clear message flags (read, flagged, deleted, etc.)
- **`imapSubscribe`**: Subscribe or unsubscribe to mailboxes
- **`imapThread`**: Group messages into conversation threads


### JmapAddressBook


- **`jmapAddressBookGet`**: Retrieve address book details and properties
- **`jmapAddressBookChanges`**: Track changes to address books since a given state
- **`jmapAddressBookCreate`**: Create new address books
- **`jmapAddressBookUpdate`**: Modify existing address books
- **`jmapAddressBookDestroy`**: Remove address books


### JmapBlob


- **`jmapBlobGet`**: Download blob data
- **`jmapBlobCopy`**: Copy blobs to another account
- **`jmapBlobLookup`**: Look up blob usage across data types
- **`jmapBlobUpload`**: Upload new blob data


### JmapCalendar


- **`jmapCalendarGet`**: Retrieve calendar details and properties
- **`jmapCalendarChanges`**: Track changes to calendars since a given state
- **`jmapCalendarCreate`**: Create new calendars
- **`jmapCalendarUpdate`**: Modify existing calendars
- **`jmapCalendarDestroy`**: Remove calendars


### JmapCalendarEvent


- **`jmapCalendarEventGet`**: Retrieve calendar event details
- **`jmapCalendarEventChanges`**: Track changes to calendar events since a given state
- **`jmapCalendarEventQuery`**: Search for calendar events matching criteria
- **`jmapCalendarEventQueryChanges`**: Track changes to calendar event query results
- **`jmapCalendarEventCreate`**: Create new calendar events
- **`jmapCalendarEventUpdate`**: Modify existing calendar events
- **`jmapCalendarEventDestroy`**: Remove calendar events
- **`jmapCalendarEventCopy`**: Copy calendar events to another account
- **`jmapCalendarEventParse`**: Parse raw calendar event data without storing


### JmapCalendarEventNotification


- **`jmapCalendarEventNotificationGet`**: Retrieve calendar event notification details
- **`jmapCalendarEventNotificationChanges`**: Track changes to calendar event notifications since a given state
- **`jmapCalendarEventNotificationQuery`**: Search for calendar event notifications matching criteria
- **`jmapCalendarEventNotificationQueryChanges`**: Track changes to calendar event notification query results
- **`jmapCalendarEventNotificationCreate`**: Create new calendar event notifications
- **`jmapCalendarEventNotificationUpdate`**: Modify existing calendar event notifications
- **`jmapCalendarEventNotificationDestroy`**: Remove calendar event notifications


### JmapContactCard


- **`jmapContactCardGet`**: Retrieve contact card details
- **`jmapContactCardChanges`**: Track changes to contact cards since a given state
- **`jmapContactCardQuery`**: Search for contact cards matching criteria
- **`jmapContactCardQueryChanges`**: Track changes to contact card query results
- **`jmapContactCardCreate`**: Create new contact cards
- **`jmapContactCardUpdate`**: Modify existing contact cards
- **`jmapContactCardDestroy`**: Remove contact cards
- **`jmapContactCardCopy`**: Copy contact cards to another account
- **`jmapContactCardParse`**: Parse raw contact card data without storing


### JmapCore


- **`jmapCoreEcho`**: Echo back input data for testing


### JmapEmail


- **`jmapEmailGet`**: Retrieve email details and properties
- **`jmapEmailChanges`**: Track changes to emails since a given state
- **`jmapEmailQuery`**: Search for emails matching criteria
- **`jmapEmailQueryChanges`**: Track changes to email query results
- **`jmapEmailCreate`**: Create new emails
- **`jmapEmailUpdate`**: Modify existing emails
- **`jmapEmailDestroy`**: Remove emails
- **`jmapEmailCopy`**: Copy emails to another account
- **`jmapEmailImport`**: Import emails from blob data
- **`jmapEmailParse`**: Parse raw email data without storing


### JmapEmailSubmission


- **`jmapEmailSubmissionGet`**: Retrieve email submission details
- **`jmapEmailSubmissionChanges`**: Track changes to email submissions since a given state
- **`jmapEmailSubmissionQuery`**: Search for email submissions matching criteria
- **`jmapEmailSubmissionQueryChanges`**: Track changes to email submission query results
- **`jmapEmailSubmissionCreate`**: Create new email submissions for sending
- **`jmapEmailSubmissionUpdate`**: Modify existing email submissions
- **`jmapEmailSubmissionDestroy`**: Remove email submissions


### JmapFileNode


- **`jmapFileNodeGet`**: Retrieve file node details and properties
- **`jmapFileNodeChanges`**: Track changes to file nodes since a given state
- **`jmapFileNodeQuery`**: Search for file nodes matching criteria
- **`jmapFileNodeQueryChanges`**: Track changes to file node query results
- **`jmapFileNodeCreate`**: Create new file nodes
- **`jmapFileNodeUpdate`**: Modify existing file nodes
- **`jmapFileNodeDestroy`**: Remove file nodes


### JmapIdentity


- **`jmapIdentityGet`**: Retrieve sender identity details
- **`jmapIdentityChanges`**: Track changes to identities since a given state
- **`jmapIdentityCreate`**: Create new sender identities
- **`jmapIdentityUpdate`**: Modify existing sender identities
- **`jmapIdentityDestroy`**: Remove sender identities


### JmapMailbox


- **`jmapMailboxGet`**: Retrieve mailbox details and properties
- **`jmapMailboxChanges`**: Track changes to mailboxes since a given state
- **`jmapMailboxQuery`**: Search for mailboxes matching criteria
- **`jmapMailboxQueryChanges`**: Track changes to mailbox query results
- **`jmapMailboxCreate`**: Create new mailboxes
- **`jmapMailboxUpdate`**: Modify existing mailboxes
- **`jmapMailboxDestroy`**: Remove mailboxes


### JmapParticipantIdentity


- **`jmapParticipantIdentityGet`**: Retrieve participant identity details
- **`jmapParticipantIdentityChanges`**: Track changes to participant identities since a given state
- **`jmapParticipantIdentityCreate`**: Create new participant identities
- **`jmapParticipantIdentityUpdate`**: Modify existing participant identities
- **`jmapParticipantIdentityDestroy`**: Remove participant identities


### JmapPrincipal


- **`jmapPrincipalGet`**: Retrieve principal details and properties
- **`jmapPrincipalQuery`**: Search for principals matching criteria
- **`jmapPrincipalChanges`**: Track changes to principals since a given state
- **`jmapPrincipalQueryChanges`**: Track changes to principal query results
- **`jmapPrincipalGetAvailability`**: Query availability information for principals
- **`jmapPrincipalCreate`**: Create new principals
- **`jmapPrincipalUpdate`**: Modify existing principals
- **`jmapPrincipalDestroy`**: Remove principals


### JmapPushSubscription


- **`jmapPushSubscriptionGet`**: Retrieve push subscription details
- **`jmapPushSubscriptionCreate`**: Create new push subscriptions
- **`jmapPushSubscriptionUpdate`**: Modify existing push subscriptions
- **`jmapPushSubscriptionDestroy`**: Remove push subscriptions


### JmapQuota


- **`jmapQuotaGet`**: Retrieve quota usage and limits
- **`jmapQuotaChanges`**: Track changes to quotas since a given state
- **`jmapQuotaQuery`**: Search for quotas matching criteria
- **`jmapQuotaQueryChanges`**: Track changes to quota query results


### JmapSearchSnippet


- **`jmapSearchSnippetGet`**: Retrieve search result snippets for emails


### JmapShareNotification


- **`jmapShareNotificationGet`**: Retrieve share notification details
- **`jmapShareNotificationChanges`**: Track changes to share notifications since a given state
- **`jmapShareNotificationQuery`**: Search for share notifications matching criteria
- **`jmapShareNotificationQueryChanges`**: Track changes to share notification query results
- **`jmapShareNotificationCreate`**: Create new share notifications
- **`jmapShareNotificationUpdate`**: Modify existing share notifications
- **`jmapShareNotificationDestroy`**: Remove share notifications


### JmapSieveScript


- **`jmapSieveScriptGet`**: Retrieve Sieve filter script details
- **`jmapSieveScriptQuery`**: Search for Sieve scripts matching criteria
- **`jmapSieveScriptValidate`**: Validate a Sieve script without storing
- **`jmapSieveScriptCreate`**: Create new Sieve filter scripts
- **`jmapSieveScriptUpdate`**: Modify existing Sieve filter scripts
- **`jmapSieveScriptDestroy`**: Remove Sieve filter scripts


### JmapThread


- **`jmapThreadGet`**: Retrieve email thread details
- **`jmapThreadChanges`**: Track changes to threads since a given state


### JmapVacationResponse


- **`jmapVacationResponseGet`**: Retrieve vacation response configuration
- **`jmapVacationResponseCreate`**: Create vacation response settings
- **`jmapVacationResponseUpdate`**: Modify vacation response settings
- **`jmapVacationResponseDestroy`**: Remove vacation response settings


### Live


- **`liveTracing`**: View real-time server event traces
- **`liveMetrics`**: View real-time server performance metrics
- **`liveDeliveryTest`**: Send test emails to verify delivery configuration


### OAuth


- **`oAuthClientRegistration`**: Register new OAuth client applications
- **`oAuthClientOverride`**: Bypass OAuth client registration requirements


### Pop3


- **`pop3Authenticate`**: Sign in to the POP3 server
- **`pop3List`**: List messages and their sizes
- **`pop3Uidl`**: Retrieve unique message identifiers
- **`pop3Stat`**: Query mailbox message count and total size
- **`pop3Retr`**: Download message content
- **`pop3Dele`**: Mark messages for deletion on disconnect


### Sieve


- **`sieveAuthenticate`**: Sign in to the ManageSieve server
- **`sieveListScripts`**: List uploaded Sieve scripts
- **`sieveSetActive`**: Designate which Sieve script is active
- **`sieveGetScript`**: Download Sieve script content
- **`sievePutScript`**: Upload or replace a Sieve script
- **`sieveDeleteScript`**: Remove a Sieve script
- **`sieveRenameScript`**: Rename a Sieve script
- **`sieveCheckScript`**: Validate Sieve script syntax without saving
- **`sieveHaveSpace`**: Check if quota allows uploading a script of a given size


### User


- **`authenticate`**: Sign in to the server
- **`authenticateWithAlias`**: Sign in using email alias addresses
- **`interactAi`**: Interact with AI models



## Registry permissions


### sysAccount


- **`sysAccountGet`**: Get accounts
- **`sysAccountCreate`**: Create accounts
- **`sysAccountUpdate`**: Update accounts
- **`sysAccountDestroy`**: Destroy accounts
- **`sysAccountQuery`**: Query accounts


### sysAccountPassword


- **`sysAccountPasswordGet`**: Get AccountPassword settings
- **`sysAccountPasswordUpdate`**: Update AccountPassword settings


### sysAccountSettings


- **`sysAccountSettingsGet`**: Get AccountSettings settings
- **`sysAccountSettingsUpdate`**: Update AccountSettings settings


### sysAcmeProvider


- **`sysAcmeProviderGet`**: Get providers
- **`sysAcmeProviderCreate`**: Create providers
- **`sysAcmeProviderUpdate`**: Update providers
- **`sysAcmeProviderDestroy`**: Destroy providers
- **`sysAcmeProviderQuery`**: Query providers


### sysAction


- **`actionReloadSettings`**: Action: Reload: Server settings
- **`actionReloadTlsCertificates`**: Action: Reload: TLS certificates
- **`actionReloadLookupStores`**: Action: Reload: Lookup stores
- **`actionReloadBlockedIps`**: Action: Reload: Blocked IPs list
- **`actionUpdateApps`**: Action: Application Management: Update applications
- **`actionTroubleshootDmarc`**: Action: DMARC: Troubleshooting
- **`actionClassifySpam`**: Action: Spam Filter: Classify a message
- **`actionInvalidateCaches`**: Action: Cache: Invalidate all caches
- **`actionInvalidateNegativeCaches`**: Action: Cache: Invalidate negative caches
- **`actionPauseMtaQueue`**: Action: MTA: Pause queue processing
- **`actionResumeMtaQueue`**: Action: MTA: Resume queue processing
- **`sysActionGet`**: Get actions
- **`sysActionCreate`**: Create actions
- **`sysActionUpdate`**: Update actions
- **`sysActionDestroy`**: Destroy actions
- **`sysActionQuery`**: Query actions


### sysAddressBook


- **`sysAddressBookGet`**: Get AddressBook settings
- **`sysAddressBookUpdate`**: Update AddressBook settings


### sysAiModel


- **`sysAiModelGet`**: Get AI models
- **`sysAiModelCreate`**: Create AI models
- **`sysAiModelUpdate`**: Update AI models
- **`sysAiModelDestroy`**: Destroy AI models
- **`sysAiModelQuery`**: Query AI models


### sysAlert


- **`sysAlertGet`**: Get alerts
- **`sysAlertCreate`**: Create alerts
- **`sysAlertUpdate`**: Update alerts
- **`sysAlertDestroy`**: Destroy alerts
- **`sysAlertQuery`**: Query alerts


### sysAllowedIp


- **`sysAllowedIpGet`**: Get addresses
- **`sysAllowedIpCreate`**: Create addresses
- **`sysAllowedIpUpdate`**: Update addresses
- **`sysAllowedIpDestroy`**: Destroy addresses
- **`sysAllowedIpQuery`**: Query addresses


### sysApiKey


- **`sysApiKeyGet`**: Get API keys
- **`sysApiKeyCreate`**: Create API keys
- **`sysApiKeyUpdate`**: Update API keys
- **`sysApiKeyDestroy`**: Destroy API keys
- **`sysApiKeyQuery`**: Query API keys


### sysAppPassword


- **`sysAppPasswordGet`**: Get App passwords
- **`sysAppPasswordCreate`**: Create App passwords
- **`sysAppPasswordUpdate`**: Update App passwords
- **`sysAppPasswordDestroy`**: Destroy App passwords
- **`sysAppPasswordQuery`**: Query App passwords


### sysApplication


- **`sysApplicationGet`**: Get applications
- **`sysApplicationCreate`**: Create applications
- **`sysApplicationUpdate`**: Update applications
- **`sysApplicationDestroy`**: Destroy applications
- **`sysApplicationQuery`**: Query applications


### sysArchivedItem


- **`sysArchivedItemGet`**: Get archived items
- **`sysArchivedItemCreate`**: Create archived items
- **`sysArchivedItemUpdate`**: Update archived items
- **`sysArchivedItemDestroy`**: Destroy archived items
- **`sysArchivedItemQuery`**: Query archived items


### sysArfExternalReport


- **`sysArfExternalReportGet`**: Get reports
- **`sysArfExternalReportCreate`**: Create reports
- **`sysArfExternalReportUpdate`**: Update reports
- **`sysArfExternalReportDestroy`**: Destroy reports
- **`sysArfExternalReportQuery`**: Query reports


### sysAsn


- **`sysAsnGet`**: Get Asn settings
- **`sysAsnUpdate`**: Update Asn settings


### sysAuthentication


- **`sysAuthenticationGet`**: Get Authentication settings
- **`sysAuthenticationUpdate`**: Update Authentication settings


### sysBlobStore


- **`sysBlobStoreGet`**: Get BlobStore settings
- **`sysBlobStoreUpdate`**: Update BlobStore settings


### sysBlockedIp


- **`sysBlockedIpGet`**: Get addresses
- **`sysBlockedIpCreate`**: Create addresses
- **`sysBlockedIpUpdate`**: Update addresses
- **`sysBlockedIpDestroy`**: Destroy addresses
- **`sysBlockedIpQuery`**: Query addresses


### sysBootstrap


- **`sysBootstrapGet`**: Get Bootstrap settings
- **`sysBootstrapUpdate`**: Update Bootstrap settings


### sysCache


- **`sysCacheGet`**: Get Cache settings
- **`sysCacheUpdate`**: Update Cache settings


### sysCalendar


- **`sysCalendarGet`**: Get Calendar settings
- **`sysCalendarUpdate`**: Update Calendar settings


### sysCalendarAlarm


- **`sysCalendarAlarmGet`**: Get CalendarAlarm settings
- **`sysCalendarAlarmUpdate`**: Update CalendarAlarm settings


### sysCalendarScheduling


- **`sysCalendarSchedulingGet`**: Get CalendarScheduling settings
- **`sysCalendarSchedulingUpdate`**: Update CalendarScheduling settings


### sysCertificate


- **`sysCertificateGet`**: Get certificates
- **`sysCertificateCreate`**: Create certificates
- **`sysCertificateUpdate`**: Update certificates
- **`sysCertificateDestroy`**: Destroy certificates
- **`sysCertificateQuery`**: Query certificates


### sysClusterNode


- **`sysClusterNodeGet`**: Get cluster nodes
- **`sysClusterNodeCreate`**: Create cluster nodes
- **`sysClusterNodeUpdate`**: Update cluster nodes
- **`sysClusterNodeDestroy`**: Destroy cluster nodes
- **`sysClusterNodeQuery`**: Query cluster nodes


### sysClusterRole


- **`sysClusterRoleGet`**: Get roles
- **`sysClusterRoleCreate`**: Create roles
- **`sysClusterRoleUpdate`**: Update roles
- **`sysClusterRoleDestroy`**: Destroy roles
- **`sysClusterRoleQuery`**: Query roles


### sysCoordinator


- **`sysCoordinatorGet`**: Get Coordinator settings
- **`sysCoordinatorUpdate`**: Update Coordinator settings


### sysDataRetention


- **`sysDataRetentionGet`**: Get DataRetention settings
- **`sysDataRetentionUpdate`**: Update DataRetention settings


### sysDataStore


- **`sysDataStoreGet`**: Get DataStore settings
- **`sysDataStoreUpdate`**: Update DataStore settings


### sysDirectory


- **`sysDirectoryGet`**: Get directories
- **`sysDirectoryCreate`**: Create directories
- **`sysDirectoryUpdate`**: Update directories
- **`sysDirectoryDestroy`**: Destroy directories
- **`sysDirectoryQuery`**: Query directories


### sysDkimReportSettings


- **`sysDkimReportSettingsGet`**: Get DkimReportSettings settings
- **`sysDkimReportSettingsUpdate`**: Update DkimReportSettings settings


### sysDkimSignature


- **`sysDkimSignatureGet`**: Get signatures
- **`sysDkimSignatureCreate`**: Create signatures
- **`sysDkimSignatureUpdate`**: Update signatures
- **`sysDkimSignatureDestroy`**: Destroy signatures
- **`sysDkimSignatureQuery`**: Query signatures


### sysDmarcExternalReport


- **`sysDmarcExternalReportGet`**: Get reports
- **`sysDmarcExternalReportCreate`**: Create reports
- **`sysDmarcExternalReportUpdate`**: Update reports
- **`sysDmarcExternalReportDestroy`**: Destroy reports
- **`sysDmarcExternalReportQuery`**: Query reports


### sysDmarcInternalReport


- **`sysDmarcInternalReportGet`**: Get reports
- **`sysDmarcInternalReportCreate`**: Create reports
- **`sysDmarcInternalReportUpdate`**: Update reports
- **`sysDmarcInternalReportDestroy`**: Destroy reports
- **`sysDmarcInternalReportQuery`**: Query reports


### sysDmarcReportSettings


- **`sysDmarcReportSettingsGet`**: Get DmarcReportSettings settings
- **`sysDmarcReportSettingsUpdate`**: Update DmarcReportSettings settings


### sysDnsResolver


- **`sysDnsResolverGet`**: Get DnsResolver settings
- **`sysDnsResolverUpdate`**: Update DnsResolver settings


### sysDnsServer


- **`sysDnsServerGet`**: Get DNS servers
- **`sysDnsServerCreate`**: Create DNS servers
- **`sysDnsServerUpdate`**: Update DNS servers
- **`sysDnsServerDestroy`**: Destroy DNS servers
- **`sysDnsServerQuery`**: Query DNS servers


### sysDomain


- **`sysDomainGet`**: Get domains
- **`sysDomainCreate`**: Create domains
- **`sysDomainUpdate`**: Update domains
- **`sysDomainDestroy`**: Destroy domains
- **`sysDomainQuery`**: Query domains


### sysDsnReportSettings


- **`sysDsnReportSettingsGet`**: Get DsnReportSettings settings
- **`sysDsnReportSettingsUpdate`**: Update DsnReportSettings settings


### sysEmail


- **`sysEmailGet`**: Get Email settings
- **`sysEmailUpdate`**: Update Email settings


### sysEnterprise


- **`sysEnterpriseGet`**: Get Enterprise settings
- **`sysEnterpriseUpdate`**: Update Enterprise settings


### sysEventTracingLevel


- **`sysEventTracingLevelGet`**: Get events
- **`sysEventTracingLevelCreate`**: Create events
- **`sysEventTracingLevelUpdate`**: Update events
- **`sysEventTracingLevelDestroy`**: Destroy events
- **`sysEventTracingLevelQuery`**: Query events


### sysFileStorage


- **`sysFileStorageGet`**: Get FileStorage settings
- **`sysFileStorageUpdate`**: Update FileStorage settings


### sysHttp


- **`sysHttpGet`**: Get Http settings
- **`sysHttpUpdate`**: Update Http settings


### sysHttpForm


- **`sysHttpFormGet`**: Get HttpForm settings
- **`sysHttpFormUpdate`**: Update HttpForm settings


### sysHttpLookup


- **`sysHttpLookupGet`**: Get lists
- **`sysHttpLookupCreate`**: Create lists
- **`sysHttpLookupUpdate`**: Update lists
- **`sysHttpLookupDestroy`**: Destroy lists
- **`sysHttpLookupQuery`**: Query lists


### sysImap


- **`sysImapGet`**: Get Imap settings
- **`sysImapUpdate`**: Update Imap settings


### sysInMemoryStore


- **`sysInMemoryStoreGet`**: Get InMemoryStore settings
- **`sysInMemoryStoreUpdate`**: Update InMemoryStore settings


### sysJmap


- **`sysJmapGet`**: Get Jmap settings
- **`sysJmapUpdate`**: Update Jmap settings


### sysLog


- **`sysLogGet`**: Get log entries
- **`sysLogCreate`**: Create log entries
- **`sysLogUpdate`**: Update log entries
- **`sysLogDestroy`**: Destroy log entries
- **`sysLogQuery`**: Query log entries


### sysMailingList


- **`sysMailingListGet`**: Get mailing lists
- **`sysMailingListCreate`**: Create mailing lists
- **`sysMailingListUpdate`**: Update mailing lists
- **`sysMailingListDestroy`**: Destroy mailing lists
- **`sysMailingListQuery`**: Query mailing lists


### sysMaskedEmail


- **`sysMaskedEmailGet`**: Get masked emails
- **`sysMaskedEmailCreate`**: Create masked emails
- **`sysMaskedEmailUpdate`**: Update masked emails
- **`sysMaskedEmailDestroy`**: Destroy masked emails
- **`sysMaskedEmailQuery`**: Query masked emails


### sysMemoryLookupKey


- **`sysMemoryLookupKeyGet`**: Get keys
- **`sysMemoryLookupKeyCreate`**: Create keys
- **`sysMemoryLookupKeyUpdate`**: Update keys
- **`sysMemoryLookupKeyDestroy`**: Destroy keys
- **`sysMemoryLookupKeyQuery`**: Query keys


### sysMemoryLookupKeyValue


- **`sysMemoryLookupKeyValueGet`**: Get keys
- **`sysMemoryLookupKeyValueCreate`**: Create keys
- **`sysMemoryLookupKeyValueUpdate`**: Update keys
- **`sysMemoryLookupKeyValueDestroy`**: Destroy keys
- **`sysMemoryLookupKeyValueQuery`**: Query keys


### sysMetric


- **`sysMetricGet`**: Get metrics
- **`sysMetricCreate`**: Create metrics
- **`sysMetricUpdate`**: Update metrics
- **`sysMetricDestroy`**: Destroy metrics
- **`sysMetricQuery`**: Query metrics


### sysMetrics


- **`sysMetricsGet`**: Get Metrics settings
- **`sysMetricsUpdate`**: Update Metrics settings


### sysMetricsStore


- **`sysMetricsStoreGet`**: Get MetricsStore settings
- **`sysMetricsStoreUpdate`**: Update MetricsStore settings


### sysMtaConnectionStrategy


- **`sysMtaConnectionStrategyGet`**: Get strategies
- **`sysMtaConnectionStrategyCreate`**: Create strategies
- **`sysMtaConnectionStrategyUpdate`**: Update strategies
- **`sysMtaConnectionStrategyDestroy`**: Destroy strategies
- **`sysMtaConnectionStrategyQuery`**: Query strategies


### sysMtaDeliverySchedule


- **`sysMtaDeliveryScheduleGet`**: Get schedules
- **`sysMtaDeliveryScheduleCreate`**: Create schedules
- **`sysMtaDeliveryScheduleUpdate`**: Update schedules
- **`sysMtaDeliveryScheduleDestroy`**: Destroy schedules
- **`sysMtaDeliveryScheduleQuery`**: Query schedules


### sysMtaExtensions


- **`sysMtaExtensionsGet`**: Get MtaExtensions settings
- **`sysMtaExtensionsUpdate`**: Update MtaExtensions settings


### sysMtaHook


- **`sysMtaHookGet`**: Get hooks
- **`sysMtaHookCreate`**: Create hooks
- **`sysMtaHookUpdate`**: Update hooks
- **`sysMtaHookDestroy`**: Destroy hooks
- **`sysMtaHookQuery`**: Query hooks


### sysMtaInboundSession


- **`sysMtaInboundSessionGet`**: Get MtaInboundSession settings
- **`sysMtaInboundSessionUpdate`**: Update MtaInboundSession settings


### sysMtaInboundThrottle


- **`sysMtaInboundThrottleGet`**: Get throttles
- **`sysMtaInboundThrottleCreate`**: Create throttles
- **`sysMtaInboundThrottleUpdate`**: Update throttles
- **`sysMtaInboundThrottleDestroy`**: Destroy throttles
- **`sysMtaInboundThrottleQuery`**: Query throttles


### sysMtaMilter


- **`sysMtaMilterGet`**: Get milters
- **`sysMtaMilterCreate`**: Create milters
- **`sysMtaMilterUpdate`**: Update milters
- **`sysMtaMilterDestroy`**: Destroy milters
- **`sysMtaMilterQuery`**: Query milters


### sysMtaOutboundStrategy


- **`sysMtaOutboundStrategyGet`**: Get MtaOutboundStrategy settings
- **`sysMtaOutboundStrategyUpdate`**: Update MtaOutboundStrategy settings


### sysMtaOutboundThrottle


- **`sysMtaOutboundThrottleGet`**: Get throttles
- **`sysMtaOutboundThrottleCreate`**: Create throttles
- **`sysMtaOutboundThrottleUpdate`**: Update throttles
- **`sysMtaOutboundThrottleDestroy`**: Destroy throttles
- **`sysMtaOutboundThrottleQuery`**: Query throttles


### sysMtaQueueQuota


- **`sysMtaQueueQuotaGet`**: Get quotas
- **`sysMtaQueueQuotaCreate`**: Create quotas
- **`sysMtaQueueQuotaUpdate`**: Update quotas
- **`sysMtaQueueQuotaDestroy`**: Destroy quotas
- **`sysMtaQueueQuotaQuery`**: Query quotas


### sysMtaRoute


- **`sysMtaRouteGet`**: Get routes
- **`sysMtaRouteCreate`**: Create routes
- **`sysMtaRouteUpdate`**: Update routes
- **`sysMtaRouteDestroy`**: Destroy routes
- **`sysMtaRouteQuery`**: Query routes


### sysMtaStageAuth


- **`sysMtaStageAuthGet`**: Get MtaStageAuth settings
- **`sysMtaStageAuthUpdate`**: Update MtaStageAuth settings


### sysMtaStageConnect


- **`sysMtaStageConnectGet`**: Get MtaStageConnect settings
- **`sysMtaStageConnectUpdate`**: Update MtaStageConnect settings


### sysMtaStageData


- **`sysMtaStageDataGet`**: Get MtaStageData settings
- **`sysMtaStageDataUpdate`**: Update MtaStageData settings


### sysMtaStageEhlo


- **`sysMtaStageEhloGet`**: Get MtaStageEhlo settings
- **`sysMtaStageEhloUpdate`**: Update MtaStageEhlo settings


### sysMtaStageMail


- **`sysMtaStageMailGet`**: Get MtaStageMail settings
- **`sysMtaStageMailUpdate`**: Update MtaStageMail settings


### sysMtaStageRcpt


- **`sysMtaStageRcptGet`**: Get MtaStageRcpt settings
- **`sysMtaStageRcptUpdate`**: Update MtaStageRcpt settings


### sysMtaSts


- **`sysMtaStsGet`**: Get MtaSts settings
- **`sysMtaStsUpdate`**: Update MtaSts settings


### sysMtaTlsStrategy


- **`sysMtaTlsStrategyGet`**: Get strategies
- **`sysMtaTlsStrategyCreate`**: Create strategies
- **`sysMtaTlsStrategyUpdate`**: Update strategies
- **`sysMtaTlsStrategyDestroy`**: Destroy strategies
- **`sysMtaTlsStrategyQuery`**: Query strategies


### sysMtaVirtualQueue


- **`sysMtaVirtualQueueGet`**: Get queues
- **`sysMtaVirtualQueueCreate`**: Create queues
- **`sysMtaVirtualQueueUpdate`**: Update queues
- **`sysMtaVirtualQueueDestroy`**: Destroy queues
- **`sysMtaVirtualQueueQuery`**: Query queues


### sysNetworkListener


- **`sysNetworkListenerGet`**: Get listeners
- **`sysNetworkListenerCreate`**: Create listeners
- **`sysNetworkListenerUpdate`**: Update listeners
- **`sysNetworkListenerDestroy`**: Destroy listeners
- **`sysNetworkListenerQuery`**: Query listeners


### sysOAuthClient


- **`sysOAuthClientGet`**: Get OAuth clients
- **`sysOAuthClientCreate`**: Create OAuth clients
- **`sysOAuthClientUpdate`**: Update OAuth clients
- **`sysOAuthClientDestroy`**: Destroy OAuth clients
- **`sysOAuthClientQuery`**: Query OAuth clients


### sysOidcProvider


- **`sysOidcProviderGet`**: Get OidcProvider settings
- **`sysOidcProviderUpdate`**: Update OidcProvider settings


### sysPublicKey


- **`sysPublicKeyGet`**: Get public keys
- **`sysPublicKeyCreate`**: Create public keys
- **`sysPublicKeyUpdate`**: Update public keys
- **`sysPublicKeyDestroy`**: Destroy public keys
- **`sysPublicKeyQuery`**: Query public keys


### sysQueuedMessage


- **`sysQueuedMessageGet`**: Get messages
- **`sysQueuedMessageCreate`**: Create messages
- **`sysQueuedMessageUpdate`**: Update messages
- **`sysQueuedMessageDestroy`**: Destroy messages
- **`sysQueuedMessageQuery`**: Query messages


### sysReportSettings


- **`sysReportSettingsGet`**: Get ReportSettings settings
- **`sysReportSettingsUpdate`**: Update ReportSettings settings


### sysRole


- **`sysRoleGet`**: Get roles
- **`sysRoleCreate`**: Create roles
- **`sysRoleUpdate`**: Update roles
- **`sysRoleDestroy`**: Destroy roles
- **`sysRoleQuery`**: Query roles


### sysSearch


- **`sysSearchGet`**: Get Search settings
- **`sysSearchUpdate`**: Update Search settings


### sysSearchStore


- **`sysSearchStoreGet`**: Get SearchStore settings
- **`sysSearchStoreUpdate`**: Update SearchStore settings


### sysSecurity


- **`sysSecurityGet`**: Get Security settings
- **`sysSecurityUpdate`**: Update Security settings


### sysSenderAuth


- **`sysSenderAuthGet`**: Get SenderAuth settings
- **`sysSenderAuthUpdate`**: Update SenderAuth settings


### sysSharing


- **`sysSharingGet`**: Get Sharing settings
- **`sysSharingUpdate`**: Update Sharing settings


### sysSieveSystemInterpreter


- **`sysSieveSystemInterpreterGet`**: Get SieveSystemInterpreter settings
- **`sysSieveSystemInterpreterUpdate`**: Update SieveSystemInterpreter settings


### sysSieveSystemScript


- **`sysSieveSystemScriptGet`**: Get scripts
- **`sysSieveSystemScriptCreate`**: Create scripts
- **`sysSieveSystemScriptUpdate`**: Update scripts
- **`sysSieveSystemScriptDestroy`**: Destroy scripts
- **`sysSieveSystemScriptQuery`**: Query scripts


### sysSieveUserInterpreter


- **`sysSieveUserInterpreterGet`**: Get SieveUserInterpreter settings
- **`sysSieveUserInterpreterUpdate`**: Update SieveUserInterpreter settings


### sysSieveUserScript


- **`sysSieveUserScriptGet`**: Get scripts
- **`sysSieveUserScriptCreate`**: Create scripts
- **`sysSieveUserScriptUpdate`**: Update scripts
- **`sysSieveUserScriptDestroy`**: Destroy scripts
- **`sysSieveUserScriptQuery`**: Query scripts


### sysSpamClassifier


- **`sysSpamClassifierGet`**: Get SpamClassifier settings
- **`sysSpamClassifierUpdate`**: Update SpamClassifier settings


### sysSpamDnsblServer


- **`sysSpamDnsblServerGet`**: Get servers
- **`sysSpamDnsblServerCreate`**: Create servers
- **`sysSpamDnsblServerUpdate`**: Update servers
- **`sysSpamDnsblServerDestroy`**: Destroy servers
- **`sysSpamDnsblServerQuery`**: Query servers


### sysSpamDnsblSettings


- **`sysSpamDnsblSettingsGet`**: Get SpamDnsblSettings settings
- **`sysSpamDnsblSettingsUpdate`**: Update SpamDnsblSettings settings


### sysSpamFileExtension


- **`sysSpamFileExtensionGet`**: Get extensions
- **`sysSpamFileExtensionCreate`**: Create extensions
- **`sysSpamFileExtensionUpdate`**: Update extensions
- **`sysSpamFileExtensionDestroy`**: Destroy extensions
- **`sysSpamFileExtensionQuery`**: Query extensions


### sysSpamLlm


- **`sysSpamLlmGet`**: Get SpamLlm settings
- **`sysSpamLlmUpdate`**: Update SpamLlm settings


### sysSpamPyzor


- **`sysSpamPyzorGet`**: Get SpamPyzor settings
- **`sysSpamPyzorUpdate`**: Update SpamPyzor settings


### sysSpamRule


- **`sysSpamRuleGet`**: Get rules
- **`sysSpamRuleCreate`**: Create rules
- **`sysSpamRuleUpdate`**: Update rules
- **`sysSpamRuleDestroy`**: Destroy rules
- **`sysSpamRuleQuery`**: Query rules


### sysSpamSettings


- **`sysSpamSettingsGet`**: Get SpamSettings settings
- **`sysSpamSettingsUpdate`**: Update SpamSettings settings


### sysSpamTag


- **`sysSpamTagGet`**: Get tags
- **`sysSpamTagCreate`**: Create tags
- **`sysSpamTagUpdate`**: Update tags
- **`sysSpamTagDestroy`**: Destroy tags
- **`sysSpamTagQuery`**: Query tags


### sysSpamTrainingSample


- **`sysSpamTrainingSampleGet`**: Get samples
- **`sysSpamTrainingSampleCreate`**: Create samples
- **`sysSpamTrainingSampleUpdate`**: Update samples
- **`sysSpamTrainingSampleDestroy`**: Destroy samples
- **`sysSpamTrainingSampleQuery`**: Query samples


### sysSpfReportSettings


- **`sysSpfReportSettingsGet`**: Get SpfReportSettings settings
- **`sysSpfReportSettingsUpdate`**: Update SpfReportSettings settings


### sysStoreLookup


- **`sysStoreLookupGet`**: Get lookups
- **`sysStoreLookupCreate`**: Create lookups
- **`sysStoreLookupUpdate`**: Update lookups
- **`sysStoreLookupDestroy`**: Destroy lookups
- **`sysStoreLookupQuery`**: Query lookups


### sysSystemSettings


- **`sysSystemSettingsGet`**: Get SystemSettings settings
- **`sysSystemSettingsUpdate`**: Update SystemSettings settings


### sysTask


- **`taskIndexDocument`**: Task: Index document
- **`taskUnindexDocument`**: Task: Unindex document
- **`taskIndexTrace`**: Task: Index telemetry trace
- **`taskCalendarAlarmEmail`**: Task: Calendar alarm e-mail
- **`taskCalendarAlarmNotification`**: Task: Calendar alarm notification
- **`taskCalendarItipMessage`**: Task: Calendar iTIP message
- **`taskMergeThreads`**: Task: Merge email threads
- **`taskDmarcReport`**: Task: Send DMARC report to remote server
- **`taskTlsReport`**: Task: Send TLS report to remote server
- **`taskRestoreArchivedItem`**: Task: Restore archived item
- **`taskDestroyAccount`**: Task: Destroy account and all associated data
- **`taskAccountMaintenance`**: Task: Perform account maintenance operations
- **`taskTenantMaintenance`**: Task: Perform tenant maintenance operations
- **`taskStoreMaintenance`**: Task: Perform store maintenance operations
- **`taskSpamFilterMaintenance`**: Task: Perform spam filter maintenance operations
- **`taskAcmeRenewal`**: Task: Perform ACME certificate renewal for a domain
- **`taskDkimManagement`**: Task: Perform DKIM key rotation for a domain
- **`taskDnsManagement`**: Task: Perform DNS management for a domain
- **`sysTaskGet`**: Get tasks
- **`sysTaskCreate`**: Create tasks
- **`sysTaskUpdate`**: Update tasks
- **`sysTaskDestroy`**: Destroy tasks
- **`sysTaskQuery`**: Query tasks


### sysTaskManager


- **`sysTaskManagerGet`**: Get TaskManager settings
- **`sysTaskManagerUpdate`**: Update TaskManager settings


### sysTenant


- **`sysTenantGet`**: Get tenants
- **`sysTenantCreate`**: Create tenants
- **`sysTenantUpdate`**: Update tenants
- **`sysTenantDestroy`**: Destroy tenants
- **`sysTenantQuery`**: Query tenants


### sysTlsExternalReport


- **`sysTlsExternalReportGet`**: Get reports
- **`sysTlsExternalReportCreate`**: Create reports
- **`sysTlsExternalReportUpdate`**: Update reports
- **`sysTlsExternalReportDestroy`**: Destroy reports
- **`sysTlsExternalReportQuery`**: Query reports


### sysTlsInternalReport


- **`sysTlsInternalReportGet`**: Get reports
- **`sysTlsInternalReportCreate`**: Create reports
- **`sysTlsInternalReportUpdate`**: Update reports
- **`sysTlsInternalReportDestroy`**: Destroy reports
- **`sysTlsInternalReportQuery`**: Query reports


### sysTlsReportSettings


- **`sysTlsReportSettingsGet`**: Get TlsReportSettings settings
- **`sysTlsReportSettingsUpdate`**: Update TlsReportSettings settings


### sysTrace


- **`sysTraceGet`**: Get traces
- **`sysTraceCreate`**: Create traces
- **`sysTraceUpdate`**: Update traces
- **`sysTraceDestroy`**: Destroy traces
- **`sysTraceQuery`**: Query traces


### sysTracer


- **`sysTracerGet`**: Get tracers
- **`sysTracerCreate`**: Create tracers
- **`sysTracerUpdate`**: Update tracers
- **`sysTracerDestroy`**: Destroy tracers
- **`sysTracerQuery`**: Query tracers


### sysTracingStore


- **`sysTracingStoreGet`**: Get TracingStore settings
- **`sysTracingStoreUpdate`**: Update TracingStore settings


### sysWebDav


- **`sysWebDavGet`**: Get WebDav settings
- **`sysWebDavUpdate`**: Update WebDav settings


### sysWebHook


- **`sysWebHookGet`**: Get webhooks
- **`sysWebHookCreate`**: Create webhooks
- **`sysWebHookUpdate`**: Update webhooks
- **`sysWebHookDestroy`**: Destroy webhooks
- **`sysWebHookQuery`**: Query webhooks

