---
sidebar_position: 6
---

# Reporting events

## report.incoming.dmarc

Triggered for incoming DMARC reports and contains the following fields:

- `rangeFrom` (String): Start date of the reporting period.
- `rangeTo` (String): End date of the reporting period.
- `domain` (String): Domain for which the report applies.
- `reportEmail` (String): Email address to send the report to.
- `reportId` (String): Unique identifier for the report.
- `dmarcPass` (u32): Number of messages that passed DMARC.
- `dmarcQuarantine` (u32): Number of messages that were quarantined by DMARC.
- `dmarcReject` (u32): Number of messages that were rejected by DMARC.
- `dmarcNone` (u32): Number of messages with no DMARC policy.
- `dkimPass` (u32): Number of messages that passed DKIM.
- `dkimFail` (u32): Number of messages that failed DKIM.
- `dkimNone` (u32): Number of messages with no DKIM policy.
- `spfPass` (u32): Number of messages that passed SPF.
- `spfFail` (u32): Number of messages that failed SPF.
- `spfNone` (u32): Number of messages with no SPF policy.

Example:

```json
{
    "rangeFrom": "2023-06-01",
    "rangeTo": "2023-06-07",
    "domain": "example.com",
    "reportEmail": "dmarc@example.com",
    "reportId": "report-12345",
    "dmarcPass": 10,
    "dmarcQuarantine": 2,
    "dmarcReject": 1,
    "dmarcNone": 5,
    "dkimPass": 12,
    "dkimFail": 1,
    "dkimNone": 5,
    "spfPass": 12,
    "spfFail": 1,
    "spfNone": 5
}
```

## report.incoming.tls

Triggered for incoming TLS reports and contains an array of `Policy` objects with the following fields:

- `rangeFrom` (String): Start date of the reporting period.
- `rangeTo` (String): End date of the reporting period.
- `domain` (String): Domain for which the report applies.
- `reportContact` (String|null): Contact email for the report.
- `reportId` (String): Unique identifier for the report.
- `policyType` (PolicyType): Type of the TLS policy.
- `totalSuccesses` (u32): Total number of successful connections.
- `totalFailures` (u32): Total number of failed connections.
- `details` ({resultType : u32}): Detailed breakdown of results.

Example:

```json
{
    "policies": [
        {
            "rangeFrom": "2023-06-01",
            "rangeTo": "2023-06-07",
            "domain": "example.com",
            "reportContact": "admin@example.com",
            "reportId": "tls-report-12345",
            "policyType": "tlsa",
            "totalSuccesses": 50,
            "totalFailures": 5,
            "details": {
                "starttls-not-supported": 45,
                "tlsa-invalid": 5
            }
        }
    ]
}
```

## report.incoming.arf

Triggered for incoming Abuse Reporting Format (ARF) reports and contains the following fields:

- `feedbackType` (String): Type of feedback (abuse, fraud, etc).
- `arrivalDate` (String): Date the report was received.
- `authenticationResults` ([String]): List of authentication results.
- `incidents` (u32): Number of incidents reported.
- `reportedDomains` ([String]): List of reported domains.
- `reportedUris` ([String]): List of reported URIs.
- `reportingMTA` (String): Reporting Mail Transfer Agent.
- `sourceIp` (String): Source IP address of the report.
- `userAgent` (String): User agent of the report.
- `authFailureType` (String): Type of authentication failure.
- `deliveryResult` (String): Delivery result (delivered, failed, etc).
- `dkimDomain` (String): DKIM domain.
- `dkimIdentity` (String): DKIM identity.
- `dkimSelector` (String): DKIM selector.
- `identityAlignment` (String): Alignment of the identity.

Example:

```json
{
    "feedbackType": "abuse",
    "arrivalDate": "2023-06-21",
    "authenticationResults": ["dkim=pass header.d=example.com"],
    "incidents": 1,
    "reportedDomains": ["example.com"],
    "reportedUris": ["http://example.com"],
    "reportingMTA": "mta.example.com",
    "sourceIp": "192.0.2.4",
    "userAgent": "Mozilla/5.0",
    "authFailureType": "dmarc",
    "deliveryResult": "delivered",
    "dkimDomain": "example.com",
    "dkimIdentity": "user@example.com",
    "dkimSelector": "selector1",
    "identityAlignment": "pass"
}
```

## report.outgoing

Triggered for outgoing DMARC or TLS reports and contains the following fields:

- `queueId` (u64): The ID of the message in the queue.
- `returnPath` (String): The return path of the message.
- `recipients` ([String]): The list of recipients.
- `nextRetry` (RFC3339): The next retry time.
- `nextDSN` (RFC3339): The next DSN time.
- `expires` (RFC3339): The delivery expiration time.

Example:

```json
{
    "queueId": 12345,
    "returnPath": "bounce@example.com",
    "recipients": ["recipient@example.com"],
    "nextRetry": "2023-06-21T15:55:00Z",
    "nextDSN": "2023-06-21T16:55:00Z",
    "expires": "2023-06-22T14:55:00Z",
    "size": 1024
}
```
