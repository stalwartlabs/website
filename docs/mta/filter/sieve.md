---
sidebar_position: 3
---

# Sieve scripting

Sieve is a scripting language for filtering and modifying email messages. It provides a flexible way to manage mail by automatically filtering, sorting, and transforming messages based on a wide range of criteria. Stalwart uses Sieve as its default scripting language because it handles most filtering tasks and is an established [internet standard](https://www.rfc-editor.org/rfc/rfc5228.html).

A typical Sieve script consists of one or more rules, each with a test and an action. The test checks a specific attribute of the message, such as the sender's address or the subject line, and the action specifies what to do with the message when the test matches. This manual does not cover how to write Sieve scripts; tutorials and examples can be found at [http://sieve.info](http://sieve.info).

See the [Sieve scripting](/docs/sieve/overview) section for details on the language and on configuring the Sieve interpreter.
