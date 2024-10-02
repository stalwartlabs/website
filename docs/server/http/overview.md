---
sidebar_position: 1
---

# Overview

Stalwart Mail Server includes an HTTP service that is enabled by default, serving multiple critical functions. The HTTP service supports several key features, such as JMAP access, API management, ACME certificate issuance, autoconfig/autodiscover protocols, well-known resources, metrics collection, and OAuth authentication. These functionalities enhance user convenience, improve performance, and provide robust monitoring and security capabilities.

Additionally, Stalwart Mail Server allows the definition of multiple HTTP services with customizable [access control rules](/docs/server/http/access-control). Administrators can set these rules based on IP address, resource, method name, and more, ensuring secure and tailored access to the server's HTTP services. This flexibility ensures that the server can be effectively managed and integrated with other systems, meeting diverse operational needs.

## HTTP Endpoints

The following endpoints are available through the HTTP service:

- `/jmap`: The JMAP endpoint provides access to the [JMAP API](/docs/jmap/overview), allowing clients to interact with mailboxes, messages, and other resources.
- `/.well-known/*`: The [well-known endpoint](#well-known-resources) provides access to resources that are commonly used by clients to discover service information.
- `/api/*`: The API management endpoint provides access to the [REST management API](/docs/api/management/overview).
- `/auth/device`: The device authorization endpoint is used for [OAuth device authorization](/docs/directory/authentication/oauth).
- `/auth/token`: The token endpoint is used for [OAuth token exchange](/docs/directory/authentication/oauth).
- `/auth/introspect`: The token introspection endpoint is used for [OAuth token introspection](/docs/directory/oauth/endpoints#authintrospect).
- `/auth/userinfo`: The user information endpoint is used for [OpenID user information](/docs/directory/openid/endpoints#authuserinfo).
- `/auth/jwks.json`: The JSON Web Key Set (JWKS) endpoint provides public keys for [JWT verification](/docs/directory/openid/endpoints#authjwksjson).
- `/mail/config-v1.1.xml`: The [autodiscover](/docs/server/autoconfig) endpoint provides email client configuration information.
- `/autodiscover/autodiscover.xml`: The [autodiscover](/docs/server/autoconfig) endpoint provides email client configuration information.
- `/metrics/prometheus`: The [Prometheus](/docs/telemetry/metrics/prometheus) metrics endpoint provides metrics for monitoring the server's performance.
- `/healthz/ready`: The health check endpoint indicates whether the server is ready to accept requests.
- `/healthz/live`: The health check endpoint indicates whether the server is live and operational.
- `/robots.txt`: The robots.txt file provides instructions to web crawlers and other user agents about the server's content.
- `/*`: The default endpoint serves static files from the [webadmin bundle](/docs/management/webadmin/overview).

## Well-known Resources

The following well-known resources are available through the HTTP service:

- `/.well-known/jmap`: The JMAP well-known resource provides information about the [JMAP](/docs/jmap/overview) endpoint. 
- `/.well-known/oauth-authorization-server`: The OAuth authorization server well-known resource provides information about the [OAuth](/docs/directory/authentication/oauth) authorization server.
- `/.well-known/openid-configuration`: The OIDC discovery well-known resource provides information about the [OIDC](/docs/directory/openid/overview) discovery endpoint.
- `/.well-known/acme-challenge`: The ACME challenge well-known resource provides the HTTP-01 challenge for [ACME certificate issuance](/docs/server/tls/acme/challenges#http-01).
- `/.well-known/mta-sts.txt`: The MTA-STS well-known resource provides information about the [MTA-STS](/docs/smtp/transport-security/mta-sts) policy.
- `/.well-known/mail-v1.xml`: The mail configuration well-known resource provides information about the [configuration endpoint](/docs/server/autoconfig).
- `/.well-known/autoconfig/mail/config-v1.1.xml`: The autoconfig mail configuration well-known resource provides information about the [autconfig](/docs/server/autoconfig) mail configuration endpoint.
