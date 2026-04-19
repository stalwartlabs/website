---
sidebar_position: 6
---

# In-memory

<!-- review: The previous docs described a `type = "memory"` directory that lets users and groups be declared inline in the configuration file, primarily for small setups and testing. The current [Directory](/docs/ref/object/directory) object defines only Ldap, Sql, and Oidc variants, with no in-memory variant. Confirm whether the in-memory directory still exists in v0.16 (and if so, identify the current object and fields), or whether it has been removed in favour of the internal directory plus directly-managed Account objects. The remainder of this page is retained as a placeholder pending that confirmation; the original inline principal examples are not reproduced because the corresponding configuration surface is not documented in the current reference. -->

The in-memory directory is not documented in the current schema reference. For small deployments and testing scenarios, use the [internal directory](/docs/auth/backend/internal) backed by an embedded data store, and create [Account](/docs/ref/object/account) (found in the WebUI under <!-- breadcrumb:Account --><!-- /breadcrumb:Account -->) objects directly through the WebUI, the JMAP API, or the [CLI](/docs/management/cli/overview).
