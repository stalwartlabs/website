---
sidebar_position: 5
---

# Reverse IP

Reverse IP verification validates the authenticity of the connecting client's IP address. The server performs a reverse DNS lookup of the remote IP and compares the result against the hostname provided in the `EHLO` or `HELO` command. If they do not match, the server can reject the connection to guard against hosts that disguise their origin when sending spam or performing other malicious activity. Reverse-IP verification helps ensure that incoming SMTP connections are legitimate.

## Settings

Reverse IP verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). The [`reverseIpVerify`](/docs/ref/object/sender-auth#reverseipverify) field accepts an expression that returns one of:

- `relaxed`: verify the reverse IP and report the results in the `Authentication-Results` header.
- `strict`: reject the message if reverse-IP verification fails; otherwise report the results.
- `disable`: do not perform reverse-IP verification.

The default policy applies `relaxed` when `local_port == 25` and `disable` otherwise, equivalent to:

```json
{
  "reverseIpVerify": {
    "match": [{"if": "listener == 'smtp'", "then": "relaxed"}],
    "else": "disable"
  }
}
```
