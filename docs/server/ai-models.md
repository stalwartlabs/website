---
sidebar_position: 9
---

# AI Models

Stalwart supports the integration of AI models, enabling advanced email processing capabilities. AI models, particularly Large Language Models (LLMs), are powerful tools that can analyze and interpret the content of emails to perform a variety of tasks. With the integration of AI, Stalwart can be configured to handle sophisticated operations such as [spam classification](/docs/spamfilter/llm), threat detection, [message categorization](/docs/sieve/llm), and more.

Stalwart is designed to be flexible, allowing users to leverage cloud-based AI models from providers like OpenAI or Anthropic, or alternatively, access locally hosted models using solutions such as LocalAI. Any AI model that provides an OpenAI-compatible API can be seamlessly integrated into Stalwart, giving administrators the freedom to choose between cloud-based or on-premise AI infrastructure, depending on their needs and privacy requirements.

By integrating with these AI models, Stalwart enhances email security, streamlines email management, and improves overall performance, making it a robust solution for modern email environments.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

## Configuration

Stalwart allows for the integration of AI models through a configurable section in its configuration file. This section provides a flexible framework to define how the server interacts with AI models, including settings for connection, authentication, and behavior customization.

Below is a description of the available configuration options under the `enterprise.ai.<id>` section of the configuration file:

- **`endpoint`**: This option specifies the API endpoint that the Stalwart will use to interact with the AI model. It should be a fully qualified URL that points to the appropriate AI service, whether it is a cloud-based provider or a locally hosted instance.
- **`model`**: This option defines the specific AI model to be used for processing requests. The value can represent any model supported by the selected endpoint, such as a particular version of an LLM (e.g., GPT-4).
- **`type`**: This option indicates the type of completion the AI model should handle. It can either be set to `chat` for handling chat-style completions or `text` for traditional text completions.
- **`timeout`**: This option sets the maximum amount of time the server will wait for a response from the AI model before timing out. This value can be customized based on performance requirements.
- **`default-temperature`**: This option controls the level of randomness in the AI model’s responses. A lower value makes the output more focused and deterministic, while a higher value encourages more creative or varied responses.
- **`allow-invalid-certs`**: This option determines whether or not to allow invalid SSL/TLS certificates when connecting to the AI model’s endpoint. This is typically useful for local or self-hosted models, but for security reasons, should be set cautiously in production environments.
- **`headers`**: This option allows you to specify additional HTTP headers to be included in requests sent to the AI model endpoint. These headers can be used to pass custom information or configure special options required by the AI service.
- **`auth.token`**: For secure access to the AI model, this option defines the authentication token used for authorization when making requests to the AI endpoint. The token is sent as part of the request to authenticate the Stalwart with the AI service.

Example:

```toml
[enterprise.ai."chat"]
endpoint = "https://api.openai.com/v1/chat/completions"
model = "gpt-4"
type = "chat"
timeout = "2m"
default-temperature = "0.7"
allow-invalid-certs = "false"
headers = [ "X-My-Header: my-value" ]

[enterprise.ai."chat".auth]
token = "my-secret-token"
```
