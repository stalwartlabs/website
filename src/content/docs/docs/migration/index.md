---
sidebar_position: 1
title: "Overview"
---

Moving a populated mail system onto Stalwart involves two distinct problems. The first is mechanical: every account's data, its mail, calendars, contacts, filters and stored files, has to be copied from the old system into the new one without loss. The second is operational: while that copying is in progress some accounts still live on the old system and others have already moved, yet users expect to keep sending and receiving mail throughout. Stalwart addresses these two problems with two complementary tools, a migration proxy and a migration utility called Vandelay, which together make it possible to migrate from a legacy mail server or an older Stalwart deployment onto the latest Stalwart version without downtime.

## Migration proxy

The [migration proxy](proxy) is a multi-protocol mail proxy that sits in front of one or more mail backends and decides, per account, which backend a given connection belongs to. It terminates IMAP, POP3, ManageSieve, SMTP submission, SMTP and LMTP, and HTTP (JMAP) sessions, identifies the account behind each connection from the credentials the client already presents, and bridges the session to whichever backend currently holds that account's data. Because the routing decision is made from existing credentials, no client reconfiguration is needed: users keep the same server name, ports and passwords while the proxy quietly sends them to the right system.

This is what keeps a migration invisible. A single hostname continues to answer on the familiar ports, and a mapping table records which backend each account lives on. As accounts are moved, their entries are flipped from the old destination to the new one, and the affected clients follow without noticing. The proxy speaks to legacy backends using the conventions they expect and understands Stalwart's own OAuth tokens and JMAP traffic, so it can front a mix of a legacy server and Stalwart, or an old and a new Stalwart, at the same time.

## Migration utility

[Vandelay](import-export) is a one-shot account-migration utility, the JMAP analogue of `imapsync` generalised to every data type a JMAP account can hold. It performs the actual copying of an account in two independent halves joined by a local SQLite file called the archive. The import half reads a source account, over JMAP, IMAP, CalDAV, CardDAV, WebDAV, ManageSieve, a local Maildir, a Google Takeout export, or Microsoft Exchange, and records its complete contents in the archive. The export half reads that archive and reconciles its contents onto a target JMAP server such as Stalwart. Both halves are convergent, so an interrupted or repeated run resumes and captures only what has changed, which is what lets an account be moved incrementally rather than in a single fragile operation.

## Zero-downtime migration

The two tools divide the work cleanly. Vandelay moves the data while the proxy moves the traffic. A migration proceeds account by account: the proxy keeps a given account pointed at the old backend while Vandelay imports its data and exports it onto the new Stalwart server, and only once that account's data is fully in place is its proxy mapping flipped to the new backend. Because Vandelay's import is convergent, a final catch-up run just before the cut-over captures anything that arrived during the copy, so the switch is seamless and no mail is lost. Repeating this for every account migrates an entire deployment, whether from a legacy mail server or from an earlier Stalwart version, with users experiencing no interruption to service.

## Step-by-step guidance

This page describes how the proxy and Vandelay fit together. The [Migration Guide](guide) walks through the procedure in full, with the concrete steps for staging the proxy, capturing and restoring each account with Vandelay, performing the catch-up run, and cutting accounts over to the new backend one at a time for a zero-downtime migration.
