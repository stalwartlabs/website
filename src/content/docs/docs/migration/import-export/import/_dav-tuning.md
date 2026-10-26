| Option | Default | Effect |
| --- | --- | --- |
| `--dav-connections <N>` | `4` | Parallel connections to the server, from 1 to 8, and at most `--threads`. |
| `--multiget-batch <N>` | `50` | Number of resources requested per `calendar-multiget` or `addressbook-multiget` REPORT. Has no effect on WebDAV, which reads each file with its own request. |

More connections shorten the copy of a large collection, and increase the load on the server. Larger batches reduce the number of requests on servers that handle them well, while smaller batches suit servers with strict request limits.
