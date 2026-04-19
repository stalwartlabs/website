---
sidebar_position: 1
---

# Overview

Stalwart includes an HTTP service that is enabled by default. It supports JMAP access, WebDAV access, API management, ACME certificate issuance, autoconfig/autodiscover protocols, well-known resources, metrics collection, and OAuth authentication.

Multiple HTTP services can be defined, each with custom [access control rules](/docs/http/access-control) expressed on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><!-- /breadcrumb:Http -->). Rules can filter requests by IP address, resource, method name, or listener identity.

## HTTP Endpoints

The following endpoints are available through the HTTP service:

- `/jmap`: The JMAP endpoint provides access to the [JMAP API](/docs/http/jmap/overview), allowing clients to interact with mailboxes, messages, and other resources.
- `/dav/*`: The WebDAV endpoint provides access to [WebDAV](/docs/http/webdav/overview) resources, allowing clients to manage calendar, contact and file resources.
- `/calendar/rsvp`: The Calendar Scheduling [RSVP endpoint](/docs/collaboration/scheduling#http-rsvp) allows participants to respond to calendar invitations using a simple web interface.
- `/.well-known/*`: The [well-known endpoint](#well-known-resources) provides access to resources that are commonly used by clients to discover service information.
- `/api/*`: The API management endpoint provides access to the [REST management API](/docs/api/management/overview).
- `/auth/device`: The device authorization endpoint is used for [OAuth device authorization](/docs/auth/oauth/overview).
- `/auth/token`: The token endpoint is used for [OAuth token exchange](/docs/auth/oauth/overview).
- `/auth/introspect`: The token introspection endpoint is used for [OAuth token introspection](/docs/auth/oauth/endpoints#authintrospect).
- `/auth/userinfo`: The user information endpoint is used for [OpenID user information](/docs/auth/openid/endpoints#authuserinfo).
- `/auth/jwks.json`: The JSON Web Key Set (JWKS) endpoint provides public keys for [JWT verification](/docs/auth/openid/endpoints#authjwksjson).
- `/mail/config-v1.1.xml`: The [autodiscover](/docs/server/autoconfig) endpoint provides email client configuration information.
- `/autodiscover/autodiscover.xml`: The [autodiscover](/docs/server/autoconfig) endpoint provides email client configuration information.
- `/metrics/prometheus`: The [Prometheus](/docs/telemetry/metrics/prometheus) metrics endpoint provides metrics for monitoring the server's performance.
- `/form`: The form endpoint is used for [Form submissions](/docs/http/form-submission).
- `/healthz/ready`: The health check endpoint indicates whether the server is ready to accept requests.
- `/healthz/live`: The health check endpoint indicates whether the server is live and operational.
- `/robots.txt`: The robots.txt file provides instructions to web crawlers and other user agents about the server's content.
- `/*`: The default endpoint serves static files from the [WebUI bundle](/docs/management/webui/overview).

## Well-known Resources

The following well-known resources are available through the HTTP service:

- `/.well-known/jmap`: The JMAP well-known resource provides information about the [JMAP](/docs/http/jmap/overview) endpoint. 
- `/.well-known/caldav`: The CalDAV well-known resource provides information about the [CalDAV](/docs/collaboration/calendar) endpoint.
- `/.well-known/carddav`: The CardDAV well-known resource provides information about the [CardDAV](/docs/collaboration/contact) endpoint.
- `/.well-known/oauth-authorization-server`: The OAuth authorization server well-known resource provides information about the [OAuth](/docs/auth/oauth/overview) authorization server.
- `/.well-known/openid-configuration`: The OIDC discovery well-known resource provides information about the [OIDC](/docs/auth/openid/overview) discovery endpoint.
- `/.well-known/acme-challenge`: The ACME challenge well-known resource provides the HTTP-01 challenge for [ACME certificate issuance](/docs/server/tls/acme/challenges#http-01).
- `/.well-known/mta-sts.txt`: The MTA-STS well-known resource provides information about the [MTA-STS](/docs/mta/transport-security/mta-sts) policy.
- `/.well-known/mail-v1.xml`: The mail configuration well-known resource provides information about the [configuration endpoint](/docs/server/autoconfig).
- `/.well-known/autoconfig/mail/config-v1.1.xml`: The autoconfig mail configuration well-known resource provides information about the [autconfig](/docs/server/autoconfig) mail configuration endpoint.
