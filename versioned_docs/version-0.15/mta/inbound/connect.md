---
sidebar_position: 2
---

# Connect stage

The connect stage is the initial stage of an SMTP session, where the server and client establish a connection. This stage is used to set up the initial parameters of the session, such as the hostname and greeting message.

## Hostname

The `session.connect.hostname` attribute is an expression that specifies the hostname that the server will use to identify itself during the SMTP session.

Example:

```toml
[session.connect]
hostname = "config_get('server.hostname')"
```

## Greeting

The `session.connect.greeting` attribute is an expression that specifies the greeting message that the server will send to the client when the SMTP session begins.

Example:

```toml
[session.connect]
greeting = "'Stalwart ESMTP at your service'"
```

## Sieve script

The `session.connect.script` attribute specifies the name of the [Sieve script](/docs/sieve/overview) to run before the SMTP session begins. This can be useful for filtering connections based on their remote IP address, for example.

Example:

```toml
[session.connect]
script = "'connect_filter'"

[sieve.trusted.scripts.connect_filter]
contents = '''
require ["variables", "reject"];

if string "${env.remote_ip}" "192.0.2.88" {
    reject "Your IP '${env.remote_ip}' is not welcomed here.";
}
'''
```
