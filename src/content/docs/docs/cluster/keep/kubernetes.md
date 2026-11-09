---
sidebar_position: 10
title: "Kubernetes"
description: "Run a Stalwart Keep cluster on Kubernetes as a StatefulSet: host networking, CPU budget, termination grace, readiness probes and an example manifest."
---

Keep runs on Kubernetes as a StatefulSet, but two of its properties shape the deployment. Its member list holds fixed IP addresses, and its performance depends on the CPU budget being known and respected. There is no Helm chart or operator, so this page gives the rules and a manifest to adapt.

## Member addresses

The `members` setting takes IP literals, and every member and client resolves placement from that list. A restarted pod must therefore return with the same address, which plain pod IPs do not do. Resolving names only at startup would not help, because peers that resolved the old address would never reach the restarted pod.

Two arrangements work: `hostNetwork: true` with each pod pinned to its node, so that the list holds node IPs, or a CNI that offers static pod IPs. The example below uses host networking, and pins each ordinal to its node through a small local volume. A local PersistentVolume carries node affinity, so pod `keep-i` always returns to the node whose address is entry `i` of the list. Node affinity alone cannot pin each ordinal from one template.

Under `hostNetwork`, a pod's hostname is that of its node. The node id therefore comes from the pod name, which the downward API provides.

## CPU budget

Keep runs one shard per CPU in its budget, the smaller of the cpuset and the cgroup `cpu.max` quota, and never the output of `nproc`. Each shard count in `members` must match that member's CPU limit. A changed CPU limit therefore needs a [member-list change](/docs/cluster/keep/operations#member-list-changes), never only a new limit.

Guaranteed QoS, with requests equal to limits, gives the shards exclusive cores. Burstable pods with a CPU limit are also supported when the shard count comes from `cpu.max`, and unpinned shards sized to the quota cost 3 to 4% of throughput at saturation. Without exclusive cores, keep the CPU weight at least 100 times that of any neighbour, because an equal-weight spinning neighbour multiplied the 99th percentile latency 44 times in testing.

## Termination

A pod that receives SIGTERM freezes its shards for up to 1 second, then hands over its keys for up to 11 seconds. `terminationGracePeriodSeconds` must be at least 16, or Kubernetes kills the member during the handoff, and the keys it had not handed over are lost.

## Readiness probes

The correct probe depends on the kind of change in progress.

For a rolling restart with the same member list, the probe tests the `ready-file`, which exists only while the member is [settled](/docs/cluster/keep/setup#readiness). A StatefulSet rolling update waits for the updated pod to become Ready, so a Ready set of pods means a settled cluster. `minReadySeconds: 1` covers the moment after a member dies, when its peers still report themselves settled for about 225 milliseconds.

For a member-list change, the probe must be a TCP check on port 7000 instead. The first members restarted with a new list stay fenced until a majority of the new list runs, so they cannot become settled, and a `ready-file` probe would block the rollout forever.

## Pod management

A member starts fenced, and it cannot settle until a majority of the list runs. With the `OrderedReady` policy, the first pod would never become Ready, and the StatefulSet would never create the next one. The same would happen after a full outage. The StatefulSet therefore uses the `Parallel` policy, which applies only to scaling, so rolling updates still go one pod at a time.

## Example StatefulSet

The following manifest applies these rules to three members with four CPUs each. It is a starting point and has not been run as written: node IPs, the memory limit, the image tag and the storage class are placeholders.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: keep-config-1
immutable: true
data:
  keep.toml: |
    members = [
      "1@NODE_IP_0:7000/7100/4",
      "2@NODE_IP_1:7000/7100/4",
      "3@NODE_IP_2:7000/7100/4",
    ]
    secret-file = "/secrets/cluster"
    peer-secret-file = "/secrets/peer"
    tls-clients = "/secrets/clients.pem"
    tls-servers = "/secrets/servers.pem"
    stats-interval = 1
    ready-file = "/run/keep/settled"
    memory = MEMORY_CAP_BYTES
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: keep
spec:
  serviceName: keep
  replicas: 3
  podManagementPolicy: Parallel
  updateStrategy:
    type: RollingUpdate
  minReadySeconds: 1
  selector:
    matchLabels:
      app: keep
  template:
    metadata:
      labels:
        app: keep
    spec:
      hostNetwork: true
      dnsPolicy: ClusterFirstWithHostNet
      enableServiceLinks: false
      terminationGracePeriodSeconds: 16
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels:
                  app: keep
              topologyKey: kubernetes.io/hostname
      containers:
        - name: keep
          image: stalwartlabs/keep:TAG
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef: {fieldPath: metadata.name}
            - name: KEEP_CONFIG
              value: /etc/keep/keep.toml
          command: ["/bin/sh", "-c"]
          args:
            - >-
              exec keep
              --node $(( ${POD_NAME##*-} + 1 ))
              --tls-key /secrets/keep-${POD_NAME##*-}.key
          resources:
            requests: {cpu: "4", memory: MEMORY}
            limits: {cpu: "4", memory: MEMORY}
          readinessProbe:
            exec:
              command: ["test", "-e", "/run/keep/settled"]
            periodSeconds: 1
          volumeMounts:
            - {name: pin, mountPath: /var/lib/keep-pin}
            - {name: run, mountPath: /run/keep}
            - {name: secrets, mountPath: /secrets, readOnly: true}
            - {name: config, mountPath: /etc/keep, readOnly: true}
      volumes:
        - name: config
          configMap: {name: keep-config-1}
        - name: run
          emptyDir: {medium: Memory}
        - name: secrets
          secret: {secretName: keep-secrets}
  volumeClaimTemplates:
    - metadata:
        name: pin
      spec:
        storageClassName: LOCAL_STORAGE_CLASS
        accessModes: [ReadWriteOnce]
        resources:
          requests: {storage: 1Mi}
```

The manifest relies on the following resources and choices:

- Create the three local PersistentVolumes before the StatefulSet, one per node, each with a `claimRef` to `pin-keep-i`, so that each ordinal binds to the node whose address is its entry in the list. An unbound local volume is chosen at first scheduling, and could swap two ordinals.
- `memory` must sit below the container's memory limit, with a margin for connection buffers. A member that reaches the limit is killed, which loses its keys as a crash does, while a member at its cap only evicts entries.
- The Secret `keep-secrets` holds `cluster`, `peer`, `servers.pem`, `clients.pem`, and each member's private key as `keep-0.key` to `keep-2.key`. One Secret mounted into every pod places every member's private key on every member node. Keeping each key only on its own node needs a per-pod source, such as an init container that fetches it from a secret store.
- `enableServiceLinks: false` keeps Kubernetes from setting service variables such as `KEEP_PORT` in the pod. Keep ignores variables that match no flag, and this ensures that none can collide with a setting.
- The ConfigMap is immutable and versioned, because Keep reads the file only at start. An edited ConfigMap would otherwise reach each pod at its next restart, planned or not. A change creates `keep-config-2` and points the template at it, which makes it an ordinary rolling update.
- `--start` is left at `rejoin`, because `bootstrap` must never appear in a template that restarts pods. The first start of the cluster therefore refuses new locks for the [lock quarantine](/docs/cluster/keep/operations#lock-quarantine), about ten minutes.

## Peer port firewall

The peer port must be [reachable only from members](/docs/cluster/keep/security#peer-network-isolation). Kubernetes leaves NetworkPolicy for `hostNetwork` pods undefined, and most CNIs ignore it, so this needs a host or cloud firewall that admits port 7100, on both UDP and TCP, only from the member node IPs.
