---
sidebar_position: 1
---

# Overview

Stalwart Mail Server provides detailed tracing and logging information to help users monitor and understand its behavior. The logging mechanism can be configured to output to a file, standard output, or send tracing information to OpenTelemetry. This makes it easier for users to diagnose issues and understand the inner workings of the software.

## Tracing method

In the configuration file, the method for tracing is defined by the `global.tracing.method` attribute and accepts the following options:

- `open-telemetry`: Sends tracing information to an OpenTelemetry collector.
- `log`: Writes tracing information to a log file.
- `stdout`: Prints tracing information to standard output.
- `journal`: Sends tracing information to the systemd journal. Only available on Linux/Unix systems.

The level of tracing information recorded is determined by the `global.tracing.level` attribute. The available levels are:

- `error`: Log only the most critical errors that could prevent the system from functioning properly.
- `warn`: Log warnings, which indicate potential problems that could impact the system's stability.
- `info`: Log informational messages, which provide a general overview of the system's behavior.
- `debug`: Used for debugging purposes and provides detailed information about the system's internal operations.
- `trace`: This level is the most verbose logging level and provides an extremely detailed log of all events that occur in the system.

