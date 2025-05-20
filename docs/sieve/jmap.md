---
sidebar_position: 7
---

# JMAP for Sieve

JMAP for Sieve ([RFC9661](https://www.rfc-editor.org/rfc/rfc9661.html)) is an extension to the [JMAP protocol](/docs/http/jmap/overview) that allows users to manage their Sieve scripts using the JMAP API. This extension provides a way for users to upload, delete, and list their Sieve scripts, as well as to set a default script for their account.
Support for JMAP for Sieve is enabled by default in Stalwart, and no additional configuration is required. However, it is possible to disable on a per-user basis by disabling the JMAP for Sieve [permissions](/docs/auth/authorization/permissions) for the user.
