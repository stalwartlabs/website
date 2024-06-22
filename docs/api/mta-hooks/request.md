---
sidebar_position: 2
---

# Request

The request object is a JSON structure that provides all necessary information at each stage of the SMTP transaction. Below is the detailed description of each field in the request object.

## Context

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

## Envelope

The `envelope` field contains information about the email envelope, including the sender and recipients.

- **from**: Information about the sender.
  - **address**: The email address of the sender.
  - **parameters**: Additional parameters associated with the sender.
- **to**: A list of recipients.
  - **address**: The email address of the recipient.
  - **parameters**: Additional parameters associated with the recipient.

## Message

The `message` field contains the headers and contents of the email message.

- **headers**: A list of email headers. Each header is represented as a list with two elements: the header name and the header value.
- **serverHeaders**: A list of headers added by the server. Each header is represented as a list with two elements: the header name and the header value.
- **contents**: The body of the email message.
- **size**: The size of the email message in bytes.

## Example

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
            "name": "Stalwart Mail Server",
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
                "from mail.example.com (mail.example.com [192.168.1.1]) by mail.foobar.com (Stalwart Mail Server) with ESMTPS id 1234567890"
            ]
        ],
        "contents": "Hello, World!\r\n",
        "size": 12345
    }
}
```