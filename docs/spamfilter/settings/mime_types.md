---
sidebar_position: 3
---

# MIME types

File-extension classification lets the spam filter react to message attachments in an informed way, based on the expected MIME type of each extension and a small set of flags. Each classification is stored as a [SpamFileExtension](/docs/ref/object/spam-file-extension) object (found in the WebUI under <!-- breadcrumb:SpamFileExtension --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › File Extensions<!-- /breadcrumb:SpamFileExtension -->).

## Fields

Each SpamFileExtension instance carries:

- [`extension`](/docs/ref/object/spam-file-extension#extension): the file-name extension this entry applies to, without the leading dot.
- [`contentTypes`](/docs/ref/object/spam-file-extension#contenttypes): a list of MIME types that are expected for this extension. Leaving the list empty means no MIME type is required.
- [`isBad`](/docs/ref/object/spam-file-extension#isbad): marks the extension as risky or malicious. Messages carrying an attachment whose extension is flagged as bad receive an increased spam score.
- [`isArchive`](/docs/ref/object/spam-file-extension#isarchive): marks the extension as an archive format (such as `zip` or `rar`). The filter can then apply archive-specific logic, for example inspecting the archive contents or penalising nested archives.
- [`isNz`](/docs/ref/object/spam-file-extension#isnz): marks the extension as "not in archive": a file with this extension should not appear inside another archive. If the filter finds such a file nested inside an archive, the spam score is adjusted accordingly.

The filter uses these flags to apply rule-based scoring. For example, finding an archive (`isArchive = true`) inside another archive increases the spam score, since nested archives are a common tactic for hiding malicious content.

## Examples

PDF files are expected to carry a PDF MIME type and should not appear inside archives:

```json
{
  "extension": "pdf",
  "contentTypes": ["application/pdf", "application/x-pdf"],
  "isArchive": false,
  "isBad": false,
  "isNz": true
}
```

HTML files carried as attachments are treated as risky:

```json
{
  "extension": "htm",
  "contentTypes": ["text/html"],
  "isArchive": false,
  "isBad": true,
  "isNz": false
}
```

Batch files are considered malicious regardless of the declared MIME type:

```json
{
  "extension": "bat",
  "contentTypes": [],
  "isArchive": false,
  "isBad": true,
  "isNz": false
}
```

RAR files are archives:

```json
{
  "extension": "rar",
  "contentTypes": [],
  "isArchive": true,
  "isBad": false,
  "isNz": false
}
```
