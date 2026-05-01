---
title: Schema reference
description: Reference documentation for every management and configuration object exposed by the Stalwart JMAP API.
sidebar_position: 1
custom_edit_url: null
---

# Schema reference

Every management and configuration object Stalwart exposes over JMAP is documented here. Each page covers the object's fields, the JMAP methods it supports (with `curl` examples), the equivalent `stalwart-cli` commands, and where to find the object in the WebUI.

All objects below are available via the `urn:stalwart:jmap` capability. Their JMAP type names are prefixed with `x:` on the wire (for example `x:Domain`); this prefix is omitted in the CLI.

For telemetry data and permission identifiers referenced from this documentation, see the [Events](./events.md), [Metrics](./metrics.md), and [Permissions](./permissions.md) pages.

## Objects

| Object | Kind | Summary |
|---|---|---|
| [Account](./object/account.md) | Object | Defines a user or group account for authentication and email access. |
| [AccountPassword](./object/account-password.md) | Singleton | Password-based authentication credential. |
| [AccountSettings](./object/account-settings.md) | Singleton | Configures default account settings for locale and encryption. |
| [AcmeProvider](./object/acme-provider.md) | Object | Defines an ACME provider for automatic TLS certificate management. |
| [Action](./object/action.md) | Object | Defines server management actions such as reloads, troubleshooting and cache operations. |
| [AddressBook](./object/address-book.md) | Singleton | Configures address book and contact storage settings. |
| [AiModel](./object/ai-model.md) | Object <sup>\*</sup> | Defines an AI model endpoint for LLM-based features. |
| [Alert](./object/alert.md) | Object <sup>\*</sup> | Defines an alert rule triggered by metric conditions. |
| [AllowedIp](./object/allowed-ip.md) | Object | Defines an allowed IP address or network range. |
| [ApiKey](./object/api-key.md) | Object | API key credential for programmatic access. |
| [AppPassword](./object/app-password.md) | Object | App password credential for programmatic access. |
| [Application](./object/application.md) | Object | Defines a web application served by the server. |
| [ArchivedItem](./object/archived-item.md) | Object <sup>\*</sup> | Represents an archived item that can be restored. |
| [ArfExternalReport](./object/arf-external-report.md) | Object | Stores an ARF feedback report received from an external source. |
| [Asn](./object/asn.md) | Singleton | Configures ASN and geolocation data sources for IP address lookups. |
| [Authentication](./object/authentication.md) | Singleton | Configures authentication settings including password policies and default roles. |
| [BlobStore](./object/blob-store.md) | Singleton | Configures the blob storage backend for messages and files. |
| [BlockedIp](./object/blocked-ip.md) | Object | Defines a blocked IP address or network range. |
| [Bootstrap](./object/bootstrap.md) | Singleton | Initial setup shown the first time Stalwart starts. |
| [Cache](./object/cache.md) | Singleton | Configures in-memory cache sizes for data, DNS records, and authorization tokens. |
| [Calendar](./object/calendar.md) | Singleton | Configures calendar settings including iCalendar limits and default names. |
| [CalendarAlarm](./object/calendar-alarm.md) | Singleton | Configures calendar alarm email notifications. |
| [CalendarScheduling](./object/calendar-scheduling.md) | Singleton | Configures calendar scheduling, iTIP messaging, and HTTP RSVP settings. |
| [Certificate](./object/certificate.md) | Object | Defines a TLS certificate and its associated private key. |
| [ClusterNode](./object/cluster-node.md) | Object | Represents a node in the cluster |
| [ClusterRole](./object/cluster-role.md) | Object | Defines a cluster node role with enabled tasks and listeners. |
| [Coordinator](./object/coordinator.md) | Singleton | Configures the cluster coordinator for inter-node communication. |
| [DataRetention](./object/data-retention.md) | Singleton | Configures data retention policies, expunge schedules, and archival settings. |
| [DataStore](./object/data-store.md) | Singleton | Configures the primary data store backend. |
| [Directory](./object/directory.md) | Object | Defines an external directory for account authentication and lookups. |
| [DkimReportSettings](./object/dkim-report-settings.md) | Singleton | Configures DKIM authentication failure report generation. |
| [DkimSignature](./object/dkim-signature.md) | Object | Defines a DKIM signature used to sign outgoing email messages. |
| [DmarcExternalReport](./object/dmarc-external-report.md) | Object | Stores a DMARC aggregate report received from an external source. |
| [DmarcInternalReport](./object/dmarc-internal-report.md) | Object | Stores an outbound DMARC aggregate report pending delivery. |
| [DmarcReportSettings](./object/dmarc-report-settings.md) | Singleton | Configures DMARC aggregate and failure report generation. |
| [DnsResolver](./object/dns-resolver.md) | Singleton | Configures the DNS resolver used for domain lookups. |
| [DnsServer](./object/dns-server.md) | Object | Defines a DNS server for automatic record management. |
| [Domain](./object/domain.md) | Object | Defines an email domain and its DNS, DKIM, and TLS certificate settings. |
| [DsnReportSettings](./object/dsn-report-settings.md) | Singleton | Configures Delivery Status Notification (DSN) report generation. |
| [Email](./object/email.md) | Singleton | Configures email message limits, encryption, compression, and default folder settings. |
| [Enterprise](./object/enterprise.md) | Singleton | Configures enterprise licensing and branding settings. |
| [EventTracingLevel](./object/event-tracing-level.md) | Object | Defines a custom logging level override for a specific event type. |
| [FileStorage](./object/file-storage.md) | Singleton | Configures file storage limits. |
| [Http](./object/http.md) | Singleton | Configures HTTP server settings including rate limiting, CORS, and security headers. |
| [HttpForm](./object/http-form.md) | Singleton | Configures the contact form submission endpoint. |
| [HttpLookup](./object/http-lookup.md) | Object | Defines an HTTP-based lookup list. |
| [Imap](./object/imap.md) | Singleton | Configures IMAP protocol settings including authentication, timeouts, and rate limits. |
| [InMemoryStore](./object/in-memory-store.md) | Singleton | Configures the in-memory cache and lookup store. |
| [Jmap](./object/jmap.md) | Singleton | Configures JMAP protocol limits for requests, uploads, and push notifications. |
| [Log](./object/log.md) | Object | Represents a server log entry. |
| [MailingList](./object/mailing-list.md) | Object | Defines a mailing list that distributes messages to a group of recipients. |
| [MaskedEmail](./object/masked-email.md) | Object <sup>\*</sup> | Defines a masked email address for privacy protection. |
| [MemoryLookupKey](./object/memory-lookup-key.md) | Object | Defines an in-memory lookup key for fast data access. |
| [MemoryLookupKeyValue](./object/memory-lookup-key-value.md) | Object | Defines an in-memory lookup key-value pair. |
| [Metric](./object/metric.md) | Object | Stores a collected server metric data point. |
| [Metrics](./object/metrics.md) | Singleton | Configures metrics collection and export via OpenTelemetry and Prometheus. |
| [MetricsStore](./object/metrics-store.md) | Singleton <sup>\*</sup> | Configures the storage backend for metrics data. |
| [MtaConnectionStrategy](./object/mta-connection-strategy.md) | Object | Defines a connection strategy for outbound message delivery. |
| [MtaDeliverySchedule](./object/mta-delivery-schedule.md) | Object | Defines retry and notification intervals for message delivery. |
| [MtaExtensions](./object/mta-extensions.md) | Singleton | Configures SMTP protocol extensions offered to clients. |
| [MtaHook](./object/mta-hook.md) | Object | Defines an MTA hook endpoint for message processing. |
| [MtaInboundSession](./object/mta-inbound-session.md) | Singleton | Configures inbound SMTP session timeouts and transfer limits. |
| [MtaInboundThrottle](./object/mta-inbound-throttle.md) | Object | Defines an inbound rate limit rule for SMTP connections. |
| [MtaMilter](./object/mta-milter.md) | Object | Defines a Milter filter endpoint for message processing. |
| [MtaOutboundStrategy](./object/mta-outbound-strategy.md) | Singleton | Configures outbound message delivery routing, scheduling, and TLS strategies. |
| [MtaOutboundThrottle](./object/mta-outbound-throttle.md) | Object | Defines an outbound rate limit rule for message delivery. |
| [MtaQueueQuota](./object/mta-queue-quota.md) | Object | Defines a quota rule for message queues. |
| [MtaRoute](./object/mta-route.md) | Object | Defines a routing rule for outbound message delivery. |
| [MtaStageAuth](./object/mta-stage-auth.md) | Singleton | Configures SMTP authentication requirements and error handling. |
| [MtaStageConnect](./object/mta-stage-connect.md) | Singleton | Configures SMTP connection greeting and hostname settings. |
| [MtaStageData](./object/mta-stage-data.md) | Singleton | Configures message processing rules for the SMTP DATA stage. |
| [MtaStageEhlo](./object/mta-stage-ehlo.md) | Singleton | Configures EHLO command requirements and validation. |
| [MtaStageMail](./object/mta-stage-mail.md) | Singleton | Configures MAIL FROM stage processing and sender validation. |
| [MtaStageRcpt](./object/mta-stage-rcpt.md) | Singleton | Configures RCPT TO stage processing and recipient validation. |
| [MtaSts](./object/mta-sts.md) | Singleton | Configures the MTA-STS policy for the server. |
| [MtaTlsStrategy](./object/mta-tls-strategy.md) | Object | Defines a TLS security strategy for outbound connections. |
| [MtaVirtualQueue](./object/mta-virtual-queue.md) | Object | Defines a virtual queue for organizing outbound message delivery. |
| [NetworkListener](./object/network-listener.md) | Object | Defines a network listener for accepting incoming connections. |
| [OAuthClient](./object/o-auth-client.md) | Object | Defines a registered OAuth client application. |
| [OidcProvider](./object/oidc-provider.md) | Singleton | Configures the OAuth and OpenID Connect provider settings. |
| [PublicKey](./object/public-key.md) | Object | Defines a public key for email encryption (OpenPGP or S/MIME). |
| [QueuedMessage](./object/queued-message.md) | Object | Represents a queued email message pending delivery. |
| [ReportSettings](./object/report-settings.md) | Singleton | Configures inbound report analysis and outbound report settings. |
| [Role](./object/role.md) | Object | Defines a named set of permissions that can be assigned to accounts, groups, or tenants. |
| [Search](./object/search.md) | Singleton | Configures full-text search indexing for emails, calendars, contacts, and tracing. |
| [SearchStore](./object/search-store.md) | Singleton | Configures the full-text search backend. |
| [Security](./object/security.md) | Singleton | Configures automatic IP banning rules for abuse, authentication failures, and port scanning. |
| [SenderAuth](./object/sender-auth.md) | Singleton | Configures sender authentication verification including DKIM, SPF, DMARC, and ARC. |
| [Sharing](./object/sharing.md) | Singleton | Configures sharing settings for calendars, address books, and files. |
| [SieveSystemInterpreter](./object/sieve-system-interpreter.md) | Singleton | Configures the system-level Sieve script interpreter settings and limits. |
| [SieveSystemScript](./object/sieve-system-script.md) | Object | Defines a system Sieve script executed by the server. |
| [SieveUserInterpreter](./object/sieve-user-interpreter.md) | Singleton | Configures the user-level Sieve script interpreter settings and limits. |
| [SieveUserScript](./object/sieve-user-script.md) | Object | Defines a global Sieve script available for user imports. |
| [SpamClassifier](./object/spam-classifier.md) | Singleton | Configures the spam classifier model, training parameters, and auto-learning settings. |
| [SpamDnsblServer](./object/spam-dnsbl-server.md) | Object | Defines a DNSBL server used for spam filtering lookups. |
| [SpamDnsblSettings](./object/spam-dnsbl-settings.md) | Singleton | Configures DNSBL query limits for spam filtering. |
| [SpamFileExtension](./object/spam-file-extension.md) | Object | Defines a file extension classification rule for spam filtering. |
| [SpamLlm](./object/spam-llm.md) | Singleton <sup>\*</sup> | Configures the LLM-based spam classifier. |
| [SpamPyzor](./object/spam-pyzor.md) | Singleton | Configures the Pyzor collaborative spam detection service. |
| [SpamRule](./object/spam-rule.md) | Object | Defines a spam filter rule for message classification. |
| [SpamSettings](./object/spam-settings.md) | Singleton | Configures global spam filter thresholds, greylisting, and trust settings. |
| [SpamTag](./object/spam-tag.md) | Object | Defines a score or action assigned to a spam classification tag. |
| [SpamTrainingSample](./object/spam-training-sample.md) | Object | Stores an email sample used for spam classifier training. |
| [SpfReportSettings](./object/spf-report-settings.md) | Singleton | Configures SPF authentication failure report generation. |
| [StoreLookup](./object/store-lookup.md) | Object | Defines an external store used for lookups. |
| [SystemSettings](./object/system-settings.md) | Singleton | Configures core server settings including hostname, thread pool, and network services. |
| [Task](./object/task.md) | Object | Represents a background task scheduled for execution. |
| [TaskManager](./object/task-manager.md) | Singleton | Configures task execution settings including retry strategies. |
| [Tenant](./object/tenant.md) | Object <sup>\*</sup> | Defines a tenant for multi-tenant environments with isolated resources and quotas. |
| [TlsExternalReport](./object/tls-external-report.md) | Object | Stores a TLS aggregate report received from an external source. |
| [TlsInternalReport](./object/tls-internal-report.md) | Object | Stores an outbound TLS aggregate report pending delivery. |
| [TlsReportSettings](./object/tls-report-settings.md) | Singleton | Configures TLS aggregate report generation. |
| [Trace](./object/trace.md) | Object <sup>\*</sup> | Stores a message delivery trace with associated events. |
| [Tracer](./object/tracer.md) | Object | Defines a logging and tracing output method. |
| [TracingStore](./object/tracing-store.md) | Singleton <sup>\*</sup> | Configures the storage backend for tracing data. |
| [WebDav](./object/web-dav.md) | Singleton | Configures WebDAV protocol settings including property limits and locking. |
| [WebHook](./object/web-hook.md) | Object | Defines a webhook endpoint for event notifications. |

<sup>\*</sup> [Enterprise-only](/docs/server/enterprise).