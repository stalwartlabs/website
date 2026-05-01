---
sidebar_position: 8
title: "Upgrading"
---

At this stage, Stalwart does not yet include an automated upgrade tool, which means all upgrades must be performed manually. This is by design: Stalwart is evolving rapidly, and some newer versions introduce data migrations that can modify or restructure existing data. These operations require supervision to ensure a smooth and safe transition. Automating them too early could increase the risk of data corruption or service disruption.

The good news is that after four years of intensive development, Stalwart has reached maturity and is now considered feature complete. The upcoming **v1.0.0** release (expected during the **first half of 2026**) will introduce a stable, finalized database schema and configuration system. From that version onward, upgrades will be handled automatically, making maintenance significantly easier.

We understand that frequent breaking changes in a mission-critical system like email are far from ideal. Therefore, we recommend upgrading **only when necessary**, for example, when a release includes a bug fix or new feature that you specifically need. Otherwise, it may be best to stay on your current version until **v1.0.0** becomes available. This approach will help you avoid “upgrade fatigue” and maintain long-term stability in your deployment.

## Understanding Release Compatibility

Stalwart follows **semantic versioning (semver)**, which uses a version number in the format **MAJOR.MINOR.PATCH** (for example, `0.14.3`). This system indicates the nature and impact of each release:

* **Patch releases** (the last number) include only small, backward-compatible fixes. Upgrading between patch versions, such as from `0.14.1` to `0.14.3`, is safe and does not require reading the release notes beforehand.
* **Minor releases** (the middle number) may introduce new features or adjustments that could require configuration changes or migrations. It is essential to **read the release notes carefully** before upgrading to understand what may have changed.
* **Major releases** (the first number) may include breaking changes, especially before version 1.0.0, and always require review and planning before upgrading.

For Docker users, we strongly recommend **not using the `latest` tag**, as it will automatically pull the newest image, which may contain incompatible changes. Instead, pin your deployments to a **major release tag**, such as `v0.14`, to ensure that your environment remains stable until you explicitly choose to upgrade.

