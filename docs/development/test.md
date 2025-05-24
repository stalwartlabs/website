---
sidebar_position: 3
---

# Testing Stalwart

The following subsections cover the different tests available on Stalwart. Before running these tests, make sure you have Rust installed by following the instructions in the [compile section](/docs/development/compile).

## Protocol tests

### JMAP

The JMAP protocol tests ensure protocol compliance. To run these tests execute:

```bash
$ cargo test --manifest-path=crates/jmap-proto/Cargo.toml -- --nocapture
```

### IMAP

The IMAP protocol tests ensure protocol compliance. To run these tests execute:

```bash
$ cargo test --manifest-path=crates/imap-proto/Cargo.toml -- --nocapture
```

### WebDAV

The WebDAV protocol tests ensure protocol compliance. To run these tests execute:

```bash
$ cargo test --manifest-path=crates/dav-proto/Cargo.toml -- --nocapture
```

## Storage layer tests

The store tests ensure that the mail store is working as expected. Before running these tests, you'll have to install and run [MinIO](https://github.com/minio/minio) in order to be able to run the S3 storage tests:

```bash
$ wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20230629051228.0.0_amd64.deb -O minio.deb
$ sudo dpkg -i minio.deb
$ mkdir ~/minio
$ minio server ~/minio --console-address :9090 &
$ wget https://dl.min.io/client/mc/release/linux-amd64/mc
$ chmod a+rx mc
$ ./mc alias set myminio http://localhost:9000 minioadmin minioadmin
$ ./mc mb tmp
```

Once MinIO is up and running, start the store tests by executing:

```bash
$ cargo test --manifest-path=tests/Cargo.toml store -- --nocapture
```

If you would like to test the FoundationDB backend, you'll first have to install the [FoundationDB client libraries](https://github.com/apple/foundationdb/releases). Once the FoundationDB client libraries are installed, start the store tests by executing:

```bash
$ cargo test --manifest-path=tests/Cargo.toml store --no-default-features --features foundationdb -- --nocapture
```

## Directory tests

The directory tests ensure that the directory service is working as expected. Before running these tests, you'll have to install and run [glauth](https://github.com/glauth/glauth) in order to be able to run the LDAP tests:

```bash
$ wget https://github.com/glauth/glauth/releases/download/v2.2.0/glauth-linux-arm64
$ chmod a+rx glauth-linux-arm64
$ ./glauth-linux-arm64 -c tests/resources/ldap.cfg &
```

Once glauth is up and running, run the directory tests by executing:

```bash
$ cargo test --manifest-path=tests/Cargo.toml directory -- --nocapture
```

## Integration tests

### SMTP

The SMTP tests ensure that the SMTP server is working as expected. To run these tests execute:

```bash
$ cargo test --manifest-path=tests/Cargo.toml smtp -- --nocapture
```

### JMAP

The JMAP tests ensure that the JMAP server is working as expected. To run these tests execute:

```bash
$ cargo test --manifest-path=tests/Cargo.toml jmap -- --nocapture
```

### IMAP

The IMAP tests ensure that the IMAP server is working as expected. To run these tests execute:

```bash
$ cargo test --manifest-path=tests/Cargo.toml imap -- --nocapture
```

### WebDAV

The IMAP tests ensure that the IMAP server is working as expected. To run these tests execute:

```bash
$ cargo test --manifest-path=tests/Cargo.toml webdav -- --nocapture
```

## Third party tests

### JMAP test suite

Compliance with the JMAP protocol may also be tested using Fastmail's JMAP-TestSuite:

- Clone the JMAP TestSuite repository:
    ```bash
    git clone https://github.com/stalwartlabs/jmap-test-suite.git
    cd jmap-test-suite/
    ```
- Install the recommended Perl dependencies:
    ```bash
    cpanm --installdeps .
    ```
- Run one of the tests, for example:
    ```bash
    JMAP_SERVER_ADAPTER_FILE=eg/stalwart.json perl -I<PATH_TO_PERL_LIB> -I lib t/basic.t
    ```

### IMAP4 protocol compliance

Stalwart's IMAP protocol compliance may be also tested with Dovecot's ImapTest:

- Download [ImapTest](https://www.imapwiki.org/ImapTest/Installation).
- Start a test Stalwart instance by running:
    ```bash
    $ cargo run --manifest-path=crates/main/Cargo.toml -- --config=./tests/resources/test_config.toml
    ```
- Run the compliance tests as follows:
    ```bash
    $ ./imaptest host=127.0.0.1 port=9991 \
            user=john pass=12345 auth=100 \
            test=<PATH_TO_REPO>/tests/resources/imap-test
    ```

Note: The tests distributed with ImapTest were slightly modified to support the
IMAP4rev2 specification.

### IMAP4 Stress tests

Stress testing Stalwart can be done with Dovecot's ImapTest:

- Download [ImapTest](https://www.imapwiki.org/ImapTest/Installation).
- Start a test Stalwart instance by running:
    ```bash
    $ cargo run --manifest-path=crates/main/Cargo.toml -- --config=./tests/resources/test_config.toml
    ```
- Create a test `users.txt` file by running:
    ```bash
    $ echo "john\njane\nbill\n" > users.txt
    ```
- Run the stress tests as follows:
    ```
    ./imaptest host=127.0.0.1 port=9991 \
            userfile=users.txt \
            pass=<12345 \
            mbox=<PATH_TO_TEST_MBOX> \
            auth=100
    ```

### WebDAV protocol compliance

Stalwart's WebDAV protocol compliance may be also tested with Litmus' WebDAV test suite.

First, clone the Litmus repository and compile:

```bash
$ git clone https://github.com/notroj/litmus.git
$ cd litmus
$ git submodule update --init
$ ./autogen.sh
$ ./configure
$ make
```

Then, create in Stalwart a test account with the username `john` and password `12345` and run the following command to run the WebDAV tests:

```bash
$ /usr/local/bin/litmus "http://localhost:8080/dav/file/john" "john" "12345"
```


## Fuzzing

To run the fuzz tests please refer to the Stalwart libraries that handle parsing for the mail server:

- [smtp-proto](https://github.com/stalwartlabs/smtp-proto)
- [mail-parser](https://github.com/stalwartlabs/mail-parser)
- [mail-auth](https://github.com/stalwartlabs/mail-auth)
- [calcard](https://github.com/stalwartlabs/calcard)
- [sieve-rs](https://github.com/stalwartlabs/sieve). 


