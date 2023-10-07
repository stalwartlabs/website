---
slug: security-audit
title: "Stalwart Mail Server passes Security Audit"
authors: [mdecimus]
tags: [security, audit, penetration, test]
---

We are thrilled to announce that **Stalwart Mail Server** has undergone a comprehensive security audit conducted by **Radically Open Security**. As a part of their assessment, a crystal-box penetration test was performed to ensure the robustness and security of the mail server.

### How Was The Security Audit Conducted?

- **Automated Scanning**: Radically Open Security employs state-of-the-art automated tools and scanners to root out common vulnerabilities, coding flaws, or misconfigurations within the codebase. These tools are invaluable in identifying potential problem areas that might necessitate a more in-depth manual analysis. They also confirm that the code adheres strictly to secure coding practices.

- **Manual Code Review**: Building upon the insights provided by automated scanning, a manual code review was carried out. This process aims to spot complex security issues, logical flaws, and ensures that secure coding practices are consistently met. This meticulous step involves confirming the proper implementation of essential components such as input validation, authentication, authorization, and data protection mechanisms.

### What Were the Results?

We are proud to share that the audit concluded with no vulnerabilities or unsafe code identified in the Stalwart Mail Server. Such an outcome underscores our commitment to offering a safe and secure open-source mail server solution to our users.

For those who would like a deep dive into the audit's findings, the full report is accessible [here](./ros-report.pdf).

### Continuous Improvement

Though the audit did not unearth any vulnerabilities, Radically Open Security did make a constructive recommendation: They advised against storing directory or OAuth secrets in the configuration file. We took this feedback to heart, and we're excited to introduce **Stalwart Mail Server version 0.3.9**. Released today, this latest version allows reading configuration settings from environment variables. It’s a step further towards ensuring that our users can trust Stalwart, not just for its capabilities, but also for its steadfast focus on security.


### Looking ahead 

We extend our heartfelt gratitude to the team at Radically Open Security for their comprehensive evaluation and invaluable feedback. We're committed to constantly refining and improving our product, with the security and trust of our users being paramount. With this recent audit, we hope to have taken another significant step towards that goal.

Stay secure!
