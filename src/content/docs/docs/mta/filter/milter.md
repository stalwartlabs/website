---
sidebar_position: 4
title: "Milter filters"
---

Milter, short for "mail filter", is an extension to mail servers based on the Sendmail protocol. Milters allow third-party software to access mail messages as they are being processed in order to filter, modify, or annotate them. Through milter, an MTA can add functionality such as spam filtering, virus scanning, and other kinds of message processing. Milters operate at the SMTP protocol level, so they have access to both the SMTP envelope and the message contents.

When a message reaches the [DATA stage](/docs/mta/inbound/data) (or any earlier configured stage), Stalwart calls the configured milter filters. Each filter can inspect and potentially modify the message, adding, changing, or removing headers, altering the body, or rejecting it outright. The modifications requested by each milter are merged. Once all milters have been processed, the message enters the queue and proceeds through the rest of the delivery process.

## Configuration

Each milter is defined as an [MtaMilter](/docs/ref/object/mta-milter) object (found in the WebUI under <!-- breadcrumb:MtaMilter --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Filters › Milters<!-- /breadcrumb:MtaMilter -->). The relevant fields are:

- [`enable`](/docs/ref/object/mta-milter#enable): expression that determines whether this milter is active. Defaults to `true`, but can be set to conditionally enable a milter based on session state (for example only for the SMTP listener).
- [`hostname`](/docs/ref/object/mta-milter#hostname): hostname or IP address of the milter server.
- [`port`](/docs/ref/object/mta-milter#port): network port on the milter server. Default 11332.
- [`stages`](/docs/ref/object/mta-milter#stages): list of SMTP stages at which this milter is invoked. Possible values are `connect`, `ehlo`, `auth`, `mail`, `rcpt`, and `data`. Default `["data"]`.
- [`useTls`](/docs/ref/object/mta-milter#usetls): whether to use TLS for the connection. Default `false`, since milters usually run on the same host as the MTA.
- [`allowInvalidCerts`](/docs/ref/object/mta-milter#allowinvalidcerts): whether Stalwart should connect to a milter that presents an invalid TLS certificate. Default `false`.

A typical deployment runs Rspamd and ClamAV as separate milters. For example, filtering messages received on the SMTP listener through both, each running on the same host on a distinct port:

```json
[
  {
    "hostname": "127.0.0.1",
    "port": 11332,
    "stages": ["connect", "ehlo", "mail", "rcpt", "data"],
    "enable": {
      "match": [{"if": "listener == 'smtp'", "then": "true"}],
      "else": "false"
    },
    "useTls": false,
    "allowInvalidCerts": false
  },
  {
    "hostname": "127.0.0.1",
    "port": 15112,
    "stages": ["data"],
    "enable": {
      "match": [{"if": "listener == 'smtp'", "then": "true"}],
      "else": "false"
    },
    "useTls": false,
    "allowInvalidCerts": false
  }
]
```

### Timeouts

Timeouts for milter communication are set with [`timeoutConnect`](/docs/ref/object/mta-milter#timeoutconnect) (maximum time to establish a connection with the milter, default 30 seconds), [`timeoutCommand`](/docs/ref/object/mta-milter#timeoutcommand) (maximum time for a command sent to the milter, default 30 seconds), and [`timeoutData`](/docs/ref/object/mta-milter#timeoutdata) (maximum time to wait for a response, default 60 seconds):

```json
{
  "timeoutConnect": "30s",
  "timeoutCommand": "30s",
  "timeoutData": "60s"
}
```

### Options

Additional options include [`tempFailOnError`](/docs/ref/object/mta-milter#tempfailonerror) (whether to respond with a temporary failure, typically 4xx, when an error occurs while talking to the milter so that the sender retries later, default `true`), [`maxResponseSize`](/docs/ref/object/mta-milter#maxresponsesize) (maximum response size accepted from the milter, in bytes, default 52428800, 50 MB), [`protocolVersion`](/docs/ref/object/mta-milter#protocolversion) (milter protocol version to use, `v2` or `v6`, default `v6`), and [`flagsAction`](/docs/ref/object/mta-milter#flagsaction) / [`flagsProtocol`](/docs/ref/object/mta-milter#flagsprotocol) (optional action and protocol flags advertised during option negotiation):

```json
{
  "tempFailOnError": true,
  "maxResponseSize": 52428800,
  "protocolVersion": "v6",
  "flagsAction": 255,
  "flagsProtocol": 66
}
```

## Development

The following sections are intended for developers creating milter filters to interact with Stalwart. They describe the actions Stalwart can take in response to instructions from a milter, and the macros Stalwart uses to communicate session or message information to the milter. General users of Stalwart can skip this section.

### Supported actions

Stalwart supports the following actions and modifications that can be requested by a milter filter:

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
| SMFIR_REPLYCODE (`y`) | Reply Code | Reply with a given SMTP reply code |

### Supported macros

Macros are variables used to communicate specific session or message information between the MTA and the milter. When the MTA starts a milter, it sends an initial set of predefined macros. The specific macros sent change throughout the SMTP transaction, providing different context at each stage (connection, helo, mail, rcpt, data, end-of-header, and end-of-message).

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
