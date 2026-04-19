---
sidebar_position: 6
---

# Security

The HTTP server exposes two transport-security controls on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><!-- /breadcrumb:Http -->): HTTP Strict Transport Security (HSTS) and a permissive CORS policy. These controls enforce secure communication practices and determine how cross-origin requests are handled.

## Strict Transport Security

HTTP Strict Transport Security (HSTS) is a web security policy mechanism that instructs compliant user agents to interact with the server only over HTTPS, protecting against protocol-downgrade attacks and cookie hijacking. Enabling HSTS guarantees that every subsequent request is encrypted and reduces the risk of active eavesdropping or session hijacking.

HSTS is enabled by setting [`enableHsts`](/docs/ref/object/http#enablehsts) to `true`. The default is `false`.

## Permissive CORS Policy

Cross-Origin Resource Sharing (CORS) is a browser security feature that controls how a web page loaded from one origin can request resources from another origin. By default, browsers block these cross-origin requests; the server must opt in by returning the appropriate CORS headers.

A permissive CORS policy can be useful when the Stalwart server is managed through a WebUI hosted on a different domain. Setting [`usePermissiveCors`](/docs/ref/object/http#usepermissivecors) to `true` instructs the server to accept requests from any origin. The default is `false`.

This is the broadest possible CORS setting. When enabling it, ensure that every sensitive endpoint is protected by appropriate authentication and authorization checks, because browsers will no longer restrict cross-origin access to the server's resources.
