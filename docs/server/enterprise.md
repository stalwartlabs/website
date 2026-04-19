---
sidebar_position: 13
---

# Enterprise License

Stalwart is distributed as an open-source mail server. Alongside the open-source core, Stalwart Labs publishes a set of [Enterprise features](https://stalw.art/enterprise/) aimed at larger deployments that require additional control, security, and manageability. These features target environments that need tools such as multi-tenancy, dashboards, and AI integrations, and are unlocked by an [Enterprise subscription](https://license.stalw.art/buy).

Enterprise-exclusive capabilities include [multi-tenancy](/docs/auth/authorization/tenants), which allows multiple organizations or domains to be managed within a single server instance, administrative dashboards, and [AI-powered models](/docs/server/ai-models) for email processing. For a feature-by-feature comparison between the open-source and Enterprise editions, see the [comparison page](https://stalw.art/compare/).

## How licenses work

Enterprise licenses are issued to a specific **domain name** and carry a mailbox-count limit. A single license can be reused across multiple servers as long as they share the same registered domain. For example, a license issued for `*.example.org` covers `mx1.example.org`, `mx2.example.org`, and any other host under `example.org`, so a distributed deployment does not need separate licenses per node.

The domain constraint applies only to server hostnames. An unlimited number of **client domains** can be hosted on the same infrastructure regardless of the licensed domain: a server licensed for `*.example.org` can provide mail service for `foobar.org`, `test.org`, or any other tenant domain.

## Obtaining a license

Enterprise licenses are distributed as a cryptographically signed string. Stalwart validates each license offline using the embedded signature, so no outbound call to the licensing server is required at validation time. This makes the Enterprise edition suitable for isolated or tightly controlled environments where internet access is limited.

### Configuration

The license is stored on the [Enterprise](/docs/ref/object/enterprise) singleton (found in the WebUI under <!-- breadcrumb:Enterprise --><!-- /breadcrumb:Enterprise -->) through [`licenseKey`](/docs/ref/object/enterprise#licensekey). The field is a secret: it can hold the literal license string, or point at an environment variable or a file.

```json
{
  "licenseKey": {
    "@type": "Value",
    "secret": "<LICENSE_KEY>"
  }
}
```

### Reload and re-login

After the license key is saved, the server configuration must be reloaded from the [CLI](/docs/management/cli/overview). Logging out and back in is required before the Enterprise features become visible in the session.

## Automatic renewals

Enterprise licenses expire on a fixed date; once expired, Enterprise features stop working until a new license is installed. Stalwart Labs provides a renewal API that can fetch a fresh license automatically a few days before the current one expires.

Enabling automatic renewal removes the need for manual intervention and reduces the chance of a gap in Enterprise coverage. The renewal process runs in the background and has no impact on day-to-day operations.

When an API key is configured, the server begins renewal attempts up to five days before the expiration date. If the first attempt fails, the server retries every twenty-four hours. On the final day of the license, the retry interval shortens to one hour so that transient network issues are less likely to cause an outage.

### Configuration

An API key is required to authorise the server to request a new license from the [Stalwart Labs Licensing Portal](https://license.stalw.art). The key is generated from the subscription details page on the licensing portal.

The key is stored on the [Enterprise](/docs/ref/object/enterprise) singleton through [`apiKey`](/docs/ref/object/enterprise#apikey), which accepts a direct value, an environment variable, or a file reference:

```json
{
  "apiKey": {
    "@type": "Value",
    "secret": "<API_KEY>"
  }
}
```
