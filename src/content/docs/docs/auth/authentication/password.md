---
sidebar_position: 2
title: "Passwords"
---

Account passwords can be stored in the internal directory or in an external directory such as LDAP or SQL. The server supports multiple password hashing schemes, and accounts may hold more than one password hash simultaneously. Storing passwords in plain text is possible but strongly discouraged.

Each hash type is identified by a specific prefix, which is how the server recognises the hashing method in use. If a stored password does not match a known hash prefix, it is compared as plain text.

Password hashing and the password policy enforced on the internal directory are both configured on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->). The hashing algorithm is selected through [`passwordHashAlgorithm`](/docs/ref/object/authentication#passwordhashalgorithm), which accepts `argon2id` (the default), `bcrypt`, `scrypt`, or `pbkdf2`. The specific policy fields are discussed in the next section.

The server recognises stored password hashes produced by the following schemes:

- **Argon2:** Winner of the 2015 Password Hashing Competition. Identified by the prefix `"$argon2"`.
- **PBKDF2:** Key derivation function defined in RSA Laboratories' PKCS series. Identified by the prefix `"$pbkdf2"`.
- **Scrypt:** Key derivation function originally developed for the Tarsnap backup service. Identified by the prefix `"$scrypt"`.
- **bcrypt:** Password hashing method based on the Blowfish cipher, with a salt and a configurable cost factor. Identified by the prefix `"$2"`.
- **SHA-512 Crypt and SHA-256 Crypt:** SHA-based password hashing schemes producing 512-bit and 256-bit hashes. Identified by the prefixes `"$6$"` and `"$5$"`.
- **SHA-1 Crypt:** Older password hashing scheme producing a 160-bit hash. Identified by the prefix `"$sha1"`.
- **MD5-based hash:** Older and weaker hash function producing a 128-bit hash. Identified by the prefix `"$1"`.
- **BSDi Crypt (Enhanced DES-based hash):** Slight modification of the original Unix crypt function. Identified by the prefix `"_"`.
- **Base64-encoded SHA-1, Salted SHA-1, SHA-256, Salted SHA-256, SHA-512, Salted SHA-512, MD5:** Identified by a prefix in curly braces, such as `"{SHA}"` or `"{SSHA}"`. The salted variants use a random salt to mitigate pre-computed lookup attacks.
- **Unix Crypt:** Traditional Unix password hashing. Identified by the prefix `"{CRYPT}"` or `"{crypt}"`.
- **Plain Text:** Passwords stored without hashing. Identified by the prefixes `"{PLAIN}"`, `"{plain}"`, `"{CLEAR}"`, or `"{clear}"`. Not recommended.

## Password policy

The policy that applies to passwords set through the internal directory is configured on the [Authentication](/docs/ref/object/authentication) singleton. These checks run when a user creates a new password or an administrator resets one; they do not apply retroactively to existing stored hashes, and they do not apply when credentials are validated against an external directory, which enforces its own policy.

The [`passwordMinLength`](/docs/ref/object/authentication#passwordminlength) and [`passwordMaxLength`](/docs/ref/object/authentication#passwordmaxlength) fields set the lower and upper bounds on the length of a newly chosen password. The defaults are 8 and 128 characters respectively. The upper bound prevents resource-exhaustion attempts against the hashing function and should be left generous.

Complexity is expressed through [`passwordMinStrength`](/docs/ref/object/authentication#passwordminstrength), which rejects candidates below a configurable level on the zxcvbn scale. The available levels are `zero` (too guessable), `one` (very guessable), `two` (somewhat guessable), `three` (safely unguessable, the default), and `four` (very unguessable). Using zxcvbn rather than character-class rules allows long passphrases built from common words to pass while short passwords padded with symbols are still rejected.

The [`passwordDefaultExpiry`](/docs/ref/object/authentication#passworddefaultexpiry) field sets a default lifetime for passwords stored in the internal directory. When a value is supplied, users are required to choose a new password once this duration has elapsed since their last password change. Leaving the field unset disables default expiry, so passwords remain valid until the user or an administrator rotates them.

The related fields [`maxAppPasswords`](/docs/ref/object/authentication#maxapppasswords) and [`maxApiKeys`](/docs/ref/object/authentication#maxapikeys) cap the number of [application passwords](/docs/auth/authentication/app-password) and [API keys](/docs/auth/authentication/api-key) each account may hold; these are separate credentials from the account password and are covered on their own pages.

These are the only password policy controls offered by the internal directory. Deployments that require richer policies such as password history, reuse prevention, or character-class rules should delegate authentication to an external identity provider over [OIDC](/docs/auth/backend/oidc) and enforce those policies there.
