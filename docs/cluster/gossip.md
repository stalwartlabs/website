---
sidebar_position: 2
---

# Membership Protocol

Infection-style group membership protocols are a category of communication methods used in distributed computing to manage and track the membership of nodes in a network. These protocols are characterized by their robustness and scalability, especially suitable for large-scale distributed systems. They utilize a methodology similar to the spread of information (or "infections") where updates about the network are propagated incrementally and randomly among nodes, much like how a rumor spreads in a social network. This method ensures efficient dissemination of information with relatively low network overhead.

The primary function of infection-style protocols is to ensure all nodes in a network have a consistent view of the membership and status of other nodes. Each node periodically sends messages to a randomly selected subset of other nodes in the network, sharing its knowledge about the network's state. These messages might contain updates about its own status or information it has received from others. As nodes receive these updates, they in turn propagate them to other nodes. This method leverages redundancy to increase the reliability of the information spread, ensuring that even if some nodes do not receive the direct message, the information eventually reaches them through other paths.

## Gossip Service

Stalwart Mail Server incorporates a gossip protocol service, enabling it to dynamically discover new nodes, share status updates, and detect node failures effectively. The protocol operates by having nodes periodically exchange messages with a randomly chosen peer, which then spreads this information through the network, creating a resilient and self-stabilizing system.

A crucial feature of Stalwart’s gossip protocol is its tolerance to network partitions. Network partitions occur when a network is split into disjoint subnets where nodes within the same subnet can communicate, but cannot reach nodes in other subnets due to network failures or disruptions. Stalwart's protocol is designed to handle these scenarios by maintaining the service operational within each partition. Once the network partition is resolved, the protocol ensures that the state information is reconciled across the partitions, restoring consistency across the entire network.

## Configuration

In order to start the gossip service, the following settings need to be specified in the configuration file. They define how the nodes communicate, exchange information, and maintain the cluster's integrity. It's important to note that the gossip service operates over UDP and requires some specific settings to be configured before it starts. Without the `cluster.bind-addr` and `cluster.key` set, the gossip service will not initiate.

- `cluster.node-id`: This setting specifies a unique identifier for each node in the cluster. It is essential for the proper functioning of the cluster and must be unique across all nodes in the cluster.
- `cluster.bind-addr` This setting specifies the IP address that the UDP socket will bind to. This address is used to receive messages from other nodes in the network. 
- `cluster.advertise-addr`: This setting specifies the IP address that will be advertised to other nodes in the cluster. It is the address that other nodes will use to connect to this node, which may be different from the bind address if, for example, the server is behind a NAT or gateway. If not set, the bind address will be used.
- `cluster.bind-port`: The port number to which the UDP socket will bind. It is essential that this port number is the same on all nodes to ensure consistent communication across the cluster. Default port is 1179.
- `cluster.key`: This is the symmetric encryption key used for encrypting gossip messages exchanged between nodes. It is critical that the same key is used across all nodes within the cluster to ensure that messages can be securely sent and received.
- `cluster.heartbeat`: This configuration defines how frequently the node will send a ping message to other nodes to maintain and verify network connectivity and node status. Default is 1 second.
- `cluster.seed-nodes`: Seed nodes are essentially initial contact points for a node entering the cluster. These are typically stable and reliable nodes known to be part of the cluster network. When a new node starts, it connects to these seed nodes to get the current state of the cluster and to announce its presence to other nodes.

## Node Roles

In a cluster, nodes can take on different roles based on their responsibilities and capabilities. These roles help distribute the workload and ensure that the cluster operates efficiently. The following settings determine the roles that a node can perform within the cluster:

- `cluster.roles.purge.stores`: A list of one or more node ids responsible for purging expired data from the database. This role ensures that the database remains clean and optimized by removing outdated or unnecessary data.
- `cluster.roles.purge.accounts`: A list of one or more node ids responsible for purging accounts from the system. This role ensures that deleted emails and old changelogs are removed from the system to free up resources.
- `cluster.roles.acme.renew`: A list of one or more node ids responsible for renewing ACME certificates. This role ensures that TLS certificates are kept up-to-date and valid.
- `cluster.roles.metrics.calculate`: A list of one or more node ids responsible for calculating metrics and statistics for the cluster. This role involves processing and aggregating data to generate meaningful insights about the cluster's performance.
- `cluster.roles.metrics.push`: A list of one or more node ids responsible for pushing metrics and statistics to external monitoring systems. This role involves sending data to monitoring tools for analysis and visualization.


## Example

Here is an example of a configuration file with the necessary settings for the gossip service:

```toml
[cluster]
node-id = 1
bind-addr = "[::]"
bind-port = 1179
advertise-addr = "10.0.0.1"
key = "my-secret-key"
heartbeat = "5s"
seed-nodes = ["10.0.0.5", "10.0.0.6"]

[cluste.roles.purge]
stores = [1, 2]
accounts = [1, 2]

[cluste.roles.acme]
renew = [5]

[cluste.roles.metrics]
calculate = [3, 4]
push = [4]
```
