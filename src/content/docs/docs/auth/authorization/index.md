---
sidebar_position: 1
title: "Overview"
---

Authorization determines what actions an authenticated user or entity may perform within the server. Where [authentication](/docs/auth/authentication/) establishes identity, authorization controls what that identity is allowed to do once verified.

Stalwart supports fine-grained access control. [Permissions](/docs/auth/authorization/permissions) can be assigned at several levels: directly to [individuals](/docs/auth/principals/individual) or [groups](/docs/auth/principals/group), through [roles](/docs/auth/authorization/roles), or at the [tenant](/docs/auth/authorization/tenants) level for multi-tenant deployments. The combination of these layers determines the effective permissions of a given principal.

The sections that follow cover the available permission types and how they are configured to match a deployment's access policy.
