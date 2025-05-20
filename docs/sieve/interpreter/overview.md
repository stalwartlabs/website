---
sidebar_position: 1
---

# Overview

The Sieve interpreter is responsible of processing and executing Sieve scripts. Sieve scripts, primarily used in email filtering, are a powerful tool for automatically organizing, filtering, and responding to incoming emails based on predefined conditions. In Stalwart, the Sieve interpreter consists of two main parts, a **compiler** and a **runtime**:

- **Compiler**: The Sieve compiler is responsible for translating the human-readable Sieve script into bytecode. Bytecode is a set of instructions that can be directly executed by the Sieve runtime. This conversion ensures that the Sieve scripts are optimized for faster execution and enhanced performance.
- **Runtime**: The Sieve runtime is the environment where the compiled bytecode is executed. It reads the instructions from the bytecode and performs the necessary actions as dictated by the original Sieve script.

In order to ensure the highest level of security, Stalwart has two separate Sieve interpreters:

- **Trusted Interpreter**: This interpreter is specifically for scripts invoked by the SMTP server. These scripts are primarily trusted scripts created by the system administrator. As a result, the SMTP server's Sieve interpreter is configured to be more permissive, allowing a wider range of operations.
- **Untrusted Interpreter**: This is dedicated to scripts that are created by end-users. These scripts are generally created using the ManageSieve or JMAP for Sieve protocols. Given that these scripts come from a myriad of users, this runtime is designed to be more restrictive to prevent potential abuse and ensure the integrity and security of the mail server.

This dual runtime environment ensures that both system administrators and end-users can utilize Sieve scripts effectively while maintaining the highest standards of security and performance.
