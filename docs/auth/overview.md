---
sidebar_position: 1
---

# Overview

Stalwart Mail Server supports authenticating users against an array of popular backends, facilitating seamless integration with existing user management systems. These include LDAP (Lightweight Directory Access Protocol), suitable for organizations utilizing an LDAP directory for storing user information, and SQL-based databases such as PostgreSQL, MySQL, and SQLite. Additionally, Stalwart provides an internal directory, offering a straightforward and convenient method for user management directly within the mail server. This built-in system simplifies the setup and administration process for organizations of all sizes.

On the authentication options front, Stalwart supports OAuth, a modern standard for access delegation. This allows users to authenticate using the built-in OAuth server, enabling easy integration with contemporary web services and applications. Alongside these options, Stalwart incorporates key security mechanisms to safeguard against unauthorized access and brute-force attacks. These include authentication rate limiting, which mitigates the risk of password guessing by limiting the number of permissible authentication attempts within a given timeframe. Furthermore, Stalwart's built-in Fail2Ban support enhances its security posture. Fail2Ban monitors signs of malicious activity, automatically imposing temporary IP bans on addresses that display such behaviors, thus providing an additional layer of defense against attackers.
