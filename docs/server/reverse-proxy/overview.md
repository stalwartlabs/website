---
sidebar_position: 1
---

# Overview

A reverse proxy is a type of proxy server that retrieves resources on behalf of a client from one or more servers. These resources are then returned to the client as if they originated from the proxy server itself. Reverse proxies are typically used to balance load among several servers, cache content to improve performance, and provide a single point of access with enhanced security and monitoring capabilities.

Stalwart is designed to operate efficiently behind a reverse proxy. By placing Stalwart behind a reverse proxy, you can take advantage of these benefits to ensure high availability, scalability, and security for your email infrastructure.

## Proxy Protocol

The [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol), developed by HAProxy, is a simple and efficient way to transport connection information from the client to the server across multiple layers of proxies. This protocol provides the server with important details about the original client connection, including the client's IP address and the status of the TLS connection.

While Stalwart does not require the Proxy Protocol to function behind a reverse proxy, enabling it is highly recommended. The Proxy Protocol ensures that Stalwart receives crucial information about the client connection, which is essential for several key functions.

Firstly, the client’s remote IP address is necessary to perform sender authentication checks such as SPF (Sender Policy Framework) and DMARC (Domain-based Message Authentication, Reporting & Conformance). These checks help verify that the email comes from an authorized source and is not a spoofed or fraudulent email.

Secondly, enforcing limits on the number of connections or the volume of emails from a single IP address can prevent abuse and protect the server from being overwhelmed by malicious traffic. Accurate knowledge of the client's IP address enables Stalwart to implement these protective measures effectively.

Lastly, knowing whether the connection was encrypted via TLS can help in policy enforcement and logging, ensuring that sensitive data is transmitted securely. This information allows Stalwart to maintain high security standards and enforce policies that may depend on the encryption status of the connection.

By leveraging the Proxy Protocol, you enhance the capability of Stalwart to accurately authenticate senders, enforce security policies, and maintain the integrity of your email communications. Configuring a reverse proxy with the Proxy Protocol for Stalwart not only optimizes performance and security but also ensures that the server has all necessary client connection details to function correctly and securely.

## Ports and base url

To have Stalwart working smoothly behind a proxy, you will need to adjust:

1. the listener port(s), ie. remove the https listener and change the http port to 8080
2. set up your proxy to listen to the ports (http 80, https 443...) and proxy to the new ports defined in Stalwart. Refer to each proxy for how to do it
3. change the Base URL to *'https://' + config_get('server.hostname')* to let Stalwart use the public url (for instance for the JMAP server)
