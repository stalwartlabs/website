---
sidebar_position: 2
---

# Usage

Upon the initial execution of Stalwart, the Webadmin interface is automatically retrieved from the GitHub repository and stored locally within the server's [blob store](/docs/storage/blob) under the "STALWART_WEBADMIN" key, packaged as a zip file. This ensures that the management interface is readily available and updated without manual intervention. With every subsequent restart of Stalwart, the server fetches the Webadmin binary from the blob store, extracting it into a temporary directory. This process guarantees that the Webadmin is always available and updated for use immediately after Stalwart starts.

:::tip Note

By default the webadmin bundle is downloaded from `https://github.com/stalwartlabs/webadmin/releases/latest/download/webadmin.zip`, but this can be changed by setting the `config.resource.webadmin` key to a different URL or a local file (specified as `file:///path/to/webadmin.zip`).

:::

## Accessing

Accessing the Webadmin is straightforward. Users can navigate to `http[s]://servername[:PORT]/login` using a web browser. Here, by entering the credentials of a valid administrator account, users can gain full access to the Webadmin's comprehensive management features. Should the credentials not correspond to an administrator account, the interface will instead direct the user to the self-service portal, tailored for individual user account management such as password changes and encryption-at-rest settings.

The design of the Webadmin emphasizes intuitiveness and ease of use, making a detailed documentation of its functionality unnecessary. The interface is user-friendly and self-explanatory, designed to guide administrators smoothly through the various available settings and configurations. Recognizing the breadth of configurable options within Stalwart, the Webadmin includes a search box at the top section of the screen. This feature allows administrators to quickly locate and navigate to specific settings, streamlining the management process.

## Updates

Staying current with the latest Webadmin version is simple. Administrators can download and install new updates automatically by navigating to `Maintenance` > `Update Webadmin` within the Webadmin interface. This feature ensures that the management tool remains up-to-date with the latest features and security enhancements, fostering a secure and efficient administrative experience.