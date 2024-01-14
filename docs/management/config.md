---
sidebar_position: 6
---

# Configuration

## Add settings

Configuration attributes can be created or updated using the `server add-config` command which takes a key-value pair as argument.

For example, to set the `server.hostname` attribute to `jmap.example.org`:

```bash
$ stalwart-cli -u https://jmap.example.org server add-config server.hostname jmap.example.org
```

## Remove settings

Configuration attributes can be removed using the `server delete-config` command which takes a key as argument.

For example, to remove the `server.hostname` attribute:

```bash
$ stalwart-cli -u https://jmap.example.org server delete-config server.hostname
```

It is also possible to delete multiple keys that share the same prefix by adding a `.` to the key name.

For example, to remove all keys starting with `server.security.blocked-networks`:

```bash
$ stalwart-cli -u https://jmap.example.org server delete-config server.security.blocked-networks.
```

## List settings

Configuration attributes can be listed using the `server list-config` command, which takes an optional prefix as an argument.

For example, to list all attributes starting with `server.security`:

```bash
$ stalwart-cli -u https://jmap.example.org server list-config server.security.
```

## Reloading

### TLS certificates

Stalwart Mail Server supports [ACME](/docs/server/tls/acme) (Automatic Certificate Management Environment) for TLS certificate management, which allows automatic certificate issuance and renewal. However, when TLS certificate management is done manually, it is necessary to reload any new certificates in order for the changes to take effect. This can be done by running the `server reload-certificates` command:

```bash
$ stalwart-cli -u https://jmap.example.org server reload-certificates
```

### Configuration

It is possible to reload certain parts of the configuration file without restarting the server. This can be done by running the `server reload-config` command:

```bash
$ stalwart-cli -u https://jmap.example.org server reload-config
```

