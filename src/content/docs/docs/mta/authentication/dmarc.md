---
sidebar_position: 4
title: "DMARC"
description: "How Stalwart evaluates the DMARC policy of incoming messages, what the strict mode rejects, how messages with several author domains are handled, and how to test the evaluation."
---

SPF and DKIM each authenticate a domain, but not necessarily the domain that recipients see. A message can pass SPF for one domain and carry a valid DKIM signature from another, while its `From` header names a third. Domain-based Message Authentication, Reporting and Conformance ([DMARC](https://www.rfc-editor.org/rfc/rfc9989), RFC 9989) closes this gap by tying the authentication results to the `From` domain.

A domain owner publishes a DMARC policy in a TXT record at `_dmarc.<domain>`. A message passes DMARC when SPF or DKIM passes for a domain that is aligned with the `From` domain. An aligned domain is the same domain or, in relaxed alignment, a domain with the same organisational domain. The policy, in the `p=` tag, tells receivers what to do with messages that fail:

- `none`: deliver the message.
- `quarantine`: treat the message as suspicious.
- `reject`: refuse the message.

The policy also asks receivers to send reports about the messages they evaluated ([DMARC reports](/docs/mta/reports/dmarc)).

Stalwart evaluates the DMARC policy of incoming messages at the [DATA stage](/docs/mta/inbound/data#order-of-processing), after SPF, DKIM and DKIM2, and it follows the policy discovery of RFC 9989. When the `From` domain has no record, the record of its organisational domain applies. In that case the `sp=` tag gives the policy for subdomains, and the `np=` tag the policy for subdomains that do not exist. The `t=y` tag marks a policy as being tested, and Stalwart applies a record that carries it one level more leniently.

## Verification modes

Evaluation is controlled by [`dmarcVerify`](/docs/ref/object/sender-auth#dmarcverify) on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). The field is an expression that returns one of three modes. Its default expression applies `relaxed` on port 25 and `disable` on the other ports:

```json
{
  "dmarcVerify": {
    "match": {"0": {"if": "local_port == 25", "then": "relaxed"}},
    "else": "disable"
  }
}
```

The modes decide whether the result of the evaluation can refuse a message:

| Mode | Effect |
|---|---|
| `relaxed` | Evaluate the policy and record the result in the `Authentication-Results` header, for the spam filter and for reports; never reject because of the policy. |
| `strict` | As `relaxed`, and also refuse messages that fail DMARC when the applicable policy is `reject`. |
| `disable` | Do not evaluate DMARC. |

In `strict` mode, a message that fails DMARC under a `reject` policy is refused with `550 5.7.1 Email rejected per DMARC policy.` When the evaluation of such a message hits a temporary DNS error, the message is refused with `451 4.7.1 Email temporarily rejected per DMARC policy.` instead. A message that fails under a `quarantine` or `none` policy is never refused by the MTA.

In both `relaxed` and `strict` modes, the result reaches the [spam filter](/docs/spamfilter/settings/scores#authentication-tags) as a tag. A failure is tagged `DMARC_POLICY_REJECT`, `DMARC_POLICY_QUARANTINE` or `DMARC_POLICY_SOFTFAIL`, according to the policy that applied, and a pass is tagged `DMARC_POLICY_ALLOW`. The failure tags add to the spam score. A `quarantine` policy therefore makes the message more likely to be classified as spam and delivered to the Junk folder, which is what RFC 9989 describes for quarantined mail, although the effect comes only through the score.

Enabling `strict` on port 25 applies the published wish of domain owners to have unauthenticated mail in their name rejected:

```json
{
  "dmarcVerify": {
    "match": {"0": {"if": "local_port == 25", "then": "strict"}},
    "else": "disable"
  }
}
```

The cost of `strict` falls on forwarded mail. Legitimate mail can still fail DMARC when it passes through a forwarder or mailing list that modifies it and does not re-sign it, as [RFC 7960](https://www.rfc-editor.org/rfc/rfc7960) describes. With `strict`, such mail is refused when its domain publishes `p=reject`.

## Messages with several author domains

DMARC evaluates a single author domain, the domain of the `From` header. A `From` header may, however, list several mailboxes. RFC 9989 (section 5.3.1) leaves messages whose mailboxes are in more than one domain outside DMARC. Attackers use such messages to show a spoofed domain while escaping its policy, and section 11.5 therefore allows receivers to reject them.

Stalwart does so whenever `dmarcVerify` is `relaxed` or `strict`. It refuses a message from an unauthenticated client whose `From` header holds addresses in more than one domain, with `550 5.7.1 Multiple author domains in From header are not allowed.`, and logs `smtp.multiple-from-domains`. Domains are compared without regard to case, and internationalised domain names are compared in their ASCII form. The rejection does not depend on the policies of the domains involved, and it applies in `relaxed` mode as well. Messages from authenticated users and messages generated by Stalwart are not affected. When a system legitimately sends such messages, disable DMARC verification for the listener or client concerned with the `dmarcVerify` expression.

## Testing

The `TroubleshootDmarc` [action](/docs/management/tasks-actions/actions) shows how Stalwart would evaluate a message without delivering anything. It evaluates SPF, DKIM, DKIM2, ARC and DMARC as if the message had been received from a given IP address, with a given EHLO name, envelope sender and recipients (`rcptTo`), and it reports each result. This shows why a message from a particular sender passes or fails DMARC, for example whether the SPF or the DKIM domain is aligned with the `From` domain.
