---
sidebar_position: 1
---

# Overview

MTA Hooks is a replacement for the milter protocol for managing and processing email transactions within Mail Transfer Agents (MTAs). Unlike milter, which operates at a lower level and uses a custom protocol, MTA Hooks uses HTTP, which makes integration and deployment simpler.

MTA Hooks is built on HTTP, which makes integration and debugging simpler than with custom binary protocols. It uses JSON for both requests and responses. Each stage of the SMTP transaction is handled by sending a POST request to a specified HTTP endpoint. MTA Hooks can be invoked at any point in the SMTP transaction, from the initial connection phase to final message delivery, giving full control over the email processing workflow.

The typical workflow of MTA Hooks begins when the Mail Transfer Agent (MTA) reaches a particular stage in the SMTP transaction. At this point, the MTA sends a POST request containing a JSON payload to the MTA Hooks endpoint. This payload includes detailed information about the transaction, such as client and server details, message envelope, and message content. The endpoint processes this request and responds with a JSON object specifying the action to be taken by the MTA. This response can include directives such as accepting, rejecting, discarding, or quarantining the message, along with any necessary modifications to the message or transaction. Based on the response received, the MTA executes the specified actions, applying any modifications as instructed, thus completing the transaction stage.

