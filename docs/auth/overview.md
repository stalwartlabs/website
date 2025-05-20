---
sidebar_position: 1
---

# Overview

The **Access Control** section covers the essential mechanisms that regulate how users and applications interact with the system. This section includes explanations of **authentication**, **authorization**, and the **directory management** systems that store the information needed for these processes. Together, these components ensure that only authorized users can access the mail server, while giving administrators precise control over what actions each user is allowed to perform.

Authentication is the process of verifying the identity of users or applications attempting to access the system. This ensures that only valid accounts with proper credentials can log in and interact with Stalwart services. The mail server supports a variety of authentication methods, including the internal directory as well as integration with external systems like **OIDC**, **LDAP** and **SQL** for more complex environments.

Authorization determines the actions that authenticated users are permitted to perform within the system. Stalwart’s flexible and granular permissions model allows administrators to assign and manage permissions for individuals, groups, tenants, and roles. This ensures that each user or application only has access to the specific resources and functionalities necessary for their role, improving security and simplifying management.

The information used for both authentication and authorization is stored in [directories](/docs/auth/backend/overview). In Stalwart, a directory serves as a centralized storage system for various types of information related to the mail server's operations. It holds critical data, such as accounts, passwords, groups, mailing lists, and other related metadata necessary for managing and authenticating users and resources within the system. The directory plays a crucial role in organizing and accessing this information efficiently, ensuring that the mail server can manage communication between users, groups, and other entities.

Directories in Stalwart contain [principals](/docs/auth/principals/overview) — a term used to refer to individuals, groups, resources, or other entities that interact with or are represented within the mail system. Principals form the backbone of how the mail server understands and manages different roles and resources, and they will be explained in more detail in the subsequent sections.

By default, Stalwart stores directory information internally within its [built-in directory system](/docs/auth/backend/internal). However, it also provides the flexibility to use external directory services for storing and managing directory data. This includes well-known directory protocols and systems such as [LDAP](/docs/auth/backend/ldap) (Lightweight Directory Access Protocol) or [SQL](/docs/auth/backend/sql) databases. This flexibility allows administrators to integrate the mail server with existing directory infrastructures, streamlining user management and authentication across multiple systems.
