---
sidebar_position: 3
title: "Dovecot and Postfix"
prev:
  link: /docs/migration/guide/configure-proxy/
  label: Configuring the proxy
next:
  link: /docs/migration/guide/cutover/
  label: Starting the proxy
---

When the source is an on-premise Dovecot and Postfix stack, it needs a small number of changes so that it can sit behind the proxy and accept relayed mail from the new server. This combination, Dovecot serving IMAP, POP3 and ManageSieve with Postfix handling SMTP, is the foundation of many self-hosted mail systems, including Mail-in-a-Box, mailcow and other Docker-based distributions. The changes described here apply to the underlying Dovecot and Postfix configuration regardless of the distribution that wraps them, though a distribution that manages its configuration from templates may require the same settings to be expressed through its own mechanism rather than edited directly, so that they survive the distribution regenerating its files.

Two differences from a Stalwart source shape this step and are worth stating at the outset. The first is that a Dovecot and Postfix stack does not announce the client through the PROXY protocol; it learns the real client address from the XCLIENT command on the SMTP side and the IMAP ID command on the IMAP side, which is why the proxy's destination for this source was configured with `forwarding = "xclient"`. The second is that trusting the proxy here is permissive rather than mandatory: telling Dovecot and Postfix to honour XCLIENT and the IMAP ID from the proxy does not make them refuse ordinary direct connections, unlike a Stalwart listener that begins to require a PROXY header once the network is trusted. The practical consequences are convenient: no listener has to be exempted the way port 25 is on a Stalwart source, the migration tool can read mailboxes directly, and the changes can be applied with a reload rather than a restart.

The examples below use Dovecot's main configuration file and Postfix's `main.cf`, with `203.0.113.10` standing in for the proxy's actual address throughout. A ready-to-adapt copy of every change is collected in the proxy repository as [`resources/dovecot-postfix-trust.conf`](https://github.com/stalwartlabs/proxy/blob/main/resources/dovecot-postfix-trust.conf).

## Trusting the proxy to convey the real client

The XCLIENT and IMAP ID mechanisms only convey the real client address if the stack is told to trust the proxy. Without that trust, logins still succeed, but Dovecot and Postfix record the proxy's address as the client rather than the real one, which distorts logging and any address-based policy. The proxy's address is named as trusted, and it alone, so that no other host can present a forged client address.

In Dovecot, in `dovecot.conf` or a file under `conf.d`, the proxy's address is added to the trusted login networks:

```
login_trusted_networks = 203.0.113.10/32
```

In Postfix, the proxy is authorised to issue XCLIENT, applied with `postconf` or written into `main.cf`:

```
smtpd_authorized_xclient_hosts = 203.0.113.10/32
```

Both settings are restricted to the proxy's address, written as a single host (`/32`) or as the subnet the proxy connects from, which is the same address named as trusted on the new server. After the change Dovecot is reloaded with `doveadm reload` and Postfix with `postfix reload`. Whether the trust is in effect is confirmed by signing in through the proxy and reading the Dovecot login line: the `rip=` field shows the real client address when the IMAP ID is honoured and the proxy's address when it is not.

## Providing a master user for the migration tool

Vandelay reads each mailbox from the source over IMAP and reads its sieve scripts over ManageSieve. So that it can read any mailbox without knowing each account's password, Dovecot is given a master user that Vandelay authenticates as on behalf of the account being read. The master user and the separator that joins it to the target login are configured in Dovecot:

```
auth_master_user_separator = %

passdb {
  driver = passwd-file
  master = yes
  args = scheme=PLAIN username_format=%u /etc/dovecot/master-users
}
```

The `master-users` file holds the master account and its password, one per line. A production deployment stores a hashed password rather than a plaintext one, for example a hash produced by `doveadm pw -s SHA512-CRYPT`:

```
vmadmin:{PLAIN}ChangeThisMasterPassword
```

With a master user named `vmadmin` and the separator above, Vandelay reads the mailbox of `alice@example.org` by authenticating as `alice@example.org%vmadmin` with vmadmin's password. Because trusting the proxy did not stop the stack from accepting direct connections, Vandelay can read the source directly rather than through the proxy, which keeps the migration traffic off the public path. This master user exists only for the migration and is removed once every account has moved.

## Accepting mail relayed from the new server

From the cutover onward the new server is the public mail exchanger and performs split delivery: a message for an account that still lives on the source is relayed to it, while a message for an account that has already moved is delivered locally on the new server. The relay arrives at Postfix on port 25 as an ordinary SMTP connection from the new server, and Postfix has to accept it and deliver it into the existing mailbox through whatever local or virtual transport the deployment already uses. In a working Dovecot and Postfix stack that delivery path already exists, because Postfix already accepts and delivers mail for its own domains, so usually no new transport has to be defined.

What does have to be relaxed is any inbound checking that would penalise the relayed message. The connection now comes from the new server rather than from the original sender, and the message has already been evaluated once by the new server acting as the public exchanger. If Postfix, or a policy daemon or milter layered on top of it such as the rspamd instance that Mail-in-a-Box and mailcow run, re-evaluates SPF, DKIM, DMARC or the connecting host's reputation, those checks frequently fail for a relayed message and it is rejected or scored as spam for reasons unrelated to its legitimacy. The new server's address is therefore trusted on the source so that mail relayed from it bypasses these inbound checks. In plain Postfix this is done by adding the new server to the trusted networks, which exempts it from the sender and client restrictions and from reputation lookups:

```
mynetworks = 127.0.0.0/8 [::1]/128 203.0.113.20/32
```

The address `203.0.113.20` is a placeholder for the new server's address and is appended to whatever `mynetworks` already contains rather than replacing it. A deployment that filters with rspamd or another milter additionally trusts the new server's address in that layer, so that the milter does not re-score the relayed mail; the exact setting depends on the filtering stack and follows that stack's documentation for trusting an internal relay host. Postfix does not reject a non-fully-qualified EHLO by default, so the new server identifying itself by an internal hostname is normally accepted; if the deployment has enabled `reject_non_fqdn_helo_hostname`, it is relaxed for the relay so that the new server's greeting is not refused.

## Routing the source's outbound mail through the new server

This step is optional but recommended for consistency. With the new server acting as the public face of the domain, mail sent by accounts that still live on the source is best routed out through the new server as well, so that it is signed and filtered by the same policies as everything else. Postfix is given the new server as a relay host for non-local mail while keeping delivery to local domains local, so that a message between two accounts on the source is not bounced off the new server and back. The exact form depends on whether the deployment already uses a transport map; the simplest expression names the new server as the default relay host and leaves the existing local and virtual transports to catch local recipients first:

```
relayhost = [203.0.113.20]:25
```

The brackets prevent Postfix from looking up MX records for the relay host and direct it to the address literally. Deployments with more elaborate routing express the same intent through `transport_maps`, sending local domains to their existing transport and everything else to the new server.

## When these changes take effect

Unlike a Stalwart source, whose proxy-protocol listener settings only take effect on a full restart and which begins to refuse direct connections once they do, the Dovecot and Postfix changes here take effect on a reload and do not change how existing clients are treated. Trusting the proxy for XCLIENT and the IMAP ID is permissive, the master user adds a credential without altering any existing one, and trusting the new server in `mynetworks` only widens what is accepted. None of these divert client traffic or refuse a connection that worked before, so they are safe to apply before the cutover.

In practice this means the only change a client experiences at the cutover is the repointing of the public hostname to the proxy. The reload that applies these settings can be done now or deferred to the cutover; deferring it keeps every change to the live system in a single window, but unlike the Stalwart source there is no restart and no interruption inherent in applying them.

## Rollback

Because none of these changes diverts traffic or refuses existing connections, abandoning the migration at this point requires no action beyond not repointing the public hostname; the settings sit inert from the clients' point of view. Should the migration be abandoned after the cutover, the source is restored to standalone operation simply by repointing the public hostname back to it and stopping the proxy. No restart is needed, because the source never stopped accepting direct connections.

The trust and master-user settings are harmless to leave in place once the proxy is gone, since no traffic arrives from the proxy's address any longer, but they can be removed for a clean return to the original configuration: `login_trusted_networks` and the master `passdb` are cleared from Dovecot, `smtpd_authorized_xclient_hosts` from Postfix, the new server's address is removed from `mynetworks`, any relay host added for outbound consistency is removed, and both servers are reloaded.
