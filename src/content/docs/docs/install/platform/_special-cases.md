### Reverse proxy

When clients reach the server through a reverse proxy, or on an HTTPS port other than 443, the URL in the browser differs from `https://<hostname>`, and the sign-in in Step 5 fails with `Client metadata documents are disabled` until the server is configured with the URL clients use. [Reverse proxy](/docs/server/reverse-proxy/) describes that configuration, which belongs before the restart in Step 4, together with the proxy itself.

Complete the setup wizard directly on port 8080, not through the proxy, because during the setup the WebUI accepts sign-in only from the address and scheme on which the request arrives. The [Reverse proxy](/docs/server/reverse-proxy/) page also explains how the clients' IP addresses reach the server, which matters because auto-ban, the blocking of addresses after repeated failed sign-ins, and rate limits depend on them.

### External directory

When an LDAP server, an SQL database or an OpenID Connect identity provider was selected as the directory in the wizard, the last screen shows no administrator account, because accounts from the directory exist in Stalwart only after their first sign-in. The administrator therefore promotes the first administrator after the restart in Step 4, with the help of the recovery administrator. This is a credential defined by the `STALWART_RECOVERY_ADMIN` environment variable, and it does not depend on the directory. Set the variable and restart, have the future administrator sign in once, and assign an administrator role to that account while signed in as the recovery administrator. Then remove the variable and restart again. [Promoting the first administrator](/docs/install/directory#promoting-the-first-administrator) gives the procedure, and [Choosing a directory](/docs/install/directory) explains the directory options.

The directory's own tools create the accounts, so Step 7 is replaced by an existing account of the directory.

### HTTPS not available yet

In normal operation, the WebUI accepts sign-in only over HTTPS on the server hostname. On port 8080, sign-in fails with `Unknown client id`, whatever the account. When HTTPS cannot work yet, for example because the hostname does not resolve or port 443 is not reachable, the WebUI is still available in [recovery mode](/docs/configuration/recovery-mode). Set `STALWART_RECOVERY_MODE=1` and `STALWART_RECOVERY_ADMIN=admin:<password>`, restart, and sign in at `http://<host>:8080/admin` with that credential.

Recovery mode runs no mail services. It serves only the WebUI and the management API, on port 8080 and without protection against password guessing, so keep the port off the internet, as described in [Protect the setup listener](/docs/install/security#protect-the-setup-listener). Once HTTPS works, remove both variables and restart.

The same procedure regains access when no administrator can sign in, for example because the external directory is unreachable or the administrator account was deleted. [Regain access](/docs/configuration/recovery-mode#regain-access) describes this use.

### Automated installation

A deployment tool can configure a new server without the wizard, in one of two ways. The wizard's fields correspond to the [Bootstrap](/docs/ref/object/bootstrap) object, and while the server runs in bootstrap mode, a tool can submit the same object through the JMAP API. Alternatively, it can write `config.json` and then apply a complete configuration as a plan with the CLI in recovery mode. [Bootstrap mode](/docs/configuration/bootstrap-mode) and [Declarative deployments](/docs/configuration/declarative-deployments) describe both methods.

### Reading the zone file with the CLI

The zone file of Step 6 is also available in the read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field of the domain, which the [CLI](/docs/management/cli/) can read. The first command lists the domains with their ids, and the second reads the field of one of them:

```bash
$ stalwart-cli query domain
$ stalwart-cli get domain <id> --fields dnsZoneFile
```
