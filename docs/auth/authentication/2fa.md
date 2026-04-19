---
sidebar_position: 3
---

# Two-Factor Authentication

Two-Factor Authentication (2FA) is an additional layer of security used to ensure that individuals trying to access an account are who they claim to be. It typically combines two credential categories: something known (an additional password, a PIN, or the answer to a security question), something possessed (a phone, security token, or smart card), or something inherent (a fingerprint, retina scan, or voice recognition).

Stalwart supports Two-Factor Authentication using Time-based One-Time Password (TOTP). In this scheme the server and the authenticator app share a secret key, and the app generates a new code every 30 seconds by combining the secret with the current time. After entering their username and password, the user is prompted to enter the current TOTP code; the server verifies the code using the shared secret.

TOTP is compatible with common authenticator apps such as Google Authenticator and Authy.

## Enabling 2FA

Users can enable Two-Factor Authentication on their accounts from the [self-service portal](/docs/management/webui/overview). Inside the portal, the Two-factor Authentication page presents a TOTP QR code that the user scans with an authenticator app, linking the account to the app.

Administrators can enable 2FA on a user account by configuring an OTP Auth URL on the account. The [AccountPassword](/docs/ref/object/account-password) singleton (found in the WebUI under <!-- breadcrumb:AccountPassword --><!-- /breadcrumb:AccountPassword -->) holds password and OTP credentials for the signed-in account; the OTP Auth URL is set through the [`otpAuth`](/docs/ref/object/account-password#otpauth) field, specifically the [`otpUrl`](/docs/ref/object/account-password#otpauth) inside the OtpAuth nested type. For administrator-driven provisioning, the same value can be stored as a `Password` credential on the target [Account](/docs/ref/object/account) (found in the WebUI under <!-- breadcrumb:Account --><!-- /breadcrumb:Account -->) using the [`credentials`](/docs/ref/object/account#credentials) field, which exposes the `otpAuth` URI on each `Password` credential. The TOTP secret embedded in the URL must then be communicated to the user so the same code is registered in their authenticator app.

Both users and administrators should verify that the authenticator app has been configured correctly and that codes validate successfully before relying on 2FA.

:::tip Note

Two-factor authentication can only be managed from the WebUI when Stalwart is configured to use the [internal directory](/docs/auth/backend/internal). When the server is configured with an external directory, such as LDAP or SQL, administrators must set the OTP Auth URL as one of the account secrets in the external directory.

:::

## Using 2FA

Two-factor authentication can only be used with mail clients that support OAuth and the `OAUTHBEARER` or `XOAUTH2` SASL mechanism. Without OAuth, a new TOTP code would have to be entered every time the client retrieves or sends a message, which is impractical for most workflows.

When using an OAuth flow, the user enters their password and a TOTP code during the initial sign-in. After successful authentication, an OAuth token is issued. The client refreshes the token automatically, so no further TOTP codes are required for the lifetime of the refresh token.

### Legacy Applications

#### Application Passwords

For accounts with 2FA enabled, legacy mail clients that do not support `OAUTHBEARER` or `XOAUTH2` can still authenticate by means of [Application Passwords](/docs/auth/authentication/app-password). An Application Password is a unique password that is accepted in place of the account's regular password, and can be revoked individually.

## Internal Storage

The settings for TOTP-based Two-Factor Authentication are stored on the account as one of its secrets, encoded as an OTP Auth URL. The URL contains all the information an authenticator app needs to generate codes.

The OTP Auth URL carries the following components:

- **Secret Key:** The shared key used to derive one-time passwords.
- **Issuer:** The organisation issuing the OTP, typically the mail service or domain.
- **Account Name:** The account identifier, often the email address.
- **Algorithm:** The HMAC hash algorithm used, normally HMAC-SHA1.
- **Digits:** The number of digits in the generated OTP, normally six.
- **Period:** The validity period of each code, normally 30 seconds.

The URL follows the form `otpauth://totp/<issuer>:<accountname>?secret=<SECRET>&issuer=<issuer>&algorithm=SHA1&digits=6&period=30`. Storing this URL on the account keeps all information required to generate and validate TOTP codes in a single string.
