---
sidebar_position: 5
---

# Reverse IP

Reverse IP verification is a security mechanism used in SMTP to validate the authenticity of the connecting client's IP address. In reverse IP verification, the SMTP server performs a reverse lookup of the connecting client's IP address to see if it matches the hostname provided by the client in the EHLO or HELO command. If the reverse lookup does not match the hostname provided by the client, the SMTP server can reject the connection as a precaution against malicious actors attempting to disguise their IP address in order to send spam or perform other malicious activities. By enabling reverse IP verification in Stalwart SMTP, administrators can help ensure that incoming SMTP connections are legitimate and prevent the server from being used to send unwanted or harmful messages.

## Settings

Stalwart SMTP supports the following reverse IP verification policies which are configured with the `auth.iprev.verify` attribute:

- `relaxed`: Verify the reverse IP and report the results in the `Authentication-Results` header.
- `strict`: Reject the message if the reverse IP fails verification, otherwise report the results in the `Authentication-Results` header.
- `disable`: Do not perform reverse IP verification.

Example:

```toml
[auth.iprev]
verify = [ { if = "listener = 'smtp'", then = "relaxed" }, 
           { else = "disable" } ]
```
