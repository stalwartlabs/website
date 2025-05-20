---
sidebar_position: 3
---

# Kubernetes

Kubernetes, often referred to as "K8s", is an open-source platform designed to automate the deployment, scaling, and management of containerized applications. It orchestrates computing, networking, and storage infrastructure on behalf of user workloads. This means it handles the deployment of applications, maintains their desired state, scales them as needed, and manages updates and service discovery within the cluster. A Kubernetes cluster consists of at least one master node and multiple worker nodes that host the pods (the smallest deployable units that can be created, scheduled, and managed).

Running Stalwart in a Kubernetes environment enables scalable and resilient deployment, benefiting from Kubernetes' management features such as automated rollouts, rollbacks, scaling, and self-healing. This ensures that Stalwart can be effectively integrated into modern cloud infrastructures, enhancing its deployment flexibility and operational efficiency.

## Liveness and Readiness Endpoints

In Kubernetes, liveness and readiness probes are mechanisms designed to ensure that containers are running properly and are ready to handle requests. The liveness probe checks if an application is running and if it fails, Kubernetes will kill the container and restart it, assuming something has gone wrong. This feature helps recover from situations where an application might be running but is stuck or unable to continue its work.

On the other hand, the readiness probe determines if an application is ready to start accepting traffic. When the readiness probe fails, Kubernetes will temporarily remove the pod from its service endpoints, preventing it from receiving any traffic. This is particularly useful for scenarios where an application might need some initialization time before it can serve requests or when it needs to shut down gracefully.
Stalwart Endpoints

In Stalwart, the endpoints for these probes are predefined as follows: the liveness endpoint is located at `/healthz/live`, and the readiness endpoint can be found at `/healthz/ready`. These endpoints can be configured in your Kubernetes deployment files to ensure that the Stalwart containers are properly monitored and managed.

## Helm Chart

Below are the steps to create a Helm chart, which is a package containing all the necessary files and configurations to deploy Stalwart on Kubernetes. This Helm chart will simplify the process of setting up Stalwart in a Kubernetes cluster by defining all the required resources in a cohesive and structured format.

### Step 1: Directory Structure

First, create the directory structure for your Helm chart:

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

This file contains metadata about your chart. Here's an example:

```yaml
apiVersion: v2
name: stalwart
description: Helm chart for Stalwart
version: 0.1.0
appVersion: "latest"
```

### Step 3: values.yaml

This file contains the default values for your chart. Users can override these values either by editing this file or by passing their own values file at the time of chart deployment.

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

This file defines the Kubernetes deployment for your mail server.

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

### Step 5: service.yaml

This file defines the Kubernetes service for your mail server.

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

### Deploying the Chart

To deploy the chart, you would navigate to the root of the Helm chart directory and run:

```sh
helm install stalwart .
```

This deployment command initializes your Stalwart with the settings specified in the `values.yaml` and the resources defined in the `templates/` directory. Adjust the `values.yaml` according to your actual requirements regarding storage and node specifics.
