---
sidebar_position: 1
---

# Overview

Stalwart Mail Server uses the [TOML](https://toml.io/en/) (Tom's Obvious, Minimal Language) format for its configuration file, which is by default located under `<INSTALL_DIR>/etc/config.toml`. This format is ideal for configuration files as it is human-readable, and easy to write and parse, which means that even non-programmers can easily understand and modify the configuration. Its syntax is designed to be simple and consistent, with a focus on readability, and it has clear rules about how to specify and overwrite properties. Moreover, TOML supports complex data types such as arrays, tables, and inline tables, and it has built-in support for dates and times, which can be useful in certain configurations.

One of the powerful aspects of Stalwart Mail Server's configuration is the ability to use either [static](/docs/category/values) values or [dynamic](/docs/configuration/values/dynamic) ones. Static values are straightforward - they're values that you directly specify in the configuration and that don't change. Dynamic values, on the other hand, use rules to determine the final value at runtime. This means that the actual value can change depending on a variety of factors such as user input, system conditions, or other variables. This can be extremely useful for creating flexible configurations that can adapt to different scenarios or conditions without needing to be manually updated.

In the Stalwart configuration file, settings may expect [values](/docs/category/values) in the form of strings, integers, sizes, booleans, IP addresses, durations, rates, lookup paths, or arrays that contain any of these types. Some settings support [rules](/docs/configuration/rules/syntax) that can be used to dynamically determine the value of the setting at runtime. The following sections provide more information about each of these types and how they can be used in the configuration file.
