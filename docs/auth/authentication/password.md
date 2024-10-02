---
sidebar_position: 3
---

# Passwords

In Stalwart Mail Server, passwords for user accounts can be stored either in the internal directory or through external directories such as LDAP or SQL. The server supports multiple password hashing schemes to enhance security, and accounts are able to store multiple password hashes. While it is technically possible to store passwords in plain text, this practice is strongly discouraged due to security risks.

Below is a list of the supported password hashing schemes, ranging from modern, secure algorithms like Argon2 to legacy options like MD5. Each hash type is identified by a specific prefix, making it easy to recognize the hashing method in use. If a stored password does not match a known hash prefix, it will be treated as plain text for comparison.

- **Argon2:** A password-hashing function that was selected as the winner of the Password Hashing Competition in 2015. Identified by the prefix `"$argon2"` in the hashed secret.
- **PBKDF2 (Password-Based Key Derivation Function 2):** A key derivation function that is part of RSA Laboratories' Public-Key Cryptography Standards (PKCS) series. Identified by the prefix `"$pbkdf2"` in the hashed secret.
- **Scrypt:** A password-based key derivation function created by Colin Percival, originally for the Tarsnap online backup service. Identified by the prefix `"$scrypt"` in the hashed secret.
- **bcrypt (Blowfish Crypt):** A password hashing method based on the Blowfish cipher, it uses a salt to protect against rainbow table attacks and a cost factor to increase the amount of work to check a password, thereby slowing down any brute-force attempts. Identified by the prefix `"$2"` in the hashed secret.
- **SHA-512 Crypt and SHA-256 Crypt:** Cryptographic hash functions, designed by the NSA, which produce a hash of 512 bits and 256 bits, respectively. Identified by the prefixes `"$6$"` and `"$5$"` in the hashed secret.
- **SHA-1 Crypt:** An older cryptographic hash function which produces a 160-bit hash value. Identified by the prefix `"$sha1"` in the hashed secret.
- **MD5-based hash:** An older and weaker hash function that produces a 128-bit hash value. Identified by the prefix `"$1"` in the hashed secret.
- **BSDi Crypt (Enhanced DES-based hash):** A password hashing method that is a slight modification of the original Unix crypt function. Identified by the prefix `"_"` in the hashed secret.
- **Base64-encoded SHA-1, Salted SHA-1, SHA-256, Salted SHA-256, SHA-512, Salted SHA-512, MD5:** These hashing algorithms are identified by a prefix enclosed in curly braces, such as `"{SHA}"` or `"{SSHA}"`. The salted variants use a random value (salt) to guard against pre-computed lookup table attacks (rainbow tables).
- **Unix Crypt:** Traditional Unix password hashing method. Identified by the prefix `"{CRYPT}"` or `"{crypt}"`.
- **Plain Text:** In some cases, passwords may be stored as plain text, although this is generally not recommended due to security concerns. Identified by the prefixes `"{PLAIN}"`, `"{plain}"`, `"{CLEAR}"`, or `"{clear}"`.

