---
sidebar_position: 4
---

# Topology

In a Stalwart cluster, administrators have full control over how user-facing services are distributed across nodes. This is distinct from [node roles](/docs/cluster/configuration#node-roles), which assign background maintenance tasks such as purging or certificate renewal. **Cluster topology** focuses on which protocols—such as **IMAP, JMAP, WebDAV, and SMTP**—each node will serve.

Stalwart allows for flexible service distribution: each node can be configured to handle one, several, or all supported protocols. This lets administrators optimize performance, resource usage, and fault tolerance according to real-world traffic patterns and operational goals.

Below are several common topology strategies used in Stalwart clusters:

## Unified Service Model

```mermaid
flowchart TB
    subgraph Cluster Nodes
        direction LR
        Node1[Node 1]
        Node2[Node 2]
        Node3[Node 3]
        Node4[Node 4]
        Node5[Node 5]
        Node6[Node 6]
        Node7[Node 7]
        Node8[Node 8]
        Node9[Node 9]
        Node10[Node 10]
    end

    IMAP(IMAP)
    JMAP(JMAP)
    WebDAV(WebDAV)
    SMTP(SMTP)

    Node1 --> IMAP
    Node1 --> JMAP
    Node1 --> WebDAV
    Node1 --> SMTP

    Node2 --> IMAP
    Node2 --> JMAP
    Node2 --> WebDAV
    Node2 --> SMTP

    Node3 --> IMAP
    Node3 --> JMAP
    Node3 --> WebDAV
    Node3 --> SMTP

    Node4 --> IMAP
    Node4 --> JMAP
    Node4 --> WebDAV
    Node4 --> SMTP

    Node5 --> IMAP
    Node5 --> JMAP
    Node5 --> WebDAV
    Node5 --> SMTP

    Node6 --> IMAP
    Node6 --> JMAP
    Node6 --> WebDAV
    Node6 --> SMTP

    Node7 --> IMAP
    Node7 --> JMAP
    Node7 --> WebDAV
    Node7 --> SMTP

    Node8 --> IMAP
    Node8 --> JMAP
    Node8 --> WebDAV
    Node8 --> SMTP

    Node9 --> IMAP
    Node9 --> JMAP
    Node9 --> WebDAV
    Node9 --> SMTP

    Node10 --> IMAP
    Node10 --> JMAP
    Node10 --> WebDAV
    Node10 --> SMTP
```

In this approach, **all nodes in the cluster handle all services**—IMAP, JMAP, WebDAV, and SMTP. For example, in a 10-node deployment, each server would be configured identically and capable of handling any type of client or protocol request.

This model is ideal for:

* Simpler management and uniform configuration
* Maximizing redundancy (any node can fail without loss of service)
* Smaller or mid-sized environments where service traffic is evenly distributed

The unified model also simplifies load balancing and reduces operational complexity, though it may be less efficient in scenarios where some services see significantly more traffic than others.

## Service-Specific Allocation

```mermaid
flowchart TB

    subgraph IMAP_Nodes [IMAP Nodes]
        direction LR
        IMAP1[Node 1]
        IMAP2[Node 2]
    end

    subgraph JMAP_Nodes [JMAP Nodes]
        direction LR
        JMAP1[Node 3]
        JMAP2[Node 4]
    end

    subgraph WebDAV_Nodes [WebDAV Nodes]
        direction LR
        WebDAV1[Node 5]
        WebDAV2[Node 6]
    end

    subgraph SMTP_Inbound [SMTP Inbound]
        direction LR
        SMTPIn1[Node 7]
        SMTPIn2[Node 8]
    end

    subgraph SMTP_Outbound [SMTP Outbound]
        direction LR
        SMTPOut1[Node 9]
        SMTPOut2[Node 10]
    end

    IMAP1 --> IMAP[IMAP Service]
    IMAP2 --> IMAP

    JMAP1 --> JMAP[JMAP Service]
    JMAP2 --> JMAP

    WebDAV1 --> WebDAV[WebDAV Service]
    WebDAV2 --> WebDAV

    SMTPIn1 --> SMTP_IN[SMTP Inbound Service]
    SMTPIn2 --> SMTP_IN

    SMTPOut1 --> SMTP_OUT[SMTP Outbound Service]
    SMTPOut2 --> SMTP_OUT
```

In this model, nodes are **dedicated to specific protocols**. A 10-node cluster might be divided as follows:

* 2 nodes for **IMAP**
* 2 nodes for **JMAP**
* 2 nodes for **WebDAV**
* 2 nodes for **SMTP Inbound**
* 2 nodes for **SMTP Outbound**

This separation of concerns is useful when:

* You want to isolate workloads for performance tuning
* Certain services (e.g., SMTP) need different network access or security policies
* Teams are structured around managing specific services

Service-specific allocation allows more granular resource planning but may require more sophisticated monitoring and load balancing.

## Weighted Allocation Based on Load

```mermaid
flowchart TB

    subgraph IMAP_Nodes [IMAP Nodes]
        direction LR
        IMAP1[Node 1]
        IMAP2[Node 2]
        IMAP3[Node 3]
        IMAP4[Node 4]
    end

    subgraph JMAP_WebDAV_Nodes [JMAP + WebDAV Nodes]
        direction LR
        Combo1[Node 5]
        Combo2[Node 6]
    end

    subgraph SMTP_Nodes [SMTP Nodes]
        direction LR
        SMTP1[Node 7]
        SMTP2[Node 8]
        SMTP3[Node 9]
        SMTP4[Node 10]
    end

    IMAP1 --> IMAP[IMAP Service]
    IMAP2 --> IMAP
    IMAP3 --> IMAP
    IMAP4 --> IMAP

    Combo1 --> JMAP[JMAP Service]
    Combo1 --> WebDAV[WebDAV Service]
    Combo2 --> JMAP
    Combo2 --> WebDAV

    SMTP1 --> SMTP[SMTP Service]
    SMTP2 --> SMTP
    SMTP3 --> SMTP
    SMTP4 --> SMTP
```

Clusters can also be sized **according to expected usage patterns**. For instance, if IMAP usage is significantly heavier than JMAP or WebDAV, the topology could look like this:

* 4 nodes for **IMAP**
* 2 nodes for **JMAP + WebDAV**
* 4 nodes for **SMTP** (handling both inbound and outbound)

This model strikes a balance between redundancy and efficiency, allocating more resources to higher-demand services while still covering less-used protocols.

It's especially effective in:

* Enterprise environments with known usage trends
* Scenarios where IMAP or SMTP dominate traffic
* Clusters designed to scale incrementally

## Protocol Pairing Model

```mermaid
flowchart TB

    subgraph IMAP_JMAP_Nodes [IMAP + JMAP Nodes]
        direction LR
        Pair1[Node 1]
        Pair2[Node 2]
        Pair3[Node 3]
        Pair4[Node 4]
    end

    subgraph WebDAV_Nodes [WebDAV Nodes]
        direction LR
        WebDAV1[Node 5]
        WebDAV2[Node 6]
    end

    subgraph SMTP_Nodes [SMTP In + Out Nodes]
        direction LR
        SMTP1[Node 7]
        SMTP2[Node 8]
        SMTP3[Node 9]
        SMTP4[Node 10]
    end

    Pair1 --> IMAP[IMAP Service]
    Pair1 --> JMAP[JMAP Service]
    Pair2 --> IMAP
    Pair2 --> JMAP
    Pair3 --> IMAP
    Pair3 --> JMAP
    Pair4 --> IMAP
    Pair4 --> JMAP

    WebDAV1 --> WebDAV[WebDAV Service]
    WebDAV2 --> WebDAV

    SMTP1 --> SMTP[SMTP In + Out Service]
    SMTP2 --> SMTP
    SMTP3 --> SMTP
    SMTP4 --> SMTP
```

Some organizations prefer to group **complementary protocols** together. A common configuration might look like:

* 4 nodes for **IMAP + JMAP**
* 2 nodes for **WebDAV**
* 4 nodes for **SMTP Inbound + Outbound**

This model offers:

* Reduced configuration duplication
* Logical pairing of user-facing services (e.g., IMAP and JMAP both serve mail clients)
* Efficient use of resources while still enabling role separation

Pairing services can also simplify routing and firewall policies, especially when grouped by access patterns (e.g., client-facing vs. mail-routing).

## Geographically Distributed Topology

```mermaid
flowchart TB

    subgraph Region_A [Region A]
        direction LR
        A1[Node 1 - IMAP]
        A2[Node 2 - SMTP In]
        A3[Node 3 - SMTP In]
    end

    subgraph Region_B [Region B]
        direction LR
        B1[Node 4 - IMAP + JMAP]
        B2[Node 5 - SMTP Out]
        B3[Node 6 - SMTP Out]
    end

    subgraph Region_C [Region C]
        direction LR
        C1[Node 7 - WebDAV]
        C2[Node 8 - WebDAV]
        C3[Node 9 - JMAP]
        C4[Node 10 - SMTP]
    end

    A1 --> IMAP[IMAP Service]
    A2 --> SMTP_IN[SMTP Inbound Service]
    A3 --> SMTP_IN

    B1 --> IMAP
    B1 --> JMAP[JMAP Service]
    B2 --> SMTP_OUT[SMTP Outbound Service]
    B3 --> SMTP_OUT

    C1 --> WebDAV[WebDAV Service]
    C2 --> WebDAV
    C3 --> JMAP
    C4 --> SMTP[SMTP Service]
```

In larger or multi-site deployments, nodes may be distributed across **data centers or geographic regions**, with services colocated according to regional demand:

* Region A: 3 nodes (IMAP, SMTP Inbound)
* Region B: 3 nodes (IMAP, JMAP, SMTP Outbound)
* Region C: 4 nodes (WebDAV, JMAP, SMTP)

This approach improves:

* Latency for users in different regions
* Resilience to regional outages
* Load isolation by physical location

Geographically distributed clusters typically rely on global load balancers, DNS-based routing, or geo-aware proxies to direct traffic efficiently.

## Choosing the Right Topology

There is no one-size-fits-all topology. The best approach depends on your organization’s size, usage patterns, and operational preferences. One of Stalwart’s key strengths is that **topologies are flexible and easily adjusted over time**. You can start with a simple unified model and transition to a more specialized layout as your needs evolve.

Additionally, you can **mix and match** approaches—running unified nodes alongside dedicated ones—or shift services dynamically as demand grows.
