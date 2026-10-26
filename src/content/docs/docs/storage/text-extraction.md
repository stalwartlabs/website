---
title: "Attachment text extraction"
description: "Which attachment and document formats Stalwart extracts text from for full-text search, where extraction applies, and the limits that protect the server from oversized or malformed documents."
sidebar_position: 4.4
---

Much of the information in a mailbox is not in the message text but in its attachments: the contract in a PDF, the figures in a spreadsheet. Full-text search therefore covers the contents of common document formats as well as the text of messages. When a message or a stored file is indexed, Stalwart extracts the text of the supported attachments and documents and adds it to the [search index](/docs/storage/fts). A search for a phrase that appears only in an attached PDF or spreadsheet then finds the message.

Extraction is part of [search indexing](/docs/storage/indexing), so it runs in the background and does not delay delivery.

## Supported formats

| Family | Formats |
|---|---|
| Microsoft Word | `.docx`, `.docm`, `.dotx`, `.dotm` |
| Microsoft Excel | `.xlsx`, `.xlsm`, `.xltx`, `.xltm` |
| Microsoft PowerPoint | `.pptx`, `.pptm`, `.ppsx`, `.ppsm`, `.potx`, `.potm` |
| OpenDocument | Text (`.odt`, `.ott`), spreadsheet (`.ods`, `.ots`) and presentation (`.odp`, `.otp`) |
| Other | EPUB, RTF, PDF |

Some attachments need no extraction at all. Attachments of type `text/plain` and `text/html`, and messages attached to other messages, are already text, so they are indexed directly.

To decide whether an attachment is a supported document, Stalwart looks at its declared media type or its file name extension, and confirms the format by examining the content. Senders do not always label documents usefully, so attachments declared with a generic media type, such as `application/octet-stream` or `application/zip`, and without an extension are examined as well. A document sent with an unhelpful type is therefore still recognised.

Several kinds of content yield no text. Legacy binary Office files (`.doc`, `.xls`, `.ppt`) are not supported. Images are not read either, scanned documents included, because there is no optical character recognition, so a PDF that contains only scanned page images has no text to extract. Password-protected documents cannot be read: PDF files are opened only when they can be read without a password, and encrypted ZIP members of Office, OpenDocument and EPUB files are skipped. Any other format, such as an archive or an audio or video file, is not extracted, although its file name remains searchable as part of the message.

## Searches that use extracted text

For email, attachment text is indexed when `attachment` is included in [`indexEmailFields`](/docs/ref/object/search#indexemailfields) on the [Search](/docs/ref/object/search) object (found in the WebUI under <!-- breadcrumb:Search --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m13 13.5 2-2.5-2-2.5" /><path d="m21 21-4.3-4.3" /><path d="M9 8.5 7 11l2 2.5" /><circle cx="11" cy="11" r="8" /></svg> Search<!-- /breadcrumb:Search -->). Whether a search finds that text depends on which part of the message it covers. The JMAP `text` filter and the IMAP `TEXT` search key cover the whole message, so they search the extracted text. The JMAP `body` filter and the IMAP `BODY` key search only the message body, so they do not match text from attachments.

For [file storage](/docs/collaboration/file-storage), document contents are indexed while [`indexFiles`](/docs/ref/object/search#indexfiles) is enabled, and the field is <!-- default:Search.indexFiles as=enabled -->enabled<!-- /default --> until it is changed. File names are searchable whether or not the contents are indexed.

## Limits

Documents received by email come from untrusted senders. A sender can build a document that exhausts memory or processor time when its text is extracted, for example a small file that decompresses to an enormous size. The following settings of the Search object therefore limit the work done for each document. The [Search reference](/docs/ref/object/search) lists the default of each:

| Setting | When the limit is exceeded |
|---|---|
| [`maxExtractDocumentSize`](/docs/ref/object/search#maxextractdocumentsize) | The document is larger than the limit and no text is extracted from it. |
| [`maxExtractTextSize`](/docs/ref/object/search#maxextracttextsize) | Extraction stops; the text up to the limit is indexed. |
| [`maxExtractDecompressedSize`](/docs/ref/object/search#maxextractdecompressedsize) | Extraction stops after decompressing this much data; the text extracted so far is indexed. |
| [`maxExtractPartSize`](/docs/ref/object/search#maxextractpartsize) | A single part (an XML part, an EPUB chapter or a PDF stream) larger than the limit is not read; extraction continues with the text obtained so far. |
| [`maxExtractParts`](/docs/ref/object/search#maxextractparts) | Parts beyond the limit (XML parts, slides, sheets or chapters) are not read. |
| [`maxExtractArchiveEntries`](/docs/ref/object/search#maxextractarchiveentries) | Entries of an Office, OpenDocument or EPUB file beyond the limit are ignored. |
| [`maxExtractPdfObjects`](/docs/ref/object/search#maxextractpdfobjects) | Objects beyond the limit in a PDF file are not read, so the text may be incomplete. |
| [`maxExtractRtfDepth`](/docs/ref/object/search#maxextractrtfdepth) | RTF groups nested deeper than the limit are not interpreted. |

Two budgets also apply to each message as a whole. All of its attachments together yield at most twice `maxExtractTextSize` of text, and they all share the decompression budget of `maxExtractDecompressedSize`. Once either budget is used up, the remaining attachments of the message are not extracted.

The built-in index adds a limit of its own, independent of these settings: the index of one document holds about 1 MiB of index data at most. A long document can therefore be only partly searchable even when its extracted text is below `maxExtractTextSize`. The attachment text is cut first, then the body. Each document cut in this way is logged as a `search-index.document-truncated` event at debug level, with the account, the document, the indexed size and the limit, and it is counted in the metric of the same name. This limit does not apply to ElasticSearch, Meilisearch, PostgreSQL or MySQL. They have limits of their own, described in [Search store](/docs/storage/fts#choosing-a-search-store).

The limits are a trade-off. Raising them makes more of each document searchable, but it also increases the memory and processor time that indexing can consume, as discussed in [Speeding up search indexing](/docs/performance/search-indexing).

## Disabling extraction

To stop indexing attachment text, remove `attachment` from `indexEmailFields`. To stop indexing file contents, set `indexFiles` to `false`. Both changes apply only to items indexed afterwards, so the text already in the index stays searchable. To remove it, [rebuild the index](/docs/storage/indexing#rebuilding-the-index).

## Failures

A document can fail to parse because it is damaged or not in the format it claims. Such a document contributes no text, and the rest of the message is indexed normally.

An unexpected failure during extraction is handled more drastically. The server logs a `server.thread-error` event with the details `Attachment text extraction panicked`, or `File text extraction panicked` for stored files. The message is then indexed without the text of that attachment and without the text of the attachments that follow it.
