---
sidebar_position: 1
title: "Overview"
description: "What a Domain controls in Stalwart, how to add and verify a domain, which names are accepted, and what deleting a domain does."
---

A domain is a mail domain the server hosts, such as `example.com`. Domains draw the line between local and remote mail. Stalwart accepts mail for an address only if its domain is one of its own. For any other domain, it acts as a relay at most.

Each hosted domain is a [Domain](/docs/ref/object/domain) object (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->). The object carries everything the server does on behalf of the domain: how recipients are resolved, how its outgoing mail is signed with DKIM, how its TLS certificate is obtained, and how its DNS records are published. The setup wizard creates the first domain, and others are added as described below.

## Domain settings

The settings of a domain fall into a few groups, each explained on its own page.

The first group is the domain's names. [`name`](/docs/ref/object/domain#name) is the domain name, and [`aliases`](/docs/ref/object/domain#aliases) lists further names that are handled as the same domain. [Addresses, aliases and catch-all](/docs/domains/addresses#domain-aliases) explains what alias domains share with the primary.

The same page covers the second group, recipients. [`catchAllAddress`](/docs/ref/object/domain#catchalladdress), [`subAddressing`](/docs/ref/object/domain#subaddressing) and [`allowRelaying`](/docs/ref/object/domain#allowrelaying) decide how addresses that do not match an account are handled.

Three further settings decide whether the server manages a part of the domain itself, or leaves it to the administrator. Each is either `Automatic` or `Manual`. Automatic management removes routine work, such as rotating keys or renewing certificates:

| Setting | With `Automatic` | Explained in |
|---|---|---|
| [`dkimManagement`](/docs/ref/object/domain#dkimmanagement) | The server generates and rotates the domain's DKIM signing keys. | [DKIM key rotation](/docs/domains/dkim-rotation) |
| [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) | An ACME provider obtains and renews the domain's TLS certificate. | [TLS certificates](/docs/domains/tls-certificates) |
| [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) | The server publishes the domain's records through a DNS provider. | [Automatic DNS records](/docs/domains/dns-records) |

Whichever DNS mode is chosen, the read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) contains the records the domain needs. A domain under manual DNS management is therefore set up by copying them into the zone, as described in [Setting up DNS](/docs/install/dns).

Other mail servers and certificate authorities send reports about a domain: DMARC results, TLS failures and CAA problems. The domain's DMARC, TLS reporting and CAA records publish the address that receives them. That address is [`reportAddressUri`](/docs/ref/object/domain#reportaddressuri), which is <!-- default:Domain.reportAddressUri -->`mailto:postmaster`<!-- /default --> unless it is changed. Setting it to null publishes no report address.

Finally, [`enable`](/docs/ref/object/domain#enable) can be turned off to stop accepting mail for the domain without deleting it.

Accounts belong to a domain. An account's address is its name in its domain, while its aliases may be in any hosted domain.

## Add and verify a domain

Adding a domain takes four steps. The domain must exist on the server, its DNS records must be published so that other servers can find it and trust its mail, and it needs addresses to receive mail for.

1. Create the Domain in the WebUI, or with the CLI:

   ```sh
   stalwart-cli create domain \
     --field name=example.com \
     --field 'certificateManagement={"@type":"Manual"}' \
     --field 'dkimManagement={"@type":"Automatic"}' \
     --field 'dnsManagement={"@type":"Manual"}' \
     --field 'subAddressing={"@type":"Enabled"}'
   ```

   Only `name` is required. `certificateManagement`, `dkimManagement`, `dnsManagement` and `subAddressing` have defaults, listed in the [Domain reference](/docs/ref/object/domain), and may be omitted. In the WebUI, each of these fields is selected from its variants. To have the certificate and the records managed by the server, choose `Automatic`, with an existing ACME provider and DNS provider, instead.
2. Publish the DNS records. With automatic DNS management, they are published when the domain is saved. With manual DNS management, copy them from the zone file (**View Zone File** in the domain's menu, or `stalwart-cli get domain <id> --fields dnsZoneFile`) into the zone, as described in [Setting up DNS](/docs/install/dns).
3. Verify the records with a public resolver, for example `dig +short @1.1.1.1 MX example.com` and the other queries listed in [Verifying the records](/docs/install/dns#verifying-the-records).
4. Create accounts in the domain, or aliases of existing accounts.

The order of these steps matters when DKIM is automatic but DNS is manual. The server then creates the domain's DKIM keys as active keys, and starts signing outgoing mail with them at once. Until their records are published, receivers cannot verify the signatures, so messages from the domain fail DKIM. Publish the DKIM records from the zone file before users send mail from the domain. With automatic DNS management the problem does not arise, because new keys are published before they are used.

## Accepted domain names

Not every name is accepted as a domain. A domain name must end in one of two kinds of suffix:

- A public suffix, such as `.com` or `.co.uk`, from the Public Suffix List compiled into the server.
- One of the reserved top-level domains `test`, `localhost`, `local`, `internal`, `lan`, `home`, `corp`, `intranet`, `private` and `localdomain`. These endings are meant for test and internal deployments.

The name must also contain a dot, unless it is one of the reserved names itself. Names under any other ending, such as an internal `.mail` or `.office` domain, are refused with `Invalid domain name`, and no setting overrides the rule.

## Deleting a domain

A domain can be deleted only once nothing else refers to it. The following can refer to a domain:

- The [DkimSignature](/docs/ref/object/dkim-signature) objects that a domain with automatic DKIM management owns
- The accounts, groups and mailing lists in the domain
- Aliases in the domain, held by accounts of other domains
- The `defaultDomainId` of the SystemSettings singleton

While any of them refers to the domain, deleting it fails with `objectIsLinked`. The error lists the objects that still refer to it, as described in [Removing objects](/docs/management/cli/delete#common-failures).

Deleting a domain does not clean up its DNS zone. Neither deleting the domain nor turning off one of its record types in automatic DNS management deletes records at the DNS provider. The records stay in the zone until they are removed by hand, as described in [Records Stalwart does not remove](/docs/server/dns/provider-notes#records-stalwart-does-not-remove).

## Enterprise settings

:::tip[Enterprise feature]
The following domain settings are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

- [`memberTenantId`](/docs/ref/object/domain#membertenantid) assigns the domain to a [tenant](/docs/auth/authorization/tenants), whose administrators then manage it.
- [`directoryId`](/docs/ref/object/domain#directoryid) selects the [directory](/docs/install/directory) in which the domain's accounts are looked up. When it is unset, the server's default directory is used.
- [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) lets an identity provider create, update, suspend and delete the domain's accounts over [SCIM](/docs/auth/scim/). SCIM then becomes the only authority for those accounts. Sign-ins through the directory no longer change them, and a user who signs in before being provisioned is refused. [Provisioning models](/docs/auth/scim/provisioning) compares SCIM with provisioning at sign-in.
- [`logo`](/docs/ref/object/domain#logo) sets the logo shown in the WebUI to users of the domain, as an `https` URL or a base64-encoded image.
