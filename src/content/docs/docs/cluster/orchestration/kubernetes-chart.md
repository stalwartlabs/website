---
title: "Kubernetes chart reference"
description: "The complete Helm chart for running Stalwart on Kubernetes: Chart.yaml, templates and values.yaml."
sidebar_position: 2.5
---

This page contains the complete Helm chart used by the [Kubernetes](/docs/cluster/orchestration/kubernetes) deployment guide. The guide explains the decisions behind the chart, while this page gives its full source, file by file. The chart can be copied into a chart repository as it is, or used as the starting point of a site-specific chart.

## Chart layout

The chart follows the standard Helm layout: a `Chart.yaml` that describes the chart, a `values.yaml` with the settings an operator changes, and a `templates` directory with the Kubernetes manifests. A typical tree looks like this:

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
appVersion: "v1"
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

The ConfigMap carries the `config.json` file that Stalwart reads at startup. That file describes only the DataStore, because every other setting lives in the database and is edited through the WebUI or the CLI. The [configuration overview](/docs/configuration/) explains the rationale.

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

Some environment-variable values should not be stored in a ConfigMap, whose contents are not treated as secret. The Secret holds them: the recovery administrator credential, and any external store credentials referenced from `config.json` or from the configuration.

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

The StatefulSet runs the Stalwart image. It mounts `config.json` read-only at `/etc/stalwart/config.json` and the data PVC at `/var/lib/stalwart`. It then starts the binary with `--config /etc/stalwart/config.json`, which matches the [Docker install flow](/docs/install/platform/docker).

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
      {{- with .Values.podSecurityContext }}
      securityContext:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      containers:
        - name: stalwart
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          {{- with .Values.containerSecurityContext }}
          securityContext:
            {{- toYaml . | nindent 12 }}
          {{- end }}
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

Two Services are defined, for two different purposes. A headless Service backs the stable DNS names of the StatefulSet's pods, and a regular Service exposes the mail and management ports.

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

An Ingress routes HTTP traffic, so it is useful only for the HTTP and HTTPS listeners. SMTP, IMAP, POP3 and ManageSieve require exposure at layer 4, and they should be fronted by a `LoadBalancer` Service or an external load balancer instead.

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

`values.yaml` is the only file an operator needs to edit to produce a working deployment, since the templates read every setting from it. The following file sets every value that the chart templates use:

```yaml
# Container image.
image:
  repository: stalwartlabs/stalwart
  tag: "v1"
  pullPolicy: IfNotPresent

# Number of pods in the StatefulSet.
# Single-node deployments keep this at 1. Values above 1 require a
# shared data store, blob store and search store, a Redis-based
# in-memory store and a coordinator; see /docs/cluster/ for the list.
# Set `role` (and `pushShard` where applicable) for the whole
# StatefulSet, or install one release of this chart per role.
replicaCount: 1

# Maps to STALWART_ROLE. Names a ClusterRole defined in the database.
# Leave empty on single-node installs to run every task and listener.
# See /docs/cluster/configuration/roles for the role model.
role: ""

# Maps to STALWART_PUSH_SHARD, numbered from 1. Only set on nodes
# whose role delivers push notifications, and only together with
# `pushShardsTotal` on the Jmap object. Leave empty on single-node
# installs.
pushShard: ""

# Recovery administrator credential.
# Required on first install: the chart always renders config.json, so
# the server never enters bootstrap mode and prints no temporary
# password. Remove it once a permanent administrator account exists.
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
# See /docs/configuration/ and /docs/ref/object/data-store.
config:
  "@type": RocksDb
  path: /var/lib/stalwart

# Service definition. Change `type` to LoadBalancer when a cloud
# load balancer should expose the mail ports directly, or keep it
# as ClusterIP and front the chart with an Ingress / gateway for
# the HTTP listeners only. Ports 587, 143, 110 and 80 have no listener
# in the default configuration; they are served only if listeners are
# added for them.
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
# See /docs/performance/memory for sizing the memory request.
resources: {}

# Pod-level security context. Applied to every container in the pod.
# The defaults are sufficient for the `baseline` Pod Security Standard.
# See "Restricted Pod Security Standards" on the Kubernetes page for
# the override required under the `restricted` profile.
podSecurityContext:
  fsGroup: 2000
  runAsUser: 2000
  runAsGroup: 2000

# Container-level security context for the stalwart container.
# Empty by default. Set this to opt into the `restricted` Pod Security
# Standard; see "Restricted Pod Security Standards" on the
# Kubernetes page.
containerSecurityContext: {}
```
