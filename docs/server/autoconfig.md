---
sidebar_position: 8
---

# Autoconfig 

Autoconfig and Autodiscover are protocols designed to simplify the configuration of email clients by automatically providing them with the necessary server settings. These protocols are essential in modern email infrastructures as they improve the user experience by minimizing manual configuration errors and reducing setup time.

The Autoconfig protocol, an IETF draft, is designed to automatically configure an email client with the appropriate mail server settings using a standardized XML file format. When an email client starts, it queries a predefined URL based on the user's email domain to retrieve the configuration settings. For instance, if a user's email is `user@example.com`, the client might attempt to fetch settings from `http://autoconfig.example.com/mail/config-v1.1.xml`. The XML file provided at this URL contains all necessary details such as server addresses, port numbers, and encryption methods required to set up the email client.

Autodiscover, popularized by Microsoft, operates similarly by automating the discovery of server settings to configure email clients like Outlook. It uses either a predefined URL or an SCP (Service Connection Point) lookup in Active Directory environments. The client sends a request to a URL derived from the user's email domain, such as `https://autodiscover.example.com/autodiscover/autodiscover.xml`. The response, an XML file, includes critical configuration details such as the protocol to use, server URLs, and other parameters that the email client needs to connect to the server.

## Configuration

Stalwart Mail Server supports both Autoconfig and Autodiscover protocols, ensuring compatibility with a wide range of email clients and enhancing user accessibility. Implementing these protocols in Stalwart does not require any additional configuration specific to these protocols.

In order to enable Autoconfig and Autodiscover in Stalwart Mail Server, ensure that the server is configured to listen on port 443 and that the necessary DNS records are set up to point to the server's IP address. Once these prerequisites are met, the server will automatically generate the required XML files for Autoconfig and Autodiscover, making it easier for users to configure their email clients and access their mailboxes without manual intervention.

Stalwart Mail server can automatically generate the autoconfig and autodiscover DNS records for your domains. To obtain them, go to the `Management` > `Directory` > `Domains` section in the [Webadmin](/docs/management/webadmin/overview.md).
