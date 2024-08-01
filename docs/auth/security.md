---
sidebar_position: 6
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

Fail2Ban is an essential intrusion prevention software framework designed to protect computer servers from brute-force attacks. This tool functions by monitoring server log files for patterns of malicious behavior, such as repeated password failures or seeking exploits, and then implements security measures to block the offending IP addresses. In a typical setup, Fail2Ban adjusts the server's firewall rules to reject new connections from these IP addresses for a set duration, providing a dynamic defense against various types of cyber attacks.

In Stalwart Mail Server, the implementation of a fail2ban-like system takes a unique approach, tailored to the specific needs and architecture of the mail server. This integrated system is not dependent on the traditional Fail2Ban software; instead, it is a built-in feature of Stalwart Mail Server, designed to enhance its security from within.

Unlike the conventional Fail2Ban approach, which primarily modifies firewall rules to block offending IP addresses, the Stalwart Mail Server's fail2ban system operates by directly dropping further connections from any banned IP address. This means that once an IP address is identified as a threat based on predefined criteria, the server immediately ceases to accept any further connections from that IP, effectively isolating it from the server.

An important aspect of this system is its comprehensive integration across all mail server services. This integration ensures that authentication failures in any of the server's services, whether it be JMAP, IMAP, SMTP, or ManageSieve, are collectively considered when determining if an IP address should be banned. This holistic approach enhances the security of the server by providing a unified defense mechanism across all points of access.

Furthermore, the fail2ban system in Stalwart Mail Server tracks authentication failures not only by IP address but also by login name. This feature is particularly crucial in mitigating distributed brute-force attacks, where an attacker may use a multitude of IP addresses to target a single account. For instance, if the fail2ban limit is configured to trigger a ban after 10 authentication failures, and an attacker repeatedly fails to access an account using different IP addresses, the system will recognize this pattern. Upon reaching the threshold of failures, the fail2ban mechanism will block any subsequent authentication attempts using that specific login, regardless of the IP address. This adds an extra layer of security, as it prevents attackers from simply switching IP addresses to bypass IP-based blocking. 

This nuanced approach to security, considering both the IP address and the login name, effectively counters more sophisticated attack strategies, such as distributed brute-force attacks. It ensures that even if an attacker employs a range of IP addresses to breach a particular account, the security system remains vigilant. After a defined number of failed login attempts, the system understands that these attempts are targeted towards a specific account, thereby initiating a ban on any further attempts with that login name, irrespective of the originating IP address.

### Configuration

Configuring fail2ban in Stalwart Mail Server is a straightforward process. The `authentication.fail2ban` setting within the configuration file allows you to define the threshold for banning IP addresses based on the number of failed authentication attempts over a specified period. This threshold is expressed as "num_failures/period", where `num_failures` represents the total number of authentication failures and `period` is the time frame within which these failures must occur to trigger a ban. The period is designated by a number followed by a time unit identifier (such as 'd' for days, 'h' for hours).

Let's say you want to ban an IP address after it has made 100 failed authentication attempts within a single day. In the example below, `100` is the number of failed attempts, and `1d` indicates a period of one day. This means that if an IP address reaches 100 failed attempts within any 1-day period, it will be automatically banned.

```toml
[authentication]
fail2ban = "100/1d"
```

Blocked IP addresses are stored using the `server.blocked-ip` prefix followed by the IP address. For example, the blocked IP address `192.0.2.1` would be stored as `server.blocked-ip.192.0.2.1`.

