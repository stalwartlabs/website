---
sidebar_position: 2
---

# Connect stage

The connect stage is the initial stage of an SMTP session, where the server and client establish a connection. It determines the hostname and greeting the server advertises, and can run a Sieve script against the incoming connection.

Connect-stage behaviour is configured on the [MtaStageConnect](/docs/ref/object/mta-stage-connect) singleton (found in the WebUI under <!-- breadcrumb:MtaStageConnect --><!-- /breadcrumb:MtaStageConnect -->).

## Hostname

The [`hostname`](/docs/ref/object/mta-stage-connect#hostname) field is an expression that returns the hostname the server uses to identify itself during the SMTP session. By default it resolves to the system hostname via `system('hostname')`.

## Greeting

The [`smtpGreeting`](/docs/ref/object/mta-stage-connect#smtpgreeting) field is an expression that returns the greeting message sent to the client when the SMTP session begins. The default greeting combines the system hostname with `Stalwart ESMTP at your service`.

## Sieve script

The [`script`](/docs/ref/object/mta-stage-connect#script) field selects a [Sieve script](/docs/sieve/overview) to run before the SMTP session is allowed to proceed. This is typically used to filter connections by remote IP address: an expression selects the script name at runtime, and the script itself may reject the connection based on connection-level variables such as `remote_ip`.

For example, setting [`script`](/docs/ref/object/mta-stage-connect#script) to the expression `"'connect_filter'"` runs a Sieve script named `connect_filter` which can inspect `env.remote_ip` and reject unwanted sources:

```sieve
require ["variables", "reject"];

if string "${env.remote_ip}" "192.0.2.88" {
    reject "Connection from this IP is not accepted.";
}
```
