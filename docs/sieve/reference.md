---
sidebar_position: 7
---

# Reference

This section contains the reference documentation for the functions available from Sieve [expressions](/docs/sieve/expressions) in the trusted interpreter. Currently not all functions are documented, but the list will be expanded over time.

### In-memory store queries

The `query` function is used to execute an SQL or LDAP query on a [SQL in-memory store](/docs/storage/in-memory). It expects as the first argument the in-memory store name, followed by the query string and as third argument an array with the query values. 

For example:

```sieve
require ["variables", "vnd.stalwart.expressions", "envelope", "reject"];

set "triplet" "${env.remote_ip}.${envelope.from}.${envelope.to}";

if eval "!query('sql', 'SELECT 1 FROM greylist WHERE addr=? LIMIT 1', [triplet])" {
    eval "query('sql', 'INSERT INTO greylist (addr) VALUES (?)', [triplet])";
    reject "422 4.2.2 Greylisted, please try again in a few moments.";
}
```

Or, to set the result of the query in a variable:

```sieve
require ["variables", "include", "vnd.stalwart.expressions", "reject"];

global "score";
set "awl_factor" "0.5";

let "result" "query('sql', 'SELECT score, count FROM awl WHERE sender = ? AND ip = ?', [env.from, env.remote_ip])";

let "awl_score" "result[0]";
let "awl_count" "result[1]";

if eval "awl_count > 0" {
	if eval "!query('sql', 'UPDATE awl SET score = score + ?, count = count + 1 WHERE sender = ? AND ip = ?', [score, env.from, env.remote_ip])" {
		reject "update query failed";
		stop;
	}
	let "score" "score + ((awl_score / awl_count) - score) * awl_factor";
} elsif eval "!query('sql', 'INSERT INTO awl (score, count, sender, ip) VALUES (?, 1, ?, ?)', [score, env.from, env.remote_ip])" {
	reject "insert query failed";
	stop;
}
```

### External programs

The `exec` function is used to execute external binaries, for example:

```sieve
require "vnd.stalwart.expressions";

if eval "!exec('/opt/stalwart/bin/validate.sh', [env.remote_ip, envelope.from])" {
    reject "You are not allowed to send e-mails.";
}

```

