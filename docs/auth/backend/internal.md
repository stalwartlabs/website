---
sidebar_position: 2
---

# Internal

The internal directory handles credential validation, email address lookup, and storage of account-level settings such as disk quotas and group memberships. It is suitable for deployments where Stalwart is the primary identity store and no external directory is in use. All account management, including the creation of new accounts, password changes, and quota adjustments, is carried out directly on the server.

Internally, account records are kept in the configured [data store](/docs/storage/data), which is where account information is written to and read from.

## Configuration

The internal directory is selected by leaving [`directoryId`](/docs/ref/object/authentication#directoryid) unset on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><!-- /breadcrumb:Authentication -->). In that configuration Stalwart reads account records from the [DataStore](/docs/ref/object/data-store) singleton (found in the WebUI under <!-- breadcrumb:DataStore --><!-- /breadcrumb:DataStore -->), and no external Directory object is required.

## Account management

Account management is performed through the [WebUI](/docs/management/webui/overview), the JMAP API, or the [CLI](/docs/management/cli/overview), all of which operate on the same underlying objects ([Account](/docs/ref/object/account), [AccountPassword](/docs/ref/object/account-password), [AppPassword](/docs/ref/object/app-password), [ApiKey](/docs/ref/object/api-key), and related principals).
