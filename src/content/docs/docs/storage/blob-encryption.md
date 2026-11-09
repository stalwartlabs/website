---
sidebar_position: 3.5
title: "Blob encryption"
description: "Encrypt the contents of the blob store with server-held symmetric keys: what it protects, choosing keys and ciphers, separate settings for email and files, key rotation, re-encoding existing blobs and deleting keys."
---

Blob encryption protects the contents of the [blob store](/docs/storage/blob) from anyone who can read the storage but not the server. The typical case is a blob store kept on third-party object storage, such as an S3 bucket, an Azure container or a WebDAV-mounted directory, where the storage provider and anyone with access to its backups would otherwise see every message and file in plain text. With blob encryption enabled, Stalwart encrypts each blob before handing it to the backend and decrypts it after reading it back, so the backend only ever holds ciphertext.

The keys are symmetric and held by the server. This sets blob encryption apart from [encryption at rest](/docs/encryption/at-rest), where each user supplies a public key and only the user's mail client can decrypt the stored messages. Blob encryption needs nothing from users or their clients, works with webmail and every protocol, and leaves the spam filter, search and Sieve fully functional, because the server can always decrypt what it stored. In return it offers no protection against someone who controls the running server or its configuration.

## Scope of protection

Encryption covers the contents of blobs: raw email messages with their attachments, Sieve scripts and files stored through WebDAV or JMAP. Everything kept in the [data store](/docs/storage/data) stays as it is. That includes the message metadata Stalwart extracts at delivery (header fields such as the sender, recipients and subject, and the message preview), mailboxes, calendars and contacts, and the [search index](/docs/storage/fts). A deployment that needs all of this protected as well should also encrypt the disks or the database that hold the data store.

Three properties of the blob store remain visible to anyone who can read it:

- The size of each blob, apart from the effect of compression.
- The number of blobs and the times they were written.
- The name of each blob. Blobs are named after a hash of their contents, so someone who can list the store and holds a copy of a particular document can tell whether the same document is stored.

The keys live in the server's configuration. When the blob store and the configuration share the same storage, for example when the blob store is the `Default` variant inside the data store, encryption adds little: whoever can read the blobs can usually read the keys too. Keys read from a file or an environment variable, described below, keep the key material out of the configuration database.

## Keys

Each key is a [SymmetricKey](/docs/ref/object/symmetric-key) object (found in the WebUI under <!-- breadcrumb:SymmetricKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Symmetric Keys<!-- /breadcrumb:SymmetricKey -->). Creating and changing keys requires the `sysSymmetricKey*` permissions, and re-encoding stored blobs requires `taskBlobRecode`. The System Administrator role holds them by default, except the permission to delete keys ([Delete a key](#delete-a-key)).

A key consists of 256 bits of random data, entered as standard base64. Any source of strong randomness works, for example:

```sh
openssl rand -base64 32
```

The key material can be stored in three ways, chosen by the `@type` of the `key` field: `Value` stores it in the configuration itself, `EnvironmentVariable` reads it from an environment variable, and `File` reads it from a file, ignoring surrounding whitespace. The last two keep the key out of the configuration database and out of configuration exports, which matters for the reasons given in the previous section.

The `cipher` field selects the algorithm. The default, <!-- default:SymmetricKey.cipher -->`aes256Gcm`<!-- /default -->, is the right choice on almost every server, because current x86 and ARM processors implement AES in hardware. `chacha20Poly1305` is faster on processors without AES instructions, such as some older ARM and RISC-V systems.

Both the cipher and the key material are fixed once the key is created. Every blob records which key encrypted it, and a key whose contents changed would leave those blobs unreadable. For the same reason the server stores a fingerprint of each key when it is created and compares it with the key material every time the configuration is loaded. A key file or environment variable that no longer matches is reported with `Symmetric key does not match its stored fingerprint; the key file or environment variable may have changed` and the key is not used. A key file or environment variable that cannot be read is reported with `Failed to obtain symmetric key secret: <error>`. The file must be readable on every node, including the one that handles the request that creates the key.

The following call creates a key read from a file:

```sh
stalwart-cli create SymmetricKey \
  --field 'description=Blob key 2026' \
  --field 'key={"@type":"File","filePath":"/etc/stalwart/blob-2026.key"}'
```

## Enable encryption

Blob encryption is configured separately for two groups of data, so that an administrator can, for example, encrypt files without paying the cost for every message:

- The [Email](/docs/ref/object/email) object (<!-- breadcrumb:Email/EmailStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage<!-- /breadcrumb:Email/EmailStorage -->) controls email messages, Sieve scripts, messages in the outbound queue and the blobs uploaded by JMAP clients.
- The [FileStorage](/docs/ref/object/file-storage) object (<!-- breadcrumb:FileStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg> Files & Sharing › File Storage<!-- /breadcrumb:FileStorage -->) controls the files stored through WebDAV and JMAP file storage.

Each object has two fields. `blobEncryptionKey` selects the key that encrypts new blobs, and leaving it empty stores new blobs unencrypted. `compressionAlgorithm` selects `lz4`, `zstd` or `none`; compression always happens before encryption, because encrypted data no longer compresses. The [blob store](/docs/storage/blob#compression) page compares the algorithms.

The following commands encrypt email with key `a`, and encrypt files with key `b` after compressing them with Zstandard:

```sh
stalwart-cli update email --field blobEncryptionKey=a
stalwart-cli update filestorage --field blobEncryptionKey=b --field compressionAlgorithm=zstd
stalwart-cli create Action/ReloadSettings
```

The `ReloadSettings` [action](/docs/management/tasks-actions/actions) applies the change to the running server, and to every node of a cluster when a [coordinator](/docs/cluster/coordination/) is configured. From then on, new blobs are encrypted. Blobs written earlier stay as they are, and Stalwart keeps reading them: every blob records whether and with which key it was encrypted, so a store can hold plain and encrypted blobs, and blobs encrypted with different keys, side by side. [Re-encode stored blobs](#re-encode-stored-blobs) explains how to convert them.

The settings apply to a blob when it is first written. A blob uploaded through JMAP is written before the server knows what it will become, so a file created in JMAP from an uploaded blob keeps the email settings. Identical contents are also stored only once: a file whose contents match an existing message keeps the encoding of the message. A server that encrypts files should therefore encrypt email as well.

A few internal blobs are never encrypted: [cache swap](/docs/storage/cache-swap) snapshots, the web application bundles and the spam classifier model. They hold data derived from the data store or no user data at all.

## Rotate a key

Rotation replaces the key used for new blobs. Create a new key and select it in `blobEncryptionKey` of the Email and FileStorage objects, then reload the settings. The previous key stays in use for reading the blobs it encrypted, so it must be kept until no blob depends on it. To retire it, re-encode the stored blobs with the new key as described in the next section.

## Re-encode stored blobs

The `BlobRecode` [task](/docs/management/tasks-actions/tasks) rewrites the stored blobs with a chosen compression and encryption. It converts existing data after encryption is first enabled, completes a key rotation, removes encryption, or changes the compression of data already stored. Two fields describe the target:

- `compression` is `keep` to leave each blob's compression unchanged, `disable` to store blobs uncompressed, or `lz4` or `zstd` to compress them with that algorithm.
- `encryption` is `Keep` to leave each blob's encryption unchanged, `Disable` to decrypt the blobs, or `Encrypt` with a `keyId` to encrypt them with that key.

The following command re-encrypts every stored blob with key `b` and leaves its compression as it is:

```sh
stalwart-cli create Task/BlobRecode \
  --field compression=keep \
  --field 'encryption={"@type":"Encrypt","keyId":"b"}' \
  --field 'status={"@type":"Pending","due":"2026-11-03T00:00:00Z"}'
```

The task splits the work into 256 shard tasks, each covering the blobs whose hash begins with one byte value, and these run on the nodes with the `storeMaintenance` [cluster role](/docs/cluster/configuration/roles). Each shard reads its blobs one at a time and rewrites only those not already in the target form, so a shard that is interrupted and retried does not rewrite the same blobs again. The one exception is a blob that compression would not shrink, such as an already compressed image: it is stored uncompressed, so every run that asks for compression tries again. When a shard finishes, it emits a `store.blob-store-recoded` [event](/docs/ref/events) with the number of blobs it examined, rewrote and failed to rewrite. A blob that needs converting but cannot be read, for example because its key is no longer available, is logged with `Failed to recode blob` and skipped, and the shard is retried later following the [task retry](/docs/management/tasks-actions/tasks#retries) settings. Because a shard skips the blobs already converted, a retry only works on the failures. A shard that is asked to encrypt with a key its node has not loaded yet fails with `Blob encryption key is not loaded` and is retried as well; reloading the settings after creating the key avoids the delay.

Each node with the `storeMaintenance` role runs one shard at a time, so adding nodes with that role shortens the task. Every blob that changes is downloaded, decoded, encoded again and uploaded in full. On a blob store with request or transfer charges, such as S3 or Azure, a task over the whole store costs about as much as copying it once. While a task with the `Encrypt` target is pending, its key cannot be deleted, and starting a new `BlobRecode` task replaces the pending shards of an earlier one.

The task covers the blobs that belong to user data: email messages (including archived ones), Sieve scripts, files and queued messages. Uploads that have not been used yet expire on their own and are left alone, as are the internal blobs listed in the previous section.

## Backups

The [offline export](/docs/management/maintenance/backup#offline-export-and-import) reads blobs through the server, so an export contains them decrypted, and it should be stored and protected accordingly. The import runs against an empty data store, before any settings exist, so it writes every blob with the default settings: compressed with LZ4 and unencrypted. A server that uses blob encryption must therefore run a `BlobRecode` task after the import to encrypt the imported blobs. The export also contains the SymmetricKey objects, and keys of the `Value` type are stored in it in plain text, so it must be protected like the keys themselves. Backups taken at the storage level, such as bucket replication or disk snapshots of the blob store, keep the blobs encrypted and need the keys to be restored with them.

## Delete a key

A key can only be deleted while no setting refers to it: the registry refuses to delete a key selected in the Email or FileStorage objects. Beyond that, the server cannot tell whether stored blobs still need the key, and deleting a key that is still needed makes those blobs permanently unreadable.

For this reason the permission to delete symmetric keys is not part of any default role, and the administrator role does not hold it. Only the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator), which holds every permission, can delete keys. An administrator who attempts it receives `You are not authorized to destroy objects of this type`. Before deleting a key, re-encode the stored blobs with another key or without encryption, and keep an offline copy of the key in case a backup taken earlier is restored.

## Troubleshooting

A blob that cannot be decrypted is reported with the `store.decrypt-error` [event](/docs/ref/events), and the operation that needed it fails. The event details distinguish the causes:

- `Encryption key not available`: the blob was encrypted with a key the server does not have. The event names the key's `id`. The usual cause is a deleted key, or a key that failed to load. The same error is raised when a blob is written while the key selected in Email or FileStorage is not loaded. Every node loads all keys when it starts and whenever the settings are reloaded, so on a cluster a node that has not yet applied a reload cannot read blobs encrypted with a key created since; the `ReloadSettings` action applies the change on every node.
- `Authentication failed`: the key exists but does not decrypt the blob. Either the blob was altered in storage, or the key material differs from the one that encrypted it, which the fingerprint check normally prevents. The encryption also covers the blob's name in the store, so a blob that was copied or moved to another name, for example by a migration tool that renames objects, fails in the same way.
- `Truncated encrypted blob`: the stored object is shorter than the encryption trailer, which indicates a damaged or truncated write.

When the key selected in Email or FileStorage cannot be loaded at startup, the server reports `The configured blob encryption key is not available; new blobs cannot be written until it is fixed` and refuses to write blobs for that group of data rather than storing them unencrypted. Reloading the settings with such a key fails with the same message and leaves the previous configuration in place. This applies to any key that fails to load, whether or not it is selected: the whole reload is rejected, including unrelated changes made at the same time. Creating a key whose material is not valid fails with `Symmetric key is not valid base64` or `Symmetric key must decode to exactly 32 bytes`.

Decryption failures are also counted by the `stalwart_store_decrypt_error_total` [metric](/docs/ref/metrics), which is the signal to alert on: a non-zero value means that some data cannot be read.
