---
sidebar_position: 1
---

# Overview

The Stalwart Web-based admin tool offers a convenient and user-friendly interface for managing and configuring Stalwart Mail Server. Developed as a Single Page Application (SPA) using Rust, this tool offers a fluid user experience, as administrators can navigate through the different screens and make changes without the need for reloading the page. The choice of Rust for development emphasizes reliability and performance, aiming to provide a stable platform for server management. 

The web-based admin tool is designed to offer comprehensive control over Stalwart Mail Server, enabling administrators to fine-tune every single aspect of its operation. From configuring server settings and managing user accounts to setting up security policies and monitoring server performance, the tool encapsulates all the functionalities needed to ensure that the mail server runs optimally and securely.

Additionally, recognizing the importance of user autonomy in certain administrative aspects, the web-based admin tool includes a self-service portal. This portal empowers users with the ability to undertake specific actions independently, such as changing their passwords and managing encryption-at-rest settings for their data. This not only enhances the user experience by giving them direct control over their account settings but also reduces the administrative burden on IT staff by delegating routine tasks back to the users themselves.

## Usage

Accessing the Webadmin is straightforward. Users can navigate to `http[s]://server-name[:PORT]/login` using a web browser. Here, by entering the credentials of a valid administrator account, users can gain full access to the Webadmin's comprehensive management features. Should the credentials not correspond to an administrator account, the interface will instead direct the user to the self-service portal, tailored for individual user account management such as password changes and encryption-at-rest settings.

The design of the Webadmin emphasizes intuitiveness and ease of use, making a detailed documentation of its functionality unnecessary. The interface is user-friendly and self-explanatory, designed to guide administrators smoothly through the various available settings and configurations. Recognizing the breadth of configurable options within Stalwart, the Webadmin includes a search box at the top section of the screen. This feature allows administrators to quickly locate and navigate to specific settings, streamlining the management process.
