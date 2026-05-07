---
sidebar_position: 1
title: "Overview"
---

A **Domain** represents a local mail domain that the server recognises as its own. Without a matching Domain object, the server treats messages addressed to that domain as external and refuses delivery for them. The Domain is therefore the anchor for every downstream decision that depends on domain ownership: local-recipient resolution, DKIM signing, TLS certificate issuance, and the publication of DNS policy records.

Domains are configured through the [Domain](/docs/ref/object/domain) object (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->). Each record identifies a primary name and carries the settings that govern how the server handles mail and infrastructure for that name.

## Identity and aliases

The primary identifier is [`name`](/docs/ref/object/domain#name), the canonical domain name. Additional names that should be treated as equivalent to the primary name are listed in [`aliases`](/docs/ref/object/domain#aliases); these are recognised as local for the purpose of accepting incoming mail and do not require a separate Domain object. Administrators group alias names under the primary record rather than duplicating configuration across multiple Domains, which keeps DKIM, DNS, and TLS settings in a single place.

A domain can be disabled without deletion by clearing [`isEnabled`](/docs/ref/object/domain#isenabled); disabled domains are retained in the database but are no longer accepted as local. The [`description`](/docs/ref/object/domain#description) field carries an operator-facing note, and [`logo`](/docs/ref/object/domain#logo) holds a branding image used by the WebUI when a user signs in under the domain. In multi-tenant deployments, [`memberTenantId`](/docs/ref/object/domain#membertenantid) assigns ownership to a [Tenant](/docs/ref/object/tenant), and [`directoryId`](/docs/ref/object/domain#directoryid) points to the [Directory](/docs/ref/object/directory) in which accounts for the domain are looked up. Leaving the directory unset falls back to the internal directory.

## Mail handling

Recipient resolution for the domain is shaped by three fields. [`catchAllAddress`](/docs/ref/object/domain#catchalladdress) names a fallback mailbox that receives messages addressed to unknown local recipients; leaving it unset causes unknown recipients to be rejected at SMTP time. [`subAddressing`](/docs/ref/object/domain#subaddressing) controls plus-addressing behaviour: the `Enabled` variant accepts `user+tag@domain` and delivers to `user@domain`, the `Disabled` variant turns the feature off, and the `Custom` variant runs an expression against the recipient to decide how the local part is canonicalised. [`allowRelaying`](/docs/ref/object/domain#allowrelaying) opts the domain into relaying for recipients that are not local, which is required in split-delivery or smart-host setups and should remain disabled otherwise.

The [`reportAddressUri`](/docs/ref/object/domain#reportaddressuri) field sets the mailbox that receives DMARC aggregate, TLS-RPT, and CAA incident reports generated for the domain. The default is `mailto:postmaster`; setting the field to null suppresses report generation for the domain.

## Linked infrastructure

Three fields on the Domain link it to the objects that manage its externally visible infrastructure:

- [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) selects manual or automatic DNS record publication. The `Automatic` variant references a [DnsServer](/docs/ref/object/dns-server) through [`dnsServerId`](/docs/ref/object/domain#dnsserverid) and controls which record types the server keeps in sync. See [DNS records](/docs/domains/dns-records) for the record management workflow.
- [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) selects manual or ACME-driven TLS management. The `Automatic` variant references an [AcmeProvider](/docs/ref/object/acme-provider) through [`acmeProviderId`](/docs/ref/object/domain#acmeproviderid); the `Manual` variant relies on [Certificate](/docs/ref/object/certificate) objects supplied by the operator. See [TLS certificates](/docs/domains/tls-certificates) for the details.
- [`dkimManagement`](/docs/ref/object/domain#dkimmanagement) selects manual or automatic DKIM key generation and rotation. The `Automatic` variant drives the creation, publication, and retirement of [DkimSignature](/docs/ref/object/dkim-signature) records for the domain. See [DKIM key rotation](/docs/domains/dkim-rotation) for the rotation lifecycle.

The read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field exposes the current set of DNS records the server expects to be published for the domain. When DNS management is manual, administrators copy this zone data into the external DNS provider; when DNS management is automatic, the server reconciles the same records against the configured [DnsServer](/docs/ref/object/dns-server).
