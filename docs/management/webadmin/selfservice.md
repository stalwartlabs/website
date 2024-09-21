---
sidebar_position: 3
---

# Self-service

Stalwart Mail Server features a self-service portal designed to empower users with direct control over key aspects of their account settings. This portal enhances the overall user experience by providing a straightforward interface for personal account management tasks, such as updating passwords and enabling encryption-at-rest for sensitive email communications.

## Changing Passwords

One of the primary functionalities available through the self-service portal is the ability for users to change their passwords. To do so, users are required to authenticate themselves by entering their current password followed by the new password they wish to set. The process is designed to ensure security and verify the identity of the user making the request. If the entered current password is correctly matched with the user's existing password, the system proceeds to update the account with the new password. It's important to note that this password change functionality is available exclusively to users who are managed through Stalwart's [internal directory](/docs/directory/backend/internal).

## Enabling Encryption-at-Rest

In addition to password management, the self-service portal provides users with the capability to enhance the security of their stored emails through [encryption-at-rest](/docs/encryption/overview). This feature is crucial for users who require an additional layer of security for protecting sensitive information. To enable encryption-at-rest, users can choose between two widely recognized encryption standards: S/MIME or OpenPGP. The selection depends on the user's preference and the specific security requirements of their communications.

Upon deciding on the encryption method, users are then prompted to select an encryption algorithm suited to their needs. Following this, the portal requires the upload of the user's public key in PEM format. This public key plays a crucial role in the encryption process, ensuring that emails can be securely encrypted at rest and can only be decrypted by the intended recipient, who possesses the corresponding private key.

## Two-Factor Authentication

Stalwart Mail Server supports two-factor authentication (2FA) as an additional layer of security for user accounts. The self-service portal allows users to enable 2FA by configuring their preferred authentication method, such as TOTP (Time-based One-Time Password). Once enabled, users are required to provide a secondary authentication factor in addition to their password when logging in to their account. This significantly enhances the security of user accounts by mitigating the risks associated with password-based authentication.

## Application Passwords

Application passwords are a secure way to grant third-party applications access to a user's account without requiring the user's primary password. The self-service portal enables users to generate application-specific passwords for use with external applications, such as email clients or calendar services. This feature enhances security by allowing users to restrict the access permissions of third-party applications while maintaining the confidentiality of their primary account credentials.
