---
sidebar_position: 5
---

# MTA Hooks

MTA Hooks is a modern replacement for the milter protocol, designed to provide enhanced flexibility and ease of use for managing and processing email transactions within Mail Transfer Agents (MTAs). Unlike milter, which operates at a lower level and uses a custom protocol, MTA Hooks leverages the ubiquitous HTTP protocol, making it simpler to integrate and deploy.

MTA Hooks is built on the robust and widely used HTTP protocol, making integration and debugging significantly simpler compared to traditional methods. The protocol uses JSON for both requests and responses, offering a clear, human-readable format that enhances the ease of implementation. Each stage of the SMTP transaction is managed by sending a POST request to a specified HTTP endpoint, ensuring seamless communication and processing. MTA Hooks can be invoked at any point in the SMTP transaction, from the initial connection phase to the final message delivery, providing comprehensive coverage and control over the email processing workflow.

## Configuration

MTA Hooks are configured in the `session.hook.<id>` section of the configuration file, where `<id>` is a unique identifier for the hook. The following parameters can be configured for MTA hooks:

- `enable`: Determines whether this hook is turned on or off. This setting can be dynamically set using [expressions](/docs/configuration/expressions/overview) which allows a certain Milter to be enabled or disabled based on the specific circumstances of an SMTP transaction.
- `url`: This parameter specifies the endpoint to which the MTA hook POST requests will be sent. The URL should be a valid HTTP or HTTPS address where your hook handler is located.
- `stages`: This parameter is a list of stages at which the hook will be triggered. The supported stages are `connect`, `ehlo`, `mail`, `rcpt` and `data`.
- `allow-invalid-certs`: This boolean parameter indicates whether to allow requests to endpoints with invalid SSL certificates. Setting this to `false` ensures that only valid SSL certificates are accepted, enhancing security.
- `headers`: This parameter specifies additional headers to be included in the MTA hook requests. Each header should be defined in the format `"Header-Name: header-value"`.
- `options.tempfail-on-error`: This boolean parameter specifies whether to temporarily fail the transaction in case of an error. Setting this to `true` ensures that the transaction can be retried later instead of being permanently rejected.
- `options.max-response-size`: This parameter defines the maximum size of the response that the MTA hook can handle. The value is specified in bytes (e.g., `52428800` for 50 MB).
- `auth.username`: This parameter specifies the username for HTTP basic authentication. It is used in conjunction with the `secret` parameter to authenticate the hook request at the receiving endpoint.
- `auth.secret`: This parameter specifies the password or secret for HTTP basic authentication. It works with the `username` parameter to authenticate the hook request.

## API Documentation

Please refer to the [MTA Hooks API](/docs/api/mta-hooks/overview) documentation for detailed information on the MTA Hooks API, including request and response formats, as well as examples.

## Example

```toml
[session.hook."my-hook"]
enable = "true"
url = "https://localhost:8080/mta-hook"
stages = ["connect", "ehlo", "mail", "rcpt", "data"]
allow-invalid-certs = false
headers = ["X-My-Header: my-value"]

[session.hook."my-hook".options]
tempfail-on-error = true
max-response-size = 52428800

[session.hook."my-hook".auth]
username = "my-username"
secret = "my-secret"
```
