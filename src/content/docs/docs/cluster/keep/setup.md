---
sidebar_position: 5
title: "Cluster setup"
description: "Create the keys and secrets for Stalwart Keep, configure a single server or a cluster of members, start it for the first time and check that it is ready."
---

A Keep deployment is either a single server or a cluster of members with a fixed list. A single server is enough for a test system or for a deployment that accepts the outage when that server stops. A cluster keeps serving when a member fails, and it is the normal choice for production.

This page assumes that Keep is [installed](/docs/cluster/keep/installation), and that its configuration lives in `/etc/keep`.

## Number of members

A member that cannot hear a majority of the member list stops serving, which prevents the minority side of a network partition from serving locks it may have lost. A cluster therefore survives the loss of a minority of its members. Three members tolerate the loss of one, and five tolerate the loss of two. Two members tolerate nothing, because the survivor is not a majority. Clusters of up to five members have been tested.

A member that is lost takes its keys with it, so more members also mean that a failure loses a smaller share of the keys.

## Create keys and secrets

By default, Keep uses mutual TLS 1.3 with raw public keys: each side holds a private key, and each side has a list of the public keys it accepts. There are no certificates to issue or renew. [Security](/docs/cluster/keep/security) describes this mode, the certificate authority alternative, and plaintext mode.

Each member needs its own key pair, and each Stalwart node needs one as well. Only root can write to `/etc/keep`, so the commands in this section run in that directory from a root shell. The following commands create the key pair of a member and of a node:

```bash
openssl genpkey -algorithm ed25519 -out keep.key
openssl pkey -in keep.key -pubout -out keep.pub
openssl genpkey -algorithm ed25519 -out node.key
openssl pkey -in node.key -pubout -out node.pub
```

The public keys are then combined into two lists, by concatenating the files:

- `servers.pem` holds the public key of every member. Every member gets the same file, and it must include that member's own key. The Stalwart nodes receive it too, so that they can verify the members.
- `clients.pem` holds the public key of every Stalwart node. Keeping the two lists apart means that a node's key cannot pose as a member.

Two shared secrets complete the set, each of 32 hexadecimal digits. The cluster secret is shared with the clients, and it decides where keys are placed. The peer secret authenticates members to each other, and it stays on the members. The two must be different. The following commands create them once, and the resulting files are then copied to every member:

```bash
openssl rand -hex 16 > cluster.secret
openssl rand -hex 16 > peer.secret
```

Finally, restrict the private files so that only the `keep` account can read them:

```bash
chown root:keep keep.key cluster.secret peer.secret
chmod 0640 keep.key cluster.secret peer.secret
```

`node.key` belongs on the Stalwart node, and it does not need to stay on the member.

## Configure a single server

Settings live in a TOML file, in which each key is the name of a command-line flag. The following file, as `/etc/keep/keep.toml`, configures a single server:

```toml
listen = "0.0.0.0:7000"
secret-file = "/etc/keep/cluster.secret"
tls-key = "/etc/keep/keep.key"
tls-clients = "/etc/keep/clients.pem"
ready-file = "/run/keep/settled"
```

A single server has no peer port, so it does not use a peer secret or the `tls-servers` setting. The Stalwart nodes still need its public key as their list of servers, so `servers.pem` for them holds that one key.

## Configure a cluster

Every member receives the same member list, cluster secret and peer secret, and its own node id. The following file configures the first member of a three-member cluster, in which each member has four CPUs:

```toml
node = 1
members = [
  "1@10.0.0.1:7000/7100/4",
  "2@10.0.0.2:7000/7100/4",
  "3@10.0.0.3:7000/7100/4",
]
secret-file = "/etc/keep/cluster.secret"
peer-secret-file = "/etc/keep/peer.secret"
tls-key = "/etc/keep/keep.key"
tls-clients = "/etc/keep/clients.pem"
tls-servers = "/etc/keep/servers.pem"
ready-file = "/run/keep/settled"
stats-interval = 10
```

Each entry of the list has the form `node@client_address/peer_port/shards`. The node id is any non-zero number, the client address is what the Stalwart nodes connect to, and the peer port serves both UDP heartbeats and TCP handoff. A shard is the unit of work in Keep, with one thread per CPU, so the last field is the number of CPUs the member has for Keep. [Architecture](/docs/cluster/keep/architecture#thread-per-core-shards) explains shards, and [CPU placement](/docs/cluster/keep/tuning#cpu-placement) explains how to size them.

Addresses must be IP addresses. Every server and every client computes where a key belongs from this list, which is why it must be identical everywhere. Only the `node` setting differs between the files of the members.

The [Configuration reference](/docs/cluster/keep/reference) lists every setting.

## First start

A new server starts in one of two modes, and the difference matters for locks. In the default mode, `rejoin`, the server assumes that clients may still be holding locks granted by an earlier run. It therefore refuses new locks on its keys for the [lock quarantine](/docs/cluster/keep/operations#lock-quarantine), about ten minutes. In `bootstrap` mode, the server assumes that no such locks exist, and it grants locks at once.

`bootstrap` is therefore correct only when no client can hold a lock from an earlier run: the very first start of a cluster, or a restart together with every client. Everything else is a `rejoin`. Starting in `rejoin` is always safe, and its only cost is the wait. In a Stalwart cluster, that wait delays outbound delivery, tasks and search indexing, all of which need locks.

Under the [systemd unit](/docs/cluster/keep/installation#run-under-systemd), the following commands pass `bootstrap` for one start only, through the service manager's environment. Run them on all members as close together as possible:

```bash
sudo systemctl set-environment KEEP_START=bootstrap
sudo systemctl start keep
sudo systemctl unset-environment KEEP_START
```

Clearing the variable straight away means that any later restart of the service uses the default `rejoin`. `bootstrap` skips the quarantine only for keys placed while every member is up. A member that starts late is declared dead after 225 milliseconds, and the keys that then move still wait out the quarantine, so a slow start costs a partial wait and nothing worse.

For a Docker container, start the first container with `--start bootstrap` appended to the arguments, and recreate it without the flag at the next planned restart. Recreating it is a `rejoin` restart, which quarantines that member's keys.

Later starts need no special handling:

```bash
sudo systemctl start keep
```

## Readiness

A cluster member is settled when every live member places every other live member, and no keys are waiting to move. The `ready-file` setting makes this state visible: Keep creates the file while the member is settled, and removes it otherwise. A single server creates the file once it listens.

The following command checks a member, and is the same check that a readiness probe performs:

```bash
test -e /run/keep/settled && echo settled
```

A restarted member waits at least 1.25 seconds before it can settle. A cluster member starts fenced, so it cannot settle until it hears a majority of the list, and the file does not appear on the first member until enough of the others are running. Stalwart should connect only after Keep is reachable, as described in [Startup order](/docs/cluster/keep/stalwart#startup-order).

On startup, the log shows the settings in use, in lines of the following form:

```text
keep: listening on 0.0.0.0:7000 (advertised 10.0.0.1:7000), node 1, 4 shards on cpus [0, 1, 2, 3], pinned true, steering Hash, rto_min true, user_timeout true, cap None
keep: cluster member of 3 servers, start Rejoin, incarnation 1793953200
```

## Startup errors

Keep refuses to start on an invalid configuration and names the setting. A syntax error, an unknown key or an invalid value exits with status 2, which stops the systemd unit. Settings that do not fit together, and TLS and secret problems, exit with status 1, so the unit keeps restarting every 5 seconds while `systemctl start` reports success. Check `journalctl -u keep` when a member does not appear. The following errors are the ones most often met when setting up a cluster:

- `this server's member entry lists 4 shards for 2 CPUs`: the shard count in `members` does not fit the CPUs available to the server. Correct the entry on every member, or give the server more CPUs.
- `node 4 is not in --members`, or `a cluster member needs --node`: the `node` setting is wrong or absent.
- `the peer secret must differ from the cluster secret`: the same file was used for both.
- `TLS: --tls-servers /etc/keep/servers.pem: does not list this server's own key, so every peer would refuse it`: the member's public key is missing from `servers.pem`.
- `--tls rpk needs --tls-key (--tls off serves plaintext)`: the default TLS mode was left active with no key configured.
- `--tls-servers does not apply to --tls rpk on a single server`: the setting belongs only to cluster members, and Keep refuses settings the mode does not use.
- ``config file /etc/keep/keep.toml: unknown key `membrs` ``: a misspelled key.

A key or secret file that the `keep` account cannot read produces an error that names the file and the operating system error.
