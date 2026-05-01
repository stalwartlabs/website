---
sidebar_position: 5
title: "MTA Hooks"
---

MTA Hooks provide an alternative to milter for managing and processing email transactions. Instead of a custom binary protocol, MTA Hooks use HTTP with JSON request and response bodies, making integration and debugging simpler.

Each stage of the SMTP transaction is handled by sending a POST request to a configured HTTP endpoint. MTA Hooks can be invoked at any point in the SMTP transaction, from the initial connection through to final message delivery, giving full control over the email processing workflow.

## Configuration

Each hook is defined as an [MtaHook](/docs/ref/object/mta-hook) object (found in the WebUI under <!-- breadcrumb:MtaHook --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Filters › MTA Hooks<!-- /breadcrumb:MtaHook -->). The relevant fields are:

- [`enable`](/docs/ref/object/mta-hook#enable): expression that determines whether this hook is active. Defaults to `true`, but can branch on session state.
- [`url`](/docs/ref/object/mta-hook#url): URL of the HTTP endpoint that handles hook callbacks.
- [`stages`](/docs/ref/object/mta-hook#stages): list of SMTP stages at which this hook is invoked. Possible values are `connect`, `ehlo`, `auth`, `mail`, `rcpt`, and `data`. Default `["data"]`.
- [`allowInvalidCerts`](/docs/ref/object/mta-hook#allowinvalidcerts): whether to connect to endpoints that present an invalid TLS certificate. Default `false`.
- [`httpHeaders`](/docs/ref/object/mta-hook#httpheaders): additional headers to include in the HTTP request.
- [`timeout`](/docs/ref/object/mta-hook#timeout): maximum time to wait for a response. Default 30 seconds.
- [`tempFailOnError`](/docs/ref/object/mta-hook#tempfailonerror): whether to respond with a temporary failure when the hook endpoint errors. Default `true`.
- [`maxResponseSize`](/docs/ref/object/mta-hook#maxresponsesize): maximum response size accepted from the hook endpoint, in bytes. Default 52428800 (50 MB).
- [`httpAuth`](/docs/ref/object/mta-hook#httpauth): HTTP authentication method. A multi-variant field: the `Unauthenticated` variant disables authentication, the `Basic` variant carries username and secret, and the `Bearer` variant carries a bearer token. The secret or token can be supplied directly, from an environment variable, or from a file.

A hook invoked at every SMTP stage, with Basic authentication and a custom request header:

```json
{
  "url": "https://localhost:8080/mta-hook",
  "stages": ["connect", "ehlo", "mail", "rcpt", "data"],
  "enable": {"else": "true"},
  "allowInvalidCerts": false,
  "httpHeaders": {"X-My-Header": "my-value"},
  "timeout": "30s",
  "tempFailOnError": true,
  "maxResponseSize": 52428800,
  "httpAuth": {
    "@type": "Basic",
    "username": "my-username",
    "secret": {"@type": "Value", "secret": "my-secret"}
  }
}
```

## API documentation

MTA Hooks is a replacement for the milter protocol for managing and processing email transactions within Mail Transfer Agents (MTAs). Unlike milter, which operates at a lower level and uses a custom protocol, MTA Hooks uses HTTP, which makes integration and deployment simpler.

MTA Hooks is built on HTTP, which makes integration and debugging simpler than with custom binary protocols. It uses JSON for both requests and responses. Each stage of the SMTP transaction is handled by sending a POST request to a specified HTTP endpoint. MTA Hooks can be invoked at any point in the SMTP transaction, from the initial connection phase to final message delivery, giving full control over the email processing workflow.

The typical workflow of MTA Hooks begins when the Mail Transfer Agent (MTA) reaches a particular stage in the SMTP transaction. At this point, the MTA sends a POST request containing a JSON payload to the MTA Hooks endpoint. This payload includes detailed information about the transaction, such as client and server details, message envelope, and message content. The endpoint processes this request and responds with a JSON object specifying the action to be taken by the MTA. This response can include directives such as accepting, rejecting, discarding, or quarantining the message, along with any necessary modifications to the message or transaction. Based on the response received, the MTA executes the specified actions, applying any modifications as instructed, thus completing the transaction stage.

### Request

The request object is a JSON structure that provides all necessary information at each stage of the SMTP transaction. Below is the detailed description of each field in the request object.

#### Context

The `context` field contains information about the current stage of the SMTP transaction, the client, server, and other relevant details.

- **stage**: The current stage of the SMTP transaction. Possible values include `CONNECT`, `EHLO`, `MAIL`, `RCPT`, `DATA`, etc.
- **sasl**: Information about the SASL authentication.
  - **login**: The username used for authentication.
  - **method**: The authentication method used.
- **client**: Information about the client making the SMTP request.
  - **ip**: The IP address of the client.
  - **port**: The port number used by the client.
  - **ptr**: The PTR record of the client.
  - **ehlo**: The EHLO/HELO string sent by the client.
  - **activeConnections**: The number of active connections from this client.
- **tls**: Information about the TLS connection.
  - **version**: The TLS version used.
  - **cipher**: The cipher suite used for the connection.
  - **cipherBits**: The number of bits in the cipher.
  - **certIssuer**: The issuer of the client's certificate.
  - **certSubject**: The subject of the client's certificate.
- **server**: Information about the server handling the SMTP request.
  - **name**: The name of the server.
  - **port**: The port number on which the server is listening.
  - **ip**: The IP address of the server.
- **queue**: Information about the email queue.
  - **id**: The unique identifier of the queue.
- **protocol**: Information about the protocol version.
  - **version**: The version of the protocol.

#### Envelope

The `envelope` field contains information about the email envelope, including the sender and recipients.

- **from**: Information about the sender.
  - **address**: The email address of the sender.
  - **parameters**: Additional parameters associated with the sender.
- **to**: A list of recipients.
  - **address**: The email address of the recipient.
  - **parameters**: Additional parameters associated with the recipient.

#### Message

The `message` field contains the headers and contents of the email message.

- **headers**: A list of email headers. Each header is represented as a list with two elements: the header name and the header value.
- **serverHeaders**: A list of headers added by the server. Each header is represented as a list with two elements: the header name and the header value.
- **contents**: The body of the email message.
- **size**: The size of the email message in bytes.

#### Example

Below is an example of a request object received by the MTA hooks API:

```json
{
    "context": {
        "stage": "DATA",
        "sasl": {
            "login": "user",
            "method": "plain"
        },
        "client": {
            "ip": "192.168.1.1",
            "port": 34567,
            "ptr": "mail.example.com",
            "ehlo": "mail.example.com",
            "activeConnections": 1
        },
        "tls": {
            "version": "1.3",
            "cipher": "TLS_AES_256_GCM_SHA384",
            "cipherBits": 256,
            "certIssuer": "Let's Encrypt",
            "certSubject": "mail.example.com"
        },
        "server": {
            "name": "Stalwart",
            "port": 25,
            "ip": "192.168.2.2"
        },
        "queue": {
            "id": "1234567890"
        },
        "protocol": {
            "version": "1.0"
        }
    },
    "envelope": {
        "from": {
            "address": "john@example.com",
            "parameters": {
                "size": 12345
            }
        },
        "to": [
            {
                "address": "bill@foobar.com",
                "parameters": {
                    "orcpt": "rfc822; b@foobar.com"
                }
            },
            {
                "address": "jane@foobar.com",
                "parameters": null
            }
        ]
    },
    "message": {
        "headers": [
            [
                "From",
                "John Doe <john@example.com>"
            ],
            [
                "To",
                "Bill <bill@foobar.com>, Jane <jane@foobar.com>"
            ],
            [
                "Subject",
                "Hello, World!"
            ]
        ],
        "serverHeaders": [
            [
                "Received",
                "from mail.example.com (mail.example.com [192.168.1.1]) by mail.foobar.com (Stalwart) with ESMTPS id 1234567890"
            ]
        ],
        "contents": "Hello, World!\r\n",
        "size": 12345
    }
}
```

### Response

The response object is a JSON structure that specifies the action to be taken by the SMTP server after processing the request. It may include instructions on how to modify the message or the SMTP transaction.

## Action

The `action` field specifies the action the SMTP server should take. Possible values are:
- **accept**: Accept the message for delivery.
- **discard**: Discard the message without further processing.
- **reject**: Reject the message and return an error to the client.
- **quarantine**: Quarantine the message for further inspection.

#### Response

The `response` object is optional and provides details on how the SMTP server should reply to the client.

- **status**: The SMTP status code to return (e.g., 250 for success).
- **enhancedStatus**: The enhanced status code to return (e.g., 2.0.0 for success).
- **message**: The message to return to the client.
- **disconnect**: A boolean indicating whether the client should be disconnected after the response.

#### Modifications

The `modifications` array contains a list of modifications that should be applied to the message or transaction. Each modification is an object with a specific type and relevant fields.

The following modification types are supported:

##### changeFrom

This modification changes the sender address of the email message. It contains the following fields:

- **value**: The new sender address.
- **parameters**: Additional parameters associated with the sender (optional).

##### addRcpt

This modification adds a new recipient to the email message. It contains the following fields:

- **value**: The email address of the new recipient.
- **parameters**: Additional parameters associated with the recipient (optional).

##### deleteRcpt

This modification deletes a recipient from the email message. It contains the following field:

- **value**: The email address of the recipient to be deleted.

#### replaceContents

This modification replaces the body of the email message. It contains the following field:

- **value**: The new body of the email message.

##### addHeader

This modification adds a new header to the email message. It contains the following fields:

- **name**: The name of the header to be added.
- **value**: The value of the header to be added.

##### insertHeader

This modification inserts a new header at a specific position in the list of headers. It contains the following fields:

- **index**: The position at which the header should be inserted.
- **name**: The name of the header to be inserted.
- **value**: The value of the header to be inserted.

##### changeHeader

This modification changes the value of a header in the email message. It contains the following fields:

- **index**: The position of the header to be changed.
- **name**: The name of the header to be changed.
- **value**: The new value of the header.

##### deleteHeader

- **index**: The position of the header to be deleted.
- **name**: The name of the header to be deleted.

#### Example

Below is an example of a response object:

```json
{
    "action": "accept",
    "response": {
        "status": 250,
        "enhancedStatus": "2.0.0",
        "message": "Message accepted",
        "disconnect": false
    },
    "modifications": [
        {
            "type": "changeFrom",
            "value": "new@example.com",
            "parameters": {
                "size": 54321
            }
        },
        {
            "type": "addRecipient",
            "value": "tom@example.com",
            "parameters": null
        },
        {
            "type": "deleteRecipient",
            "value": "jane@foobar.com"
        },
        {
            "type": "replaceContents",
            "value": "This is the new body\r\n"
        },
        {
            "type": "addHeader",
            "name": "X-Spam-Status",
            "value": "No"
        },
        {
            "type": "insertHeader",
            "index": 1,
            "name": "X-Filtered-By",
            "value": "Custom Filter v1.1"
        },
        {
            "type": "changeHeader",
            "index": 4,
            "name": "Subject",
            "value": "This is the new subject"
        },
        {
            "type": "deleteHeader",
            "index": 1,
            "name": "X-Mailer"
        }
    ]
}
```
