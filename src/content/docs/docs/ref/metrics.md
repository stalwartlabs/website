---
title: Metrics
description: Telemetry metrics collected by Stalwart, grouped by subsystem.
sidebar_position: 7
custom_edit_url: null
---

Every metric Stalwart collects is listed below, grouped by subsystem. Each metric has an **identifier** (formatted as `<subsystem>.<name>`), a **unit**, the names under which the exporters publish it, and a **description**.

The identifier is the name used inside Stalwart, by alerts, the `metric` expression function and the WebUI dashboard. The unit is the one in which the server records the metric. The **OpenTelemetry** column gives the name and the UCUM unit sent by the [OpenTelemetry exporter](/docs/telemetry/metrics/opentelemetry), and the **Prometheus** column the name served by the [Prometheus endpoint](/docs/telemetry/metrics/prometheus). Both exporters report durations in seconds, although the server records them in milliseconds. [Exported names](/docs/telemetry/metrics/#exported-names) explains how the exported names are derived.

A histogram appears in Prometheus as three series that start with the listed name: `_bucket`, with one sample per bucket bound in the `le` label, `_sum` and `_count`. The delivery attempt histogram, for example, is queried as `stalwart_delivery_attempt_time_seconds_bucket`, `stalwart_delivery_attempt_time_seconds_sum` and `stalwart_delivery_attempt_time_seconds_count`.


## Acme

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `acme.auth-error` | `count` | `stalwart.acme.auth_error` (`{event}`) | `stalwart_acme_auth_error_total` | ACME authentication error |
| `acme.auth-too-many-attempts` | `count` | `stalwart.acme.auth_too_many_attempts` (`{event}`) | `stalwart_acme_auth_too_many_attempts_total` | Too many ACME authentication attempts |
| `acme.order-completed` | `count` | `stalwart.acme.order_completed` (`{event}`) | `stalwart_acme_order_completed_total` | ACME order completed |
| `acme.order-invalid` | `count` | `stalwart.acme.order_invalid` (`{event}`) | `stalwart_acme_order_invalid_total` | ACME order invalid |
| `acme.client-missing-sni` | `count` | `stalwart.acme.client_missing_sni` (`{event}`) | `stalwart_acme_client_missing_sni_total` | ACME client missing SNI |
| `acme.tls-alpn-error` | `count` | `stalwart.acme.tls_alpn_error` (`{event}`) | `stalwart_acme_tls_alpn_error_total` | ACME TLS ALPN error |
| `acme.token-not-found` | `count` | `stalwart.acme.token_not_found` (`{event}`) | `stalwart_acme_token_not_found_total` | ACME token not found |
| `acme.error` | `count` | `stalwart.acme.error` (`{event}`) | `stalwart_acme_error_total` | ACME error |


## Ai

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `ai.request-time` | `milliseconds` | `stalwart.ai.request_time` (`s`) | `stalwart_ai_request_time_seconds` | AI request duration |
| `ai.input-tokens` | `tokens` | `stalwart.ai.input_tokens` (`{token}`) | `stalwart_ai_input_tokens` | AI input tokens per request |
| `ai.output-tokens` | `tokens` | `stalwart.ai.output_tokens` (`{token}`) | `stalwart_ai_output_tokens` | AI output tokens per request |
| `ai.api-error` | `count` | `stalwart.ai.api_error` (`{event}`) | `stalwart_ai_api_error_total` | AI API error |
| `ai.request` | `count` | `stalwart.ai.request` (`{event}`) | `stalwart_ai_request_total` | AI request completed |
| `ai.spam-verdict` | `count` | `stalwart.ai.spam_verdict` (`{event}`) | `stalwart_ai_spam_verdict_total` | AI spam verdict |
| `ai.spam-skipped` | `count` | `stalwart.ai.spam_skipped` (`{event}`) | `stalwart_ai_spam_skipped_total` | AI spam classifier skipped |
| `ai.breaker-open` | `count` | `stalwart.ai.breaker_open` (`{event}`) | `stalwart_ai_breaker_open_total` | AI model circuit breaker open |


## Arc

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `arc.chain-invalid` | `count` | `stalwart.arc.chain_invalid` (`{event}`) | `stalwart_arc_chain_invalid_total` | ARC chain invalid |
| `arc.signature-invalid` | `count` | `stalwart.arc.signature_invalid` (`{event}`) | `stalwart_arc_signature_invalid_total` | ARC signature invalid |
| `arc.hash-mismatch` | `count` | `stalwart.arc.hash_mismatch` (`{event}`) | `stalwart_arc_hash_mismatch_total` | ARC body hash mismatch |


## Auth

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `auth.success` | `count` | `stalwart.auth.success` (`{event}`) | `stalwart_auth_success_total` | Authentication successful |
| `auth.failed` | `count` | `stalwart.auth.failed` (`{event}`) | `stalwart_auth_failed_total` | Authentication failed |
| `auth.too-many-attempts` | `count` | `stalwart.auth.too_many_attempts` (`{event}`) | `stalwart_auth_too_many_attempts_total` | Too many authentication attempts |
| `auth.error` | `count` | `stalwart.auth.error` (`{event}`) | `stalwart_auth_error_total` | Authentication error |


## Cache

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `cache.messages-size` | `bytes` | `stalwart.cache.messages_size` (`By`) | `stalwart_cache_messages_size_bytes` | Memory used by the e-mail data cache |
| `cache.messages-large-size` | `bytes` | `stalwart.cache.messages_large_size` (`By`) | `stalwart_cache_messages_large_size_bytes` | Total size of the large-account e-mail data caches held in memory, both those retained by the large tier and those still referenced by in-flight requests |
| `cache.size` | `bytes` | `stalwart.cache.size` (`By`) | `stalwart_cache_size_bytes` | Memory used by all other caches |
| `cache.swap-pending` | `snapshots` | `stalwart.cache.swap_pending` (`{snapshot}`) | `stalwart_cache_swap_pending` | Cache snapshots with changes not yet written to the swap tier |
| `cache.miss` | `count` | `stalwart.cache.miss` (`{event}`) | `stalwart_cache_miss_total` | Cache miss |
| `cache.hit` | `count` | `stalwart.cache.hit` (`{event}`) | `stalwart_cache_hit_total` | Cache hit |
| `cache.stale` | `count` | `stalwart.cache.stale` (`{event}`) | `stalwart_cache_stale_total` | Cache is stale |
| `cache.entry-too-large` | `count` | `stalwart.cache.entry_too_large` (`{event}`) | `stalwart_cache_entry_too_large_total` | Cache entry too large |
| `cache.swap-hit` | `count` | `stalwart.cache.swap_hit` (`{event}`) | `stalwart_cache_swap_hit_total` | Cache snapshot loaded |
| `cache.swap-miss` | `count` | `stalwart.cache.swap_miss` (`{event}`) | `stalwart_cache_swap_miss_total` | Cache snapshot unavailable |
| `cache.swap-write` | `count` | `stalwart.cache.swap_write` (`{event}`) | `stalwart_cache_swap_write_total` | Cache snapshot written |
| `cache.swap-error` | `count` | `stalwart.cache.swap_error` (`{event}`) | `stalwart_cache_swap_error_total` | Cache swap tier error |


## Calendar

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `calendar.alarm-sent` | `count` | `stalwart.calendar.alarm_sent` (`{event}`) | `stalwart_calendar_alarm_sent_total` | Calendar alarm sent |
| `calendar.alarm-failed` | `count` | `stalwart.calendar.alarm_failed` (`{event}`) | `stalwart_calendar_alarm_failed_total` | Calendar alarm could not be sent |
| `calendar.itip-message-sent` | `count` | `stalwart.calendar.itip_message_sent` (`{event}`) | `stalwart_calendar_itip_message_sent_total` | Calendar iTIP message sent |
| `calendar.itip-message-received` | `count` | `stalwart.calendar.itip_message_received` (`{event}`) | `stalwart_calendar_itip_message_received_total` | Calendar iTIP message received |
| `calendar.itip-message-error` | `count` | `stalwart.calendar.itip_message_error` (`{event}`) | `stalwart_calendar_itip_message_error_total` | iTIP message error |


## Cluster

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `cluster.subscriber-error` | `count` | `stalwart.cluster.subscriber_error` (`{event}`) | `stalwart_cluster_subscriber_error_total` | PubSub subscriber error |
| `cluster.subscriber-disconnected` | `count` | `stalwart.cluster.subscriber_disconnected` (`{event}`) | `stalwart_cluster_subscriber_disconnected_total` | PubSub subscriber disconnected |
| `cluster.publisher-error` | `count` | `stalwart.cluster.publisher_error` (`{event}`) | `stalwart_cluster_publisher_error_total` | PubSub publisher error |


## Dane

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `dane.authentication-success` | `count` | `stalwart.dane.authentication_success` (`{event}`) | `stalwart_dane_authentication_success_total` | DANE authentication successful |
| `dane.authentication-failure` | `count` | `stalwart.dane.authentication_failure` (`{event}`) | `stalwart_dane_authentication_failure_total` | DANE authentication failed |
| `dane.no-certificates-found` | `count` | `stalwart.dane.no_certificates_found` (`{event}`) | `stalwart_dane_no_certificates_found_total` | No certificates found for DANE |
| `dane.certificate-parse-error` | `count` | `stalwart.dane.certificate_parse_error` (`{event}`) | `stalwart_dane_certificate_parse_error_total` | Error parsing certificate for DANE |
| `dane.tlsa-record-fetch-error` | `count` | `stalwart.dane.tlsa_record_fetch_error` (`{event}`) | `stalwart_dane_tlsa_record_fetch_error_total` | Error fetching TLSA record |
| `dane.tlsa-record-not-found` | `count` | `stalwart.dane.tlsa_record_not_found` (`{event}`) | `stalwart_dane_tlsa_record_not_found_total` | TLSA record not found |
| `dane.tlsa-record-not-dnssec-signed` | `count` | `stalwart.dane.tlsa_record_not_dnssec_signed` (`{event}`) | `stalwart_dane_tlsa_record_not_dnssec_signed_total` | TLSA record not DNSSEC signed |
| `dane.tlsa-record-invalid` | `count` | `stalwart.dane.tlsa_record_invalid` (`{event}`) | `stalwart_dane_tlsa_record_invalid_total` | Invalid TLSA record |
| `dane.bogus-dnssec-record` | `count` | `stalwart.dane.bogus_dnssec_record` (`{event}`) | `stalwart_dane_bogus_dnssec_record_total` | Bogus DNSSEC record |


## Delivery

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `delivery.total-time` | `milliseconds` | `stalwart.delivery.total_time` (`s`) | `stalwart_delivery_total_time_seconds` | Total message delivery time from submission to delivery |
| `delivery.attempt-time` | `milliseconds` | `stalwart.delivery.attempt_time` (`s`) | `stalwart_delivery_attempt_time_seconds` | Message delivery time |
| `delivery.active-connections` | `connections` | `stalwart.delivery.active_connections` (`{connection}`) | `stalwart_delivery_active_connections` | Active delivery connections |
| `delivery.attempt-start` | `count` | `stalwart.delivery.attempt_start` (`{event}`) | `stalwart_delivery_attempt_start_total` | Delivery attempt started |
| `delivery.attempt-end` | `count` | `stalwart.delivery.attempt_end` (`{event}`) | `stalwart_delivery_attempt_end_total` | Delivery attempt ended |
| `delivery.completed` | `count` | `stalwart.delivery.completed` (`{event}`) | `stalwart_delivery_completed_total` | Delivery completed |
| `delivery.mx-lookup-failed` | `count` | `stalwart.delivery.mx_lookup_failed` (`{event}`) | `stalwart_delivery_mx_lookup_failed_total` | MX record lookup failed |
| `delivery.ip-lookup-failed` | `count` | `stalwart.delivery.ip_lookup_failed` (`{event}`) | `stalwart_delivery_ip_lookup_failed_total` | IP address lookup failed |
| `delivery.null-mx` | `count` | `stalwart.delivery.null_mx` (`{event}`) | `stalwart_delivery_null_mx_total` | Null MX record found |
| `delivery.greeting-failed` | `count` | `stalwart.delivery.greeting_failed` (`{event}`) | `stalwart_delivery_greeting_failed_total` | SMTP greeting failed |
| `delivery.ehlo-rejected` | `count` | `stalwart.delivery.ehlo_rejected` (`{event}`) | `stalwart_delivery_ehlo_rejected_total` | SMTP EHLO rejected |
| `delivery.auth-failed` | `count` | `stalwart.delivery.auth_failed` (`{event}`) | `stalwart_delivery_auth_failed_total` | SMTP authentication failed |
| `delivery.mail-from-rejected` | `count` | `stalwart.delivery.mail_from_rejected` (`{event}`) | `stalwart_delivery_mail_from_rejected_total` | SMTP MAIL FROM rejected |
| `delivery.delivered` | `count` | `stalwart.delivery.delivered` (`{event}`) | `stalwart_delivery_delivered_total` | Message delivered |
| `delivery.rcpt-to-rejected` | `count` | `stalwart.delivery.rcpt_to_rejected` (`{event}`) | `stalwart_delivery_rcpt_to_rejected_total` | SMTP RCPT TO rejected |
| `delivery.rcpt-to-failed` | `count` | `stalwart.delivery.rcpt_to_failed` (`{event}`) | `stalwart_delivery_rcpt_to_failed_total` | SMTP RCPT TO failed |
| `delivery.message-rejected` | `count` | `stalwart.delivery.message_rejected` (`{event}`) | `stalwart_delivery_message_rejected_total` | Message rejected by remote server |
| `delivery.start-tls-unavailable` | `count` | `stalwart.delivery.start_tls_unavailable` (`{event}`) | `stalwart_delivery_start_tls_unavailable_total` | STARTTLS unavailable |
| `delivery.start-tls-error` | `count` | `stalwart.delivery.start_tls_error` (`{event}`) | `stalwart_delivery_start_tls_error_total` | STARTTLS error |
| `delivery.start-tls-disabled` | `count` | `stalwart.delivery.start_tls_disabled` (`{event}`) | `stalwart_delivery_start_tls_disabled_total` | STARTTLS disabled |
| `delivery.implicit-tls-error` | `count` | `stalwart.delivery.implicit_tls_error` (`{event}`) | `stalwart_delivery_implicit_tls_error_total` | Implicit TLS error |
| `delivery.concurrency-limit-exceeded` | `count` | `stalwart.delivery.concurrency_limit_exceeded` (`{event}`) | `stalwart_delivery_concurrency_limit_exceeded_total` | Concurrency limit exceeded |
| `delivery.rate-limit-exceeded` | `count` | `stalwart.delivery.rate_limit_exceeded` (`{event}`) | `stalwart_delivery_rate_limit_exceeded_total` | Rate limit exceeded |
| `delivery.double-bounce` | `count` | `stalwart.delivery.double_bounce` (`{event}`) | `stalwart_delivery_double_bounce_total` | Discarding message after double bounce |
| `delivery.dsn-success` | `count` | `stalwart.delivery.dsn_success` (`{event}`) | `stalwart_delivery_dsn_success_total` | DSN success notification |
| `delivery.dsn-temp-fail` | `count` | `stalwart.delivery.dsn_temp_fail` (`{event}`) | `stalwart_delivery_dsn_temp_fail_total` | DSN temporary failure notification |
| `delivery.dsn-perm-fail` | `count` | `stalwart.delivery.dsn_perm_fail` (`{event}`) | `stalwart_delivery_dsn_perm_fail_total` | DSN permanent failure notification |


## Dkim

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `dkim.pass` | `count` | `stalwart.dkim.pass` (`{event}`) | `stalwart_dkim_pass_total` | DKIM verification passed |
| `dkim.neutral` | `count` | `stalwart.dkim.neutral` (`{event}`) | `stalwart_dkim_neutral_total` | DKIM verification neutral |
| `dkim.fail` | `count` | `stalwart.dkim.fail` (`{event}`) | `stalwart_dkim_fail_total` | DKIM verification failed |
| `dkim.perm-error` | `count` | `stalwart.dkim.perm_error` (`{event}`) | `stalwart_dkim_perm_error_total` | DKIM permanent error |
| `dkim.temp-error` | `count` | `stalwart.dkim.temp_error` (`{event}`) | `stalwart_dkim_temp_error_total` | DKIM temporary error |
| `dkim.none` | `count` | `stalwart.dkim.none` (`{event}`) | `stalwart_dkim_none_total` | No DKIM signature |
| `dkim.signature-invalid` | `count` | `stalwart.dkim.signature_invalid` (`{event}`) | `stalwart_dkim_signature_invalid_total` | DKIM signature invalid |
| `dkim.public-key-error` | `count` | `stalwart.dkim.public_key_error` (`{event}`) | `stalwart_dkim_public_key_error_total` | DKIM public key error |
| `dkim.verification-failed` | `count` | `stalwart.dkim.verification_failed` (`{event}`) | `stalwart_dkim_verification_failed_total` | DKIM signature verification failed |
| `dkim.hash-mismatch` | `count` | `stalwart.dkim.hash_mismatch` (`{event}`) | `stalwart_dkim_hash_mismatch_total` | DKIM body hash mismatch |
| `dkim.signer-not-found` | `count` | `stalwart.dkim.signer_not_found` (`{event}`) | `stalwart_dkim_signer_not_found_total` | DKIM signer not found |


## Dkim2

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `dkim2.instance-invalid` | `count` | `stalwart.dkim2.instance_invalid` (`{event}`) | `stalwart_dkim2_instance_invalid_total` | DKIM2 Message-Instance invalid |
| `dkim2.signature-invalid` | `count` | `stalwart.dkim2.signature_invalid` (`{event}`) | `stalwart_dkim2_signature_invalid_total` | DKIM2 signature invalid |
| `dkim2.chain-invalid` | `count` | `stalwart.dkim2.chain_invalid` (`{event}`) | `stalwart_dkim2_chain_invalid_total` | DKIM2 chain invalid |
| `dkim2.timestamp-invalid` | `count` | `stalwart.dkim2.timestamp_invalid` (`{event}`) | `stalwart_dkim2_timestamp_invalid_total` | DKIM2 timestamp invalid |
| `dkim2.envelope-mismatch` | `count` | `stalwart.dkim2.envelope_mismatch` (`{event}`) | `stalwart_dkim2_envelope_mismatch_total` | DKIM2 envelope mismatch |
| `dkim2.custody-broken` | `count` | `stalwart.dkim2.custody_broken` (`{event}`) | `stalwart_dkim2_custody_broken_total` | DKIM2 chain of custody broken |
| `dkim2.public-key-error` | `count` | `stalwart.dkim2.public_key_error` (`{event}`) | `stalwart_dkim2_public_key_error_total` | DKIM2 public key error |
| `dkim2.verification-failed` | `count` | `stalwart.dkim2.verification_failed` (`{event}`) | `stalwart_dkim2_verification_failed_total` | DKIM2 signature verification failed |
| `dkim2.hash-mismatch` | `count` | `stalwart.dkim2.hash_mismatch` (`{event}`) | `stalwart_dkim2_hash_mismatch_total` | DKIM2 hash mismatch |
| `dkim2.recipe-error` | `count` | `stalwart.dkim2.recipe_error` (`{event}`) | `stalwart_dkim2_recipe_error_total` | DKIM2 recipe error |
| `dkim2.signing-failed` | `count` | `stalwart.dkim2.signing_failed` (`{event}`) | `stalwart_dkim2_signing_failed_total` | DKIM2 signing failed |


## Dmarc

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `dmarc.pass` | `count` | `stalwart.dmarc.pass` (`{event}`) | `stalwart_dmarc_pass_total` | DMARC check passed |
| `dmarc.fail` | `count` | `stalwart.dmarc.fail` (`{event}`) | `stalwart_dmarc_fail_total` | DMARC check failed |
| `dmarc.perm-error` | `count` | `stalwart.dmarc.perm_error` (`{event}`) | `stalwart_dmarc_perm_error_total` | DMARC permanent error |
| `dmarc.temp-error` | `count` | `stalwart.dmarc.temp_error` (`{event}`) | `stalwart_dmarc_temp_error_total` | DMARC temporary error |
| `dmarc.none` | `count` | `stalwart.dmarc.none` (`{event}`) | `stalwart_dmarc_none_total` | No DMARC record |


## Dns

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `dns.lookup-time` | `milliseconds` | `stalwart.dns.lookup_time` (`s`) | `stalwart_dns_lookup_time_seconds` | DNS lookup time |
| `dns.record-creation-failed` | `count` | `stalwart.dns.record_creation_failed` (`{event}`) | `stalwart_dns_record_creation_failed_total` | DNS record creation failed |
| `dns.record-deletion-failed` | `count` | `stalwart.dns.record_deletion_failed` (`{event}`) | `stalwart_dns_record_deletion_failed_total` | DNS record deletion failed |
| `dns.record-lookup-failed` | `count` | `stalwart.dns.record_lookup_failed` (`{event}`) | `stalwart_dns_record_lookup_failed_total` | DNS record lookup failed |
| `dns.record-propagation-timeout` | `count` | `stalwart.dns.record_propagation_timeout` (`{event}`) | `stalwart_dns_record_propagation_timeout_total` | DNS record propagation timeout |


## Domain

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `domain.count` | `domains` | `stalwart.domains` (`{domain}`) | `stalwart_domains` | Total number of domains |


## Eval

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `eval.error` | `count` | `stalwart.eval.error` (`{event}`) | `stalwart_eval_error_total` | Expression evaluation error |
| `eval.directory-not-found` | `count` | `stalwart.eval.directory_not_found` (`{event}`) | `stalwart_eval_directory_not_found_total` | Directory not found while evaluating expression |
| `eval.store-not-found` | `count` | `stalwart.eval.store_not_found` (`{event}`) | `stalwart_eval_store_not_found_total` | Store not found while evaluating expression |


## Http

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `http.request-time` | `milliseconds` | `stalwart.http.request_time` (`s`) | `stalwart_http_request_time_seconds` | HTTP connection duration |
| `http.active-connections` | `connections` | `stalwart.http.active_connections` (`{connection}`) | `stalwart_http_active_connections` | Active HTTP connections |
| `http.connection-start` | `count` | `stalwart.http.connection_start` (`{event}`) | `stalwart_http_connection_start_total` | HTTP connection started |
| `http.error` | `count` | `stalwart.http.error` (`{event}`) | `stalwart_http_error_total` | HTTP error occurred |
| `http.request-body` | `count` | `stalwart.http.request_body` (`{event}`) | `stalwart_http_request_body_total` | HTTP request body |
| `http.response-body` | `count` | `stalwart.http.response_body` (`{event}`) | `stalwart_http_response_body_total` | HTTP response body |
| `http.x-forwarded-missing` | `count` | `stalwart.http.x_forwarded_missing` (`{event}`) | `stalwart_http_x_forwarded_missing_total` | X-Forwarded-For header is missing |
| `http.x-forwarded-invalid` | `count` | `stalwart.http.x_forwarded_invalid` (`{event}`) | `stalwart_http_x_forwarded_invalid_total` | Invalid forwarding header |


## Imap

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `imap.request-time` | `milliseconds` | `stalwart.imap.request_time` (`s`) | `stalwart_imap_request_time_seconds` | IMAP connection duration |
| `imap.active-connections` | `connections` | `stalwart.imap.active_connections` (`{connection}`) | `stalwart_imap_active_connections` | Active IMAP connections |
| `imap.connection-start` | `count` | `stalwart.imap.connection_start` (`{event}`) | `stalwart_imap_connection_start_total` | IMAP connection started |
| `imap.connection-end` | `count` | `stalwart.imap.connection_end` (`{event}`) | `stalwart_imap_connection_end_total` | IMAP connection ended |


## IncomingReport

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `incoming-report.dmarc-report` | `count` | `stalwart.incoming_report.dmarc_report` (`{event}`) | `stalwart_incoming_report_dmarc_report_total` | DMARC report received |
| `incoming-report.dmarc-report-with-warnings` | `count` | `stalwart.incoming_report.dmarc_report_with_warnings` (`{event}`) | `stalwart_incoming_report_dmarc_report_with_warnings_total` | DMARC report received with warnings |
| `incoming-report.tls-report` | `count` | `stalwart.incoming_report.tls_report` (`{event}`) | `stalwart_incoming_report_tls_report_total` | TLS report received |
| `incoming-report.tls-report-with-warnings` | `count` | `stalwart.incoming_report.tls_report_with_warnings` (`{event}`) | `stalwart_incoming_report_tls_report_with_warnings_total` | TLS report received with warnings |
| `incoming-report.abuse-report` | `count` | `stalwart.incoming_report.abuse_report` (`{event}`) | `stalwart_incoming_report_abuse_report_total` | Abuse report received |
| `incoming-report.auth-failure-report` | `count` | `stalwart.incoming_report.auth_failure_report` (`{event}`) | `stalwart_incoming_report_auth_failure_report_total` | Authentication failure report received |
| `incoming-report.fraud-report` | `count` | `stalwart.incoming_report.fraud_report` (`{event}`) | `stalwart_incoming_report_fraud_report_total` | Fraud report received |
| `incoming-report.not-spam-report` | `count` | `stalwart.incoming_report.not_spam_report` (`{event}`) | `stalwart_incoming_report_not_spam_report_total` | Not spam report received |
| `incoming-report.virus-report` | `count` | `stalwart.incoming_report.virus_report` (`{event}`) | `stalwart_incoming_report_virus_report_total` | Virus report received |
| `incoming-report.other-report` | `count` | `stalwart.incoming_report.other_report` (`{event}`) | `stalwart_incoming_report_other_report_total` | Other type of report received |
| `incoming-report.message-parse-failed` | `count` | `stalwart.incoming_report.message_parse_failed` (`{event}`) | `stalwart_incoming_report_message_parse_failed_total` | Failed to parse incoming report message |
| `incoming-report.dmarc-parse-failed` | `count` | `stalwart.incoming_report.dmarc_parse_failed` (`{event}`) | `stalwart_incoming_report_dmarc_parse_failed_total` | Failed to parse DMARC report |
| `incoming-report.tls-rpc-parse-failed` | `count` | `stalwart.incoming_report.tls_rpc_parse_failed` (`{event}`) | `stalwart_incoming_report_tls_rpc_parse_failed_total` | Failed to parse TLS RPC report |
| `incoming-report.arf-parse-failed` | `count` | `stalwart.incoming_report.arf_parse_failed` (`{event}`) | `stalwart_incoming_report_arf_parse_failed_total` | Failed to parse ARF report |
| `incoming-report.decompress-error` | `count` | `stalwart.incoming_report.decompress_error` (`{event}`) | `stalwart_incoming_report_decompress_error_total` | Error decompressing report |


## Iprev

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `iprev.pass` | `count` | `stalwart.iprev.pass` (`{event}`) | `stalwart_iprev_pass_total` | IPREV check passed |
| `iprev.fail` | `count` | `stalwart.iprev.fail` (`{event}`) | `stalwart_iprev_fail_total` | IPREV check failed |
| `iprev.perm-error` | `count` | `stalwart.iprev.perm_error` (`{event}`) | `stalwart_iprev_perm_error_total` | IPREV permanent error |
| `iprev.temp-error` | `count` | `stalwart.iprev.temp_error` (`{event}`) | `stalwart_iprev_temp_error_total` | IPREV temporary error |
| `iprev.none` | `count` | `stalwart.iprev.none` (`{event}`) | `stalwart_iprev_none_total` | No IPREV record |


## Jmap

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `jmap.method-call` | `count` | `stalwart.jmap.method_call` (`{event}`) | `stalwart_jmap_method_call_total` | JMAP method call |
| `jmap.invalid-arguments` | `count` | `stalwart.jmap.invalid_arguments` (`{event}`) | `stalwart_jmap_invalid_arguments_total` | Invalid JMAP arguments |
| `jmap.request-too-large` | `count` | `stalwart.jmap.request_too_large` (`{event}`) | `stalwart_jmap_request_too_large_total` | JMAP request too large |
| `jmap.unsupported-filter` | `count` | `stalwart.jmap.unsupported_filter` (`{event}`) | `stalwart_jmap_unsupported_filter_total` | Unsupported JMAP filter |
| `jmap.unsupported-sort` | `count` | `stalwart.jmap.unsupported_sort` (`{event}`) | `stalwart_jmap_unsupported_sort_total` | Unsupported JMAP sort |
| `jmap.unknown-method` | `count` | `stalwart.jmap.unknown_method` (`{event}`) | `stalwart_jmap_unknown_method_total` | Unknown JMAP method |
| `jmap.forbidden` | `count` | `stalwart.jmap.forbidden` (`{event}`) | `stalwart_jmap_forbidden_total` | JMAP operation forbidden |
| `jmap.not-json` | `count` | `stalwart.jmap.not_json` (`{event}`) | `stalwart_jmap_not_json_total` | JMAP request is not JSON |
| `jmap.not-request` | `count` | `stalwart.jmap.not_request` (`{event}`) | `stalwart_jmap_not_request_total` | JMAP input is not a request |
| `jmap.websocket-start` | `count` | `stalwart.jmap.websocket_start` (`{event}`) | `stalwart_jmap_websocket_start_total` | JMAP WebSocket connection started |
| `jmap.websocket-error` | `count` | `stalwart.jmap.websocket_error` (`{event}`) | `stalwart_jmap_websocket_error_total` | JMAP WebSocket error |


## Limit

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `limit.size-request` | `count` | `stalwart.limit.size_request` (`{event}`) | `stalwart_limit_size_request_total` | Request size limit reached |
| `limit.size-upload` | `count` | `stalwart.limit.size_upload` (`{event}`) | `stalwart_limit_size_upload_total` | Upload size limit reached |
| `limit.calls-in` | `count` | `stalwart.limit.calls_in` (`{event}`) | `stalwart_limit_calls_in_total` | Incoming calls limit reached |
| `limit.concurrent-request` | `count` | `stalwart.limit.concurrent_request` (`{event}`) | `stalwart_limit_concurrent_request_total` | Concurrent request limit reached |
| `limit.concurrent-upload` | `count` | `stalwart.limit.concurrent_upload` (`{event}`) | `stalwart_limit_concurrent_upload_total` | Concurrent upload limit reached |
| `limit.concurrent-connection` | `count` | `stalwart.limit.concurrent_connection` (`{event}`) | `stalwart_limit_concurrent_connection_total` | Concurrent connection limit reached |
| `limit.quota` | `count` | `stalwart.limit.quota` (`{event}`) | `stalwart_limit_quota_total` | Quota limit reached |
| `limit.blob-quota` | `count` | `stalwart.limit.blob_quota` (`{event}`) | `stalwart_limit_blob_quota_total` | Blob quota limit reached |
| `limit.tenant-quota` | `count` | `stalwart.limit.tenant_quota` (`{event}`) | `stalwart_limit_tenant_quota_total` | Tenant quota limit reached |
| `limit.too-many-requests` | `count` | `stalwart.limit.too_many_requests` (`{event}`) | `stalwart_limit_too_many_requests_total` | Too many requests |
| `limit.memory-budget` | `count` | `stalwart.limit.memory_budget` (`{event}`) | `stalwart_limit_memory_budget_total` | Memory budget exceeded |


## MailAuth

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `mail-auth.parse-error` | `count` | `stalwart.mail_auth.parse_error` (`{event}`) | `stalwart_mail_auth_parse_error_total` | Mail authentication parse error |
| `mail-auth.missing-parameters` | `count` | `stalwart.mail_auth.missing_parameters` (`{event}`) | `stalwart_mail_auth_missing_parameters_total` | Missing mail authentication parameters |
| `mail-auth.no-headers-found` | `count` | `stalwart.mail_auth.no_headers_found` (`{event}`) | `stalwart_mail_auth_no_headers_found_total` | No headers found in message |
| `mail-auth.crypto` | `count` | `stalwart.mail_auth.crypto` (`{event}`) | `stalwart_mail_auth_crypto_total` | Crypto error during mail authentication |
| `mail-auth.io` | `count` | `stalwart.mail_auth.io` (`{event}`) | `stalwart_mail_auth_io_total` | I/O error during mail authentication |
| `mail-auth.base64` | `count` | `stalwart.mail_auth.base64` (`{event}`) | `stalwart_mail_auth_base64_total` | Base64 error during mail authentication |
| `mail-auth.dns-error` | `count` | `stalwart.mail_auth.dns_error` (`{event}`) | `stalwart_mail_auth_dns_error_total` | DNS error |
| `mail-auth.dns-record-not-found` | `count` | `stalwart.mail_auth.dns_record_not_found` (`{event}`) | `stalwart_mail_auth_dns_record_not_found_total` | DNS record not found |
| `mail-auth.dns-invalid-record-type` | `count` | `stalwart.mail_auth.dns_invalid_record_type` (`{event}`) | `stalwart_mail_auth_dns_invalid_record_type_total` | Invalid DNS record type |
| `mail-auth.policy-not-aligned` | `count` | `stalwart.mail_auth.policy_not_aligned` (`{event}`) | `stalwart_mail_auth_policy_not_aligned_total` | Policy not aligned |


## ManageSieve

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `manage-sieve.connection-start` | `count` | `stalwart.manage_sieve.connection_start` (`{event}`) | `stalwart_manage_sieve_connection_start_total` | ManageSieve connection started |
| `manage-sieve.connection-end` | `count` | `stalwart.manage_sieve.connection_end` (`{event}`) | `stalwart_manage_sieve_connection_end_total` | ManageSieve connection ended |


## Message

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `message.size` | `bytes` | `stalwart.message.size` (`By`) | `stalwart_message_size_bytes` | Received message size |
| `message.authenticated-size` | `bytes` | `stalwart.message.authenticated_size` (`By`) | `stalwart_message_authenticated_size_bytes` | Received message size from authenticated users |


## MessageIngest

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `message-ingest.time` | `milliseconds` | `stalwart.message_ingest.time` (`s`) | `stalwart_message_ingest_time_seconds` | Message ingestion time |
| `message-ingest.ham` | `count` | `stalwart.message_ingest.ham` (`{event}`) | `stalwart_message_ingest_ham_total` | Message ingested |
| `message-ingest.spam` | `count` | `stalwart.message_ingest.spam` (`{event}`) | `stalwart_message_ingest_spam_total` | Possible spam message ingested |
| `message-ingest.imap-append` | `count` | `stalwart.message_ingest.imap_append` (`{event}`) | `stalwart_message_ingest_imap_append_total` | Message appended via IMAP |
| `message-ingest.jmap-append` | `count` | `stalwart.message_ingest.jmap_append` (`{event}`) | `stalwart_message_ingest_jmap_append_total` | Message appended via JMAP |
| `message-ingest.duplicate` | `count` | `stalwart.message_ingest.duplicate` (`{event}`) | `stalwart_message_ingest_duplicate_total` | Skipping duplicate message |
| `message-ingest.error` | `count` | `stalwart.message_ingest.error` (`{event}`) | `stalwart_message_ingest_error_total` | Message ingestion error |


## Milter

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `milter.action-accept` | `count` | `stalwart.milter.action_accept` (`{event}`) | `stalwart_milter_action_accept_total` | Milter action: Accept |
| `milter.action-discard` | `count` | `stalwart.milter.action_discard` (`{event}`) | `stalwart_milter_action_discard_total` | Milter action: Discard |
| `milter.action-reject` | `count` | `stalwart.milter.action_reject` (`{event}`) | `stalwart_milter_action_reject_total` | Milter action: Reject |
| `milter.action-temp-fail` | `count` | `stalwart.milter.action_temp_fail` (`{event}`) | `stalwart_milter_action_temp_fail_total` | Milter action: Temporary failure |
| `milter.action-reply-code` | `count` | `stalwart.milter.action_reply_code` (`{event}`) | `stalwart_milter_action_reply_code_total` | Milter action: Reply code |
| `milter.action-connection-failure` | `count` | `stalwart.milter.action_connection_failure` (`{event}`) | `stalwart_milter_action_connection_failure_total` | Milter action: Connection failure |
| `milter.action-shutdown` | `count` | `stalwart.milter.action_shutdown` (`{event}`) | `stalwart_milter_action_shutdown_total` | Milter action: Shutdown |


## MtaHook

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `mta-hook.action-accept` | `count` | `stalwart.mta_hook.action_accept` (`{event}`) | `stalwart_mta_hook_action_accept_total` | MTA hook action: Accept |
| `mta-hook.action-discard` | `count` | `stalwart.mta_hook.action_discard` (`{event}`) | `stalwart_mta_hook_action_discard_total` | MTA hook action: Discard |
| `mta-hook.action-reject` | `count` | `stalwart.mta_hook.action_reject` (`{event}`) | `stalwart_mta_hook_action_reject_total` | MTA hook action: Reject |
| `mta-hook.action-quarantine` | `count` | `stalwart.mta_hook.action_quarantine` (`{event}`) | `stalwart_mta_hook_action_quarantine_total` | MTA hook action: Quarantine |
| `mta-hook.error` | `count` | `stalwart.mta_hook.error` (`{event}`) | `stalwart_mta_hook_error_total` | MTA hook error |


## MtaSts

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `mta-sts.authorized` | `count` | `stalwart.mta_sts.authorized` (`{event}`) | `stalwart_mta_sts_authorized_total` | Host authorized by MTA-STS policy |
| `mta-sts.not-authorized` | `count` | `stalwart.mta_sts.not_authorized` (`{event}`) | `stalwart_mta_sts_not_authorized_total` | Host not authorized by MTA-STS policy |
| `mta-sts.invalid-policy` | `count` | `stalwart.mta_sts.invalid_policy` (`{event}`) | `stalwart_mta_sts_invalid_policy_total` | Invalid MTA-STS policy |


## Network

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `network.timeout` | `count` | `stalwart.network.timeout` (`{event}`) | `stalwart_network_timeout_total` | Network timeout |


## OutgoingReport

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `outgoing-report.size` | `bytes` | `stalwart.outgoing_report.size` (`By`) | `stalwart_outgoing_report_size_bytes` | Outgoing report size |
| `outgoing-report.spf-report` | `count` | `stalwart.outgoing_report.spf_report` (`{event}`) | `stalwart_outgoing_report_spf_report_total` | SPF report sent |
| `outgoing-report.spf-rate-limited` | `count` | `stalwart.outgoing_report.spf_rate_limited` (`{event}`) | `stalwart_outgoing_report_spf_rate_limited_total` | SPF report rate limited |
| `outgoing-report.dkim-report` | `count` | `stalwart.outgoing_report.dkim_report` (`{event}`) | `stalwart_outgoing_report_dkim_report_total` | DKIM report sent |
| `outgoing-report.dkim-rate-limited` | `count` | `stalwart.outgoing_report.dkim_rate_limited` (`{event}`) | `stalwart_outgoing_report_dkim_rate_limited_total` | DKIM report rate limited |
| `outgoing-report.dmarc-report` | `count` | `stalwart.outgoing_report.dmarc_report` (`{event}`) | `stalwart_outgoing_report_dmarc_report_total` | DMARC report sent |
| `outgoing-report.dmarc-rate-limited` | `count` | `stalwart.outgoing_report.dmarc_rate_limited` (`{event}`) | `stalwart_outgoing_report_dmarc_rate_limited_total` | DMARC report rate limited |
| `outgoing-report.dmarc-aggregate-report` | `count` | `stalwart.outgoing_report.dmarc_aggregate_report` (`{event}`) | `stalwart_outgoing_report_dmarc_aggregate_report_total` | DMARC aggregate is being prepared |
| `outgoing-report.tls-aggregate` | `count` | `stalwart.outgoing_report.tls_aggregate` (`{event}`) | `stalwart_outgoing_report_tls_aggregate_total` | TLS aggregate report is being prepared |
| `outgoing-report.http-submission` | `count` | `stalwart.outgoing_report.http_submission` (`{event}`) | `stalwart_outgoing_report_http_submission_total` | Report submitted via HTTP |
| `outgoing-report.unauthorized-reporting-address` | `count` | `stalwart.outgoing_report.unauthorized_reporting_address` (`{event}`) | `stalwart_outgoing_report_unauthorized_reporting_address_total` | Unauthorized reporting address |
| `outgoing-report.reporting-address-validation-error` | `count` | `stalwart.outgoing_report.reporting_address_validation_error` (`{event}`) | `stalwart_outgoing_report_reporting_address_validation_error_total` | Error validating reporting address |
| `outgoing-report.not-found` | `count` | `stalwart.outgoing_report.not_found` (`{event}`) | `stalwart_outgoing_report_not_found_total` | Report not found |
| `outgoing-report.submission-error` | `count` | `stalwart.outgoing_report.submission_error` (`{event}`) | `stalwart_outgoing_report_submission_error_total` | Error submitting report |
| `outgoing-report.no-recipients-found` | `count` | `stalwart.outgoing_report.no_recipients_found` (`{event}`) | `stalwart_outgoing_report_no_recipients_found_total` | No recipients found for report |


## Pop3

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `pop3.request-time` | `milliseconds` | `stalwart.pop3.request_time` (`s`) | `stalwart_pop3_request_time_seconds` | POP3 connection duration |
| `pop3.active-connections` | `connections` | `stalwart.pop3.active_connections` (`{connection}`) | `stalwart_pop3_active_connections` | Active POP3 connections |
| `pop3.connection-start` | `count` | `stalwart.pop3.connection_start` (`{event}`) | `stalwart_pop3_connection_start_total` | POP3 connection started |
| `pop3.connection-end` | `count` | `stalwart.pop3.connection_end` (`{event}`) | `stalwart_pop3_connection_end_total` | POP3 connection ended |


## PushSubscription

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `push-subscription.success` | `count` | `stalwart.push_subscription.success` (`{event}`) | `stalwart_push_subscription_success_total` | Push subscription successful |
| `push-subscription.error` | `count` | `stalwart.push_subscription.error` (`{event}`) | `stalwart_push_subscription_error_total` | Push subscription error |
| `push-subscription.not-found` | `count` | `stalwart.push_subscription.not_found` (`{event}`) | `stalwart_push_subscription_not_found_total` | Push subscription not found |


## Queue

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `queue.count` | `messages` | `stalwart.queue.messages` (`{message}`) | `stalwart_queue_messages` | Total number of messages in the queue |
| `queue.message-queued` | `count` | `stalwart.queue.message_queued` (`{event}`) | `stalwart_queue_message_queued_total` | Queued message for delivery |
| `queue.authenticated-message-queued` | `count` | `stalwart.queue.authenticated_message_queued` (`{event}`) | `stalwart_queue_authenticated_message_queued_total` | Queued message submission for delivery |
| `queue.report-queued` | `count` | `stalwart.queue.report_queued` (`{event}`) | `stalwart_queue_report_queued_total` | Queued report for delivery |
| `queue.dsn-queued` | `count` | `stalwart.queue.dsn_queued` (`{event}`) | `stalwart_queue_dsn_queued_total` | Queued DSN for delivery |
| `queue.autogenerated-queued` | `count` | `stalwart.queue.autogenerated_queued` (`{event}`) | `stalwart_queue_autogenerated_queued_total` | Queued autogenerated message for delivery |
| `queue.rescheduled` | `count` | `stalwart.queue.rescheduled` (`{event}`) | `stalwart_queue_rescheduled_total` | Message rescheduled for delivery |
| `queue.blob-not-found` | `count` | `stalwart.queue.blob_not_found` (`{event}`) | `stalwart_queue_blob_not_found_total` | Message blob not found |
| `queue.rate-limit-exceeded` | `count` | `stalwart.queue.rate_limit_exceeded` (`{event}`) | `stalwart_queue_rate_limit_exceeded_total` | Rate limit exceeded |
| `queue.concurrency-limit-exceeded` | `count` | `stalwart.queue.concurrency_limit_exceeded` (`{event}`) | `stalwart_queue_concurrency_limit_exceeded_total` | Concurrency limit exceeded |
| `queue.quota-exceeded` | `count` | `stalwart.queue.quota_exceeded` (`{event}`) | `stalwart_queue_quota_exceeded_total` | Quota exceeded |
| `queue.back-pressure` | `count` | `stalwart.queue.back_pressure` (`{event}`) | `stalwart_queue_back_pressure_total` | Queue backpressure detected |


## Resource

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `resource.not-found` | `count` | `stalwart.resource.not_found` (`{event}`) | `stalwart_resource_not_found_total` | Resource not found |
| `resource.bad-parameters` | `count` | `stalwart.resource.bad_parameters` (`{event}`) | `stalwart_resource_bad_parameters_total` | Bad resource parameters |
| `resource.error` | `count` | `stalwart.resource.error` (`{event}`) | `stalwart_resource_error_total` | Resource error |


## SearchIndex

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `search-index.index-time` | `milliseconds` | `stalwart.search_index.index_time` (`s`) | `stalwart_search_index_index_time_seconds` | Time to build and write one batch of documents to the full-text index |
| `search-index.pending-email` | `documents` | `stalwart.search_index.pending_email` (`{document}`) | `stalwart_search_index_pending_email` | E-mail messages waiting to be indexed |
| `search-index.pending-calendar` | `documents` | `stalwart.search_index.pending_calendar` (`{document}`) | `stalwart_search_index_pending_calendar` | Calendar events waiting to be indexed |
| `search-index.pending-contacts` | `documents` | `stalwart.search_index.pending_contacts` (`{document}`) | `stalwart_search_index_pending_contacts` | Contacts waiting to be indexed |
| `search-index.pending-file` | `documents` | `stalwart.search_index.pending_file` (`{document}`) | `stalwart_search_index_pending_file` | Files waiting to be indexed |
| `search-index.pending-tracing` | `documents` | `stalwart.search_index.pending_tracing` (`{document}`) | `stalwart_search_index_pending_tracing` | Traces waiting to be indexed |
| `search-index.partition-retry` | `count` | `stalwart.search_index.partition_retry` (`{event}`) | `stalwart_search_index_partition_retry_total` | Index partition will be retried |
| `search-index.batch-indexed` | `count` | `stalwart.search_index.batch_indexed` (`{event}`) | `stalwart_search_index_batch_indexed_total` | Search index batch written |
| `search-index.document-truncated` | `count` | `stalwart.search_index.document_truncated` (`{event}`) | `stalwart_search_index_document_truncated_total` | Search document truncated |


## Security

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `security.authentication-ban` | `count` | `stalwart.security.authentication_ban` (`{event}`) | `stalwart_security_authentication_ban_total` | Banned due to authentication errors |
| `security.abuse-ban` | `count` | `stalwart.security.abuse_ban` (`{event}`) | `stalwart_security_abuse_ban_total` | Banned due to abuse |
| `security.scan-ban` | `count` | `stalwart.security.scan_ban` (`{event}`) | `stalwart_security_scan_ban_total` | Banned due to scan |
| `security.loiter-ban` | `count` | `stalwart.security.loiter_ban` (`{event}`) | `stalwart_security_loiter_ban_total` | Banned due to loitering |
| `security.ip-blocked` | `count` | `stalwart.security.ip_blocked` (`{event}`) | `stalwart_security_ip_blocked_total` | Blocked IP address |
| `security.unauthorized` | `count` | `stalwart.security.unauthorized` (`{event}`) | `stalwart_security_unauthorized_total` | Unauthorized access |


## Server

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `server.memory` | `bytes` | `stalwart.server.memory` (`By`) | `stalwart_server_memory_bytes` | Server memory usage |
| `server.buffered-memory-smtp` | `bytes` | `stalwart.server.buffered_memory_smtp` (`By`) | `stalwart_server_buffered_memory_smtp_bytes` | Memory reserved for buffering inbound SMTP messages |
| `server.buffered-memory-read` | `bytes` | `stalwart.server.buffered_memory_read` (`By`) | `stalwart_server_buffered_memory_read_bytes` | Memory reserved for blobs read from the blob store |
| `server.thread-error` | `count` | `stalwart.server.thread_error` (`{event}`) | `stalwart_server_thread_error_total` | Server thread error |


## Sieve

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `sieve.request-time` | `milliseconds` | `stalwart.sieve.request_time` (`s`) | `stalwart_sieve_request_time_seconds` | ManageSieve connection duration |
| `sieve.active-connections` | `connections` | `stalwart.sieve.active_connections` (`{connection}`) | `stalwart_sieve_active_connections` | Active ManageSieve connections |
| `sieve.action-accept` | `count` | `stalwart.sieve.action_accept` (`{event}`) | `stalwart_sieve_action_accept_total` | Sieve action: Accept |
| `sieve.action-accept-replace` | `count` | `stalwart.sieve.action_accept_replace` (`{event}`) | `stalwart_sieve_action_accept_replace_total` | Sieve action: Accept and replace |
| `sieve.action-discard` | `count` | `stalwart.sieve.action_discard` (`{event}`) | `stalwart_sieve_action_discard_total` | Sieve action: Discard |
| `sieve.action-reject` | `count` | `stalwart.sieve.action_reject` (`{event}`) | `stalwart_sieve_action_reject_total` | Sieve action: Reject |
| `sieve.send-message` | `count` | `stalwart.sieve.send_message` (`{event}`) | `stalwart_sieve_send_message_total` | Sieve sending message |
| `sieve.message-too-large` | `count` | `stalwart.sieve.message_too_large` (`{event}`) | `stalwart_sieve_message_too_large_total` | Sieve message too large |
| `sieve.runtime-error` | `count` | `stalwart.sieve.runtime_error` (`{event}`) | `stalwart_sieve_runtime_error_total` | Sieve runtime error |
| `sieve.unexpected-error` | `count` | `stalwart.sieve.unexpected_error` (`{event}`) | `stalwart_sieve_unexpected_error_total` | Unexpected Sieve error |
| `sieve.not-supported` | `count` | `stalwart.sieve.not_supported` (`{event}`) | `stalwart_sieve_not_supported_total` | Sieve action not supported |
| `sieve.quota-exceeded` | `count` | `stalwart.sieve.quota_exceeded` (`{event}`) | `stalwart_sieve_quota_exceeded_total` | Sieve quota exceeded |


## Smtp

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `smtp.request-time` | `milliseconds` | `stalwart.smtp.request_time` (`s`) | `stalwart_smtp_request_time_seconds` | SMTP connection duration |
| `smtp.active-connections` | `connections` | `stalwart.smtp.active_connections` (`{connection}`) | `stalwart_smtp_active_connections` | Active SMTP connections |
| `smtp.connection-start` | `count` | `stalwart.smtp.connection_start` (`{event}`) | `stalwart_smtp_connection_start_total` | SMTP connection started |
| `smtp.connection-end` | `count` | `stalwart.smtp.connection_end` (`{event}`) | `stalwart_smtp_connection_end_total` | SMTP connection ended |
| `smtp.error` | `count` | `stalwart.smtp.error` (`{event}`) | `stalwart_smtp_error_total` | SMTP error occurred |
| `smtp.concurrency-limit-exceeded` | `count` | `stalwart.smtp.concurrency_limit_exceeded` (`{event}`) | `stalwart_smtp_concurrency_limit_exceeded_total` | Concurrency limit exceeded |
| `smtp.transfer-limit-exceeded` | `count` | `stalwart.smtp.transfer_limit_exceeded` (`{event}`) | `stalwart_smtp_transfer_limit_exceeded_total` | Transfer limit exceeded |
| `smtp.rate-limit-exceeded` | `count` | `stalwart.smtp.rate_limit_exceeded` (`{event}`) | `stalwart_smtp_rate_limit_exceeded_total` | Rate limit exceeded |
| `smtp.time-limit-exceeded` | `count` | `stalwart.smtp.time_limit_exceeded` (`{event}`) | `stalwart_smtp_time_limit_exceeded_total` | Time limit exceeded |
| `smtp.message-parse-failed` | `count` | `stalwart.smtp.message_parse_failed` (`{event}`) | `stalwart_smtp_message_parse_failed_total` | Message parsing failed |
| `smtp.message-too-large` | `count` | `stalwart.smtp.message_too_large` (`{event}`) | `stalwart_smtp_message_too_large_total` | Message too large |
| `smtp.loop-detected` | `count` | `stalwart.smtp.loop_detected` (`{event}`) | `stalwart_smtp_loop_detected_total` | Mail loop detected |
| `smtp.multiple-from-domains` | `count` | `stalwart.smtp.multiple_from_domains` (`{event}`) | `stalwart_smtp_multiple_from_domains_total` | Multiple From domains |
| `smtp.dkim-pass` | `count` | `stalwart.smtp.dkim_pass` (`{event}`) | `stalwart_smtp_dkim_pass_total` | DKIM verification passed |
| `smtp.dkim-fail` | `count` | `stalwart.smtp.dkim_fail` (`{event}`) | `stalwart_smtp_dkim_fail_total` | DKIM verification failed |
| `smtp.dkim2-pass` | `count` | `stalwart.smtp.dkim2_pass` (`{event}`) | `stalwart_smtp_dkim2_pass_total` | DKIM2 verification passed |
| `smtp.dkim2-fail` | `count` | `stalwart.smtp.dkim2_fail` (`{event}`) | `stalwart_smtp_dkim2_fail_total` | DKIM2 verification failed |
| `smtp.dkim2-dsn-rejected` | `count` | `stalwart.smtp.dkim2_dsn_rejected` (`{event}`) | `stalwart_smtp_dkim2_dsn_rejected_total` | DKIM2 DSN rejected |
| `smtp.arc-pass` | `count` | `stalwart.smtp.arc_pass` (`{event}`) | `stalwart_smtp_arc_pass_total` | ARC verification passed |
| `smtp.arc-fail` | `count` | `stalwart.smtp.arc_fail` (`{event}`) | `stalwart_smtp_arc_fail_total` | ARC verification failed |
| `smtp.spf-ehlo-pass` | `count` | `stalwart.smtp.spf_ehlo_pass` (`{event}`) | `stalwart_smtp_spf_ehlo_pass_total` | SPF EHLO check passed |
| `smtp.spf-ehlo-fail` | `count` | `stalwart.smtp.spf_ehlo_fail` (`{event}`) | `stalwart_smtp_spf_ehlo_fail_total` | SPF EHLO check failed |
| `smtp.spf-from-pass` | `count` | `stalwart.smtp.spf_from_pass` (`{event}`) | `stalwart_smtp_spf_from_pass_total` | SPF From check passed |
| `smtp.spf-from-fail` | `count` | `stalwart.smtp.spf_from_fail` (`{event}`) | `stalwart_smtp_spf_from_fail_total` | SPF From check failed |
| `smtp.dmarc-pass` | `count` | `stalwart.smtp.dmarc_pass` (`{event}`) | `stalwart_smtp_dmarc_pass_total` | DMARC check passed |
| `smtp.dmarc-fail` | `count` | `stalwart.smtp.dmarc_fail` (`{event}`) | `stalwart_smtp_dmarc_fail_total` | DMARC check failed |
| `smtp.iprev-pass` | `count` | `stalwart.smtp.iprev_pass` (`{event}`) | `stalwart_smtp_iprev_pass_total` | IPREV check passed |
| `smtp.iprev-fail` | `count` | `stalwart.smtp.iprev_fail` (`{event}`) | `stalwart_smtp_iprev_fail_total` | IPREV check failed |
| `smtp.too-many-messages` | `count` | `stalwart.smtp.too_many_messages` (`{event}`) | `stalwart_smtp_too_many_messages_total` | Too many messages |
| `smtp.invalid-ehlo` | `count` | `stalwart.smtp.invalid_ehlo` (`{event}`) | `stalwart_smtp_invalid_ehlo_total` | Invalid EHLO command |
| `smtp.did-not-say-ehlo` | `count` | `stalwart.smtp.did_not_say_ehlo` (`{event}`) | `stalwart_smtp_did_not_say_ehlo_total` | Client did not say EHLO |
| `smtp.mail-from-unauthenticated` | `count` | `stalwart.smtp.mail_from_unauthenticated` (`{event}`) | `stalwart_smtp_mail_from_unauthenticated_total` | MAIL FROM without authentication |
| `smtp.mail-from-unauthorized` | `count` | `stalwart.smtp.mail_from_unauthorized` (`{event}`) | `stalwart_smtp_mail_from_unauthorized_total` | MAIL FROM unauthorized |
| `smtp.mail-from-missing` | `count` | `stalwart.smtp.mail_from_missing` (`{event}`) | `stalwart_smtp_mail_from_missing_total` | MAIL FROM address missing |
| `smtp.multiple-mail-from` | `count` | `stalwart.smtp.multiple_mail_from` (`{event}`) | `stalwart_smtp_multiple_mail_from_total` | Multiple MAIL FROM commands |
| `smtp.mailbox-does-not-exist` | `count` | `stalwart.smtp.mailbox_does_not_exist` (`{event}`) | `stalwart_smtp_mailbox_does_not_exist_total` | Mailbox does not exist |
| `smtp.relay-not-allowed` | `count` | `stalwart.smtp.relay_not_allowed` (`{event}`) | `stalwart_smtp_relay_not_allowed_total` | Relay not allowed |
| `smtp.rcpt-to-duplicate` | `count` | `stalwart.smtp.rcpt_to_duplicate` (`{event}`) | `stalwart_smtp_rcpt_to_duplicate_total` | Duplicate RCPT TO |
| `smtp.rcpt-to-missing` | `count` | `stalwart.smtp.rcpt_to_missing` (`{event}`) | `stalwart_smtp_rcpt_to_missing_total` | RCPT TO address missing |
| `smtp.too-many-recipients` | `count` | `stalwart.smtp.too_many_recipients` (`{event}`) | `stalwart_smtp_too_many_recipients_total` | Too many recipients |
| `smtp.too-many-invalid-rcpt` | `count` | `stalwart.smtp.too_many_invalid_rcpt` (`{event}`) | `stalwart_smtp_too_many_invalid_rcpt_total` | Too many invalid recipients |
| `smtp.auth-mechanism-not-supported` | `count` | `stalwart.smtp.auth_mechanism_not_supported` (`{event}`) | `stalwart_smtp_auth_mechanism_not_supported_total` | Auth mechanism not supported |
| `smtp.auth-exchange-too-long` | `count` | `stalwart.smtp.auth_exchange_too_long` (`{event}`) | `stalwart_smtp_auth_exchange_too_long_total` | Auth exchange too long |
| `smtp.command-not-implemented` | `count` | `stalwart.smtp.command_not_implemented` (`{event}`) | `stalwart_smtp_command_not_implemented_total` | Command not implemented |
| `smtp.invalid-command` | `count` | `stalwart.smtp.invalid_command` (`{event}`) | `stalwart_smtp_invalid_command_total` | Invalid command |
| `smtp.syntax-error` | `count` | `stalwart.smtp.syntax_error` (`{event}`) | `stalwart_smtp_syntax_error_total` | Syntax error |
| `smtp.request-too-large` | `count` | `stalwart.smtp.request_too_large` (`{event}`) | `stalwart_smtp_request_too_large_total` | Request too large |


## Spam

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `spam.pyzor-error` | `count` | `stalwart.spam.pyzor_error` (`{event}`) | `stalwart_spam_pyzor_error_total` | Pyzor error |
| `spam.dnsbl-error` | `count` | `stalwart.spam.dnsbl_error` (`{event}`) | `stalwart_spam_dnsbl_error_total` | Error querying DNSBL |
| `spam.train-completed` | `count` | `stalwart.spam.train_completed` (`{event}`) | `stalwart_spam_train_completed_total` | Spam classifier training completed |
| `spam.train-sample-added` | `count` | `stalwart.spam.train_sample_added` (`{event}`) | `stalwart_spam_train_sample_added_total` | New training sample added |
| `spam.classify` | `count` | `stalwart.spam.classify` (`{event}`) | `stalwart_spam_classify_total` | Classifying message for spam |
| `spam.model-not-ready` | `count` | `stalwart.spam.model_not_ready` (`{event}`) | `stalwart_spam_model_not_ready_total` | Spam classifier model not ready |


## Spf

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `spf.pass` | `count` | `stalwart.spf.pass` (`{event}`) | `stalwart_spf_pass_total` | SPF check passed |
| `spf.fail` | `count` | `stalwart.spf.fail` (`{event}`) | `stalwart_spf_fail_total` | SPF check failed |
| `spf.soft-fail` | `count` | `stalwart.spf.soft_fail` (`{event}`) | `stalwart_spf_soft_fail_total` | SPF soft fail |
| `spf.neutral` | `count` | `stalwart.spf.neutral` (`{event}`) | `stalwart_spf_neutral_total` | SPF neutral result |
| `spf.temp-error` | `count` | `stalwart.spf.temp_error` (`{event}`) | `stalwart_spf_temp_error_total` | SPF temporary error |
| `spf.perm-error` | `count` | `stalwart.spf.perm_error` (`{event}`) | `stalwart_spf_perm_error_total` | SPF permanent error |
| `spf.none` | `count` | `stalwart.spf.none` (`{event}`) | `stalwart_spf_none_total` | No SPF record |


## Store

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `store.data-read-time` | `milliseconds` | `stalwart.store.data_read_time` (`s`) | `stalwart_store_data_read_time_seconds` | Data store read time |
| `store.data-write-time` | `milliseconds` | `stalwart.store.data_write_time` (`s`) | `stalwart_store_data_write_time_seconds` | Data store write time |
| `store.blob-read-time` | `milliseconds` | `stalwart.store.blob_read_time` (`s`) | `stalwart_store_blob_read_time_seconds` | Blob store read time |
| `store.blob-write-time` | `milliseconds` | `stalwart.store.blob_write_time` (`s`) | `stalwart_store_blob_write_time_seconds` | Blob store write time |
| `store.assert-value-failed` | `count` | `stalwart.store.assert_value_failed` (`{event}`) | `stalwart_store_assert_value_failed_total` | Another process modified the record |
| `store.foundationdb-error` | `count` | `stalwart.store.foundationdb_error` (`{event}`) | `stalwart_store_foundationdb_error_total` | FoundationDB error |
| `store.mysql-error` | `count` | `stalwart.store.mysql_error` (`{event}`) | `stalwart_store_mysql_error_total` | MySQL error |
| `store.postgresql-error` | `count` | `stalwart.store.postgresql_error` (`{event}`) | `stalwart_store_postgresql_error_total` | PostgreSQL error |
| `store.rocksdb-error` | `count` | `stalwart.store.rocksdb_error` (`{event}`) | `stalwart_store_rocksdb_error_total` | RocksDB error |
| `store.sqlite-error` | `count` | `stalwart.store.sqlite_error` (`{event}`) | `stalwart_store_sqlite_error_total` | SQLite error |
| `store.ldap-error` | `count` | `stalwart.store.ldap_error` (`{event}`) | `stalwart_store_ldap_error_total` | LDAP error |
| `store.elasticsearch-error` | `count` | `stalwart.store.elasticsearch_error` (`{event}`) | `stalwart_store_elasticsearch_error_total` | ElasticSearch error |
| `store.redis-error` | `count` | `stalwart.store.redis_error` (`{event}`) | `stalwart_store_redis_error_total` | Redis error |
| `store.s3-error` | `count` | `stalwart.store.s3_error` (`{event}`) | `stalwart_store_s3_error_total` | S3 error |
| `store.azure-error` | `count` | `stalwart.store.azure_error` (`{event}`) | `stalwart_store_azure_error_total` | Azure error |
| `store.filesystem-error` | `count` | `stalwart.store.filesystem_error` (`{event}`) | `stalwart_store_filesystem_error_total` | Filesystem error |
| `store.pool-error` | `count` | `stalwart.store.pool_error` (`{event}`) | `stalwart_store_pool_error_total` | Connection pool error |
| `store.data-corruption` | `count` | `stalwart.store.data_corruption` (`{event}`) | `stalwart_store_data_corruption_total` | Data corruption detected |
| `store.decompress-error` | `count` | `stalwart.store.decompress_error` (`{event}`) | `stalwart_store_decompress_error_total` | Decompression error |
| `store.deserialize-error` | `count` | `stalwart.store.deserialize_error` (`{event}`) | `stalwart_store_deserialize_error_total` | Deserialization error |
| `store.not-found` | `count` | `stalwart.store.not_found` (`{event}`) | `stalwart_store_not_found_total` | Record not found in database |
| `store.not-configured` | `count` | `stalwart.store.not_configured` (`{event}`) | `stalwart_store_not_configured_total` | Store not configured |
| `store.not-supported` | `count` | `stalwart.store.not_supported` (`{event}`) | `stalwart_store_not_supported_total` | Operation not supported by store |
| `store.unexpected-error` | `count` | `stalwart.store.unexpected_error` (`{event}`) | `stalwart_store_unexpected_error_total` | Unexpected store error |
| `store.crypto-error` | `count` | `stalwart.store.crypto_error` (`{event}`) | `stalwart_store_crypto_error_total` | Store crypto error |
| `store.http-store-error` | `count` | `stalwart.store.http_store_error` (`{event}`) | `stalwart_store_http_store_error_total` | Error updating HTTP store |
| `store.blob-missing-marker` | `count` | `stalwart.store.blob_missing_marker` (`{event}`) | `stalwart_store_blob_missing_marker_total` | Blob missing marker |
| `store.data-write` | `count` | `stalwart.store.data_write` (`{event}`) | `stalwart_store_data_write_total` | Write batch operation |
| `store.data-iterate` | `count` | `stalwart.store.data_iterate` (`{event}`) | `stalwart_store_data_iterate_total` | Data store iteration operation |
| `store.blob-read` | `count` | `stalwart.store.blob_read` (`{event}`) | `stalwart_store_blob_read_total` | Blob read operation |
| `store.blob-write` | `count` | `stalwart.store.blob_write` (`{event}`) | `stalwart_store_blob_write_total` | Blob write operation |
| `store.blob-delete` | `count` | `stalwart.store.blob_delete` (`{event}`) | `stalwart_store_blob_delete_total` | Blob delete operation |


## TaskManager

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `task-manager.pending` | `tasks` | `stalwart.task_manager.pending` (`{task}`) | `stalwart_task_manager_pending` | Tasks queued in the task manager |
| `task-manager.due` | `tasks` | `stalwart.task_manager.due` (`{task}`) | `stalwart_task_manager_due` | Tasks due for execution that have not run yet |
| `task-manager.task-failed` | `count` | `stalwart.task_manager.task_failed` (`{event}`) | `stalwart_task_manager_task_failed_total` | Task failed permanently |
| `task-manager.task-retry` | `count` | `stalwart.task_manager.task_retry` (`{event}`) | `stalwart_task_manager_task_retry_total` | Task will be retried |
| `task-manager.task-stalled` | `count` | `stalwart.task_manager.task_stalled` (`{event}`) | `stalwart_task_manager_task_stalled_total` | Task stalled |
| `task-manager.task-expired` | `count` | `stalwart.task_manager.task_expired` (`{event}`) | `stalwart_task_manager_task_expired_total` | Task expired |
| `task-manager.blob-not-found` | `count` | `stalwart.task_manager.blob_not_found` (`{event}`) | `stalwart_task_manager_blob_not_found_total` | Blob not found for task |
| `task-manager.metadata-not-found` | `count` | `stalwart.task_manager.metadata_not_found` (`{event}`) | `stalwart_task_manager_metadata_not_found_total` | Metadata not found for task |


## Telemetry

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `telemetry.alert-event` | `count` | `stalwart.telemetry.alert_event` (`{event}`) | `stalwart_telemetry_alert_event_total` | Alert event triggered |
| `telemetry.alert-message` | `count` | `stalwart.telemetry.alert_message` (`{event}`) | `stalwart_telemetry_alert_message_total` | Alert message sent |
| `telemetry.log-error` | `count` | `stalwart.telemetry.log_error` (`{event}`) | `stalwart_telemetry_log_error_total` | Log collector error |
| `telemetry.webhook-error` | `count` | `stalwart.telemetry.webhook_error` (`{event}`) | `stalwart_telemetry_webhook_error_total` | Webhook collector error |
| `telemetry.otel-exporter-error` | `count` | `stalwart.telemetry.otel_exporter_error` (`{event}`) | `stalwart_telemetry_otel_exporter_error_total` | OpenTelemetry exporter error |
| `telemetry.otel-metrics-exporter-error` | `count` | `stalwart.telemetry.otel_metrics_exporter_error` (`{event}`) | `stalwart_telemetry_otel_metrics_exporter_error_total` | OpenTelemetry metrics exporter error |
| `telemetry.prometheus-exporter-error` | `count` | `stalwart.telemetry.prometheus_exporter_error` (`{event}`) | `stalwart_telemetry_prometheus_exporter_error_total` | Prometheus exporter error |
| `telemetry.journal-error` | `count` | `stalwart.telemetry.journal_error` (`{event}`) | `stalwart_telemetry_journal_error_total` | Journal collector error |
| `telemetry.events-dropped` | `count` | `stalwart.telemetry.events_dropped` (`{event}`) | `stalwart_telemetry_events_dropped_total` | Telemetry events dropped |


## Tls

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `tls.handshake-error` | `count` | `stalwart.tls.handshake_error` (`{event}`) | `stalwart_tls_handshake_error_total` | TLS handshake error |


## User

| Metric | Unit | OpenTelemetry | Prometheus | Description |
|---|---|---|---|---|
| `user.count` | `users` | `stalwart.users` (`{user}`) | `stalwart_users` | Total number of users |

