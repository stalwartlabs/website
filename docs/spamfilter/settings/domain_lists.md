---
sidebar_position: 5
---

# Domain Lists

Some of the lists stored as [lookup lists](/docs/storage/lookup/local) provide the spam filter with guidelines on handling emails from or containing specific domains. These lists contain one domain per line and are used to categorize domains based on their characteristics and help streamline the email filtering process. Let's delve into the details of each list:

## Trusted domains

The `lookup.trusted-domains` lookup list contains domain names that are considered trustworthy. Domains included in this list are not checked against DNS block lists.

## Disposable Domains

The `lookup.disposable-providers` lookup list identifies domains associated with providers offering disposable email addresses. Such addresses are typically used for temporary communication and can be discarded after use. Emails from domains listed here do not directly influence the spam score of the message. However, when these domains are assessed in conjunction with other rules, the spam score might be affected.

## Free Domains

The `lookup.freemail-providers` lookup list contains domain names associated with providers that offer free email addresses. Such providers include popular webmail services where users can sign up for a free email account. Emails originating from these domains do not directly alter the spam score of the message. The spam filter, however, can adjust the score when these domains are evaluated in relation to other rules. For instance, if an email has a "From" address from one free email provider and a "Reply-To" address from another provider, it could be deemed suspicious and affect the spam score.

## URL Redirectors

The `lookup.url-redirectors` lookup list contains domain names that are recognized as URL redirectors. URL redirectors are services, like bit.ly, that provide shortened URLs which, when accessed, redirect the user to the original, longer URL.  When the spam filter identifies URLs from these domains within the message body, it actively follows the redirect to ascertain its final destination. The filter is also equipped to follow nested redirects, ensuring that even multi-layered redirections are resolved to their ultimate URLs.

