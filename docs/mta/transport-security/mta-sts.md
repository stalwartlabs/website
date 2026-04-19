---
sidebar_position: 3
---

# MTA-STS

MTA-STS, or Mail Transfer Agent Strict Transport Security, is a security mechanism for email systems to protect against eavesdropping and tampering of emails during transmission. It is designed to ensure that email is sent and received over secure connections, such as TLS.

MTA-STS works by publishing a policy statement in the form of a well-known DNS TXT record, specifying the email domains that support MTA-STS and the requirements for securing the email transmission. The receiving email server will retrieve the MTA-STS policy statement and verify that the incoming connection meets the security requirements specified in the policy. If the connection does not meet the requirements, the email will not be accepted and will be rejected. MTA-STS provides an additional layer of security for email transmission, making it harder for attackers to eavesdrop on or tamper with email messages. This can help prevent sensitive information from being intercepted or altered in transit, and provide a more secure email experience for users.

## Outbound configuration

Whether to use MTA-STS on outbound connections is configured per TLS strategy on the [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) object (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><!-- /breadcrumb:MtaTlsStrategy -->). The [`mtaSts`](/docs/ref/object/mta-tls-strategy#mtasts) field accepts one of:

- `optional`: use MTA-STS only if an STS policy for the domain has been published.
- `require`: require MTA-STS and refuse delivery unless a valid STS policy is available. Not recommended as a global default.
- `disable`: never use MTA-STS.

## Policy publishing

An MTA-STS policy lets domain owners declare that their mail servers support TLS and that messages should only be delivered over a secure connection. The policy reduces the risk of man-in-the-middle attacks and ensures transport-layer encryption is used consistently.

The MTA-STS policy is published at `/.well-known/mta-sts.txt` under the HTTPS origin of the domain hosting the SMTP service. The policy file includes:

- **version**: the version of the MTA-STS standard. Currently `STSv1`.
- **mode**: the operational mode of the policy (`none`, `testing`, or `enforce`). `enforce` mode requires sending servers to connect only over secure connections, while `testing` mode lets domain owners monitor policy failures without affecting mail delivery.
- **mx**: the list of mail servers permitted to receive mail for the domain.
- **max_age**: the length of time, in seconds, the sender should cache and apply the policy.

Stalwart can automate the publication of MTA-STS policy files for all hosted domains, keeping every policy up to date without manual intervention. Policy publishing is configured on the [MtaSts](/docs/ref/object/mta-sts) singleton (found in the WebUI under <!-- breadcrumb:MtaSts --><!-- /breadcrumb:MtaSts -->):

- [`mode`](/docs/ref/object/mta-sts#mode): operational mode of the policy. Accepted values are `enforce`, `testing`, and `disable`. Default `testing`.
- [`maxAge`](/docs/ref/object/mta-sts#maxage): how long clients should cache the policy. Default 7 days.
- [`mxHosts`](/docs/ref/object/mta-sts#mxhosts): optional override for the list of mail servers permitted to receive mail for the domain. If left empty, the hostnames included in all TLS certificates for the domain are used.

Example:

```json
{
  "mode": "testing",
  "maxAge": "7d",
  "mxHosts": ["mx1.example.com", "mx2.example.com"]
}
```

:::tip Note

To automatically publish MTA-STS policies, port 443 (HTTPS) must be open. This port allows Stalwart to serve the policy files via HTTPS so that other mail servers can perform policy checks.

:::

Stalwart can also automatically generate MTA-STS DNS records for hosted domains; the records are available in the [WebUI](/docs/management/webui/overview) under Management > Directory > Domains.
