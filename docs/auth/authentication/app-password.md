---
sidebar_position: 4
---

# App Passwords

Application Passwords are unique passwords that allow users to access their email accounts on devices or applications that do not support [Two-Factor Authentication](/docs/auth/authentication/2fa) (2FA). These passwords provide a secure way to use legacy mail clients or other applications that do not support the `OAUTHBEARER` SASL mechanism while maintaining the enhanced security provided by 2FA.

Application Passwords are particularly useful in several scenarios. For instance, older email clients that do not support OAuth authentication cannot prompt for a TOTP code, making it impractical to use them with standard 2FA. Application Passwords enable these clients to access the email account securely. Similarly, various third-party applications and services that need access to the email account might not support modern authentication methods. Application Passwords allow these services to connect without compromising security. Additionally, automated scripts and tools that require access to email accounts cannot interact with interactive authentication prompts. Application Passwords provide a way for these scripts to authenticate and perform necessary actions.

By using Application Passwords, users can maintain access to their email accounts on all their devices and applications while still benefiting from the added security of Two-Factor Authentication. These passwords are typically managed through the self-service portal, where users can create, view, and revoke them as needed.

## Managing App Passwords

Users can create and remove Application Passwords through the [self-service portal](/docs/management/webadmin/selfservice). This functionality is available under the "App Passwords" menu option. By navigating to this section, users can generate new Application Passwords for use with devices and applications that do not support Two-Factor Authentication (2FA). Additionally, users can view a list of their existing Application Passwords and revoke any that are no longer needed to maintain account security.

Administrators, on the other hand, have limited control over Application Passwords through the [webadmin](/docs/management/webadmin/overview) interface. While administrators can view and remove a user's Application Passwords, they do not have the capability to create new Application Passwords on behalf of users. 

:::tip Note

Application Passwords can only be managed from the self-service portal or the webadmin interface when Stalwart is configured to use the [internal directory](/docs/auth/backend/internal). If the server is set up to use an external directory, such as LDAP or SQL, administrators need to manually add the App Password secret as one of the account secrets to add a new Application Password for user accounts.

:::

## Internal Storage

Application Passwords are securely stored within the user's account as one of the account's secrets. Each Application Password is stored in a specific format to ensure it is uniquely identified and securely hashed. The format used is `$app$name$password` where `$app$` indicates that the secret is an Application Password, `name` is the unique identifier for the Application Password, and `password` is the hashed version of the Application Password.

The `$app$` prefix helps distinguish Application Passwords from other types of account secrets. The `name` component provides a unique identifier for each Application Password, allowing users and administrators to easily manage multiple passwords. The `password` part of the format is the hashed version of the actual Application Password, ensuring that it is not stored in plain text and remains secure. 
