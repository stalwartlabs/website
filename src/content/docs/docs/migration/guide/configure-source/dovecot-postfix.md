---
sidebar_position: 4
title: "Dovecot and Postfix"
description: "Prepare a Dovecot and Postfix source, including Mail-in-a-Box and mailcow, to trust the proxy, provide a master user and accept mail relayed from the new deployment."
prev:
  link: /docs/migration/guide/configure-proxy/
  label: Configuring the proxy
next:
  link: /docs/migration/guide/cutover/
  label: Starting the proxy
---

This page prepares a source on which Dovecot serves IMAP, POP3 and ManageSieve and Postfix handles SMTP. This combination is used by Mail-in-a-Box, mailcow and many other self-hosted systems.

The source is changed in four places:

- Dovecot and Postfix trust the proxy to announce the real client address.
- Dovecot gains a master user for Vandelay.
- Postfix accepts mail relayed from the new deployment without filtering it again.
- Optionally, Postfix sends its outbound mail through the new deployment.

The proxy announces clients to this source with the XCLIENT command on SMTP, POP3 and ManageSieve, and with the IMAP `ID` command on IMAP, as set by `forwarding = "xclient"` on the source's destination. Trusting these announcements is permissive: Dovecot and Postfix keep accepting direct connections. A Stalwart server behaves differently, since it refuses a connection from a trusted network that does not start with a PROXY header. This permissiveness makes the preparation simpler in three ways. No listener needs an exception, Vandelay can read the source directly, and every change on this page takes effect with a reload.

The examples use `203.0.113.10` for the proxy and `203.0.113.20` for the new deployment. The snippets are for Dovecot 2.3, and the Dovecot 2.4 form is given where it differs. `dovecot --version` shows the installed version, and `doveconf -n` prints the effective configuration. The proxy repository collects the Dovecot 2.3 and Postfix changes in [`resources/dovecot-postfix-trust.conf`](https://github.com/stalwartlabs/proxy/blob/main/resources/dovecot-postfix-trust.conf).

## Distribution notes

Distributions generate parts of the Dovecot and Postfix configuration. A change made in a generated file is lost when the distribution rewrites it:

- **mailcow** reads additional Dovecot settings from `data/conf/dovecot/extra.conf`, which is created if missing, as described in the [mailcow documentation](https://docs.mailcow.email/manual-guides/Dovecot/u_e-dovecot-extra_conf/). The change is applied with `docker compose restart dovecot-mailcow`. Postfix settings are added to `data/conf/postfix/extra.cf`, which overrides the generated `main.cf`, and are applied with `docker compose restart postfix-mailcow`.
- **Mail-in-a-Box** has no supported way to override its configuration. Its setup script edits the Dovecot `conf.d` files and rewrites `conf.d/99-local.conf` on every run. A change made there is therefore lost at the next Mail-in-a-Box update, and has to be applied again after each update for as long as the migration lasts. Mail-in-a-Box installs Dovecot 2.3.

## Trusting the proxy to announce the real client

Dovecot and Postfix accept the client address from the proxy only when the proxy's address is trusted. Without that trust, logins still succeed, but both servers record the proxy's address as the client. This affects logging, and any policy based on the client address. Trust only the proxy's address, so that no other host can present a forged client address.

In Dovecot, add the proxy's address to the trusted login networks, in `dovecot.conf` or in a file under `conf.d`. The setting has the same name in Dovecot 2.3 and 2.4:

```text
login_trusted_networks = 203.0.113.10/32
```

In Postfix, allow the proxy to issue XCLIENT, in `main.cf` or with `postconf -e`:

```text
smtpd_authorized_xclient_hosts = 203.0.113.10/32
```

Dovecot is reloaded with `doveadm reload`, and Postfix with `postfix reload`. To confirm that the trust is in effect, sign in through the proxy once it is running, and read the Dovecot login line. Its `rip=` field shows the client's address when the announcement is honoured, and the proxy's address when it is not.

The proxy's destination for this source can also send a PROXY protocol header (`forwarding = "proxy"`) instead of XCLIENT. In that case, Dovecot trusts the header through `haproxy_trusted_networks` and a `haproxy = yes` flag on each `inet_listener` that receives proxied connections. In this arrangement, a connection from an unlisted address to such a listener is logged and disconnected, so Vandelay then reads the source through a listener without the flag. The flag's spelling differs between Dovecot releases, so confirm it with `doveconf -n` on the installed version.

## Providing a master user for Vandelay

Vandelay reads each mailbox over IMAP, and the account's Sieve scripts over ManageSieve. It has to read every account, but it does not know the users' passwords. A Dovecot master user solves this: it is a credential that can sign in on behalf of any account. Vandelay signs in as the master user on behalf of each account, with a login made of the account name, a separator and the master user's name, together with the master user's password.

In Dovecot 2.3, the master user database and the separator are configured as follows:

```text
auth_master_user_separator = %

passdb {
  driver = passwd-file
  master = yes
  args = scheme=PLAIN username_format=%u /etc/dovecot/master-users
}
```

The `master-users` file holds one line per master user. Use a password hash, for example one produced by `doveadm pw -s SHA512-CRYPT`; the plain form below is for illustration only:

```text
vmadmin:{PLAIN}ChangeThisMasterPassword
```

In Dovecot 2.4 the block takes a different form:

```text
auth_master_user_separator = *

passdb passwd-file {
  passwd_file_path = /etc/dovecot/passwd.masterusers
  master = yes
  result_success = continue
}
```

Create the password file with `htpasswd -b -c -s /etc/dovecot/passwd.masterusers vmadmin <password>`.

With `result_success = continue`, Dovecot also checks that the account being opened exists. This check does not work with a PAM or LDAP password database, unless LDAP uses `passdb_ldap_bind = yes`.

The acl plugin adds one more condition. When it is enabled, the master user has no access to a mailbox unless the mailbox ACL grants it (`* user=vmadmin lr`) or `acl_user = %{user}` is set.

On mailcow, the snippet goes into `data/conf/dovecot/extra.conf`. Its paths are those inside the `dovecot-mailcow` container, which mounts `data/conf/dovecot` at `/etc/dovecot`. The file named `/etc/dovecot/master-users` in the snippet is therefore created on the host as `data/conf/dovecot/master-users`.

mailcow already sets `auth_master_user_separator = *` for its own master user, and it reads `extra.conf` after its own configuration. The separator in the snippet therefore replaces `*` for every master login, mailcow's included.

With the master user `vmadmin` and the separator `%`, Vandelay reads the mailbox of `alice@example.org` by signing in as `alice@example.org%vmadmin` with vmadmin's password. With the separator `*`, the login is `alice@example.org*vmadmin`. The master user exists only for the migration, and is removed when the [migration is finalised](/docs/migration/guide/finalize/).

## Accepting mail relayed from the new deployment

From the cutover onwards, the new deployment relays every message for an account that is still on the source to Postfix on port 25. It does so in an ordinary SMTP session, from the new deployment's address. Postfix already accepts and delivers mail for its own domains, so the existing delivery path handles these messages, and no transport has to be added.

The checks are what need attention. The relayed message has already been checked by the new deployment, as the public mail exchanger. Postfix, a policy service, or a filter such as rspamd on mailcow or SpamAssassin on Mail-in-a-Box may check SPF, DKIM, DMARC or the client's reputation again. These checks would see the new deployment's address as the client and frequently fail, and the message would be rejected or classified as spam. The new deployment's address is therefore exempted from these checks on the source.

There is a broad way and a narrow way to grant the exemption in Postfix. The broad form adds the new deployment to `mynetworks`, appended to the existing value:

```text
mynetworks = 127.0.0.0/8 [::1]/128 203.0.113.20/32
```

On mailcow, `mynetworks` is not set, and Postfix derives the trusted networks from `mynetworks_style = subnet`. A value set in `data/conf/postfix/extra.cf` replaces that derivation, so it has to list mailcow's own networks as well, as described in the [mailcow documentation](https://docs.mailcow.email/manual-guides/Postfix/u_e-postfix-unauthenticated-relaying/). These are the loopback addresses and the `IPV4_NETWORK` and `IPV6_NETWORK` ranges from `mailcow.conf`, followed by the new deployment.

The broad form grants more than the exemption. A host in `mynetworks` passes every restriction that starts with `permit_mynetworks`, which includes the right to relay mail to any destination. The new deployment needs no relay right, because it only delivers mail for the source's own domains.

The narrower form lists the new deployment's address in a `check_client_access` table that returns `OK`. The table is placed at the start of the restriction lists that perform the checks, for example `smtpd_client_restrictions` and the part of `smtpd_recipient_restrictions` before the SPF policy service. The Postfix documentation of `check_client_access` describes the table format.

Filters need an exemption of their own. A filter such as rspamd or SpamAssassin scores the message independently of the Postfix restrictions, so the new deployment's address must also be trusted there, as described in the filter's documentation for internal relay hosts.

On mailcow, rspamd rejects such mail unless the new deployment's address is added as a forwarding host. The address is added in the mailcow UI, or through `POST /api/v1/add/fwdhost` with `filter_spam` set to `0`, which makes rspamd accept the mail without scoring it.

A greylisting service, such as postgrey on Mail-in-a-Box, delays relayed mail in the same way, and is given the same exemption.

Postfix does not reject a greeting with a host name that is not fully qualified unless `reject_non_fqdn_helo_hostname` is enabled. If it is enabled, exempt the new deployment from it, because the new deployment may greet with an internal host name.

## Routing the source's outbound mail through the new deployment

This step is optional. While the migration lasts, mail that accounts on the source send to other domains can leave through the new deployment, so that all outgoing mail uses one path and one sending address. The new deployment must then accept relayed mail from the source's address, as described in [Relaying outbound mail for the source](/docs/migration/guide/configure-new/#relaying-outbound-mail-for-the-source).

Postfix sends mail for remote domains to the new deployment when the new deployment is set as the relay host. Local and virtual domains keep their existing transports, so mail between two accounts on the source stays on the source:

```text
relayhost = [203.0.113.20]:25
```

The brackets stop Postfix from looking up MX records for the relay host. A deployment that already routes with `transport_maps` adds the same next hop there, for remote domains.

## Send mail for moved accounts to the new deployment

Mail from one account on the source to another is delivered locally by Postfix. This is also true when the recipient has already moved, because the source keeps the moved account for a rollback.

A transport entry for each moved account sends that mail to the new deployment instead, which delivers it to the account. The entry is added when the account is switched, in a table named by `transport_maps`:

```text
transport_maps = hash:/etc/postfix/transport
```

The table holds one line per moved account:

```text
alice@example.org    smtp:[203.0.113.20]:25
```

The table is compiled with `postmap /etc/postfix/transport`, and takes effect on `postfix reload`. A deployment that already sets `transport_maps` adds the entries to its existing table. A rollback of the account removes its entry again.

mailcow generates its own transport configuration, so this step is not covered here for mailcow. On mailcow, the repeated catch-up described in [Migrating many accounts](/docs/migration/guide/migrate-accounts/#migrating-many-accounts) copies such mail instead.

## Reload versus restart

Every change on this page takes effect when Dovecot is reloaded with `doveadm reload` and Postfix with `postfix reload`.

None of the changes alters how existing clients are served. The trust settings only add what the proxy is allowed to announce, the master user adds a credential, and the relay exemption only relaxes checks for one address. The changes can therefore be applied either now or at the cutover. Applying them at the cutover keeps every change to the source in one window, although applying them now causes no interruption either.

On mailcow, the Dovecot change is applied by restarting the `dovecot-mailcow` container.

## Rollback

None of these changes diverts traffic or refuses a connection, so abandoning the migration before the cutover requires no action.

After the cutover, the source returns to standalone operation when the public hostname is repointed to it and the proxy is stopped. No restart is needed, because the source never stopped accepting direct connections.

The settings are harmless to keep once the proxy is gone, because no traffic arrives from the proxy's address. To restore the original configuration anyway, remove the following, then reload both servers:

- From Dovecot: `login_trusted_networks` and the master user `passdb`
- From Postfix: `smtpd_authorized_xclient_hosts`, the new deployment's address, and any `relayhost`
