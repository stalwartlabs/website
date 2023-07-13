---
sidebar_position: 1
---

# Linux / MacOS

Before proceeding with the installation of Stalwart Mail Server, you need to make sure to have a valid TLS certificate for your server. 
If you do not have one, you can obtain a free TLS certificate from [Let's Encrypt](https://letsencrypt.org/).
Once you have obtained your certificate, execute the following command in your terminal:

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://get.stalw.art/install.sh | sudo sh
```

Please note that _root access_ is required to perform the installation, if you don't feel comfortable running the install script as root
you may also download the [stalwart-install binary](https://github.com/stalwartlabs/mail-server/releases) and
perform a manual installation.

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

You will then be asked to enter the installation directory. Press `Enter` to use the default directory (e.g. `/opt/stalwart-mail` for the all-in-one package) or enter a custom directory:

```txt
? Installation directory (/opt/stalwart-mail) › 
```

### Choose where to store your data

Next, unless you are installing only the SMTP server, you will be asked to select a [database backend](/docs/get-started#choosing-a-database-backend) as well as a [blob store](/docs/get-started#supported-blob-stores):

```txt
? Which database engine would you like to use? ›
❯ SQLite (single node, replicated with Litestream)
  FoundationDB (distributed and fault-tolerant)

? Where would you like to store e-mails and blobs? ›
❯ Local disk using Maildir
  MinIO (or any S3-compatible object storage)
  Amazon S3
  Google Cloud Storage
  Azure Blob Storage
```

Use the arrow keys to select the option you want to use and press `Enter` to continue.

### Choose an authentication backend

Next, you will be asked to select an [authentication backend](/docs/get-started#supported-authentication-backends):

```txt
? Do you already have a directory or database containing your accounts? ›
  Yes, it's an SQL database
  Yes, it's an LDAP directory
❯ No, create a new directory for me
```

:::tip Note

- If you select the option to create a new directory, the installation program will create an SQLite database under `<INSTALL_DIR>/data/accounts.sqlite3` using the [sample directory schema](/docs/directory/types/sql#sample-directory-schema). You will need SQLite to manage your accounts, you can install it by running `sudo apt install sqlite3`.
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
? Where is the TLS certificate for 'mail.yourdomain.org' located? (/etc/letsencrypt/live/mail.yourdomain.org/fullchain.pem) ›
? Where is the TLS private key for 'mail.yourdomain.org' located? (/etc/letsencrypt/live/mail.yourdomain.org/privkey.pem) ›
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

If you already have a DKIM certificate simply ignore these instructions and refer to the [DKIM section](/docs/smtp/TODO) for instructions on how to add a new DKIM signature

### Take note of the administrator credentials

If you have chosen to create an authentication database, the installation script will print out the credentials for the administrator account that has been created for you:

```txt
🔑 The administrator account is 'admin' with password 'DbCyfJtQ9b4j'.
```

If you have chosen to use an existing LDAP directory or SQL database for authentication, refer to the [administrators](/docs/directory/users#administrators) section for instructions on how to designate an account as administrator.

### Review the configuration file

The installation script will create the configuration file under `<INSTALL_DIR>/etc/config.toml`. You may want to review the configuration file and make any changes before starting the server.

In particular, you will need to:

- If you have selected to use an external directory or database as authentication backend, add to the configuration file the connection details for your LDAP directory or SQL database. For detailed instructions on how to configure your directory, refer to the [Directory](/docs/directory/overview) section.
- If you have selected to use an S3-compatible blob store, add to the configuration file the connection details for your blob store. For instructions on how to configure an S3-compatible store, refer to the [Blob store](/docs/TODO) section.
- If you are installing the SMTP only package, add to the configuration file the LMTP server details where messages for local accounts will be delivered to. For more details refer to the [Transport & Routing configuration](/docs/TODO) section.

### Restart service

Once you have completed the setup instructions, restart the Stalwart Mail server:

```bash
$ sudo systemctl restart stalwart-mail
```

Or, if you are using MacOS:

```bash
$ sudo launchctl kickstart -k stalwart.mail
```

Note: If you have installed any of the standalone packages, the name of the service will be `stalwart-<package>` instead of `stalwart-mail`. For example, the service name for SMTP only package will be `stalwart-smtp`.

### Next steps

If everything went well, your users should now be able to connect to the server and send and receive emails. If you are unable to connect to the server, check the log files under `<INSTALL_DIR>/logs` for any errors.

Now that you have Stalwart Mail Server up and running, you may want to configure the [Directory](/docs/directory/overview), [JMAP](/docs/TODO), [IMAP](/docs/TODO) or [SMTP](/docs/TODO) components.


