---
sidebar_position: 2
title: "Kubernetes"
---

Kubernetes deployments of Stalwart are driven by a Helm chart that installs the server as a StatefulSet, exposes the standard mail listeners (SMTP, submission, IMAP, POP3, ManageSieve) alongside the HTTP management listener, and provisions persistent storage for the data volume. The StatefulSet shape is used (rather than a plain Deployment) so that each replica keeps a stable hostname and its own PersistentVolumeClaim, which matters when the [DataStore](/docs/ref/object/data-store) (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->) is a local backend such as RocksDB and when the cluster's [node-id lease](/docs/cluster/configuration/node-id) depends on a stable hostname.

The chart below is a minimal, complete reference. It can be committed to a chart repository, packaged, and installed with `helm install`, or used as a starting point for a site-specific chart.

## Liveness and readiness endpoints

Kubernetes probes check that containers are running and ready to serve traffic. Stalwart exposes two HTTP endpoints for this purpose on the management listener:

- Liveness: `/healthz/live`. A failing liveness probe causes the container to be restarted.
- Readiness: `/healthz/ready`. A failing readiness probe causes the pod to be removed from Service endpoints until it recovers.

Both endpoints are wired into the StatefulSet template below.

## Chart layout

The chart follows the standard Helm layout. A typical tree looks like this:

```
stalwart/
├── Chart.yaml
├── values.yaml
├── .helmignore
└── templates/
    ├── _helpers.tpl
    ├── configmap.yaml
    ├── secret.yaml
    ├── statefulset.yaml
    ├── service.yaml
    └── ingress.yaml
```

### `Chart.yaml`

```yaml
apiVersion: v2
name: stalwart
description: Helm chart for the Stalwart mail and collaboration server
type: application
version: 0.1.0
appVersion: "v0.16"
home: https://stalw.art
sources:
  - https://github.com/stalwartlabs/stalwart
maintainers:
  - name: Stalwart Labs
    url: https://stalw.art
```

### `templates/_helpers.tpl`

```yaml
{{/* Expand the name of the chart. */}}
{{- define "stalwart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "stalwart.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "stalwart.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "stalwart.labels" -}}
app.kubernetes.io/name: {{ include "stalwart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end -}}

{{- define "stalwart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "stalwart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
```

### `templates/configmap.yaml`

The ConfigMap carries the `config.json` file that Stalwart reads at startup. It only describes the DataStore; every other setting lives in the database and is edited through the WebUI or the CLI. See the [configuration overview](/docs/configuration/) for the rationale.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "stalwart.fullname" . }}-config
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
data:
  config.json: |
{{ .Values.config | toPrettyJson | indent 4 }}
```

### `templates/secret.yaml`

The Secret holds environment-variable values that should not be stored in a ConfigMap: the recovery administrator credential, and any external store credentials referenced from the setup wizard.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "stalwart.fullname" . }}-env
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
type: Opaque
stringData:
  {{- if .Values.recoveryAdmin.enabled }}
  STALWART_RECOVERY_ADMIN: {{ printf "%s:%s" .Values.recoveryAdmin.username .Values.recoveryAdmin.password | quote }}
  {{- end }}
  {{- range $key, $value := .Values.extraSecretEnv }}
  {{ $key }}: {{ $value | quote }}
  {{- end }}
```

### `templates/statefulset.yaml`

The StatefulSet runs the Stalwart image, mounts `config.json` read-only at `/etc/stalwart/config.json`, mounts the data PVC at `/var/lib/stalwart`, and starts the binary with `--config /etc/stalwart/config.json`, matching the [Docker install flow](/docs/install/platform/docker).

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ include "stalwart.fullname" . }}
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
spec:
  serviceName: {{ include "stalwart.fullname" . }}-headless
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "stalwart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "stalwart.selectorLabels" . | nindent 8 }}
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    spec:
      securityContext:
        fsGroup: 2000
        runAsUser: 2000
        runAsGroup: 2000
      containers:
        - name: stalwart
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          args:
            - "--config"
            - "/etc/stalwart/config.json"
          env:
            {{- if .Values.role }}
            - name: STALWART_ROLE
              value: {{ .Values.role | quote }}
            {{- end }}
            {{- if .Values.pushShard }}
            - name: STALWART_PUSH_SHARD
              value: {{ .Values.pushShard | quote }}
            {{- end }}
            {{- if .Values.recoveryMode.enabled }}
            - name: STALWART_RECOVERY_MODE
              value: "true"
            - name: STALWART_RECOVERY_MODE_PORT
              value: {{ .Values.recoveryMode.port | quote }}
            - name: STALWART_RECOVERY_MODE_LOG_LEVEL
              value: {{ .Values.recoveryMode.logLevel | quote }}
            {{- end }}
            {{- range $key, $value := .Values.extraEnv }}
            - name: {{ $key }}
              value: {{ $value | quote }}
            {{- end }}
          envFrom:
            - secretRef:
                name: {{ include "stalwart.fullname" . }}-env
          ports:
            - name: smtp
              containerPort: 25
            - name: smtps
              containerPort: 465
            - name: submission
              containerPort: 587
            - name: imap
              containerPort: 143
            - name: imaps
              containerPort: 993
            - name: pop3
              containerPort: 110
            - name: pop3s
              containerPort: 995
            - name: sieve
              containerPort: 4190
            - name: http
              containerPort: 80
            - name: https
              containerPort: 443
            - name: mgmt
              containerPort: 8080
          livenessProbe:
            httpGet:
              path: /healthz/live
              port: mgmt
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /healthz/ready
              port: mgmt
            initialDelaySeconds: 5
            periodSeconds: 10
          volumeMounts:
            - name: config
              mountPath: /etc/stalwart/config.json
              subPath: config.json
              readOnly: true
            {{- if .Values.persistence.enabled }}
            - name: data
              mountPath: /var/lib/stalwart
            {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
      volumes:
        - name: config
          configMap:
            name: {{ include "stalwart.fullname" . }}-config
  {{- if .Values.persistence.enabled }}
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - {{ .Values.persistence.accessMode | quote }}
        {{- if .Values.persistence.storageClass }}
        storageClassName: {{ .Values.persistence.storageClass | quote }}
        {{- end }}
        resources:
          requests:
            storage: {{ .Values.persistence.size | quote }}
  {{- end }}
```

### `templates/service.yaml`

Two Services are defined: a headless Service backing the StatefulSet's stable DNS, and a regular Service that exposes the mail and management ports.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "stalwart.fullname" . }}-headless
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
spec:
  clusterIP: None
  selector:
    {{- include "stalwart.selectorLabels" . | nindent 4 }}
  ports:
    - name: mgmt
      port: 8080
      targetPort: mgmt
---
apiVersion: v1
kind: Service
metadata:
  name: {{ include "stalwart.fullname" . }}
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  selector:
    {{- include "stalwart.selectorLabels" . | nindent 4 }}
  ports:
    - name: smtp
      port: {{ .Values.service.ports.smtp }}
      targetPort: smtp
    - name: smtps
      port: {{ .Values.service.ports.smtps }}
      targetPort: smtps
    - name: submission
      port: {{ .Values.service.ports.submission }}
      targetPort: submission
    - name: imap
      port: {{ .Values.service.ports.imap }}
      targetPort: imap
    - name: imaps
      port: {{ .Values.service.ports.imaps }}
      targetPort: imaps
    - name: pop3
      port: {{ .Values.service.ports.pop3 }}
      targetPort: pop3
    - name: pop3s
      port: {{ .Values.service.ports.pop3s }}
      targetPort: pop3s
    - name: sieve
      port: {{ .Values.service.ports.sieve }}
      targetPort: sieve
    - name: http
      port: {{ .Values.service.ports.http }}
      targetPort: http
    - name: https
      port: {{ .Values.service.ports.https }}
      targetPort: https
    - name: mgmt
      port: {{ .Values.service.ports.mgmt }}
      targetPort: mgmt
```

### `templates/ingress.yaml`

An Ingress is only useful for the HTTP and HTTPS listeners; SMTP, IMAP, POP3, and ManageSieve require L4 exposure and should be fronted by a `LoadBalancer` Service or an external load balancer.

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "stalwart.fullname" . }}
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- toYaml .Values.ingress.tls | nindent 4 }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType | default "Prefix" }}
            backend:
              service:
                name: {{ include "stalwart.fullname" $ }}
                port:
                  name: {{ .portName | default "https" }}
          {{- end }}
    {{- end }}
{{- end }}
```

## `values.yaml`

`values.yaml` is the single file an operator should need to edit to produce a working deployment. The example below exposes the full set of knobs called out in the chart templates:

```yaml
# Container image.
image:
  repository: stalwartlabs/stalwart
  tag: "v0.16"
  pullPolicy: IfNotPresent

# Number of pods in the StatefulSet.
# Single-node deployments keep this at 1.
# For a clustered deployment, raise this value and set `role` (and
# `pushShard` where applicable) to a value that makes sense for the
# whole StatefulSet, or install multiple releases of this chart with
# different role values.
replicaCount: 1

# Maps to STALWART_ROLE. Names a ClusterRole defined in the database.
# Leave empty on single-node installs to run every task and listener.
# See /docs/cluster/configuration/roles for the role model.
role: ""

# Maps to STALWART_PUSH_SHARD. Only set on nodes whose role delivers
# push notifications. Leave empty on single-node installs.
pushShard: ""

# Recovery / bootstrap administrator credential.
# Enable this on first install so the operator can sign in without
# scraping the pod logs for the generated temporary password.
# Remove it once a permanent administrator account has been
# provisioned through the setup wizard.
recoveryAdmin:
  enabled: true
  username: admin
  password: "change-me"

# Starts the pods in recovery mode. Suspends mail services and
# exposes only the management listener on the configured port.
# See /docs/configuration/recovery-mode.
recoveryMode:
  enabled: false
  port: 8080
  logLevel: info

# Extra environment variables injected into the container, for
# store credentials that live in plain text.
extraEnv: {}

# Extra environment variables injected from the managed Secret.
# Use this for anything sensitive (database passwords, S3 keys, etc.).
extraSecretEnv: {}

# config.json contents. Rendered verbatim into the ConfigMap.
# Only the DataStore object belongs here; every other setting lives
# in the database once the server is bootstrapped.
# See /docs/configuration/overview and /docs/ref/object/data-store.
config:
  "@type": RocksDb
  path: /var/lib/stalwart

# Service definition. Change `type` to LoadBalancer when a cloud
# load balancer should expose the mail ports directly, or keep it
# as ClusterIP and front the chart with an Ingress / gateway for
# the HTTP listeners only.
service:
  type: ClusterIP
  ports:
    smtp: 25
    smtps: 465
    submission: 587
    imap: 143
    imaps: 993
    pop3: 110
    pop3s: 995
    sieve: 4190
    http: 80
    https: 443
    mgmt: 8080

# Ingress for the HTTP / HTTPS listeners only. Mail protocols
# require L4 exposure and are not handled here.
ingress:
  enabled: false
  className: nginx
  annotations: {}
  hosts:
    - host: mail.example.org
      paths:
        - path: /
          pathType: Prefix
          portName: https
  tls: []

# Persistent volume for the data directory. Required when the
# DataStore is a local backend such as RocksDB. Can be disabled
# for deployments that use an external store (PostgreSQL, MySQL,
# FoundationDB, S3-backed blob store, etc.).
persistence:
  enabled: true
  accessMode: ReadWriteOnce
  storageClass: ""
  size: 20Gi

# Resource requests and limits for the container.
resources: {}
```

## `config.json` handling

The server reads a single small JSON file at startup, containing only the [DataStore](/docs/ref/object/data-store) variant that tells it where its database lives. The chart renders the value of `.Values.config` into a ConfigMap key called `config.json`, mounts it as a file at `/etc/stalwart/config.json`, and starts the container with `--config /etc/stalwart/config.json`. This matches the flag used by the Docker install and by the native Linux packages, so `helm upgrade` does not change the runtime contract: only the DataStore value changes between a single-node RocksDB install and an externally-backed cluster.

For an external DataStore (for example PostgreSQL), change `.Values.config` accordingly and set `persistence.enabled: false`. The [PostgreSql](/docs/ref/object/data-store) variant reads the connection password from an [`authSecret`](/docs/ref/object/data-store#authsecret) nested object whose `EnvironmentVariable` form is the natural fit for a chart-managed Secret:

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

Every `STALWART_*` variable recognised by the server is documented on the [environment variables](/docs/configuration/environment-variables) page. The chart surfaces them as follows:

| Variable | Values key | Notes |
| --- | --- | --- |
| `STALWART_ROLE` | `role` | Names the [ClusterRole](/docs/ref/object/cluster-role) (found in the WebUI under <!-- breadcrumb:ClusterRole --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Roles<!-- /breadcrumb:ClusterRole -->) the pod adopts. |
| `STALWART_PUSH_SHARD` | `pushShard` | Push notification shard for pods whose role delivers push. |
| `STALWART_RECOVERY_MODE` | `recoveryMode.enabled` | Starts the pod in recovery mode. |
| `STALWART_RECOVERY_MODE_PORT` | `recoveryMode.port` | Port the recovery listener binds to. Defaults to `8080`. |
| `STALWART_RECOVERY_MODE_LOG_LEVEL` | `recoveryMode.logLevel` | Log verbosity while in recovery or bootstrap mode. |
| `STALWART_RECOVERY_ADMIN` | `recoveryAdmin.username` + `recoveryAdmin.password` | Rendered into the managed Secret as `username:password`. |

Any additional variable the runtime reads (database passwords, S3 credentials, and so on) can be injected via `extraEnv` for plain values or `extraSecretEnv` for sensitive values, both of which are surfaced through the same Secret-backed `envFrom` on the StatefulSet.

## Clustered deployment

A single-node install leaves `role` empty, keeps `replicaCount: 1`, and runs every task and listener. Two layouts are recommended for multi-node deployments.

### Single role per StatefulSet replica

For a cluster where every pod runs the same role (for example a stateless SMTP frontend backed by an external store), set `replicaCount` to the desired number of pods and leave the other values unchanged. `STALWART_ROLE` is applied to every pod in the StatefulSet, and `STALWART_PUSH_SHARD` is applied to every pod too; if per-pod sharding is required, split the StatefulSet or use the multi-release layout below.

### Multi-release layout for distinct roles

For deployments that need different roles on different nodes, install the chart multiple times with distinct values files:

```sh
helm install stalwart-frontend ./stalwart -f values-frontend.yaml
helm install stalwart-maintenance ./stalwart -f values-maintenance.yaml
helm install stalwart-push-shard-0 ./stalwart -f values-push-0.yaml
helm install stalwart-push-shard-1 ./stalwart -f values-push-1.yaml
```

Each release produces its own StatefulSet with its own PVCs, role, and push shard, while sharing the same DataStore and the same coordinator. `STALWART_PUSH_SHARD` is set to a different integer per release so that push-delivery work is partitioned across the cluster; see the [roles documentation](/docs/cluster/configuration/roles) for the sharding model.

### External coordinator

Coordination between nodes is handled by the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->), which can be backed by peer-to-peer, Apache Kafka / Redpanda, NATS, or Redis. The coordinator is configured from the database rather than from `config.json`, so pointing a Kubernetes deployment at an external coordinator is a post-install operation: bring the first pod up, open the WebUI, set the Coordinator object in `Settings` > `Cluster`, and redeploy with the target `replicaCount`. Subsequent pods pick the coordinator configuration up from the shared DataStore on start. See the [coordination overview](/docs/cluster/coordination/) for the choice of backend.

## Bootstrapping

[Bootstrap mode](/docs/configuration/bootstrap-mode) is triggered only when `config.json` is absent at startup. On Kubernetes the ConfigMap always renders a `config.json`, so the chart never enters bootstrap mode: an empty DataStore would instead cause the server to exit with an error before serving any listener. The chart therefore expects the initial `config.json` to be populated by the operator (the `.Values.config` default already points at a single-node RocksDB DataStore that lets the pod start cleanly on first install) and provisions the rest of the configuration through the management API once the pod is running. Setting `recoveryAdmin.enabled: true` makes that first sign-in possible without scraping the pod logs for a generated temporary password.

1. Install the chart:

   ```sh
   helm install stalwart ./stalwart -f values.yaml
   ```

2. Port-forward the management listener:

   ```sh
   kubectl port-forward svc/stalwart 8080:8080
   ```

3. Open `http://127.0.0.1:8080/admin` and sign in with the credentials from `recoveryAdmin`.

4. Complete the setup wizard, or run `stalwart-cli apply` against the same endpoint for a declarative bootstrap. The [CLI documentation](/docs/management/cli/) covers the `apply` flow.

5. Once a permanent administrator account has been provisioned, remove `recoveryAdmin` from `values.yaml` and run `helm upgrade` to drop the pinned credential. Leaving `STALWART_RECOVERY_ADMIN` set on a production deployment is discouraged; see [recovery mode](/docs/configuration/recovery-mode) for the rationale.

## Upgrading

Upgrades are performed by changing `image.tag` in `values.yaml` and running:

```sh
helm upgrade --install stalwart ./stalwart -f values.yaml
```

The StatefulSet rolls pods one at a time, each pod reusing its existing PVC, so on-disk data is preserved across the upgrade. Pinning a minor-version tag such as `v0.16` (rather than `latest`) keeps the deployment on a single release line and avoids breaking changes on upgrade, matching the guidance in the [Docker install page](/docs/install/platform/docker#start-the-container).

## Troubleshooting

- No administrator sign-in on first install: set `recoveryAdmin.enabled: true` in `values.yaml` and redeploy. See [bootstrap mode](/docs/configuration/bootstrap-mode).
- Pod stuck in `CrashLoopBackOff` on a fresh install with RocksDB: check that `persistence.enabled: true` and that the cluster's default StorageClass can provision a `ReadWriteOnce` volume of the requested size. See [persistent storage](/docs/install/store).
- Mail ports unreachable from outside the cluster: `service.type: ClusterIP` only exposes the listeners inside the cluster. Switch to `LoadBalancer`, add a `NodePort`, or front the chart with an L4 load balancer. Review [securing your server](/docs/install/security) before exposing SMTP and IMAP publicly.
- TLS errors on the HTTPS listener: Stalwart needs a TLS certificate before mail clients will connect. Configure ACME in the WebUI under `Settings` > `Server` > `TLS` > `ACME Providers` or upload an existing certificate under `Settings` > `Server` > `TLS` > `Certificates`. See [ACME](/docs/server/tls/acme/).
- Cluster nodes do not see each other: verify that `STALWART_ROLE` is set on every pod that participates and that the Coordinator is reachable from every pod. See [coordination overview](/docs/cluster/coordination/).
- Two nodes acquire the same node id: StatefulSet pods already have stable, unique hostnames, but custom Deployment-based installs must ensure each pod runs with a distinct hostname. See [node id](/docs/cluster/configuration/node-id).
