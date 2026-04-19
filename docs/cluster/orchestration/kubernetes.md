---
sidebar_position: 2
---

# Kubernetes

Kubernetes, often referred to as "K8s", is an open-source platform that automates the deployment, scaling, and management of containerised applications. It orchestrates computing, networking, and storage infrastructure on behalf of user workloads: it handles deployment, maintains the desired state of applications, scales them as needed, and manages updates and service discovery within the cluster. A Kubernetes cluster consists of at least one master node and several worker nodes that host pods, the smallest deployable units that can be created, scheduled, and managed.

Running Stalwart in a Kubernetes environment supports scalable and resilient deployment, with the benefit of Kubernetes features such as automated rollouts, rollbacks, scaling, and self-healing. Stalwart integrates with modern cloud infrastructure and benefits from flexible deployment and operational automation.

## Liveness and readiness endpoints

In Kubernetes, liveness and readiness probes check that containers are running and ready to handle requests. The liveness probe checks whether an application is running; if it fails, Kubernetes kills the container and restarts it. This helps recover from situations where an application is running but stuck or unable to continue its work.

The readiness probe determines whether an application is ready to accept traffic. When the readiness probe fails, Kubernetes temporarily removes the pod from its service endpoints, preventing it from receiving traffic. This is useful when an application needs initialisation time before serving requests or when it shuts down gracefully.

In Stalwart, the endpoints for these probes are predefined: the liveness endpoint is at `/healthz/live` and the readiness endpoint is at `/healthz/ready`. These endpoints are referenced in Kubernetes deployment manifests so that Stalwart containers are monitored and managed.

## Helm chart

Below are the steps to create a Helm chart, a package containing the files and configuration needed to deploy Stalwart on Kubernetes. The Helm chart simplifies setup in a Kubernetes cluster by defining the required resources in a cohesive structure.

### Step 1: Directory structure

First, create the directory structure for the Helm chart:

```
stalwart/
├── Chart.yaml
├── values.yaml
├── templates/
│   └── deployment.yaml
│   └── service.yaml
└── .helmignore
```

### Step 2: Chart.yaml

This file contains metadata about the chart:

```yaml
apiVersion: v2
name: stalwart
description: Helm chart for Stalwart
version: 0.1.0
appVersion: "latest"
```

### Step 3: values.yaml

This file contains default values for the chart. Operators can override these values either by editing the file or by passing their own values file at deploy time.

```yaml
image:
  repository: stalwartlabs/stalwart
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: NodePort
  ports:
    http: 8080
    https: 443
    smtp: 25
    submission: 587
    smtps: 465
    imap: 143
    imaps: 993
    sieve: 4190

persistence:
  enabled: true
  storageClass: "standard"
  accessMode: ReadWriteOnce
  size: 10Gi
  mountPath: /opt/stalwart

replicaCount: 1
```

### Step 4: deployment.yaml

This file defines the Kubernetes deployment for the mail server.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "stalwart.fullname" . }}
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "stalwart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "stalwart.selectorLabels" . | nindent 8 }}
    spec:
      containers:
      - name: stalwart
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        livenessProbe:
          httpGet:
            path: /healthz/live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        ports:
        - containerPort: 8080
        - containerPort: 443
        - containerPort: 25
        - containerPort: 587
        - containerPort: 465
        - containerPort: 143
        - containerPort: 993
        - containerPort: 4190
        volumeMounts:
        - name: stalwart-volume
          mountPath: {{ .Values.persistence.mountPath }}
      volumes:
      - name: stalwart-volume
        persistentVolumeClaim:
          claimName: {{ include "stalwart.fullname" . }}
```

Deployments that rely on cluster roles should propagate the [`STALWART_ROLE`](/docs/configuration/environment-variables#clustering) and, where applicable, [`STALWART_PUSH_SHARD`](/docs/configuration/environment-variables#clustering) environment variables to the container. See [Roles](/docs/cluster/configuration/roles) for details.

### Step 5: service.yaml

This file defines the Kubernetes service for the mail server.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "stalwart.fullname" . }}
  labels:
    {{- include "stalwart.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
  - name: http
    port: 8080
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 443
  - name: smtp
    port: 25
    targetPort: 25
  - name: submission
    port: 587
    targetPort: 587
  - name: smtps
    port: 465
    targetPort: 465
  - name: imap
    port: 143
    targetPort: 143
  - name: imaps
    port: 993
    targetPort: 993
  - name: sieve
    port: 4190
    targetPort: 4190
  selector:
    {{- include "stalwart.selectorLabels" . | nindent 4 }}
```

### Deploying the chart

To deploy the chart, navigate to the root of the Helm chart directory and run:

```sh
helm install stalwart .
```

This command initialises Stalwart with the values in `values.yaml` and the resources defined in the `templates/` directory. Adjust `values.yaml` to match the actual storage and node requirements.
