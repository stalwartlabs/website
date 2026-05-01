---
sidebar_position: 2
title: "Connect stage"
---

The connect stage is the initial stage of an SMTP session, where the server and client establish a connection. It determines the hostname and greeting the server advertises, and can run a Sieve script against the incoming connection.

Connect-stage behaviour is configured on the [MtaStageConnect](/docs/ref/object/mta-stage-connect) singleton (found in the WebUI under <!-- breadcrumb:MtaStageConnect --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › Connect Stage<!-- /breadcrumb:MtaStageConnect -->).

## Hostname

The [`hostname`](/docs/ref/object/mta-stage-connect#hostname) field is an expression that returns the hostname the server uses to identify itself during the SMTP session. By default it resolves to the system hostname via `system('hostname')`.

## Greeting

The [`smtpGreeting`](/docs/ref/object/mta-stage-connect#smtpgreeting) field is an expression that returns the greeting message sent to the client when the SMTP session begins. The default greeting combines the system hostname with `Stalwart ESMTP at your service`.

## Sieve script

The [`script`](/docs/ref/object/mta-stage-connect#script) field selects a [Sieve script](/docs/sieve/) to run before the SMTP session is allowed to proceed. This is typically used to filter connections by remote IP address: an expression selects the script name at runtime, and the script itself may reject the connection based on connection-level variables such as `remote_ip`.

For example, setting [`script`](/docs/ref/object/mta-stage-connect#script) to the expression `"'connect_filter'"` runs a Sieve script named `connect_filter` which can inspect `env.remote_ip` and reject unwanted sources:

```sieve
require ["variables", "reject"];

if string "${env.remote_ip}" "192.0.2.88" {
    reject "Connection from this IP is not accepted.";
}
```
