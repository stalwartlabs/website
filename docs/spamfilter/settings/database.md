---
sidebar_position: 3
---

# Database

The spam filter requires a database in order to maintain and manage various crucial pieces of information. The database to use is configured as a [directory](/docs/directory/overview) named `spamdb` under the `etc/smtp/spamfilter.toml` configuration file.

This database serves multiple purposes:

- **Bayes Classifier Weights**: The database retains the weights associated with each token as determined by the Bayes classifier. This enables the spam filter to learn and adapt over time by understanding patterns in incoming emails, enhancing its accuracy in distinguishing between spam and legitimate messages.
- **Message IDs for Tracking Replies**: The database maintains records of message IDs for emails sent by authenticated senders to effectively track replies. When a reply from a known sender is received, it's assigned a tag with a negative score. This practice is rooted in the understanding that a reply from a previously authenticated sender is likely legitimate, thereby reducing the probability of it being classified as spam. This tracking mechanism aids in ensuring genuine communication flows seamlessly without being inadvertently flagged as spam.
- **Reputation Tracking**: The reputation of various entities is stored and managed in the database. This includes the reputation of IP addresses, ASNs (Autonomous System Numbers), sender domains, and individual email addresses. By tracking the reputation, the system can make informed decisions on incoming emails based on the sender's historical behavior.

By default, during the installation process, an SQLite database is set up to cater to these requirements. SQLite is a lightweight, file-based database system that's quick to deploy and easy to manage. However, while it's suitable for smaller setups, it might not be the optimal choice for larger, more complex environments.

For distributed setups or systems serving a large number of users, it's recommended that system administrators consider other database types. These alternative databases can offer improved performance, scalability, and resilience, ensuring that the spam filter operates efficiently even under heavy loads. Transitioning to a different database type also provides the flexibility to distribute the database across multiple servers, optimizing resource usage and ensuring seamless operation.

## Schema

The spam filter relies on a structured database schema to store and manage crucial data points. Below, we've detailed the table layouts required by the spam filter for three popular database systems: SQLite, PostgreSQL, and MySQL.

### SQLite

SQLite, a lightweight and file-based database system, employs the following schema:

```sql
CREATE TABLE IF NOT EXISTS bayes_tokens (
    h1 INTEGER NOT NULL,
    h2 INTEGER NOT NULL,
    ws INTEGER,
    wh INTEGER,
    PRIMARY KEY (h1, h2)
);

CREATE TABLE IF NOT EXISTS seen_ids (
    id STRING NOT NULL PRIMARY KEY,
    ttl DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS reputation (
    token STRING NOT NULL PRIMARY KEY,
    score FLOAT NOT NULL DEFAULT '0',
    count INT(11) NOT NULL DEFAULT '0',
    ttl DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### PostgreSQL

For PostgreSQL, a powerful and open-source relational database system, the schema can be adapted as:

```sql
CREATE TABLE IF NOT EXISTS bayes_tokens (
    h1 INTEGER NOT NULL,
    h2 INTEGER NOT NULL,
    ws INTEGER,
    wh INTEGER,
    PRIMARY KEY (h1, h2)
);

CREATE TABLE IF NOT EXISTS seen_ids (
    id TEXT NOT NULL PRIMARY KEY,
    ttl TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS reputation (
    token TEXT NOT NULL PRIMARY KEY,
    score REAL NOT NULL DEFAULT '0',
    count INTEGER NOT NULL DEFAULT '0',
    ttl TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### MySQL

For MySQL, a widely-used relational database management system, the schema is adapted as:

```sql
CREATE TABLE IF NOT EXISTS bayes_tokens (
    h1 INT NOT NULL,
    h2 INT NOT NULL,
    ws INT,
    wh INT,
    PRIMARY KEY (h1, h2)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seen_ids (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    ttl DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reputation (
    token VARCHAR(255) NOT NULL PRIMARY KEY,
    score FLOAT NOT NULL DEFAULT '0',
    count INT NOT NULL DEFAULT '0',
    ttl DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

## Queries

The spam filter relies on a series of queries to interact with the database, which are defined under the `etc/smtp/spamfilter.toml` configuration file. Please refer to the [directory](/docs/directory/overview) documentation for more information on how to configure SQL databases.

### SQLite

The following queries are used for SQLite:

```toml
[directory."spamdb".lookup]
token-insert = "INSERT INTO bayes_tokens (h1, h2, ws, wh) VALUES (?, ?, ?, ?) 
                ON CONFLICT(h1, h2) 
                DO UPDATE SET ws = ws + excluded.ws, wh = wh + excluded.wh"
token-lookup = "SELECT ws, wh FROM bayes_tokens WHERE h1 = ? AND h2 = ?"
id-insert = "INSERT INTO seen_ids (id, ttl) VALUES (?, datetime('now', ? || ' seconds'))"
id-lookup = "SELECT 1 FROM seen_ids WHERE id = ? AND ttl > CURRENT_TIMESTAMP"
reputation-insert = "INSERT INTO reputation (token, score, count, ttl) VALUES (?, ?, 1, datetime('now', '30 days')) 
                     ON CONFLICT(token) 
                     DO UPDATE SET score = (count + 1) * (excluded.score + 0.98 * score) / (0.98 * count + 1), count = count + 1, ttl = excluded.ttl"
reputation-lookup = "SELECT score, count FROM reputation WHERE token = ?"

[directory."spamdb".schedule]
query = ["DELETE FROM seen_ids WHERE ttl < CURRENT_TIMESTAMP", 
         "DELETE FROM reputation WHERE ttl < CURRENT_TIMESTAMP"]
frequency = "0 3 *"
```

### PostgreSQL

For PostgreSQL, the following queries are used:

```toml
[directory."spamdb".lookup]
token-insert = "INSERT INTO bayes_tokens (h1, h2, ws, wh) VALUES (?, ?, ?, ?)
                ON CONFLICT (h1, h2) DO UPDATE SET ws = bayes_tokens.ws + EXCLUDED.ws, wh = bayes_tokens.wh + EXCLUDED.wh"
token-lookup = "SELECT ws, wh FROM bayes_tokens WHERE h1 = ? AND h2 = ?"
id-insert = "INSERT INTO seen_ids (id, ttl) VALUES (?, NOW() + ? * INTERVAL '1 second')"
id-lookup = "SELECT 1 FROM seen_ids WHERE id = ? AND ttl > CURRENT_TIMESTAMP"
reputation-insert = "INSERT INTO reputation (token, score, count, ttl) VALUES (?, ?, 1, NOW() + INTERVAL '30 days')
                     ON CONFLICT (token) DO UPDATE SET score = (reputation.count + 1) * (EXCLUDED.score + 0.98 * reputation.score) / (0.98 * reputation.count + 1), count = reputation.count + 1, ttl = EXCLUDED.ttl"
reputation-lookup = "SELECT score, count FROM reputation WHERE token = ?"

[directory."spamdb".schedule]
query = ["DELETE FROM seen_ids WHERE ttl < CURRENT_TIMESTAMP", 
         "DELETE FROM reputation WHERE ttl < CURRENT_TIMESTAMP"]
frequency = "0 3 *"
```


### MySQL

For MySQL, the queries are adapted as:

```toml
[directory."spamdb".lookup]
token-insert = "INSERT INTO bayes_tokens (h1, h2, ws, wh) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE ws = ws + VALUES(ws), wh = wh + VALUES(wh)"
token-lookup = "SELECT ws, wh FROM bayes_tokens WHERE h1 = ? AND h2 = ?"
id-insert = "INSERT INTO seen_ids (id, ttl) VALUES (?, DATE_ADD(NOW(), INTERVAL ? SECOND))"
id-lookup = "SELECT 1 FROM seen_ids WHERE id = ? AND ttl > NOW()"
reputation-insert = "INSERT INTO reputation (token, score, count, ttl) VALUES (?, ?, 1, DATE_ADD(NOW(), INTERVAL 30 DAY))
                     ON DUPLICATE KEY UPDATE score = (count + 1) * (VALUES(score) + 0.98 * score) / (0.98 * count + 1), count = count + 1, ttl = VALUES(ttl)"
reputation-lookup = "SELECT score, count FROM reputation WHERE token = ?"

[directory."spamdb".schedule]
query = ["DELETE FROM seen_ids WHERE ttl < NOW()", 
         "DELETE FROM reputation WHERE ttl < NOW()"]
frequency = "0 3 *"
```

