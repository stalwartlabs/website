---
sidebar_position: 2
---

# System Requirements

Stalwart is a high-performance mail and collaboration server designed to scale efficiently from small personal deployments to large enterprise environments. Its resource requirements (particularly in terms of memory and CPU) are highly dependent on usage patterns, including the number of concurrent connections and the intensity of client activity. This document provides guidance on estimating and managing memory and CPU requirements to ensure optimal performance across different deployment scenarios.

## Memory Usage

Stalwart is designed to be efficient and lightweight in terms of memory usage. When idle, it maintains a low memory footprint of approximately **100MB**, making it suitable for lightweight environments and resource-constrained systems. However, actual memory consumption will vary depending on the total number of concurrent connections and overall server activity.

For a small deployment serving around 5 to 10 users with typical usage patterns, a system with 1GB of RAM is generally sufficient to run Stalwart comfortably. In contrast, high-traffic servers that handle thousands of concurrent connections (such as those operating in enterprise environments) will require significantly more memory to maintain performance and responsiveness.

Administrators can manage and limit Stalwart's memory usage through a couple of configurable parameters. One primary control mechanism is the limit on the number of concurrent connections the server accepts. By default, Stalwart supports up to 8192 concurrent connections shared across all its services, including IMAP, JMAP, WebDAV, SMTP, and POP3. Reducing this number can help lower the memory requirements, particularly in resource-limited environments.

Another key factor influencing memory usage is caching. Stalwart utilizes several caches to optimize performance, and each of these caches can be fine-tuned or limited in size. Adjusting the size of these caches offers another way to control how much memory the server consumes, depending on the desired balance between performance and resource usage.

## CPU Requirements

Stalwart's CPU usage scales with the number of users, volume of mail traffic, and the intensity of concurrent operations across its supported protocols. For low-traffic setups (typically involving around five users), only a single CPU core is generally sufficient to handle routine operations without performance degradation.

To estimate CPU requirements for larger or more dynamic environments, consider the following approach: start by assessing the number of concurrent connections expected during peak hours, then evaluate the types of operations users will perform most frequently (such as complex searches via IMAP, synchronization via JMAP, or heavy mail delivery via SMTP). Each of these activities consumes CPU resources differently, and the combined workload should inform the number of cores allocated. In general, as concurrency and activity increase, more CPU cores will be necessary to maintain low latency and high throughput.

Monitoring real-world server performance after deployment is also advisable, as it allows for fine-tuning and scaling of resources to meet actual demand, rather than estimated usage.

## Outbound network requirements

A few server functions reach out to the public internet over HTTPS at startup or on schedule. Deployments behind a restrictive egress firewall must allow these connections, otherwise the corresponding feature will be unavailable:

- **WebUI and other hosted [Applications](/docs/applications/overview)**: the server downloads the WebUI bundle from `https://github.com/stalwartlabs/webui/releases/latest/` (and any additional Application bundles from their respective [`resourceUrl`](/docs/ref/object/application#resourceurl)). When the first download fails, the `/admin` and `/account` paths return `404 Not Found` because no bundle has been unpacked locally yet. See the WebUI's [Outbound network requirement](/docs/management/webui/overview#outbound-network-requirement) section for the WebUI-specific symptom and fix, and the general [outbound network requirement](/docs/applications/overview#outbound-network-requirement) note for any additional hosted Applications.
- **ACME (Let's Encrypt)**: TLS certificate issuance contacts the configured ACME directory, by default `https://acme-v02.api.letsencrypt.org/directory`. Without it the server cannot obtain or renew certificates automatically.
- **Public DNS**: resolving MX records, SPF/DKIM/DMARC records, and similar lookups requires outbound DNS (UDP and TCP on port 53, or DNS-over-HTTPS where configured) to the resolver of the host's choice.

In environments where outbound HTTPS to GitHub is not permitted, the WebUI bundle can be staged on an internal HTTPS server and the [Application](/docs/ref/object/application) record updated to point at that internal `resourceUrl` instead.

