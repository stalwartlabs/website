---
sidebar_position: 2
---

# Macros

Macros in the configuration files allow you to dynamically assign values based on various sources, including environment variables, other configuration settings, and the contents of local text files. Macros are particularly useful for reducing redundancy, simplifying configuration management, and integrating external or environment-specific values directly into your configuration. 

## Types of Macros

Stalwart supports three types of macros:

1. **Configuration Setting References:** To reference other configuration settings within the file, use the syntax `%{cfg:key_name}%`. This allows the value of one setting to be reused in another, ensuring consistency and ease of updates.

2. **Environment Variable Retrieval:** To incorporate the value of an environment variable into your configuration, use `%{env:ENVIRONMENT_VAR_NAME}%`. This is particularly useful for including sensitive information like secrets or tokens, which should not be hard-coded into the configuration file.

3. **Local Text File Content Expansion:** For including the content of a local text file directly into a configuration value, use `%{file:/path/to/file.txt}%`. This method is ideal for inserting certificate data or other external configuration snippets that are managed separately from the Stalwart configuration file.

## Example

Below are examples demonstrating each type of macro:

```toml
# OAuth Key from an environment variable
[oauth]
key = "%{env:OAUTH_SECRET}%"

# SSL/TLS Certificate from a local file
[certificate."default"]
cert = "%{file:/etc/letsencrypt/live/mail.example.org/fullchain.pem}%"

# Dynamic hostname using another configuration setting
[lookup.default]
domain = "example.org"
hostname = "mail.%{cfg:lookup.default.domain}%"
```

## Limitations

It's important to note that macros are only supported in [local configuration keys](/docs/configuration/overview#local-and-database-settings). Configuration settings stored in a database do not support macro expansion. This design choice is due to the nature of how database-stored settings are accessed and managed by the Stalwart Mail Server. Macros, being dynamically resolved, are best kept within the local configuration scope to ensure their values are processed and applied correctly at the server startup or reload.

