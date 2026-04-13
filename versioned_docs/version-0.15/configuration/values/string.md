---
sidebar_position: 1
---

# String

Strings can be represented in a few different ways:

- Basic Strings: A basic string is represented by a sequence of characters enclosed in double quotes `"`. For example, `"Hello, world!"`.
- Multiline Strings: Multiline strings are represented by a sequence of characters enclosed in triple quotes `"""`. This type of string can span multiple lines and preserve line breaks within the string. For example,

```toml
multiline_string = """
This is a multiline
string in TOML format.
"""
```
- Literal Strings: Literal strings are represented by a sequence of characters enclosed in single quotes `'`. This type of string is useful for representing strings that contain characters that would normally need to be escaped within a basic or multiline string, such as double quotes. For example, `'Hello, "world"'`.

In a TOML file, strings can be used as values for keys or as elements in arrays. No matter how a string is represented in a TOML file, it must be enclosed in quotes or string literals in order to be treated as a string.

