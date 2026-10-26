---
sidebar_position: 3
title: "File extensions"
description: "How the spam filter classifies attachment file extensions, the tags each classification produces, and how to add or change an extension."
---

Attachments are a common way to deliver malware. Attackers send executables and scripts as attachments, nest archives inside archives to hide their contents from scanners, and give files a name that claims one type while the declared content type says another.

The spam filter recognises these tricks by checking the name and the content type of every attachment against a table of file extensions. Each entry of the table is a [SpamFileExtension](/docs/ref/object/spam-file-extension) object, found in the WebUI under <!-- breadcrumb:SpamFileExtension --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › File Extensions<!-- /breadcrumb:SpamFileExtension -->. The rule set provides about 130 entries, covering common document, image, archive and executable formats.

## Fields and tags

The filter takes the extension from the last dot of the attachment's file name, in lower case. For names such as `invoice.pdf.exe`, it also takes the extension before it, because a second extension is a common way to make an executable look like a document. The fields of the matching entry then decide which tags the attachment adds:

| Field | Meaning | Tag added |
|---|---|---|
| [`extension`](/docs/ref/object/spam-file-extension#extension) | The extension, without the leading dot. | |
| [`isBad`](/docs/ref/object/spam-file-extension#isbad) | The extension is dangerous in an email attachment, such as `exe`, `scr` or `bat`. | `MIME_BAD_EXTENSION` (2.0), or `MIME_DOUBLE_BAD_EXTENSION` (2.0) when the extension before it is also marked bad |
| [`isArchive`](/docs/ref/object/spam-file-extension#isarchive) | The extension is an archive format, such as `zip` or `rar`. | `MIME_ARCHIVE_IN_ARCHIVE` (5.0) when the name has two archive extensions, as in `files.zip.rar` |
| [`contentTypes`](/docs/ref/object/spam-file-extension#contenttypes) | The content types expected for the extension. An empty set accepts any content type. | `MIME_BAD_ATTACHMENT` (4.0) when the declared content type is not in the set and is not `application/octet-stream` |
| [`isNz`](/docs/ref/object/spam-file-extension#isnz) | Recorded with the entry; the built-in analysis does not use it. | |

Some names hide their extension in other ways. An attachment name that contains invisible or direction-changing Unicode characters, which can disguise the real extension, receives `MIME_BAD_UNICODE` (8.0). The scores are those of the rule set, and can be changed as described in [Scores](/docs/spamfilter/settings/scores).

## Adding or changing an extension

An entry describes one extension, and the decisions it records are whether the extension is dangerous, whether it is an archive, and which content types are expected for it. The following object declares that PDF attachments must carry a PDF content type:

```json
{
  "extension": "pdf",
  "contentTypes": {"application/pdf": true, "application/x-pdf": true},
  "isArchive": false,
  "isBad": false,
  "isNz": false
}
```

The following object marks batch files as dangerous, whatever their declared type, by setting `isBad` and leaving the set of content types empty:

```json
{
  "extension": "bat",
  "contentTypes": {},
  "isArchive": false,
  "isBad": true,
  "isNz": false
}
```

Changes to the entries of the rule set do not last. A rule set update replaces the entries it defines with its own version, so a local change to one of them is lost at the next update. Extensions that the rule set does not define are kept.
