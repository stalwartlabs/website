---
sidebar_position: 2
---

# Endpoints

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

## Obtain OAuth token

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/oauth', headers = headers)

print(r.json())

```

`POST /oauth`

> Body parameter

```json
{
  "type": "code",
  "client_id": "webadmin",
  "redirect_uri": "stalwart://auth",
  "nonce": "ttsaXca3qx"
}
```

<h3 id="obtain-oauth-token-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» type|body|string|false|none|
|» client_id|body|string|false|none|
|» redirect_uri|body|string|false|none|
|» nonce|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "code": "4YmRFLu9Df1t4JO7Iffnuney4B8tVLAxjimdRxEg",
    "permissions": [
      "webadmin-update",
      "spam-filter-update",
      "dkim-signature-get",
      "dkim-signature-create",
      "undelete",
      "fts-reindex",
      "purge-account",
      "purge-in-memory-store",
      "purge-data-store",
      "purge-blob-store"
    ],
    "version": "0.11.0",
    "isEnterprise": true
  }
}
```

> 401 Response

```json
{
  "type": "about:blank",
  "status": 401,
  "title": "Unauthorized",
  "detail": "You have to authenticate first."
}
```

<h3 id="obtain-oauth-token-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Unauthorized|Inline|

<h3 id="obtain-oauth-token-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» code|string|false|none|none|
|»» permissions|[string]|false|none|none|
|»» version|string|false|none|none|
|»» isEnterprise|boolean|false|none|none|

Status Code **401**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» type|string|false|none|none|
|» status|number|false|none|none|
|» title|string|false|none|none|
|» detail|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Fetch Telemetry Metrics

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/telemetry/metrics', headers = headers)

print(r.json())

```

`GET /telemetry/metrics`

<h3 id="fetch-telemetry-metrics-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|after|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "error": "other",
  "details": "No metrics store has been defined",
  "reason": "You need to configure a metrics store in order to use this feature."
}
```

<h3 id="fetch-telemetry-metrics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="fetch-telemetry-metrics-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|
|» details|string|false|none|none|
|» reason|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Obtain Metrics Telemetry token

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/telemetry/live/metrics-token', headers = headers)

print(r.json())

```

`GET /telemetry/live/metrics-token`

> Example responses

> 200 Response

```json
{
  "data": "2GO4RahIkSAms6S00R9BRsroo97ZdYTz4QVxFCOwGrGkr7zguP0AVyTMA/iha3Vz/////w8DhZi1+ALBmLX4AndlYg=="
}
```

<h3 id="obtain-metrics-telemetry-token-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-metrics-telemetry-token-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Live Metrics

> Code samples

```python
import requests

r = requests.get('https://mail.example.org/api/telemetry/metrics/live')

print(r.json())

```

`GET /telemetry/metrics/live`

<h3 id="live-metrics-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|metrics|query|string|false|none|
|interval|query|number|false|none|
|token|query|string|false|none|

> Example responses

<h3 id="live-metrics-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<h3 id="live-metrics-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## List Principals

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/principal', headers = headers)

print(r.json())

```

`GET /principal`

<h3 id="list-principals-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|number|false|none|
|limit|query|number|false|none|
|types|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0
  }
}
```

<h3 id="list-principals-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-principals-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Create Principal

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/principal', headers = headers)

print(r.json())

```

`POST /principal`

> Body parameter

```json
{
  "type": "domain",
  "quota": 0,
  "name": "example.org",
  "description": "Example domain",
  "secrets": [],
  "emails": [],
  "urls": [],
  "memberOf": [],
  "roles": [],
  "lists": [],
  "members": [],
  "enabledPermissions": [],
  "disabledPermissions": [],
  "externalMembers": []
}
```

<h3 id="create-principal-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» type|body|string|false|none|
|» quota|body|number|false|none|
|» name|body|string|false|none|
|» description|body|string|false|none|
|» secrets|body|[any]|false|none|
|» emails|body|[any]|false|none|
|» urls|body|[any]|false|none|
|» memberOf|body|[any]|false|none|
|» roles|body|[any]|false|none|
|» lists|body|[any]|false|none|
|» members|body|[any]|false|none|
|» enabledPermissions|body|[any]|false|none|
|» disabledPermissions|body|[any]|false|none|
|» externalMembers|body|[any]|false|none|

> Example responses

> 200 Response

```json
{
  "data": 50
}
```

<h3 id="create-principal-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="create-principal-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Create DKIM Signature

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/dkim', headers = headers)

print(r.json())

```

`POST /dkim`

> Body parameter

```json
{
  "id": null,
  "algorithm": "Ed25519",
  "domain": "example.org",
  "selector": null
}
```

<h3 id="create-dkim-signature-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» id|body|object¦null|false|none|
|» algorithm|body|string|false|none|
|» domain|body|string|false|none|
|» selector|body|object¦null|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="create-dkim-signature-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="create-dkim-signature-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Fetch Principal

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/principal/{principal_id}', headers = headers)

print(r.json())

```

`GET /principal/{principal_id}`

<h3 id="fetch-principal-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|principal_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "id": 90,
    "type": "individual",
    "secrets": "$6$ONjGT6nQtmPNaxw0$NNF5DXtPfOay2mfVnPJ0uQ77C.L3LNxXO/QMyphP/DzpODqbDBBGd4/gCnckYPQj3st6pqwY8/KeBsCJ.oe1Y1",
    "name": "jane",
    "quota": 0,
    "description": "Jane Doe",
    "emails": "jane@example.org",
    "roles": [
      "user"
    ],
    "lists": [
      "all"
    ]
  }
}
```

<h3 id="fetch-principal-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="fetch-principal-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» id|number|false|none|none|
|»» type|string|false|none|none|
|»» secrets|string|false|none|none|
|»» name|string|false|none|none|
|»» quota|number|false|none|none|
|»» description|string|false|none|none|
|»» emails|string|false|none|none|
|»» roles|[string]|false|none|none|
|»» lists|[string]|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Update Principal

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.patch('https://mail.example.org/api/principal/{principal_id}', headers = headers)

print(r.json())

```

`PATCH /principal/{principal_id}`

> Body parameter

```json
[
  {
    "action": "set",
    "field": "name",
    "value": "jane.doe"
  },
  {
    "action": "set",
    "field": "description",
    "value": "Jane Mary Doe"
  },
  {
    "action": "addItem",
    "field": "emails",
    "value": "jane-doe@example.org"
  },
  {
    "action": "removeItem",
    "field": "emails",
    "value": "jane@example.org"
  }
]
```

<h3 id="update-principal-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|principal_id|path|string|true|none|
|body|body|array[object]|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="update-principal-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="update-principal-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Delete Principal

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.delete('https://mail.example.org/api/principal/{principal_id}', headers = headers)

print(r.json())

```

`DELETE /principal/{principal_id}`

<h3 id="delete-principal-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|principal_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="delete-principal-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="delete-principal-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Queued Messages

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/queue/messages', headers = headers)

print(r.json())

```

`GET /queue/messages`

<h3 id="list-queued-messages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|number|false|none|
|max-total|query|number|false|none|
|limit|query|number|false|none|
|values|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0,
    "status": true
  }
}
```

<h3 id="list-queued-messages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-queued-messages-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|
|»» status|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Reschedule Queued Messages

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.patch('https://mail.example.org/api/queue/messages', headers = headers)

print(r.json())

```

`PATCH /queue/messages`

<h3 id="reschedule-queued-messages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|filter|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": true
}
```

<h3 id="reschedule-queued-messages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="reschedule-queued-messages-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Delete Queued Messages

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.delete('https://mail.example.org/api/queue/messages', headers = headers)

print(r.json())

```

`DELETE /queue/messages`

<h3 id="delete-queued-messages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|text|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": true
}
```

<h3 id="delete-queued-messages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="delete-queued-messages-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Queued Reports

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/queue/reports', headers = headers)

print(r.json())

```

`GET /queue/reports`

<h3 id="list-queued-reports-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|max-total|query|number|false|none|
|limit|query|number|false|none|
|page|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0
  }
}
```

<h3 id="list-queued-reports-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-queued-reports-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Incoming DMARC Reports

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/reports/dmarc', headers = headers)

print(r.json())

```

`GET /reports/dmarc`

<h3 id="list-incoming-dmarc-reports-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|max-total|query|number|false|none|
|limit|query|number|false|none|
|page|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0
  }
}
```

<h3 id="list-incoming-dmarc-reports-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-incoming-dmarc-reports-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Incoming TLS Reports

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/reports/tls', headers = headers)

print(r.json())

```

`GET /reports/tls`

<h3 id="list-incoming-tls-reports-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|limit|query|number|false|none|
|max-total|query|number|false|none|
|page|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0
  }
}
```

<h3 id="list-incoming-tls-reports-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-incoming-tls-reports-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Incoming ARF Reports

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/reports/arf', headers = headers)

print(r.json())

```

`GET /reports/arf`

<h3 id="list-incoming-arf-reports-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|number|false|none|
|limit|query|number|false|none|
|max-total|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0
  }
}
```

<h3 id="list-incoming-arf-reports-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-incoming-arf-reports-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Stored Traces

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/telemetry/traces', headers = headers)

print(r.json())

```

`GET /telemetry/traces`

<h3 id="list-stored-traces-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|type|query|string|false|none|
|page|query|number|false|none|
|limit|query|number|false|none|
|values|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "error": "unsupported",
  "details": "No tracing store has been configured"
}
```

<h3 id="list-stored-traces-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-stored-traces-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|
|» details|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Query Log Files

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/logs', headers = headers)

print(r.json())

```

`GET /logs`

<h3 id="query-log-files-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|page|query|number|false|none|
|limit|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [
      {
        "timestamp": "2025-01-05T14:06:29Z",
        "level": "TRACE",
        "event": "HTTP request body",
        "event_id": "http.request-body",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, contents = \"\", size = 0"
      },
      {
        "timestamp": "2025-01-05T14:06:29Z",
        "level": "TRACE",
        "event": "Write batch operation",
        "event_id": "store.data-write",
        "details": "elapsed = 0ms, total = 2"
      },
      {
        "timestamp": "2025-01-05T14:06:29Z",
        "level": "TRACE",
        "event": "Expression evaluation result",
        "event_id": "eval.result",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, id = \"http.allowed-endpoint\", result = \"Integer(200)\""
      },
      {
        "timestamp": "2025-01-05T14:06:29Z",
        "level": "DEBUG",
        "event": "HTTP request URL",
        "event_id": "http.request-url",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, url = \"/api/logs?page=1&limit=50&\""
      },
      {
        "timestamp": "2025-01-05T14:06:23Z",
        "level": "TRACE",
        "event": "HTTP response body",
        "event_id": "http.response-body",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, contents = \"{\"error\":\"unsupported\",\"details\":\"No tracing store has been configured\"}\", code = 200, size = 72"
      },
      {
        "timestamp": "2025-01-05T14:06:23Z",
        "level": "DEBUG",
        "event": "Management operation not supported",
        "event_id": "manage.not-supported",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, details = No tracing store has been configured"
      },
      {
        "timestamp": "2025-01-05T14:06:23Z",
        "level": "TRACE",
        "event": "HTTP request body",
        "event_id": "http.request-body",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, contents = \"\", size = 0"
      },
      {
        "timestamp": "2025-01-05T14:06:23Z",
        "level": "TRACE",
        "event": "Write batch operation",
        "event_id": "store.data-write",
        "details": "elapsed = 0ms, total = 2"
      },
      {
        "timestamp": "2025-01-05T14:06:23Z",
        "level": "TRACE",
        "event": "Expression evaluation result",
        "event_id": "eval.result",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, id = \"http.allowed-endpoint\", result = \"Integer(200)\""
      },
      {
        "timestamp": "2025-01-05T14:06:23Z",
        "level": "DEBUG",
        "event": "HTTP request URL",
        "event_id": "http.request-url",
        "details": "listenerId = \"http\", localPort = 1443, remoteIp = ::1, remotePort = 57223, url = \"/api/telemetry/traces?page=1&type=delivery.attempt-start&limit=10&values=1&\""
      }
    ],
    "total": 100
  }
}
```

<h3 id="query-log-files-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="query-log-files-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[object]|false|none|none|
|»»» timestamp|string|false|none|none|
|»»» level|string|false|none|none|
|»»» event|string|false|none|none|
|»»» event_id|string|false|none|none|
|»»» details|string|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Train Spam Filter as Spam

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/spam-filter/train/spam', headers = headers)

print(r.json())

```

`POST /spam-filter/train/spam`

> Body parameter

```yaml
"From: john@example.org\nTo: list@example.org\nSubject: Testing, please ignore\nContent-Type: text/plain; charset": |
  "utf-8"
  Content-Transfer-Encoding: 8bit

  Testing 1, 2, 3

```

<h3 id="train-spam-filter-as-spam-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» From: john@example.org
To: list@example.org
Subject: Testing, please ignore
Content-Type: text|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="train-spam-filter-as-spam-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="train-spam-filter-as-spam-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Train Spam Filter as Ham

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/spam-filter/train/ham', headers = headers)

print(r.json())

```

`POST /spam-filter/train/ham`

> Body parameter

```yaml
"From: john@example.org\nTo: list@example.org\nSubject: Testing, please ignore\nContent-Type: text/plain; charset": |
  "utf-8"
  Content-Transfer-Encoding: 8bit

  Testing 1, 2, 3

```

<h3 id="train-spam-filter-as-ham-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» From: john@example.org
To: list@example.org
Subject: Testing, please ignore
Content-Type: text|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="train-spam-filter-as-ham-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="train-spam-filter-as-ham-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Train Account's Spam Filter as Spam

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/spam-filter/train/spam/{account_id}', headers = headers)

print(r.json())

```

`POST /spam-filter/train/spam/{account_id}`

> Body parameter

```yaml
"From: john@example.org\nTo: list@example.org\nSubject: Testing, please ignore\nContent-Type: text/plain; charset": |
  "utf-8"
  Content-Transfer-Encoding: 8bit

  Testing 1, 2, 3

```

<h3 id="train-account's-spam-filter-as-spam-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|
|body|body|object|false|none|
|» From: john@example.org
To: list@example.org
Subject: Testing, please ignore
Content-Type: text|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="train-account's-spam-filter-as-spam-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="train-account's-spam-filter-as-spam-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Train Account's Spam Filter as Ham

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/spam-filter/train/ham/{account_id}', headers = headers)

print(r.json())

```

`POST /spam-filter/train/ham/{account_id}`

> Body parameter

```yaml
"From: john@example.org\nTo: list@example.org\nSubject: Testing, please ignore\nContent-Type: text/plain; charset": |
  "utf-8"
  Content-Transfer-Encoding: 8bit

  Testing 1, 2, 3

```

<h3 id="train-account's-spam-filter-as-ham-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|
|body|body|object|false|none|
|» From: john@example.org
To: list@example.org
Subject: Testing, please ignore
Content-Type: text|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="train-account's-spam-filter-as-ham-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="train-account's-spam-filter-as-ham-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Test Spam Filter Classification

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/spam-filter/classify', headers = headers)

print(r.json())

```

`POST /spam-filter/classify`

> Body parameter

```json
{
  "message": "From: john@example.org\nTo: list@example.org\nSubject: Testing, please ignore\nContent-Type: text/plain; charset=\"utf-8\"\nContent-Transfer-Encoding: 8bit\n\nTesting 1, 2, 3\n",
  "remoteIp": "8.8.8.8",
  "ehloDomain": "foo.org",
  "authenticatedAs": null,
  "isTls": true,
  "envFrom": "bill@foo.org",
  "envFromFlags": 0,
  "envRcptTo": [
    "john@example.org"
  ]
}
```

<h3 id="test-spam-filter-classification-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» message|body|string|false|none|
|» remoteIp|body|string|false|none|
|» ehloDomain|body|string|false|none|
|» authenticatedAs|body|object¦null|false|none|
|» isTls|body|boolean|false|none|
|» envFrom|body|string|false|none|
|» envFromFlags|body|number|false|none|
|» envRcptTo|body|[string]|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "score": 12.7,
    "tags": {
      "FROM_NO_DN": {
        "action": "allow",
        "value": 0
      },
      "SOURCE_ASN_15169": {
        "action": "allow",
        "value": 0
      },
      "SOURCE_COUNTRY_US": {
        "action": "allow",
        "value": 0
      },
      "MISSING_DATE": {
        "action": "allow",
        "value": 1
      },
      "FROMHOST_NORES_A_OR_MX": {
        "action": "allow",
        "value": 1.5
      },
      "MISSING_MIME_VERSION": {
        "action": "allow",
        "value": 2
      },
      "FORGED_SENDER": {
        "action": "allow",
        "value": 0.3
      },
      "SPF_NA": {
        "action": "allow",
        "value": 0
      },
      "X_HDR_TO": {
        "action": "allow",
        "value": 0
      },
      "HELO_IPREV_MISMATCH": {
        "action": "allow",
        "value": 1
      },
      "X_HDR_CONTENT_TYPE": {
        "action": "allow",
        "value": 0
      },
      "AUTH_NA": {
        "action": "allow",
        "value": 1
      },
      "FORGED_RECIPIENTS": {
        "action": "allow",
        "value": 2
      },
      "RBL_SENDERSCORE_REPUT_BLOCKED": {
        "action": "allow",
        "value": 0
      },
      "RCVD_COUNT_ZERO": {
        "action": "allow",
        "value": 0.1
      },
      "X_HDR_SUBJECT": {
        "action": "allow",
        "value": 0
      },
      "X_HDR_FROM": {
        "action": "allow",
        "value": 0
      },
      "RCPT_COUNT_ONE": {
        "action": "allow",
        "value": 0
      },
      "MISSING_MID": {
        "action": "allow",
        "value": 2.5
      },
      "TO_DOM_EQ_FROM_DOM": {
        "action": "allow",
        "value": 0
      },
      "ARC_NA": {
        "action": "allow",
        "value": 0
      },
      "RCVD_TLS_LAST": {
        "action": "allow",
        "value": 0
      },
      "X_HDR_CONTENT_TRANSFER_ENCODING": {
        "action": "allow",
        "value": 0
      },
      "HELO_NORES_A_OR_MX": {
        "action": "allow",
        "value": 0.3
      },
      "TO_DN_NONE": {
        "action": "allow",
        "value": 0
      },
      "FROM_NEQ_ENV_FROM": {
        "action": "allow",
        "value": 0
      },
      "DMARC_NA": {
        "action": "allow",
        "value": 1
      },
      "SINGLE_SHORT_PART": {
        "action": "allow",
        "value": 0
      },
      "DKIM_NA": {
        "action": "allow",
        "value": 0
      }
    },
    "disposition": {
      "action": "allow",
      "value": "X-Spam-Result: ARC_NA (0.00),\r\n\tDKIM_NA (0.00),\r\n \tFROM_NEQ_ENV_FROM (0.00),\r\n\tFROM_NO_DN (0.00),\r\n\tRBL_SENDERSCORE_REPUT_BLOCKED (0.00),\r\n\tRCPT_COUNT_ONE (0.00),\r\n\tRCVD_TLS_LAST (0.00),\r \n\tSINGLE_SHORT_PART (0.00),\r\n\tSPF_NA (0.00),\r\n\tTO_DN_NONE (0.00),\r\n\tTO_DOM_EQ_FROM_DOM (0.00),\r\n\tRCVD_COUNT_ZERO (0.10),\r\n\tFORGED_SENDER (0.30),\r\n\tHELO_NORES_A_OR_MX (0.30),\r \n\tAUTH_NA (1.00),\r\n\tDMARC_NA (1.00),\r\n\tHELO_IPREV_MISMATCH (1.00),\r\n\tMISSING_DATE (1.00),\r\n\tFROMHOST_NORES_A_OR_MX (1.50),\r\n\tFORGED_RECIPIENTS (2.00),\r\n\tMISSING_MIME_VERSION (2.00),\r\n\tMISSING_MID (2.50)\r\nX-Spam-Status: Yes, score=12.70\r\n"
    }
  }
}
```

<h3 id="test-spam-filter-classification-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="test-spam-filter-classification-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» score|number|false|none|none|
|»» tags|object|false|none|none|
|»»» FROM_NO_DN|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» SOURCE_ASN_15169|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» SOURCE_COUNTRY_US|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» MISSING_DATE|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» FROMHOST_NORES_A_OR_MX|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» MISSING_MIME_VERSION|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» FORGED_SENDER|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» SPF_NA|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» X_HDR_TO|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» HELO_IPREV_MISMATCH|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» X_HDR_CONTENT_TYPE|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» AUTH_NA|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» FORGED_RECIPIENTS|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» RBL_SENDERSCORE_REPUT_BLOCKED|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» RCVD_COUNT_ZERO|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» X_HDR_SUBJECT|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» X_HDR_FROM|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» RCPT_COUNT_ONE|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» MISSING_MID|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» TO_DOM_EQ_FROM_DOM|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» ARC_NA|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» RCVD_TLS_LAST|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» X_HDR_CONTENT_TRANSFER_ENCODING|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» HELO_NORES_A_OR_MX|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» TO_DN_NONE|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» FROM_NEQ_ENV_FROM|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» DMARC_NA|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» SINGLE_SHORT_PART|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»»» DKIM_NA|object|false|none|none|
|»»»» action|string|false|none|none|
|»»»» value|number|false|none|none|
|»» disposition|object|false|none|none|
|»»» action|string|false|none|none|
|»»» value|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Obtain a Troubleshooting Token

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/troubleshoot/token', headers = headers)

print(r.json())

```

`GET /troubleshoot/token`

> Example responses

> 200 Response

```json
{
  "data": "+bS1rCUcrjoEtl9f7Vz1P6daqVs4nywxa56bHltPIASijRFrj1JrwvHxJCWphPKs/////w8E8p21+AKunrX4AndlYg=="
}
```

<h3 id="obtain-a-troubleshooting-token-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-a-troubleshooting-token-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Run Delivery Troubleshooting

> Code samples

```python
import requests

r = requests.get('https://mail.example.org/api/troubleshoot/delivery/{recipient}')

print(r.json())

```

`GET /troubleshoot/delivery/{recipient}`

<h3 id="run-delivery-troubleshooting-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|recipient|path|string|true|none|
|token|query|string|false|none|

> Example responses

<h3 id="run-delivery-troubleshooting-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<h3 id="run-delivery-troubleshooting-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## Run DMARC Troubleshooting

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/troubleshoot/dmarc', headers = headers)

print(r.json())

```

`POST /troubleshoot/dmarc`

> Body parameter

```json
{
  "remoteIp": "8.8.8.8",
  "ehloDomain": "mx.google.com",
  "mailFrom": "john@google.com",
  "body": "From: john@example.org\nTo: list@example.org\nSubject: Testing, please ignore\nContent-Type: text/plain; charset=\"utf-8\"\nContent-Transfer-Encoding: 8bit\n\nTesting 1, 2, 3\n"
}
```

<h3 id="run-dmarc-troubleshooting-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» remoteIp|body|string|false|none|
|» ehloDomain|body|string|false|none|
|» mailFrom|body|string|false|none|
|» body|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "spfEhloDomain": "mx.google.com",
    "spfEhloResult": {
      "type": "none"
    },
    "spfMailFromDomain": "google.com",
    "spfMailFromResult": {
      "type": "softFail",
      "details": null
    },
    "ipRevResult": {
      "type": "pass"
    },
    "ipRevPtr": [
      "dns.google."
    ],
    "dkimResults": [],
    "dkimPass": false,
    "arcResult": {
      "type": "none"
    },
    "dmarcResult": {
      "type": "none"
    },
    "dmarcPass": false,
    "dmarcPolicy": "reject",
    "elapsed": 200
  }
}
```

<h3 id="run-dmarc-troubleshooting-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="run-dmarc-troubleshooting-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» spfEhloDomain|string|false|none|none|
|»» spfEhloResult|object|false|none|none|
|»»» type|string|false|none|none|
|»» spfMailFromDomain|string|false|none|none|
|»» spfMailFromResult|object|false|none|none|
|»»» type|string|false|none|none|
|»»» details|object¦null|false|none|none|
|»» ipRevResult|object|false|none|none|
|»»» type|string|false|none|none|
|»» ipRevPtr|[string]|false|none|none|
|»» dkimResults|[any]|false|none|none|
|»» dkimPass|boolean|false|none|none|
|»» arcResult|object|false|none|none|
|»»» type|string|false|none|none|
|»» dmarcResult|object|false|none|none|
|»»» type|string|false|none|none|
|»» dmarcPass|boolean|false|none|none|
|»» dmarcPolicy|string|false|none|none|
|»» elapsed|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Reload Settings

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/reload/', headers = headers)

print(r.json())

```

`GET /reload/`

> Example responses

> 200 Response

```json
{
  "data": {
    "warnings": {},
    "errors": {}
  }
}
```

<h3 id="reload-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="reload-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» warnings|object|false|none|none|
|»» errors|object|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Update Spam Filter

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/update/spam-filter', headers = headers)

print(r.json())

```

`GET /update/spam-filter`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="update-spam-filter-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="update-spam-filter-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Update WebAdmin

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/update/webadmin', headers = headers)

print(r.json())

```

`GET /update/webadmin`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="update-webadmin-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="update-webadmin-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Request FTS Reindex

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/reindex', headers = headers)

print(r.json())

```

`GET /store/reindex`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="request-fts-reindex-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="request-fts-reindex-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Delete Global Bayes Model

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/in-memory/default/bayes-global', headers = headers)

print(r.json())

```

`GET /store/purge/in-memory/default/bayes-global`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="delete-global-bayes-model-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="delete-global-bayes-model-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Settings by Key

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/settings/keys', headers = headers)

print(r.json())

```

`GET /settings/keys`

<h3 id="list-settings-by-key-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|prefixes|query|string|false|none|
|keys|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "server.hostname": "mx.fr.email"
  }
}
```

<h3 id="list-settings-by-key-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-settings-by-key-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» server.hostname|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Settings by Group

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/settings/group', headers = headers)

print(r.json())

```

`GET /settings/group`

<h3 id="list-settings-by-group-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|limit|query|number|false|none|
|page|query|number|false|none|
|suffix|query|string|false|none|
|prefix|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "total": 11,
    "items": [
      {
        "_id": "http",
        "bind": "[::]:1443",
        "protocol": "http"
      },
      {
        "bind": "[::]:443",
        "_id": "https",
        "protocol": "http",
        "tls.implicit": "true"
      },
      {
        "protocol": "imap",
        "bind": "[::]:143",
        "_id": "imap"
      },
      {
        "bind": "[::]:1143",
        "tls.implicit": "false",
        "_id": "imapnotls",
        "protocol": "imap",
        "proxy.override": "false",
        "tls.override": "false",
        "tls.enable": "false",
        "socket.override": "false"
      },
      {
        "bind": "[::]:993",
        "tls.implicit": "true",
        "protocol": "imap",
        "_id": "imaptls"
      },
      {
        "bind": "[::]:110",
        "protocol": "pop3",
        "_id": "pop3"
      },
      {
        "tls.implicit": "true",
        "_id": "pop3s",
        "protocol": "pop3",
        "bind": "[::]:995"
      },
      {
        "protocol": "managesieve",
        "_id": "sieve",
        "bind": "[::]:4190"
      },
      {
        "bind": "[::]:25",
        "_id": "smtp",
        "protocol": "smtp"
      },
      {
        "_id": "submission",
        "bind": "[::]:587",
        "protocol": "smtp"
      }
    ]
  }
}
```

<h3 id="list-settings-by-group-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-settings-by-group-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» total|number|false|none|none|
|»» items|[object]|false|none|none|
|»»» _id|string|false|none|none|
|»»» bind|string|false|none|none|
|»»» protocol|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Settings

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/settings/list', headers = headers)

print(r.json())

```

`GET /settings/list`

<h3 id="list-settings-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|prefix|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "total": 9,
    "items": {
      "enable": "true",
      "format": "list",
      "limits.entries": "100000",
      "limits.entry-size": "512",
      "limits.size": "104857600",
      "refresh": "12h",
      "retry": "1h",
      "timeout": "30s",
      "url": "https://openphish.com/feed.txt"
    }
  }
}
```

<h3 id="list-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» total|number|false|none|none|
|»» items|object|false|none|none|
|»»» enable|string|false|none|none|
|»»» format|string|false|none|none|
|»»» limits.entries|string|false|none|none|
|»»» limits.entry-size|string|false|none|none|
|»»» limits.size|string|false|none|none|
|»»» refresh|string|false|none|none|
|»»» retry|string|false|none|none|
|»»» timeout|string|false|none|none|
|»»» url|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Update Settings

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/settings', headers = headers)

print(r.json())

```

`POST /settings`

> Body parameter

```json
[
  {
    "type": "clear",
    "prefix": "spam-filter.rule.stwt_arc_signed."
  }
]
```

<h3 id="update-settings-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|array[object]|false|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="update-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="update-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Obtain Encryption-at-Rest Settings

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/account/crypto', headers = headers)

print(r.json())

```

`GET /account/crypto`

> Example responses

> 200 Response

```json
{
  "data": {
    "type": "disabled"
  }
}
```

<h3 id="obtain-encryption-at-rest-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-encryption-at-rest-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» type|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Update Encryption-at-Rest Settings

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/account/crypto', headers = headers)

print(r.json())

```

`POST /account/crypto`

> Body parameter

```json
{
  "type": "pGP",
  "algo": "Aes256",
  "certs": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nxsFNBGTGHwkBEADRB5EEtfsnUwgF2ZRg6h1fp2E8LNhv4lb9AWersI8KNFoWM6qx\n Bk/MfEpgILSPdW3g7PWHOxPV/hxjtStFHfbU/Ye5VvfbkU49faIPiw1V3MQJJ171\n cN6kgMnABfdixNiutDkHP4f34ABrEqexX2myOP+btxL24gI/N9UpOD5PiKTyKR7i\n GwNpi+O022rs/KvjlWR7iSJ4vk7bGFfTNHvWI6dZworey1tZoTIZ0CgvgMeB/F1q\n OOa0FvrJdNYR227RpHmICqFqTptNZ2EfdkJ6QUXW7bZ9dWgL36ds9QPJOGcG3c5i\n JebeX5YdJnniBefiWjfZElcqh/N6SqVuEwoTLyMCnMZ6gjNMn6tddwPH24kavZhT\n p6+vhTHmyq8XBqK/XEt9r+clSfg2hi5s7GO7hQV+W26xRjX7sQJY41PfzkgYJ0BM\n 6+w09X1ZO/iMjEp44t2rd3xSudwGYhlbazXbdB+OJaa3RtyjOAeFgY8OyNlODx3V\n xXLtF+104HGSL7nkpBsu6LLighSgEEF2Vok43grr0omyb1NPhWoAZhM8sT5iv5gW\n fKvB1O13c+hDc/iGTAvcrtdLLnF2Cs+6HD7r7zPPM4L6DrD1+oQt510H/oOEE5NZ\n wIS9CmBf0txqwk7n1U5V95lonaCK9nfoKeQ1fKl/tu01dCeERRbMXG2nCQARAQAB\n zRtKb2huIERvZSA8am9obkBleGFtcGxlLm9yZz7CwYcEEwEIADEWIQQWwx1eM+Aa\n o8okGzL45grMTSggxQUCZMYfCQIbAwQLCQgHBRUICQoLBRYCAwEAAAoJEPjmCsxN\n KCDFWP4QAI3eS5nPxmU0AC9/h8jeKNgjgpENroNQZKeWZQ8x4PfncDRkcbsJfT7Y\n IVZl4zw6gFKY5EoB1s1KkYJxPgYsqicmKNiR7Tnzabb3mzomU48FKaIyVCBzFUnJ\n YMroL/rm7QhoW2WWLvT+CPCPway/tA3By8Be/YOjhavJ8mf1W3rPzt87/4Vo6erf\n yzL0lN+FQmmhKfT4j42jF4SMSyyC2yzvfC7PT49u+KUKQm/LpQsfKHpwXZ/VI6+X\n GtZjTqsc+uglJYRo69oosImLzieA/ST1ltjmUutZQOSvlQFpDUEFrMej8XZ0qsrf\n 0gP2iwxyl0vkhV8c6wO6CacDHPivvQEHed9H1PNGn3DBfKb7Mq/jado2DapRtJg3\n 2OH0F0HTvQ0uNKl30xMUcwGQB0cKOlaFtksZT1LsosQPhtPLpFy1TuWaXOInpQLq\n JmNVcTbydOsCKq0mb6bgGcvhElC1q39tclKP3rOEDOnJ8hE6wYNaMGrt6WSKr3Tt\n h52M6KwTXOuMAecMvpDBSS3UFEVQ+T5puzInDTkjINxmj23ip+swA1x3HH2IgNrO\n VJ7O20oEf0+qC47R5rTRUxrvh/U0U3DRE5xt2J2T3xetFDT2mnQv0jcyMg/UlXXv\n GpGVfwNkvN0Cxmb1tFiBNLKCcPVizxq4MLrwx+MVfQBaRCwjJrUszsFNBGTGHwoB\n EACr5lA+j5pH0Er6Q76btbS4q9JgNjDNrjKJwX9brdBY1oXIUeBqCW9ekoqDTFpn\n xA5EFGJvPO++/0ZCa+zXE4IAcXS9+I9HVBouenPYBLETnXK0Phws+OCLoe0cAIvG\n e9Xo9VrHcGXCs9tJruVSAW3NF04YejHmnHNfEuD8mbaUdxVn5zc23w/2gLaY/ABL\n ZfNV8XZw0jBVBm3YXS3Ob3uIO+RvsNqBgnhGYN/C51QI9hdxXWUDlD1vdRacXmcI\n LDCYC3w6u8caxL0ktXTS4zwN+hEu7jHxBNiKcovCeIF5VZ5NcPpp6+6Y+vNdmmXw\n +lWNwAzj3ah6iu+y25LKSsz+7IkCh5liOwwYohO+YI7SjtTD+gL9HiHYAIO+PtBh\n 7GudmUwFoARu/q54hE4ThpzkeOzJzPqGkM/CzmwdKKM3u81ze+72ptJOqVKbFEsQ\n 3+RURrIAfyYyeJj4VVCfHNzrRRVpARZc9hJm1AXefxPnDN9dxbikjQgbg5UxrKaJ\n cjVU+go5CH5lg2D1LRGfKqTJtfiWFPjtztNgMp/SeslkhhFXsyJ0RJDcU8VfRBrO\n DBnZvPnZi4nLaWCL1LdHA8Y9EJgSwVOsfdRqL/Xk9qxqgl5R8m8lsNKZN2EYkfMN\n 4Vd+/8UBbmibHYoGIQi7UlNSPthc0XQcRzFen+3H4sg5kQARAQABwsF2BBgBCAAg\n FiEEFsMdXjPgGqPKJBsy+OYKzE0oIMUFAmTGHwsCGwwACgkQ+OYKzE0oIMXn4hAA\n lUWeF7tDdyENsOYyhsbtLIuLipYe6orHFY5m68NNOoLWwqEeTvutJgFeDT4WxYi0\n PJaNQYFPyGVyg7N0hCx5cGwajdnwGpb5zpSNyvG2Yes9I1O/u7+FFrbSwOuo61t1\n scGa8YlgTKoyGc9cwxl5U8krrlEwXTWQ/qF1Gq2wHG23wm1D2d2PXFDRvw3gPxJn\n yWkrx5k26ru1kguM7XFVyRi7B+uG4vdvMlxMBXM3jpH1CJRr82VvzYPv7f05Z5To\n C7XDqHpWKx3+AQvh/ZsSBpBhzK8qaixysMwnawe05rOPydWvsLlnMCGManKVnq9Y\n Wek1P2dwYT9zuroBR5nmrECY+xVWk7vhsDasKsYlQ/LdDyzSL7qh0Vq3DjcoHxLI\n uL7qQ3O0YRcKGfmQibpKdDzvIqA+48Nfh2nDnTxvfuwOxb41zdLTZQftaSXc0Xwd\n HgquBAFbRDr5TyWlUUc8iACowKkk01pEPc8coxPCp6F/hz6kgmebRevzs7sxwrS7\n aUWycSls783JC7WO267DRD30FNx+9S7SY4ECzhDGjLdne6wIoib1L9SFkk1AAKb3\n m2+6BB/HxCXtMqi95pFeCjV99bp+PBqoifx9SlFYZq9qcGDr/jyrdG8V2Wf/HF4n\n K8RIPxB+daAPMLTpj4WBhNquSE6mRQvABEf0GPi2eLA=\n=0TDv\n-----END PGP PUBLIC KEY BLOCK-----\n\n\n"
}
```

<h3 id="update-encryption-at-rest-settings-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|false|none|
|» type|body|string|false|none|
|» algo|body|string|false|none|
|» certs|body|string|false|none|

> Example responses

> 200 Response

```json
{
  "data": 1
}
```

<h3 id="update-encryption-at-rest-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="update-encryption-at-rest-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Obtain Account Authentication Settings

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/account/auth', headers = headers)

print(r.json())

```

`GET /account/auth`

> Example responses

> 200 Response

```json
{
  "data": {
    "otpEnabled": false,
    "appPasswords": []
  }
}
```

<h3 id="obtain-account-authentication-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-account-authentication-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» otpEnabled|boolean|false|none|none|
|»» appPasswords|[any]|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Update Account Authentication Settings

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/account/auth', headers = headers)

print(r.json())

```

`POST /account/auth`

> Body parameter

```json
[
  {
    "type": "addAppPassword",
    "name": "dGVzdCQyMDI1LTAxLTA1VDE0OjEyOjUxLjg0NyswMDowMA==",
    "password": "$6$4M/5LmG7b13r0cdE$6zb.i6wJ3pAQHA2MRHkKg0t8bgSYb2IeqiIU115t.NugwW6VXifE0VKI5n2BQUNwdeDMUzaX82TmhuVVgC0Gx1"
  }
]
```

<h3 id="update-account-authentication-settings-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|array[object]|false|none|

> Example responses

> 200 Response

```json
{
  "error": "other",
  "details": "Fallback administrator accounts do not support 2FA or AppPasswords",
  "reason": null
}
```

> 401 Response

```json
{
  "type": "about:blank",
  "status": 401,
  "title": "Unauthorized",
  "detail": "You have to authenticate first."
}
```

<h3 id="update-account-authentication-settings-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Unauthorized|Inline|

<h3 id="update-account-authentication-settings-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|
|» details|string|false|none|none|
|» reason|object¦null|false|none|none|

Status Code **401**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» type|string|false|none|none|
|» status|number|false|none|none|
|» title|string|false|none|none|
|» detail|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Stop Queue Processing

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.patch('https://mail.example.org/api/queue/status/stop', headers = headers)

print(r.json())

```

`PATCH /queue/status/stop`

> Example responses

> 200 Response

```json
{
  "data": true
}
```

<h3 id="stop-queue-processing-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="stop-queue-processing-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Resume Queue Processing

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.patch('https://mail.example.org/api/queue/status/start', headers = headers)

print(r.json())

```

`PATCH /queue/status/start`

> Example responses

> 200 Response

```json
{
  "data": false
}
```

<h3 id="resume-queue-processing-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="resume-queue-processing-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Obtain Queued Message Details

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/queue/messages/{message_id}', headers = headers)

print(r.json())

```

`GET /queue/messages/{message_id}`

<h3 id="obtain-queued-message-details-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|message_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "id": 217700302698266620,
    "return_path": "pepe@pepe.com",
    "domains": [
      {
        "name": "example.org",
        "status": "scheduled",
        "recipients": [
          {
            "address": "john@example.org",
            "status": "scheduled"
          }
        ],
        "retry_num": 0,
        "next_retry": "2025-01-05T14:33:15Z",
        "next_notify": "2025-01-06T14:33:15Z",
        "expires": "2025-01-10T14:33:15Z"
      }
    ],
    "created": "2025-01-05T14:33:15Z",
    "size": 1451,
    "blob_hash": "ykrZ_KghvdG2AdjH4AZajkSvZvcsxP_oI2HEZvw-tS0"
  }
}
```

> 404 Response

```json
{
  "type": "about:blank",
  "status": 404,
  "title": "Not Found",
  "detail": "The requested resource does not exist on this server."
}
```

<h3 id="obtain-queued-message-details-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|Inline|

<h3 id="obtain-queued-message-details-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» id|number|false|none|none|
|»» return_path|string|false|none|none|
|»» domains|[object]|false|none|none|
|»»» name|string|false|none|none|
|»»» status|string|false|none|none|
|»»» recipients|[object]|false|none|none|
|»»»» address|string|false|none|none|
|»»»» status|string|false|none|none|
|»»» retry_num|number|false|none|none|
|»»» next_retry|string|false|none|none|
|»»» next_notify|string|false|none|none|
|»»» expires|string|false|none|none|
|»» created|string|false|none|none|
|»» size|number|false|none|none|
|»» blob_hash|string|false|none|none|

Status Code **404**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» type|string|false|none|none|
|» status|number|false|none|none|
|» title|string|false|none|none|
|» detail|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Reschedule Delivery of Queued Message

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.patch('https://mail.example.org/api/queue/messages/{message_id}', headers = headers)

print(r.json())

```

`PATCH /queue/messages/{message_id}`

<h3 id="reschedule-delivery-of-queued-message-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|message_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": true
}
```

<h3 id="reschedule-delivery-of-queued-message-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="reschedule-delivery-of-queued-message-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Cancel Delivery of Queued Message

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.delete('https://mail.example.org/api/queue/messages/{message_id}', headers = headers)

print(r.json())

```

`DELETE /queue/messages/{message_id}`

<h3 id="cancel-delivery-of-queued-message-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|message_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": true
}
```

<h3 id="cancel-delivery-of-queued-message-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="cancel-delivery-of-queued-message-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Fetch Blob by ID

> Code samples

```python
import requests

r = requests.get('https://mail.example.org/api/store/blobs/{blob_id}')

print(r.json())

```

`GET /store/blobs/{blob_id}`

<h3 id="fetch-blob-by-id-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|blob_id|path|string|true|none|
|limit|query|number|false|none|

> Example responses

<h3 id="fetch-blob-by-id-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<h3 id="fetch-blob-by-id-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## Obtain Trace Details

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/telemetry/trace/{trace_id}', headers = headers)

print(r.json())

```

`GET /telemetry/trace/{trace_id}`

<h3 id="obtain-trace-details-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|trace_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "text": "SMTP connection started",
      "details": "A new SMTP connection was started",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.connection-start",
      "data": {
        "listenerId": "smtp",
        "localPort": 25,
        "remoteIp": "::1",
        "remotePort": 57513
      }
    },
    {
      "text": "SMTP EHLO command",
      "details": "The remote server sent an EHLO command",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.ehlo",
      "data": {
        "domain": "test.eml"
      }
    },
    {
      "text": "SPF EHLO check failed",
      "details": "EHLO identity failed SPF check",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.spf-ehlo-fail",
      "data": {
        "domain": "test.eml",
        "result": {
          "type": "spf.none",
          "text": "No SPF record",
          "details": "No SPF record was found",
          "data": {}
        },
        "elapsed": 24
      }
    },
    {
      "text": "IPREV check passed",
      "details": "Reverse IP check passed",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.iprev-pass",
      "data": {
        "domain": "test.eml",
        "result": {
          "type": "iprev.pass",
          "text": "IPREV check passed",
          "details": "The IPREV check has passed",
          "data": {
            "details": [
              "localhost."
            ]
          }
        },
        "elapsed": 0
      }
    },
    {
      "text": "SPF From check failed",
      "details": "MAIL FROM identity failed SPF check",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.spf-from-fail",
      "data": {
        "domain": "test.eml",
        "from": "pepe@pepe.com",
        "result": {
          "type": "spf.none",
          "text": "No SPF record",
          "details": "No SPF record was found",
          "data": {}
        },
        "elapsed": 18
      }
    },
    {
      "text": "SMTP MAIL FROM command",
      "details": "The remote client sent a MAIL FROM command",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.mail-from",
      "data": {
        "from": "pepe@pepe.com"
      }
    },
    {
      "text": "SMTP RCPT TO command",
      "details": "The remote client sent an RCPT TO command",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.rcpt-to",
      "data": {
        "to": "john@example.org"
      }
    },
    {
      "text": "DKIM verification failed",
      "details": "Failed to verify DKIM signature",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.dkim-fail",
      "data": {
        "strict": false,
        "result": [],
        "elapsed": 0
      }
    },
    {
      "text": "ARC verification passed",
      "details": "Successful ARC verification",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.arc-pass",
      "data": {
        "strict": false,
        "result": {
          "type": "dkim.none",
          "text": "No DKIM signature",
          "details": "No DKIM signature was found",
          "data": {}
        },
        "elapsed": 0
      }
    },
    {
      "text": "DMARC check failed",
      "details": "Failed to verify DMARC policy",
      "createdAt": "2025-01-05T14:34:50Z",
      "type": "smtp.dmarc-fail",
      "data": {
        "strict": false,
        "domain": "example.org",
        "policy": "reject",
        "result": {
          "type": "dmarc.none",
          "text": "No DMARC record",
          "details": "No DMARC record was found",
          "data": {}
        },
        "elapsed": 0
      }
    }
  ]
}
```

<h3 id="obtain-trace-details-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-trace-details-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[object]|false|none|none|
|»» text|string|false|none|none|
|»» details|string|false|none|none|
|»» createdAt|string|false|none|none|
|»» type|string|false|none|none|
|»» data|object|false|none|none|
|»»» listenerId|string|false|none|none|
|»»» localPort|number|false|none|none|
|»»» remoteIp|string|false|none|none|
|»»» remotePort|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Request a Tracing Token

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/telemetry/live/tracing-token', headers = headers)

print(r.json())

```

`GET /telemetry/live/tracing-token`

> Example responses

> 200 Response

```json
{
  "data": "VLxkixOwgDF8Frj0wi8kPhx3SpzKqtsDvbo25wgKw2tBIz/O8La0dwioQw9pN11c/////w8Ctau1+ALxq7X4AndlYg=="
}
```

<h3 id="request-a-tracing-token-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="request-a-tracing-token-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Start Live Tracing

> Code samples

```python
import requests

r = requests.get('https://mail.example.org/api/telemetry/traces/live')

print(r.json())

```

`GET /telemetry/traces/live`

<h3 id="start-live-tracing-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|filter|query|string|false|none|
|token|query|string|false|none|

> Example responses

<h3 id="start-live-tracing-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|None|

<h3 id="start-live-tracing-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## Obtain DNS Records for Domain

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/dns/records/{domain}', headers = headers)

print(r.json())

```

`GET /dns/records/{domain}`

<h3 id="obtain-dns-records-for-domain-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|domain|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "type": "MX",
      "name": "example.org.",
      "content": "10 mx.fr.email."
    },
    {
      "type": "CNAME",
      "name": "mail.example.org.",
      "content": "mx.fr.email."
    },
    {
      "type": "TXT",
      "name": "202501e._domainkey.example.org.",
      "content": "v=DKIM1; k=ed25519; h=sha256; p=82LqzMGRHEBI2HGDogjojWGz+Crrv0TAi8pcaOBd1vw="
    },
    {
      "type": "TXT",
      "name": "202501r._domainkey.example.org.",
      "content": "v=DKIM1; k=rsa; h=sha256; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1qtCbIlrZffIqm7gHqpihPUlxOq1zD6K3j1RO/enhkZRp5dEdCqcLbyFk5d+rqRsVIWwUZiU4HXHWqMTN1hlKojUlzmU1JYtlHRMwtM5vN4mzG4x1KA0i8ZHxkahE8ITsP+kPByDF9x0vAySHXpyErNXq3BeFyu/VW+6X+fmUW6x39PfWq7kQQTcwU0Ogo447oJfmAX9H4Z+/cD5WJVNiLgvLY6faVgoXm0mJJjRU5xoEStXoUcKwrwbl7G3K7JfxtmWsgEn97auV6v4he2LRRfTxbY9smkqUtcJs61E9iyyYroJv0iRda2pv71qg8e4wTb2sqBloZv/F2FZQhM+wIDAQAB"
    },
    {
      "type": "TXT",
      "name": "example.org.",
      "content": "v=spf1 mx ra=postmaster -all"
    },
    {
      "type": "SRV",
      "name": "_jmap._tcp.example.org.",
      "content": "0 1 443 mx.fr.email."
    },
    {
      "type": "SRV",
      "name": "_imaps._tcp.example.org.",
      "content": "0 1 993 mx.fr.email."
    },
    {
      "type": "SRV",
      "name": "_imap._tcp.example.org.",
      "content": "0 1 143 mx.fr.email."
    },
    {
      "type": "SRV",
      "name": "_imap._tcp.example.org.",
      "content": "0 1 1143 mx.fr.email."
    },
    {
      "type": "SRV",
      "name": "_pop3s._tcp.example.org.",
      "content": "0 1 995 mx.fr.email."
    }
  ]
}
```

<h3 id="obtain-dns-records-for-domain-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-dns-records-for-domain-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[object]|false|none|none|
|»» type|string|false|none|none|
|»» name|string|false|none|none|
|»» content|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Purge Account

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/account/{account_id}', headers = headers)

print(r.json())

```

`GET /store/purge/account/{account_id}`

<h3 id="purge-account-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="purge-account-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="purge-account-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Delete Bayes Model for Account

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/in-memory/default/bayes-account/{account_id}', headers = headers)

print(r.json())

```

`GET /store/purge/in-memory/default/bayes-account/{account_id}`

<h3 id="delete-bayes-model-for-account-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="delete-bayes-model-for-account-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="delete-bayes-model-for-account-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## List Deleted Messages

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/undelete/{account_id}', headers = headers)

print(r.json())

```

`GET /store/undelete/{account_id}`

<h3 id="list-deleted-messages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|
|limit|query|number|false|none|
|page|query|number|false|none|

> Example responses

> 200 Response

```json
{
  "data": {
    "items": [],
    "total": 0
  }
}
```

<h3 id="list-deleted-messages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="list-deleted-messages-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object|false|none|none|
|»» items|[any]|false|none|none|
|»» total|number|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Undelete Messages

> Code samples

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('https://mail.example.org/api/store/undelete/{account_id}', headers = headers)

print(r.json())

```

`POST /store/undelete/{account_id}`

> Body parameter

```json
[
  {
    "hash": "9pDYGrkDlLYuBNl062qhi0wStnDYyq4ZWalnj2vXbLY",
    "collection": "email",
    "restoreTime": "2025-01-05T14:50:13Z",
    "cancelDeletion": "2025-02-04T14:50:13Z"
  }
]
```

<h3 id="undelete-messages-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|
|body|body|array[object]|false|none|

> Example responses

> 200 Response

```json
{
  "data": [
    {
      "type": "success"
    }
  ]
}
```

<h3 id="undelete-messages-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="undelete-messages-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[object]|false|none|none|
|»» type|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Obtain Queue Status

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/queue/status', headers = headers)

print(r.json())

```

`GET /queue/status`

> Example responses

> 200 Response

```json
{
  "data": true
}
```

<h3 id="obtain-queue-status-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="obtain-queue-status-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|boolean|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Purge Blob Store

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/blob', headers = headers)

print(r.json())

```

`GET /store/purge/blob`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="purge-blob-store-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="purge-blob-store-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Purge Data Store

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/data', headers = headers)

print(r.json())

```

`GET /store/purge/data`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="purge-data-store-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="purge-data-store-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Purge In-Memory Store

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/in-memory', headers = headers)

print(r.json())

```

`GET /store/purge/in-memory`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="purge-in-memory-store-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="purge-in-memory-store-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Purge All Accounts

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('https://mail.example.org/api/store/purge/account', headers = headers)

print(r.json())

```

`GET /store/purge/account`

> Example responses

> 200 Response

```json
{
  "data": null
}
```

<h3 id="purge-all-accounts-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="purge-all-accounts-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|object¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## Reset IMAP UIDs for Account

> Code samples

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.delete('https://mail.example.org/api/store/uids/{account_id}', headers = headers)

print(r.json())

```

`DELETE /store/uids/{account_id}`

<h3 id="reset-imap-uids-for-account-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|account_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "data": [
    0,
    0
  ]
}
```

<h3 id="reset-imap-uids-for-account-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

<h3 id="reset-imap-uids-for-account-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» data|[number]|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>


