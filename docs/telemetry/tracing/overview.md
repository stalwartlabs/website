---
sidebar_position: 1
---

# Overview

Stalwart Mail Server provides detailed tracing and logging information to help users monitor and understand its behavior. The logging mechanisms can be configured to output to a file, standard output, or send tracing information to OpenTelemetry. It is possible to configure multiple loggers to output to different destinations, and the level of detail can be adjusted per logger. This makes it easier for users to diagnose issues and understand the inner workings of the software.

## Tracing method

In the configuration file, the method each tracer is defined with the the `tracer.<id>.type` attribute, where `<id>` is a unique identifier for the tracer. The supported tracers are:

- `open-telemetry`: Sends tracing information to an OpenTelemetry collector.
- `log`: Writes tracing information to a log file.
- `console`: Prints tracing information to the console.
- `journal`: Sends tracing information to the systemd journal. Only available on Linux/Unix systems.

The level of tracing information recorded is determined by the `tracer.<id>.level` attribute. The available levels are:

- `error`: Log only the most critical errors that could prevent the system from functioning properly.
- `warn`: Log warnings, which indicate potential problems that could impact the system's stability.
- `info`: Log informational messages, which provide a general overview of the system's behavior.
- `debug`: Used for debugging purposes and provides detailed information about the system's internal operations.
- `trace`: This level is the most verbose logging level and provides an extremely detailed log of all events that occur in the system.
- `disable`: Disables the tracer.

Tracers can be enabled or disabled by setting the `tracer.<id>.enable` attribute to `true` or `false`, respectively. When a tracer is disabled, no tracing information will be recorded by that tracer.
