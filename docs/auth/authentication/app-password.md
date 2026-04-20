---
sidebar_position: 4
---

# App Passwords

Application Passwords are unique passwords that allow users to access their email accounts from devices or applications that do not support [Two-Factor Authentication](/docs/auth/authentication/2fa). They provide a way to use legacy mail clients or tools that do not support the `OAUTHBEARER` or `XOAUTH2` SASL mechanisms while preserving the benefits of 2FA on the primary account password.

Application Passwords are most useful in a few scenarios. Older email clients that do not support OAuth cannot prompt for a TOTP code, so standard 2FA is impractical with them; an Application Password allows these clients to authenticate securely. Third-party applications and services that have not adopted modern authentication mechanisms can also connect using an Application Password rather than the main account password. Finally, automated scripts and tools that need non-interactive access to a mailbox can authenticate with an Application Password scoped to the required permissions.

Each Application Password is managed as a distinct credential, so it can be named, inspected, and revoked without affecting other sessions.

## Managing App Passwords

Users create and remove Application Passwords from the [self-service portal](/docs/management/webui/overview), under the App Passwords menu option. The portal lists existing Application Passwords and allows individual entries to be revoked.

Each Application Password is represented by an [AppPassword](/docs/ref/object/app-password) object (found in the WebUI under <!-- breadcrumb:AppPassword --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › App Passwords<!-- /breadcrumb:AppPassword -->). The credential carries a [`description`](/docs/ref/object/app-password#description), an optional [`expiresAt`](/docs/ref/object/app-password#expiresat), an optional list of [`allowedIps`](/docs/ref/object/app-password#allowedips) that restrict where the credential may be used, and a [`permissions`](/docs/ref/object/app-password#permissions) mode controlling whether the credential inherits, restricts, or replaces the account's permissions. The secret itself is server-set and returned only on creation.

Administrators have limited control over Application Passwords. They can view and revoke a user's Application Passwords but cannot create new ones on a user's behalf.

:::tip Note

Application Passwords can be managed from the WebUI only when Stalwart is configured to use the [internal directory](/docs/auth/backend/internal). When the server is configured with an external directory, such as LDAP or SQL, administrators must add the App Password secret as one of the account secrets in the external directory.

:::

## Internal Storage

Each Application Password is stored on the account as one of its secrets, in the form `$app$name$password`, where `$app$` marks the secret as an Application Password, `name` is the unique identifier for the credential, and `password` is the hashed secret. The `$app$` prefix keeps Application Passwords distinguishable from other credential kinds, and storing only the hash of the generated secret prevents the raw password from being recovered from the directory.
