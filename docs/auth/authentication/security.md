---
sidebar_position: 2
---

# Security

## Rate limiting

Rate limiting is an important security measure to mitigate and prevent brute-force attacks. These attacks involve an attacker submitting many login attempts in rapid succession in hopes of guessing the correct credentials. By enforcing a limit on the number of authentication attempts allowed from a user or IP address within a given timeframe, rate limiting effectively reduces the risk of unauthorized access through password guessing.

This technique ensures that, even if an attacker can make multiple attempts to guess a user's password, they are significantly hindered by not being able to make unlimited attempts in a short period. After reaching the set limit of failed login attempts, the system will temporarily block further attempts from that user or IP address, thereby protecting the account from being compromised.

Implementing rate limiting is not only about protecting individual user accounts but also about safeguarding the overall integrity and security of the server. It helps to maintain the server's availability by preventing it from being overwhelmed with authentication requests, which could potentially lead to denial of service conditions for legitimate users.

### Configuration

The setting ``authentication.rate-limit`` controls the amount of authentication requests that can be made in a timeframe by a given IP address. The format of this parameter is ``<number_of_requests>/<time>`` and the default value is ``10/1m`` (10 requests per minute).

Example:

```toml
[authentication]
rate-limit = "10/1m"
```

## Fail2Ban

Fail2Ban is an essential intrusion prevention software framework designed to protect computer servers from brute-force attacks. This tool functions by monitoring server log files for patterns of malicious behavior, such as repeated password failures or seeking exploits, and then implements security measures to block the offending IP addresses. 

For more information on how to configure Fail2Ban in Stalwart Mail Server, see the [Fail2Ban](/docs/server/fail2ban) documentation.
