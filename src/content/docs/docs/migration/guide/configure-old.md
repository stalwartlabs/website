---
sidebar_position: 5
title: "Configuring the old deployment"
---

The old deployment needs a small number of changes so that it can sit behind the proxy and accept relayed mail from the new server. These are the only changes made to the live system, and they are written now but deliberately not applied. The settings that take effect through a configuration reload are harmless to leave staged, and the settings that require a restart are held back until the cutover, so that the brief interruption a restart causes happens once, at a controlled moment. Until then the old server continues to operate exactly as it does today.

Every change shown here uses the v0.15 management API with an administrator's credentials. The same values can be edited through the v0.15 administration interface or written directly into the server's TOML configuration file. The API is used in the examples because it expresses each change as an unambiguous key and value. The administrator's login and password authenticate the requests:

```bash
OLD="https://old.internal.example.org"
AUTH="admin:administrator-password"   # the old server's administrator credentials
```

## Accepting the proxy on every listener except port 25

The proxy forwards each connection with a PROXY protocol header so that the old server records the real client address. For those headers to be accepted, the network the proxy connects from is marked as trusted on each listener. There is one deliberate exception: port 25. The new server relays not-yet-migrated recipients to the old server as an ordinary SMTP client that does not send a PROXY header, so port 25 must continue to accept plain connections. Marking port 25 as trusted would make it expect a header that the new server never sends, and the relay would stall.

The settings below enable PROXY protocol on the IMAP, POP3, submission, ManageSieve and HTTP listeners, naming the proxy's address as the trusted network. The `smtp` listener, which is port 25, is left untouched:

```bash
curl -sk -u "$AUTH" -H 'Content-Type: application/json' "$OLD/api/settings" -d '[
  {"type":"insert","assert_empty":false,"values":[
    ["server.listener.imaptls.proxy.override","true"],
    ["server.listener.imaptls.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.imap.proxy.override","true"],
    ["server.listener.imap.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.pop3s.proxy.override","true"],
    ["server.listener.pop3s.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.pop3.proxy.override","true"],
    ["server.listener.pop3.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.submission.proxy.override","true"],
    ["server.listener.submission.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.submissions.proxy.override","true"],
    ["server.listener.submissions.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.sieve.proxy.override","true"],
    ["server.listener.sieve.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.https.proxy.override","true"],
    ["server.listener.https.proxy.trusted-networks.0","203.0.113.10/32"],
    ["server.listener.http.proxy.override","true"],
    ["server.listener.http.proxy.trusted-networks.0","203.0.113.10/32"]
  ]}
]'
```

The address `203.0.113.10/32` is a placeholder and must be replaced throughout with the proxy's actual address, written as a single host (`/32`) or as the subnet the proxy connects from; it is the same address used for the trusted-network setting on the new server. The listener names above are the defaults shipped by the old server. A deployment that renamed its listeners adjusts the keys accordingly. Once these settings take effect, which happens only on restart, the old server expects a PROXY header on those listeners from the proxy's network, and a direct connection from that network without one is refused. From that point the old server is reached through the proxy rather than connected to directly.

## Trusting mail relayed from the new server

When the new server relays a message to the old server, the connection comes from the new server and the message carries whatever authentication the original sender provided, which has already been evaluated once by the new server acting as the public mail exchanger. If the old server were to evaluate SPF, DKIM, DMARC, ARC and reverse-DNS again, those checks would frequently fail, because the connecting host is now the new server rather than the sender's, and a relayed message would be penalised or rejected for reasons that have nothing to do with its legitimacy. These inbound checks are therefore disabled on the old server, which now trusts the new server to have performed them:

```bash
curl -sk -u "$AUTH" -H 'Content-Type: application/json' "$OLD/api/settings" -d '[
  {"type":"insert","assert_empty":false,"values":[
    ["auth.dkim.verify","disable"],
    ["auth.arc.verify","disable"],
    ["auth.spf.verify.ehlo","disable"],
    ["auth.spf.verify.mail-from","disable"],
    ["auth.dmarc.verify","disable"],
    ["auth.iprev.verify","disable"],
    ["session.ehlo.reject-non-fqdn","false"]
  ]}
]'
```

The final setting relaxes the requirement that a connecting server identify itself with a fully qualified domain name in its EHLO greeting. The new server identifies itself by its own hostname when relaying, which in many deployments is an internal name rather than a public one, and without this change the old server would reject the relay before any message is transferred.

## Advertising the proxy as the public address

Like the new server, the old server advertises a URL that clients use to locate its JMAP and OAuth endpoints. During the migration that URL has to be the proxy, so that a client reaching the old server through the proxy is told to come back through the proxy rather than to contact the old server directly. The advertised URL is set to the public hostname:

```bash
curl -sk -u "$AUTH" -H 'Content-Type: application/json' "$OLD/api/settings" -d '[
  {"type":"insert","assert_empty":false,"values":[
    ["http.url","'\''https://mail.example.org'\''"]
  ]}
]'
```

The value is quoted twice because the configuration stores it as an expression whose result is the literal URL string.

## Routing the old server's outbound mail through the new server

This step is optional but recommended for consistency. With the new server acting as the public face of the domain, mail sent by accounts that still live on the old server is best routed out through the new server as well, so that it is signed and filtered by the same policies as everything else. The old server is given a relay route to the new server and a rule that sends non-local mail to it, while keeping delivery to local domains local so that a message between two accounts on the old server is not bounced off the new server and back:

```bash
curl -sk -u "$AUTH" -H 'Content-Type: application/json' "$OLD/api/settings" -d '[
  {"type":"insert","assert_empty":false,"values":[
    ["queue.route.smarthost.type","relay"],
    ["queue.route.smarthost.address","new.internal.example.org"],
    ["queue.route.smarthost.port","25"],
    ["queue.route.smarthost.protocol","smtp"],
    ["queue.route.smarthost.tls.implicit","false"],
    ["queue.route.smarthost.tls.allow-invalid-certs","true"],
    ["queue.strategy.route.0.if","is_local_domain('\''*'\'', rcpt_domain)"],
    ["queue.strategy.route.0.then","'\''local'\''"],
    ["queue.strategy.route.1.else","'\''smarthost'\''"]
  ]}
]'
```

## When these changes take effect

The settings that govern authentication, the EHLO requirement, the advertised URL and outbound routing take effect the moment the configuration is reloaded, which the old server does without dropping connections. The settings that enable PROXY protocol on the listeners are different: they only take effect when the server process is restarted, because they change how each listening socket interprets the bytes that arrive on it.

For this reason nothing is reloaded or restarted in this step. Applying the changes is deferred to the cutover, where the old server is restarted once. Restarting it is what produces the short interruption noted in the overview, and combining it with the start of the proxy keeps that interruption to a single window. Writing the settings now, without applying them, has no effect on the running server and no effect on clients.

## Rollback

Because nothing has been applied, abandoning the migration at this point requires no action beyond not restarting the old server; the staged settings sit inert in its configuration. If the settings are ever to be removed entirely, each key is cleared and the server reloaded. Should the changes already have been applied at the cutover and then need to be undone, the same clearing of these keys followed by a restart returns the old server to standalone operation, at which point it again accepts direct connections from clients without the proxy. This is the basis of the rollback described in the next step.
