---
sidebar_position: 2
title: "Connect stage"
description: "The first stage of an SMTP session: the host name and greeting the server presents, and filtering connections with a Sieve script, milter or MTA hook."
---

The connect stage is the first point at which Stalwart can act on an SMTP client. It starts when a client opens a connection, before the client has sent any command. At this point the server knows only two things: the client's IP address and the listener the client connected to. The server answers with its greeting, which announces its name and invites the client to continue. Settings at this stage decide which name the server presents, and a filter can refuse an unwanted client before it sends anything.

The stage is configured on the [MtaStageConnect](/docs/ref/object/mta-stage-connect) singleton (found in the WebUI under <!-- breadcrumb:MtaStageConnect --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › Connect Stage<!-- /breadcrumb:MtaStageConnect -->). Its expressions can use the [connection variables](/docs/ref/expression/variable/mta-connection-variable): `listener`, `remote_ip`, `remote_port`, `local_ip`, `local_port`, `protocol`, `is_tls`, `asn` and `country`.

Some connections never reach the connect stage. A connection from an address in the [blocked IP addresses](/docs/server/auto-ban) list is refused before it. An inbound [throttle](/docs/mta/inbound/rate-limit) keyed on the client's IP address can also refuse a connection, and in that case the connection is closed without a greeting.

## Host name and greeting

The server uses a name for itself throughout the session, in its greeting and in its replies. That name is [`hostname`](/docs/ref/object/mta-stage-connect#hostname), and by default it is <!-- default:MtaStageConnect.hostname -->`system('hostname')`<!-- /default -->, which returns the host name of the system. The greeting itself is a separate setting, [`smtpGreeting`](/docs/ref/object/mta-stage-connect#smtpgreeting). The server sends it as `220 <greeting>`, and by default it is <!-- default:MtaStageConnect.smtpGreeting -->`system('hostname') + ' Stalwart ESMTP at your service'`<!-- /default -->.

The host name matters most on port 25. It should resolve to the server's IP address and match the PTR record of that address. Receiving servers compare these names when Stalwart delivers mail to them, and some refuse mail from servers whose names do not match. A server with several listeners can present a different name on each of them. The following object body presents a different name on a listener named `smtp-relay`:

```json
{
  "hostname": {
    "match": {"0": {"if": "listener == 'smtp-relay'", "then": "'relay.example.org'"}},
    "else": "system('hostname')"
  }
}
```

## Filtering connections

A connection can be filtered with a system [Sieve script](/docs/sieve/interpreter/trusted), a script that the administrator installs and that runs inside the server. [`script`](/docs/ref/object/mta-stage-connect#script) selects the script to run for each new connection: it returns the script's name, or `false` to run none. At this stage the script can test the environment variables of the connection, such as `env.remote_ip`, `env.asn` and `env.country` ([Variables](/docs/sieve/variables)). When the script rejects the connection, the server sends the reply and closes the connection, so the client cannot send any command.

The following script refuses connections from one IP address:

```sieve
require ["variables", "reject"];

if string "${env.remote_ip}" "192.0.2.88" {
    reject "554 5.7.1 Connection from this IP address is not accepted.";
}
```

<!-- sievepad { "environment": [ { "name": "remote_ip", "value": "192.0.2.88" } ] } -->
<p><a href="https://sievepad.com/#w=TY_BTsMwEER_ZbXiGFm0IqKEIxISNySOdYWMs22N4nWwN-EQReK7-By-hA1VAd9mx5p5M-GIzapCdpGwwSdx3bvLAm3ypYG7xExeoIg7EHx9fMJ96IRy4AP4kxcSF6yw-Bx6Kdhsp3NWdIEXJw3ZLzrT2xAywdbi6HJwLx0VixVYdV41yeLu1rLlsNe-nwqLFxPxaDLFJPQc-tmiHlc3a3Np1mazUTlZBn2nCDXr-gpqc21WZ3gFhH1OEeQYCjw8gmvbTKWAKk4CznvqhVpjUetnyzjvKoz6Qzcvg1QVElEgVRMqUMiJI7H8X_vLqJNH1w3L7Q9UM-f5Gw" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The reject text must start with a reply code. This example uses `554`, which RFC 5321 defines for a server that refuses a connection. A text without a code is sent as a protocol error reply ([Replies and actions](/docs/sieve/interpreter/trusted#replies-and-actions)). Once the script is installed, here under the name `connect-filter`, it is selected with the following `script` value:

```json
{
  "script": {"else": "'connect-filter'"}
}
```

Sieve is not the only filter at this stage. [Milters](/docs/mta/filter/milter) and [MTA hooks](/docs/mta/filter/mtahooks) whose stages include `connect` are consulted here as well. To refuse whole networks, no script is needed: the networks can be added to the blocked IP addresses instead.
