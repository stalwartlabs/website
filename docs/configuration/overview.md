---
sidebar_position: 1
---

# Overview

Stalwart Mail Server uses the [TOML](https://toml.io/en/) format for its configuration. TOML, short for Tom's Obvious, Minimal Language, is a configuration file format that is easy to read due to its clear semantics. It is designed for unambiguous parsing, allowing both humans and machines to easily understand its structure. TOML files organize configuration into key-value pairs, tables, arrays, and nested structures, making it versatile for a wide range of applications. This format ensures that the Stalwart Mail Server's configuration is both accessible and maintainable, facilitating straightforward setup and adjustments.

One of the powerful aspects of Stalwart Mail Server's configuration is the ability to use either [static](/docs/category/values) values or [dynamic](/docs/configuration/expressions/values) ones. Static values are straightforward - they're values that you directly specify in the configuration and that don't change. Dynamic values, on the other hand, use [expressions](/docs/configuration/expressions/overview) to determine the final value at runtime. This means that the actual value can change depending on a variety of factors such as user input, system conditions, or other variables. This can be extremely useful for creating flexible configurations that can adapt to different scenarios or conditions without needing to be manually updated.

In the Stalwart configuration file, settings may expect [values](/docs/category/values) in the form of strings, integers, sizes, booleans, IP addresses, durations, rates, lookup paths, or arrays that contain any of these types. Some settings support [expressions](/docs/configuration/expressions/overview) that can be used to dynamically determine the value of the setting at runtime. 

To specify the configuration for Stalwart Mail Server, users must provide the path to the TOML configuration file. This is accomplished via the `--config` argument when launching the server.

## Local and database settings

In addition to storing configurations in a local TOML file, Stalwart Mail Server supports storing configuration settings in any of the supported [data stores](/docs/storage/data). This is particularly useful in distributed environments, allowing all servers within a cluster to share the same configuration settings.

To accommodate database storage, the hierarchical TOML structure is flattened into a series of keys. This process involves converting each configuration option into a unique key-value pair, with the key reflecting the structure of the original TOML file. For example, consider the following TOML configuration:

```toml
[server.listener."smtp"]
bind = ["127.0.0.1:25", "192.0.2.1:25"]
tls.implicit = false
```

In the database, this configuration would be represented as:

```
server.listener.smtp.bind.0 = "127.0.0.1:25"
server.listener.smtp.bind.1 = "192.0.2.1:25"
server.listener.smtp.tls.implicit = false
```

Stalwart allows for fine-grained control over which configuration settings are stored locally and which are stored in the database. This is managed through the `config.local-keys` setting in the local TOML configuration file. This setting accepts an array of glob patterns to match configuration keys. If a key matches a pattern, it is retained in the local TOML file; otherwise, it is stored in the database. Exclusion of specific keys can be achieved by prefixing the glob pattern with a `!`.

If no `config.local-keys` are specified, the default configuration is as follows:

```toml
[config]
local-keys = [ "store.*", "directory.*", "tracer.*", "server.*", "!server.blocked-ip.*",
               "authentication.fallback-admin.*", "cluster.node-id", "storage.data", 
               "storage.blob", "storage.lookup",  "storage.fts", "storage.directory", 
               "lookup.default.hostname"]
```

It is important to note that certain keys, specifically those matching `store.*`, `storage.*`, and `server.*` patterns, must always be stored locally. Stalwart Mail Server relies on these local configurations to initialize and start correctly. Excluding these key patterns from local storage will prevent the server from starting.

## Safe Defaults

Stalwart Mail Server is designed with flexibility and ease of use in mind, requiring no mandatory configuration settings to start. In the absence of specific configuration directives, Stalwart defaults to safe and sensible settings to ensure the server operates securely. For instance, if not explicitly configured, SMTP relaying is disabled to prevent misuse of the server as an open relay for spam or unauthorized email transmission.

Stalwart's philosophy of "safe defaults" means that it comes pre-configured with settings that prioritize security and basic functionality. This approach simplifies the initial setup process, especially for users who are new to mail server administration. The server intelligently defaults to configurations that minimize potential security vulnerabilities while ensuring reliable operation.

## Minimal Configuration

Despite the lack of required settings, for Stalwart to function as a mail server, it must have at least one valid store and listener configured. These are the only quasi-mandatory settings needed to get Stalwart up and running. Below is an example of the minimal configuration necessary for a basic instance of Stalwart Mail Server using RocksDB:

```toml
[server.listener."smtp"]
bind = ["[::]:25"]
protocol = "smtp"

[server.listener."submissions"]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true

[server.listener."imaptls"]
bind = ["[::]:993"]
protocol = "imap"
tls.implicit = true

[storage]
data = "rocksdb"
fts = "rocksdb"
blob = "rocksdb"
lookup = "rocksdb"
directory = "internal"

[store."rocksdb"]
type = "rocksdb"
path = "%{env:STALWART_PATH}%/data"
compression = "lz4"

[directory."internal"]
type = "internal"
store = "rocksdb"

[tracer."stdout"]
type = "stdout"
level = "info"
ansi = false
enable = true

[authentication.fallback-admin]
user = "admin"
secret = "%{env:ADMIN_SECRET}%"
```

