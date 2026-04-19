---
sidebar_position: 7
---

# SMTP and IMAP

<!-- review: The previous docs described "virtual" directories of type `imap`, `smtp`, and `lmtp` that delegated authentication and address validation to an external mail server in the standalone SMTP package. The current [Directory](/docs/ref/object/directory) object defines only Ldap, Sql, and Oidc variants, with no variant for remote SMTP, LMTP, or IMAP servers. Confirm whether this feature still exists in v0.16 (and if so, identify the object and fields that configure it), or whether it has been removed. The remainder of this page is retained as a placeholder pending that confirmation; the original connection and lookup examples are not reproduced because the corresponding configuration surface is not documented in the current reference. -->

Delegated authentication to a remote SMTP, LMTP, or IMAP server is not documented in the current schema reference. Deployments that rely on this feature should consult release notes for v0.16 or raise an issue, as the corresponding configuration is not surfaced on any object in the reference documentation at the time of writing.
