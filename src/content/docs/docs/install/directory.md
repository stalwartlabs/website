---
sidebar_position: 8
title: "Choosing a directory"
description: "Internal or external directory: who owns accounts and passwords in each model, what stays in Stalwart, and how to choose."
---

Every mail server needs to know who its users are: which names and passwords may sign in, and which addresses belong to whom. Stalwart calls the source of this information the directory. A directory supplies the accounts that can sign in to Stalwart and the addresses for which it accepts mail.

Stalwart can keep this information itself, in its internal directory, or ask an identity system that the organisation already runs. The administrator makes the choice in the [setup wizard](/docs/install/setup-wizard#step-3-account-directory), and it decides where accounts are created, where passwords are checked, and which system administrators work in for day-to-day account management. The installation tutorials use the internal directory, and this page explains when an external one is the better choice.

## Internal and external directories

With the [internal directory](/docs/auth/backend/internal), accounts, groups, passwords and addresses are stored in Stalwart and managed through the WebUI, the [CLI](/docs/management/cli/) or the JMAP management API. With an [external directory](/docs/auth/backend/), Stalwart asks an [LDAP](/docs/auth/backend/ldap) server, an [SQL](/docs/auth/backend/sql) database or an [OpenID Connect](/docs/auth/backend/oidc) identity provider to verify credentials and resolve addresses. In both cases Stalwart keeps a local [Account](/docs/ref/object/account) record with the mailbox data, quota, roles and other per-account settings. For an external directory, Stalwart creates the record the first time the account is used, and the directory's own tools create, change and remove the accounts.

## Comparison

| | Internal directory | LDAP or SQL directory | OpenID Connect directory |
|---|---|---|---|
| Accounts created by | Stalwart administrators | The directory; created locally on first use | The identity provider; created locally on first use |
| Passwords verified by | Stalwart | The directory (LDAP bind or a stored hash) | The identity provider, which issues tokens |
| Group membership | Stalwart groups | Read from the directory | Read from a token claim |
| Quotas, roles, per-account settings | Stalwart | Stalwart (local Account) | Stalwart (local Account) |
| Two-factor authentication in Stalwart | Available | Not available | Handled by the identity provider |
| Deprovisioning | Stalwart administrators | Manual in Stalwart, or [SCIM](/docs/auth/scim/) | Manual in Stalwart, or [SCIM](/docs/auth/scim/) |

[SCIM provisioning](/docs/auth/scim/) lets an identity provider create, update and remove accounts in the internal directory directly, which covers the account lifecycle that just-in-time creation from an external directory leaves open. [Provisioning models](/docs/auth/scim/provisioning) compares the two approaches.

## Choosing

The internal directory suits deployments in which Stalwart is the only consumer of the mail accounts, and it is the only model in which Stalwart itself offers two-factor authentication. An external directory suits organisations that already maintain accounts centrally and want users to keep one password. The OpenID Connect variant additionally gives single sign-on and moves multi-factor policy to the identity provider. With an OpenID Connect directory, mail clients sign in with OAuth tokens, so clients that cannot use OAuth with a third-party provider need [app passwords](/docs/auth/authentication/app-password), as described in [Mail clients and OAuth](/docs/auth/oauth/mail-clients).

The directory used for all domains is selected by [`Authentication.directoryId`](/docs/ref/object/authentication#directoryid), and leaving it unset selects the internal directory. The administrator can change it after installation, but Stalwart does not move accounts between directories when it changes.

A domain can also use a directory of its own, set with [`Domain.directoryId`](/docs/ref/object/domain#directoryid), and an LDAP directory can list failover servers in [`urlFailover`](/docs/ref/object/directory#urlfailover).

## Promoting the first administrator

When the wizard was completed with an external directory, it created no administrator account, because accounts from the directory exist in Stalwart only after their first sign-in. The administrator therefore promotes the first administrator after the restart with the help of the recovery administrator, a credential defined by the `STALWART_RECOVERY_ADMIN` environment variable that does not depend on the directory:

1. Set `STALWART_RECOVERY_ADMIN=<username>:<password>` in the service environment and restart the server. The server accepts the credential in normal operation, so [recovery mode](/docs/configuration/recovery-mode) is not needed.
2. Have the account that will become administrator sign in once, for example to the WebUI at `https://<hostname>/account`. The sign-in creates the account in Stalwart.
3. Sign in to `https://<hostname>/admin` as the recovery administrator and assign an administrator role to the account, as described in [Roles](/docs/auth/authorization/roles).
4. Sign in as the promoted account and confirm that the administration pages are available.
5. Remove `STALWART_RECOVERY_ADMIN` from the environment and restart the server, as described in [Retire the recovery administrator](/docs/install/security#retire-the-recovery-administrator).
