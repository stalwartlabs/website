---
sidebar_position: 7
title: "Security"
description: "Protect Stalwart Keep with mutual TLS using raw public keys or a certificate authority, manage the cluster and peer secrets, and isolate the peer network."
---

Keep has two network surfaces, and they are protected differently. The client port serves the Stalwart nodes, and the peer port serves the other members. The `tls` setting selects how connections on both are protected, and it has three modes: `rpk`, the default, `ca` and `off`. Whatever the mode, TLS is version 1.3 only, with no session tickets or 0-RTT.

## Raw public keys

In `rpk` mode, each side presents a bare public key instead of a certificate, and accepts the other side only if that key is on its list. The mode needs no certificate authority and has no expiry to manage, so it is the simplest secure choice. [Create keys and secrets](/docs/cluster/keep/setup#create-keys-and-secrets) gives the commands.

A member uses three files: its private key in `tls-key`, the list of client public keys in `tls-clients`, and, in a cluster, the list of member public keys in `tls-servers`. The two lists are separate, so that a Stalwart node's key cannot pose as a member. Adding a Stalwart node therefore means adding its public key to `clients.pem` on every member and restarting them, because Keep reads its files only at startup.

## Certificate authority

In `ca` mode, members and clients present certificates that lead to a shared authority. This mode suits organisations that already issue certificates, or that want to add Stalwart nodes without touching the members.

A cluster uses two levels of authority. A cluster CA is the root that clients are verified against, and a member CA under it issues only member certificates. Members verify each other against the member CA, so a certificate issued to a client node cannot pose as a member. Passing the cluster CA as `tls-peer-ca` also works, but then any certificate from it completes TLS on the peer port, and member identity rests on the peer secret alone.

Each member certificate needs two kinds of subject alternative name, because it serves both ports: the client address that the nodes connect to, as a name or IP address, and the peer IP address as an IP SAN. It also needs both the `serverAuth` and `clientAuth` extended key usages, because a member also dials other members. The following commands create the two authorities and one member certificate:

```bash
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -days 3650 \
  -subj /CN=keep-cluster-ca \
  -addext basicConstraints=critical,CA:TRUE \
  -addext keyUsage=critical,keyCertSign,cRLSign \
  -keyout ca.key -out ca.pem

openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -subj /CN=keep-members -keyout members.key -out members.csr
openssl x509 -req -in members.csr -CA ca.pem -CAkey ca.key -days 3650 \
  -extfile <(printf 'basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign') \
  -out members.pem

openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes \
  -subj /CN=keep-1 -keyout keep-1.key -out keep-1.csr
openssl x509 -req -in keep-1.csr -CA members.pem -CAkey members.key -days 825 \
  -extfile <(printf 'subjectAltName=DNS:keep-1.example,IP:10.0.0.1\nextendedKeyUsage=serverAuth,clientAuth') \
  -out keep-1.pem
cat keep-1.pem members.pem > keep-1-chain.pem
```

The following settings use these files on a member:

```toml
tls = "ca"
tls-cert = "/etc/keep/keep-1-chain.pem"
tls-key = "/etc/keep/keep-1.key"
tls-ca = "/etc/keep/ca.pem"
tls-peer-ca = "/etc/keep/members.pem"
```

On the Stalwart side, the `Authority` variant of the store's [`tls`](/docs/ref/object/in-memory-store#keeptls) field takes the matching files, and `serverName` overrides the name that member certificates must carry.

## Plaintext mode

In `off` mode, connections are not encrypted, and clients authenticate with a challenge based on the cluster secret. The secret itself never crosses the wire, but traffic can be read and hijacked after authentication by anyone on the network path. This mode is for networks where that is acceptable, such as a single host or an isolated private network. On Stalwart's mix of small requests, TLS costs 4 to 10% of throughput, so it is rarely worth turning off for performance. The cost grows with value size.

## Cluster and peer secrets

Keep uses two secrets, each of 32 hexadecimal digits, and the difference between them is a matter of who holds them.

The cluster secret is shared with clients. It is the key of the hash that places keys on members and shards, which lets a client send each request straight to the right place, and it authenticates clients in plaintext mode. It is required in every mode, in `secret-file`, or in the `KEEP_SECRET` environment variable.

The peer secret is held only by members. It authenticates heartbeats and the peer handshake, so a client cannot forge them. It goes in `peer-secret-file`, or in the `KEEP_PEER_SECRET` environment variable, and it must be different from the cluster secret. Each cluster needs its own peer secret, because two clusters that share one, and have node ids in common, accept each other's heartbeats.

Secrets belong in files or in those variables, never in the configuration file itself. Keep leaves secrets out of its parse errors, so a secret written into the file by mistake is not logged.

## Peer network isolation

The peer port must be reachable only from the other members, through a private network or a firewall. This is a requirement of Keep's guarantees, for a specific reason. Heartbeats are authenticated, but a heartbeat recorded from a member that was later removed from the list cannot be told apart from a live one. About five such packets per second, sent from anywhere that can reach the port, keep a cluster down. Keep has no way to rotate the peer secret, so removing a member does not invalidate what that member knew. The only way to replace the peer secret, for example after removing a compromised member, is to stop every member, replace the secret and start them again. Members with different peer secrets cannot hear each other, so a rolling change does not work. The restart loses every key, and in the default `rejoin` mode the [lock quarantine](/docs/cluster/keep/operations#lock-quarantine) refuses new locks on absent keys, while other reads and writes work. A compromised member also held the cluster secret, so replace that too, and update and restart every Stalwart node. If every client restarts at the same time, the cluster can start in `bootstrap` mode, which skips the quarantine. `bootstrap` must not be used while any client may still hold a lock.

The client port should be restricted too, to the Stalwart nodes. Every unauthenticated connection costs a full TLS handshake on a shard thread before Keep can refuse it, at about 82 microseconds of CPU. A connection that has not authenticated within 10 seconds is closed.

The following nftables table applies both restrictions to IPv4. The addresses are placeholders for the Stalwart node network and the three members. A client on the same host, such as a local health check, needs `127.0.0.1` added to the first set, because the rule otherwise drops loopback traffic too:

```text
table inet keep {
  chain input {
    type filter hook input priority filter; policy accept;
    tcp dport 7000 ip saddr != { 10.0.0.0/24 } drop
    tcp dport 7100 ip saddr != { 10.0.0.1, 10.0.0.2, 10.0.0.3 } drop
    udp dport 7100 ip saddr != { 10.0.0.1, 10.0.0.2, 10.0.0.3 } drop
  }
}
```

In Kubernetes, the members use `hostNetwork`, and most CNIs ignore NetworkPolicy for such pods, so this restriction needs a host or cloud firewall. See [Kubernetes](/docs/cluster/keep/kubernetes).
