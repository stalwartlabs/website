---
sidebar_position: 8
---

# Webhooks 

Webhooks are a powerful and flexible way to receive real-time notifications about various events in your system. By configuring webhooks, you can set up HTTP callbacks that are triggered when specific events occur, allowing your applications to respond immediately and automatically to important occurrences.

Stalwart Mail Server offers built-in support for webhooks, enabling real-time notifications for a variety of events. This capability allows administrators to set up HTTP callbacks that are triggered by specific occurrences, facilitating immediate and automated responses to critical events within the email system. For example, you can configure webhooks to notify you when an email message is received or delivered. This ensures that you are promptly informed about the flow of emails through your server. Similarly, notifications can be set up for user authentication events, alerting you whenever a user successfully logs in or fails to authenticate, which is crucial for security monitoring.

Overall, by leveraging the webhook functionality in Stalwart Mail Server, you can significantly enhance the automation and responsiveness of your email infrastructure, making it easier to manage and monitor various aspects of email activity and security.

## Configuration

Webhooks are configured in the `webhook.<id>` section of the configuration file, where `<id>` is a unique identifier for the webhook. The following parameters can be configured for webhooks:

- `url`: This parameter specifies the endpoint to which the webhook POST requests will be sent. The URL should be a valid HTTP or HTTPS address where your webhook handler is located.
- `events`: This parameter is a list of events that will trigger the webhook.
- `timeout`: This parameter defines the maximum time the server will wait for a response from the webhook endpoint. The value is specified in seconds (e.g., "30s").
- `throttle`: This parameter determines the frequency with which requests are sent to the webhook endpoint. Events occurring within this period are grouped and sent in batches. The value is specified in seconds (e.g., "1s").
- `signature-key`: This optional parameter provides an HMAC key used to sign the body of the webhook request. The signature is encoded in base64 and included in the `X-Signature` header. This allows for verification of the request's authenticity at the receiving endpoint.
- `headers`: This parameter specifies additional headers to be included in the webhook requests. Each header should be defined in the format `"Header-Name: header-value"`.
- `allow-invalid-certs`: This boolean parameter indicates whether to allow requests to endpoints with invalid SSL certificates. Setting this to `false` ensures that only valid SSL certificates are accepted, enhancing security.
- `auth.username`: This parameter specifies the username for HTTP basic authentication. It is used in conjunction with the `secret` parameter to authenticate the webhook request at the receiving endpoint.
- `auth.secret`: This parameter specifies the password or secret for HTTP basic authentication. It works with the `username` parameter to authenticate the webhook request.

The following event types are supported for webhooks:

- `auth.success`: Authentication success.
- `auth.failure`: Authentication failure.
- `auth.banned`: IP address banned after multiple authentication failures (fail2ban).
- `auth.error`: Authentication error (due to database failure, etc).
- `message.accepted`: Message accepted for delivery.
- `message.rejected`: Message rejected.
- `message.appended`: Message appended to a mailbox.
- `account.over-quota`: Account over quota.
- `dsn`: Delivery Status Notification (DSN).
- `double-bounce`: Double bounce message.
- `report.incoming.dmarc`: Incoming DMARC report.
- `report.incoming.tls`: Incoming TLS report.
- `report.incoming.arf`: Incoming ARF report.
- `report.outgoing`: Outgoing DMARC or TLS report.

## API Documentation

Please refer to the [Webhooks API](/docs/api/webhooks/overview) documentation for detailed information on the webhook API, including request and response formats, event types, and examples.

## Example

```toml
[webhook."my-webhook"]
url = "https://example.com/webhook"
events = [ "auth.success", "auth.failure", "auth.banned" , "auth.error"
           "message.accepted", "message.rejected", "message.appended"
           "account.over-quota", "dsn", "double-bounce"
           "report.incoming.dmarc", "report.incoming.tls", "report.incoming.arf"
           "report.outgoing" ]
timeout = "30s"
throttle = "1s"
signature-key = "my-secret-key"
headers = [ "X-My-Header: my-value" ]
allow-invalid-certs = false

[webhook."my-webhook".auth]
username = "account"
secret = "password"
```