The address given to `--url` is only where Vandelay fetches the JMAP session. After fetching it, Vandelay sends its requests to the API, upload and download URLs that the session advertises, as JMAP requires of a client.

Some servers serve their API and their blobs from different hosts, so an advertised URL with an origin (scheme, host and port) other than that of `--url` is not an error. Vandelay prints a warning such as the following, and continues with the advertised URL:

```text
warning: session advertises apiUrl, uploadUrl, downloadUrl on https://mail.example.org (connected to https://mail.example.org:10443); vandelay must use the advertised URL. If this is wrong, fix the server's advertised HTTP URL setting.
```

The usual cause of this warning is a server that is reachable on a port other than 443 but advertises URLs without that port. Requests then reach whatever else listens on port 443, and fail, often with `404 Not Found`. Vandelay stops with exit code 2 at the first data type.

The fix is on the server: its public URL must be the full address that clients use, including the port. On Stalwart, the public URL is set with the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables) environment variable.
