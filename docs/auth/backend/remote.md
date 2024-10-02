---
sidebar_position: 7
---

# SMTP and IMAP

When running the standalone version of Stalwart SMTP, it is possible to use an external SMTP, LMTP or IMAP server as a "virtual" directory. This allows you to delegate authentication and address validation to a third-party mail server.
It is important to note that external SMTP or IMAP authentication cannot be used when running the all-in-one or JMAP servers.

## Connection details

The connection details for an external SMTP or IMAP server are specified under the `directory.<name>` key in the configuration file with the following attributes:

- `type`: Specifies the type of remote server, which can be either `imap`, `smtp` or `lmtp`.
- `address`: The address or hostname of the remote server.
- `port`: The port number to connect to. 
- `tls.implicit`: When set to `true`, this setting means that Stalwart should use an implicitly secure connection to the server from the start of the connection. If it's `false`, it means that Stalwart should start the connection as a plain text connection, and then upgrade to a secure connection using the `STARTTLS` command (if available).
- `tls.allow-invalid-certs`: This setting controls how Stalwart handles server certificates that it can't validate. If it's set to `true`, Stalwart will allow connections even if the server presents an invalid certificate. However, this is not recommended for production environments as it leaves the connection susceptible to man-in-the-middle attacks. It could be used for testing environments where a proper certificate isn't available.
- `limits.rcpt`: The maximum number of recipients that can be tested in a single session.
- `limits.auth-errors`: The maximum number of authentication errors that can occur in a single session before the connection is closed.

Example:

```toml
[directory."imap"]
type = "imap"
address = "imap.example.org"
port = 993

[directory."imap".tls]
implicit = true
allow-invalid-certs = false

[directory."lmtp"]
type = "lmtp"
address = "127.0.0.1"
port = 11200

[directory."imap".tls]
implicit = false
allow-invalid-certs = true
```

## Domain lookup list

Since external IMAP or SMTP servers are not able to validate which are the local domains that Stalwart SMTP is handling, it is necessary to specify a local domain lookup list. This is done under the `directory.<name>.lookup.domains` key in the configuration file. For example:

```toml
[directory."smtp".lookup]
domains = ["example.org", "example.com"]
```

