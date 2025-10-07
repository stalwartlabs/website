---
slug: security-audit-2025
title: "Security at the Core: Stalwart completes Second Security Audit"
authors: [mdecimus]
tags: [security, audit, penetration, test]
---

At Stalwart Labs, security is at the heart of everything we build. As part of our ongoing commitment to delivering a trustworthy email and collaboration server, we recently completed our **second independent security audit**, conducted by [Radically Open Security](https://radicallyopensecurity.com). Our previous audit took place exactly [two years ago](/blog/security-audit), in 2023 — and with significant changes to our codebase since then, a fresh and thorough assessment was essential.

## Comprehensive Assessment

The audit, conducted between **September 9 and September 25, 2025**, focused on version **v0.13.2** of Stalwart mail and collaboration server. The goal was clear: rigorously evaluate the security posture of the platform, identify potential vulnerabilities, and ensure our defenses are as strong as possible.

The penetration test followed a “crystal-box” methodology, combining source code review with targeted exploitation attempts. This included testing against the latest [OWASP Top 10](https://owasp.org/) risks, analyzing protocol implementations, and probing external interfaces — the most exposed and therefore most critical components of the system.

## Findings

The audit uncovered a total of **seven security issues**: **two high-severity vulnerabilities** and **five low-severity issues**. All but one minor issue were promptly addressed.

The most significant findings involved **Denial-of-Service (DoS) vulnerabilities**:

* **CVE-2025-59045 — Memory Exhaustion via CalDAV REPORT**: A crafted CalDAV request could trigger unbounded memory usage, potentially crashing the server.
* **CVE-2025-61600 — Unbounded Buffer Growth in IMAP Parser**: A flaw in the IMAP protocol parser could allow an attacker — even without authentication — to cause memory exhaustion.

Both of these high-severity vulnerabilities were resolved **within four hours of disclosure**, underscoring our team’s rapid response capability and deep focus on platform resilience. Patches were released in versions [v0.13.3](https://github.com/stalwartlabs/stalwart/releases/tag/v0.13.3) and [v0.13.4](https://github.com/stalwartlabs/stalwart/releases/tag/v0.13.4), and the issues have been assigned [CVE-2025-59045](https://github.com/stalwartlabs/stalwart/security/advisories/GHSA-xv4r-q6gr-6pfg) and [CVE-2025-61600](https://github.com/stalwartlabs/stalwart/security/advisories/GHSA-8jqj-qj5p-v5rr), respectively.

Among the lower-severity findings were issues related to RFC compliance in email parsing, permission checks, and quota enforcement. These were addressed swiftly as well, with most fixes included in [v0.13.4](https://github.com/stalwartlabs/stalwart/releases/tag/v0.13.4). One low-severity race condition related to disk quotas (TOCTOU) remains partially mitigated; however, its practical impact is limited due to built-in concurrency controls.

For those who would like a deep dive into the audit's findings, the full report is accessible [here](./ros-report.pdf).

## Our Commitment to Security

The final report praised Stalwart’s codebase as **robust, well-architected, and cleanly compartmentalized**, with memory safety ensured by Rust and attacker-aware design principles evident throughout. At the same time, the audit highlighted that our “build everything in-house” philosophy — while a strength — requires careful attention to detail, particularly in protocol parsing and input handling.

Security is never a one-time checkbox — it’s an ongoing process. That’s why regular audits like this one are an integral part of how we develop Stalwart. As our platform evolves, so does our approach to safeguarding it.

We’re proud of how quickly and effectively our team responded to the findings of this audit, and we remain committed to maintaining transparency and trust with our users and the broader open-source community.


