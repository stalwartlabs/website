---
sidebar_position: 1
---

# Overview

In Stalwart Mail Server, a directory serves as a centralized storage system for various types of information related to the mail server's operations. It holds critical data, such as accounts, passwords, groups, mailing lists, and other related metadata necessary for managing and authenticating users and resources within the system. The directory plays a crucial role in organizing and accessing this information efficiently, ensuring that the mail server can manage communication between users, groups, and other entities.

Directories in Stalwart Mail Server contain [principals](/docs/directory/principals/overview) — a term used to refer to individuals, groups, resources, or other entities that interact with or are represented within the mail system. Principals form the backbone of how the mail server understands and manages different roles and resources, and they will be explained in more detail in the subsequent sections.

By default, Stalwart Mail Server stores directory information internally within its [built-in directory system](/docs/directory/backend/internal). However, it also provides the flexibility to use external directory services for storing and managing directory data. This includes well-known directory protocols and systems such as [LDAP](/docs/directory/backend/ldap) (Lightweight Directory Access Protocol) or [SQL](/docs/directory/backend/sql) databases. This flexibility allows administrators to integrate the mail server with existing directory infrastructures, streamlining user management and authentication across multiple systems.
