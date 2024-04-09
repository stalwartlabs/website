---
sidebar_position: 5
---

# Proxy protocol

The HAProxy protocol, often referred to as the Proxy Protocol, is a network protocol designed to solve a common challenge faced when running servers behind load balancers or reverse proxies. In a typical setup without this protocol, the server sees only the IP address of the proxy, not the original client. This limitation can be problematic, especially for services that need to know the client's actual IP address for security, logging, or communication purposes. The Proxy Protocol was introduced as a solution to this issue. It allows the proxy to forward the client's original IP address and other relevant details to the server. This way, the server has access to the necessary client information, despite being behind a proxy.

When operating Stalwart Mail Server behind a proxy such as HAProxy, Caddy, NGinx, or Traefik, enabling the Proxy Protocol is highly recommended for a multitude of reasons. Primarily, this protocol is crucial for the server to accurately obtain the original IP addresses of the clients connecting to it. In the absence of the Proxy Protocol, Stalwart Mail Server only recognizes the IP address of the proxy, which can impede its ability to effectively manage client connections and compromise important security measures like IP-based access controls and accurate logging. Furthermore, the Proxy Protocol plays a vital role in informing the server whether a client is connecting via TLS (Transport Layer Security). This information is essential for Stalwart Mail Server to understand and handle the security level of each connection appropriately. Without this insight, the server might not correctly secure client communications, potentially leading to vulnerabilities. Therefore, implementing the Proxy Protocol is not only a matter of enhancing functionality but is also critical for maintaining stringent security standards and ensuring the mail server operates effectively behind a proxy.

## Configuration

Stalwart Mail Server offers support for both versions 1 and 2 of the HAProxy protocol, including the TLV (Type-Length-Value) extensions introduced in version 2. Enabling the Proxy Protocol involves specifying the trusted IP addresses or network masks from which the proxy connections originate. This is done in the `server.proxy.trusted-networks` section of the configuration file, for example:

```toml
[server.proxy]
trusted-networks = ["127.0.0.0/8", "::1", "10.0.0.0/8"]
```

It is also possible to define trusted networks on a per-listener basis by setting the `server.listener.<id>.proxy.trusted-networks` parameter in the listener's configuration, for example:

```toml
[server.listener."smtp".proxy]
trusted-networks = ["127.0.0.0/8", "::1", "10.0.0.0/8"]
```

By defining these trusted networks, Stalwart Mail Server can accurately identify and accept incoming connections that are relayed through a proxy.

:::tip Note

- When enabling the Proxy Protocol, ensure that both the proxy and Stalwart Mail Server are correctly configured to use it. Misconfiguration can lead to connection issues.
- Not all proxies support the Proxy Protocol. Verify that your chosen proxy solution is compatible before proceeding with the setup.
- The implementation of the Proxy Protocol may vary slightly depending on the proxy used. Consult the documentation of your specific proxy for detailed setup instructions.

:::
