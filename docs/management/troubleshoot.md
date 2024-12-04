---
sidebar_position: 3
---

# Troubleshooting

Stalwart Mail Server provides a comprehensive suite of tools to assist administrators in diagnosing and resolving issues related to email delivery, authentication, and compliance with security standards. These tools are integrated into the server’s interface, offering detailed insights into the email processing pipeline and enabling effective troubleshooting. Below are instructions and explanations for utilizing these features.

## Email Delivery Issues

Stalwart includes a dedicated tool for testing email delivery to help administrators identify and resolve potential issues. This tool can be accessed through the [Webadmin](/docs/management/webadmin/overview) interface under **Manage -> Troubleshoot -> Email Delivery**. Administrators can use it to simulate the email delivery process without actually sending an email. To initiate the test, an email address or domain name must be provided. 

Once the test begins, the tool displays each step of the delivery process in real-time. It starts by resolving the MX records for the specified domain to identify its mail servers, then retrieves the corresponding IP addresses. It continues by validating the domain's email security policies, such as MTA-STS and DANE, ensuring compliance and upgrading the connection to TLS for secure transmission. Finally, the tool verifies the recipient’s availability. 

Importantly, this testing tool does not send any email messages. Instead, it verifies the delivery path and the recipient, ensuring no unnecessary or intrusive actions are taken. If any issues arise during the simulation, they are reported on-screen with detailed error messages, allowing administrators to pinpoint the exact step where the process fails.

## DMARC

To verify DMARC compliance, Stalwart provides a specialized tool accessible in the [Webadmin](/docs/management/webadmin/overview) interface under **Manage -> Troubleshoot -> DMARC**. This tool allows administrators to assess DMARC settings for both local and remote domains by simulating the server’s message authentication process. 

Using the tool requires specific inputs, including the mail from sender address, server IP address, EHLO hostname, and optionally, the message body. The mail from sender address is the email address used during the SMTP "MAIL FROM" command. The server IP address refers to the server that will send the email. The EHLO hostname is the domain name sent in the EHLO/HELO command to identify the sending server. The message body, while optional, is necessary for verifying DKIM and ARC signatures, but it can be omitted if only SPF compliance is being checked.

The tool performs checks for SPF, DKIM, ARC, and DMARC compliance. It also verifies that the reverse IP PTR record matches the SPF EHLO hostname, ensuring proper server configuration. By simulating the exact checks Stalwart performs when receiving a message, this tool provides a comprehensive analysis of the domain's email authentication setup and identifies potential issues.

## Authentication Issues

For authentication problems, administrators should begin by examining the server [logs](/docs/telemetry/tracing/log), where any authentication failures or warnings will be recorded. These logs are located in the system's designated logging directory for the Stalwart Mail Server. The logs typically include error messages with specific details about the failed authentication attempts.

If the information in the logs is insufficient to diagnose the issue, administrators can increase the log verbosity by setting the log level to `trace`. This detailed logging level provides a granular view of the authentication process, capturing all actions and interactions during the login attempt. With these enhanced logs, administrators can identify configuration errors or issues with credentials, protocols, or communication between the client and server.

