---
sidebar_position: 4
---

# Tracing & Logging

Stalwart Mail Server provides detailed tracing and logging information to help users monitor and understand its behavior. The logging mechanism can be configured to output to a file, standard output, or send tracing information to OpenTelemetry. This makes it easier for users to diagnose issues and understand the inner workings of the software.

## Tracing method

In the configuration file, the method for tracing is defined by the `global.tracing.method` attribute and accepts the following options:

- `open-telemetry`: Sends tracing information to an OpenTelemetry collector.
- `log`: Writes tracing information to a log file.
- `stdout`: Prints tracing information to standard output.

The level of tracing information recorded is determined by the `global.tracing.level` attribute. The available levels are:

- `error`: Log only the most critical errors that could prevent the system from functioning properly.
- `warn`: Log warnings, which indicate potential problems that could impact the system's stability.
- `info`: Log informational messages, which provide a general overview of the system's behavior.
- `debug`: Used for debugging purposes and provides detailed information about the system's internal operations.
- `trace`: This level is the most verbose logging level and provides an extremely detailed log of all events that occur in the system.

## OpenTelemetry

OpenTelemetry is an open-source standard for distributed tracing of applications. It provides a single set of APIs, libraries, agents, and collector services to capture distributed traces and metrics from applications.

By enabling OpenTelemetry in Stalwart Mail Server, administrators can gain insight into the performance and behavior of the system, which is useful for identifying and resolving issues. With OpenTelemetry, administrators can understand how messages are flowing through the system, where bottlenecks are occurring, and how the server is performing under different loads. This information can help to identify performance issues and make improvements to the system, ensuring that the server is operating at optimal levels and delivering the best possible experience to end-users.

Stalwart Mail Server is capable of sending tracing information to both gRPC and HTTP collectors. The transport protocol for sending tracing information is specified using the `global.tracing.transport` key, with options for either gRPC or HTTP transport:

- `grpc`: Tracing information is sent via gRPC.
- `http`: Tracing information is sent via HTTP.


### gRPC transport

The address of the gRPC OpenTelemetry collector can be defined using the optional `global.tracing.endpoint` argument, otherwise the default endpoint is used.

Example:

```toml
[global.tracing]
method = "open-telemetry"
transport = "grpc"
endpoint = "https://127.0.0.1/otel"
level = "info"
```

### HTTP transport

The endpoint URL for the HTTP OpenTelemetry collector is specified with the `global.tracing.endpoint` attribute, while the headers to be used can be defined with the `global.tracing.headers` attribute.

Example:

```toml
[global.tracing]
method = "open-telemetry"
transport = "http"
endpoint = "https://tracing.mydomain.net/v1/otel"
headers = ["Authorization: <place_auth_here>"]
level = "debug"
```

## Log file

Stalwart Mail Server provides the ability to log information to a text file that can be rotated at a specified interval. When the `log` method is selected, the following configuration options are available under the global.tracing key:

- `path`: The path to the directory where the log files will be stored.
- `prefix`: The prefix to be used for each log file.
- `rotate`: The frequency of log file rotation. Acceptable values are `daily`, `hourly`, `minutely`, or `never`.

Example:

```toml
[global.tracing]
method = "log"
path = "/opt/stalwart-mail/logs"
prefix = "stalwart-mail.log"
rotate = "daily"
level = "info"
```

## Standard output

When the `stdout` method is selected, all tracing and logging information will be printed to the standard output. This method can be useful when Stalwart Mail Server is run in a container environment like Docker.

Example: 

```toml
[global.tracing]
method = "stdout"
level = "trace"
```
