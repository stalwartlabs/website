---
title: "Installation and the WebUI"
description: "Frequently asked questions about hardware, the setup wizard, containers and service managers, the data store, recovery access and reaching the WebUI."
sidebar_position: 2
---

## First start

### What hardware does Stalwart need?

[System requirements](/docs/install/requirements) lists the resources a server needs. Memory deserves the closest look, because several defaults scale with the memory of the host. The data store keeps its own cache, which for RocksDB takes about one eighth of the memory unless [`cacheSize`](/docs/ref/object/data-store#cachesize) sets it. Messages in transit have a memory budget of one quarter of the memory. The server's caches come on top of both.

On a host with 2 GiB, these defaults add up to more than the physical memory, so the caches and the budget have to be lowered there. For finer planning, the sizing pages give figures per connection, such as about 70 KB of memory for an IMAP session waiting in IDLE. These figures are estimates and are labelled as such, and no figure per user is published. See [Sizing memory](/docs/performance/memory) and [Sizing the caches](/docs/performance/caches).

### Why do I see the setup wizard again after a restart or upgrade?

The configuration file is missing. The server enters [bootstrap mode](/docs/configuration/bootstrap-mode), which runs the setup wizard, whenever the file named by `--config` or `CONFIG_PATH` does not exist. The data store plays no part in that decision, so a server with all its data intact still shows the wizard when the file is gone. In a container, the usual cause is an `/etc/stalwart` directory that is not on a persistent volume.

The wizard does not overwrite existing data. It refuses a data store that already holds an initialised database with `The selected data store has already been initialized.` and writes nothing. A data store created by an older Stalwart version is refused as well. The fix is therefore to restore `config.json`, which contains only the data store definition, and restart the server. See [Setup wizard on an existing server](/docs/configuration/bootstrap-mode#setup-wizard-on-an-existing-server).

### Why does my Docker host accumulate zombie processes?

The container has no init process. Without one, Stalwart runs as PID 1 in the container, and nothing reaps its exited child processes. Start the container with `--init`, or set `init: true` in Docker Compose. Either adds a minimal init process that forwards signals to Stalwart and reaps the exited processes. See [Start the container](/docs/install/platform/docker#step-1-start-the-container).

### Why does Stalwart stop when I install Postfix or Exim?

The systemd unit written by the install script declares a conflict with the other mail servers. Its `Conflicts=` line names `postfix.service`, `sendmail.service` and `exim4.service`, so systemd stops Stalwart when one of these services starts, and stops them when Stalwart starts. See [Service definitions](/docs/install/platform/linux#service-definitions).

### Can Stalwart run as a Windows service?

Only through a service wrapper such as NSSM. The binary does not register with the Windows Service Control Manager, and it stops only on Ctrl+C. The wrapper must therefore be configured to send Ctrl+C when the service is stopped. See [Install the service with NSSM](/docs/install/platform/windows#install-the-service-with-nssm).

### Which outbound connections does Stalwart make? Can it run without internet access?

The server makes these outbound connections:

- To GitHub, to download the WebUI bundle and the spam filter rule set.
- Daily, to download IP-to-ASN and country lists.
- To the ACME directory, to obtain certificates.
- To the API of a configured DNS provider.
- With an Enterprise license, to the license server.

It can run without internet access once its downloads have local replacements. The WebUI bundle can be placed on an internal HTTPS server, with the Application's `resourceUrl` pointed at it, and the rule set can be loaded from a `file://` URL. See [Outbound network requirements](/docs/install/requirements#outbound-network-requirements).

## Configuration

### Which database backend should I choose?

That depends mainly on whether the server will stay a single node. For a single server, RocksDB is the default and SQLite an alternative, while PostgreSQL or MySQL suit installations that already operate such a database.

A cluster needs a data store that all nodes share: PostgreSQL, MySQL or FoundationDB. RocksDB and SQLite do not qualify, because they are local files. See [Choosing a database](/docs/install/store).

### How do I change the data store of a running server?

Edit `config.json` and restart. The data store is the only setting kept outside the database, in that file, so the change is made there, on every node of a cluster.

The new backend starts empty. To bring the existing data along, move it with the offline export and import described in [Database migration](/docs/management/maintenance/migration). See [Changing a backend later](/docs/install/store#changing-a-backend-later).

### I lost the administrator password. How do I get back in?

Use the recovery administrator, an account defined by an environment variable rather than in the directory. Set `STALWART_RECOVERY_ADMIN` to `<username>:<password>` and restart the server. Whenever the variable is set at startup, in normal operation as well, the server accepts this account for password authentication, and the recovery administrator can sign in as any account. Once a permanent administrator exists, remove the variable and restart.

Setting `STALWART_RECOVERY_MODE` to `true` as well goes one step further: the server then starts with a single plain HTTP listener on port 8080, without auto-ban, rate limits or HTTP access control. See [Recovery administrator](/docs/configuration/recovery-mode#recovery-administrator).

## Reaching the WebUI

### Which URL do I open: `/admin`, `/account` or `/login`?

That depends on who is signing in:

- `/admin` opens the administration interface.
- `/account` opens the Account Manager, in which users manage their own credentials and settings.
- `/login` is the OAuth authorization page that applications open during sign-in. It is not a page to bookmark.

A request for `/` is redirected to <!-- default:Http.redirectRoot -->`/account`<!-- /default -->, unless `redirectRoot` on the [Http](/docs/ref/object/http) object names another path ([Root redirect](/docs/http/settings#root-redirect)). See [URLs](/docs/management/webui/#urls).

### Why does `/admin` return 404?

The WebUI was never downloaded. It is an [Application](/docs/management/applications/) bundle that the server downloads from GitHub on its first start. When that first download fails, usually because outbound HTTPS is blocked, the server has no bundle to serve. `/admin` and `/account` then return `404 Not Found`, while the rest of the server works normally, and the server logs a `resource.error` event stating that no bundle is available to serve. Allow the download, or host the bundle internally. See [Outbound network requirement](/docs/management/webui/#outbound-network-requirement).

### Why does the WebUI stop working after a few days?

Its unpacked files were deleted. When `unpackDirectory` is empty, the server unpacks the bundle into the system temporary directory, and cleanup jobs such as `systemd-tmpfiles` delete files there that have not been accessed for some time. The sign-in page still loads, but the browser then reports that it could not fetch a dynamically imported module.

A restart unpacks the bundle again. To keep the problem from recurring, set `unpackDirectory` to a persistent path, such as `/var/lib/stalwart/webui`. See [Unpack directory](/docs/management/applications/#unpack-directory).

### Why does WebUI sign-in fail or loop when I open it by IP address?

The WebUI signs in through the server's [OAuth server](/docs/auth/oauth/), and the OAuth server accepts it as a first-party client only on certain addresses: the server's public HTTPS address and the hostnames of its JMAP, CalDAV, CardDAV and WebDAV services. Opened by IP address, on another hostname or on the plain HTTP listener on port 8080, the WebUI is not recognised, sign-in fails, and the sign-in page shows `Unknown client id`.

Use the public hostname over HTTPS. Until TLS works, [recovery mode](/docs/configuration/recovery-mode) accepts the WebUI on any address. Behind a reverse proxy, `STALWART_PUBLIC_URL` must be the URL that browsers use ([Sign-in failures behind a proxy](/docs/server/reverse-proxy/#sign-in-failures-behind-a-proxy)). See [Sign-in](/docs/management/webui/#sign-in).

### How do I limit the admin interface to my internal network?

Write a rule in the `allowedEndpoints` expression of the Http object. The server evaluates this expression for every request, and its result is the HTTP status to answer with: `200` lets the request through, and any other status is sent back to the client instead. The expression can test the client address with the `remote_ip` variable and the request path with `path`; there is no `url_path` variable.

Requests from loopback addresses are never restricted, so a mistaken rule cannot lock out access from the server itself. See [Access control](/docs/http/access-control).

### Can the WebUI be shown in another language?

No. The WebUI is available in English only. See [WebUI](/docs/management/webui/).

### Can I serve the WebUI under a longer path such as `/mail/admin`?

No. Each entry of an Application's `urlPrefix` must be a single path segment made of letters, digits, `-`, `.`, `_` or `~`. A prefix with several segments is refused when the Application is saved. So are prefixes reserved for built-in endpoints, such as `jmap`, `dav`, `auth`, `login`, `api` and `.well-known`. See [Mount paths](/docs/management/applications/#mount-paths).
