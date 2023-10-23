---
sidebar_position: 4
---

# MIME Types

Filename extensions along with their expected mime types and associated flags are listed in the `etc/spamfilter/maps/mime_types.map` file. These flags provide the spam filter with guidelines on how to handle emails containing files with these extensions, allowing for a more informed and precise classification of potentially malicious emails.

## Format

Each line in the `mime_types.map` file represents a specific file extension. Parameters for each extension are separated by the `|` character. The typical structure is as follows:

```
<file extension> <mime type>|<optional flags>
```

The following are the flags that can be associated with a file extension:

- **BAD**: This flag indicates that the file extension is deemed risky or malicious. If an email attachment possesses an extension flagged as BAD, the spam score of the message will be increased, signaling a higher likelihood of it being spam.
- **AR**: Represents "archive". File extensions with this flag are identified as archive types, such as .zip or .rar. Knowing whether a file is an archive helps the system apply certain logic, like inspecting the contents of the archive for further analysis.
- **NZ**: Stands for "not in archive". If a file extension is marked with the NZ flag, it signifies that this type of file should not be found inside an archive. If such an occurrence is detected, it's a potential red flag, and the spam score for the email might be adjusted.

The spam filter uses these flags to apply rule-based scoring. For instance, if an archive (flagged with **AR**) is discovered inside another archive, the spam score of the email is incremented. This behavior is considered suspicious, as nested archives can be a tactic used by malicious actors to obfuscate harmful content.

## Examples

Below are some examples from the `mime_types.map` file:

```
pdf application/pdf|application/x-pdf|NZ
```
- File extension: `pdf`
- Expected mime types: `application/pdf` or `application/x-pdf`
- Flag: `NZ` - A PDF should not be inside an archive.

```
htm text/html|BAD
```
- File extension: `htm`
- Expected mime type: `text/html`
- Flag: `BAD` - The .htm extension is considered risky.

```
bat BAD
```
- File extension: `bat`
- No mime type provided.
- Flag: `BAD` - The .bat extension is considered malicious.

```
rar AR
```
- File extension: `rar`
- No mime type provided.
- Flag: `AR` - Indicates that this is an archive extension.

