---
sidebar_position: 2
---

# Windows

Before proceeding with the installation of Stalwart Mail Server, you need to make sure to have a valid TLS certificate for your server. 
If you do not have one, you can obtain a free TLS certificate from [Let's Encrypt](https://letsencrypt.org/).
Once you have obtained your certificate, download the latest [installation binary](https://github.com/stalwartlabs/mail-server/releases/latest/download/stalwart-install-x86_64-pc-windows-msvc.zip), uncompress the zip file and execute:

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

Next, unless you are installing only the SMTP server, you will be asked to select a [blob store](/docs/get-started#supported-blob-stores):

```txt
? Where would you like to store e-mails and blobs? ›
❯ Local disk using Maildir
  MinIO (or any S3-compatible object storage)
  Amazon S3
  Google Cloud Storage
  Azure Blob Storage
```

Use the arrow keys to select the option you want to use and press `Enter` to continue.

:::tip Note

The FoundationDB version is not available on Windows platforms.

:::

### Choose an authentication backend

Next, you will be asked to select an [authentication backend](/docs/get-started#supported-authentication-backends):

```txt
? Do you already have a directory or database containing your accounts? ›
  Yes, it's an SQL database
  Yes, it's an LDAP directory
❯ No, create a new directory for me
```

:::tip Note

- If you select the option to create a new directory, the installation program will create an SQLite database under `<INSTALL_DIR>/data/accounts.sqlite3` using the [sample directory schema](/docs/directory/types/sql#sample-directory-schema). You will need SQLite to manage your accounts.
- If you are installing the SMTP only package, you will be able to select remote LMTP or IMAP server as the authentication backend as well.

:::

### Enter your domain and server hostname

Next, you will be asked to enter your domain name and server hostname:

```txt
? What is your main domain name? (you can add others later) (yourdomain.org) ›
? What is your server hostname? · mail.yourdomain.org
```

You will be able to add other domains later on from the configuration file.

### Configure your TLS certificate

Finally, you will be asked to enter the path to your TLS certificate and private key:

```txt
? Where is the TLS certificate for 'mail.yourdomain.org' located? (C:\Program Files\Letsencrypt\live\mail.yourdomain.org\fullchain.pem) ›
? Where is the TLS private key for 'mail.yourdomain.org' located? (C:\Program Files\Letsencrypt\live\mail.yourdomain.org\privkey.pem) ›
```

### Enable DKIM, SPF and DMARC

DomainKeys Identified Mail (DKIM) is a method of email authentication that allows a receiving email server to verify that an email message was actually sent by the owner of the domain from which it appears to have been sent. It is highly recommended that you enable DKIM (as well as SPF and DMARC) for your domain. The installation script will automatically generate a 2048 bits RSA certificate for your domain and print out the instructions to enable DKIM, SPF and DMARC in your DNS server:

```txt
✅ Add the following DNS records to your domain in order to enable DKIM, SPF and DMARC:

stalwart._domainkey.yourdomain.org. IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0esfx6olNOH0d+AO8lcOST2H/sbJ04OCDOAq0oFmGXISj8HB8DUWzqUIIfWV7GzXZq/y/4dQHcxRXN3lNGSCSG8r7H+S57nqFEjvpFeGhYdqFaXXuD6StUgHgR/Oh1P6nO4NmCvO2jgQaRvZALw7PTkf4X9wnLR+Q9I1L8fu5BuclpuoE8cBJzT+oWwvHWDbIBn4DRVNCi1sa1YWhevKgw6OCsmGIUDbAKApX4fA3O80WjF0jF0CpijAI6jibmO5Ajs6zJDlzaumnprfyz4XHIqVTBL3P2z5xA7skQjK1L8vB2ZGYWrXHiwpR5ZQ5nM8AWM5lyp2zwVxhpxFRokxkQIDAQAB"
yourdomain.org. IN TXT "v=spf1 a:mail.yourdomain.org mx -all ra=postmaster"
mail.yourdomain.org. IN TXT "v=spf1 a -all ra=postmaster"
_dmarc.yourdomain.org. IN TXT "v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.org; ruf=mailto:postmaster@yourdomain.org"
```

If you already have a DKIM certificate simply ignore these instructions and refer to the [DKIM section](/docs/smtp/authentication/dkim/overview) for instructions on how to add a new DKIM signature

### Take note of the administrator credentials

If you have chosen to create an authentication database, the installation script will print out the credentials for the administrator account that has been created for you:

```txt
🔑 The administrator account is 'admin' with password 'DbCyfJtQ9b4j'.
```

If you have chosen to use an existing LDAP directory or SQL database for authentication, refer to the [administrators](/docs/directory/users#administrators) section for instructions on how to designate an account as administrator.

### Review the configuration file

The installation script will create the configuration file under `INSTALL_DIR\etc\config.toml`. You may want to review the configuration file and make any changes before starting the server.

:::tip In particular, you will need to:

- If you have selected to use an external directory or database as authentication backend, add to the configuration file the connection details for your LDAP directory or SQL database. For detailed instructions on how to configure your directory, refer to the [LDAP directory](/docs/directory/types/ldap) or [SQL database](/docs/directory/types/sql) sections.
- If you have selected to use an S3-compatible blob store, add to the configuration file the connection details for your blob store. For instructions on how to configure an S3-compatible store, refer to the [Blob store](/docs/jmap/blob#s3-compatible-storage) section.
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

### Next steps

If everything went well, your users should now be able to connect to the server and send and receive emails. If you are unable to connect to the server, check the log files under `INSTALL_DIR/logs` for any errors.

Now that you have Stalwart Mail Server up and running, you may want to configure the [Directory](/docs/directory/overview), [JMAP](/docs/jmap/overview), [IMAP](/docs/imap/overview) or [SMTP](/docs/smtp/overview) components.

If you have questions please check the [FAQ](/docs/faq) section or start a discussion in the [community forum](https://github.com/stalwartlabs/mail-server/discussions).
