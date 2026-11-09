---
sidebar_position: 2.5
title: "Passkeys"
description: "Passwordless sign-in with passkeys (WebAuthn) for accounts of the internal directory: where passkeys work, how they relate to two-factor authentication and the public URL, how users register them in the Account Manager, and how to recover access."
---

A passkey lets a user sign in to the WebUI and to OAuth applications without typing a password. Passkeys are defined by the [Web Authentication (WebAuthn)](https://www.w3.org/TR/webauthn-3/) standard and are supported by current browsers and operating systems. Each passkey is a key pair created by an authenticator: the platform authenticator built into a phone or computer, a password manager, or a hardware security key. The private key never leaves the authenticator; the server stores only the public key and verifies a signature at every sign-in.

Passkeys protect against the most common ways of taking over an account. There is no shared secret for the user to reuse on other sites or for an attacker to steal from the server. The browser also binds every passkey to the domain name it was created for, so a phishing site on another domain cannot obtain a signature for the real one. Before the authenticator signs, it verifies the user with a PIN, a fingerprint or a face scan, which Stalwart requires.

Passkeys are available only for accounts of the [internal directory](/docs/auth/backend/internal). An account counts as external when its domain is served by an LDAP, SQL or OpenID Connect directory, including through the default directory selected in the [Authentication](/docs/ref/object/authentication) singleton. For such accounts the Account Manager does not offer passkeys, registration fails with `Passkeys are not available for accounts in an external directory.`, and a sign-in with a passkey registered earlier is refused.

## Where passkeys work

A passkey can be used in one place: the sign-in page of the [OAuth server](/docs/auth/oauth/). This is the page through which users sign in to the WebUI, and through which OAuth applications obtain access, in both the authorization code flow and the device flow. A mail client that signs in through OAuth opens this page in a browser, so its user can sign in there with a passkey as well.

IMAP, POP3, SMTP, ManageSieve and HTTP Basic authentication have no way to carry a passkey. Mail clients that sign in with a password keep using the account's password or an [app password](/docs/auth/authentication/app-password).

## Passkeys and two-factor authentication

A passkey is not a second factor added to the password. It replaces both the password and the one-time code of [two-factor authentication](/docs/auth/authentication/2fa): a user who signs in with a passkey is not asked for either. The passkey already combines two factors on its own, because it requires possession of the authenticator and the user verification that unlocks it.

For an account with two-factor authentication, this means that the one-time code protects the password sign-in, while passkeys are a separate way in. Adding a passkey therefore requires the same proof as a password sign-in: the current password, and the current code when two-factor authentication is enabled. Someone who learns only the password can neither sign in nor add a passkey of their own.

## Public URL and relying party

WebAuthn binds every passkey to a domain name, called the relying party ID. Stalwart uses the host of its [public URL](/docs/configuration/environment-variables#public-urls) as the relying party ID, and authenticators show that host as the name of the site. Three consequences follow for the deployment:

- Passkey sign-in works only when the sign-in page is served at the public URL itself, with the same scheme, host and port. A password sign-in is also accepted on the host names of the advertised services, but a passkey sign-in on any other origin is refused, and the server logs an `auth.failed` event with the reason `Origin not allowed`. Behind a [reverse proxy](/docs/server/reverse-proxy/#public-url), `STALWART_PUBLIC_URL` must therefore be the URL users open in the browser.
- Registration is accepted on the public URL and on any HTTPS origin whose host is the relying party ID or one of its subdomains. A WebUI served on another domain cannot register passkeys at all, because the browser refuses the request.
- Changing the host of the public URL changes the relying party ID. Every passkey registered under the previous host stops working, and users must register new ones. Changing only the port keeps the passkeys, but sign-in then needs the new origin.

When the server has no usable public URL, as in [recovery mode](/docs/configuration/recovery-mode), passkeys are unavailable and the Account Manager reports `Passkeys are not available on this server.`.

## Register a passkey

Users register their own passkeys in the [Account Manager](/docs/management/webui/account-manager), under <!-- breadcrumb:Passkey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › Passkeys<!-- /breadcrumb:Passkey -->. An administrator cannot register a passkey for another account: the authenticator is in the user's hands, and the server refuses such a request with `Passkeys can only be registered by the account owner.`.

The registration takes these steps:

1. Create a new passkey on the Passkeys screen and give it a name that identifies the authenticator, such as "Work laptop" or "Security key". The name helps the user tell passkeys apart when removing one later, and is limited to 64 characters.
2. Enter the current password, and the current code from the authenticator application when two-factor authentication is enabled. The server checks them before it lets the browser create a passkey.
3. Select Create passkey and follow the browser's prompt. The browser asks where to store the passkey (on the device, in a password manager or on a security key) and asks the user to verify with a PIN or biometrics.
4. When the screen shows `Passkey created. Save to add it to your account.`, save the form. The passkey is stored only at this point.

The browser must complete the prompt within five minutes of step 3, otherwise the save fails with `Passkey challenge expired or already used.` and the registration has to start again.

The server places these requirements on the authenticator:

- It must store the passkey as a discoverable credential, so that sign-in works without entering an account name first.
- It must verify the user. A security key without a PIN or biometric sensor cannot be used.
- Its key must use ES256 (ECDSA P-256), Ed25519 or RS256 (RSA with SHA-256).

The server asks for no attestation and does not check the make or model of the authenticator. Every authenticator that meets the requirements above is accepted, including passkeys that a password manager synchronises across the user's devices.

A passkey can be registered only on an account that has a password; otherwise the request fails with `Passkeys require an account with a password.`. The number of passkeys per account is limited by the account's `maxPasskeys` [quota](/docs/auth/authorization/quotas). When the account does not set it, the limit falls back to [`maxPasskeys`](/docs/ref/object/authentication#maxpasskeys) of the Authentication singleton, <!-- default:Authentication.maxPasskeys -->10<!-- /default --> on a new installation. A registration beyond the limit fails with `You have exceeded your quota of <n> passkeys.`.

The Account Manager performs the registration through two management API calls: `x:Passkey/registrationOptions`, which checks the password and returns the WebAuthn creation options, and `x:Passkey/set`, which stores the browser's response as a [Passkey](/docs/ref/object/passkey). Other clients can do the same with an account's own credentials.

## Sign in with a passkey

The sign-in page offers passkeys in two ways. The Sign in with a passkey button opens the browser's passkey prompt directly. In browsers that support passkey autofill, selecting the account name field also lists the passkeys stored for the site, so the user can choose one there. In both cases the user does not type an account name: the passkey identifies the account.

A passkey sign-in is subject to the same account checks as a password sign-in. The account needs the `authenticate` permission, the IP restrictions of the account's password credential apply, and an [expired password](/docs/auth/authentication/password#password-policy) restricts the account in the same way, so a user whose password has expired must still change it. Failed passkey sign-ins count toward the [automatic ban](/docs/server/auto-ban) like failed password sign-ins.

A successful sign-in produces an `auth.success` event with the details `Authenticated with passkey`, which distinguishes passkey sign-ins from password sign-ins in the logs.

## Manage passkeys

The Passkeys screen lists the account's passkeys with their names and the dates they were added. After registration, only the name can change; the key itself is fixed.

Deleting a passkey takes effect immediately for new sign-ins and needs no password. It does not sign out the applications that were authorised with that passkey, because their grants belong to the account rather than to the passkey. To end those sessions as well, revoke the applications under [Connected applications](/docs/management/webui/account-manager#connected-applications), or change the password, which signs out every OAuth application of the account.

Administrators can list and delete the passkeys of another account by calling `x:Passkey/query` and `x:Passkey/set` with the request-level `accountId` of that account, as with [app passwords](/docs/auth/authentication/app-password#create-an-app-password-for-another-user). This requires the `impersonate` permission together with `sysPasskeyQuery`, `sysPasskeyGet` or `sysPasskeyDestroy`; the default System Administrator role holds them. An administrator sees the name and creation date of each passkey, never its key.

## Recover access

A user who loses the device that holds a passkey signs in with the password instead, together with the one-time code when two-factor authentication is enabled, and deletes the lost passkey on the Passkeys screen. If the passkey was synchronised by a password manager, it remains usable on every other device of that password manager, which is another reason to delete it.

When the user can no longer sign in at all, an administrator deletes the passkey as described above and, if needed, sets a new password or [clears two-factor authentication](/docs/auth/authentication/2fa#recover-access). The user then registers a new passkey.

## Troubleshooting

The sign-in page shows a generic message when a passkey sign-in fails, and the server records the cause as the reason of an `auth.failed` event, logged at the `debug` level ([Events](/docs/ref/events)). The most common causes are these:

- The page reports `This passkey is not registered with any account. It may have been removed; sign in with your password instead.`: the passkey was deleted on the server, or was registered with another server. Where the browser supports it, the page also tells the browser to forget the passkey.
- `Origin not allowed`: the sign-in page was opened at a URL other than the public URL. See [Public URL and relying party](#public-url-and-relying-party).
- `Relying party ID hash mismatch`: the passkey was registered for another host, typically before the public URL changed.
- `User verification flag not set`: the authenticator signed without verifying the user, which happens with security keys that have no PIN set.
- `Passkeys are only accepted for internal directory accounts`: the account's domain has since been assigned to an external directory.

During registration, the Account Manager shows the server's error text directly. `Current secret is incorrect.` means a wrong password, and `Current OTP code is required to create a passkey.` a missing one-time code. Repeated wrong passwords during registration lead to an automatic ban with a `security.authentication-ban` event, as at sign-in. `This device already holds a passkey for your account.` means that the authenticator already stores a passkey of this account, and `This browser does not support passkeys.` that the browser lacks WebAuthn support.
