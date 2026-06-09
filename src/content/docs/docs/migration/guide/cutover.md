---
sidebar_position: 6
title: "Starting the proxy"
---

This step brings the combined system online. The old server is restarted so that the configuration staged in the previous step takes effect, the proxy is started, and the public hostname is repointed from the old server to the proxy. When it is finished every account is still served from the old deployment, exactly as before, but every connection now passes through the proxy. No account has been migrated yet. This is the moment to confirm that each protocol works end to end before any data is moved.

A short interruption occurs during this step, lasting only as long as it takes to restart the old server, start the proxy and repoint the hostname. It is the only planned downtime in the migration.

## Sequence

The order of operations matters, because the moment the old server is restarted it begins to expect the PROXY protocol on its listeners and stops accepting direct client connections from the proxy's network. The three actions are therefore performed in close succession.

First, the old server is restarted so that the proxy-protocol listener settings take effect along with the reloadable settings staged earlier. A restart rather than a reload is required because the listeners only reinterpret their sockets on a full restart.

Second, the proxy is started. It binds the public mail and HTTP ports and begins answering, resolving every account to the old deployment because the mapping table contains no account entries yet.

Third, the public hostname is repointed to the proxy. Whether this is done by changing a DNS record or by moving the public address onto the proxy host, it is the action that actually moves clients from the old server to the proxy. Until it happens, clients still reach the old server's address directly, which now refuses them because it expects the PROXY protocol, so the repointing should follow the restart promptly.

Once the proxy is answering on the public hostname, inbound mail on port 25 flows to the new server, which delivers locally for any migrated account and relays everything else to the old server. With nothing migrated yet, every message is relayed to the old server, which is the same destination it would have reached before, so mail delivery continues uninterrupted.

## Confirming the proxy is healthy

Before testing individual protocols, the proxy's own management endpoint confirms that it started cleanly and can reach both backends. The endpoint is reached with its bearer token on the management address configured for it:

```bash
TOKEN=$(cat /etc/proxy/admin.token)
curl -sk -H "Authorization: Bearer $TOKEN" https://127.0.0.1:9443/stats
```

The proxy's log records each backend connection it makes and the routing decision behind it, which is the first place to look if a test below does not behave as expected.

## Testing each protocol from the command line

Each test below connects to the public hostname, so it exercises the whole path: the client reaches the proxy, the proxy resolves the account to the old deployment, and the proxy forwards the session over the PROXY protocol to the old server. An account that lives on the old deployment is used throughout; substitute a real login and password.

IMAP over implicit TLS is tested by opening a session and authenticating. A successful login that lists mailboxes confirms the IMAP path:

```bash
openssl s_client -quiet -connect mail.example.org:993 <<'EOF'
a1 LOGIN alice@example.org "password"
a2 LIST "" "*"
a3 LOGOUT
EOF
```

POP3 over implicit TLS is confirmed the same way on its own port:

```bash
openssl s_client -quiet -connect mail.example.org:995 <<'EOF'
USER alice@example.org
PASS password
STAT
QUIT
EOF
```

SMTP submission with STARTTLS is confirmed by negotiating TLS and authenticating. The login and password are combined into the PLAIN credential first:

```bash
printf '\0alice@example.org\0password' | base64
openssl s_client -quiet -starttls smtp -connect mail.example.org:587 <<'EOF'
EHLO test
AUTH PLAIN <base64-from-above>
QUIT
EOF
```

ManageSieve is confirmed by connecting, upgrading to TLS and authenticating; a successful response to `AUTHENTICATE` lists the account's scripts.

JMAP is confirmed by requesting the session resource with HTTP Basic authentication. A JSON document naming the account's primary accounts confirms that the proxy routed the request and that the backend answered:

```bash
curl -sk -u 'alice@example.org:password' https://mail.example.org/.well-known/jmap
```

The web interface is confirmed by opening the public hostname in a browser and signing in. Because the old server's login endpoints are pinned to the old deployment, the old administration interface loads and authenticates.

## Testing split delivery

Split delivery is what carries inbound mail during the migration, so it is tested before relying on it. The new server's behaviour was configured earlier; this test confirms it works through the live system. A message is delivered to port 25 of the public hostname for an account that still lives on the old server, and is then expected to arrive in that account's mailbox after the new server relays it. Sending the message can be done with any SMTP client; a manual session makes each step visible:

```bash
openssl s_client -quiet -connect mail.example.org:25 <<'EOF'
EHLO test.example
MAIL FROM:<sender@example.com>
RCPT TO:<alice@example.org>
DATA
Subject: Split delivery test

This message should reach alice through the relay.
.
QUIT
EOF
```

The recipient is accepted by the new server, which finds that the address is not a local account but belongs to a local domain, and relays it to the old server, where the account receives it. Confirming that the message appears in the account's mailbox, through the IMAP test above or a real client, proves the inbound path. A message generated by external senders during testing is commonly classified as spam because it lacks the usual authentication, so the destination mailbox's spam folder is checked as well as the inbox.

If a test account has already been created on the new server, addressing a second message to it confirms the other half of split delivery: the new server recognises the address as local and delivers it without relaying.

## Continue only after real clients work

The command-line tests confirm the plumbing, but real mail clients exercise authentication mechanisms, capability negotiation and TLS settings that a manual session does not. Before any account is migrated, a real IMAP or JMAP client, a real submission client and the web interface should each be exercised against the public hostname with a genuine account. Migrating an account is reversible, but discovering a protocol problem after several mailboxes have moved is far more disruptive than discovering it now, while every account is still on the old server and the whole change amounts to repointing a hostname.

## Rollback

Rolling back at this stage is straightforward because no data has moved. The old server still holds every account exactly as it did before the cutover, so returning to it is a matter of taking the proxy back out of the path.

The public hostname is repointed from the proxy back to the old server's address, which sends clients to the old server directly again. The proxy is then stopped. Finally, on the old server, the settings that enable the PROXY protocol on its listeners are cleared and the server is restarted, so that it once again accepts ordinary direct connections from clients:

```bash
curl -sk -u "$AUTH" -H 'Content-Type: application/json' "$OLD/api/settings" -d '[
  {"type":"clear","prefix":"server.listener.imaptls.proxy"},
  {"type":"clear","prefix":"server.listener.imap.proxy"},
  {"type":"clear","prefix":"server.listener.pop3s.proxy"},
  {"type":"clear","prefix":"server.listener.pop3.proxy"},
  {"type":"clear","prefix":"server.listener.submission.proxy"},
  {"type":"clear","prefix":"server.listener.submissions.proxy"},
  {"type":"clear","prefix":"server.listener.sieve.proxy"},
  {"type":"clear","prefix":"server.listener.https.proxy"},
  {"type":"clear","prefix":"server.listener.http.proxy"}
]'
```

The remaining staged settings, which disable the inbound authentication checks and route outbound mail through the new server, are harmless to leave in place if the old server is to keep running standalone, but they can be cleared in the same way for a complete return to the original configuration. Once the old server has restarted and the hostname points back to it, the system is exactly as it was before the migration began.
