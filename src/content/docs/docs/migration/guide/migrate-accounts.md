---
sidebar_position: 7
title: "Migrating accounts"
---

With the proxy live and every account still served from the old deployment, accounts are now moved one at a time. Moving an account recreates it on the new server, copies its data across with Vandelay, and then flips its mapping so the proxy routes it to the new server. Everything except the final flip happens while the account continues to be served from the old deployment, so the work is invisible to the account's owner until the moment of the switch, which disconnects any live session and lets it reconnect to the new server automatically. There is no downtime; an account is either served by the old deployment or, after its switch, by the new one.

The procedure below moves a single account and is repeated for each. It is written for an account whose address is `alice@example.org`. The data that has to survive the move is the account's mail, its mailboxes and their structure, its sieve scripts, its contacts and address books, its calendars and events, and its files, all of which Vandelay carries.

## Directing the administrator session

The migration tools authenticate as an administrator and connect to the proxy on the public hostname, exactly as a client would. The proxy therefore routes them by the administrator's login, which means the proxy has to be told which deployment an administrative session should reach. This is done with a single mapping entry for the administrator account, pointed at the old server while data is being read from it and at the new server while data is being written to it.

The proxy's management API sets the entry. The administrator token authorises the call:

```bash
TOKEN=$(cat /etc/proxy/admin.token)
admin_route() {
  curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
    "https://127.0.0.1:9443/mappings?identifier=admin&destination=$1"
}
```

`admin_route old` and `admin_route new` then point the administrative session at the chosen deployment before each tool is run. When the migration of all accounts is complete the entry is removed, which the [finalizing](/docs/migration/guide/finalize/) step covers.

## Recreating the account on the new server

The account is recreated from its definition on the old server, preserving its password so that the owner notices no change in credentials. A small script reads the account from the old server's management API and produces a plan that the command-line interface applies. The script is published in the proxy repository as `resources/migrate_v015_to_plan.py`.

The account is read from the old server, so the administrative session is pointed there first. The script is given the old server's administrator credentials and the identifier of the domain as it exists on the new server, because that domain was already created during the new server's configuration and the plan has to reference it rather than create it again. The domain identifier is read from the new server, then supplied to the script:

```bash
stalwart-cli query Domain --where name=example.org --fields id

admin_route old
python3 migrate_v015_to_plan.py alice \
  --url https://mail.example.org \
  --user admin --password "$OLD_ADMIN_PASSWORD" \
  --existing-domain example.org=<domain-id> \
  --output alice-plan.ndjson
```

The `<domain-id>` is the value the query printed. Supplying it tells the script to reference the existing domain on the new server rather than emit an instruction to create it, which would fail because the domain already exists.

The script writes a plan describing the account: its name, its domain, its password and any aliases it carried. Passwords are copied as stored hashes rather than in clear, so the original password continues to work without ever being known to the migration. The plan is then applied to the new server, which is where the account is created, so the administrative session is pointed there:

```bash
admin_route new
stalwart-cli apply --file alice-plan.ndjson
```

After the account is created its credentials must be made effective immediately, because the server caches the absence of an account it has never seen. Invalidating the caches forces the new account and its password to be recognised on the next authentication attempt:

```bash
stalwart-cli create Action --json '{"@type":"InvalidateCaches"}'
```

Skipping this invalidation is the most common reason a freshly created account appears to reject its correct password, because a stale negative cache entry continues to answer until it expires.

## Copying the account data

The account now exists on the new server but is empty. Vandelay fills it by reading the account from the old server into a local archive and then writing that archive onto the new server. The archive is an ordinary file that holds one account; keeping it until the migration of this account has been validated provides a local copy of everything that was moved.

Reading from the old server is done with the old server's administrator credentials, with the administrative session pointed at the old server. The account is named as it is known on the old server, which for a server that predates e-mail-address logins is the bare account name:

```bash
admin_route old
export VANDELAY_PASSWORD="$OLD_ADMIN_PASSWORD"

vandelay import jmap \
  --url https://mail.example.org \
  --auth-basic admin \
  --account-name alice \
  alice.sqlite
```

This reads the account's mail, mailboxes, sieve scripts, contacts and calendars over JMAP. Files are handled separately. Older Stalwart releases implement an earlier draft of the JMAP file specification that Vandelay's JMAP file transfer does not recognise, so the account's files are read from the old server over WebDAV instead, into the same archive. The WebDAV path addresses the account's file area on the old server:

```bash
vandelay import webdav \
  --url https://mail.example.org/dav/file/alice/ \
  --auth-basic admin \
  alice.sqlite
```

The contents of the archive can be inspected before it is written anywhere, which is a useful confirmation that the expected data was read:

```bash
vandelay inspect alice.sqlite
```

The archive is then written onto the new server. Writing uses the new server's administrator credentials, with the administrative session pointed at the new server, and the account is named as it is known there, which is the full e-mail address:

```bash
admin_route new
export VANDELAY_PASSWORD="$NEW_ADMIN_PASSWORD"

vandelay export \
  --url https://mail.example.org \
  --auth-basic admin \
  --account-name alice@example.org \
  alice.sqlite
```

Vandelay matches the account's standard mailboxes against those the new account already has, so the inbox, sent, drafts and other default folders are reused rather than duplicated, and the messages are placed inside them. Mail, sieve scripts, contacts, calendars and files are all written across. Because Vandelay reconciles rather than blindly inserts, re-running the export after an interruption completes it without creating duplicates.

## Routing the account to the new server

At this point the account exists on both servers: the old copy is intact and the new copy is a faithful reproduction of it. The switch is made by flipping the account's mapping to the new server. Both the e-mail address and, if the old server allowed it, the bare account name are pointed at the new server so that either login form follows. Any live session is then disconnected so that it reconnects through the new mapping:

```bash
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.org&destination=new"
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice&destination=new"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=alice@example.org"
```

From this moment the account is served by the new deployment. Its mail, web client and every protocol follow the same mapping, so a client reconnecting after the disconnection lands on the new server without any reconfiguration. Inbound mail for the account, which was being relayed to the old server, is now recognised by the new server as a local account and delivered locally instead, with no change required.

## Validating the migrated account

Validation confirms that the account works on the new server and that its data arrived intact, and it is done before moving on, because an account is far easier to roll back immediately than after its owner has begun using it on the new server.

Authentication is confirmed by signing in through the proxy with the account's original password, which now reaches the new server. An IMAP session lists the migrated mailboxes and their message counts:

```bash
openssl s_client -quiet -connect mail.example.org:993 <<'EOF'
a1 LOGIN alice@example.org "password"
a2 LIST "" "*"
a3 STATUS INBOX (MESSAGES)
a4 LOGOUT
EOF
```

The other data types are confirmed over JMAP. A session request returns the account's identifier, and method calls against it report the number of e-mails, contacts, calendar events and files, which are compared against what the old account held:

```bash
curl -sk -u 'alice@example.org:password' https://mail.example.org/.well-known/jmap
```

Opening the account in a real mail client and in the web interface, sending a message to it and reading existing mail, is the final confirmation that the migration succeeded for this account. Only then is the next account migrated.

## Login names after migration

Stalwart releases after 0.15 identify accounts by their full e-mail address. An account that signed in to the old server with a bare name continues to work after migration because the new server appends the account's domain to a bare login, turning `alice` into `alice@example.org`, provided a default domain is configured. Pointing both the bare name and the e-mail address at the new server in the mapping, as shown above, keeps either login form working through the proxy. Account owners can be advised to switch to the full e-mail address at their convenience, but nothing forces an immediate change.

## Rollback

An account can be returned to the old server at any time, because the old copy was never removed. The migration only ever copied data, so the old server still holds the account exactly as it was at the moment of the copy.

The immediate rollback reverses the mapping, pointing the account back at the old server and disconnecting its current sessions:

```bash
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice@example.org&destination=old"
curl -sk -X PUT -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/mappings?identifier=alice&destination=old"
curl -sk -X POST -H "Authorization: Bearer $TOKEN" \
  "https://127.0.0.1:9443/connections/kick?identifier=alice@example.org"
```

If the rollback happens immediately after the switch, before the account has received or created anything on the new server, this is all that is required: the old server's copy is complete and current. If the account was active on the new server for a while, any mail or other data that arrived there after the switch exists only on the new server and has to be carried back. This is done by reversing the Vandelay direction, reading the account from the new server and writing it onto the old one, with the administrative session pointed appropriately:

```bash
admin_route new
VANDELAY_PASSWORD="$NEW_ADMIN_PASSWORD" vandelay import jmap \
  --url https://mail.example.org --auth-basic admin \
  --account-name alice@example.org alice-back.sqlite

admin_route old
VANDELAY_PASSWORD="$OLD_ADMIN_PASSWORD" vandelay export \
  --url https://mail.example.org --auth-basic admin \
  --account-name alice alice-back.sqlite
```

Mail, mailboxes, sieve scripts, contacts and calendars are carried back this way. Files are the exception: the old server's earlier JMAP file draft does not accept the files Vandelay writes, so any file created or changed on the new server after the switch cannot be written back automatically and has to be copied by hand over WebDAV from the new server to the old one. For this reason, rolling an account back is simplest when done promptly, before significant new data accumulates on the new server. Once the account is serving from the old deployment again and its recent data has been carried back, the new copy can be left in place for a later retry or removed.
