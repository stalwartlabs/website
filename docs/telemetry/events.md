---
sidebar_position: 2
---

# Events

Events are specific occurrences or actions within the system that are recorded for monitoring, auditing, and troubleshooting purposes. These events can range from user authentication attempts to message delivery notifications. Stalwart emits hundreds of different events, such as "auth successful," "message delivered," and many others, each capturing a particular aspect of the server's operation.

Each event is assigned a default logging level, which indicates the importance or severity of the event. The logging levels help to categorize events, making it easier to filter and manage them based on their significance. Tracers and loggers in Stalwart use these logging levels to decide which events to record. By configuring the logging levels, administrators can control the granularity of the data collected—choosing to log only critical events, all events, or anything in between.

Stalwart supports multiple [loggers and tracers](/docs/telemetry/tracing/overview), each with its own configured logging level. This flexibility allows for different aspects of the system to be monitored with varying levels of detail. For instance, a logger configured to capture detailed debugging information might run alongside another that logs only errors and critical issues.

It is important to note that [Webhooks](/docs/telemetry/webhooks) operate differently from loggers and tracers. They do not rely on logging levels. Instead, they are configured to send a predefined list of events to external systems or services. This means that Webhooks can be used to deliver specific notifications in real-time, regardless of the event's logging level, providing a flexible mechanism for integrating Stalwart with other applications and services.

## Event Levels

Logging levels  define the severity or importance of events that are captured and recorded. They help in filtering the events, allowing administrators and developers to focus on the most relevant information. Here's a brief explanation of each logging level:

- `info`: This level captures general information about the system's operations. It is typically used for logging normal, successful operations and significant milestones in the application's flow.
- `warn`: This level captures events that are not errors but may indicate potential issues or unusual situations that should be monitored. Warnings are useful for highlighting situations that could potentially lead to problems.
- `error`: This level captures events that indicate a failure or an issue that has occurred. Errors are critical problems that typically require immediate attention, as they may affect the system's functionality or stability.
- `debug`: This level captures detailed diagnostic information useful for developers when troubleshooting or diagnosing issues. Debug logs provide more granular details than Info logs, often including internal state information.
- `trace`: This is the most detailed level of logging, capturing fine-grained information about the system's operations. Trace logs are useful for in-depth debugging, as they record almost everything happening within the system.
- `disable`: This level effectively disables logging. No events are captured or recorded when this level is set. It's useful when logging is not needed or to reduce overhead in production environments where minimal logging is required.

By using these logging levels, administrators can tailor the verbosity of logs according to their needs, balancing the amount of collected data with the relevance and importance of the information. This flexibility helps in managing storage, performance, and the ease of troubleshooting and monitoring the system.

### Overriding

The default severity or logging level of each event can be overridden to customize which events are captured based on specific needs. This is done by setting the `tracing.level.<event_id>` key in the configuration file to the desired logging level.

For example, if the default level for a particular event, such as `auth.success` is set to `info` but you want to capture it at the `debug` level for more detailed information, you can adjust the configuration accordingly. For example:

```toml
[tracing.level]
auth.success = "debug"
```

This allows for fine-tuning of the logging output, ensuring that only relevant events are recorded at the appropriate level of detail.

By overriding the default levels, you can increase the verbosity for specific events that require closer monitoring or reduce it for less critical events to save on storage and processing resources. This flexibility is particularly useful in environments where different components or services may require different levels of attention and detail in their logging.

## Event Types

The following are the event types that Stalwart Mail Server captures along with their default logging levels:

| Event | Description | Level |
| --- | --- | --- |
|`acme.auth-completed`|ACME authentication completed|`INFO`|
|`acme.auth-error`|ACME authentication error|`WARN`|
|`acme.auth-pending`|ACME authentication pending|`INFO`|
|`acme.auth-start`|ACME authentication started|`INFO`|
|`acme.auth-too-many-attempts`|Too many ACME authentication attempts|`WARN`|
|`acme.auth-valid`|ACME authentication valid|`INFO`|
|`acme.client-missing-sni`|ACME client missing SNI|`DEBUG`|
|`acme.client-supplied-sni`|ACME client supplied SNI|`DEBUG`|
|`acme.dns-record-created`|ACME DNS record created|`INFO`|
|`acme.dns-record-creation-failed`|ACME DNS record creation failed|`WARN`|
|`acme.dns-record-deletion-failed`|ACME DNS record deletion failed|`DEBUG`|
|`acme.dns-record-lookup-failed`|ACME DNS record lookup failed|`DEBUG`|
|`acme.dns-record-not-propagated`|ACME DNS record not propagated|`DEBUG`|
|`acme.dns-record-propagated`|ACME DNS record propagated|`INFO`|
|`acme.dns-record-propagation-timeout`|ACME DNS record propagation timeout|`WARN`|
|`acme.error`|ACME error|`ERROR`|
|`acme.order-completed`|ACME order completed|`INFO`|
|`acme.order-invalid`|ACME order invalid|`WARN`|
|`acme.order-processing`|ACME order processing|`INFO`|
|`acme.order-ready`|ACME order ready|`INFO`|
|`acme.order-start`|ACME order started|`INFO`|
|`acme.order-valid`|ACME order valid|`INFO`|
|`acme.process-cert`|Processing ACME certificate|`INFO`|
|`acme.renew-backoff`|ACME renew backoff|`DEBUG`|
|`acme.tls-alpn-error`|ACME TLS ALPN error|`WARN`|
|`acme.tls-alpn-received`|ACME TLS ALPN received|`INFO`|
|`acme.token-not-found`|ACME token not found|`WARN`|
|`arc.broken-chain`|Broken ARC chain|`DEBUG`|
|`arc.chain-too-long`|ARC chain too long|`DEBUG`|
|`arc.has-header-tag`|ARC has header tag|`DEBUG`|
|`arc.invalid-cv`|Invalid ARC CV|`DEBUG`|
|`arc.invalid-instance`|Invalid ARC instance|`DEBUG`|
|`arc.sealer-not-found`|ARC sealer not found|`WARN`|
|`auth.banned`|IP address banned after multiple authentication failures|`WARN`|
|`auth.error`|Authentication error|`ERROR`|
|`auth.failed`|Authentication failed|`DEBUG`|
|`auth.missing-totp`|Missing TOTP for authentication|`TRACE`|
|`auth.success`|Authentication successful|`INFO`|
|`auth.too-many-attempts`|Too many authentication attempts|`WARN`|
|`cluster.decryption-error`|Failed to decrypt a gossip packet|`WARN`|
|`cluster.empty-packet`|Received an empty gossip packet|`WARN`|
|`cluster.error`|A cluster error occurred|`WARN`|
|`cluster.invalid-packet`|Received an invalid gossip packet|`WARN`|
|`cluster.one-or-more-peers-offline`|One or more peers are offline|`DEBUG`|
|`cluster.peer-alive`|A peer is alive|`INFO`|
|`cluster.peer-back-online`|A peer came back online|`INFO`|
|`cluster.peer-discovered`|A new peer was discovered|`INFO`|
|`cluster.peer-has-config-changes`|A peer has configuration changes|`DEBUG`|
|`cluster.peer-has-list-changes`|A peer has list changes|`DEBUG`|
|`cluster.peer-leaving`|A peer is leaving the cluster|`INFO`|
|`cluster.peer-offline`|A peer went offline|`INFO`|
|`cluster.peer-suspected`|A peer is suspected to be offline|`INFO`|
|`cluster.peer-suspected-is-alive`|A suspected peer is actually alive|`INFO`|
|`config.already-up-to-date`|Configuration already up to date|`DEBUG`|
|`config.build-error`|Configuration build error|`ERROR`|
|`config.build-warning`|Configuration build warning|`DEBUG`|
|`config.default-applied`|Default configuration applied|`DEBUG`|
|`config.external-key-ignored`|External configuration key ignored|`DEBUG`|
|`config.fetch-error`|Configuration fetch error|`ERROR`|
|`config.import-external`|Importing external configuration|`INFO`|
|`config.macro-error`|Configuration macro error|`ERROR`|
|`config.missing-setting`|Missing configuration setting|`DEBUG`|
|`config.parse-error`|Configuration parse error|`ERROR`|
|`config.parse-warning`|Configuration parse warning|`DEBUG`|
|`config.unused-setting`|Unused configuration setting|`DEBUG`|
|`config.write-error`|Configuration write error|`ERROR`|
|`dane.authentication-failure`|DANE authentication failed|`INFO`|
|`dane.authentication-success`|DANE authentication successful|`INFO`|
|`dane.certificate-parse-error`|Error parsing certificate for DANE|`INFO`|
|`dane.no-certificates-found`|No certificates found for DANE|`INFO`|
|`dane.tlsa-record-fetch`|Fetching TLSA record|`INFO`|
|`dane.tlsa-record-fetch-error`|Error fetching TLSA record|`INFO`|
|`dane.tlsa-record-invalid`|Invalid TLSA record|`INFO`|
|`dane.tlsa-record-match`|TLSA record match found|`INFO`|
|`dane.tlsa-record-not-dnssec-signed`|TLSA record not DNSSEC signed|`INFO`|
|`dane.tlsa-record-not-found`|TLSA record not found|`INFO`|
|`delivery.attempt-end`|Delivery attempt ended|`INFO`|
|`delivery.attempt-start`|Delivery attempt started|`INFO`|
|`delivery.auth`|SMTP authentication|`DEBUG`|
|`delivery.auth-failed`|SMTP authentication failed|`INFO`|
|`delivery.completed`|Delivery completed|`INFO`|
|`delivery.concurrency-limit-exceeded`|Concurrency limit exceeded|`WARN`|
|`delivery.connect`|Connecting to remote server|`INFO`|
|`delivery.connect-error`|Connection error|`INFO`|
|`delivery.delivered`|Message delivered|`INFO`|
|`delivery.domain-delivery-start`|New delivery attempt for domain|`INFO`|
|`delivery.double-bounce`|Discarding message after double bounce|`INFO`|
|`delivery.dsn-perm-fail`|DSN permanent failure notification|`INFO`|
|`delivery.dsn-success`|DSN success notification|`INFO`|
|`delivery.dsn-temp-fail`|DSN temporary failure notification|`INFO`|
|`delivery.ehlo`|SMTP EHLO command|`DEBUG`|
|`delivery.ehlo-rejected`|SMTP EHLO rejected|`INFO`|
|`delivery.failed`|Delivery failed|`INFO`|
|`delivery.greeting-failed`|SMTP greeting failed|`INFO`|
|`delivery.implicit-tls-error`|Implicit TLS error|`INFO`|
|`delivery.ip-lookup`|IP address lookup|`DEBUG`|
|`delivery.ip-lookup-failed`|IP address lookup failed|`INFO`|
|`delivery.mail-from`|SMTP MAIL FROM command|`DEBUG`|
|`delivery.mail-from-rejected`|SMTP MAIL FROM rejected|`INFO`|
|`delivery.message-rejected`|Message rejected by remote server|`INFO`|
|`delivery.missing-outbound-hostname`|Missing outbound hostname in configuration|`WARN`|
|`delivery.mx-lookup`|MX record lookup|`DEBUG`|
|`delivery.mx-lookup-failed`|MX record lookup failed|`INFO`|
|`delivery.null-mx`|Null MX record found|`INFO`|
|`delivery.rate-limit-exceeded`|Rate limit exceeded|`WARN`|
|`delivery.raw-input`|Raw SMTP input received|`TRACE`|
|`delivery.raw-output`|Raw SMTP output sent|`TRACE`|
|`delivery.rcpt-to`|SMTP RCPT TO command|`DEBUG`|
|`delivery.rcpt-to-failed`|SMTP RCPT TO failed|`INFO`|
|`delivery.rcpt-to-rejected`|SMTP RCPT TO rejected|`INFO`|
|`delivery.start-tls`|SMTP STARTTLS command|`INFO`|
|`delivery.start-tls-disabled`|STARTTLS disabled|`INFO`|
|`delivery.start-tls-error`|STARTTLS error|`INFO`|
|`delivery.start-tls-unavailable`|STARTTLS unavailable|`INFO`|
|`dkim.fail`|DKIM verification failed|`DEBUG`|
|`dkim.failed-auid-match`|DKIM AUID mismatch|`DEBUG`|
|`dkim.failed-body-hash-match`|DKIM body hash mismatch|`DEBUG`|
|`dkim.failed-verification`|DKIM verification failed|`DEBUG`|
|`dkim.incompatible-algorithms`|Incompatible DKIM algorithms|`DEBUG`|
|`dkim.neutral`|DKIM verification neutral|`DEBUG`|
|`dkim.none`|No DKIM signature|`DEBUG`|
|`dkim.pass`|DKIM verification passed|`DEBUG`|
|`dkim.perm-error`|DKIM permanent error|`DEBUG`|
|`dkim.revoked-public-key`|DKIM public key revoked|`DEBUG`|
|`dkim.signature-expired`|DKIM signature expired|`DEBUG`|
|`dkim.signature-length`|DKIM signature length issue|`DEBUG`|
|`dkim.signer-not-found`|DKIM signer not found|`WARN`|
|`dkim.temp-error`|DKIM temporary error|`DEBUG`|
|`dkim.unsupported-algorithm`|Unsupported DKIM algorithm|`DEBUG`|
|`dkim.unsupported-canonicalization`|Unsupported DKIM canonicalization|`DEBUG`|
|`dkim.unsupported-key-type`|Unsupported DKIM key type|`DEBUG`|
|`dkim.unsupported-version`|Unsupported DKIM version|`DEBUG`|
|`dmarc.fail`|DMARC check failed|`DEBUG`|
|`dmarc.none`|No DMARC record|`DEBUG`|
|`dmarc.pass`|DMARC check passed|`DEBUG`|
|`dmarc.perm-error`|DMARC permanent error|`DEBUG`|
|`dmarc.temp-error`|DMARC temporary error|`DEBUG`|
|`eval.directory-not-found`|Directory not found while evaluating expression|`WARN`|
|`eval.error`|Expression evaluation error|`DEBUG`|
|`eval.result`|Expression evaluation result|`TRACE`|
|`eval.store-not-found`|Store not found while evaluating expression|`WARN`|
|`fts-index.blob-not-found`|Blob not found for full-text indexing|`DEBUG`|
|`fts-index.index`|Full-text search index done|`INFO`|
|`fts-index.lock-busy`|Full-text search index lock is busy|`WARN`|
|`fts-index.locked`|Full-text search index is locked|`DEBUG`|
|`fts-index.metadata-not-found`|Metadata not found for full-text indexing|`DEBUG`|
|`housekeeper.purge-accounts`|Purging accounts|`INFO`|
|`housekeeper.purge-sessions`|Purging sessions|`INFO`|
|`housekeeper.purge-store`|Purging store|`INFO`|
|`housekeeper.schedule`|Housekeeper task scheduled|`DEBUG`|
|`housekeeper.start`|Housekeeper process started|`INFO`|
|`housekeeper.stop`|Housekeeper process stopped|`INFO`|
|`http.error`|An HTTP error occurred|`DEBUG`|
|`http.request-body`|HTTP request body|`TRACE`|
|`http.request-url`|HTTP request URL|`DEBUG`|
|`http.response-body`|HTTP response body|`TRACE`|
|`http.x-forwarded-missing`|X-Forwarded-For header is missing|`WARN`|
|`imap.append`|IMAP APPEND command|`DEBUG`|
|`imap.capabilities`|IMAP CAPABILITIES command|`DEBUG`|
|`imap.close`|IMAP CLOSE command|`DEBUG`|
|`imap.copy`|IMAP COPY command|`DEBUG`|
|`imap.create-mailbox`|IMAP CREATE mailbox command|`DEBUG`|
|`imap.delete-mailbox`|IMAP DELETE mailbox command|`DEBUG`|
|`imap.enable`|IMAP ENABLE command|`DEBUG`|
|`imap.error`|IMAP error occurred|`DEBUG`|
|`imap.expunge`|IMAP EXPUNGE command|`DEBUG`|
|`imap.fetch`|IMAP FETCH command|`DEBUG`|
|`imap.get-acl`|IMAP GET ACL command|`DEBUG`|
|`imap.id`|IMAP ID command|`DEBUG`|
|`imap.idle-start`|IMAP IDLE start|`DEBUG`|
|`imap.idle-stop`|IMAP IDLE stop|`DEBUG`|
|`imap.list`|IMAP LIST command|`DEBUG`|
|`imap.list-rights`|IMAP LISTRIGHTS command|`DEBUG`|
|`imap.logout`|IMAP LOGOUT command|`DEBUG`|
|`imap.lsub`|IMAP LSUB command|`DEBUG`|
|`imap.move`|IMAP MOVE command|`DEBUG`|
|`imap.my-rights`|IMAP MYRIGHTS command|`DEBUG`|
|`imap.namespace`|IMAP NAMESPACE command|`DEBUG`|
|`imap.noop`|IMAP NOOP command|`DEBUG`|
|`imap.raw-input`|Raw IMAP input received|`TRACE`|
|`imap.raw-output`|Raw IMAP output sent|`TRACE`|
|`imap.rename-mailbox`|IMAP RENAME mailbox command|`DEBUG`|
|`imap.search`|IMAP SEARCH command|`DEBUG`|
|`imap.select`|IMAP SELECT command|`DEBUG`|
|`imap.set-acl`|IMAP SET ACL command|`DEBUG`|
|`imap.sort`|IMAP SORT command|`DEBUG`|
|`imap.status`|IMAP STATUS command|`DEBUG`|
|`imap.store`|IMAP STORE command|`DEBUG`|
|`imap.subscribe`|IMAP SUBSCRIBE command|`DEBUG`|
|`imap.thread`|IMAP THREAD command|`DEBUG`|
|`imap.unsubscribe`|IMAP UNSUBSCRIBE command|`DEBUG`|
|`incoming-report.abuse-report`|Abuse report received|`INFO`|
|`incoming-report.arf-parse-failed`|Failed to parse ARF report|`INFO`|
|`incoming-report.auth-failure-report`|Authentication failure report received|`INFO`|
|`incoming-report.decompress-error`|Error decompressing report|`INFO`|
|`incoming-report.dmarc-parse-failed`|Failed to parse DMARC report|`INFO`|
|`incoming-report.dmarc-report`|DMARC report received|`INFO`|
|`incoming-report.dmarc-report-with-warnings`|DMARC report received with warnings|`WARN`|
|`incoming-report.fraud-report`|Fraud report received|`INFO`|
|`incoming-report.message-parse-failed`|Failed to parse incoming report message|`INFO`|
|`incoming-report.not-spam-report`|Not spam report received|`INFO`|
|`incoming-report.other-report`|Other type of report received|`INFO`|
|`incoming-report.tls-report`|TLS report received|`INFO`|
|`incoming-report.tls-report-with-warnings`|TLS report received with warnings|`WARN`|
|`incoming-report.tls-rpc-parse-failed`|Failed to parse TLS RPC report|`INFO`|
|`incoming-report.virus-report`|Virus report received|`INFO`|
|`iprev.fail`|IPREV check failed|`DEBUG`|
|`iprev.none`|No IPREV record|`DEBUG`|
|`iprev.pass`|IPREV check passed|`DEBUG`|
|`iprev.perm-error`|IPREV permanent error|`DEBUG`|
|`iprev.temp-error`|IPREV temporary error|`DEBUG`|
|`jmap.account-not-found`|JMAP account not found|`DEBUG`|
|`jmap.account-not-supported-by-method`|JMAP account not supported by method|`DEBUG`|
|`jmap.account-read-only`|JMAP account is read-only|`DEBUG`|
|`jmap.anchor-not-found`|JMAP anchor not found|`DEBUG`|
|`jmap.cannot-calculate-changes`|Cannot calculate JMAP changes|`DEBUG`|
|`jmap.forbidden`|JMAP operation forbidden|`DEBUG`|
|`jmap.invalid-arguments`|Invalid JMAP arguments|`DEBUG`|
|`jmap.invalid-result-reference`|Invalid JMAP result reference|`DEBUG`|
|`jmap.method-call`|JMAP method call|`DEBUG`|
|`jmap.not-found`|JMAP resource not found|`DEBUG`|
|`jmap.not-json`|JMAP request is not JSON|`DEBUG`|
|`jmap.not-request`|JMAP input is not a request|`DEBUG`|
|`jmap.request-too-large`|JMAP request too large|`DEBUG`|
|`jmap.state-mismatch`|JMAP state mismatch|`DEBUG`|
|`jmap.unknown-capability`|Unknown JMAP capability|`DEBUG`|
|`jmap.unknown-data-type`|Unknown JMAP data type|`DEBUG`|
|`jmap.unknown-method`|Unknown JMAP method|`DEBUG`|
|`jmap.unsupported-filter`|Unsupported JMAP filter|`DEBUG`|
|`jmap.unsupported-sort`|Unsupported JMAP sort|`DEBUG`|
|`jmap.websocket-error`|JMAP WebSocket error|`DEBUG`|
|`jmap.websocket-start`|JMAP WebSocket connection started|`DEBUG`|
|`jmap.websocket-stop`|JMAP WebSocket connection stopped|`DEBUG`|
|`limit.blob-quota`|Blob quota limit reached|`DEBUG`|
|`limit.calls-in`|Incoming calls limit reached|`DEBUG`|
|`limit.concurrent-connection`|Concurrent connection limit reached|`WARN`|
|`limit.concurrent-request`|Concurrent request limit reached|`DEBUG`|
|`limit.concurrent-upload`|Concurrent upload limit reached|`DEBUG`|
|`limit.quota`|Quota limit reached|`DEBUG`|
|`limit.size-request`|Request size limit reached|`DEBUG`|
|`limit.size-upload`|Upload size limit reached|`DEBUG`|
|`limit.too-many-requests`|Too many requests|`WARN`|
|`mail-auth.base64`|Base64 error during mail authentication|`DEBUG`|
|`mail-auth.crypto`|Crypto error during mail authentication|`DEBUG`|
|`mail-auth.dns-error`|DNS error|`DEBUG`|
|`mail-auth.dns-invalid-record-type`|Invalid DNS record type|`DEBUG`|
|`mail-auth.dns-record-not-found`|DNS record not found|`DEBUG`|
|`mail-auth.io`|I/O error during mail authentication|`DEBUG`|
|`mail-auth.missing-parameters`|Missing mail authentication parameters|`DEBUG`|
|`mail-auth.no-headers-found`|No headers found in message|`DEBUG`|
|`mail-auth.parse-error`|Mail authentication parse error|`DEBUG`|
|`mail-auth.policy-not-aligned`|Policy not aligned|`DEBUG`|
|`manage-sieve.capabilities`|ManageSieve CAPABILITIES command|`DEBUG`|
|`manage-sieve.check-script`|ManageSieve CHECK script command|`DEBUG`|
|`manage-sieve.create-script`|ManageSieve CREATE script command|`DEBUG`|
|`manage-sieve.delete-script`|ManageSieve DELETE script command|`DEBUG`|
|`manage-sieve.error`|ManageSieve error occurred|`DEBUG`|
|`manage-sieve.get-script`|ManageSieve GET script command|`DEBUG`|
|`manage-sieve.have-space`|ManageSieve HAVESPACE command|`DEBUG`|
|`manage-sieve.list-scripts`|ManageSieve LIST scripts command|`DEBUG`|
|`manage-sieve.logout`|ManageSieve LOGOUT command|`DEBUG`|
|`manage-sieve.noop`|ManageSieve NOOP command|`DEBUG`|
|`manage-sieve.raw-input`|Raw ManageSieve input received|`TRACE`|
|`manage-sieve.raw-output`|Raw ManageSieve output sent|`TRACE`|
|`manage-sieve.rename-script`|ManageSieve RENAME script command|`DEBUG`|
|`manage-sieve.set-active`|ManageSieve SET ACTIVE command|`DEBUG`|
|`manage-sieve.start-tls`|ManageSieve STARTTLS command|`DEBUG`|
|`manage-sieve.unauthenticate`|ManageSieve UNAUTHENTICATE command|`DEBUG`|
|`manage-sieve.update-script`|ManageSieve UPDATE script command|`DEBUG`|
|`manage.already-exists`|Managed resource already exists|`DEBUG`|
|`manage.assert-failed`|Management assertion failed|`DEBUG`|
|`manage.error`|Management error|`DEBUG`|
|`manage.missing-parameter`|Missing management parameter|`DEBUG`|
|`manage.not-found`|Managed resource not found|`DEBUG`|
|`manage.not-supported`|Management operation not supported|`DEBUG`|
|`message-ingest.duplicate`|Skipping duplicate message|`INFO`|
|`message-ingest.error`|Message ingestion error|`ERROR`|
|`message-ingest.ham`|Message ingested|`INFO`|
|`message-ingest.imap-append`|Message appended via IMAP|`INFO`|
|`message-ingest.jmap-append`|Message appended via JMAP|`INFO`|
|`message-ingest.spam`|Possible spam message ingested|`INFO`|
|`milter.action-accept`|Milter action: Accept|`INFO`|
|`milter.action-connection-failure`|Milter action: Connection failure|`INFO`|
|`milter.action-discard`|Milter action: Discard|`INFO`|
|`milter.action-reject`|Milter action: Reject|`INFO`|
|`milter.action-reply-code`|Milter action: Reply code|`INFO`|
|`milter.action-shutdown`|Milter action: Shutdown|`INFO`|
|`milter.action-temp-fail`|Milter action: Temporary failure|`INFO`|
|`milter.disconnected`|Milter disconnected|`WARN`|
|`milter.frame-invalid`|Invalid Milter frame|`WARN`|
|`milter.frame-too-large`|Milter frame too large|`WARN`|
|`milter.io-error`|Milter I/O error|`WARN`|
|`milter.parse-error`|Milter parse error|`WARN`|
|`milter.read`|Reading from Milter|`TRACE`|
|`milter.timeout`|Milter timeout|`WARN`|
|`milter.tls-invalid-name`|Invalid TLS name for Milter|`WARN`|
|`milter.unexpected-response`|Unexpected Milter response|`WARN`|
|`milter.write`|Writing to Milter|`TRACE`|
|`mta-hook.action-accept`|MTA hook action: Accept|`INFO`|
|`mta-hook.action-discard`|MTA hook action: Discard|`INFO`|
|`mta-hook.action-quarantine`|MTA hook action: Quarantine|`INFO`|
|`mta-hook.action-reject`|MTA hook action: Reject|`INFO`|
|`mta-hook.error`|MTA hook error|`WARN`|
|`mta-sts.authorized`|Host authorized by MTA-STS policy|`INFO`|
|`mta-sts.invalid-policy`|Invalid MTA-STS policy|`INFO`|
|`mta-sts.not-authorized`|Host not authorized by MTA-STS policy|`INFO`|
|`mta-sts.policy-fetch`|Fetched MTA-STS policy|`INFO`|
|`mta-sts.policy-fetch-error`|Error fetching MTA-STS policy|`INFO`|
|`mta-sts.policy-not-found`|MTA-STS policy not found|`INFO`|
|`network.accept-error`|Network accept error|`DEBUG`|
|`network.bind-error`|Network bind error|`ERROR`|
|`network.closed`|Network connection closed|`TRACE`|
|`network.connection-end`|Network connection ended|`INFO`|
|`network.connection-start`|Network connection started|`INFO`|
|`network.drop-blocked`|Dropped connection from blocked IP address|`INFO`|
|`network.flush-error`|Network flush error|`TRACE`|
|`network.listen-error`|Network listener error|`ERROR`|
|`network.listen-start`|Network listener started|`INFO`|
|`network.listen-stop`|Network listener stopped|`INFO`|
|`network.proxy-error`|Proxy protocol error|`WARN`|
|`network.read-error`|Network read error|`TRACE`|
|`network.set-opt-error`|Network set option error|`ERROR`|
|`network.split-error`|Network split error|`ERROR`|
|`network.timeout`|Network timeout|`DEBUG`|
|`network.write-error`|Network write error|`TRACE`|
|`outgoing-report.dkim-rate-limited`|DKIM report rate limited|`INFO`|
|`outgoing-report.dkim-report`|DKIM report sent|`INFO`|
|`outgoing-report.dmarc-aggregate-report`|DMARC aggregate report sent|`INFO`|
|`outgoing-report.dmarc-rate-limited`|DMARC report rate limited|`INFO`|
|`outgoing-report.dmarc-report`|DMARC report sent|`INFO`|
|`outgoing-report.http-submission`|Report submitted via HTTP|`INFO`|
|`outgoing-report.lock-busy`|Report lock is busy|`INFO`|
|`outgoing-report.lock-deleted`|Report lock was deleted|`INFO`|
|`outgoing-report.locked`|Report is locked|`INFO`|
|`outgoing-report.no-recipients-found`|No recipients found for report|`INFO`|
|`outgoing-report.not-found`|Report not found|`INFO`|
|`outgoing-report.reporting-address-validation-error`|Error validating reporting address|`INFO`|
|`outgoing-report.spf-rate-limited`|SPF report rate limited|`INFO`|
|`outgoing-report.spf-report`|SPF report sent|`INFO`|
|`outgoing-report.submission-error`|Error submitting report|`INFO`|
|`outgoing-report.tls-aggregate`|TLS aggregate report sent|`INFO`|
|`outgoing-report.unauthorized-reporting-address`|Unauthorized reporting address|`INFO`|
|`pop3.capabilities`|POP3 CAPABILITIES command|`DEBUG`|
|`pop3.delete`|POP3 DELETE command|`DEBUG`|
|`pop3.error`|POP3 error occurred|`DEBUG`|
|`pop3.fetch`|POP3 FETCH command|`DEBUG`|
|`pop3.list`|POP3 LIST command|`DEBUG`|
|`pop3.list-message`|POP3 LIST specific message command|`DEBUG`|
|`pop3.noop`|POP3 NOOP command|`DEBUG`|
|`pop3.quit`|POP3 QUIT command|`DEBUG`|
|`pop3.raw-input`|Raw POP3 input received|`TRACE`|
|`pop3.raw-output`|Raw POP3 output sent|`TRACE`|
|`pop3.reset`|POP3 RESET command|`DEBUG`|
|`pop3.start-tls`|POP3 STARTTLS command|`DEBUG`|
|`pop3.stat`|POP3 STAT command|`DEBUG`|
|`pop3.uidl`|POP3 UIDL command|`DEBUG`|
|`pop3.uidl-message`|POP3 UIDL specific message command|`DEBUG`|
|`pop3.utf8`|POP3 UTF8 command|`DEBUG`|
|`purge.auto-expunge`|Auto-expunge executed|`DEBUG`|
|`purge.error`|Purge error|`ERROR`|
|`purge.finished`|Purge finished|`DEBUG`|
|`purge.purge-active`|Active purge in progress|`DEBUG`|
|`purge.running`|Purge running|`INFO`|
|`purge.started`|Purge started|`DEBUG`|
|`purge.tombstone-cleanup`|Tombstone cleanup executed|`DEBUG`|
|`push-subscription.error`|Push subscription error|`DEBUG`|
|`push-subscription.not-found`|Push subscription not found|`DEBUG`|
|`push-subscription.success`|Push subscription successful|`TRACE`|
|`queue.blob-not-found`|Message blob not found|`DEBUG`|
|`queue.concurrency-limit-exceeded`|Concurrency limit exceeded|`INFO`|
|`queue.lock-busy`|Queue lock is busy|`DEBUG`|
|`queue.locked`|Queue is locked|`DEBUG`|
|`queue.queue-autogenerated`|Queued autogenerated message for delivery|`INFO`|
|`queue.queue-dsn`|Queued DSN for delivery|`INFO`|
|`queue.queue-message`|Queued message for delivery|`INFO`|
|`queue.queue-message-submission`|Queued message submissions for delivery|`INFO`|
|`queue.queue-report`|Queued report for delivery|`INFO`|
|`queue.quota-exceeded`|Quota exceeded|`INFO`|
|`queue.rate-limit-exceeded`|Rate limit exceeded|`INFO`|
|`queue.rescheduled`|Message rescheduled for delivery|`INFO`|
|`resource.bad-parameters`|Bad resource parameters|`ERROR`|
|`resource.download-external`|Downloading external resource|`INFO`|
|`resource.error`|Resource error|`ERROR`|
|`resource.not-found`|Resource not found|`DEBUG`|
|`resource.webadmin-unpacked`|Webadmin resource unpacked|`INFO`|
|`server.licensing`|Server licensing event|`INFO`|
|`server.shutdown`|Shutting down Stalwart Mail Server v0.9.1|`INFO`|
|`server.startup`|Starting Stalwart Mail Server v0.9.1|`INFO`|
|`server.startup-error`|Server startup error|`ERROR`|
|`server.thread-error`|Server thread error|`ERROR`|
|`sieve.action-accept`|Sieve action: Accept|`DEBUG`|
|`sieve.action-accept-replace`|Sieve action: Accept and replace|`DEBUG`|
|`sieve.action-discard`|Sieve action: Discard|`DEBUG`|
|`sieve.action-reject`|Sieve action: Reject|`DEBUG`|
|`sieve.list-not-found`|Sieve list not found|`WARN`|
|`sieve.message-too-large`|Sieve message too large|`WARN`|
|`sieve.not-supported`|Sieve action not supported|`WARN`|
|`sieve.quota-exceeded`|Sieve quota exceeded|`WARN`|
|`sieve.runtime-error`|Sieve runtime error|`WARN`|
|`sieve.script-not-found`|Sieve script not found|`WARN`|
|`sieve.send-message`|Sieve sending message|`INFO`|
|`sieve.unexpected-error`|Unexpected Sieve error|`ERROR`|
|`smtp.already-authenticated`|Already authenticated|`DEBUG`|
|`smtp.arc-fail`|ARC verification failed|`INFO`|
|`smtp.arc-pass`|ARC verification passed|`INFO`|
|`smtp.auth-exchange-too-long`|Auth exchange too long|`DEBUG`|
|`smtp.auth-mechanism-not-supported`|Auth mechanism not supported|`INFO`|
|`smtp.auth-not-allowed`|Authentication not allowed|`INFO`|
|`smtp.command-not-implemented`|Command not implemented|`DEBUG`|
|`smtp.concurrency-limit-exceeded`|Concurrency limit exceeded|`INFO`|
|`smtp.deliver-by-disabled`|DELIVERBY extension disabled|`DEBUG`|
|`smtp.deliver-by-invalid`|Invalid DELIVERBY parameter|`DEBUG`|
|`smtp.did-not-say-ehlo`|Client did not say EHLO|`DEBUG`|
|`smtp.dkim-fail`|DKIM verification failed|`INFO`|
|`smtp.dkim-pass`|DKIM verification passed|`INFO`|
|`smtp.dmarc-fail`|DMARC check failed|`INFO`|
|`smtp.dmarc-pass`|DMARC check passed|`INFO`|
|`smtp.dsn-disabled`|DSN extension disabled|`DEBUG`|
|`smtp.ehlo`|SMTP EHLO command|`INFO`|
|`smtp.ehlo-expected`|EHLO command expected|`DEBUG`|
|`smtp.error`|SMTP error occurred|`DEBUG`|
|`smtp.expn`|SMTP EXPN command|`INFO`|
|`smtp.expn-disabled`|EXPN command disabled|`INFO`|
|`smtp.expn-not-found`|EXPN address not found|`INFO`|
|`smtp.future-release-disabled`|FUTURE RELEASE extension disabled|`DEBUG`|
|`smtp.future-release-invalid`|Invalid FUTURE RELEASE parameter|`DEBUG`|
|`smtp.help`|SMTP HELP command|`DEBUG`|
|`smtp.invalid-command`|Invalid command|`DEBUG`|
|`smtp.invalid-ehlo`|Invalid EHLO command|`INFO`|
|`smtp.invalid-parameter`|Invalid parameter|`DEBUG`|
|`smtp.invalid-recipient-address`|Invalid recipient address|`DEBUG`|
|`smtp.invalid-sender-address`|Invalid sender address|`DEBUG`|
|`smtp.iprev-fail`|IPREV check failed|`INFO`|
|`smtp.iprev-pass`|IPREV check passed|`INFO`|
|`smtp.lhlo-expected`|LHLO command expected|`DEBUG`|
|`smtp.loop-detected`|Mail loop detected|`INFO`|
|`smtp.mail-from`|SMTP MAIL FROM command|`INFO`|
|`smtp.mail-from-missing`|MAIL FROM address missing|`DEBUG`|
|`smtp.mail-from-rewritten`|MAIL FROM address rewritten|`DEBUG`|
|`smtp.mail-from-unauthenticated`|MAIL FROM unauthenticated|`DEBUG`|
|`smtp.mail-from-unauthorized`|MAIL FROM unauthorized|`DEBUG`|
|`smtp.mailbox-does-not-exist`|Mailbox does not exist|`INFO`|
|`smtp.message-parse-failed`|Message parsing failed|`INFO`|
|`smtp.message-too-large`|Message too large|`INFO`|
|`smtp.missing-auth-directory`|Missing auth directory|`INFO`|
|`smtp.missing-local-hostname`|Missing local hostname|`WARN`|
|`smtp.mt-priority-disabled`|MT-PRIORITY extension disabled|`DEBUG`|
|`smtp.mt-priority-invalid`|Invalid MT-PRIORITY parameter|`DEBUG`|
|`smtp.multiple-mail-from`|Multiple MAIL FROM commands|`DEBUG`|
|`smtp.noop`|SMTP NOOP command|`DEBUG`|
|`smtp.pipe-error`|Pipe command failed|`DEBUG`|
|`smtp.pipe-success`|Pipe command succeeded|`DEBUG`|
|`smtp.quit`|SMTP QUIT command|`DEBUG`|
|`smtp.rate-limit-exceeded`|Rate limit exceeded|`INFO`|
|`smtp.raw-input`|Raw SMTP input received|`TRACE`|
|`smtp.raw-output`|Raw SMTP output sent|`TRACE`|
|`smtp.rcpt-to`|SMTP RCPT TO command|`INFO`|
|`smtp.rcpt-to-duplicate`|Duplicate RCPT TO|`DEBUG`|
|`smtp.rcpt-to-missing`|RCPT TO address missing|`DEBUG`|
|`smtp.rcpt-to-rewritten`|RCPT TO address rewritten|`DEBUG`|
|`smtp.relay-not-allowed`|Relay not allowed|`INFO`|
|`smtp.remote-id-not-found`|Remote host ID not found|`WARN`|
|`smtp.request-too-large`|Request too large|`INFO`|
|`smtp.require-tls-disabled`|REQUIRETLS extension disabled|`DEBUG`|
|`smtp.rset`|SMTP RSET command|`DEBUG`|
|`smtp.spf-ehlo-fail`|SPF EHLO check failed|`INFO`|
|`smtp.spf-ehlo-pass`|SPF EHLO check passed|`INFO`|
|`smtp.spf-from-fail`|SPF From check failed|`INFO`|
|`smtp.spf-from-pass`|SPF From check passed|`INFO`|
|`smtp.start-tls`|SMTP STARTTLS command|`DEBUG`|
|`smtp.start-tls-already`|TLS already active|`DEBUG`|
|`smtp.start-tls-unavailable`|STARTTLS unavailable|`DEBUG`|
|`smtp.syntax-error`|Syntax error|`DEBUG`|
|`smtp.time-limit-exceeded`|Time limit exceeded|`INFO`|
|`smtp.too-many-invalid-rcpt`|Too many invalid recipients|`INFO`|
|`smtp.too-many-messages`|Too many messages|`INFO`|
|`smtp.too-many-recipients`|Too many recipients|`INFO`|
|`smtp.transfer-limit-exceeded`|Transfer limit exceeded|`INFO`|
|`smtp.unsupported-parameter`|Unsupported parameter|`DEBUG`|
|`smtp.vrfy`|SMTP VRFY command|`INFO`|
|`smtp.vrfy-disabled`|VRFY command disabled|`INFO`|
|`smtp.vrfy-not-found`|VRFY address not found|`INFO`|
|`spam.classify`|Classifying message for spam|`DEBUG`|
|`spam.classify-error`|Error classifying message for spam|`WARN`|
|`spam.list-updated`|Spam list updated|`INFO`|
|`spam.not-enough-training-data`|Not enough training data for spam filter|`DEBUG`|
|`spam.pyzor-error`|Pyzor error|`WARN`|
|`spam.train`|Training spam filter|`DEBUG`|
|`spam.train-balance`|Balancing spam filter training data|`DEBUG`|
|`spam.train-error`|Error training spam filter|`WARN`|
|`spf.fail`|SPF check failed|`DEBUG`|
|`spf.neutral`|SPF neutral result|`DEBUG`|
|`spf.none`|No SPF record|`DEBUG`|
|`spf.pass`|SPF check passed|`DEBUG`|
|`spf.perm-error`|SPF permanent error|`DEBUG`|
|`spf.soft-fail`|SPF soft fail|`DEBUG`|
|`spf.temp-error`|SPF temporary error|`DEBUG`|
|`store.assert-value-failed`|Another process modified the record|`ERROR`|
|`store.blob-delete`|Blob delete operation|`TRACE`|
|`store.blob-missing-marker`|Blob missing marker|`WARN`|
|`store.blob-read`|Blob read operation|`TRACE`|
|`store.blob-write`|Blob write operation|`TRACE`|
|`store.crypto-error`|Store crypto error|`ERROR`|
|`store.data-corruption`|Data corruption detected|`ERROR`|
|`store.data-iterate`|Data store iteration operation|`TRACE`|
|`store.data-write`|Write batch operation|`TRACE`|
|`store.decompress-error`|Decompression error|`ERROR`|
|`store.deserialize-error`|Deserialization error|`ERROR`|
|`store.elasticsearch-error`|ElasticSearch error|`ERROR`|
|`store.filesystem-error`|Filesystem error|`ERROR`|
|`store.foundationdb-error`|FoundationDB error|`ERROR`|
|`store.ldap-bind`|LDAP bind operation|`TRACE`|
|`store.ldap-error`|LDAP error|`ERROR`|
|`store.ldap-query`|LDAP query executed|`TRACE`|
|`store.mysql-error`|MySQL error|`ERROR`|
|`store.not-configured`|Store not configured|`ERROR`|
|`store.not-found`|Record not found in database|`DEBUG`|
|`store.not-supported`|Operation not supported by store|`ERROR`|
|`store.pool-error`|Connection pool error|`ERROR`|
|`store.postgresql-error`|PostgreSQL error|`ERROR`|
|`store.redis-error`|Redis error|`ERROR`|
|`store.rocksdb-error`|RocksDB error|`ERROR`|
|`store.s3-error`|S3 error|`ERROR`|
|`store.sql-query`|SQL query executed|`TRACE`|
|`store.sqlite-error`|SQLite error|`ERROR`|
|`store.unexpected-error`|Unexpected store error|`ERROR`|
|`telemetry.journal-error`|Journal collector error|`WARN`|
|`telemetry.log-error`|Log collector error|`WARN`|
|`telemetry.otel-expoter-error`|OpenTelemetry exporter error|`WARN`|
|`telemetry.otel-metrics-exporter-error`|OpenTelemetry metrics exporter error|`WARN`|
|`telemetry.prometheus-exporter-error`|Prometheus exporter error|`WARN`|
|`telemetry.update`|Tracing update|`DISABLE`|
|`telemetry.webhook-error`|Webhook collector error|`WARN`|
|`tls-rpt.record-fetch`|Fetched TLS-RPT record|`INFO`|
|`tls-rpt.record-fetch-error`|Error fetching TLS-RPT record|`INFO`|
|`tls.certificate-not-found`|TLS certificate not found|`DEBUG`|
|`tls.handshake`|TLS handshake|`INFO`|
|`tls.handshake-error`|TLS handshake error|`DEBUG`|
|`tls.multiple-certificates-available`|Multiple TLS certificates available|`WARN`|
|`tls.no-certificates-available`|No TLS certificates available|`WARN`|
|`tls.not-configured`|TLS not configured|`ERROR`|

## Key Types

Each event log or trace entry can contain a set of key-value pairs. The following key types are supported:

- `accountId`: Unique identifier for an account
- `attempt`: Number of attempts made for an operation
- `blobId`: Unique identifier for a binary large object (BLOB)
- `causedBy`: Reason or cause of an event or error
- `changeId`: Identifier for a specific change or modification
- `code`: Error code or status code
- `collection`: Name or identifier of a data collection
- `contents`: Contents or payload of a message or object
- `date`: Date of an event or operation
- `details`: Additional details or information about an event
- `dkimFail`: Indicator of a failed DKIM (DomainKeys Identified Mail) check
- `dkimNone`: Indicator of no DKIM signature present
- `dkimPass`: Indicator of a passed DKIM check
- `dmarcNone`: Indicator of no DMARC (Domain-based Message Authentication, Reporting & Conformance) policy
- `dmarcPass`: Indicator of a passed DMARC check
- `dmarcQuarantine`: Indicator of DMARC quarantine policy
- `dmarcReject`: Indicator of DMARC reject policy
- `documentId`: Unique identifier for a document
- `domain`: Domain name associated with an event or entity
- `due`: Due date or deadline
- `elapsed`: Elapsed time since a specific point
- `expected`: Expected value or outcome
- `expires`: Expiration date or time
- `from`: Source or sender of a message or action
- `hamLearns`: Number of ham (non-spam) messages learned
- `hostname`: Name of a host or server
- `id`: Generic identifier
- `interval`: Time interval between events or operations
- `key`: Key value in a key-value pair
- `limit`: Upper or lower bound of a value or operation
- `listenerId`: Identifier for a listener process
- `localIp`: Local IP address
- `localPort`: Local port number
- `mailboxId`: Unique identifier for a mailbox
- `messageId`: Unique identifier for a message
- `name`: Name of an entity or object
- `nextDsn`: Next Delivery Status Notification
- `nextRenewal`: Date or time of next renewal
- `nextRetry`: Time of next retry attempt
- `oldName`: Previous name of an entity or object
- `parameters`: Parameters or arguments for an operation
- `path`: File path or URL path
- `policy`: Policy name or identifier
- `protocol`: Communication protocol used
- `queueId`: Identifier for a message queue
- `rangeFrom`: Start of a range
- `rangeTo`: End of a range
- `reason`: Reason for an action or outcome
- `remoteIp`: Remote IP address
- `remotePort`: Remote port number
- `renewal`: Renewal date or information
- `reportId`: Identifier for a report
- `result`: Outcome or result of an operation
- `size`: Size of an object or data
- `spfFail`: Indicator of a failed SPF (Sender Policy Framework) check
- `spfNone`: Indicator of no SPF record present
- `spfPass`: Indicator of a passed SPF check
- `status`: Current status of an entity or operation
- `strict`: Indicator of strict mode or enforcement
- `tls`: TLS (Transport Layer Security) version or status
- `to`: Destination or recipient of a message or action
- `total`: Total count or sum
- `totalFailures`: Total number of failures
- `totalSuccesses`: Total number of successes
- `type`: Type or category of an entity or event
- `uid`: Unique identifier
- `uidNext`: Next available unique identifier
- `uidValidity`: Validity token for unique identifiers
- `url`: Uniform Resource Locator
- `used`: Amount or quantity used
- `validFrom`: Start date of validity period
- `validTo`: End date of validity period
- `value`: Value of a property or measurement
- `version`: Version number or identifier

