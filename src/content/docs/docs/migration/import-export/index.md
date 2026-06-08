---
sidebar_position: 1
title: "Overview"
---

[Vandelay](https://github.com/stalwartlabs/vandelay) is a one-shot account-migration utility for JMAP, conceived as the JMAP analogue of `imapsync` and generalised from mail alone to every data type a JMAP account can hold: mailboxes and messages, calendars and events, address books and contacts, identities, Sieve scripts, participant identities and file storage. It moves a single account from a source system into a target JMAP server such as Stalwart, reading the source over whichever protocol that system exposes and writing the target over JMAP.

## Operating model

A migration with Vandelay is built around a single pivot: a local SQLite file called the archive. Rather than streaming data directly from a source server to a target server, Vandelay works in two independent halves. The import half reads a source account and records its complete contents in the archive. The export half reads that archive and reconciles its contents onto a target JMAP server. The two halves never communicate with each other; they communicate only with the archive. One archive holds exactly one account.

This separation is deliberate and is what gives the tool its flexibility. Because the archive fully describes the account on its own, the capture and the restore need not happen at the same time, on the same machine, or against servers that are simultaneously reachable. An account can be imported today and exported next week, imported behind one firewall and exported behind another, or imported once and exported repeatedly while a target is being prepared.

Both halves are convergent. Import reconciles by comparing the identifiers a source currently holds against those already in the archive, so an interrupted import resumes by re-running and a repeated import captures whatever has changed since the last snapshot. Export reconciles statelessly by re-matching each archived object against the target on every run, so an interrupted export resumes the same way and a repeated export never creates duplicates. Neither half keeps a synchronisation cursor or a partial-state flag that has to be cleared.

## Source protocols and the JMAP target

Vandelay imports from JMAP, IMAP, CalDAV, CardDAV, WebDAV and ManageSieve servers, from a local Maildir++ tree, from a Google Takeout export, and from Microsoft Exchange over both EWS and the Microsoft Graph API. Whatever the source, the data is normalised into the JMAP data model as it enters the archive, so that the export side has a single, uniform job. Export targets JMAP exclusively: there is one target protocol, applied identically regardless of where the data originally came from.

Engineered for the task, Vandelay is multi-threaded and uses blocking HTTP with no async runtime, automatically respecting each server's advertised concurrency limits. Message bodies, Sieve scripts and file payloads are content-addressed by BLAKE3 hash and stored once, deduplicated across the whole archive. Every command supports a dry run that computes the full plan without writing.

## Backup as a side effect

Because the archive is a self-contained SQLite file that completely describes one account, Vandelay also serves as a per-account backup tool. Running an import on a schedule captures a fresh snapshot into the archive, the resulting file is the backup, and restoring it later is simply a matter of running an export against a JMAP target. This use is covered in detail on the [Backup](backup) page.

