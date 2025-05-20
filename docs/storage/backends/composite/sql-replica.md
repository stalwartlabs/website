---
sidebar_position: 4
---

# SQL Read Replicas

SQL read replicas are a database architecture pattern used to improve performance and scalability by separating read and write operations. A primary database handles all write operations, ensuring that data is consistently updated and stored. Read replicas, on the other hand, are synchronized copies of the primary database and are used exclusively for read operations. This separation helps distribute the load, reducing strain on the primary database and enabling efficient handling of high-volume read queries.

In Stalwart, the SQL read replicas composite store allows administrators to leverage this pattern with any SQL database that supports read replicas, such as PostgreSQL, MySQL, MariaDB, Galera, or AlloyDB. By using SQL read replicas, administrators can enhance the server's performance in read-heavy environments while maintaining reliable data consistency.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

## Configuration

Configuring SQL read replicas in Stalwart is straightforward. The configuration requires specifying the ID of the primary SQL store for write operations, along with a list of one or more SQL read replica store IDs. This simple setup ensures that read and write operations are efficiently distributed across the defined stores, providing a robust and scalable solution for database management.

The following configuration settings are available for SQL Read Replica Stores, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of database, set to `"sql-read-replica"` for SQL read replicas.
- `primary`: The identifier of the primary SQL store that handles write operations.
- `replicas`: A list of SQL store identifiers that serve as read replicas. Each identifier corresponds to a read replica store backend, such as PostgreSQL, MySQL, or MariaDB.


## Example

```toml
[store."sql-read-replica"]
type = "sql-read-replica"
primary = "postgresql-primary"
replicas = ["postgresql-replica-1", "postgresql-replica-2"]
```

