---
sidebar_position: 3
---

# Docker

Before proceeding with the installation of Stalwart Mail Server, you need to make sure to have a valid TLS certificate for your server. 
If you do not have one, you can obtain a free TLS certificate from [Let's Encrypt](https://letsencrypt.org/).
Once you have obtained your certificate, proceed to pull the Docker image for the package you want to install.

### Choose an image

Stalwart Mail server is available as a Docker image that includes JMAP, IMAP, and SMTP servers and also as standalone images for those who need only one of these servers:

- `stalwartlabs/mail-server:latest` - All-in-one mail server (JMAP + IMAP + SMTP)
- `stalwartlabs/jmap-server:latest` - JMAP server
- `stalwartlabs/imap-server:latest` - IMAP server
- `stalwartlabs/smtp-server:latest` - SMTP server

Pull the image you want to use, for example:

```bash
$ docker pull stalwartlabs/mail-server:latest
```

### Run the configuration script

Create a directory on your host machine where you will store the configuration files and the data for the mail server, for example:

```bash
$ mkdir /opt/stalwart-mail
```

Then run the configuration script:

```bash
$ docker run -it -v <STALWART_DIR>:/opt/stalwart-mail \
             --entrypoint /bin/bash <IMAGE_NAME> \
             -c "bash /usr/local/bin/configure.sh" 
```

Make sure to replace `<STALWART_DIR>` with the path to the directory you created above and `<IMAGE_NAME>` with the name of the image you pulled above.

### Choose where to store your data

Next, unless you are using the SMTP server image, you will be asked to select a [blob store](/docs/get-started#supported-blob-stores):

```txt
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

- If you select the option to create a new directory, the installation program will create an SQLite database under `<STALWART_DIR>/data/accounts.sqlite3` using the [sample directory schema](/docs/directory/types/sql#sample-directory-schema). You will need SQLite to manage your accounts, you can install it by running `sudo apt install sqlite3`.
- If you are installing the SMTP only package, you will be able to select remote LMTP or IMAP server as the authentication backend as well.

:::

### Enter your domain and server hostname

Next, you will be asked to enter your domain name and server hostname:

```txt
? What is your main domain name? (you can add others later) (yourdomain.org) ›
? What is your server hostname? · mail.yourdomain.org
```

You will be able to add other domains later on from the configuration file.

### Enable DKIM, SPF and DMARC

DomainKeys Identified Mail (DKIM) is a method of email authentication that allows a receiving email server to verify that an email message was actually sent by the owner of the domain from which it appears to have been sent. It is highly recommended that you enable DKIM (as well as SPF and DMARC) for your domain. The installation script will automatically generate a 2048 bits RSA certificate for your domain and print out the instructions to enable DKIM, SPF and DMARC in your DNS server:

```txt
✅ Add the following DNS records to your domain in order to enable DKIM, SPF and DMARC:

stalwart._domainkey.yourdomain.org. IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0esfx6olNOH0d+AO8lcOST2H/sbJ04OCDOAq0oFmGXISj8HB8DUWzqUIIfWV7GzXZq/y/4dQHcxRXN3lNGSCSG8r7H+S57nqFEjvpFeGhYdqFaXXuD6StUgHgR/Oh1P6nO4NmCvO2jgQaRvZALw7PTkf4X9wnLR+Q9I1L8fu5BuclpuoE8cBJzT+oWwvHWDbIBn4DRVNCi1sa1YWhevKgw6OCsmGIUDbAKApX4fA3O80WjF0jF0CpijAI6jibmO5Ajs6zJDlzaumnprfyz4XHIqVTBL3P2z5xA7skQjK1L8vB2ZGYWrXHiwpR5ZQ5nM8AWM5lyp2zwVxhpxFRokxkQIDAQAB"
yourdomain.org. IN TXT "v=spf1 a:mail.yourdomain.org mx -all ra=postmaster"
mail.yourdomain.org. IN TXT "v=spf1 a -all ra=postmaster"
_dmarc.yourdomain.org. IN TXT "v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.org; ruf=mailto:postmaster@yourdomain.org"
```

If you already have a DKIM certificate simply ignore these instructions and refer to the [DKIM section](/docs/smtp/authentication/dkim) for instructions on how to add a new DKIM signature

### Take note of the administrator credentials

If you have chosen to create an authentication database, the installation script will print out the credentials for the administrator account that has been created for you:

```txt
🔑 The administrator account is 'admin' with password 'DbCyfJtQ9b4j'.
```

If you have chosen to use an existing LDAP directory or SQL database for authentication, refer to the [administrators](/docs/directory/users#administrators) section for instructions on how to designate an account as administrator.

### Add your TLS certificate

Copy your TLS certificate and private key to the following paths on your host machine:

```bash
$ cp /path/to/fullchain.pem <STALWART_DIR>/etc/certs/<SERVER_NAME>/fullchain.pem
$ cp /path/to/privkey.pem <STALWART_DIR>/etc/certs/<SERVER_NAME>/privkey.pem
```

Make sure to replace `<STALWART_DIR>` with the path to the directory you created above and `<SERVER_NAME>` with the hostname of your server.

### Review the configuration file

The installation script will create the configuration file under `STALWART_DIR/etc/config.toml`. You may want to review the configuration file and make any changes before starting the server.

:::tip In particular, you will need to:

- If you have selected to use an external directory or database as authentication backend, add to the configuration file the connection details for your LDAP directory or SQL database. For detailed instructions on how to configure your directory, refer to the [LDAP directory](/docs/directory/types/ldap) or [SQL database](/docs/directory/types/sql) sections.
- If you have selected to use an S3-compatible blob store, add to the configuration file the connection details for your blob store. For instructions on how to configure an S3-compatible store, refer to the [Blob store](/docs/jmap/blob#s3-compatible-storage) section.
- If you are installing the SMTP only package, add to the configuration file the LMTP server details where messages for local accounts will be delivered to. For more details refer to the [Routing configuration](/docs/smtp/outbound/routing) section.

:::

### Start the container

Once you have completed the setup instructions, start the Stalwart Mail server container:

```bash
$ docker run -d -ti -p 8080:8080 \
             -p 25:25 -p 587:587 -p 465:465 -p 8686:8686 \
             -p 143:143 -p 993:993 -p 4190:4190 \
             -v <STALWART_DIR>:/opt/stalwart-mail \
             --name stalwart-mail <IMAGE_NAME>
```

Make sure to replace `<STALWART_DIR>` with the path to the directory you created above and `<IMAGE_NAME>` with the name of the image you have pulled from Docker Hub.

### Next steps

If everything went well, your users should now be able to connect to the server and send and receive emails. If you are unable to connect to the server, check the log files under `STALWART_DIR/logs` for any errors.

Now that you have Stalwart Mail Server up and running, you may want to configure the [Directory](/docs/directory/overview), [JMAP](/docs/jmap/overview), [IMAP](/docs/imap/overview) or [SMTP](/docs/smtp/overview) components.

If you have questions please check the [FAQ](/docs/faq) section or start a discussion in the [community forum](https://github.com/stalwartlabs/mail-server/discussions).
