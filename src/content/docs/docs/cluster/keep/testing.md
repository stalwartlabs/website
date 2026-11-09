---
sidebar_position: 12
title: "Testing"
description: "How Stalwart Keep is tested against its written guarantees under faults, what the Jepsen suite checks, and how to run it on Azure."
---

Keep hands out locks that nodes rely on while servers crash, restart, pause and lose touch with each other, and a test on a healthy network says little about that. Most of its testing therefore breaks things on purpose, then checks what clients saw against the written [guarantees](/docs/cluster/keep/guarantees). A failed check of a claim counts as a product bug.

## Test levels

Testing runs on x86_64 and aarch64, in plaintext and with TLS, and it has several levels:

- About 950 unit and integration tests cover the code, the wire format, startup refusals and client behaviour.
- A cluster simulator runs the real cluster code on a simulated network and clock, through crashes, restarts, partitions, packet loss, pauses and member changes. It runs thousands of seeded histories across 11 suites, plus about 14,000 randomised fault schedules, and checks every history.
- A fault suite runs real `keep` processes behind a fault-injecting proxy, through about 40 cases of kills, freezes, partitions, clock faults and member changes.
- Over 200 deliberately injected bugs check that the suites above catch what they should.
- Jepsen tests a real cluster on separate machines, as described next.

## Jepsen

[Jepsen](https://jepsen.io) is an open-source framework for testing distributed systems under faults, and it is the tool behind most published analyses of databases and coordination services. A control node drives clients against a cluster while a component called the nemesis injects faults. Jepsen records every operation with its start and end time, then checks the whole history against a consistency model.

Keep's Jepsen suite runs a five-member cluster on separate VMs, in about 35 runs of 5 to 15 minutes of faults each, on x86_64 and aarch64 in plaintext and on x86_64 with mutual TLS, and with clients that route to shards and clients that do not. Stalwart Labs wrote this suite and runs it with the Jepsen framework. It is not an analysis performed by the Jepsen project. The workloads and scripts are public, so that anyone can repeat it.

The workloads check the following properties:

| Workload | Property checked |
|---|---|
| `register` | Reads and writes of one key are linearizable, checked with Jepsen's Knossos checker |
| `register-failover` | Reads stay valid while slots move between members |
| `counter` | Increments are neither lost nor applied twice |
| `lock` | No two clients hold one lock at the same time |
| `lease` | The same property for the acquire, renew and release pattern |
| `readback` | Acknowledged writes on surviving members are not lost across heal and restart cycles |

The nemeses can be combined, and they inject the following faults:

| Nemesis | Fault |
|---|---|
| `kill` | `kill -9` of servers, restarted in the default `rejoin` mode |
| `pause` | `SIGSTOP` and `SIGCONT` |
| `partition` | Majority and minority partitions |
| `bridge` | A member that sees both sides of a partition |
| `one-way` | A one-way partition |
| `packet` | Packet loss, delay and reordering |
| `clock` | Clock steps and slews |
| `leave` | A member that leaves and rejoins |
| `heal-restart` | Heal and restart cycles, used alone with `readback` |

## Run Jepsen

The suite runs on Azure from an operator machine with a checkout of the Keep repository. It needs an Azure subscription, the `az` command-line tool signed in with `az login`, and `bash`, `jq`, `ssh`, `rsync`, `python3` and `git`. The scripts generate their own SSH key, and no credentials are stored in the repository. VMs cost money while they run, so the last step of this procedure matters.

To create the cluster and start a series:

1. Clone the repository:

   ```bash
   git clone https://github.com/stalwartlabs/keep.git
   cd keep
   ```

2. Create one control node and five database nodes on Debian 13. Here, `jp1` is the name of the run and `swedencentral` is the Azure region:

   ```bash
   harness/infra/azure/up.sh harness/infra/topologies/jepsen.json --run jp1 --location main=swedencentral
   ```

3. Prepare the machines. The first command installs a JDK and Leiningen on the control node and sets up root SSH from it to the database nodes. The second builds `keep` and the Jepsen client proxy from the checkout and installs them on every node. The third copies the Jepsen project across, checks SSH and resets the control node's clock rate, because the checker takes its timestamps there:

   ```bash
   harness/setup.sh harness/work/jp1/hosts.json
   harness/build.sh harness/work/jp1/hosts.json jepsen
   harness/jepsen/jepsen.sh harness/work/jp1/hosts.json install
   ```

4. Run a series:

   ```bash
   harness/jepsen/jepsen.sh harness/work/jp1/hosts.json series core
   ```

The following series are available, each with its own client route and TLS mode:

- `core`: locks, registers, failover reads and counters under kill, pause, partition, clock and leave faults.
- `network`: one-way cuts, packet faults, bridges and wide targets.
- `lease`: the lease workload.
- `readback`: readback under heal and restart cycles.
- `tls`: mutual TLS with raw public keys.
- `arm`: the subset for an arm64 cluster, which needs a copy of the topology with arm64 VM sizes.
- `smoke`: one lock run with kills for 60 seconds, which is the quickest way to check the setup.

Each run takes its time limit plus a few minutes of setup and analysis, so the x86_64 series together take several hours. Any run can also be named alone, and `series.sh -h` explains the names, such as `lock-kill-pause-partition-clock-unrouted`. For a custom workload and nemesis, run `harness/jepsen/run.sh` in `/root/jepsen` on the control node as root, with `KEEP_TLS=rpk` for mutual TLS and `KEEP_ROUTE=none` for the unrouted client. Without arguments, it prints its options, such as `--nemesis-interval`, `--rate` and `--recovery`.

## Read Jepsen results

The following command copies every run to `harness/work/jp1/results/jepsen/`, in one directory per run:

```bash
harness/jepsen/jepsen.sh harness/work/jp1/hosts.json fetch
```

Each directory holds Jepsen's store with the history, the checker's verdict and latency plots, the server and proxy logs, and `args.txt` with the run's options.

A run passes when Jepsen reports `:valid? true`. For a lock or lease run, the `:keep-check` entry of its results reports the mutual exclusion check, which must read `0 violations`.

## Remove the cluster

The following commands restart the control node's clock service and delete the VMs, so that they stop costing money:

```bash
harness/jepsen/jepsen.sh harness/work/jp1/hosts.json finish
harness/infra/azure/down.sh harness/infra/topologies/jepsen.json --run jp1
```
