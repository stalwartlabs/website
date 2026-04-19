---
title: Tracer
description: Defines a logging and tracing output method.
custom_edit_url: null
---

# Tracer

Defines a logging and tracing output method.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg> Telemetry › Tracers

## Fields

Tracer is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Log"`

Log file


##### `path`

> Type: <code>String</code> · required
>
> The path to the log file


##### `prefix`

> Type: <code>String</code> · default: `"stalwart"`
>
> The prefix for the log file


##### `rotate`

> Type: [<code>LogRotateFrequency</code>](#logrotatefrequency) · default: `"daily"`
>
> The frequency to rotate the log file


##### `ansi`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to use ANSI colors in logs


##### `multiline`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to write log entries as a single line or multiline


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enable or disable the tracer


##### `level`

> Type: [<code>TracingLevel</code>](#tracinglevel) · default: `"info"`
>
> The logging level for this tracer


##### `lossy`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to drop log entries if there is backlog


##### `events`

> Type: [<code>EventType</code>](../events.md)<code>[]</code>
>
> List of events to include or exclude based on filter mode


##### `eventsPolicy`

> Type: [<code>EventPolicy</code>](#eventpolicy) · default: `"exclude"`
>
> How to interpret the events list



### `@type: "Stdout"`

Console


##### `buffered`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to buffer log entries before writing to console


##### `ansi`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to use ANSI colors in logs


##### `multiline`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to write log entries as a single line or multiline


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enable or disable the tracer


##### `level`

> Type: [<code>TracingLevel</code>](#tracinglevel) · default: `"info"`
>
> The logging level for this tracer


##### `lossy`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to drop log entries if there is backlog


##### `events`

> Type: [<code>EventType</code>](../events.md)<code>[]</code>
>
> List of events to include or exclude based on filter mode


##### `eventsPolicy`

> Type: [<code>EventPolicy</code>](#eventpolicy) · default: `"exclude"`
>
> How to interpret the events list



### `@type: "Journal"`

Systemd Journal


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enable or disable the tracer


##### `level`

> Type: [<code>TracingLevel</code>](#tracinglevel) · default: `"info"`
>
> The logging level for this tracer


##### `lossy`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to drop log entries if there is backlog


##### `events`

> Type: [<code>EventType</code>](../events.md)<code>[]</code>
>
> List of events to include or exclude based on filter mode


##### `eventsPolicy`

> Type: [<code>EventPolicy</code>](#eventpolicy) · default: `"exclude"`
>
> How to interpret the events list



### `@type: "OtelHttp"`

Open Telemetry (HTTP)


##### `endpoint`

> Type: <code>Uri</code> · required
>
> The endpoint for Open Telemetry


##### `enableLogExporter`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to export logs to OpenTelemetry


##### `enableSpanExporter`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to export spans to OpenTelemetry


##### `throttle`

> Type: <code>Duration</code> · default: `"1s"`
>
> The minimum amount of time that must pass between each request to the OpenTelemetry endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Maximum amount of time that Stalwart will wait for a response from the OpenTelemetry endpoint


##### `httpAuth`

> Type: [<code>HttpAuth</code>](#httpauth) · required
>
> The type of HTTP authentication to use


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in HTTP requests


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enable or disable the tracer


##### `level`

> Type: [<code>TracingLevel</code>](#tracinglevel) · default: `"info"`
>
> The logging level for this tracer


##### `lossy`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to drop log entries if there is backlog


##### `events`

> Type: [<code>EventType</code>](../events.md)<code>[]</code>
>
> List of events to include or exclude based on filter mode


##### `eventsPolicy`

> Type: [<code>EventPolicy</code>](#eventpolicy) · default: `"exclude"`
>
> How to interpret the events list



### `@type: "OtelGrpc"`

Open Telemetry (gRPC)


##### `endpoint`

> Type: <code>Uri?</code>
>
> The endpoint for Open Telemetry


##### `enableLogExporter`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to export logs to OpenTelemetry


##### `enableSpanExporter`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to export spans to OpenTelemetry


##### `throttle`

> Type: <code>Duration</code> · default: `"1s"`
>
> The minimum amount of time that must pass between each request to the OpenTelemetry endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `"10s"`
>
> Maximum amount of time that Stalwart will wait for a response from the OpenTelemetry endpoint


##### `httpAuth`

> Type: [<code>HttpAuth</code>](#httpauth) · required
>
> The type of HTTP authentication to use


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in HTTP requests


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Enable or disable the tracer


##### `level`

> Type: [<code>TracingLevel</code>](#tracinglevel) · default: `"info"`
>
> The logging level for this tracer


##### `lossy`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to drop log entries if there is backlog


##### `events`

> Type: [<code>EventType</code>](../events.md)<code>[]</code>
>
> List of events to include or exclude based on filter mode


##### `eventsPolicy`

> Type: [<code>EventPolicy</code>](#eventpolicy) · default: `"exclude"`
>
> How to interpret the events list




## JMAP API

The Tracer object is available via the `urn:stalwart:jmap` capability.


### `x:Tracer/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysTracerGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tracer/get",
          {
            "ids": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:Tracer/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysTracerCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tracer/set",
          {
            "create": {
              "new1": {
                "@type": "Log",
                "ansi": true,
                "enable": true,
                "events": [],
                "eventsPolicy": "exclude",
                "level": "info",
                "lossy": false,
                "multiline": false,
                "path": "Example",
                "prefix": "stalwart",
                "rotate": "daily"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Update

This operation requires the `sysTracerUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tracer/set",
          {
            "update": {
              "id1": {
                "id": "id1"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Destroy

This operation requires the `sysTracerDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tracer/set",
          {
            "destroy": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




### `x:Tracer/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysTracerQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Tracer/query",
          {
            "filter": {}
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get tracer id1
```


### Create

```sh
stalwart-cli create tracer/log \
  --field path=Example \
  --field prefix=stalwart \
  --field rotate=daily \
  --field ansi=true \
  --field multiline=false \
  --field enable=true \
  --field level=info \
  --field lossy=false \
  --field 'events=[]' \
  --field eventsPolicy=exclude
```


### Query

```sh
stalwart-cli query tracer
```


### Update

```sh
stalwart-cli update tracer id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete tracer --ids id1
```



## Nested types


### HttpAuth {#httpauth}

Defines the HTTP authentication method to use for HTTP requests.


- **`Unauthenticated`**: Anonymous. No additional fields.
- **`Basic`**: Basic Authentication. Carries the fields of [`HttpAuthBasic`](#httpauthbasic).
- **`Bearer`**: Bearer Token. Carries the fields of [`HttpAuthBearer`](#httpauthbearer).




#### HttpAuthBasic {#httpauthbasic}

HTTP Basic authentication credentials.



##### `username`

> Type: <code>String</code> · required
>
> Username for HTTP Basic Authentication


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Password for HTTP Basic Authentication





##### SecretKey {#secretkey}

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





##### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





##### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





#### HttpAuthBearer {#httpauthbearer}

HTTP Bearer token authentication.



##### `bearerToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Bearer token for HTTP Bearer Authentication





## Enums


### LogRotateFrequency {#logrotatefrequency}



| Value | Label |
|---|---|
| `daily` | Daily |
| `hourly` | Hourly |
| `minutely` | Minutely |
| `never` | Never |


### TracingLevel {#tracinglevel}



| Value | Label |
|---|---|
| `error` | Error |
| `warn` | Warning |
| `info` | Info |
| `debug` | Debug |
| `trace` | Trace |


### EventPolicy {#eventpolicy}



| Value | Label |
|---|---|
| `include` | Only include the specified events |
| `exclude` | Exclude the specified events |


