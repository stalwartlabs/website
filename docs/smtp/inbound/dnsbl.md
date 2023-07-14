---
sidebar_position: 8
---

# DNSBLs

DNS block lists (DNSBLs) are databases of IP addresses and domain names that are associated with malicious or unwanted behavior on the Internet. They are used as a tool for blocking incoming email from known spam sources. Stalwart SMTP can be configured to use DNSBLs to check the IP address and domain name of the sender of an incoming email, and if they are listed in one of the DNSBLs, the email is rejected. DNSBLs are maintained by various organizations and are updated in real-time to reflect the latest information about spam and malicious activity on the Internet. 

## Settings

Stalwart SMTP supports the use of DNSBLs to check IP addresses and email addresses against lists of known spammers. To enable DNSBL checking, a list of the variables to be checked has to be specified in the `auth.dnsbl.verify` key. The available variables for DNSBL verification are:

- `ip`: The IP address of the client.
- `iprev`: The reverse IP address of the hostname specified in the `EHLO` command.
- `return-path`: The domain name of the sender address used in the `MAIL FROM` command.
- `from`: The domain name included in the `From` header of the email message.

Example:

```toml
[auth.dnsbl]
verify = [ { if = "listener", eq = "smtp", then = ["ip", "iprev", "ehlo", "return-path", "from"] }, 
           { else = [] } ]
```

## Servers

Stalwart SMTP provides the ability to validate IP addresses and domain names against DNSBLs. The configuration for IP address DNSBL servers is set in the `auth.dnsbl.lookup.ip` attribute, while the configuration for domain name DNSBL servers can be found in the `auth.dnsbl.lookup.domain` list.

Example:

```toml
[auth.dnsbl.lookup]
ip = ["zen.spamhaus.org", "bl.spamcop.net", "b.barracudacentral.org"]
domain = ["dbl.spamhaus.org"]
```
