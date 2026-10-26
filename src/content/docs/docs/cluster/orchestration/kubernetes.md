---
sidebar_position: 2
title: "Kubernetes"
description: "Deploy Stalwart on Kubernetes with a Helm chart: config.json handling, probes, clustered layouts, Pod Security Standards, bootstrapping and upgrades."
---

Stalwart runs on Kubernetes from a Helm chart. The chart installs the server as a StatefulSet, and exposes the mail listeners (SMTP, submission, IMAP, POP3, ManageSieve) and the HTTP listeners through a Service. It also provisions a persistent volume for the data directory.

The StatefulSet is chosen over a Deployment for two of its guarantees. Each pod gets a stable hostname, from which the pod's [node identifier](/docs/cluster/configuration/node-id) is derived. Each pod also gets its own PersistentVolumeClaim, which the default single-node [DataStore](/docs/ref/object/data-store) (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->), RocksDB, needs.

The complete chart is on the [Kubernetes chart reference](/docs/cluster/orchestration/kubernetes-chart) page. It can be committed to a chart repository, packaged and installed with `helm install`, or used as the starting point of a site-specific chart. This page explains the decisions the chart embodies, and how to adapt it.

## Liveness and readiness endpoints

Kubernetes uses probes to check that containers are running and ready to serve traffic, and Stalwart answers two HTTP endpoints for this purpose. The liveness endpoint is `/healthz/live`, and a failing liveness probe causes the container to be restarted. The readiness endpoint is `/healthz/ready`, and a failing readiness probe removes the pod from the Service endpoints until it recovers. The readiness endpoint returns `503` while the node has no data store open.

Both endpoints are wired into the StatefulSet template of the chart, against the plain HTTP listener on port 8080. [Load balancing](/docs/cluster/configuration/load-balancing#health-checks) describes them in detail.

## `config.json` handling

At startup, the server reads a single small JSON file. It contains only the [DataStore](/docs/ref/object/data-store) variant, which tells the server where its database lives. The chart renders the value of `.Values.config` into a ConfigMap key called `config.json`, mounts it as a file at `/etc/stalwart/config.json`, and starts the container with `--config /etc/stalwart/config.json`.

This is the same flag that the Docker install and the native Linux packages use, so `helm upgrade` does not change the runtime contract. Between a single-node RocksDB install and an externally backed cluster, only the DataStore value changes.

For an external DataStore, such as PostgreSQL, change `.Values.config` accordingly and set `persistence.enabled: false`. The [PostgreSql](/docs/ref/object/data-store) variant reads the connection password from an [`authSecret`](/docs/ref/object/data-store#authsecret) nested object. In the following values, its `EnvironmentVariable` form reads the password from a chart-managed Secret:

```yaml
config:
  "@type": "PostgreSql"
  host: postgres.db.svc.cluster.local
  port: 5432
  database: stalwart
  authUsername: stalwart
  authSecret:
    "@type": "EnvironmentVariable"
    variableName: STALWART_DB_PASSWORD
persistence:
  enabled: false
extraSecretEnv:
  STALWART_DB_PASSWORD: "s3cr3t"
```

## Environment variables

Every `STALWART_*` variable that the server recognises is documented on the [environment variables](/docs/configuration/environment-variables) page. The chart surfaces the following ones as values:

| Variable | Values key | Notes |
| --- | --- | --- |
| `STALWART_ROLE` | `role` | Names the [ClusterRole](/docs/ref/object/cluster-role) (found in the WebUI under <!-- breadcrumb:ClusterRole --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Roles<!-- /breadcrumb:ClusterRole -->) the pod adopts. |
| `STALWART_PUSH_SHARD` | `pushShard` | Push notification shard for pods whose role delivers push. |
| `STALWART_RECOVERY_MODE` | `recoveryMode.enabled` | Starts the pod in recovery mode. |
| `STALWART_RECOVERY_MODE_PORT` | `recoveryMode.port` | Port the recovery listener binds to. Defaults to `8080`. |
| `STALWART_RECOVERY_MODE_LOG_LEVEL` | `recoveryMode.logLevel` | Log verbosity while in recovery or bootstrap mode. |
| `STALWART_RECOVERY_ADMIN` | `recoveryAdmin.username` + `recoveryAdmin.password` | Rendered into the managed Secret as `username:password`. |

Other variables that the runtime reads, such as database passwords and S3 credentials, can be injected as well. Plain values go in `extraEnv`, and sensitive values in `extraSecretEnv`. Both are surfaced through the same Secret-backed `envFrom` on the StatefulSet.

## Clustered deployment

A single-node install leaves `role` empty and keeps `replicaCount: 1`, so its one pod runs every task and listener. Raising `replicaCount` alone does not create a cluster. With the default RocksDB data store on per-pod volumes, each pod would be an independent server with its own data. A clustered deployment therefore requires the following components before it is scaled:

- A shared data store, such as PostgreSQL, set in `.Values.config`. `persistence.enabled` can then be `false`.
- A shared blob store and search store, for example S3 and the shared data store.
- A Redis-based in-memory store.
- A coordinator.

The [cluster overview](/docs/cluster/#cluster-requirements) lists these components. The data store is set in `config.json`, and the others are set through the WebUI or the CLI once the first pod is running, as described below.

### Configuring the shared services

The in-memory store and the [Coordinator](/docs/ref/object/coordinator) (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->) are kept in the database, not in `config.json`. They can therefore be configured only after installation, in the following order:

1. Install the chart with `replicaCount: 1` and the shared data store in `.Values.config`.
2. Sign in to the first pod with the recovery administrator (`recoveryAdmin.enabled: true`, see [Bootstrapping](#bootstrapping)) and set the blob store, the search store and a Redis [in-memory store](/docs/storage/in-memory).
3. Set the Coordinator. The registry refuses a coordinator while the in-memory store is still the local default, so this step must follow the previous one, as described in [Coordination mechanism](/docs/cluster/configuration/coordination#order-of-configuration).
4. Restart the pod so that the new stores take effect, then raise `replicaCount` and run `helm upgrade`. The new pods read the same configuration from the shared data store.

### One role per release

Every pod of a StatefulSet receives the same `STALWART_ROLE` and `STALWART_PUSH_SHARD`. When all pods run the same role, a single release with a higher `replicaCount` is enough. Different roles need different StatefulSets, so the chart is installed once per role, with a values file for each:

```sh
helm install stalwart-access ./stalwart -f values-access.yaml
helm install stalwart-transfer ./stalwart -f values-transfer.yaml
helm install stalwart-background ./stalwart -f values-background.yaml
```

Each release produces its own StatefulSet with its own `role`, and all of them share the same data store and coordinator. The roles themselves are [ClusterRole](/docs/ref/object/cluster-role) objects, described with an example layout in [Planning node roles](/docs/cluster/configuration/roles#planning-node-roles).

Push notification delivery is sharded in the same way. Set [`pushShardsTotal`](/docs/ref/object/jmap#pushshardstotal) on the Jmap object to the number of shards, and install one release per shard, with `pushShard` set to `1`, `2` and so on up to that number. Shards are numbered from 1. Without `pushShardsTotal`, the setting has no effect. [Push notification sharding](/docs/cluster/configuration/roles#push-notification-sharding) describes the sharding model.

### Resources

The chart leaves `resources` empty. Memory requests and limits should follow the memory that the node is configured to use, and [Sizing memory](/docs/performance/memory) explains how to estimate it. RocksDB sizes its block cache from the container's memory limit when one is set.

## Restricted Pod Security Standards

Kubernetes Pod Security Standards define profiles of increasingly strict rules for what a pod may do. The defaults shown in `values.yaml` produce a pod compatible with the [baseline](https://kubernetes.io/docs/concepts/security/pod-security-standards/) Pod Security Standard. The stricter `restricted` profile is enforced by `pod-security.kubernetes.io/enforce: restricted` on the namespace, or by the equivalent Security Context Constraints on OpenShift. It additionally requires `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, `seccompProfile.type: RuntimeDefault`, and `capabilities.drop: [ALL]`.

One detail of the Stalwart image matters under this profile. The image must let the non-root `stalwart` user (UID 2000) bind to the privileged mail ports (`25`, `110`, `143`, `443`, `465`, `587`, `993`, `995`), so its Dockerfile runs `setcap cap_net_bind_service=+ep /usr/local/bin/stalwart`. This gives the binary a file capability. When the kernel `execve`s a binary with effective file capabilities, those capabilities must also be present in the calling process's bounding set. `capabilities.drop: [ALL]` empties that set, so the exec is rejected with:

```text
exec /usr/local/bin/stalwart: operation not permitted
```

The restricted profile explicitly permits `NET_BIND_SERVICE` to be re-added through `capabilities.add`, which restores the bounding-set entry that the file capability needs. Set the following in `values.yaml`:

```yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 2000
  runAsGroup: 2000
  fsGroup: 2000
  seccompProfile:
    type: RuntimeDefault

containerSecurityContext:
  runAsNonRoot: true
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop: [ALL]
    add: [NET_BIND_SERVICE]
  seccompProfile:
    type: RuntimeDefault
```

`NET_BIND_SERVICE` can be omitted from `capabilities.add` only when two conditions both hold. Every configured listener must bind to a port `>= 1024`, and the file capability must have been stripped from the binary, either in a custom image without the `setcap` step or by an init container that runs `setcap -r` against a copy of the binary. While the file capability is still set on `/usr/local/bin/stalwart`, the bounding-set check fails, whichever ports the configuration uses.

`readOnlyRootFilesystem: true` has a consequence of its own. Any path that Stalwart writes to outside `/etc/stalwart` and `/var/lib/stalwart` must be backed by a writable volume. A server configured without the setup wizard, as on Kubernetes, has a `Log` tracer writing to `/var/log/stalwart`. That path is outside the writable ones, it is not created in the image, and it is not writable by UID 2000. Mount a writable volume (for example an `emptyDir`) at `/var/log/stalwart`, or replace the tracer with a [console tracer](/docs/telemetry/tracing/tracers#console) so that `kubectl logs` shows the output. Configurations that need scratch space should add an `emptyDir` mount on `/tmp`.

## Bootstrapping

On a plain installation, the first start enters [bootstrap mode](/docs/configuration/bootstrap-mode), which prints a temporary administrator password and serves the setup wizard. Bootstrap mode is triggered only when `config.json` is absent at startup, however, and on Kubernetes the ConfigMap always renders a `config.json`. The chart therefore never enters bootstrap mode: no temporary administrator password is generated, and the setup wizard is not available.

The `.Values.config` default points at a single-node RocksDB data store, so the pod starts with an empty configuration, and the rest of the configuration is provided through the WebUI or the CLI once the pod is running. The only way to sign in to such a new installation is the recovery administrator, which is why `recoveryAdmin.enabled: true` is required on the first install. The installation then proceeds as follows:

1. Install the chart:

   ```sh
   helm install stalwart ./stalwart -f values.yaml
   ```

2. Port-forward the management listener:

   ```sh
   kubectl port-forward svc/stalwart 8080:8080
   ```

3. Open `http://127.0.0.1:8080/admin` and sign in with the credentials from `recoveryAdmin`.

4. Configure the server in the WebUI (domains, listeners and certificates, stores), or apply a plan with `stalwart-cli apply` against the same endpoint, as described in the [CLI documentation](/docs/management/cli/), and create a permanent administrator account.

5. Once a permanent administrator account has been provisioned, remove `recoveryAdmin` from `values.yaml` and run `helm upgrade` to drop the pinned credential. Leaving `STALWART_RECOVERY_ADMIN` set on a production deployment is discouraged, for the reasons given in [recovery mode](/docs/configuration/recovery-mode).

## Upgrading

An upgrade changes `image.tag` in `values.yaml` when needed, and then runs:

```sh
helm upgrade --install stalwart ./stalwart -f values.yaml
```

The StatefulSet replaces the pods one at a time, and each new pod reuses the existing volume, so the data on the volumes is preserved.

Which release an upgrade installs depends on the tag and the pull policy. The chart uses the `v1` tag, which follows the releases of version 1 and does not move to a later major version, matching the [Docker installation](/docs/install/platform/docker#choosing-a-tag). The chart's `image.pullPolicy` is `IfNotPresent`, however, so a node that already holds a `v1` image keeps it. Set the policy to `Always` so that each rollout pulls the latest `v1` release. The [upgrade guide](/docs/install/upgrade) describes what to check before upgrading.

## Troubleshooting

The following problems can occur on Kubernetes. Each entry gives the symptom, its cause and the remedy:

- Container fails to start with `exec /usr/local/bin/stalwart: operation not permitted`: the namespace enforces the `restricted` Pod Security Standard (or an equivalent SCC) and the file capability on the binary is incompatible with `capabilities.drop: [ALL]`. Add `NET_BIND_SERVICE` back to `capabilities.add` in `containerSecurityContext`. See [Restricted Pod Security Standards](#restricted-pod-security-standards).
- No administrator sign-in on first install: the chart never enters bootstrap mode, so no temporary password is printed. Set `recoveryAdmin.enabled: true` in `values.yaml` and redeploy.
- Pod stuck in `CrashLoopBackOff` on a fresh install with RocksDB: check that `persistence.enabled: true` and that the cluster's default StorageClass can provision a `ReadWriteOnce` volume of the requested size. See [persistent storage](/docs/install/store).
- Mail ports unreachable from outside the cluster: `service.type: ClusterIP` only exposes the listeners inside the cluster. Switch to `LoadBalancer`, add a `NodePort`, or front the chart with an L4 load balancer. Review the [security recommendations](/docs/install/security) before exposing SMTP and IMAP publicly.
- TLS errors on the HTTPS listener: Stalwart needs a TLS certificate before mail clients will connect. Configure ACME in the WebUI under Settings › TLS › ACME Providers, or upload an existing certificate under Settings › TLS › Certificates. See [ACME](/docs/server/tls/acme/).
- Cluster nodes do not see each other: verify that a coordinator is configured, that the in-memory store is Redis-based, and that both are reachable from every pod. See [coordination overview](/docs/cluster/coordination/).
- Two nodes acquire the same node id: StatefulSet pods already have stable, unique hostnames, but custom Deployment-based installs must ensure each pod runs with a distinct hostname. See [node id](/docs/cluster/configuration/node-id).
