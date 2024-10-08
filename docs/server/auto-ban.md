---
sidebar_position: 6
---

# Auto-banning

Stalwart Mail Server provides robust protection mechanisms to safeguard your mail infrastructure against various forms of attacks and abuse. One of the key features in this protection framework is the **automatic ban mechanism**, which is designed to monitor incoming connections and identify potentially malicious behavior. When certain thresholds are met, Stalwart takes immediate action by banning the offending IP address, thereby preventing further attempts to compromise or misuse the server.

The automatic ban system operates by keeping track of different types of suspicious activities or abuse patterns. These could include excessive failed login attempts, unauthorized relay usage, or attempts to discover valid recipient addresses on the server. The system allows administrators to configure specific thresholds, and when these limits are exceeded, the IP address responsible for the abuse is automatically banned. After an IP address is banned, Stalwart drops all future connection attempts from that IP, ensuring that any further malicious activity is blocked.

One common type of attack that the automatic ban mechanism defends against is brute force authentication attacks. Much like the well-known *fail2ban* tool, Stalwart monitors failed login attempts from each IP address. If an IP address exceeds the configured number of failed attempts, it is banned from further connection attempts. This helps prevent malicious users from repeatedly trying to guess valid login credentials on the server.

In addition to defending against authentication failures, the automatic ban system also protects the server from abuse attempts aimed at exploiting its mail functionality. For instance, Stalwart monitors for attempts to use the server as a relay host, which could be used to send spam or conduct other malicious activities. It also detects attempts to probe for valid recipient addresses (RCPT TO). If these behaviors exceed the predefined limits, the automatic ban mechanism is triggered to block the abusive IP address.

The automatic ban system also includes protection against network-based attacks such as port scanning and SYN flooding. Port scanning involves probing the server for open ports, while SYN flooding aims to overwhelm the server’s resources by flooding it with connection requests. While these attacks are more network-related, Stalwart is capable of detecting them and banning the responsible IP addresses to ensure the server remains secure and stable.

The automatic ban mechanism is a vital part of Stalwart Mail Server’s security infrastructure, helping to maintain the integrity and availability of the server by promptly identifying and neutralizing threats. Further details on how to configure and customize these protections can be found in the following sections of the documentation.

## Configuration

The `server.auto-ban.*.rate` settings within the configuration file allow you to define the threshold for banning IP addresses based on the number of failures over a specified period. This threshold is expressed as "num_failures/period", where `num_failures` represents the total number of failures and `period` is the time frame within which these failures must occur to trigger a ban. The period is designated by a number followed by a time unit identifier (such as 'd' for days, 'h' for hours).

Blocked IP addresses are stored using the `server.blocked-ip` prefix followed by the IP address. For example, the blocked IP address `192.0.2.1` would be stored as `server.blocked-ip.192.0.2.1`.

### Authentication failures

Authentication failures in any of the server's services, whether it be JMAP, IMAP, SMTP, or ManageSieve, are collectively considered when determining if an IP address should be banned. This holistic approach enhances the security of the server by providing a unified defense mechanism across all points of access. Furthermore, the fail2ban system in Stalwart Mail Server tracks authentication failures not only by IP address but also by login name. This feature is particularly crucial in mitigating distributed brute-force attacks, where an attacker may use a multitude of IP addresses to target a single account. For instance, if the fail2ban limit is configured to trigger a ban after 10 authentication failures, and an attacker repeatedly fails to access an account using different IP addresses, the system will recognize this pattern. Upon reaching the threshold of failures, the fail2ban mechanism will block any subsequent authentication attempts using that specific login, regardless of the IP address. This adds an extra layer of security, as it prevents attackers from simply switching IP addresses to bypass IP-based blocking. 

In order to enable automatic banning based on multiple failed authentication attempts, set the `server.auto-ban.auth.rate` setting to the desired threshold.

For example:

```toml
[server.auto-ban.auth]
rate = "100/1d"
```

### Abuse protection

The Abuse Attempts feature is designed to prevent unauthorized use of the server for malicious activities, particularly by blocking IP addresses that attempt to exploit the SMTP server. This feature focuses on two common forms of abuse: attempts to use the server as a relay host and attempts to discover valid recipients through brute force using the RCPT TO command.

When an attacker tries to use the server as a relay host, they are attempting to send emails through your server without authorization. This is often done for spamming or distributing malicious content. Stalwart detects these unauthorized relay attempts by monitoring connection behaviors and, when the number of attempts exceeds the configured limit, it bans the offending IP address. This ensures that only authorized users can send emails through the server.

Similarly, Stalwart protects against brute force attempts to guess valid recipients on the server using the RCPT TO command. Attackers may try to discover which email addresses are valid by repeatedly sending the RCPT TO command with different address variations. The server tracks these attempts, and if an IP address tries to perform this behavior excessively, it will be banned to prevent further abuse.

In order to enable automatic banning based on abuse attempts, set the `server.auto-ban.abuse.rate` setting to the desired threshold.

For example:

```toml
[server.auto-ban.abuse]
rate = "35/1d"
```

### Loitering connections

The loitering connections protection addresses situations where a remote client connects to the server and remains idle for extended periods without initiating any meaningful communication. This behavior can be indicative of resource-wasting attacks, such as SYN flood attempts, which aim to overwhelm the server by tying up connections. If a client repeatedly engages in such behavior, the server will ban the IP address after it exceeds the configured rate of inactivity, helping to conserve server resources and protect against denial-of-service attacks.

In order to enable automatic banning based on loitering connections, set the `server.auto-ban.loiter.rate` setting to the desired threshold.

For example:

```toml
[server.auto-ban.loiter]
rate = "150/1d"
```

### Port scanning

Port scanning is a technique used by attackers to probe a server for open or vulnerable ports, which they can then exploit to gain unauthorized access or perform other malicious activities. By scanning through various ports, attackers attempt to identify services that might be susceptible to attacks, such as outdated software or misconfigurations. 

Stalwart Mail Server provides protection against such port scanning attempts by continuously monitoring all the ports it is listening on. If an IP address attempts to scan these ports and the number of attempts exceeds a pre-configured threshold, Stalwart will automatically block the offending IP address. This immediate response prevents attackers from continuing their scan and reduces the risk of further exploitation.

In addition to general port scanning protection, Stalwart offers an extra layer of security for its HTTP service. This protection specifically targets IP addresses that attempt to access certain paths commonly associated with known exploits. For example, attackers may try to access paths such as `*.php` or `/cgi-bin/*` to find vulnerabilities in web applications. Stalwart allows administrators to configure a list of such paths, and any IP address attempting to access these paths is automatically banned. By default, the list includes entries like `*.php` and `/cgi-bin/*`, but it can be customized to suit your specific security needs.

In order to enable automatic banning based on port scanning attempts, set the `server.auto-ban.scan.rate` setting to the desired threshold. The list of paths to monitor for HTTP scanning can be configured using the `server.auto-ban.scan.paths` setting.

For example:

```toml
[server.auto-ban.scan]
rate = "150/1d"
paths = [ "*.php*",
          "*.cgi*",
          "*.asp*",
          "*/wp-*",
          "*/php*",
          "*/cgi-bin*",
          "*xmlrpc*",
          "*../*",
          "*/..*",
          "*joomla*",
          "*wordpress*",
          "*drupal*" ]
```
