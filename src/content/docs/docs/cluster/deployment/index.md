---
sidebar_position: 1
title: "Overview"
description: "Planning a Stalwart cluster: storage choices, sizing and the distribution of services across nodes."
---

A cluster is planned before it is built, and the plan comes down to three decisions. The first is which services hold the shared data. The second is how many nodes are needed, and how large each one is. The third is which nodes run which services. The [cluster overview](/docs/cluster/) explains how the parts fit together, and this section covers each decision in turn:

- [Storage](/docs/cluster/deployment/storage): the backends that can be shared by the nodes, and the requirements of each store.
- [Sizing](/docs/cluster/deployment/sizing): what determines the number and size of the nodes.
- [Planning node roles](/docs/cluster/configuration/roles#planning-node-roles): the distribution of listeners and background tasks across groups of nodes.
