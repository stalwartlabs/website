By default, every folder is imported. Two mutually exclusive forms narrow the selection. Both are compared with the folder's canonical name:

- `--include <REGEX>` and `--exclude <REGEX>`, each repeatable, select folders by regular expression. With `--include`, only matching folders are kept, and `--exclude` then drops matching folders from those.
- `--folder <NAME>`, repeatable, names folders exactly. It cannot be combined with `--include` or `--exclude`.

A folder that is excluded but has a selected subfolder is still created, without messages, so that the subfolder keeps its place in the tree.

Folders with a special purpose (inbox, sent, drafts, trash, junk, archive) receive the matching JMAP role, so that the export binds them to the target's existing folders. The inbox always has the `inbox` role. For other folders, the role is taken from the folder's special-use attribute where the source has one. Otherwise, it is guessed from common folder names, such as `Sent Items`, `Deleted Messages`, `Junk E-mail` or `[Gmail]/Sent Mail`.

`--noautomap` turns off the guessing, so that only special-use attributes assign roles. Each role is given to one folder per archive: the first that claims it.

Messages marked for deletion (with the IMAP `\Deleted` flag or the Maildir `T` flag) are skipped by default. With `--include-deleted`, they are imported with the `$deleted` keyword.
