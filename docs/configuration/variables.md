---
sidebar_position: 5
---

# Variables

Context or environment variables may be used in certain settings of the configuration file that accept [expressions](/docs/configuration/expressions/overview). The available context variables for evaluation vary depending on the setting and can include:

- `remote_ip`: The IP address of the client for inbound sessions and the remote server's IP address for outbound sessions.
- `remote_port`: The remote clients's port number for an inbound session.
- `local_ip`: The local server's IP address used in an outbound connection (available only when a source IP is specified).
- `local_port`: The local server's port number for an inbound connection.
- `listener`: The listener ID where the connection was initiated for inbound sessions.
- `is_tls`: A boolean value indicating whether the session is encrypted using TLS.
- `asn`: The Autonomous System Number of the remote IP address.
- `country`: The country code of the remote IP address.
- `protocol`: The protocol used for the session (`smtp`, `imap`, `http`, etc.).
- `sender`: The return path address specified in the MAIL FROM command for inbound sessions and the sender's address for outbound sessions.
- `sender_domain`: The return path domain name specified in the MAIL FROM command for inbound sessions and the sender's domain name for outbound sessions.
- `rcpt`: The recipient's address.
- `rcpt_domain`: The recipient's domain name.
- `recipients`: An array of recipient addresses.
- `priority`: The priority provided using the MT-PRIORITY extension.
- `authenticated_as`: The account name used to authenticate the session for inbound sessions, or an empty value if the session is unauthenticated.

## Queue Variables

The following additional variables are available for use in [queue](/docs/mta/queue/overview) expressions:

- `mx`: The remote mail exchanger's hostname for outbound sessions.
- `retry_num`: The number of times the message has been retried.
- `notify_num`: The number of times the sender of the message has been notified.
- `last_error`: The last error message type encountered during delivery attempts.
- `last_status`: The last status code returned by the remote server during delivery attempts.

## HTTP Variables

The following additional variables are available for use in HTTP expressions:

- `url`: The URL of the HTTP request.
- `url_path`: The path component of the URL.
- `headers`: An array of HTTP headers in the format `Header-Name: Header-Value`.
- `method`: The HTTP method used in the request (`GET`, `POST`, etc.).

## Spam filter Variables

The following variables are available exclusively for use in [spam filter](/docs/spamfilter/overview) expressions:

### Global Variables
- `remote_ip`: The IP address of the remote client
- `remote_ip.ptr`: The PTR (reverse DNS) record of the remote IP
- `ehlo_domain`: The domain provided in the EHLO/HELO SMTP command
- `auth_as`: The authentication identifier used during SMTP authentication
- `asn`: The Autonomous System Number of the remote IP
- `country`: The country code where the remote IP is located
- `is_tls`: Whether the connection uses TLS encryption
- `env_from`: The envelope sender (MAIL FROM) address
- `env_from.local`: The local part of the envelope sender address
- `env_from.domain`: The domain part of the envelope sender address
- `env_to`: The envelope recipient (RCPT TO) address
- `from`: The From header address
- `from.name`: The display name in the From header
- `from.local`: The local part of the From header address
- `from.domain`: The domain part of the From header address
- `reply_to`: The Reply-To header address
- `reply_to.name`: The display name in the Reply-To header
- `reply_to.local`: The local part of the Reply-To address
- `reply_to.domain`: The domain part of the Reply-To address
- `to`: The To header address
- `to.name`: The display name in the To header
- `to.local`: The local part of the To address
- `to.domain`: The domain part of the To address
- `cc`: The CC header address
- `cc.name`: The display name in the CC header
- `cc.local`: The local part of the CC address
- `cc.domain`: The domain part of the CC address
- `bcc`: The BCC header address
- `bcc.name`: The display name in the BCC header
- `bcc.local`: The local part of the BCC address
- `bcc.domain`: The domain part of the BCC address
- `body`: The full message body text (alias for body.text)
- `body.text`: The plain text version of the message body
- `body.html`: The HTML version of the message body
- `body.words`: The words extracted from the message body
- `body.raw`: The raw message body before parsing
- `subject`: The full Subject header content
- `subject.thread`: The Subject header with threading information removed
- `subject.words`: The words extracted from the subject
- `location`: Indicates where the evaluated element was found in the email. Possible values are:
  - `env_from`: Found in the envelope FROM
  - `env_to`: Found in the envelope TO
  - `dkim_pass`: Found in a passing DKIM signature
  - `received`: Found in a Received header
  - `from`: Found in the From header
  - `reply_to`: Found in the Reply-To header
  - `subject`: Found in the Subject header
  - `to`: Found in the To header
  - `cc`: Found in the CC header
  - `bcc`: Found in the BCC header
  - `message_id`: Found in the Message-ID header
  - `dnt`: Found in a Disposition-Notification-To header
  - `ehlo`: Found in the EHLO/HELO command
  - `body_text`: Found in the plain text body
  - `body_html`: Found in the HTML body
  - `attachment`: Found in an attachment
  - `tcp`: Found in the TCP connection data

### URL Variables
- `url`: The complete URL
- `value`: Alias for the complete URL
- `path_query`: The path and query string portions of the URL
- `path`: The path portion of the URL
- `query`: The query string portion of the URL
- `scheme`: The URL scheme (protocol)
- `authority`: The authority portion of the URL
- `host`: The hostname portion of the URL
- `sld`: The second-level domain of the URL host
- `port`: The port number specified in the URL

### Email Address Variables
- `email`: The complete email address
- `value`: Alias for the complete email address
- `name`: The display name associated with the email address
- `local`: The local part of the email address
- `domain`: The domain part of the email address
- `sld`: The second-level domain of the email address domain

### IP Address Variables
- `ip`: The IP address being evaluated
- `value`: Alias for the IP address
- `input`: Alias for the IP address
- `reverse_ip`: The reverse DNS lookup result for the IP
- `ip_reverse`: Alias for reverse DNS lookup result
- `octets`: The octets of the IP address
- `is_v4`: Whether the IP is version 4
- `is_v6`: Whether the IP is version 6

### Header Variables
- `name`: The name of the header
- `name_lower`: The lowercase version of the header name
- `value`: The value of the header
- `value_lower`: The lowercase version of the header value
- `email`: The email address found in the header value
- `email_lower`: The lowercase version of the email address
- `attributes`: Additional header properties/attributes
- `raw`: The raw header content before parsing
- `raw_lower`: The lowercase version of the raw header content
