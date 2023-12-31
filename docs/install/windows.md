---
sidebar_position: 2
---

# Windows

To install Stalwart Mail Server on Windows, uncompress the zip file and execute:

```powershell
C:\Downloads> stalwart-install.exe
```

### Choose a package

Once you run the install script, you will be asked to select which [package](/docs/get-started#choosing-a-package) to install:

```txt
Welcome to the Stalwart Mail Server installer

? Which components would you like to install? ›
❯ All-in-one mail server (JMAP + IMAP + SMTP)
  JMAP server
  IMAP server
  SMTP server
```

Use the arrow keys to select the package you want to install and press `Enter` to continue.

### Enter the installation directory

You will then be asked to enter the installation directory. Press `Enter` to use the default directory (e.g. `C:\Program Files\Stalwart Mail` for the all-in-one package) or enter a custom directory:

```txt
? Installation directory (C:\Program Files\Stalwart Mail) › 
```

### Choose where to store your data

Next, you will be asked to select a backend for the [data](/docs/storage/data), [blob](/docs/storage/blob), [full-text](/docs/storage/fts) and [lookup](/docs/storage/lookup) stores. Read the [get started](/docs/get-started#choosing-storage-backends) section for more details on the available options. If you are not sure which backend is right for you, use `RocksDB` for all stores.

```txt
? Which database would you like to use? ›
❯ RocksDB (recommended for single-node setups)
  FoundationDB (recommended for distributed environments)
  SQLite
  PostgreSQL
  MySQL

? Where would you like to store e-mails and other large binaries? ›
❯ RocksDB
  Local file system
  S3, MinIO or any S3-compatible object storage

? Where would you like to store the full-text index? ›
❯ RocksDB
  ElasticSearch

? Where would you like to store the anti-spam database? ›
❯ RocksDB
  Redis
```

Use the arrow keys to select the option you want to use and press `Enter` to continue.

:::tip Note

The FoundationDB version is not available on Windows platforms.

:::

### Choose an authentication backend

Next, you will be asked to select an [authentication backend](/docs/get-started#supported-authentication-backends):

```txt
? Do you already have a directory or database containing your user accounts? ›
❯ No, I want Stalwart to store my user accounts in RocksDB
  Yes, it's an LDAP server
  Yes, it's an PostgreSQL database
  Yes, it's an MySQL database
  Yes, it's an SQLite database
```

If you are installing the SMTP only package, you will be able to select remote LMTP or IMAP server as the authentication backend as well.

### Enter your domain and server hostname

Next, you will be asked to enter your domain name and server hostname:

```txt
? What is your main domain name? (you can add others later) (yourdomain.org) ›
? What is your server hostname? · mail.yourdomain.org
```

You will be able to add other domains later on from the configuration file.

### Enable ACME TLS certificates

Finally, you will be asked whether you want to enable automatic TLS certificates from Let's Encrypt using [ACME](/docs/server/tls/acme). If you are running Stalwart behind a reverse [proxy](/docs/server/proxy) such as Caddy, HAProxy or Traefik, you should disable this option and configure TLS in your reverse proxy instead.

```txt
Do you want the TLS certificates for mail.yourdomain.org to be obtained automatically from Let's Encrypt using ACME? [Y/n] 
```

If you choose to enable [ACME](/docs/server/tls/acme), make sure that your server hostname is resolvable from the internet and that port 443 is open. If you wish to manually configure your TLS certificates, you can do so later on from the [configuration](/docs/server/tls/certificates) file.

### Enable DKIM, SPF and DMARC

DomainKeys Identified Mail ([DKIM](/docs/smtp/authentication/dkim/overview)) is a method of email authentication that allows a receiving email server to verify that an email message was actually sent by the owner of the domain from which it appears to have been sent. It is highly recommended that you enable [DKIM](/docs/smtp/authentication/dkim/overview) (as well as [SPF](/docs/smtp/authentication/spf) and [DMARC](/docs/smtp/authentication/dmarc)) for your domain. The installation script will automatically generate a 2048 bits RSA certificate for your domain and print out the instructions to enable DKIM, SPF and DMARC in your DNS server:

```txt
✅ Add the following DNS records to your domain in order to enable DKIM, SPF and DMARC:

stalwart._domainkey.yourdomain.org. IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0esfx6olNOH0d+AO8lcOST2H/sbJ04OCDOAq0oFmGXISj8HB8DUWzqUIIfWV7GzXZq/y/4dQHcxRXN3lNGSCSG8r7H+S57nqFEjvpFeGhYdqFaXXuD6StUgHgR/Oh1P6nO4NmCvO2jgQaRvZALw7PTkf4X9wnLR+Q9I1L8fu5BuclpuoE8cBJzT+oWwvHWDbIBn4DRVNCi1sa1YWhevKgw6OCsmGIUDbAKApX4fA3O80WjF0jF0CpijAI6jibmO5Ajs6zJDlzaumnprfyz4XHIqVTBL3P2z5xA7skQjK1L8vB2ZGYWrXHiwpR5ZQ5nM8AWM5lyp2zwVxhpxFRokxkQIDAQAB"
yourdomain.org. IN TXT "v=spf1 a:mail.yourdomain.org mx -all ra=postmaster"
mail.yourdomain.org. IN TXT "v=spf1 a -all ra=postmaster"
_dmarc.yourdomain.org. IN TXT "v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.org; ruf=mailto:postmaster@yourdomain.org"
```

If you already have a DKIM certificate simply ignore these instructions and refer to the [DKIM section](/docs/smtp/authentication/dkim/overview) for instructions on how to add a new DKIM signature

### Review the configuration file

The installation script will create the configuration file under `INSTALL_DIR\etc\config.toml`. You may want to review the configuration file and make any changes before starting the server.

:::tip In particular, you will need to:

- If you have selected to use an external database as one of the stores, you will have to configure the connection details for your database. For detailed instructions on how to configure stores, refer to the [storage settings](/docs/storage/overview) section.
- If you have selected to use an external directory server, add to the configuration file the connection details for your LDAP directory or SQL database. For detailed instructions on how to configure your directory, refer to the [LDAP directory](/docs/directory/types/ldap) or [SQL database](/docs/directory/types/sql) sections.
- If you are installing the SMTP only package, add to the configuration file the LMTP server details where messages for local accounts will be delivered to. For more details refer to the [Routing configuration](/docs/smtp/outbound/routing) section.

:::

### Start service

To run Stalwart Mail as a service, follow these instructions:

- Download the [NSSM](http://nssm.cc/download) service manager.
- Run in your terminal:
  ```
  nssm install Stalwart_Mail
  ```
- Once the NSSM GUI appears, configure the service using the following parameters:
  ```
  Path: C:\Program Files\Stalwart Mail\bin\stalwart-mail.exe
  Startup directory: C:\Program Files\Stalwart Mail
  Arguments: --config=C:\Program Files\Stalwart Mail\etc\config.toml
  ```
- Click on the Install Service button.

Note: If you have installed any of the standalone packages, the name of the binary will be `stalwart-<package>.exe` instead of `stalwart-mail.exe`. For example, the service name for SMTP only binary will be `stalwart-smtp.exe`.

### Take note of the administrator password

If you have chosen to use the [internal directory](/docs/directory/types/internal), an administrator account will be created for you with a random password. The password will be in the log files under `<INSTALL_DIR>/logs`. For example:

```bash
$ grep password C:\Program Files\Stalwart Mail\logs\*
Created default administrator account "admin" with password "TV5GRUR2ub5b".
```

Then change the password using the [command line interface](/docs/management/overview) `account update` command:

```bash
$ C:\Program Files\Stalwart Mail\bin\stalwart-cli -u https://127.0.0.1:443 -c admin:TV5GRUR2ub5b account update admin -p my_new_password
Successfully updated account "admin".
```

If you have chosen to use an existing LDAP directory or SQL database for authentication, refer to the [administrators](/docs/directory/users#administrators) section for instructions on how to designate an account as administrator.

### Next steps

If you have selected to use the internal directory, you can now [add your domains](/docs/management/directory/domains) and [create user accounts](/docs/management/directory/accounts) using the [command line interface](/docs/management/overview).

If everything went well, your users should now be able to connect to the server and send and receive emails. If you are unable to connect to the server, check the log files under `<INSTALL_DIR>/logs` for any errors.

Now that you have Stalwart Mail Server up and running, you may want to configure your [Stores](/docs/storage/overview), [JMAP](/docs/jmap/overview), [IMAP](/docs/imap/overview) or [SMTP](/docs/smtp/overview) components.

If you have questions please check the [FAQ](/docs/faq) section or start a discussion in the [community forum](https://github.com/stalwartlabs/mail-server/discussions).
