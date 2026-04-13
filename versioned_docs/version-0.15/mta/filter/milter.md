---
sidebar_position: 4
---

# Milter filters

Milter, or "mail filter", is an extension to mail servers based on the Sendmail protocol. Milters allow third-party software to access mail messages as they are being processed in order to filter, modify, or annotate them. By using Milters, a mail server can utilize a variety of functionalities such as spam filtering, virus scanning, and other types of mail processing, beyond what is built into the mail server itself. Milters operate at the SMTP protocol level, which means they have access to both the SMTP envelope and the message contents.

When a mail is received and reaches the [DATA stage](/docs/mta/inbound/data), Stalwart calls the configured Milter filters. Each Milter filter can inspect and potentially modify the message, adding, changing, or removing headers, altering the body, or even rejecting the message outright. The modifications requested by each Milter are merged, meaning that the effects of multiple Milter filters are combined. Once all Milters have been processed, the potentially modified message enters the Stalwart queue and proceeds through the rest of the delivery process. 

## Configuration

Milters are defined under the `session.milter.<id>` section and are configured using the following attributes:

- `enable`: Determines whether this Milter is turned on or off. This setting can be dynamically set using [expressions](/docs/configuration/expressions/overview) which allows a certain Milter to be enabled or disabled based on the specific circumstances of an SMTP transaction.
- `hostname`: Hostname or IP address of the server where the Milter filter is running.
- `port`: Network port on the Milter filter host server. 
- `stages`: This parameter is a list of stages at which this Milter will be called. The supported stages are `connect`, `ehlo`, `mail`, `rcpt` and `data`.
- `tls`: Whether to use Transport Layer Security (TLS) for the connection between Stalwart and the Milter filter. Usually Milters are run on the same server as the mail server, so this setting should be set to `false` unless the Milter filter is running on a different server
- `allow-invalid-certs`: Whether Stalwart should accept connections to a Milter filter server that has an invalid TLS certificate. If set to `true`, it allows connections even if the Milter filter server's certificate is expired, self-signed, or otherwise not trusted. This should generally be set to `false`, except perhaps in testing environments, to maintain the security of the connection.

For example, to filter messages received on the SMTP listener through both Rspamd and ClamAV using milter:

```toml
[session.milter."rspamd"]
enable = [ { if = "listener = 'smtp'", then = true }, 
           { else = false } ]
hostname = "127.0.0.1"
port = 11332
stages = ["connect", "ehlo", "mail", "rcpt", "data"]
tls = false
allow-invalid-certs = false

[session.milter."clamav"]
enable = [ { if = "listener = 'smtp'", then = true }, 
           { else = false } ]
hostname = "127.0.0.1"
port = 15112
tls = false
allow-invalid-certs = false
```

### Timeout settings

The timeout settings define the maximum amount of time that Stalwart will wait for certain types of responses from a Milter. The following attributes can be configured under the `session.milter.<id>.timeout` section:

- `connect`: Defines the maximum amount of time that Stalwart will wait to establish a connection with a Milter server. 
- `command`: Determines how long Stalwart will wait to send a command to the Milter server. 
- `data`: Represents the maximum amount of time Stalwart will wait for a response from the Milter server. 

For example:

```toml
[session.milter."rspamd".timeout]
connect = "30s"
command = "30s"
data = "60s"
```

### Options

The following configuration options for a Milter filter can be set under the `session.milter.<id>.options` section:

- `tempfail-on-error`: If this setting is enabled, Stalwart will respond with a temporary failure (typically a 4xx SMTP status code) when it encounters an error while communicating with a Milter server. This tells the sending mail server to try delivering the message again later.
- `max-response-size`: Maximum size, in bytes, of a response that Stalwart will accept from a Milter server. If a Milter server sends a response that exceeds this size, Stalwart will consider it an error and handle it according to the `tempfail-on-error` setting.
- `version`: Version of the Milter protocol that Stalwart should use when communicating with Milter servers. Supported versions are `2` and `6`. The value should be set to match the version of the Milter protocol supported by your Milter server, usually version `6`.
- `flags.actions`: Actions flags that Stalwart will advertise when negotiating options with Milter server. Defaults to `0xff` (`255`).
- `flags.protocol`: Protocol flags that Stalwart will advertise while negotiating options with Milter server. Defaults to `0x42` (`66`).

For example:

```toml
[session.milter."rspamd".options]
tempfail-on-error = true
max-response-size = 52428800 # 50mb
version = 6

[session.milter."rspamd".options.flags]
actions = 255
protocol = 66
```

## Development

The following sections are specifically intended for developers who are creating Milter filters to interact with Stalwart. They provide information about the actions that Stalwart can take upon receiving instructions from a Milter filter, and the macros that Stalwart uses to communicate specific session or message information to the Milter filter. For general users of Stalwart, these sections can be ignored. 

### Supported Actions

Stalwart supports the following actions and modifications that can be requested by a Milter filter:

| Code | Name | Description |
|---|---|---|
| SMFIR_ADDRCPT (`+`) | Add Recipient | Adds a recipient to the email |
| SMFIR_DELRCPT (`-`) | Delete Recipient | Removes a recipient from the email |
| SMFIR_ADDRCPT_PAR (`2`) | Add Recipient (with ESMTP args) | Adds a recipient to the email, including ESMTP arguments |
| SMFIR_SHUTDOWN (`4`) | Shutdown | Return a 421 shutdown code |
| SMFIR_ACCEPT (`a`) | Accept | Accepts the email |
| SMFIR_REPLBODY (`b`) | Replace Body | Replaces the body of the email |
| SMFIR_CONTINUE (`c`) | Continue | Continues with the email |
| SMFIR_DISCARD (`d`) | Discard | Discards the email |
| SMFIR_CHGFROM (`e`) | Change From | Changes the envelope sender of the email |
| SMFIR_CONN_FAIL (`f`) | Connection Failure | Causes a connection failure |
| SMFIR_ADDHEADER (`h`) | Add Header | Adds a header to the email |
| SMFIR_INSHEADER (`i`) | Insert Header | Inserts a header in the email |
| SMFIR_SETSYMLIST (`l`) | Set Symbol List | Sets a list of symbols or macros |
| SMFIR_CHGHEADER (`m`) | Change Header | Changes a header in the email |
| SMFIR_PROGRESS (`p`) | Progress | Indicates progress |
| SMFIR_QUARANTINE (`q`) | Quarantine | Quarantines the email |
| SMFIR_REJECT (`r`) | Reject | Rejects the email |
| SMFIR_SKIP (`s`) | Skip | Skip rest of body, send EOB |
| SMFIR_TEMPFAIL (`t`) | Temporary Failure | Return a temporary failure |
| SMFIR_REPLYCODE (`y`) | Reply Code | Reply with a given SMTPy code, etc. |

### Supported Macros

Macros are variables that are used to communicate specific session or message information between the mail server and the Milter application. When the MTA (Mail Transfer Agent) starts a Milter application, it sends an initial set of predefined macros. The specific macros sent can change throughout the SMTP transaction, providing different context at each stage (e.g., connection, helo, mail, rcpt, data, end-of-header, and end-of-message).

For instance, macros can provide information about the client's IP address, the authenticated user, the message's sender and recipient addresses, and more. The Milter application can use these macro values to make decisions about how to process or modify the message or even whether to accept the message at all.

Stalwart supports the following macros:

| Macro Name | Explanation |
|---|---|
| `i` | Queue ID |
| `j` | Local hostname |
| `_` | Validated client name |
| `{auth_authen}` | SASL login name |
| `{auth_author}` | SASL sender |
| `{auth_type}` | SASL method |
| `{client_addr}` | Client address |
| `{client_connections}` | Number of client connections |
| `{client_name}` | Client name |
| `{client_port}` | Client port |
| `{client_ptr}` | Client pointer |
| `{cert_issuer}` | Certificate issuer |
| `{cert_subject}` | Certificate subject |
| `{cipher_bits}` | Cipher bits |
| `{cipher}` | Cipher |
| `{daemon_addr}` | Daemon address |
| `{daemon_name}` | Daemon name |
| `{daemon_port}` | Daemon port |
| `{mail_addr}` | Mail address |
| `{mail_host}` | Mail host address |
| `{mail_mailer}` | Mail mailer |
| `{rcpt_addr}` | Recipient address |
| `{rcpt_host}` | Recipient host |
| `{rcpt_mailer}` | Recipient mailer |
| `{tls_version}` | TLS version |
| `{v}` | Version |
