---
sidebar_position: 1
---

# Listeners

Stalwart SMTP offers the ability to configure multiple listeners, which are responsible for receiving incoming SMTP connections. There is no limit to the number of listeners that can be created, and the behavior of each listener can be customized by the administrator. This means that instead of having a predetermined listener for each of the commonly used ports, such as 25 for unencrypted SMTP, 587 for SMTP submissions, and 465 for TLS encrypted SMTP submissions, Stalwart SMTP leaves it to the administrator to define the function of each listener.

For more information on how to configure listeners, see the main [listeners](/docs/configuration/listener) section.

## SMTP port

Unencrypted SMTP connections are received on port 25 by default. This is the standard port for SMTP, and is used by mail servers to send email to each other. To enable unencrypted SMTP connections, create a listener with the following configuration:

```toml
[server.listener."smtp"]
bind = "[::]:25"
protocol = "smtp"
```

To change the default SMTP greeting that is sent to connecting clients, set your custom greeting in the `server.listener.<id>.greeting` attribute. For example:

```toml
[server.listener."smtp"]
bind = "[::]:25"
protocol = "smtp"
greeting = "Welcome to Stalwart SMTP!"
```

## Submissions port (TLS)

SMTP submissions with implicit TLS are received on port 465 by default. This is the standard port for SMTP submissions with native implicit TLS, and is used by mail clients to send email to mail servers. To enable SMTP submissions with native implicit TLS, create a listener with the following configuration:

```toml
[server.listener."submissions"]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true
```

## Submissions port

SMTP submissions without implicit TLS are received on port 587 by default. This is the standard port for SMTP submissions on a clear-text connection (which can then be upgraded to TLS using the `STARTTLS` command), and is used by mail clients to send email to mail servers. To enable SMTP submissions, create a listener with the following configuration:

```toml
[server.listener."submission"]
bind = ["[::]:587"]
protocol = "smtp"
```

## LMTP port

LMTP is a protocol that is used to deliver email to a mail server. It is similar to SMTP, but is designed to be used by mail servers to deliver email to each other. LMTP is received on port 24 by default. To enable LMTP connections, create a listener with the following configuration:

```toml
[server.listener."lmtp"]
bind = ["[::]:24"]
protocol = "lmtp"
```

There is no need to enable LMTP if you are only using Stalwart SMTP to receive email from other mail servers. LMTP is only necessary if you are not using Stalwart SMTP as your primary mail server.

## Management port

Stalwart SMTP features an HTTP-based management API that provides system administrators with the ability to manage message queues and scheduled DMARC and TLS aggregate reports. The API can be utilized through the [Command Line Interface](/docs/management/overview), using curl, or even automated through scripts.

To enable the management interface in Stalwart SMTP, a special type of listener that uses the HTTP protocol has to be created. This can be done by specifying the IP address(es) and port(s) for the management API to listen for incoming connections in the `server.listener.<id>.bind` attribute and setting the `server.listener.<id>.protocol` attribute to `http`.

For instance, to enable the HTTP management API on 127.0.0.1 port 8080:

```toml
[server.listener."management"]
bind = ["127.0.0.1:8080"]
protocol = "http"
```

The management interface will automatically enable the default TLS certificate used by the SMTP listener(s), but this can be [overridden](/docs/configuration/listener#overriding-defaults) from the configuration file.

Management requests must be authenticated and only [administrators](/docs/directory/users#administrators) are allowed to access the management interface. The directory service used to authenticate users can be configured through the `management.directory` attribute. For example:

```txt
[management]
directory = ["ldap"]
```

:::tip Note

The HTTP management interface is disabled when running the all-in-one mail server as the JMAP listener already supports handling SMTP management requests.

:::
