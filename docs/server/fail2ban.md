---
sidebar_position: 6
---

# Fail2ban

Fail2Ban is a critical intrusion prevention framework designed to safeguard servers from brute-force attacks and other malicious activities. It achieves this by monitoring server logs for suspicious patterns, such as repeated authentication failures or attempts to exploit server vulnerabilities, and then taking action to block the offending IP addresses. Traditionally, Fail2Ban modifies firewall rules to reject new connections from these IP addresses for a set period, offering dynamic protection against ongoing threats.

In the Stalwart Mail Server, a fail2ban-like system is built directly into the server, offering a tailored and seamless security solution without relying on external software. This integrated approach allows for enhanced protection specifically designed to meet the needs of a mail server environment. The Stalwart Mail Server’s fail2ban system works by monitoring various types of failures and undesirable behaviors, and then automatically dropping further connections from any IP address deemed a threat. Once an IP is flagged, the server ceases to accept any new connections from that IP, effectively isolating it and preventing further interaction with the server.

## Mechanisms

### Authentication failures

Authentication failures in any of the server's services, whether it be JMAP, IMAP, SMTP, or ManageSieve, are collectively considered when determining if an IP address should be banned. This holistic approach enhances the security of the server by providing a unified defense mechanism across all points of access. Furthermore, the fail2ban system in Stalwart Mail Server tracks authentication failures not only by IP address but also by login name. This feature is particularly crucial in mitigating distributed brute-force attacks, where an attacker may use a multitude of IP addresses to target a single account. For instance, if the fail2ban limit is configured to trigger a ban after 10 authentication failures, and an attacker repeatedly fails to access an account using different IP addresses, the system will recognize this pattern. Upon reaching the threshold of failures, the fail2ban mechanism will block any subsequent authentication attempts using that specific login, regardless of the IP address. This adds an extra layer of security, as it prevents attackers from simply switching IP addresses to bypass IP-based blocking. 

### RCPT TO failures

In addition to authentication failures, the Stalwart Mail Server’s fail2ban system includes protection against another common types of malicious behavior: RCPT TO failures. The RCPT TO failures protection is designed to guard against brute-force attacks that attempt to discover valid email addresses by repeatedly issuing RCPT TO commands with invalid addresses. If an IP address generates too many RCPT TO failures within a specified timeframe, it will be banned, thus preventing the attacker from continuing their probing efforts.

### Loitering connections

The loitering connections protection addresses situations where a remote client connects to the server and remains idle for extended periods without initiating any meaningful communication. This behavior can be indicative of resource-wasting attacks, such as SYN flood attempts, which aim to overwhelm the server by tying up connections. If a client repeatedly engages in such behavior, the server will ban the IP address after it exceeds the configured rate of inactivity, helping to conserve server resources and protect against denial-of-service attacks.

## Configuration

The `server.fail2ban.authentication`, `server.fail2ban.invalid-rcpt` and `server.fail2ban.loitering` settings within the configuration file allow you to define the threshold for banning IP addresses based on the number of failures over a specified period. This threshold is expressed as "num_failures/period", where `num_failures` represents the total number of failures and `period` is the time frame within which these failures must occur to trigger a ban. The period is designated by a number followed by a time unit identifier (such as 'd' for days, 'h' for hours).

Let's say you want to ban IP addresses after they have made 100 failed authentication attempts within a single day, or issued 35 invalid RCPT TO commands within a day, or has maintained 150 loitering connections within a day. You can configure these settings as follows:

```toml
[server.fail2ban]
authentication = "100/1d"
invalid-rcpt = "35/1d"
loitering = "150/1d"
```

In the example above, `100` is the number of failed attempts, and `1d` indicates a period of one day. This means that if an IP address reaches 100 failed attempts within any 1-day period, it will be automatically banned. The same principle applies to the `invalid-rcpt` and `loitering` settings, which control the threshold for banning IP addresses based on the number of RCPT TO failures and loitering connections, respectively.

Blocked IP addresses are stored using the `server.blocked-ip` prefix followed by the IP address. For example, the blocked IP address `192.0.2.1` would be stored as `server.blocked-ip.192.0.2.1`.

