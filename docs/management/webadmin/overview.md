---
sidebar_position: 1
---

# Overview

The Stalwart Web-based admin tool offers a convenient and user-friendly interface for managing and configuring Stalwart. Developed as a Single Page Application (SPA) using Rust, this tool offers a fluid user experience, as administrators can navigate through the different screens and make changes without the need for reloading the page. The choice of Rust for development emphasizes reliability and performance, aiming to provide a stable platform for server management. 

The web-based admin tool is designed to offer full control over Stalwart, enabling administrators to configure every aspect of its operation. From server settings and user accounts to security policies and server performance monitoring, the tool covers the functionality needed to operate the mail server.

The web-based admin tool also includes a self-service portal. This portal allows users to perform specific actions independently, such as changing their passwords and managing encryption-at-rest settings for their data. This gives users direct control over their account settings and reduces the administrative burden on IT staff by delegating routine tasks to the users themselves.

## Usage

To access the Webadmin, navigate to `http[s]://server-name[:PORT]/login` in a web browser. Entering the credentials of a valid administrator account grants full access to the Webadmin's management features. If the credentials do not correspond to an administrator account, the interface directs the user to the self-service portal for individual account management such as password changes and encryption-at-rest settings.

The Webadmin is designed to be self-explanatory, so detailed documentation of its functionality is not necessary. Given the breadth of configurable options in Stalwart, the Webadmin includes a search box at the top of the screen that allows administrators to quickly locate and navigate to specific settings.
