---
title: "Troubleshooting installation"
description: "Index of the problems met while installing Stalwart, by symptom, with the error text and the tutorial step that explains the cause and the fix."
sidebar_position: 10
---

Most problems during an installation have a small number of causes: a port that the provider or another program blocks, a host name that does not resolve yet, or a setting that the server reads only at its next start. The installation tutorials describe the frequent problems at the step where they occur, because the step explains what the server is doing at that moment and therefore why the problem arises. An administrator who has only a symptom, such as an error message or a page that does not load, does not always know which step produced it.

This page starts from the symptom. Each section names what the administrator observes, gives the exact error text where there is one, and links to the step that explains the cause and the fix on the [Linux, macOS and FreeBSD](/docs/install/platform/linux), [Docker](/docs/install/platform/docker) and [Windows](/docs/install/platform/windows) pages. The rarer problems, which the tutorials leave out of their steps, are described here in full. It covers the time between installing Stalwart and sending the first test message. [Troubleshooting](/docs/management/troubleshoot) covers the problems of a server that is already running.

## Temporary administrator password not found

The server prints the password once to its output, in a block that begins with `Stalwart bootstrap mode - temporary administrator account`, and prints a new one at every start in bootstrap mode. The location of that output depends on the platform. See Step 2: [Linux, macOS and FreeBSD](/docs/install/platform/linux#retrieve-the-administrator-credentials), [Docker](/docs/install/platform/docker#retrieve-the-administrator-credentials), [Windows](/docs/install/platform/windows#retrieve-the-administrator-credentials).

## WebUI does not open

Until the setup is complete, the server listens only on port 8080 with plain HTTP, and the startup output names the port: `No configuration file was found. Port <port> is open for initial setup.` in bootstrap mode, `Port <port> is open for troubleshooting and recovery.` in recovery mode. Use `http://`, not `https://`, on that port. See Step 2 on each platform page, for example [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-2-open-the-setup-wizard).

After the setup, the WebUI is at `https://<hostname>/admin`, and sign-in works only there. Over plain HTTP, port 8080 included, sign-in fails with `Unknown client id`; over HTTPS on an IP address or another host name it fails with `Client metadata documents are disabled`. `/admin` returns `404 Not Found` when the server could not download the WebUI. See Step 5, for example [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-5-sign-in-to-the-webui). When HTTPS cannot work yet, [HTTPS not available yet](/docs/install/platform/linux#https-not-available-yet) describes how to sign in over plain HTTP in recovery mode.

## Setup wizard reports an error

The wizard refuses a hostname or domain that does not end in a public suffix such as `.com`, or in one of the reserved test domains, with `Invalid server hostname` or `Invalid default domain`. It checks both names only when **Finish setup** is pressed on the last screen: it then returns to the first screen with the error, and saves nothing.

The wizard writes nothing when the directory or database already holds the data of a Stalwart server, and reports `The selected data store has already been initialized.` Do not complete the wizard for a server that already has data. Restore its `config.json` instead, as described in [Setup wizard on an existing server](/docs/configuration/bootstrap-mode#setup-wizard-on-an-existing-server).

[Setup wizard](/docs/install/setup-wizard) lists every field and error of the wizard.

## Setup wizard appears again

The server starts in bootstrap mode whenever the configuration file named by `--config` does not exist, and it does not look at the data store to decide, so the wizard returns even on a server that already holds data. Either the wizard did not write the file where the server looks for it, or the file was lost, for example with a container volume that is not persistent. With Docker, the setup wizard reappears after a restart when the `/etc/stalwart` volume is missing from the command, or when the container was recreated without it.

Do not complete the wizard again for a server that has data: the wizard refuses a data store that already holds the data of a Stalwart server, and the existing configuration is what the server needs. Restore or remount `config.json` and restart, as described in [Setup wizard on an existing server](/docs/configuration/bootstrap-mode#setup-wizard-on-an-existing-server).

## Server exits at start

The last lines of the server output give the reason: `Startup failed: Failed to read data store settings at <path>: <error>`, `Startup failed: Failed to parse data store settings at <path>: <error>`, or `Unsupported database schema version, aborting startup.` for a data store written by another Stalwart version. See Step 4, for example [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-4-restart-the-server).

When the data store belongs to another Stalwart version, the server logs `Unsupported database schema version, aborting startup.` followed by `The data store was created by a Stalwart version prior to 1.0 (schema version <n>) and cannot be opened by this version.` or `The data store was created by a newer Stalwart version (schema version <n>, expected <m>).`. Data from a release before 1.0 is moved with the [migration guide](/docs/migration/), and a store written by a newer release needs that newer binary.

## A port fails to bind

When the server cannot bind the address of a listener, it skips that listener, starts the others, and logs a `registry.build-error` event for the listener with the reason `Failed to bind to <address>: <error>` ([Applying changes](/docs/server/listener#applying-changes)). Two causes account for most cases:

- **Another process uses the port.** On port 25 this is usually another mail server, such as Postfix or Exim, installed with the operating system. Stop and disable it. The systemd unit written by the installation script declares a conflict with Postfix, Sendmail and Exim, so starting one of them stops Stalwart.
- **Permission denied on a port below 1024.** On Linux the server runs as an unprivileged user and needs the `CAP_NET_BIND_SERVICE` capability, which the service written by the installation script and the container image provide. A unit written by hand, or the binary started from a shell as a normal user, lacks it. Add `AmbientCapabilities=CAP_NET_BIND_SERVICE` to the unit, or start the server as root with `RUN_AS_USER` and `RUN_AS_GROUP` set, so that it binds the ports and then drops privileges.

## Certificate warning in the browser

Until a certificate has been issued, the server presents a self-signed certificate for `localhost`. A warning that persists after the restart means that the ACME order is failing, and the log records each failure as an `acme.auth-error` or `acme.order-invalid` event. The usual causes are a name in the certificate that does not resolve to the server, such as `autoconfig` or `mta-sts` under the domain, a server hostname outside the default domain, and port 443 not reachable from the internet. See Step 5, for example [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-5-sign-in-to-the-webui). A connection to the server by IP address always produces a warning, because certificates are issued for names.

Two cases need a change of configuration rather than a new order:

- **The certificate does not cover the hostname.** The default certificate covers only names inside the default domain, so a hostname outside it, for example `mail.example.net` for the domain `example.com`, needs a certificate of its own, as described in [Names in a certificate](/docs/server/tls/acme/configuration#names-in-a-certificate). Choosing a hostname inside the domain avoids this.
- **The server is for testing and has no public DNS.** The wizard accepts names under a reserved top-level domain such as `test`, `internal` or `lan`, but Let's Encrypt cannot validate them, so the order fails and the server keeps presenting its self-signed certificate. Add the hostname to the hosts file (`/etc/hosts`) of the machines that connect to the server, disable **Automatically Obtain TLS Certificate** in the wizard, and install a certificate by hand as described in [Certificates](/docs/server/tls/certificates).

### Certificate not issued

The server retries a failed certificate order automatically, at growing intervals of up to six hours, so the certificate arrives without further action once the cause is fixed. [TLS certificates](/docs/domains/tls-certificates) describes how to start a new order at once instead.

With automatic DNS management, the server requests the certificate only once the DNS records are published, and Let's Encrypt validates the order through a temporary TXT record in the zone (the DNS-01 challenge), so port 443 and the CNAME records play no part. The certificate covers the domain and every name one level below it, such as `mail.example.com`. When the log shows no certificate order at all, the DNS update has not succeeded yet, and [Failures](/docs/domains/dns-records#failures) describes how to find its reason.

With manual DNS management, the certificate covers the names `mta-sts`, `autoconfig`, `autodiscover` and `ua-auto-config` under the default domain, and also the server hostname when it lies within the default domain. Let's Encrypt connects to each of these names on port 443 to confirm that it belongs to this server, and when one name fails this check, it issues no certificate at all. Every one of these names must therefore resolve to the server, which is why the tutorials create them as CNAME records pointing at the hostname before the restart, and why the zone file of Step 6 lists them. The other usual causes with manual DNS management are port 443 not reachable from the internet and a reverse proxy or load balancer that terminates TLS in front of the server. [Failed orders](/docs/server/tls/acme/configuration#failed-orders) describes the remaining causes.

## Links and redirects point to the wrong address

The OAuth, OpenID Connect and JMAP discovery documents publish URLs built from one base URL, by default `https://` followed by the server hostname. Behind a reverse proxy or on an HTTPS port other than 443, the server must be configured with the URL clients use, as described in [Reverse proxy](/docs/server/reverse-proxy/). [Public URLs](/docs/configuration/environment-variables#public-urls) gives the order in which the server determines the base URL.

## Nothing is logged

With the *Log file* destination, the server writes daily files named `stalwart.log.<date>` to `/var/log/stalwart/`. A container has no such directory, so the server writes nothing there, and containers use the *Console* destination instead. Errors raised before the configuration has been loaded always go to the server output. See the logging screen in Step 3, for example [Docker](/docs/install/platform/docker#screen-4-logging), and [Tracers](/docs/telemetry/tracing/tracers).

## DNS records do not resolve

Step 6 explains a second SPF record, an MX record that still points at a previous provider and records that have not propagated, for example on [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-6-publish-the-dns-records). [DNS records](/docs/install/dns) describes each record.

## Mail client cannot sign in or send

Step 8 explains `NO [AUTHENTICATIONFAILED] Authentication failed` (IMAP), and `535 5.7.8 Authentication credentials invalid.`, `503 5.5.1 You must authenticate first.` and `501 5.5.4 You are not allowed to send from this address.` (SMTP), for example on [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-8-send-and-receive-a-test-message).

## Test message not delivered

A message that stays in the queue with the error `Connection timeout` means that outbound port 25 is blocked. Step 8 explains rejection by the receiver, delivery to the spam folder and a reply that does not arrive, for example on [Linux, macOS and FreeBSD](/docs/install/platform/linux#step-8-send-and-receive-a-test-message).

## Docker: the server cannot write to a mounted host directory

The image runs the server as the user `stalwart` with UID and GID 2000. Named volumes receive the right ownership automatically, but host directories mounted as volumes, such as `-v /srv/stalwart/etc:/etc/stalwart`, must be owned by UID 2000 before the container starts: `sudo chown -R 2000:2000 /srv/stalwart/etc /srv/stalwart/data`.

## Docker: the container fails to execute the binary

The binary carries the `cap_net_bind_service` file capability, which lets it bind ports below 1024 without `--cap-add` or `--privileged`. A container started with `--cap-drop NET_BIND_SERVICE` cannot run it.

## Docker: ports 587, 143 and 110 do not answer

The image declares them, but no listener uses them by default. Publish them only after creating the corresponding listeners, as described in [Listeners](/docs/server/listener).

## Windows: the service does not start or stop cleanly

The Windows binary has no service mode of its own and must run under a service wrapper such as NSSM, which stops it by sending Ctrl+C (the **Generate Control-C** option). Start-up errors appear in the file to which the wrapper writes standard error. A service that does not stop cleanly has a stop method other than **Generate Control-C** selected on the **Shutdown** tab. The other methods end the process without a clean shutdown. See [Install the service with NSSM](/docs/install/platform/windows#install-the-service-with-nssm).

## macOS: where the service and its output are

The installation script writes the launchd daemon `/Library/LaunchDaemons/stalwart.plist` with the label `stalwart`. It runs as `_stalwart`, starts at boot, and launchd restarts it whenever it exits. The service reads environment variables from `/etc/stalwart/stalwart.env` at each start. Read the server output with `sudo log show --predicate 'process == "stalwart"' --last 5m`, and restart the service with `sudo launchctl kickstart -k system/stalwart`.
