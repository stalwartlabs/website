## Next step

The server now sends and receives mail. Some protections depend on how the server is deployed and are therefore not active by default, so before the server is used in production, remove the plain HTTP listener on port 8080 unless a reverse proxy connects to it, remove `STALWART_RECOVERY_ADMIN` if it was set, and review the remaining settings in [Securing the server](/docs/install/security).

When something goes wrong, [Troubleshooting installation](/docs/install/troubleshooting) lists the installation problems by symptom, and [Troubleshooting](/docs/management/troubleshoot) covers the problems of a running server, such as a rejected message or a failed sign-in. The [FAQ](/docs/faq/) answers the most frequent questions, and questions not covered by the documentation can be asked on the [community forum](https://support.stalw.art).
