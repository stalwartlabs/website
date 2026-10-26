---
title: "TaskManager"
description: "Configures how background tasks are retried after transient failures."
custom_edit_url: null
---

Configures how background tasks are retried after transient failures.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="TaskManager"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> Task Manager</span>

## Fields


##### `strategy`

> Type: [<code>TaskRetryStrategy</code>](#taskretrystrategy) · required
>
> Strategy used to compute the delay before a task that failed with a transient error is retried


##### `alertAfter`

> Type: <code>UnsignedInt</code> · default: `5` · min: 1
>
> Number of failed attempts after which a task is reported as stalled; stalled tasks keep retrying with the configured strategy



## JMAP API

The TaskManager singleton is available via the `urn:stalwart:jmap` capability.


### `x:TaskManager/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysTaskManagerGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TaskManager/get",
          {
            "ids": [
              "singleton"
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



### `x:TaskManager/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysTaskManagerUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:TaskManager/set",
          {
            "update": {
              "singleton": {
                "strategy": {
                  "@type": "ExponentialBackoff"
                }
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get TaskManager
```


### Update

```sh
stalwart-cli update TaskManager --field strategy='{"@type":"ExponentialBackoff"}'
```



## Nested types


### TaskRetryStrategy

Retry strategy for failed tasks.


- **`ExponentialBackoff`**: Exponential backoff. Carries the fields of [`TaskRetryStrategyBackoff`](#taskretrystrategybackoff).
- **`FixedDelay`**: Fixed delay. Carries the fields of [`TaskRetryStrategyFixed`](#taskretrystrategyfixed).




#### TaskRetryStrategyBackoff

Exponential backoff retry strategy settings.



##### `factor`

> Type: <code>Float</code> · default: `2.0` · min: 1
>
> Backoff factor for calculating retry delays


##### `initialDelay`

> Type: <code>Duration</code> · default: `60000`
>
> Initial delay before retrying a failed task


##### `maxDelay`

> Type: <code>Duration</code> · default: `21600000`
>
> Maximum delay between retry attempts


##### `jitter`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to apply jitter to the retry delay to avoid thundering herd problem





#### TaskRetryStrategyFixed

Fixed delay retry strategy settings.



##### `delay`

> Type: <code>Duration</code> · default: `300000`
>
> Fixed delay before retrying a failed task





