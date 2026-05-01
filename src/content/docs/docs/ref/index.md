---
title: Schema reference
description: Reference documentation for every management and configuration object exposed by the Stalwart JMAP API.
sidebar_position: 1
custom_edit_url: null
---

# Schema reference

Every management and configuration object Stalwart exposes over JMAP is documented here. Each page covers the object's fields, the JMAP methods it supports (with `curl` examples), the equivalent `stalwart-cli` commands, and where to find the object in the WebUI.

All objects below are available via the `urn:stalwart:jmap` capability. Their JMAP type names are prefixed with `x:` on the wire (for example `x:Domain`); this prefix is omitted in the CLI.

For telemetry data and permission identifiers referenced from this documentation, see the [Events](/docs/ref/events), [Metrics](/docs/ref/metrics), and [Permissions](/docs/ref/permissions) pages.

## Objects

| Object | Kind | Summary |
|---|---|---|
| [Account](/docs/ref/object/account) | Object | Defines a user or group account for authentication and email access. |
| [AccountPassword](/docs/ref/object/account-password) | Singleton | Password-based authentication credential. |
| [AccountSettings](/docs/ref/object/account-settings) | Singleton | Configures default account settings for locale and encryption. |
| [AcmeProvider](/docs/ref/object/acme-provider) | Object | Defines an ACME provider for automatic TLS certificate management. |
| [Action](/docs/ref/object/action) | Object | Defines server management actions such as reloads, troubleshooting and cache operations. |
| [AddressBook](/docs/ref/object/address-book) | Singleton | Configures address book and contact storage settings. |
| [AiModel](/docs/ref/object/ai-model) | Object <sup>\*</sup> | Defines an AI model endpoint for LLM-based features. |
| [Alert](/docs/ref/object/alert) | Object <sup>\*</sup> | Defines an alert rule triggered by metric conditions. |
| [AllowedIp](/docs/ref/object/allowed-ip) | Object | Defines an allowed IP address or network range. |
| [ApiKey](/docs/ref/object/api-key) | Object | API key credential for programmatic access. |
| [AppPassword](/docs/ref/object/app-password) | Object | App password credential for programmatic access. |
| [Application](/docs/ref/object/application) | Object | Defines a web application served by the server. |
| [ArchivedItem](/docs/ref/object/archived-item) | Object <sup>\*</sup> | Represents an archived item that can be restored. |
| [ArfExternalReport](/docs/ref/object/arf-external-report) | Object | Stores an ARF feedback report received from an external source. |
| [Asn](/docs/ref/object/asn) | Singleton | Configures ASN and geolocation data sources for IP address lookups. |
| [Authentication](/docs/ref/object/authentication) | Singleton | Configures authentication settings including password policies and default roles. |
| [BlobStore](/docs/ref/object/blob-store) | Singleton | Configures the blob storage backend for messages and files. |
| [BlockedIp](/docs/ref/object/blocked-ip) | Object | Defines a blocked IP address or network range. |
| [Bootstrap](/docs/ref/object/bootstrap) | Singleton | Initial setup shown the first time Stalwart starts. |
| [Cache](/docs/ref/object/cache) | Singleton | Configures in-memory cache sizes for data, DNS records, and authorization tokens. |
| [Calendar](/docs/ref/object/calendar) | Singleton | Configures calendar settings including iCalendar limits and default names. |
| [CalendarAlarm](/docs/ref/object/calendar-alarm) | Singleton | Configures calendar alarm email notifications. |
| [CalendarScheduling](/docs/ref/object/calendar-scheduling) | Singleton | Configures calendar scheduling, iTIP messaging, and HTTP RSVP settings. |
| [Certificate](/docs/ref/object/certificate) | Object | Defines a TLS certificate and its associated private key. |
| [ClusterNode](/docs/ref/object/cluster-node) | Object | Represents a node in the cluster |
| [ClusterRole](/docs/ref/object/cluster-role) | Object | Defines a cluster node role with enabled tasks and listeners. |
| [Coordinator](/docs/ref/object/coordinator) | Singleton | Configures the cluster coordinator for inter-node communication. |
| [DataRetention](/docs/ref/object/data-retention) | Singleton | Configures data retention policies, expunge schedules, and archival settings. |
| [DataStore](/docs/ref/object/data-store) | Singleton | Configures the primary data store backend. |
| [Directory](/docs/ref/object/directory) | Object | Defines an external directory for account authentication and lookups. |
| [DkimReportSettings](/docs/ref/object/dkim-report-settings) | Singleton | Configures DKIM authentication failure report generation. |
| [DkimSignature](/docs/ref/object/dkim-signature) | Object | Defines a DKIM signature used to sign outgoing email messages. |
| [DmarcExternalReport](/docs/ref/object/dmarc-external-report) | Object | Stores a DMARC aggregate report received from an external source. |
| [DmarcInternalReport](/docs/ref/object/dmarc-internal-report) | Object | Stores an outbound DMARC aggregate report pending delivery. |
| [DmarcReportSettings](/docs/ref/object/dmarc-report-settings) | Singleton | Configures DMARC aggregate and failure report generation. |
| [DnsResolver](/docs/ref/object/dns-resolver) | Singleton | Configures the DNS resolver used for domain lookups. |
| [DnsServer](/docs/ref/object/dns-server) | Object | Defines a DNS server for automatic record management. |
| [Domain](/docs/ref/object/domain) | Object | Defines an email domain and its DNS, DKIM, and TLS certificate settings. |
| [DsnReportSettings](/docs/ref/object/dsn-report-settings) | Singleton | Configures Delivery Status Notification (DSN) report generation. |
| [Email](/docs/ref/object/email) | Singleton | Configures email message limits, encryption, compression, and default folder settings. |
| [Enterprise](/docs/ref/object/enterprise) | Singleton | Configures enterprise licensing and branding settings. |
| [EventTracingLevel](/docs/ref/object/event-tracing-level) | Object | Defines a custom logging level override for a specific event type. |
| [FileStorage](/docs/ref/object/file-storage) | Singleton | Configures file storage limits. |
| [Http](/docs/ref/object/http) | Singleton | Configures HTTP server settings including rate limiting, CORS, and security headers. |
| [HttpForm](/docs/ref/object/http-form) | Singleton | Configures the contact form submission endpoint. |
| [HttpLookup](/docs/ref/object/http-lookup) | Object | Defines an HTTP-based lookup list. |
| [Imap](/docs/ref/object/imap) | Singleton | Configures IMAP protocol settings including authentication, timeouts, and rate limits. |
| [InMemoryStore](/docs/ref/object/in-memory-store) | Singleton | Configures the in-memory cache and lookup store. |
| [Jmap](/docs/ref/object/jmap) | Singleton | Configures JMAP protocol limits for requests, uploads, and push notifications. |
| [Log](/docs/ref/object/log) | Object | Represents a server log entry. |
| [MailingList](/docs/ref/object/mailing-list) | Object | Defines a mailing list that distributes messages to a group of recipients. |
| [MaskedEmail](/docs/ref/object/masked-email) | Object <sup>\*</sup> | Defines a masked email address for privacy protection. |
| [MemoryLookupKey](/docs/ref/object/memory-lookup-key) | Object | Defines an in-memory lookup key for fast data access. |
| [MemoryLookupKeyValue](/docs/ref/object/memory-lookup-key-value) | Object | Defines an in-memory lookup key-value pair. |
| [Metric](/docs/ref/object/metric) | Object | Stores a collected server metric data point. |
| [Metrics](/docs/ref/object/metrics) | Singleton | Configures metrics collection and export via OpenTelemetry and Prometheus. |
| [MetricsStore](/docs/ref/object/metrics-store) | Singleton <sup>\*</sup> | Configures the storage backend for metrics data. |
| [MtaConnectionStrategy](/docs/ref/object/mta-connection-strategy) | Object | Defines a connection strategy for outbound message delivery. |
| [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule) | Object | Defines retry and notification intervals for message delivery. |
| [MtaExtensions](/docs/ref/object/mta-extensions) | Singleton | Configures SMTP protocol extensions offered to clients. |
| [MtaHook](/docs/ref/object/mta-hook) | Object | Defines an MTA hook endpoint for message processing. |
| [MtaInboundSession](/docs/ref/object/mta-inbound-session) | Singleton | Configures inbound SMTP session timeouts and transfer limits. |
| [MtaInboundThrottle](/docs/ref/object/mta-inbound-throttle) | Object | Defines an inbound rate limit rule for SMTP connections. |
| [MtaMilter](/docs/ref/object/mta-milter) | Object | Defines a Milter filter endpoint for message processing. |
| [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy) | Singleton | Configures outbound message delivery routing, scheduling, and TLS strategies. |
| [MtaOutboundThrottle](/docs/ref/object/mta-outbound-throttle) | Object | Defines an outbound rate limit rule for message delivery. |
| [MtaQueueQuota](/docs/ref/object/mta-queue-quota) | Object | Defines a quota rule for message queues. |
| [MtaRoute](/docs/ref/object/mta-route) | Object | Defines a routing rule for outbound message delivery. |
| [MtaStageAuth](/docs/ref/object/mta-stage-auth) | Singleton | Configures SMTP authentication requirements and error handling. |
| [MtaStageConnect](/docs/ref/object/mta-stage-connect) | Singleton | Configures SMTP connection greeting and hostname settings. |
| [MtaStageData](/docs/ref/object/mta-stage-data) | Singleton | Configures message processing rules for the SMTP DATA stage. |
| [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo) | Singleton | Configures EHLO command requirements and validation. |
| [MtaStageMail](/docs/ref/object/mta-stage-mail) | Singleton | Configures MAIL FROM stage processing and sender validation. |
| [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) | Singleton | Configures RCPT TO stage processing and recipient validation. |
| [MtaSts](/docs/ref/object/mta-sts) | Singleton | Configures the MTA-STS policy for the server. |
| [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) | Object | Defines a TLS security strategy for outbound connections. |
| [MtaVirtualQueue](/docs/ref/object/mta-virtual-queue) | Object | Defines a virtual queue for organizing outbound message delivery. |
| [NetworkListener](/docs/ref/object/network-listener) | Object | Defines a network listener for accepting incoming connections. |
| [OAuthClient](/docs/ref/object/o-auth-client) | Object | Defines a registered OAuth client application. |
| [OidcProvider](/docs/ref/object/oidc-provider) | Singleton | Configures the OAuth and OpenID Connect provider settings. |
| [PublicKey](/docs/ref/object/public-key) | Object | Defines a public key for email encryption (OpenPGP or S/MIME). |
| [QueuedMessage](/docs/ref/object/queued-message) | Object | Represents a queued email message pending delivery. |
| [ReportSettings](/docs/ref/object/report-settings) | Singleton | Configures inbound report analysis and outbound report settings. |
| [Role](/docs/ref/object/role) | Object | Defines a named set of permissions that can be assigned to accounts, groups, or tenants. |
| [Search](/docs/ref/object/search) | Singleton | Configures full-text search indexing for emails, calendars, contacts, and tracing. |
| [SearchStore](/docs/ref/object/search-store) | Singleton | Configures the full-text search backend. |
| [Security](/docs/ref/object/security) | Singleton | Configures automatic IP banning rules for abuse, authentication failures, and port scanning. |
| [SenderAuth](/docs/ref/object/sender-auth) | Singleton | Configures sender authentication verification including DKIM, SPF, DMARC, and ARC. |
| [Sharing](/docs/ref/object/sharing) | Singleton | Configures sharing settings for calendars, address books, and files. |
| [SieveSystemInterpreter](/docs/ref/object/sieve-system-interpreter) | Singleton | Configures the system-level Sieve script interpreter settings and limits. |
| [SieveSystemScript](/docs/ref/object/sieve-system-script) | Object | Defines a system Sieve script executed by the server. |
| [SieveUserInterpreter](/docs/ref/object/sieve-user-interpreter) | Singleton | Configures the user-level Sieve script interpreter settings and limits. |
| [SieveUserScript](/docs/ref/object/sieve-user-script) | Object | Defines a global Sieve script available for user imports. |
| [SpamClassifier](/docs/ref/object/spam-classifier) | Singleton | Configures the spam classifier model, training parameters, and auto-learning settings. |
| [SpamDnsblServer](/docs/ref/object/spam-dnsbl-server) | Object | Defines a DNSBL server used for spam filtering lookups. |
| [SpamDnsblSettings](/docs/ref/object/spam-dnsbl-settings) | Singleton | Configures DNSBL query limits for spam filtering. |
| [SpamFileExtension](/docs/ref/object/spam-file-extension) | Object | Defines a file extension classification rule for spam filtering. |
| [SpamLlm](/docs/ref/object/spam-llm) | Singleton <sup>\*</sup> | Configures the LLM-based spam classifier. |
| [SpamPyzor](/docs/ref/object/spam-pyzor) | Singleton | Configures the Pyzor collaborative spam detection service. |
| [SpamRule](/docs/ref/object/spam-rule) | Object | Defines a spam filter rule for message classification. |
| [SpamSettings](/docs/ref/object/spam-settings) | Singleton | Configures global spam filter thresholds, greylisting, and trust settings. |
| [SpamTag](/docs/ref/object/spam-tag) | Object | Defines a score or action assigned to a spam classification tag. |
| [SpamTrainingSample](/docs/ref/object/spam-training-sample) | Object | Stores an email sample used for spam classifier training. |
| [SpfReportSettings](/docs/ref/object/spf-report-settings) | Singleton | Configures SPF authentication failure report generation. |
| [StoreLookup](/docs/ref/object/store-lookup) | Object | Defines an external store used for lookups. |
| [SystemSettings](/docs/ref/object/system-settings) | Singleton | Configures core server settings including hostname, thread pool, and network services. |
| [Task](/docs/ref/object/task) | Object | Represents a background task scheduled for execution. |
| [TaskManager](/docs/ref/object/task-manager) | Singleton | Configures task execution settings including retry strategies. |
| [Tenant](/docs/ref/object/tenant) | Object <sup>\*</sup> | Defines a tenant for multi-tenant environments with isolated resources and quotas. |
| [TlsExternalReport](/docs/ref/object/tls-external-report) | Object | Stores a TLS aggregate report received from an external source. |
| [TlsInternalReport](/docs/ref/object/tls-internal-report) | Object | Stores an outbound TLS aggregate report pending delivery. |
| [TlsReportSettings](/docs/ref/object/tls-report-settings) | Singleton | Configures TLS aggregate report generation. |
| [Trace](/docs/ref/object/trace) | Object <sup>\*</sup> | Stores a message delivery trace with associated events. |
| [Tracer](/docs/ref/object/tracer) | Object | Defines a logging and tracing output method. |
| [TracingStore](/docs/ref/object/tracing-store) | Singleton <sup>\*</sup> | Configures the storage backend for tracing data. |
| [WebDav](/docs/ref/object/web-dav) | Singleton | Configures WebDAV protocol settings including property limits and locking. |
| [WebHook](/docs/ref/object/web-hook) | Object | Defines a webhook endpoint for event notifications. |

<sup>\*</sup> [Enterprise-only](/docs/server/enterprise).