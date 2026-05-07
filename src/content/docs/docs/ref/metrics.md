---
title: Metrics
description: Telemetry metrics collected by the Stalwart, grouped by subsystem.
sidebar_position: 3
custom_edit_url: null
---

# Metrics

Every metric Stalwart collects is listed below, grouped by subsystem. Each metric has an **identifier** (formatted as `<subsystem>.<name>`), a **unit**, and a **description**.


## Acme

| Metric | Unit | Description |
|---|---|---|
| `acme.auth-error` | `count` | ACME authentication error |
| `acme.auth-too-many-attempts` | `count` | Too many ACME authentication attempts |
| `acme.order-completed` | `count` | ACME order completed |
| `acme.order-invalid` | `count` | ACME order invalid |
| `acme.client-missing-sni` | `count` | ACME client missing SNI |
| `acme.tls-alpn-error` | `count` | ACME TLS ALPN error |
| `acme.token-not-found` | `count` | ACME token not found |
| `acme.error` | `count` | ACME error |


## Arc

| Metric | Unit | Description |
|---|---|---|
| `arc.chain-too-long` | `count` | ARC chain too long |
| `arc.invalid-instance` | `count` | Invalid ARC instance |
| `arc.invalid-cv` | `count` | Invalid ARC CV |
| `arc.has-header-tag` | `count` | ARC has header tag |
| `arc.broken-chain` | `count` | Broken ARC chain |


## Auth

| Metric | Unit | Description |
|---|---|---|
| `auth.success` | `count` | Authentication successful |
| `auth.failed` | `count` | Authentication failed |
| `auth.too-many-attempts` | `count` | Too many authentication attempts |
| `auth.error` | `count` | Authentication error |


## Calendar

| Metric | Unit | Description |
|---|---|---|
| `calendar.alarm-sent` | `count` | Calendar alarm sent |
| `calendar.alarm-failed` | `count` | Calendar alarm could not be sent |
| `calendar.itip-message-sent` | `count` | Calendar iTIP message sent |
| `calendar.itip-message-received` | `count` | Calendar iTIP message received |
| `calendar.itip-message-error` | `count` | iTIP message error |


## Cluster

| Metric | Unit | Description |
|---|---|---|
| `cluster.subscriber-error` | `count` | PubSub subscriber error |
| `cluster.subscriber-disconnected` | `count` | PubSub subscriber disconnected |
| `cluster.publisher-error` | `count` | PubSub publisher error |


## Dane

| Metric | Unit | Description |
|---|---|---|
| `dane.authentication-success` | `count` | DANE authentication successful |
| `dane.authentication-failure` | `count` | DANE authentication failed |
| `dane.no-certificates-found` | `count` | No certificates found for DANE |
| `dane.certificate-parse-error` | `count` | Error parsing certificate for DANE |
| `dane.tlsa-record-fetch-error` | `count` | Error fetching TLSA record |
| `dane.tlsa-record-not-found` | `count` | TLSA record not found |
| `dane.tlsa-record-not-dnssec-signed` | `count` | TLSA record not DNSSEC signed |
| `dane.tlsa-record-invalid` | `count` | Invalid TLSA record |


## Delivery

| Metric | Unit | Description |
|---|---|---|
| `delivery.total-time` | `milliseconds` | Total message delivery time from submission to delivery |
| `delivery.attempt-time` | `milliseconds` | Message delivery time |
| `delivery.active-connections` | `connections` | Active delivery connections |
| `delivery.attempt-start` | `count` | Delivery attempt started |
| `delivery.attempt-end` | `count` | Delivery attempt ended |
| `delivery.completed` | `count` | Delivery completed |
| `delivery.mx-lookup-failed` | `count` | MX record lookup failed |
| `delivery.ip-lookup-failed` | `count` | IP address lookup failed |
| `delivery.null-mx` | `count` | Null MX record found |
| `delivery.greeting-failed` | `count` | SMTP greeting failed |
| `delivery.ehlo-rejected` | `count` | SMTP EHLO rejected |
| `delivery.auth-failed` | `count` | SMTP authentication failed |
| `delivery.mail-from-rejected` | `count` | SMTP MAIL FROM rejected |
| `delivery.delivered` | `count` | Message delivered |
| `delivery.rcpt-to-rejected` | `count` | SMTP RCPT TO rejected |
| `delivery.rcpt-to-failed` | `count` | SMTP RCPT TO failed |
| `delivery.message-rejected` | `count` | Message rejected by remote server |
| `delivery.start-tls-unavailable` | `count` | STARTTLS unavailable |
| `delivery.start-tls-error` | `count` | STARTTLS error |
| `delivery.start-tls-disabled` | `count` | STARTTLS disabled |
| `delivery.implicit-tls-error` | `count` | Implicit TLS error |
| `delivery.concurrency-limit-exceeded` | `count` | Concurrency limit exceeded |
| `delivery.rate-limit-exceeded` | `count` | Rate limit exceeded |
| `delivery.double-bounce` | `count` | Discarding message after double bounce |
| `delivery.dsn-success` | `count` | DSN success notification |
| `delivery.dsn-temp-fail` | `count` | DSN temporary failure notification |
| `delivery.dsn-perm-fail` | `count` | DSN permanent failure notification |


## Dkim

| Metric | Unit | Description |
|---|---|---|
| `dkim.pass` | `count` | DKIM verification passed |
| `dkim.neutral` | `count` | DKIM verification neutral |
| `dkim.fail` | `count` | DKIM verification failed |
| `dkim.perm-error` | `count` | DKIM permanent error |
| `dkim.temp-error` | `count` | DKIM temporary error |
| `dkim.none` | `count` | No DKIM signature |
| `dkim.unsupported-version` | `count` | Unsupported DKIM version |
| `dkim.unsupported-algorithm` | `count` | Unsupported DKIM algorithm |
| `dkim.unsupported-canonicalization` | `count` | Unsupported DKIM canonicalization |
| `dkim.unsupported-key-type` | `count` | Unsupported DKIM key type |
| `dkim.failed-body-hash-match` | `count` | DKIM body hash mismatch |
| `dkim.failed-verification` | `count` | DKIM verification failed |
| `dkim.failed-auid-match` | `count` | DKIM AUID mismatch |
| `dkim.revoked-public-key` | `count` | DKIM public key revoked |
| `dkim.incompatible-algorithms` | `count` | Incompatible DKIM algorithms |
| `dkim.signature-expired` | `count` | DKIM signature expired |
| `dkim.signature-length` | `count` | DKIM signature length issue |
| `dkim.signer-not-found` | `count` | DKIM signer not found |


## Dmarc

| Metric | Unit | Description |
|---|---|---|
| `dmarc.pass` | `count` | DMARC check passed |
| `dmarc.fail` | `count` | DMARC check failed |
| `dmarc.perm-error` | `count` | DMARC permanent error |
| `dmarc.temp-error` | `count` | DMARC temporary error |
| `dmarc.none` | `count` | No DMARC record |


## Dns

| Metric | Unit | Description |
|---|---|---|
| `dns.lookup-time` | `milliseconds` | DNS lookup time |
| `dns.record-creation-failed` | `count` | DNS record creation failed |
| `dns.record-deletion-failed` | `count` | DNS record deletion failed |
| `dns.record-lookup-failed` | `count` | DNS record lookup failed |
| `dns.record-propagation-timeout` | `count` | DNS record propagation timeout |


## Domain

| Metric | Unit | Description |
|---|---|---|
| `domain.count` | `domains` | Total number of domains |


## Eval

| Metric | Unit | Description |
|---|---|---|
| `eval.error` | `count` | Expression evaluation error |
| `eval.directory-not-found` | `count` | Directory not found while evaluating expression |
| `eval.store-not-found` | `count` | Store not found while evaluating expression |


## Http

| Metric | Unit | Description |
|---|---|---|
| `http.request-time` | `milliseconds` | HTTP request duration |
| `http.active-connections` | `connections` | Active HTTP connections |
| `http.connection-start` | `count` | HTTP connection started |
| `http.error` | `count` | HTTP error occurred |
| `http.request-body` | `count` | HTTP request body |
| `http.response-body` | `count` | HTTP response body |
| `http.x-forwarded-missing` | `count` | X-Forwarded-For header is missing |


## Imap

| Metric | Unit | Description |
|---|---|---|
| `imap.request-time` | `milliseconds` | IMAP request duration |
| `imap.active-connections` | `connections` | Active IMAP connections |
| `imap.connection-start` | `count` | IMAP connection started |
| `imap.connection-end` | `count` | IMAP connection ended |


## IncomingReport

| Metric | Unit | Description |
|---|---|---|
| `incoming-report.dmarc-report` | `count` | DMARC report received |
| `incoming-report.dmarc-report-with-warnings` | `count` | DMARC report received with warnings |
| `incoming-report.tls-report` | `count` | TLS report received |
| `incoming-report.tls-report-with-warnings` | `count` | TLS report received with warnings |
| `incoming-report.abuse-report` | `count` | Abuse report received |
| `incoming-report.auth-failure-report` | `count` | Authentication failure report received |
| `incoming-report.fraud-report` | `count` | Fraud report received |
| `incoming-report.not-spam-report` | `count` | Not spam report received |
| `incoming-report.virus-report` | `count` | Virus report received |
| `incoming-report.other-report` | `count` | Other type of report received |
| `incoming-report.message-parse-failed` | `count` | Failed to parse incoming report message |
| `incoming-report.dmarc-parse-failed` | `count` | Failed to parse DMARC report |
| `incoming-report.tls-rpc-parse-failed` | `count` | Failed to parse TLS RPC report |
| `incoming-report.arf-parse-failed` | `count` | Failed to parse ARF report |
| `incoming-report.decompress-error` | `count` | Error decompressing report |


## Iprev

| Metric | Unit | Description |
|---|---|---|
| `iprev.pass` | `count` | IPREV check passed |
| `iprev.fail` | `count` | IPREV check failed |
| `iprev.perm-error` | `count` | IPREV permanent error |
| `iprev.temp-error` | `count` | IPREV temporary error |
| `iprev.none` | `count` | No IPREV record |


## Jmap

| Metric | Unit | Description |
|---|---|---|
| `jmap.method-call` | `count` | JMAP method call |
| `jmap.invalid-arguments` | `count` | Invalid JMAP arguments |
| `jmap.request-too-large` | `count` | JMAP request too large |
| `jmap.unsupported-filter` | `count` | Unsupported JMAP filter |
| `jmap.unsupported-sort` | `count` | Unsupported JMAP sort |
| `jmap.unknown-method` | `count` | Unknown JMAP method |
| `jmap.forbidden` | `count` | JMAP operation forbidden |
| `jmap.not-json` | `count` | JMAP request is not JSON |
| `jmap.not-request` | `count` | JMAP input is not a request |
| `jmap.websocket-start` | `count` | JMAP WebSocket connection started |
| `jmap.websocket-error` | `count` | JMAP WebSocket error |


## Limit

| Metric | Unit | Description |
|---|---|---|
| `limit.size-request` | `count` | Request size limit reached |
| `limit.size-upload` | `count` | Upload size limit reached |
| `limit.calls-in` | `count` | Incoming calls limit reached |
| `limit.concurrent-request` | `count` | Concurrent request limit reached |
| `limit.concurrent-upload` | `count` | Concurrent upload limit reached |
| `limit.concurrent-connection` | `count` | Concurrent connection limit reached |
| `limit.quota` | `count` | Quota limit reached |
| `limit.blob-quota` | `count` | Blob quota limit reached |
| `limit.tenant-quota` | `count` | Tenant quota limit reached |
| `limit.too-many-requests` | `count` | Too many requests |


## MailAuth

| Metric | Unit | Description |
|---|---|---|
| `mail-auth.parse-error` | `count` | Mail authentication parse error |
| `mail-auth.missing-parameters` | `count` | Missing mail authentication parameters |
| `mail-auth.no-headers-found` | `count` | No headers found in message |
| `mail-auth.crypto` | `count` | Crypto error during mail authentication |
| `mail-auth.io` | `count` | I/O error during mail authentication |
| `mail-auth.base64` | `count` | Base64 error during mail authentication |
| `mail-auth.dns-error` | `count` | DNS error |
| `mail-auth.dns-record-not-found` | `count` | DNS record not found |
| `mail-auth.dns-invalid-record-type` | `count` | Invalid DNS record type |
| `mail-auth.policy-not-aligned` | `count` | Policy not aligned |


## ManageSieve

| Metric | Unit | Description |
|---|---|---|
| `manage-sieve.connection-start` | `count` | ManageSieve connection started |
| `manage-sieve.connection-end` | `count` | ManageSieve connection ended |


## Message

| Metric | Unit | Description |
|---|---|---|
| `message.size` | `bytes` | Received message size |
| `message.authenticated-size` | `bytes` | Received message size from authenticated users |


## MessageIngest

| Metric | Unit | Description |
|---|---|---|
| `message-ingest.time` | `milliseconds` | Message ingestion time |
| `message-ingest.index-time` | `milliseconds` | Message full-text indexing time |
| `message-ingest.ham` | `count` | Message ingested |
| `message-ingest.spam` | `count` | Possible spam message ingested |
| `message-ingest.imap-append` | `count` | Message appended via IMAP |
| `message-ingest.jmap-append` | `count` | Message appended via JMAP |
| `message-ingest.duplicate` | `count` | Skipping duplicate message |
| `message-ingest.error` | `count` | Message ingestion error |
| `message-ingest.search-index` | `count` | Search index updated |


## Milter

| Metric | Unit | Description |
|---|---|---|
| `milter.action-accept` | `count` | Milter action: Accept |
| `milter.action-discard` | `count` | Milter action: Discard |
| `milter.action-reject` | `count` | Milter action: Reject |
| `milter.action-temp-fail` | `count` | Milter action: Temporary failure |
| `milter.action-reply-code` | `count` | Milter action: Reply code |
| `milter.action-connection-failure` | `count` | Milter action: Connection failure |
| `milter.action-shutdown` | `count` | Milter action: Shutdown |


## MtaHook

| Metric | Unit | Description |
|---|---|---|
| `mta-hook.action-accept` | `count` | MTA hook action: Accept |
| `mta-hook.action-discard` | `count` | MTA hook action: Discard |
| `mta-hook.action-reject` | `count` | MTA hook action: Reject |
| `mta-hook.action-quarantine` | `count` | MTA hook action: Quarantine |
| `mta-hook.error` | `count` | MTA hook error |


## MtaSts

| Metric | Unit | Description |
|---|---|---|
| `mta-sts.authorized` | `count` | Host authorized by MTA-STS policy |
| `mta-sts.not-authorized` | `count` | Host not authorized by MTA-STS policy |
| `mta-sts.invalid-policy` | `count` | Invalid MTA-STS policy |


## Network

| Metric | Unit | Description |
|---|---|---|
| `network.timeout` | `count` | Network timeout |


## OutgoingReport

| Metric | Unit | Description |
|---|---|---|
| `outgoing-report.size` | `bytes` | Outgoing report size |
| `outgoing-report.spf-report` | `count` | SPF report sent |
| `outgoing-report.spf-rate-limited` | `count` | SPF report rate limited |
| `outgoing-report.dkim-report` | `count` | DKIM report sent |
| `outgoing-report.dkim-rate-limited` | `count` | DKIM report rate limited |
| `outgoing-report.dmarc-report` | `count` | DMARC report sent |
| `outgoing-report.dmarc-rate-limited` | `count` | DMARC report rate limited |
| `outgoing-report.dmarc-aggregate-report` | `count` | DMARC aggregate is being prepared |
| `outgoing-report.tls-aggregate` | `count` | TLS aggregate report is being prepared |
| `outgoing-report.http-submission` | `count` | Report submitted via HTTP |
| `outgoing-report.unauthorized-reporting-address` | `count` | Unauthorized reporting address |
| `outgoing-report.reporting-address-validation-error` | `count` | Error validating reporting address |
| `outgoing-report.not-found` | `count` | Report not found |
| `outgoing-report.submission-error` | `count` | Error submitting report |
| `outgoing-report.no-recipients-found` | `count` | No recipients found for report |


## Pop3

| Metric | Unit | Description |
|---|---|---|
| `pop3.request-time` | `milliseconds` | POP3 request duration |
| `pop3.active-connections` | `connections` | Active POP3 connections |
| `pop3.connection-start` | `count` | POP3 connection started |
| `pop3.connection-end` | `count` | POP3 connection ended |


## PushSubscription

| Metric | Unit | Description |
|---|---|---|
| `push-subscription.success` | `count` | Push subscription successful |
| `push-subscription.error` | `count` | Push subscription error |
| `push-subscription.not-found` | `count` | Push subscription not found |


## Queue

| Metric | Unit | Description |
|---|---|---|
| `queue.count` | `messages` | Total number of messages in the queue |
| `queue.message-queued` | `count` | Queued message for delivery |
| `queue.authenticated-message-queued` | `count` | Queued message submission for delivery |
| `queue.report-queued` | `count` | Queued report for delivery |
| `queue.dsn-queued` | `count` | Queued DSN for delivery |
| `queue.autogenerated-queued` | `count` | Queued autogenerated message for delivery |
| `queue.rescheduled` | `count` | Message rescheduled for delivery |
| `queue.blob-not-found` | `count` | Message blob not found |
| `queue.rate-limit-exceeded` | `count` | Rate limit exceeded |
| `queue.concurrency-limit-exceeded` | `count` | Concurrency limit exceeded |
| `queue.quota-exceeded` | `count` | Quota exceeded |


## Resource

| Metric | Unit | Description |
|---|---|---|
| `resource.not-found` | `count` | Resource not found |
| `resource.bad-parameters` | `count` | Bad resource parameters |
| `resource.error` | `count` | Resource error |


## Security

| Metric | Unit | Description |
|---|---|---|
| `security.authentication-ban` | `count` | Banned due to authentication errors |
| `security.abuse-ban` | `count` | Banned due to abuse |
| `security.scan-ban` | `count` | Banned due to scan |
| `security.loiter-ban` | `count` | Banned due to loitering |
| `security.ip-blocked` | `count` | Blocked IP address |
| `security.unauthorized` | `count` | Unauthorized access |


## Server

| Metric | Unit | Description |
|---|---|---|
| `server.memory` | `bytes` | Server memory usage |
| `server.thread-error` | `count` | Server thread error |


## Sieve

| Metric | Unit | Description |
|---|---|---|
| `sieve.request-time` | `milliseconds` | ManageSieve request duration |
| `sieve.active-connections` | `connections` | Active ManageSieve connections |
| `sieve.action-accept` | `count` | Sieve action: Accept |
| `sieve.action-accept-replace` | `count` | Sieve action: Accept and replace |
| `sieve.action-discard` | `count` | Sieve action: Discard |
| `sieve.action-reject` | `count` | Sieve action: Reject |
| `sieve.send-message` | `count` | Sieve sending message |
| `sieve.message-too-large` | `count` | Sieve message too large |
| `sieve.runtime-error` | `count` | Sieve runtime error |
| `sieve.unexpected-error` | `count` | Unexpected Sieve error |
| `sieve.not-supported` | `count` | Sieve action not supported |
| `sieve.quota-exceeded` | `count` | Sieve quota exceeded |


## Smtp

| Metric | Unit | Description |
|---|---|---|
| `smtp.request-time` | `milliseconds` | SMTP request duration |
| `smtp.active-connections` | `connections` | Active SMTP connections |
| `smtp.connection-start` | `count` | SMTP connection started |
| `smtp.connection-end` | `count` | SMTP connection ended |
| `smtp.error` | `count` | SMTP error occurred |
| `smtp.concurrency-limit-exceeded` | `count` | Concurrency limit exceeded |
| `smtp.transfer-limit-exceeded` | `count` | Transfer limit exceeded |
| `smtp.rate-limit-exceeded` | `count` | Rate limit exceeded |
| `smtp.time-limit-exceeded` | `count` | Time limit exceeded |
| `smtp.message-parse-failed` | `count` | Message parsing failed |
| `smtp.message-too-large` | `count` | Message too large |
| `smtp.loop-detected` | `count` | Mail loop detected |
| `smtp.dkim-pass` | `count` | DKIM verification passed |
| `smtp.dkim-fail` | `count` | DKIM verification failed |
| `smtp.arc-pass` | `count` | ARC verification passed |
| `smtp.arc-fail` | `count` | ARC verification failed |
| `smtp.spf-ehlo-pass` | `count` | SPF EHLO check passed |
| `smtp.spf-ehlo-fail` | `count` | SPF EHLO check failed |
| `smtp.spf-from-pass` | `count` | SPF From check passed |
| `smtp.spf-from-fail` | `count` | SPF From check failed |
| `smtp.dmarc-pass` | `count` | DMARC check passed |
| `smtp.dmarc-fail` | `count` | DMARC check failed |
| `smtp.iprev-pass` | `count` | IPREV check passed |
| `smtp.iprev-fail` | `count` | IPREV check failed |
| `smtp.too-many-messages` | `count` | Too many messages |
| `smtp.invalid-ehlo` | `count` | Invalid EHLO command |
| `smtp.did-not-say-ehlo` | `count` | Client did not say EHLO |
| `smtp.mail-from-unauthenticated` | `count` | MAIL FROM without authentication |
| `smtp.mail-from-unauthorized` | `count` | MAIL FROM unauthorized |
| `smtp.mail-from-missing` | `count` | MAIL FROM address missing |
| `smtp.multiple-mail-from` | `count` | Multiple MAIL FROM commands |
| `smtp.mailbox-does-not-exist` | `count` | Mailbox does not exist |
| `smtp.relay-not-allowed` | `count` | Relay not allowed |
| `smtp.rcpt-to-duplicate` | `count` | Duplicate RCPT TO |
| `smtp.rcpt-to-missing` | `count` | RCPT TO address missing |
| `smtp.too-many-recipients` | `count` | Too many recipients |
| `smtp.too-many-invalid-rcpt` | `count` | Too many invalid recipients |
| `smtp.auth-mechanism-not-supported` | `count` | Auth mechanism not supported |
| `smtp.auth-exchange-too-long` | `count` | Auth exchange too long |
| `smtp.command-not-implemented` | `count` | Command not implemented |
| `smtp.invalid-command` | `count` | Invalid command |
| `smtp.syntax-error` | `count` | Syntax error |
| `smtp.request-too-large` | `count` | Request too large |


## Spam

| Metric | Unit | Description |
|---|---|---|
| `spam.pyzor-error` | `count` | Pyzor error |
| `spam.dnsbl-error` | `count` | Error querying DNSBL |
| `spam.train-completed` | `count` | Spam classifier training completed |
| `spam.train-sample-added` | `count` | New training sample added |
| `spam.classify` | `count` | Classifying message for spam |
| `spam.model-not-ready` | `count` | Spam classifier model not ready |


## Spf

| Metric | Unit | Description |
|---|---|---|
| `spf.pass` | `count` | SPF check passed |
| `spf.fail` | `count` | SPF check failed |
| `spf.soft-fail` | `count` | SPF soft fail |
| `spf.neutral` | `count` | SPF neutral result |
| `spf.temp-error` | `count` | SPF temporary error |
| `spf.perm-error` | `count` | SPF permanent error |
| `spf.none` | `count` | No SPF record |


## Store

| Metric | Unit | Description |
|---|---|---|
| `store.data-read-time` | `milliseconds` | Data store read time |
| `store.data-write-time` | `milliseconds` | Data store write time |
| `store.blob-read-time` | `milliseconds` | Blob store read time |
| `store.blob-write-time` | `milliseconds` | Blob store write time |
| `store.assert-value-failed` | `count` | Another process modified the record |
| `store.foundationdb-error` | `count` | FoundationDB error |
| `store.mysql-error` | `count` | MySQL error |
| `store.postgresql-error` | `count` | PostgreSQL error |
| `store.rocksdb-error` | `count` | RocksDB error |
| `store.sqlite-error` | `count` | SQLite error |
| `store.ldap-error` | `count` | LDAP error |
| `store.elasticsearch-error` | `count` | ElasticSearch error |
| `store.redis-error` | `count` | Redis error |
| `store.s3-error` | `count` | S3 error |
| `store.azure-error` | `count` | Azure error |
| `store.filesystem-error` | `count` | Filesystem error |
| `store.pool-error` | `count` | Connection pool error |
| `store.data-corruption` | `count` | Data corruption detected |
| `store.decompress-error` | `count` | Decompression error |
| `store.deserialize-error` | `count` | Deserialization error |
| `store.not-found` | `count` | Record not found in database |
| `store.not-configured` | `count` | Store not configured |
| `store.not-supported` | `count` | Operation not supported by store |
| `store.unexpected-error` | `count` | Unexpected store error |
| `store.crypto-error` | `count` | Store crypto error |
| `store.http-store-error` | `count` | Error updating HTTP store |
| `store.blob-missing-marker` | `count` | Blob missing marker |
| `store.data-write` | `count` | Write batch operation |
| `store.data-iterate` | `count` | Data store iteration operation |
| `store.blob-read` | `count` | Blob read operation |
| `store.blob-write` | `count` | Blob write operation |
| `store.blob-delete` | `count` | Blob delete operation |


## TaskManager

| Metric | Unit | Description |
|---|---|---|
| `task-manager.blob-not-found` | `count` | Blob not found for task |
| `task-manager.metadata-not-found` | `count` | Metadata not found for task |


## Telemetry

| Metric | Unit | Description |
|---|---|---|
| `telemetry.alert-event` | `count` | Alert event triggered |
| `telemetry.alert-message` | `count` | Alert message sent |
| `telemetry.log-error` | `count` | Log collector error |
| `telemetry.webhook-error` | `count` | Webhook collector error |
| `telemetry.otel-exporter-error` | `count` | OpenTelemetry exporter error |
| `telemetry.otel-metrics-exporter-error` | `count` | OpenTelemetry metrics exporter error |
| `telemetry.prometheus-exporter-error` | `count` | Prometheus exporter error |
| `telemetry.journal-error` | `count` | Journal collector error |


## Tls

| Metric | Unit | Description |
|---|---|---|
| `tls.handshake-error` | `count` | TLS handshake error |


## User

| Metric | Unit | Description |
|---|---|---|
| `user.count` | `users` | Total number of users |

