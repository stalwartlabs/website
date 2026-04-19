---
title: Events
description: Telemetry events emitted by Stalwart, grouped by subsystem.
sidebar_position: 2
custom_edit_url: null
---

# Events

Every event Stalwart can emit is listed below, grouped by subsystem. Each event has:

- an **identifier** used when enabling or disabling the event and when filtering logs or traces. Identifiers are formatted as `<subsystem>.<name>`, for example `acme.auth-start`.
- a **default logging level**: one of `trace`, `debug`, `info`, `warn`, `error`.
- a **short description** (used as the label in UI dropdowns and column headings).
- a **long description** (operational context: when the event fires, what it means, what action might be needed).

Metrics reported alongside events are listed on the [Metrics](./metrics.md) page.


## Acme

| Event | Level | Short | Long |
|---|---|---|---|
| `acme.auth-start` | `info` | ACME authentication started | The domain ownership validation challenge has begun; the server will attempt to prove control of the domain to the ACME provider. |
| `acme.auth-pending` | `info` | ACME authentication pending | The ACME server has acknowledged the challenge but validation is not yet complete; the server is polling for the result. |
| `acme.auth-valid` | `info` | ACME authentication valid | The ACME server confirmed that the domain ownership challenge was successfully validated. |
| `acme.auth-completed` | `info` | ACME authentication completed | Domain ownership validation has finished and the authorization is now in a terminal state. |
| `acme.auth-error` | `warn` | ACME authentication error | The domain ownership challenge failed; certificate renewal cannot proceed until the underlying DNS or network issue is resolved. |
| `acme.auth-too-many-attempts` | `warn` | Too many ACME authentication attempts | The ACME provider rejected the request because too many validation attempts have been made for this domain in a short period. |
| `acme.process-cert` | `info` | Processing ACME certificate | A newly issued certificate has been received from the ACME provider and is being installed into the TLS configuration. |
| `acme.order-start` | `info` | ACME order started | A new certificate order has been submitted to the ACME provider; domain ownership challenges will follow. |
| `acme.order-processing` | `info` | ACME order processing | The ACME provider is processing the order after all challenges passed; the server is waiting for the certificate to be issued. |
| `acme.order-completed` | `info` | ACME order completed | The ACME provider has issued the certificate and it has been successfully installed. |
| `acme.order-ready` | `info` | ACME order ready | All domain ownership challenges have been validated and the order is ready to be finalized. |
| `acme.order-valid` | `info` | ACME order valid | The ACME order reached the "valid" state, meaning the certificate has been issued and is ready for download. |
| `acme.order-invalid` | `warn` | ACME order invalid | The ACME order failed and cannot be completed; one or more domain ownership challenges were rejected by the provider. |
| `acme.renew-backoff` | `debug` | ACME renew backoff | The ACME server returned HTTP 429 with a Retry-After header; renewal is paused and will be retried after the indicated delay. |
| `acme.client-supplied-sni` | `debug` | ACME client supplied SNI | During TLS-ALPN-01 challenge validation, the connecting ACME client provided an SNI hostname matching the domain being validated. |
| `acme.client-missing-sni` | `debug` | ACME client missing SNI | During TLS-ALPN-01 challenge validation, the ACME client did not supply an SNI hostname; the challenge cannot be completed. |
| `acme.tls-alpn-received` | `info` | ACME TLS ALPN received | A TLS-ALPN-01 challenge connection was received from the ACME provider and is being processed. |
| `acme.tls-alpn-error` | `warn` | ACME TLS ALPN error | The TLS-ALPN-01 challenge validation failed; check that port 443 is reachable and that no other service is intercepting the connection. |
| `acme.token-not-found` | `warn` | ACME token not found | The HTTP-01 challenge token requested by the ACME provider was not found in the token store; the challenge will fail. |
| `acme.error` | `error` | ACME error | An unrecoverable error occurred during ACME certificate management; automatic certificate renewal may be interrupted. |


## Ai

| Event | Level | Short | Long |
|---|---|---|---|
| `ai.llm-response` | `trace` | LLM response | A response was received from the configured AI/LLM provider; logged at trace level for debugging AI-assisted classification or generation. |
| `ai.api-error` | `warn` | AI API error | A request to the AI provider API failed; features relying on LLM assistance (e.g. smart spam classification) may be degraded. |


## Arc

| Event | Level | Short | Long |
|---|---|---|---|
| `arc.chain-too-long` | `debug` | ARC chain too long | The message contains more than 50 ARC header sets, exceeding the maximum allowed chain length; ARC verification will fail. |
| `arc.invalid-instance` | `debug` | Invalid ARC instance | An ARC header set has an instance number that is out of sequence or otherwise invalid, breaking the chain integrity. |
| `arc.invalid-cv` | `debug` | Invalid ARC CV | The ARC chain validation (cv=) tag contains an invalid or contradictory value; the chain cannot be trusted. |
| `arc.has-header-tag` | `debug` | ARC has header tag | An ARC-Seal header contains an unexpected header tag, which violates the ARC specification. |
| `arc.broken-chain` | `debug` | Broken ARC chain | One or more ARC signatures in the chain failed verification; forwarded messages from this path cannot be trusted. |
| `arc.sealer-not-found` | `warn` | ARC sealer not found | The ARC sealer referenced in configuration was not found; outbound ARC signing will be skipped for affected messages. |


## Auth

| Event | Level | Short | Long |
|---|---|---|---|
| `auth.success` | `info` | Authentication successful | A user or service successfully authenticated; credentials were verified against the configured directory or OAuth provider. |
| `auth.failed` | `debug` | Authentication failed | A login attempt was rejected due to incorrect credentials; repeated failures from the same IP may trigger an authentication ban. |
| `auth.token-expired` | `debug` | OAuth token expired | The OAuth access or refresh token presented by the client has expired and must be renewed before the session can continue. |
| `auth.mfa-required` | `trace` | Missing MFA token for authentication | MFA token is required for authentication but was not provided |
| `auth.too-many-attempts` | `warn` | Too many authentication attempts | The client has exceeded the configured limit for failed login attempts in a rolling window; further attempts may be blocked. |
| `auth.client-registration` | `info` | OAuth Client registration | A new OAuth client application was successfully registered with the server's OAuth provider. |
| `auth.error` | `error` | Authentication error | An internal error occurred while processing an authentication request; the login cannot proceed. |
| `auth.warning` | `debug` | Authentication warning | A non-fatal issue was detected during authentication processing, such as an unexpected token format or directory lookup anomaly. |
| `auth.credential-expired` | `debug` | Credential expired | The credential (password, token, or certificate) used for authentication has passed its expiry date. |


## Calendar

| Event | Level | Short | Long |
|---|---|---|---|
| `calendar.rule-expansion-error` | `debug` | Calendar rule expansion error | Failed to expand a recurring calendar event's recurrence rule into concrete instances; affected occurrences may not appear in the user's calendar. |
| `calendar.alarm-sent` | `info` | Calendar alarm sent | A calendar event alarm notification was successfully dispatched to the recipient via email or push. |
| `calendar.alarm-skipped` | `debug` | Calendar alarm skipped | A calendar alarm was not sent because the trigger time was missed, the event was already acknowledged, or the recipient is unavailable. |
| `calendar.alarm-recipient-override` | `debug` | Calendar alarm recipient overriden | The alarm recipient was substituted by a server-configured override rather than the address specified in the calendar event. |
| `calendar.alarm-failed` | `warn` | Calendar alarm could not be sent | Delivery of a calendar alarm notification failed; the recipient may not be notified of the upcoming event. |
| `calendar.itip-message-sent` | `info` | Calendar iTIP message sent | A scheduling message (invite, update, cancellation, or reply) was sent to an external calendar participant via email. |
| `calendar.itip-message-received` | `info` | Calendar iTIP message received | An inbound iTIP/iMIP scheduling message was received and is being processed to update the recipient's calendar. |
| `calendar.itip-message-error` | `debug` | iTIP message error | An iTIP/iMIP scheduling message could not be parsed or applied; the calendar event may not be updated correctly. |


## Cluster

| Event | Level | Short | Long |
|---|---|---|---|
| `cluster.startup` | `info` | Clustering enabled | The clustering subsystem has been initialized; inter-node communication via the configured PubSub backend (Kafka, NATS, or Redis) is now active. |
| `cluster.subscriber-start` | `info` | PubSub subscriber started | This node has connected to the PubSub backend and begun consuming inter-node messages. |
| `cluster.subscriber-stop` | `info` | PubSub subscriber stopped | This node's PubSub subscription has been torn down, typically during a graceful shutdown. |
| `cluster.subscriber-error` | `error` | PubSub subscriber error | An error occurred on the PubSub subscription channel; inter-node cache invalidation and state sync may be disrupted. |
| `cluster.subscriber-disconnected` | `warn` | PubSub subscriber disconnected | The PubSub subscriber lost its connection to the backend; the node will attempt to reconnect automatically. |
| `cluster.publisher-start` | `info` | PubSub publisher started | This node has established a publisher connection to the PubSub backend for broadcasting events to other cluster nodes. |
| `cluster.publisher-stop` | `info` | PubSub publisher stopped | This node's PubSub publisher has been shut down; no further inter-node notifications will be sent. |
| `cluster.publisher-error` | `error` | PubSub publisher error | Failed to publish a message to the PubSub backend; other cluster nodes may not receive this event. |
| `cluster.message-received` | `trace` | PubSub message received | An inter-node message was received from the PubSub backend and is being dispatched to the appropriate handler. |
| `cluster.message-skipped` | `trace` | PubSub message skipped | A PubSub message was ignored because it originated from this node and would cause a processing loop. |
| `cluster.message-invalid` | `error` | Invalid PubSub message | A message received from the PubSub backend could not be deserialized; it may indicate a version mismatch between cluster nodes. |
| `cluster.node-id-renewed` | `debug` | Node ID renewed | This node's distributed lease has been refreshed, confirming it remains the active holder of its node identity in the cluster. |


## Dane

| Event | Level | Short | Long |
|---|---|---|---|
| `dane.authentication-success` | `info` | DANE authentication successful | The remote server's certificate matched a TLSA record in DNS; the TLS connection is cryptographically verified via DANE. |
| `dane.authentication-failure` | `info` | DANE authentication failed | The remote server's certificate did not match any TLSA record; the connection may be rejected depending on policy. |
| `dane.no-certificates-found` | `info` | No certificates found for DANE | The TLS handshake completed but no certificates were presented by the remote server for TLSA matching. |
| `dane.certificate-parse-error` | `info` | Error parsing certificate for DANE | A certificate presented during the TLS handshake could not be parsed; DANE verification cannot proceed. |
| `dane.tlsa-record-match` | `info` | TLSA record match found | The remote server's certificate matched a TLSA record, confirming the server's identity via DANE. |
| `dane.tlsa-record-fetch` | `info` | Fetching TLSA record | A DNS lookup is being performed to retrieve the TLSA record for the remote server's domain. |
| `dane.tlsa-record-fetch-error` | `info` | Error fetching TLSA record | The DNS lookup for the TLSA record failed; DANE verification cannot be performed for this connection. |
| `dane.tlsa-record-not-found` | `info` | TLSA record not found | No TLSA record exists for the remote server's domain; DANE verification is skipped for this connection. |
| `dane.tlsa-record-not-dnssec-signed` | `info` | TLSA record not DNSSEC signed | The TLSA record was found but is not protected by DNSSEC; it cannot be trusted for DANE verification. |
| `dane.tlsa-record-invalid` | `info` | Invalid TLSA record | The TLSA record syntax or content is invalid and cannot be used for certificate matching. |


## Delivery

| Event | Level | Short | Long |
|---|---|---|---|
| `delivery.attempt-start` | `info` | Delivery attempt started | A new outbound SMTP delivery attempt is beginning; the server will look up MX records and try to connect to the recipient's mail server. |
| `delivery.attempt-end` | `info` | Delivery attempt ended | The outbound delivery attempt has finished, either successfully or with a temporary/permanent failure recorded. |
| `delivery.completed` | `info` | Delivery completed | All recipients for this message have been either delivered or permanently failed; the message is removed from the queue. |
| `delivery.failed` | `info` | Delivery failed | The delivery attempt failed with a temporary error; the message will be rescheduled for a later retry. |
| `delivery.domain-delivery-start` | `info` | New delivery attempt for domain | An outbound delivery attempt is starting for a specific recipient domain; MX lookup and connection will follow. |
| `delivery.mx-lookup` | `debug` | MX record lookup | Performing a DNS MX record lookup to determine which mail servers accept mail for the recipient domain. |
| `delivery.mx-lookup-failed` | `info` | MX record lookup failed | DNS returned no MX records or an error for the recipient domain; delivery to this domain cannot proceed. |
| `delivery.ip-lookup` | `debug` | IP address lookup | Resolving the IP address of an MX host before attempting a connection. |
| `delivery.ip-lookup-failed` | `info` | IP address lookup failed | DNS resolution of an MX hostname failed; this host will be skipped and the next MX record tried. |
| `delivery.null-mx` | `info` | Null MX record found | The recipient domain published a null MX record (RFC 7505), explicitly indicating it does not accept email; delivery is permanently impossible. |
| `delivery.connect` | `info` | Connecting to remote server | A TCP connection is being established to the remote mail server for outbound delivery. |
| `delivery.connect-error` | `info` | Connection error | The TCP connection to the remote mail server failed; another MX host will be tried if available. |
| `delivery.missing-outbound-hostname` | `warn` | Missing outbound hostname in configuration | No outbound EHLO hostname is configured; a hostname is required to present in the EHLO command to remote servers. |
| `delivery.greeting-failed` | `info` | SMTP greeting failed | The remote server did not send a valid SMTP 220 greeting after connection; the session cannot continue. |
| `delivery.ehlo` | `debug` | SMTP EHLO command | The EHLO command was sent to the remote server to advertise capabilities and begin the SMTP session. |
| `delivery.ehlo-rejected` | `info` | SMTP EHLO rejected | The remote server rejected the EHLO command; delivery to this host cannot proceed. |
| `delivery.auth` | `debug` | SMTP authentication | Authenticating with the remote server using the configured relay credentials. |
| `delivery.auth-failed` | `info` | SMTP authentication failed | The configured relay credentials were rejected by the remote server; delivery via this relay will fail. |
| `delivery.mail-from` | `debug` | SMTP MAIL FROM command | The MAIL FROM command was sent to declare the envelope sender address to the remote server. |
| `delivery.mail-from-rejected` | `info` | SMTP MAIL FROM rejected | The remote server rejected the MAIL FROM command; the sender address or domain may be blocked. |
| `delivery.delivered` | `info` | Message delivered | The remote server accepted the message for the recipient with a 250 response; delivery is complete. |
| `delivery.rcpt-to` | `debug` | SMTP RCPT TO command | The RCPT TO command was sent to specify the envelope recipient address to the remote server. |
| `delivery.rcpt-to-rejected` | `info` | SMTP RCPT TO rejected | The remote server rejected the recipient address; a DSN will be generated for permanent failures. |
| `delivery.rcpt-to-failed` | `info` | SMTP RCPT TO failed | The RCPT TO command could not be sent due to a connection error; delivery will be retried. |
| `delivery.message-rejected` | `info` | Message rejected by remote server | The remote server rejected the message data after accepting the envelope; a DSN will be generated. |
| `delivery.start-tls` | `info` | SMTP STARTTLS command | Requesting a TLS upgrade on the existing SMTP connection to the remote server. |
| `delivery.start-tls-unavailable` | `info` | STARTTLS unavailable | The remote server does not advertise STARTTLS; the connection will proceed unencrypted if policy allows. |
| `delivery.start-tls-error` | `info` | STARTTLS error | The TLS handshake after STARTTLS failed; the connection may fall back to plaintext or be abandoned depending on policy. |
| `delivery.start-tls-disabled` | `info` | STARTTLS disabled | STARTTLS has been disabled in the configuration for this remote host; the connection will be plaintext. |
| `delivery.implicit-tls-error` | `info` | Implicit TLS error | The TLS handshake on the implicit TLS port (e.g. port 465) failed; the connection cannot be used. |
| `delivery.concurrency-limit-exceeded` | `warn` | Concurrency limit exceeded | The configured maximum number of simultaneous outbound connections to this remote host has been reached; delivery is deferred. |
| `delivery.rate-limit-exceeded` | `warn` | Rate limit exceeded | The configured outbound message rate limit for this remote host has been reached; delivery is deferred until the window resets. |
| `delivery.double-bounce` | `info` | Discarding message after double bounce | A bounce notification itself bounced; the message is permanently discarded to prevent a delivery loop. |
| `delivery.dsn-success` | `info` | DSN success notification | A delivery success notification (DSN) was generated and queued for the original sender. |
| `delivery.dsn-temp-fail` | `info` | DSN temporary failure notification | A temporary failure delivery status notification was generated; the sender is informed that delivery is being retried. |
| `delivery.dsn-perm-fail` | `info` | DSN permanent failure notification | A permanent failure delivery status notification was generated; the sender is informed that the message cannot be delivered. |
| `delivery.raw-input` | `trace` | Raw SMTP input received | Raw bytes received from the remote server; logged at trace level for low-level SMTP session debugging. |
| `delivery.raw-output` | `trace` | Raw SMTP output sent | Raw bytes sent to the remote server; logged at trace level for low-level SMTP session debugging. |


## Dkim

| Event | Level | Short | Long |
|---|---|---|---|
| `dkim.pass` | `debug` | DKIM verification passed | The DKIM signature on the incoming message was cryptographically valid and the signing domain is authorized. |
| `dkim.neutral` | `debug` | DKIM verification neutral | The DKIM signature was present but the result is neither pass nor fail, typically due to a policy setting. |
| `dkim.fail` | `debug` | DKIM verification failed | The DKIM signature did not verify; the message may have been tampered with or the key has changed since signing. |
| `dkim.perm-error` | `debug` | DKIM permanent error | A permanent DKIM error occurred (e.g. malformed signature or missing required tag); the signature cannot be evaluated. |
| `dkim.temp-error` | `debug` | DKIM temporary error | A transient error prevented DKIM verification, such as a DNS timeout when fetching the public key. |
| `dkim.none` | `debug` | No DKIM signature | The message carries no DKIM signature; authentication relies on SPF and DMARC alone. |
| `dkim.unsupported-version` | `debug` | Unsupported DKIM version | The DKIM signature specifies a version tag that is not supported; the signature is ignored. |
| `dkim.unsupported-algorithm` | `debug` | Unsupported DKIM algorithm | The signing algorithm specified in the DKIM signature (e.g. an obsolete or unknown algorithm) is not supported. |
| `dkim.unsupported-canonicalization` | `debug` | Unsupported DKIM canonicalization | The canonicalization method in the DKIM signature is not recognized; the signature cannot be verified. |
| `dkim.unsupported-key-type` | `debug` | Unsupported DKIM key type | The public key type published in DNS for this DKIM selector is not supported by this server. |
| `dkim.failed-body-hash-match` | `debug` | DKIM body hash mismatch | The hash of the message body does not match the body hash in the DKIM signature; the message body was likely modified in transit. |
| `dkim.failed-verification` | `debug` | DKIM verification failed | Cryptographic verification of the DKIM signature failed; the signature or the message has been altered. |
| `dkim.failed-auid-match` | `debug` | DKIM AUID mismatch | The agent or user identifier (i=) in the DKIM signature does not belong to the signing domain (d=). |
| `dkim.revoked-public-key` | `debug` | DKIM public key revoked | The DNS TXT record for the DKIM selector has an empty or revoked key; all signatures from this selector are invalid. |
| `dkim.incompatible-algorithms` | `debug` | Incompatible DKIM algorithms | The signature algorithm and the public key type are incompatible with each other; verification cannot proceed. |
| `dkim.signature-expired` | `debug` | DKIM signature expired | The DKIM signature's expiry time (x= tag) has passed; the signature is no longer valid. |
| `dkim.signature-length` | `debug` | DKIM signature length issue | The DKIM signature's body length limit (l= tag) does not match the actual message body length. |
| `dkim.signer-not-found` | `warn` | DKIM signer not found | The DKIM signing key referenced in configuration was not found; outbound messages will not be signed. |
| `dkim.build-error` | `error` | DKIM build error | Failed to construct a DKIM signature due to a configuration or key loading error. |
| `dkim.signature-created` | `info` | DKIM signature created | A new DKIM signing key pair has been generated and stored, ready for publication to DNS. |
| `dkim.signature-published` | `info` | DKIM signature published | The DKIM public key has been published as a DNS TXT record and is now active for verification by recipients. |
| `dkim.signature-retiring` | `info` | DKIM signature retiring | The DKIM signing key is being phased out; the DNS record will be removed after the retirement period to allow in-flight messages to verify. |
| `dkim.signature-retired` | `info` | DKIM signature retired | The DKIM key's retirement period has elapsed and its DNS record has been removed; the key is no longer in use. |
| `dkim.signature-deleted` | `info` | DKIM signature deleted | The DKIM signing key has been permanently deleted from the system and its DNS record removed. |


## Dmarc

| Event | Level | Short | Long |
|---|---|---|---|
| `dmarc.pass` | `debug` | DMARC check passed | The message passed DMARC evaluation; either DKIM or SPF aligned with the From domain per the domain's policy. |
| `dmarc.fail` | `debug` | DMARC check failed | The message failed DMARC evaluation; neither DKIM nor SPF produced an aligned pass, and the domain's policy may require rejection or quarantine. |
| `dmarc.perm-error` | `debug` | DMARC permanent error | A permanent error prevented DMARC evaluation, such as a malformed policy record; the check result is indeterminate. |
| `dmarc.temp-error` | `debug` | DMARC temporary error | A transient error prevented DMARC evaluation, such as a DNS timeout when fetching the policy record; the check will not be retried for this message. |
| `dmarc.none` | `debug` | No DMARC record | No DMARC policy record was found for the From domain; the message is not subject to DMARC enforcement. |


## Dns

| Event | Level | Short | Long |
|---|---|---|---|
| `dns.record-created` | `info` | DNS record created | The DNS provider API accepted the new record; propagation polling will begin to confirm visibility. |
| `dns.record-creation-failed` | `warn` | DNS record creation failed | The DNS provider API rejected or failed the record creation request; ACME DNS-01 challenges or DKIM publishing may be blocked. |
| `dns.record-deletion-failed` | `debug` | DNS record deletion failed | The DNS provider API could not remove the record; stale challenge or DKIM records may remain in DNS. |
| `dns.record-not-propagated` | `debug` | DNS record not propagated | A poll of the authoritative DNS servers shows the record has not yet appeared; the server will retry until the propagation timeout. |
| `dns.record-lookup-failed` | `debug` | DNS record lookup failed | A DNS lookup performed during propagation polling returned an error; check DNS resolver connectivity. |
| `dns.record-propagated` | `info` | DNS record propagated | The DNS record is now visible on the authoritative nameservers; propagation polling has completed successfully. |
| `dns.record-propagation-timeout` | `warn` | DNS record propagation timeout | The configured propagation timeout elapsed before the record became visible; the dependent operation (e.g. ACME challenge) may fail. |
| `dns.build-error` | `error` | DNS updater build error | Failed to initialize the DNS provider client from configuration; automatic DNS record management will not function. |


## Eval

| Event | Level | Short | Long |
|---|---|---|---|
| `eval.result` | `trace` | Expression evaluation result | A configuration expression was evaluated and produced a result; logged at trace level for debugging rule logic. |
| `eval.error` | `debug` | Expression evaluation error | A configuration expression could not be evaluated due to a syntax or runtime error; the rule using this expression may not behave as expected. |
| `eval.directory-not-found` | `warn` | Directory not found while evaluating expression | An expression referenced a directory backend by name that does not exist in the configuration; the expression cannot be evaluated. |
| `eval.store-not-found` | `debug` | Store not found while evaluating expression | An expression referenced a store backend by name that does not exist in the configuration; the expression cannot be evaluated. |


## Http

| Event | Level | Short | Long |
|---|---|---|---|
| `http.connection-start` | `debug` | HTTP connection started | A new inbound HTTP/HTTPS connection was accepted by the server. |
| `http.connection-end` | `debug` | HTTP connection ended | An inbound HTTP/HTTPS connection was closed after completing its requests. |
| `http.error` | `debug` | HTTP error occurred | An error was returned during an HTTP request, such as a 4xx or 5xx response or a transport-level failure. |
| `http.request-url` | `debug` | HTTP request URL | Logs the URL of an incoming HTTP request for debugging purposes. |
| `http.request-body` | `trace` | HTTP request body | Logs the full body of an incoming HTTP request; only emitted at trace level due to potentially sensitive content. |
| `http.response-body` | `trace` | HTTP response body | Logs the full body of an outgoing HTTP response; only emitted at trace level due to potentially sensitive content. |
| `http.x-forwarded-missing` | `warn` | X-Forwarded-For header is missing | The server is configured to trust a reverse proxy but the X-Forwarded-For header was absent; the client IP cannot be determined accurately. |


## Imap

| Event | Level | Short | Long |
|---|---|---|---|
| `imap.connection-start` | `debug` | IMAP connection started | A new IMAP client connection was accepted; the server will begin processing IMAP commands from this client. |
| `imap.connection-end` | `debug` | IMAP connection ended | An IMAP client connection was closed, either by the client logging out or due to a timeout or error. |
| `imap.get-acl` | `debug` | IMAP GET ACL command | Client requested mailbox ACL |
| `imap.set-acl` | `debug` | IMAP SET ACL command | Client set mailbox ACL |
| `imap.my-rights` | `debug` | IMAP MYRIGHTS command | Client requested mailbox rights |
| `imap.list-rights` | `debug` | IMAP LISTRIGHTS command | Client requested mailbox rights list |
| `imap.append` | `debug` | IMAP APPEND command | Client appended a message to a mailbox |
| `imap.capabilities` | `debug` | IMAP CAPABILITIES command | Client requested server capabilities |
| `imap.id` | `debug` | IMAP ID command | Client sent an ID command |
| `imap.close` | `debug` | IMAP CLOSE command | Client closed a mailbox |
| `imap.copy` | `debug` | IMAP COPY command | Client copied messages between mailboxes |
| `imap.move` | `debug` | IMAP MOVE command | Client moved messages between mailboxes |
| `imap.create-mailbox` | `debug` | IMAP CREATE mailbox command | Client created a mailbox |
| `imap.delete-mailbox` | `debug` | IMAP DELETE mailbox command | Client deleted a mailbox |
| `imap.rename-mailbox` | `debug` | IMAP RENAME mailbox command | Client renamed a mailbox |
| `imap.enable` | `debug` | IMAP ENABLE command | Client enabled an extension |
| `imap.expunge` | `debug` | IMAP EXPUNGE command | Client expunged messages |
| `imap.fetch` | `debug` | IMAP FETCH command | Client fetched messages |
| `imap.idle-start` | `debug` | IMAP IDLE start | Client started IDLE |
| `imap.idle-stop` | `debug` | IMAP IDLE stop | Client stopped IDLE |
| `imap.list` | `debug` | IMAP LIST command | Client listed mailboxes |
| `imap.lsub` | `debug` | IMAP LSUB command | Client listed subscribed mailboxes |
| `imap.logout` | `debug` | IMAP LOGOUT command | Client logged out |
| `imap.namespace` | `debug` | IMAP NAMESPACE command | Client requested namespace |
| `imap.noop` | `debug` | IMAP NOOP command | Client sent a NOOP command |
| `imap.search` | `debug` | IMAP SEARCH command | Client searched for messages |
| `imap.sort` | `debug` | IMAP SORT command | Client sorted messages |
| `imap.select` | `debug` | IMAP SELECT command | Client selected a mailbox |
| `imap.status` | `debug` | IMAP STATUS command | Client requested mailbox status |
| `imap.store` | `debug` | IMAP STORE command | Client stored flags |
| `imap.subscribe` | `debug` | IMAP SUBSCRIBE command | Client subscribed to a mailbox |
| `imap.unsubscribe` | `debug` | IMAP UNSUBSCRIBE command | Client unsubscribed from a mailbox |
| `imap.thread` | `debug` | IMAP THREAD command | Client requested message threads |
| `imap.get-quota` | `debug` | IMAP GETQUOTA command | Client requested mailbox quota |
| `imap.error` | `debug` | IMAP error occurred | An error occurred during an IMAP command |
| `imap.raw-input` | `trace` | Raw IMAP input received | Raw bytes received from the IMAP client; logged at trace level for low-level IMAP session debugging. |
| `imap.raw-output` | `trace` | Raw IMAP output sent | Raw bytes sent to the IMAP client; logged at trace level for low-level IMAP session debugging. |


## IncomingReport

| Event | Level | Short | Long |
|---|---|---|---|
| `incoming-report.dmarc-report` | `info` | DMARC report received | An aggregate DMARC report was received from a remote mail server and successfully parsed for processing. |
| `incoming-report.dmarc-report-with-warnings` | `warn` | DMARC report received with warnings | A DMARC aggregate report was received and parsed but contained non-fatal issues; some data may have been skipped. |
| `incoming-report.tls-report` | `info` | TLS report received | A TLS-RPT report was received from a remote mail server and successfully parsed for processing. |
| `incoming-report.tls-report-with-warnings` | `warn` | TLS report received with warnings | A TLS-RPT report was received and parsed but contained non-fatal issues; some data may have been skipped. |
| `incoming-report.abuse-report` | `info` | Abuse report received | An ARF abuse report (e.g. spam complaint) was received from a feedback loop provider. |
| `incoming-report.auth-failure-report` | `info` | Authentication failure report received | An ARF authentication failure report was received, indicating a message failed DKIM, SPF, or DMARC at a remote site. |
| `incoming-report.fraud-report` | `info` | Fraud report received | An ARF fraud report was received, indicating a message was identified as phishing or a scam at the remote site. |
| `incoming-report.not-spam-report` | `info` | Not spam report received | An ARF not-spam report was received, indicating a false-positive spam classification by the remote site. |
| `incoming-report.virus-report` | `info` | Virus report received | An ARF virus report was received, indicating a message was identified as containing malware at the remote site. |
| `incoming-report.other-report` | `info` | Other type of report received | An ARF report of an unrecognized type was received; it was logged but could not be classified for processing. |
| `incoming-report.message-parse-failed` | `info` | Failed to parse incoming report message | The outer email message containing the report could not be parsed; the report contents cannot be processed. |
| `incoming-report.dmarc-parse-failed` | `info` | Failed to parse DMARC report | The XML payload of the DMARC aggregate report could not be parsed; the report data will not be recorded. |
| `incoming-report.tls-rpc-parse-failed` | `info` | Failed to parse TLS RPC report | The JSON payload of the TLS-RPT report could not be parsed; the report data will not be recorded. |
| `incoming-report.arf-parse-failed` | `info` | Failed to parse ARF report | The ARF (Abuse Reporting Format) feedback report could not be parsed; the complaint data will not be recorded. |
| `incoming-report.decompress-error` | `info` | Error decompressing report | The report attachment could not be decompressed (e.g. corrupt gzip); the report contents cannot be processed. |


## Iprev

| Event | Level | Short | Long |
|---|---|---|---|
| `iprev.pass` | `debug` | IPREV check passed | The connecting IP's reverse DNS resolved to a hostname that in turn resolved back to the same IP, confirming a matching forward-confirmed reverse DNS. |
| `iprev.fail` | `debug` | IPREV check failed | The connecting IP either has no reverse DNS or the forward lookup of that hostname did not resolve back to the original IP. |
| `iprev.perm-error` | `debug` | IPREV permanent error | A permanent DNS error prevented the reverse lookup from completing; the IPREV result is indeterminate. |
| `iprev.temp-error` | `debug` | IPREV temporary error | A transient DNS error prevented the reverse lookup from completing; the IPREV result is indeterminate for this message. |
| `iprev.none` | `debug` | No IPREV record | No PTR record exists for the connecting IP address; IPREV cannot be evaluated. |


## Jmap

| Event | Level | Short | Long |
|---|---|---|---|
| `jmap.method-call` | `debug` | JMAP method call | A JMAP API method was invoked by a client; logged for debugging API usage and performance. |
| `jmap.invalid-arguments` | `debug` | Invalid JMAP arguments | The client supplied arguments that do not conform to the JMAP method specification; the call is rejected with an invalidArguments error. |
| `jmap.request-too-large` | `debug` | JMAP request too large | The JMAP request body exceeds the server's configured maximum size limit and is rejected. |
| `jmap.state-mismatch` | `debug` | JMAP state mismatch | The client's ifInState or ifNotInState condition was not satisfied; the operation is rejected to prevent conflicting changes. |
| `jmap.anchor-not-found` | `debug` | JMAP anchor not found | The anchor object ID referenced in a paginated query was not found; the result window cannot be positioned. |
| `jmap.unsupported-filter` | `debug` | Unsupported JMAP filter | The client used a filter operator or property that is not supported by this server implementation. |
| `jmap.unsupported-sort` | `debug` | Unsupported JMAP sort | The client requested sorting by a property that is not supported by this server implementation. |
| `jmap.unknown-method` | `debug` | Unknown JMAP method | The client called a method name that is not recognized; check that the required capability is included in the session. |
| `jmap.invalid-result-reference` | `debug` | Invalid JMAP result reference | A back-reference to a previous method result in the same request was invalid or pointed to a non-existent result. |
| `jmap.forbidden` | `debug` | JMAP operation forbidden | The authenticated account does not have permission to perform this JMAP operation on the requested resource. |
| `jmap.account-not-found` | `debug` | JMAP account not found | The account ID supplied in the JMAP request does not exist or is not accessible to the authenticated user. |
| `jmap.account-not-supported-by-method` | `debug` | JMAP account not supported by method | The requested JMAP method is not available for the specified account type. |
| `jmap.account-read-only` | `debug` | JMAP account is read-only | The client attempted a write operation on an account that only allows read access. |
| `jmap.not-found` | `debug` | JMAP resource not found | The requested object ID does not exist in the account or has been destroyed. |
| `jmap.cannot-calculate-changes` | `debug` | Cannot calculate JMAP changes | The server cannot compute the change delta since the client's state token; the client must perform a full resync. |
| `jmap.unknown-data-type` | `debug` | Unknown JMAP data type | The client referenced a data type that is not supported or not enabled via the session capabilities. |
| `jmap.unknown-capability` | `debug` | Unknown JMAP capability | The request included a capability URI that the server does not recognize. |
| `jmap.not-json` | `debug` | JMAP request is not JSON | The request body could not be parsed as JSON; the entire JMAP request is rejected. |
| `jmap.not-request` | `debug` | JMAP input is not a request | The JSON body was valid but did not conform to the JMAP Request object structure. |
| `jmap.websocket-start` | `debug` | JMAP WebSocket connection started | A client established a JMAP-over-WebSocket connection for push updates and multiplexed API calls. |
| `jmap.websocket-stop` | `debug` | JMAP WebSocket connection stopped | A JMAP WebSocket connection was closed by the client or due to a timeout. |
| `jmap.websocket-error` | `debug` | JMAP WebSocket error | An error occurred on a JMAP WebSocket connection; the connection may have been terminated. |


## Limit

| Event | Level | Short | Long |
|---|---|---|---|
| `limit.size-request` | `debug` | Request size limit reached | The incoming request body exceeds the configured maximum request size; the request is rejected. |
| `limit.size-upload` | `debug` | Upload size limit reached | The uploaded blob exceeds the configured maximum upload size; the upload is rejected. |
| `limit.calls-in` | `debug` | Incoming calls limit reached | The number of method calls in a single JMAP request exceeds the server's configured maximum. |
| `limit.concurrent-request` | `debug` | Concurrent request limit reached | The number of simultaneous in-flight requests from this account or IP has reached the configured limit; the request is rejected. |
| `limit.concurrent-upload` | `debug` | Concurrent upload limit reached | The number of simultaneous blob uploads from this account has reached the configured limit. |
| `limit.concurrent-connection` | `warn` | Concurrent connection limit reached | The number of simultaneous connections from this IP or account has reached the configured limit; new connections are refused. |
| `limit.quota` | `debug` | Quota limit reached | The account's storage quota has been reached; new messages or objects cannot be stored until space is freed. |
| `limit.blob-quota` | `debug` | Blob quota limit reached | The account's blob storage quota has been reached; blob uploads will be rejected until space is freed. |
| `limit.tenant-quota` | `info` | Tenant quota limit reached | A tenant-level quota (users, domains, or storage) has been reached; operations that would exceed it are being rejected. |
| `limit.too-many-requests` | `warn` | Too many requests | The client has exceeded the configured request rate limit; requests are being throttled until the window resets. |


## MailAuth

| Event | Level | Short | Long |
|---|---|---|---|
| `mail-auth.parse-error` | `debug` | Mail authentication parse error | A DKIM, SPF, or ARC header could not be parsed; the affected authentication check will be skipped for this message. |
| `mail-auth.missing-parameters` | `debug` | Missing mail authentication parameters | A required parameter for mail authentication (e.g. a mandatory DKIM tag) was absent; the check cannot proceed. |
| `mail-auth.no-headers-found` | `debug` | No headers found in message | The message contains no headers relevant to mail authentication; signing or verification cannot be performed. |
| `mail-auth.crypto` | `debug` | Crypto error during mail authentication | A cryptographic operation (signing or verification) failed during mail authentication processing. |
| `mail-auth.io` | `debug` | I/O error during mail authentication | An I/O error occurred while reading message data for mail authentication processing. |
| `mail-auth.base64` | `debug` | Base64 error during mail authentication | A base64-encoded value in a mail authentication header (e.g. a DKIM signature) could not be decoded. |
| `mail-auth.dns-error` | `debug` | DNS error | A DNS query required for mail authentication (e.g. fetching a DKIM public key or SPF record) returned an error. |
| `mail-auth.dns-record-not-found` | `debug` | DNS record not found | The DNS record needed for mail authentication (e.g. a DKIM key or SPF policy) does not exist. |
| `mail-auth.dns-invalid-record-type` | `debug` | Invalid DNS record type | The DNS response for a mail authentication lookup returned an unexpected record type. |
| `mail-auth.policy-not-aligned` | `debug` | Policy not aligned | The authenticated domain does not align with the message's From header as required by DMARC policy. |


## ManageSieve

| Event | Level | Short | Long |
|---|---|---|---|
| `manage-sieve.connection-start` | `debug` | ManageSieve connection started | A new ManageSieve client connection was accepted; the client can now upload, download, and manage Sieve filter scripts. |
| `manage-sieve.connection-end` | `debug` | ManageSieve connection ended | A ManageSieve client connection was closed, either by logout, timeout, or error. |
| `manage-sieve.create-script` | `debug` | ManageSieve CREATE script command | Client created a script |
| `manage-sieve.update-script` | `debug` | ManageSieve UPDATE script command | Client updated a script |
| `manage-sieve.get-script` | `debug` | ManageSieve GET script command | Client fetched a script |
| `manage-sieve.delete-script` | `debug` | ManageSieve DELETE script command | Client deleted a script |
| `manage-sieve.rename-script` | `debug` | ManageSieve RENAME script command | Client renamed a script |
| `manage-sieve.check-script` | `debug` | ManageSieve CHECK script command | Client checked a script |
| `manage-sieve.have-space` | `debug` | ManageSieve HAVESPACE command | Client checked for space |
| `manage-sieve.list-scripts` | `debug` | ManageSieve LIST scripts command | Client listed scripts |
| `manage-sieve.set-active` | `debug` | ManageSieve SET ACTIVE command | Client set an active script |
| `manage-sieve.capabilities` | `debug` | ManageSieve CAPABILITIES command | Client requested server capabilities |
| `manage-sieve.start-tls` | `debug` | ManageSieve STARTTLS command | Client requested TLS |
| `manage-sieve.unauthenticate` | `debug` | ManageSieve UNAUTHENTICATE command | Client unauthenticated |
| `manage-sieve.logout` | `debug` | ManageSieve LOGOUT command | Client logged out |
| `manage-sieve.noop` | `debug` | ManageSieve NOOP command | Client sent a NOOP command |
| `manage-sieve.error` | `debug` | ManageSieve error occurred | An error occurred during a ManageSieve command |
| `manage-sieve.raw-input` | `trace` | Raw ManageSieve input received | Raw bytes received from the ManageSieve client; logged at trace level for low-level protocol debugging. |
| `manage-sieve.raw-output` | `trace` | Raw ManageSieve output sent | Raw bytes sent to the ManageSieve client; logged at trace level for low-level protocol debugging. |


## MessageIngest

| Event | Level | Short | Long |
|---|---|---|---|
| `message-ingest.ham` | `info` | Message ingested | An inbound message passed spam checks and was successfully delivered to the recipient's mailbox. |
| `message-ingest.spam` | `info` | Possible spam message ingested | An inbound message was classified as likely spam and delivered to the Junk folder rather than the inbox. |
| `message-ingest.imap-append` | `info` | Message appended via IMAP | A message was directly appended to a mailbox by an IMAP client using the APPEND command. |
| `message-ingest.jmap-append` | `info` | Message appended via JMAP | A message was directly appended to a mailbox via the JMAP Email/import method. |
| `message-ingest.duplicate` | `info` | Skipping duplicate message | An incoming message was detected as a duplicate of one already delivered; it has been discarded to prevent duplicates in the mailbox. |
| `message-ingest.error` | `error` | Message ingestion error | An error occurred while storing an inbound message; the message may not have been delivered to the recipient. |
| `message-ingest.search-index` | `info` | Search index updated | The full-text search index was updated after a new message was ingested or an existing message was modified. |


## Milter

| Event | Level | Short | Long |
|---|---|---|---|
| `milter.read` | `trace` | Reading from Milter | Raw data was read from the Milter socket; logged at trace level for low-level Milter protocol debugging. |
| `milter.write` | `trace` | Writing to Milter | Raw data was written to the Milter socket; logged at trace level for low-level Milter protocol debugging. |
| `milter.action-accept` | `info` | Milter action: Accept | The Milter requested to accept the message |
| `milter.action-discard` | `info` | Milter action: Discard | The Milter requested to discard the message |
| `milter.action-reject` | `info` | Milter action: Reject | The Milter requested to reject the message |
| `milter.action-temp-fail` | `info` | Milter action: Temporary failure | The Milter requested to temporarily fail the message |
| `milter.action-reply-code` | `info` | Milter action: Reply code | The Milter requested a reply code |
| `milter.action-connection-failure` | `info` | Milter action: Connection failure | The Milter requested a connection failure |
| `milter.action-shutdown` | `info` | Milter action: Shutdown | The Milter requested a shutdown |
| `milter.io-error` | `warn` | Milter I/O error | An I/O error occurred with the Milter |
| `milter.frame-too-large` | `warn` | Milter frame too large | The Milter frame was too large |
| `milter.frame-invalid` | `warn` | Invalid Milter frame | The Milter frame was invalid |
| `milter.unexpected-response` | `warn` | Unexpected Milter response | An unexpected response was received from the Milter |
| `milter.timeout` | `warn` | Milter timeout | A timeout occurred with the Milter |
| `milter.tls-invalid-name` | `warn` | Invalid TLS name for Milter | The Milter TLS name is invalid |
| `milter.disconnected` | `warn` | Milter disconnected | The Milter disconnected |
| `milter.parse-error` | `warn` | Milter parse error | An error occurred while parsing the Milter response |


## MtaHook

| Event | Level | Short | Long |
|---|---|---|---|
| `mta-hook.action-accept` | `info` | MTA hook action: Accept | The MTA hook requested to accept the message |
| `mta-hook.action-discard` | `info` | MTA hook action: Discard | The MTA hook requested to discard the message |
| `mta-hook.action-reject` | `info` | MTA hook action: Reject | The MTA hook requested to reject the message |
| `mta-hook.action-quarantine` | `info` | MTA hook action: Quarantine | The MTA hook requested to quarantine the message |
| `mta-hook.error` | `warn` | MTA hook error | An error occurred with the MTA hook |


## MtaSts

| Event | Level | Short | Long |
|---|---|---|---|
| `mta-sts.authorized` | `info` | Host authorized by MTA-STS policy | The remote mail server's hostname matches the MTA-STS policy for the recipient domain; the TLS connection is permitted. |
| `mta-sts.not-authorized` | `info` | Host not authorized by MTA-STS policy | The remote mail server's hostname is not listed in the MTA-STS policy; delivery may be blocked depending on the policy mode. |
| `mta-sts.policy-fetch` | `info` | Fetched MTA-STS policy | The MTA-STS policy for the recipient domain was successfully retrieved and cached for outbound delivery decisions. |
| `mta-sts.policy-not-found` | `info` | MTA-STS policy not found | No MTA-STS policy exists for this recipient domain; TLS enforcement via MTA-STS is not applied. |
| `mta-sts.policy-fetch-error` | `info` | Error fetching MTA-STS policy | The MTA-STS policy could not be retrieved from the domain's HTTPS endpoint; TLS enforcement may fall back to best-effort. |
| `mta-sts.invalid-policy` | `info` | Invalid MTA-STS policy | The retrieved MTA-STS policy file is malformed or contains invalid directives; it cannot be applied. |


## Network

| Event | Level | Short | Long |
|---|---|---|---|
| `network.listen-start` | `info` | Network listener started | A network listener is now accepting connections on the configured address and port. |
| `network.listen-stop` | `info` | Network listener stopped | A network listener has been shut down and is no longer accepting new connections. |
| `network.listen-error` | `error` | Network listener error | The network listener encountered a fatal error and may have stopped accepting connections. |
| `network.bind-error` | `error` | Network bind error | Failed to bind the listener to the configured address and port; the port may already be in use or permissions may be insufficient. |
| `network.read-error` | `trace` | Network read error | An error occurred while reading data from a client connection; the connection may have been dropped by the client. |
| `network.write-error` | `trace` | Network write error | An error occurred while writing data to a client connection; the connection may have been closed unexpectedly. |
| `network.flush-error` | `trace` | Network flush error | An error occurred while flushing buffered data to a client connection. |
| `network.accept-error` | `debug` | Network accept error | An error occurred while accepting a new incoming connection; this is often transient and the listener continues running. |
| `network.split-error` | `error` | Network split error | An error occurred while splitting a TLS stream into read and write halves; the connection cannot be used. |
| `network.timeout` | `debug` | Network timeout | A network operation exceeded its configured timeout; the connection will be closed. |
| `network.closed` | `trace` | Network connection closed | A network connection was closed cleanly after completing its session. |
| `network.proxy-error` | `warn` | Proxy protocol error | The PROXY protocol header from the upstream load balancer was missing or malformed; the real client IP cannot be determined. |
| `network.set-opt-error` | `error` | Network set option error | Failed to set a socket option (e.g. TCP keepalive or buffer size) on a connection; the connection may behave unexpectedly. |


## OutgoingReport

| Event | Level | Short | Long |
|---|---|---|---|
| `outgoing-report.spf-report` | `info` | SPF report sent | An SPF failure report was sent to the address specified in the domain's SPF record. |
| `outgoing-report.spf-rate-limited` | `info` | SPF report rate limited | An SPF failure report was suppressed because the reporting rate limit for this domain has been reached. |
| `outgoing-report.dkim-report` | `info` | DKIM report sent | A DKIM failure report was sent to the address specified in the DKIM signature's reporting tag. |
| `outgoing-report.dkim-rate-limited` | `info` | DKIM report rate limited | A DKIM failure report was suppressed because the reporting rate limit for this selector has been reached. |
| `outgoing-report.dmarc-report` | `info` | DMARC report sent | A DMARC failure report was sent to the address specified in the domain's DMARC policy record. |
| `outgoing-report.dmarc-rate-limited` | `info` | DMARC report rate limited | A DMARC failure report was suppressed because the reporting rate limit for this domain has been reached. |
| `outgoing-report.dmarc-aggregate-report` | `info` | DMARC aggregate is being prepared | A DMARC aggregate report is being compiled and will be sent to the domain's rua address at the scheduled interval. |
| `outgoing-report.tls-aggregate` | `info` | TLS aggregate report is being prepared | A TLS-RPT aggregate report is being compiled and will be sent to the domain's TLS reporting address at the scheduled interval. |
| `outgoing-report.http-submission` | `info` | Report submitted via HTTP | The report was submitted to the recipient's reporting endpoint via an HTTP POST request. |
| `outgoing-report.unauthorized-reporting-address` | `info` | Unauthorized reporting address | The external reporting address for this domain is not authorized via a DNS verification record; the report will not be sent. |
| `outgoing-report.reporting-address-validation-error` | `info` | Error validating reporting address | The DNS verification check for the external reporting address failed; the report cannot be sent to that address. |
| `outgoing-report.not-found` | `info` | Report not found | The report referenced for submission could not be found in the queue; it may have already been sent or expired. |
| `outgoing-report.submission-error` | `info` | Error submitting report | An error occurred while submitting the report via email or HTTP; the submission may be retried. |
| `outgoing-report.no-recipients-found` | `info` | No recipients found for report | No valid reporting addresses were found for this domain; the report will not be sent. |
| `outgoing-report.locked` | `info` | Report is locked by another process | Another cluster node is currently processing this report; this node will skip it to avoid duplicate submissions. |
| `outgoing-report.max-size-exceeded` | `debug` | Report size exceeds maximum | The compiled report exceeds the configured maximum size and will be truncated or split before sending. |


## Pop3

| Event | Level | Short | Long |
|---|---|---|---|
| `pop3.connection-start` | `debug` | POP3 connection started | A new POP3 client connection was accepted; the server will begin processing POP3 commands from this client. |
| `pop3.connection-end` | `debug` | POP3 connection ended | A POP3 client connection was closed, either by the client sending QUIT or due to a timeout or error. |
| `pop3.delete` | `debug` | POP3 DELETE command | Client deleted a message |
| `pop3.reset` | `debug` | POP3 RESET command | Client reset the session |
| `pop3.quit` | `debug` | POP3 QUIT command | Client quit the session |
| `pop3.fetch` | `debug` | POP3 FETCH command | Client fetched a message |
| `pop3.list` | `debug` | POP3 LIST command | Client listed messages |
| `pop3.list-message` | `debug` | POP3 LIST specific message command | Client listed a specific message |
| `pop3.uidl` | `debug` | POP3 UIDL command | Client requested unique identifiers |
| `pop3.uidl-message` | `debug` | POP3 UIDL specific message command | Client requested a specific unique identifier |
| `pop3.stat` | `debug` | POP3 STAT command | Client requested mailbox status |
| `pop3.noop` | `debug` | POP3 NOOP command | Client sent a NOOP command |
| `pop3.capabilities` | `debug` | POP3 CAPABILITIES command | Client requested server capabilities |
| `pop3.start-tls` | `debug` | POP3 STARTTLS command | Client requested TLS |
| `pop3.utf8` | `debug` | POP3 UTF8 command | Client requested UTF-8 support |
| `pop3.error` | `debug` | POP3 error occurred | An error occurred during a POP3 command |
| `pop3.raw-input` | `trace` | Raw POP3 input received | Raw bytes received from the POP3 client; logged at trace level for low-level POP3 session debugging. |
| `pop3.raw-output` | `trace` | Raw POP3 output sent | Raw bytes sent to the POP3 client; logged at trace level for low-level POP3 session debugging. |


## PushSubscription

| Event | Level | Short | Long |
|---|---|---|---|
| `push-subscription.success` | `trace` | Push subscription successful | A push notification was successfully delivered to the client's registered push endpoint. |
| `push-subscription.error` | `debug` | Push subscription error | A push notification could not be delivered to the client's endpoint; the subscription may be stale or the endpoint unreachable. |
| `push-subscription.not-found` | `debug` | Push subscription not found | A push notification could not be sent because the referenced subscription no longer exists in the database. |


## Queue

| Event | Level | Short | Long |
|---|---|---|---|
| `queue.started` | `info` | MTA queue started | The outbound MTA message queue has started and is ready to process and deliver queued messages. |
| `queue.message-queued` | `info` | Queued message for delivery | An inbound message was accepted and placed into the outbound delivery queue for processing. |
| `queue.authenticated-message-queued` | `info` | Queued message submission for delivery | A message submitted by an authenticated SMTP client was accepted and placed into the outbound delivery queue. |
| `queue.report-queued` | `info` | Queued report for delivery | A DMARC, TLS-RPT, or ARF report was placed into the delivery queue for sending to the recipient domain. |
| `queue.dsn-queued` | `info` | Queued DSN for delivery | A delivery status notification (bounce or success) was placed into the queue for delivery back to the original sender. |
| `queue.autogenerated-queued` | `info` | Queued autogenerated message for delivery | A system-generated message (e.g. calendar notification or auto-reply) was placed into the delivery queue. |
| `queue.rescheduled` | `info` | Message rescheduled for delivery | A delivery attempt failed with a temporary error; the message has been rescheduled for a later retry. |
| `queue.locked` | `debug` | Queue event is locked by another process | Another cluster node is already processing this queue event; this node will skip it to avoid duplicate delivery attempts. |
| `queue.blob-not-found` | `debug` | Message blob not found | The message body blob referenced by a queue entry could not be found in the blob store; the message cannot be delivered. |
| `queue.rate-limit-exceeded` | `info` | Rate limit exceeded | The outbound rate limit for the destination domain or relay has been reached; delivery is deferred until the window resets. |
| `queue.concurrency-limit-exceeded` | `info` | Concurrency limit exceeded | The maximum number of simultaneous outbound delivery connections has been reached; new deliveries are deferred. |
| `queue.quota-exceeded` | `info` | Quota exceeded | The outbound queue size limit has been reached; new messages cannot be queued until existing ones are delivered or expired. |
| `queue.back-pressure` | `warn` | Queue backpressure detected | Queue congested, processing can't keep up with incoming message rate |


## Registry

| Event | Level | Short | Long |
|---|---|---|---|
| `registry.local-read-error` | `error` | Local registry read error | The local configuration registry file could not be read; the server may be running with a stale or default configuration. |
| `registry.local-write-error` | `error` | Local registry write error | A configuration change could not be persisted to the local registry file; the change may be lost on restart. |
| `registry.local-parse-error` | `error` | Local registry parse error | The local registry file contains invalid syntax or structure and could not be parsed; configuration may not load correctly. |
| `registry.read-error` | `error` | Registry read error | The remote or distributed registry store returned an error on read; configuration retrieval may be incomplete. |
| `registry.write-error` | `error` | Registry write error | A configuration change could not be written to the registry store; the change will not be persisted. |
| `registry.deserialization-error` | `error` | Registry deserialization error | A registry entry could not be deserialized; it may have been written by an incompatible version of the server. |
| `registry.build-error` | `error` | Configuration build error | The server configuration could not be assembled from registry entries; the server may not start or reload correctly. |
| `registry.build-warning` | `warn` | Configuration build warning | A non-fatal issue was encountered while building the configuration; the server will continue but some settings may be ignored. |
| `registry.not-supported` | `debug` | Operation not supported by local registry | The requested registry operation is not available when using the local file-based registry backend. |
| `registry.validation-error` | `error` | Object validation error | A configuration object failed schema validation; the invalid entry will not be applied. |


## Resource

| Event | Level | Short | Long |
|---|---|---|---|
| `resource.not-found` | `debug` | Resource not found | A requested static or dynamic resource (e.g. a web asset or lookup file) was not found. |
| `resource.bad-parameters` | `error` | Bad resource parameters | A resource request contained invalid or missing parameters; the request cannot be fulfilled. |
| `resource.error` | `error` | Resource error | An unexpected error occurred while serving or loading a resource. |
| `resource.download-external` | `info` | Downloading external resource | An external resource (e.g. a blocklist or lookup file) is being fetched from a remote URL. |
| `resource.application-updated` | `info` | Application resource updated | An external web application resource (e.g. a web admin interface) has been updated. |
| `resource.application-unpacked` | `debug` | Application resource unpacked | An external web application resource has been unpacked to a local directory and is ready to be served. |


## Security

| Event | Level | Short | Long |
|---|---|---|---|
| `security.authentication-ban` | `info` | Banned due to authentication errors | IP address was banned due to multiple authentication errors |
| `security.abuse-ban` | `info` | Banned due to abuse | IP address was banned due to abuse, such as RCPT TO attacks |
| `security.scan-ban` | `info` | Banned due to scan | IP address was banned due to exploit scanning |
| `security.loiter-ban` | `info` | Banned due to loitering | IP address was banned due to multiple loitering events |
| `security.ip-blocked` | `info` | Blocked IP address | Rejected connection from blocked IP address |
| `security.ip-block-expired` | `info` | IP block expired | A temporary IP block has passed its expiry time and has been removed; the IP may now connect again. |
| `security.ip-allow-expired` | `info` | IP allow expired | A temporary IP allowlist entry has passed its expiry time and has been removed; the IP is subject to normal access rules again. |
| `security.ip-unauthorized` | `info` | Unauthorized IP address | IP address is not authorized to authenticate using this credential |
| `security.unauthorized` | `info` | Unauthorized access | Account does not have permission to access resource |


## Server

| Event | Level | Short | Long |
|---|---|---|---|
| `server.startup` | `info` | Starting Stalwart Server | The server has finished initializing all subsystems and is now accepting connections. |
| `server.shutdown` | `info` | Shutting down Stalwart Server | A graceful shutdown has been initiated; active connections will be drained before the process exits. |
| `server.startup-error` | `error` | Server startup error | A fatal error occurred during server initialization; the server was unable to start. |
| `server.thread-error` | `error` | Server thread error | A background worker thread panicked or encountered an unrecoverable error. |
| `server.licensing` | `info` | Server licensing event | A license-related event occurred, such as license validation, expiry warning, or activation. |
| `server.recovery-mode` | `warn` | Server started in recovery mode | The server has started in recovery mode to allow for maintenance or troubleshooting. |
| `server.bootstrap-mode` | `warn` | Server started in bootstrap mode | The server has started in bootstrap mode to allow for initial configuration load. |


## Sieve

| Event | Level | Short | Long |
|---|---|---|---|
| `sieve.action-accept` | `debug` | Sieve action: Accept | The Sieve script requested to accept the message |
| `sieve.action-accept-replace` | `debug` | Sieve action: Accept and replace | The Sieve script requested to accept the message and replace its contents |
| `sieve.action-discard` | `debug` | Sieve action: Discard | The Sieve script requested to discard the message |
| `sieve.action-reject` | `debug` | Sieve action: Reject | The Sieve script requested to reject the message |
| `sieve.send-message` | `info` | Sieve sending message | A Sieve script triggered a redirect, vacation reply, or other outbound message action. |
| `sieve.message-too-large` | `warn` | Sieve message too large | The Sieve script attempted to send a message that exceeds the configured size limit; the action is aborted. |
| `sieve.script-not-found` | `warn` | Sieve script not found | A Sieve script referenced by name in a configuration rule or include action was not found. |
| `sieve.list-not-found` | `warn` | Sieve list not found | A Sieve script referenced a lookup list (e.g. for address matching) that does not exist. |
| `sieve.runtime-error` | `debug` | Sieve runtime error | A Sieve script encountered a recoverable runtime error during execution; the failing action may be skipped. |
| `sieve.unexpected-error` | `error` | Unexpected Sieve error | An unexpected internal error occurred while executing a Sieve script; message processing may be incomplete. |
| `sieve.not-supported` | `warn` | Sieve action not supported | A Sieve script attempted to use an action or extension that is not supported or not enabled on this server. |
| `sieve.quota-exceeded` | `warn` | Sieve quota exceeded | The Sieve script exceeded the configured resource quota (e.g. redirect count or message size); further actions are blocked. |


## Smtp

| Event | Level | Short | Long |
|---|---|---|---|
| `smtp.connection-start` | `debug` | SMTP connection started | A new SMTP connection was started |
| `smtp.connection-end` | `debug` | SMTP connection ended | The SMTP connection was ended |
| `smtp.error` | `debug` | SMTP error occurred | An error occurred during an SMTP command |
| `smtp.id-not-found` | `warn` | Strategy not found | The strategy ID was not found in the configuration |
| `smtp.concurrency-limit-exceeded` | `info` | Concurrency limit exceeded | The concurrency limit was exceeded |
| `smtp.transfer-limit-exceeded` | `info` | Transfer limit exceeded | The remote host transferred more data than allowed |
| `smtp.rate-limit-exceeded` | `info` | Rate limit exceeded | The rate limit was exceeded |
| `smtp.time-limit-exceeded` | `info` | Time limit exceeded | The remote host kept the SMTP session open too long |
| `smtp.missing-auth-directory` | `info` | Missing auth directory | The auth directory was missing |
| `smtp.message-parse-failed` | `info` | Message parsing failed | Failed to parse the message |
| `smtp.message-too-large` | `info` | Message too large | The message was rejected because it was too large |
| `smtp.loop-detected` | `info` | Mail loop detected | A mail loop was detected, the message contains too many Received headers |
| `smtp.dkim-pass` | `info` | DKIM verification passed | Successful DKIM verification |
| `smtp.dkim-fail` | `info` | DKIM verification failed | Failed to verify DKIM signature |
| `smtp.arc-pass` | `info` | ARC verification passed | Successful ARC verification |
| `smtp.arc-fail` | `info` | ARC verification failed | Failed to verify ARC signature |
| `smtp.spf-ehlo-pass` | `info` | SPF EHLO check passed | EHLO identity passed SPF check |
| `smtp.spf-ehlo-fail` | `info` | SPF EHLO check failed | EHLO identity failed SPF check |
| `smtp.spf-from-pass` | `info` | SPF From check passed | MAIL FROM identity passed SPF check |
| `smtp.spf-from-fail` | `info` | SPF From check failed | MAIL FROM identity failed SPF check |
| `smtp.dmarc-pass` | `info` | DMARC check passed | Successful DMARC verification |
| `smtp.dmarc-fail` | `info` | DMARC check failed | Failed to verify DMARC policy |
| `smtp.iprev-pass` | `info` | IPREV check passed | Reverse IP check passed |
| `smtp.iprev-fail` | `info` | IPREV check failed | Reverse IP check failed |
| `smtp.too-many-messages` | `info` | Too many messages | The remote server exceeded the number of messages allowed per session |
| `smtp.ehlo` | `info` | SMTP EHLO command | The remote server sent an EHLO command |
| `smtp.invalid-ehlo` | `info` | Invalid EHLO command | The remote server sent an invalid EHLO command |
| `smtp.did-not-say-ehlo` | `debug` | Client did not say EHLO | The remote server did not send EHLO command |
| `smtp.ehlo-expected` | `debug` | EHLO command expected | The remote server sent a LHLO command while EHLO was expected |
| `smtp.lhlo-expected` | `debug` | LHLO command expected | The remote server sent an EHLO command while LHLO was expected |
| `smtp.mail-from-unauthenticated` | `debug` | MAIL FROM without authentication | The remote client did not authenticate before sending MAIL FROM |
| `smtp.mail-from-unauthorized` | `debug` | MAIL FROM unauthorized | The remote client is not authorized to send mail from the given address |
| `smtp.mail-from-not-allowed` | `debug` | MAIL FROM not allowed | The remote client is not allowed to send mail from this address |
| `smtp.mail-from-rewritten` | `debug` | MAIL FROM address rewritten | The envelope sender address was rewritten |
| `smtp.mail-from-missing` | `debug` | MAIL FROM address missing | The remote client issued an RCPT TO command before MAIL FROM |
| `smtp.mail-from` | `info` | SMTP MAIL FROM command | The remote client sent a MAIL FROM command |
| `smtp.multiple-mail-from` | `debug` | Multiple MAIL FROM commands | The remote client already sent a MAIL FROM command |
| `smtp.mailbox-does-not-exist` | `info` | Mailbox does not exist | The mailbox does not exist on the server |
| `smtp.relay-not-allowed` | `info` | Relay not allowed | The server does not allow relaying |
| `smtp.rcpt-to` | `info` | SMTP RCPT TO command | The remote client sent an RCPT TO command |
| `smtp.rcpt-to-duplicate` | `debug` | Duplicate RCPT TO | The remote client already sent an RCPT TO command for this recipient |
| `smtp.rcpt-to-rewritten` | `debug` | RCPT TO address rewritten | The envelope recipient address was rewritten |
| `smtp.rcpt-to-missing` | `debug` | RCPT TO address missing | The remote client issued a DATA command before RCPT TO |
| `smtp.rcpt-to-greylisted` | `info` | RCPT TO greylisted | The recipient was greylisted |
| `smtp.too-many-recipients` | `info` | Too many recipients | The remote client exceeded the number of recipients allowed |
| `smtp.too-many-invalid-rcpt` | `info` | Too many invalid recipients | The remote client exceeded the number of invalid RCPT TO commands allowed |
| `smtp.raw-input` | `trace` | Raw SMTP input received | Raw bytes received from the remote SMTP client; logged at trace level for low-level SMTP session debugging. |
| `smtp.raw-output` | `trace` | Raw SMTP output sent | Raw bytes sent to the remote SMTP client; logged at trace level for low-level SMTP session debugging. |
| `smtp.missing-local-hostname` | `warn` | Missing local hostname | The local hostname is missing in the configuration |
| `smtp.vrfy` | `info` | SMTP VRFY command | The remote client sent a VRFY command |
| `smtp.vrfy-not-found` | `info` | VRFY address not found | The remote client sent a VRFY command for an address that was not found |
| `smtp.vrfy-disabled` | `info` | VRFY command disabled | The VRFY command is disabled |
| `smtp.expn` | `info` | SMTP EXPN command | The remote client sent an EXPN command |
| `smtp.expn-not-found` | `info` | EXPN address not found | The remote client sent an EXPN command for an address that was not found |
| `smtp.expn-disabled` | `info` | EXPN command disabled | The EXPN command is disabled |
| `smtp.require-tls-disabled` | `debug` | REQUIRETLS extension disabled | The REQUIRETLS extension is disabled |
| `smtp.deliver-by-disabled` | `debug` | DELIVERBY extension disabled | The DELIVERBY extension is disabled |
| `smtp.deliver-by-invalid` | `debug` | Invalid DELIVERBY parameter | The DELIVERBY parameter is invalid |
| `smtp.future-release-disabled` | `debug` | FUTURE RELEASE extension disabled | The FUTURE RELEASE extension is disabled |
| `smtp.future-release-invalid` | `debug` | Invalid FUTURE RELEASE parameter | The FUTURE RELEASE parameter is invalid |
| `smtp.mt-priority-disabled` | `debug` | MT-PRIORITY extension disabled | The MT-PRIORITY extension is disabled |
| `smtp.mt-priority-invalid` | `debug` | Invalid MT-PRIORITY parameter | The MT-PRIORITY parameter is invalid |
| `smtp.dsn-disabled` | `debug` | DSN extension disabled | The DSN extension is disabled |
| `smtp.auth-not-allowed` | `info` | Authentication not allowed | Authentication is not allowed on this listener |
| `smtp.auth-mechanism-not-supported` | `info` | Auth mechanism not supported | The requested authentication mechanism is not supported |
| `smtp.auth-exchange-too-long` | `debug` | Auth exchange too long | The authentication exchange was too long |
| `smtp.already-authenticated` | `debug` | Already authenticated | The client is already authenticated |
| `smtp.noop` | `debug` | SMTP NOOP command | The remote client sent a NOOP command |
| `smtp.start-tls` | `debug` | SMTP STARTTLS command | The remote client requested a TLS connection |
| `smtp.start-tls-unavailable` | `debug` | STARTTLS unavailable | The remote client requested a TLS connection but it is not available |
| `smtp.start-tls-already` | `debug` | TLS already active | TLS is already active |
| `smtp.rset` | `debug` | SMTP RSET command | The remote client sent a RSET command |
| `smtp.quit` | `debug` | SMTP QUIT command | The remote client sent a QUIT command |
| `smtp.help` | `debug` | SMTP HELP command | The remote client sent a HELP command |
| `smtp.command-not-implemented` | `debug` | Command not implemented | The server does not implement the requested command |
| `smtp.invalid-command` | `debug` | Invalid command | The remote client sent an invalid command |
| `smtp.invalid-sender-address` | `debug` | Invalid sender address | The specified sender address is invalid |
| `smtp.invalid-recipient-address` | `debug` | Invalid recipient address | The specified recipient address is invalid |
| `smtp.invalid-parameter` | `debug` | Invalid parameter | The command contained an invalid parameter |
| `smtp.unsupported-parameter` | `debug` | Unsupported parameter | The command contained an unsupported parameter |
| `smtp.syntax-error` | `debug` | Syntax error | The command contained a syntax error |
| `smtp.request-too-large` | `info` | Request too large | The request was too large |


## Spam

| Event | Level | Short | Long |
|---|---|---|---|
| `spam.pyzor` | `debug` | Pyzor success | A Pyzor collaborative spam hash check completed successfully; the result is used as a spam scoring signal. |
| `spam.pyzor-error` | `debug` | Pyzor error | The Pyzor network query failed; this spam signal will be unavailable for this message. |
| `spam.dnsbl` | `debug` | DNSBL query | A DNS blocklist lookup completed; the result is used as a spam scoring signal for the message. |
| `spam.dnsbl-error` | `debug` | Error querying DNSBL | A DNS blocklist lookup failed due to a DNS error; this blocklist signal will be unavailable for this message. |
| `spam.train-started` | `info` | Spam classifier training started | The SGD logistic regression spam classifier has begun a training run on accumulated samples. |
| `spam.train-completed` | `info` | Spam classifier training completed | The SGD logistic regression spam classifier training run finished; the updated model is now active. |
| `spam.train-sample-added` | `debug` | New training sample added | A user-classified message (spam or ham) was added to the training corpus for the next classifier training run. |
| `spam.train-sample-not-found` | `warn` | Training sample not found | A training sample referenced during a training run could not be found in the store; it will be skipped. |
| `spam.classify` | `debug` | Classifying message for spam | The spam classifier is scoring the message using the trained model and configured rules. |
| `spam.model-loaded` | `info` | Spam classifier model loaded | The trained spam classifier model was loaded from storage and is ready to classify incoming messages. |
| `spam.model-not-ready` | `info` | Spam classifier model not ready | The spam classifier has not yet been trained with enough samples to produce reliable results; classification is skipped. |
| `spam.model-not-found` | `info` | Spam classifier model not found | No trained spam classifier model exists yet; the classifier will be unavailable until sufficient training samples are provided. |
| `spam.rules-updated` | `info` | Spam filter rules updated | The spam filter ruleset was reloaded after a configuration or remote update. |


## Spf

| Event | Level | Short | Long |
|---|---|---|---|
| `spf.pass` | `debug` | SPF check passed | The sending server's IP is explicitly authorized to send mail for the domain in the SPF record. |
| `spf.fail` | `debug` | SPF check failed | The sending server's IP is explicitly not authorized; the message should be rejected or marked per DMARC policy. |
| `spf.soft-fail` | `debug` | SPF soft fail | The sending server's IP is not authorized but the domain owner prefers the message be accepted with a warning rather than rejected. |
| `spf.neutral` | `debug` | SPF neutral result | The domain's SPF record makes no assertion about the sending IP; the result is treated as if no record exists. |
| `spf.temp-error` | `debug` | SPF temporary error | A transient DNS error prevented the SPF check from completing; the result is treated as neutral for this message. |
| `spf.perm-error` | `debug` | SPF permanent error | The SPF record is syntactically invalid or caused a lookup limit to be exceeded; the check result is indeterminate. |
| `spf.none` | `debug` | No SPF record | No SPF record was published for the sending domain; the check result is none and no authorization decision can be made. |


## Store

| Event | Level | Short | Long |
|---|---|---|---|
| `store.assert-value-failed` | `error` | Another process modified the record | An optimistic locking conflict was detected; another process updated the same record concurrently and the operation must be retried. |
| `store.foundationdb-error` | `error` | FoundationDB error | An error was returned by the FoundationDB backend; check FoundationDB cluster health and connectivity. |
| `store.mysql-error` | `error` | MySQL error | An error was returned by the MySQL backend; check database connectivity, credentials, and query logs. |
| `store.postgresql-error` | `error` | PostgreSQL error | An error was returned by the PostgreSQL backend; check database connectivity, credentials, and query logs. |
| `store.rocksdb-error` | `error` | RocksDB error | An error was returned by the RocksDB embedded store; this may indicate disk issues or a corrupted database file. |
| `store.sqlite-error` | `error` | SQLite error | An error was returned by the SQLite backend; this may indicate a locked, corrupted, or missing database file. |
| `store.ldap-error` | `error` | LDAP error | An error was returned by the LDAP directory server; check connectivity, bind credentials, and server logs. |
| `store.elasticsearch-error` | `error` | ElasticSearch error | An error was returned by the Elasticsearch backend; check cluster health, index availability, and connectivity. |
| `store.meilisearch-error` | `error` | Meilisearch error | An error was returned by the Meilisearch backend; check service availability and index configuration. |
| `store.redis-error` | `error` | Redis error | An error was returned by the Redis backend; check connectivity and Redis server health. |
| `store.s3-error` | `error` | S3 error | An error was returned by the S3-compatible blob store; check bucket permissions, credentials, and endpoint configuration. |
| `store.azure-error` | `error` | Azure error | An error was returned by the Azure Blob Storage backend; check container permissions and connection string. |
| `store.filesystem-error` | `error` | Filesystem error | A filesystem operation failed; check disk space, file permissions, and the configured storage path. |
| `store.pool-error` | `error` | Connection pool error | A database connection pool error occurred; the pool may be exhausted or the backend may be unreachable. |
| `store.data-corruption` | `error` | Data corruption detected | A stored value failed integrity checks; the record may be unreadable and manual recovery may be required. |
| `store.decompress-error` | `error` | Decompression error | A stored blob or record could not be decompressed; the data may be corrupt. |
| `store.deserialize-error` | `error` | Deserialization error | A stored record could not be deserialized; it may have been written by an incompatible version of the server. |
| `store.not-found` | `debug` | Record not found in database | A lookup for a specific record returned no result; the caller will handle this as an expected miss. |
| `store.not-configured` | `error` | Store not configured | An operation was attempted on a store backend that has not been configured; check the server configuration. |
| `store.not-supported` | `error` | Operation not supported by store | The requested operation is not supported by the currently configured store backend. |
| `store.unexpected-error` | `error` | Unexpected store error | An unclassified internal error occurred in the store layer; consult the server logs for details. |
| `store.crypto-error` | `error` | Store crypto error | An encryption or decryption operation on stored data failed; check key configuration and data integrity. |
| `store.http-store-error` | `warn` | Error updating HTTP store | A download of an HTTP lookup list (e.g. a blocklist or allowlist) failed; the list will not be updated until the next retry. |
| `store.cache-miss` | `debug` | Cache miss | No cached account data was found; the data will be loaded from the database and cached for subsequent requests. |
| `store.cache-hit` | `debug` | Cache hit | Valid cached account data was found; the database lookup is skipped for this request. |
| `store.cache-stale` | `debug` | Cache is stale | The cached account data has expired or been invalidated; it is being rebuilt from the database. |
| `store.cache-update` | `debug` | Cache update | The account data cache was refreshed with the latest changes from the database. |
| `store.blob-missing-marker` | `warn` | Blob missing marker | A blob in storage is missing its expected format marker; the blob may be corrupt or from an incompatible version. |
| `store.data-write` | `trace` | Write batch operation | A batched write transaction was committed to the data store; logged at trace level for storage debugging. |
| `store.data-iterate` | `trace` | Data store iteration operation | A range scan or iteration over the data store was performed; logged at trace level for storage debugging. |
| `store.blob-read` | `trace` | Blob read operation | A blob was read from the blob store; logged at trace level for storage debugging. |
| `store.blob-write` | `trace` | Blob write operation | A blob was written to the blob store; logged at trace level for storage debugging. |
| `store.blob-delete` | `trace` | Blob delete operation | A blob was deleted from the blob store; logged at trace level for storage debugging. |
| `store.sql-query` | `trace` | SQL query executed | A SQL query was executed against the configured relational database backend; logged at trace level for query debugging. |
| `store.ldap-query` | `trace` | LDAP query executed | An LDAP query was executed against the configured directory server; logged at trace level for query debugging. |
| `store.ldap-warning` | `debug` | LDAP authentication warning | An LDAP directory operation returned a warning response; authentication may have partially succeeded. |
| `store.http-store-fetch` | `debug` | HTTP store updated | An HTTP lookup list was successfully downloaded and the in-memory store has been updated with its contents. |
| `store.auto-expunge` | `debug` | Auto-expunge executed | Scheduled cleanup ran and deleted expired messages from Trash and Junk folders per the configured retention policy. |
| `store.blob-store-purged` | `info` | Blob store purge completed | The scheduled blob store purge finished, removing orphaned or expired blobs to reclaim storage space. |
| `store.data-store-purged` | `info` | Data store purge completed | The scheduled data store purge finished, removing expired records and compacting the database. |


## TaskManager

| Event | Level | Short | Long |
|---|---|---|---|
| `task-manager.task-acquired` | `debug` | Task acquired from queue | A background task was dequeued and assigned to this node for execution. |
| `task-manager.task-queued` | `info` | Task queued for processing | A new background task has been placed into the task queue and is waiting for a worker to pick it up. |
| `task-manager.task-scheduled` | `info` | Task scheduled for future execution | A background task has been scheduled to run at a future time, such as a deferred report or maintenance job. |
| `task-manager.task-locked` | `debug` | Task is locked by another process | Another cluster node has already acquired this task; this node will skip it to avoid duplicate execution. |
| `task-manager.task-ignored` | `debug` | Task ignored based on current server roles | This task type is not assigned to the current node's cluster role; the task is skipped without processing. |
| `task-manager.task-failed` | `warn` | Task failed during processing | A background task encountered an error during execution; it may be retried depending on the retry policy. |
| `task-manager.task-retry` | `debug` | Task will be retried | A background task failed but is eligible for retry; it has been rescheduled according to the retry strategy. |
| `task-manager.blob-not-found` | `debug` | Blob not found for task | A blob required for task execution was not found in the blob store; the task cannot proceed. |
| `task-manager.metadata-not-found` | `debug` | Metadata not found for task | Metadata required for task execution was not found in the store; the task cannot proceed. |
| `task-manager.scheduler-started` | `info` | Task scheduler started | The task scheduler subsystem has started and is now triggering scheduled background tasks. |
| `task-manager.manager-started` | `info` | Task manager started | The task manager subsystem has started and is now processing background task queues. |


## Telemetry

| Event | Level | Short | Long |
|---|---|---|---|
| `telemetry.alert-event` | `warn` | Alert event triggered | A configured metric alert threshold was crossed; an alert notification will be sent to the configured recipients. |
| `telemetry.alert-message` | `info` | Alert message sent | An alert notification email was dispatched to the configured recipients for a triggered metric alert. |
| `telemetry.log-error` | `warn` | Log collector error | The log collector encountered an error writing to the configured log target; log entries may be lost. |
| `telemetry.webhook-error` | `warn` | Webhook collector error | An event could not be delivered to the configured webhook endpoint; the event may be dropped or retried. |
| `telemetry.otel-exporter-error` | `warn` | OpenTelemetry exporter error | An error occurred while exporting traces or spans to the configured OpenTelemetry collector endpoint. |
| `telemetry.otel-metrics-exporter-error` | `warn` | OpenTelemetry metrics exporter error | An error occurred while exporting metrics to the configured OpenTelemetry metrics endpoint. |
| `telemetry.prometheus-exporter-error` | `warn` | Prometheus exporter error | An error occurred while serving or pushing metrics to the Prometheus scrape endpoint. |
| `telemetry.journal-error` | `warn` | Journal collector error | An error occurred while writing events to the system journal (e.g. journald); log entries may be lost. |
| `telemetry.metrics-collected` | `info` | Metrics collected | A metrics collection cycle completed; counters and histograms have been sampled and are ready for export. |
| `telemetry.metrics-stored` | `debug` | Metric store | Collected metrics were persisted to the internal metrics store for historical querying. |
| `telemetry.metrics-pushed` | `debug` | Metrics pushed | A batch of metrics was successfully pushed to all configured telemetry exporters. |


## Tls

| Event | Level | Short | Long |
|---|---|---|---|
| `tls.handshake` | `info` | TLS handshake | A TLS handshake with a client or server completed successfully; the connection is now encrypted. |
| `tls.handshake-error` | `debug` | TLS handshake error | A TLS handshake failed; the client may not support the configured TLS version or cipher, or presented an invalid certificate. |
| `tls.not-configured` | `error` | TLS not configured | A TLS connection was requested but no certificate is configured for this listener; the connection cannot be established. |
| `tls.certificate-not-found` | `debug` | TLS certificate not found | No certificate matching the client's SNI hostname was found; the default certificate will be used if one is configured. |
| `tls.no-certificates-available` | `warn` | No TLS certificates available | No valid TLS certificates are available for this listener; TLS connections will fail until a certificate is provisioned. |
| `tls.multiple-certificates-available` | `warn` | Multiple TLS certificates available | More than one certificate matches the requested SNI hostname; the first matching certificate will be used. |
| `tls.expired-certificate-removed` | `info` | Certificate expired and removed | An expired TLS certificate was automatically removed from the active certificate store during a cleanup cycle. |


## TlsRpt

| Event | Level | Short | Long |
|---|---|---|---|
| `tls-rpt.record-fetch` | `info` | Fetched TLS-RPT record | The TLS-RPT DNS record for the recipient domain was fetched to determine where TLS failure reports should be sent. |
| `tls-rpt.record-fetch-error` | `info` | Error fetching TLS-RPT record | A DNS error occurred while fetching the TLS-RPT record; TLS failure reports cannot be sent for this domain. |
| `tls-rpt.record-not-found` | `info` | TLS-RPT record not found | No TLS-RPT record was found for the domain; the domain has not opted into TLS failure reporting. |


## WebDav

| Event | Level | Short | Long |
|---|---|---|---|
| `web-dav.propfind` | `debug` | WebDAV PROPFIND request | A client requested property metadata for a resource or collection (used by CalDAV/CardDAV for calendar and contact discovery). |
| `web-dav.proppatch` | `debug` | WebDAV PROPPATCH request | A client updated property metadata on a resource or collection. |
| `web-dav.get` | `debug` | WebDAV GET request | A client downloaded a resource such as a calendar event, contact, or file. |
| `web-dav.head` | `debug` | WebDAV HEAD request | A client requested headers only for a resource, typically to check existence or modification time without downloading the body. |
| `web-dav.report` | `debug` | WebDAV REPORT request | A client issued a REPORT query, used by CalDAV/CardDAV for calendar queries, free-busy lookups, and sync operations. |
| `web-dav.mkcol` | `debug` | WebDAV MKCOL request | A client created a new collection (folder) on the server. |
| `web-dav.mkcalendar` | `debug` | WebDAV MKCALENDAR request | A CalDAV client created a new calendar collection. |
| `web-dav.delete` | `debug` | WebDAV DELETE request | A client deleted a resource or collection from the server. |
| `web-dav.put` | `debug` | WebDAV PUT request | A client uploaded or updated a resource such as a calendar event or contact card. |
| `web-dav.post` | `debug` | WebDAV POST request | A client submitted data via POST, typically used for CalDAV scheduling or free-busy queries. |
| `web-dav.patch` | `debug` | WebDAV PATCH request | A client applied a partial update to a resource. |
| `web-dav.copy` | `debug` | WebDAV COPY request | A client copied a resource or collection to another location on the server. |
| `web-dav.move` | `debug` | WebDAV MOVE request | A client moved or renamed a resource or collection on the server. |
| `web-dav.lock` | `debug` | WebDAV LOCK request | A client acquired a write lock on a resource to prevent concurrent modifications. |
| `web-dav.unlock` | `debug` | WebDAV UNLOCK request | A client released a previously acquired write lock on a resource. |
| `web-dav.acl` | `debug` | WebDAV ACL request | A client modified the access control list for a resource or collection. |
| `web-dav.options` | `debug` | WebDAV OPTIONS request | A client requested the supported HTTP methods and WebDAV features for a resource, typically during capability discovery. |
| `web-dav.error` | `debug` | WebDAV error | An error occurred while processing a WebDAV request; check the associated status code and resource path. |


## Keys

Events carry structured key/value pairs. The recognised keys are listed below.

| Key | Description |
|---|---|
| `accountName` | Account name |
| `accountId` | Account ID |
| `blobId` | Blob ID |
| `causedBy` | Caused by |
| `changeId` | Change ID |
| `code` | Status code |
| `collection` | Collection |
| `contents` | Contents |
| `details` | Details |
| `dkimFail` | DKIM failures |
| `dkimNone` | DKIM none |
| `dkimPass` | DKIM passes |
| `dmarcNone` | DMARC none |
| `dmarcPass` | DMARC passes |
| `dmarcQuarantine` | DMARC quarantined |
| `dmarcReject` | DMARC rejected |
| `documentId` | Document ID |
| `domain` | Domain |
| `due` | Due date |
| `elapsed` | Elapsed time |
| `expires` | Expiration |
| `from` | From address |
| `hostname` | Hostname |
| `id` | ID |
| `key` | Key |
| `limit` | Limit |
| `listenerId` | Listener ID |
| `localIp` | Local IP |
| `localPort` | Local port |
| `mailboxName` | Mailbox name |
| `mailboxId` | Mailbox ID |
| `messageId` | Message-ID |
| `nextDsn` | Next DSN |
| `nextRetry` | Next retry |
| `path` | Path |
| `policy` | Policy |
| `queueId` | Queue ID |
| `rangeFrom` | Range start |
| `rangeTo` | Range end |
| `reason` | Reason |
| `remoteIp` | Remote IP |
| `remotePort` | Remote port |
| `reportId` | Report ID |
| `result` | Result |
| `size` | Size |
| `source` | Source |
| `spanId` | Span ID |
| `spfFail` | SPF failures |
| `spfNone` | SPF none |
| `spfPass` | SPF passes |
| `strict` | Strict mode |
| `tls` | TLS version |
| `to` | To address |
| `total` | Total |
| `totalFailures` | Total failures |
| `totalSuccesses` | Total successes |
| `type` | Type |
| `uid` | IMAP UID |
| `uidNext` | IMAP UID next |
| `uidValidity` | IMAP UID validity |
| `url` | URL |
| `validFrom` | Valid from |
| `validTo` | Valid to |
| `value` | Value |
| `version` | Version |
| `queueName` | Queue name |