---
sidebar_position: 1
title: "Overview"
---

Every management and configuration operation in Stalwart goes through the same JMAP API. Three tools expose that API in different forms, and operators typically choose one per task:

The [WebUI](/docs/management/webui/) is the browser-based administration console and the recommended entry point for interactive management. It covers every configurable object and offers forms, dashboards, and a self-service account manager for end users.

The [CLI](/docs/management/cli/) (`stalwart-cli`) calls the same JMAP API from a terminal. It is the right tool for scripting, automation, and declarative deployments on platforms such as NixOS, Ansible, or Terraform.

For programmatic access from a host application, the JMAP API can be called directly over HTTP. Each JMAP method is documented on the [schema reference](/docs/ref/) pages alongside the object it operates on.

