---
sidebar_position: 7
---

# Sieve scripting

Sieve ([RFC5228](https://www.rfc-editor.org/rfc/rfc5228.html)) is a scripting language for filtering email messages at or around the time of final delivery. It is suitable for running on a mail server where users may not be allowed to execute arbitrary programs as it has no user-controlled loops or the ability to run external programs. Sieve is a data-driven programming language, similar to earlier email filtering languages such as procmail and maildrop, and earlier line-oriented languages such as sed and AWK: it specifies conditions to match and actions to take on matching.

Stalwart includes support for [JMAP for Sieve Scripts](https://www.ietf.org/archive/id/draft-ietf-jmap-sieve-12.html) as well as [ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804), which allows users to upload and manage their Sieve scripts.

Please refer to the [Sieve scripting](/docs/sieve/overview) section for more information about the Sieve scripting language and how to configure the Sieve interpreter.
