---
sidebar_position: 1
---

# Overview

Authorization is the process of determining what actions an authenticated user or entity is allowed to perform within the system. While [authentication](/docs/directory/authentication/overview) verifies the identity of a user (i.e., confirming who they are), authorization controls what they can do after their identity has been verified. 

In Stalwart Mail Server, authorization is highly granular, meaning that [permissions](/docs/directory/authorization/permissions) can be precisely defined and assigned to control access to specific resources and actions. Administrators can assign permissions at multiple levels, including to [individuals](/docs/directory/principals/individual), [groups](/docs/directory/principals/group), [roles](/docs/directory/authorization/roles), or even entire [tenants](/docs/directory/multi-tenant), ensuring fine-tuned control over who can access or modify certain data and resources within the mail system.

This flexibility allows organizations to enforce strict access policies, ensuring that only authorized users can access sensitive resources, perform administrative actions, or interact with shared mailboxes and other assets. In the following sections, we will explore the various permission types available in Stalwart and how they can be configured to meet the specific needs of your organization.
