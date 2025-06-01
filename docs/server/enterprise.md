---
sidebar_position: 13
---

# Enterprise License

Stalwart is a robust, open-source mail server designed to deliver high-performance email services across a wide range of applications. While the core functionalities are available for free as open-source software, Stalwart also provides a suite of [Enterprise features](https://stalw.art/enterprise/) tailored specifically for large-scale, complex environments that require enhanced control, security, and manageability. These features are aimed at enterprise-level customers who need specialized tools such as multi-tenancy, dashboards, AI integrations, and other advanced capabilities. To access these premium features, an [Enterprise subscription](https://license.stalw.art/buy) is required, which unlocks additional functionalities and support.

Among the Enterprise-exclusive capabilities are [multi-tenancy](/docs/auth/authorization/tenants), which allows administrators to manage multiple organizations or domains within a single server instance, and intuitive dashboards, which provide administrators with visual insights and control over system activity. Additionally, Stalwart offers [AI-powered models](/docs/server/ai-models) that enhance email processing, for example, by improving filtering accuracy or categorization. For a full comparison between the open-source and Enterprise versions of Stalwart, please refer to [the comparison page on the Stalwart website](https://stalw.art/compare/).

## How Licenses Work

Enterprise licenses for Stalwart are issued to a specific **domain name** and come with a defined limit on the number of active mailboxes allowed under that license. This licensing model provides flexibility for enterprises, as a single license can be utilized across multiple servers, provided they share the same registered domain name. 

For example, if an Enterprise license is issued for `*.example.org`, it can be used seamlessly across multiple servers configured under this domain, such as `mx1.example.org`, `mx2.example.org`, up to any number of `X.example.org` servers. This setup allows for robust, distributed deployment without requiring additional licenses for each server, as long as they fall under the specified domain.

Although licenses are issued to a specific domain, it is still possible to host an **unlimited number of client domains** within the same environment. This means that even if your Enterprise license is registered for `*.example.org`, you can still provide email services for any number of other domains on the same server, such as `foobar.org`, `test.org`, or any other client domain.

The domain-specific restriction applies solely to the licensed servers’ domain names (e.g., the server hostnames). It does not limit the server's ability to manage and support a variety of client or user domains. This approach provides organizations with the freedom to scale their hosting capabilities, supporting multiple domains while maintaining compliance with the Enterprise license's terms for server deployment.

## Obtaining a License

To activate and use the Enterprise-grade features in Stalwart, an **Enterprise license** is required. This license acts as the gateway to premium functionality, transforming Stalwart into a comprehensive solution for high-demand, multi-user environments that prioritize scalability, security, and compliance.

Enterprise licenses are provided as a unique, cryptographically signed string of characters. Each license string contains an asymmetrically signed code, which allows Stalwart to validate the license’s authenticity offline. This offline verification process ensures that no external connection is required for license validation, making the setup more secure and suitable for isolated environments or deployments where internet access is limited or controlled.

### Configuration

After obtaining an Enterprise license for Stalwart, it is essential to configure it within the server settings to unlock premium features. Adding the license is a straightforward process that requires updating the `enterprise.license-key` setting in the Stalwart configuration file.

For example:

```toml
[enterprise]
license-key = "<LICENSE_KEY>"
```

### Reload and re-login

After you have added the license key, you need to [reload the configuration](https://stalw.art/docs/management/cli/config/#configuration-1).

You must then logout and re-login to be able to use the enterprise features.

## Automatic renewals

Since Enterprise licenses are time-bound, they have a predefined expiration date. Once expired, the Enterprise features will no longer be accessible until the license is renewed. To streamline this renewal process and avoid service interruptions, Stalwart Labs offers an **automatic renewal API**. This API is used to automatically renew the license a few days before it expires, ensuring uninterrupted access to Enterprise functionalities.

The automatic renewal feature is highly recommended, as it eliminates the need for manual intervention by system administrators and reduces the risk of downtime due to an expired license. By enabling the auto-renewal API, you ensure that the license renewal happens seamlessly in the background, providing continuous access to premium features without affecting day-to-day operations.

Once configured with a valid API key, Stalwart will automatically attempt to renew the license up to five days before it expires. This early renewal window provides ample time to secure a new license, even in environments with limited connectivity or occasional network issues.

If any issues occur during the initial renewal attempt, Stalwart will continue trying to renew the license every 24 hours until successful. On the last day of the license period, the server increases the frequency of renewal attempts to every hour, minimizing the risk of service interruption by ensuring multiple opportunities to obtain a fresh license before the current one expires.

### Configuration

To enable automatic renewals, you will first need to obtain an API key. This key authorizes Stalwart to connect with the licensing server at [license.stalw.art](https://license.stalw.art) and request a new license when the current one approaches its expiration date. You can obtain this API key by logging in at the [Stalwart Labs Licensing Portal](https://license.stalw.art) and opening the subscription details for your Enterprise license.

Once you have the API key, you can configure automatic renewals by adding it to the `enterprise.api-key` setting in the Stalwart configuration file.

For example:

```toml
[enterprise]
api-key = "<API_KEY>"
```


