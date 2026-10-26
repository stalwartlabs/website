---
sidebar_position: 2
title: "SPF"
description: "How Stalwart verifies the SPF records of the EHLO and MAIL FROM domains, what the relaxed and strict modes do, the replies for each result, and how the results are used."
---

Any SMTP client can claim any domain in the envelope of a message, so a receiving server needs a way to tell whether the client is allowed to send for that domain. The Sender Policy Framework ([SPF](https://www.rfc-editor.org/rfc/rfc7208), RFC 7208) provides one. A domain publishes, in a TXT record, the IP addresses that may send mail with that domain in the SMTP envelope. A receiving server compares the client's IP address with the record and obtains one of seven results:

- `pass`: the address is authorised.
- `fail`: the address is not authorised.
- `softfail`: the address is probably not authorised.
- `neutral`: the domain makes no statement about the address.
- `none`: the domain has no record.
- `temperror`: a temporary DNS error prevented the check.
- `permerror`: the record is invalid.

SPF authenticates only the envelope. Its result therefore says nothing about the `From` header, which is the address that recipients see. [DMARC](/docs/mta/authentication/dmarc) connects the two through alignment.

## Identities

Stalwart checks two identities, and each has its own setting on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->):

- [`spfEhloVerify`](/docs/ref/object/sender-auth#spfehloverify) covers the domain that the client gave in `EHLO`. It is checked when the client sends `EHLO`.
- [`spfFromVerify`](/docs/ref/object/sender-auth#spffromverify) covers the domain of the envelope sender. It is checked at `MAIL FROM`. Bounces use the null sender `<>`, which has no domain, so for them the EHLO domain is checked as `postmaster@<EHLO domain>`, as RFC 7208 specifies.

The default expressions of both fields apply `relaxed` on port 25 and `disable` on the other ports. Mail that users submit is therefore not checked:

```json
{
  "spfEhloVerify": {
    "match": {"0": {"if": "local_port == 25", "then": "relaxed"}},
    "else": "disable"
  },
  "spfFromVerify": {
    "match": {"0": {"if": "local_port == 25", "then": "relaxed"}},
    "else": "disable"
  }
}
```

## Modes

Each field is an expression that returns one of three modes:

| Mode | Effect |
|---|---|
| `relaxed` | Perform the check and record the result in the `Received-SPF` and `Authentication-Results` headers, for DMARC, the spam filter and system Sieve scripts (`env.spf.result`, `env.spf_ehlo.result`). Never reject. |
| `strict` | Also refuse the command unless the result is `pass`. |
| `disable` | Do not perform the check. |

In `strict` mode, every result other than `pass` is refused. A `temperror` receives `451 4.7.24 Temporary SPF validation error.`, so the client retries later. The results `fail`, `softfail`, `neutral`, `none` and `permerror` receive `550 5.7.23 SPF validation failed, status: <result>.` The command that is refused depends on the identity: a strict EHLO check refuses the `EHLO` command, and a strict MAIL FROM check refuses `MAIL FROM`.

:::caution
`strict` is stricter than RFC 7208. The RFC leaves the handling of `softfail`, `neutral` and `none` to local policy and treats them as weaker than `fail`. A strict check, however, refuses mail from every domain that publishes no SPF record. It also refuses mail from domains whose records end in `~all` or `?all` for the sending server, and that includes mail forwarded by other servers. Use it only for listeners or senders where a passing SPF result is expected.
:::

In `relaxed` mode, the results do not refuse anything but still have consequences. They count towards the [spam score](/docs/spamfilter/settings/scores#authentication-tags), as tags such as `SPF_ALLOW`, `SPF_FAIL` and `SPF_SOFTFAIL`. They also count towards DMARC, which applies the domain owner's policy. Failed checks are reported to domains that request [SPF failure reports](/docs/mta/reports/spf), and are logged as `smtp.spf-ehlo-fail` and `smtp.spf-from-fail`.
