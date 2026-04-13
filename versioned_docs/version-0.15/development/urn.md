---
sidebar_position: 5
---

# URN Namespace

## Overview

This document describes the 'stalwart' Uniform Resource Name (URN) namespace, which provides persistent, location-independent identifiers for resources related to the Stalwart and Collaboration Server.

The namespace identifier (NID) is: `stalwart`

## Purpose

The 'stalwart' URN namespace is used to provide unique identifiers for:

1. Custom JMAP extensions (RFC 8620)
2. WebDAV lock tokens (RFC 4918)
3. WebDAV synchronization tokens (RFC 6578)

## Syntax

URNs in the 'stalwart' namespace have the following structure:

```
urn:stalwart:{resource-type}:{specific-identifier}
```

Where:
- `urn:` is the URI scheme
- `stalwart` is the namespace identifier (NID)
- `{resource-type}` identifies the category of resource
- `{specific-identifier}` is the unique identifier for that resource

### Resource Types

Version 1 of this specification defines the following resource types:

1. **jmap** - Used for JMAP protocol extensions
2. **davlock** - Used for WebDAV lock tokens
3. **davsync** - Used for WebDAV synchronization tokens

### Specific Identifier Format

The format of the specific identifier depends on the resource type:

| Resource Type | Specific Identifier Format | Example |
|---------------|----------------------------|---------|
| jmap | Text string identifying the extension | `mailfilter`, `calendar-settings` |
| davlock | 128-bit number encoded as hexadecimal | `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6` |
| davsync | 64-bit number encoded as hexadecimal | `a1b2c3d4e5f6a7b8` |

## Examples

Here are examples of valid URNs in the 'stalwart' namespace:

- `urn:stalwart:jmap:mailfilter`
- `urn:stalwart:jmap:calendar-settings`
- `urn:stalwart:davlock:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`
- `urn:stalwart:davsync:a1b2c3d4e5f6a7b8`

## URN Equivalence

URN equivalence within the 'stalwart' namespace follows the rules defined in RFC 8141, with the addition that string comparison of the Namespace Specific String (NSS) is case-insensitive.

This means:
- `urn:stalwart:jmap:MailFilter` and `urn:stalwart:jmap:mailfilter` are equivalent
- `urn:stalwart:davlock:A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6` and `urn:stalwart:davlock:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6` are equivalent

## Assignment

URNs in the 'stalwart' namespace are assigned by Stalwart Labs LLC. Assignment follows these guidelines:

- **JMAP Extensions (jmap)**:
   - Assigned based on the functionality provided by the extension
   - Names follow a convention similar to standard JMAP capabilities
   - Names should be concise, descriptive, and use lowercase letters and hyphens

- **WebDAV Lock Tokens (davlock)**:
   - Generated as random 128-bit numbers 
   - Encoded as 32 character hexadecimal strings
   - Generated on demand when locks are created

- **WebDAV Synchronization Tokens (davsync)**:
   - Generated as 64-bit numbers
   - Encoded as 16 character hexadecimal strings
   - Generated when a resource changes to indicate its current version

## Security and Privacy Considerations

- WebDAV lock tokens should be treated as private information, although they do not grant exclusive access to resources.
- When WebDAV sync tokens or lock tokens are used across networks, they should be transmitted using secure protocols to prevent unauthorized interception.
- JMAP extension identifiers may reveal information about specific server capabilities, which could be useful to potential attackers in fingerprinting server installations.

## Usage Policy

Use of the 'stalwart' URN namespace within the scope of projects related to or derived from the Stalwart and Collaboration Server is permitted according to the terms of the server's license.

## Version History

- **Version 1** (2025-03-23): Initial definition with jmap, davlock, and davsync resource types.

## Contact Information

For questions or concerns regarding the 'stalwart' URN namespace, please contact:

- **Organization**: Stalwart Labs LLC
- **Email**: hello@stalw.art
- **Website**: https://github.com/stalwartlabs/stalwart
