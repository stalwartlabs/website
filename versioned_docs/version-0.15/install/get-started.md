---
sidebar_position: 1
---

# Welcome to Stalwart

Welcome to **Stalwart**, an open-source mail and collaboration server designed for the modern internet. Stalwart supports a wide range of protocols including **JMAP**, **IMAP4**, **POP3**, **SMTP**, **CalDAV**, **CardDAV**, and **WebDAV**, making it a comprehensive solution for managing email, calendars, contacts, file storage, and more. Built in **Rust**, Stalwart is engineered to be **secure**, **fast**, **robust**, and **scalable**, capable of running everything from small personal mail servers to large, distributed enterprise deployments.

This **Getting Started** guide is intended to help new users install, configure, and optimize Stalwart for their specific needs. It walks through the essential steps and considerations for a successful deployment.

We begin with an overview of [System Requirements](/docs/install/requirements), where you’ll learn how memory and CPU usage scale with server load and how to size your system accordingly. The [Installation Guide](/docs/category/installation) provides instructions for setting up Stalwart on your platform of choice, including details on configuration.

Next, we explore how to [choose the right database](/docs/install/store) for your deployment, explaining Stalwart’s modular storage architecture and how to match different storage backends to the data they manage. You’ll also learn how to [choose a directory](/docs/install/directory), whether internal or external, for handling user authentication and account management.

Once the server is configured, proper [DNS setup](/docs/install/dns) is crucial for ensuring secure and reliable mail delivery and client connectivity. This section explains all the DNS records required for services like SPF, DKIM, DMARC, MTA-STS, and more.

To ensure your deployment remains secure, we cover several best practices in the [Securing Your Server](/docs/install/security) section. This includes disabling unused ports, configuring HTTP access controls, and enforcing clear administrative roles to minimize risk and maintain operational integrity.

Finally, for large or high-traffic environments, the [Performance Tuning](/docs/install/performance) section offers guidance on caching and concurrency settings, helping you get the best performance out of your server under demanding conditions.

Whether you're running a single-node setup or planning a distributed deployment, this guide will help you get Stalwart up and running efficiently and securely. Let’s get started.


