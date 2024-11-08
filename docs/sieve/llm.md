---
sidebar_position: 5
---

# LLM Integration

Stalwart extends the functionality of the Sieve scripting language by introducing the `llm_prompt` function, enabling seamless integration of AI-powered analysis into email processing rules. This new function allows administrators and users to access any of the LLM [AI models](/docs/server/ai-models) configured in Stalwart directly from a Sieve script.

With the `llm_prompt` function, you can pass email content, such as the subject and body, to an AI model for analysis. The function sends the prompt and message data to the LLM, then processes the response according to the defined rules within the Sieve script. This opens up new possibilities for advanced email filtering, categorization, and processing beyond traditional Sieve rules.

For example, administrators can use the `llm_prompt` function to analyze incoming emails for specific patterns, classify messages, or detect potential threats, all within the familiar Sieve scripting environment. By combining the flexibility of Sieve with the intelligence of LLMs, Stalwart enables more sophisticated and adaptable email management workflows.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart Mail Server and not included in the Community Edition.

:::

## Usage

To use the `llm_prompt` function in a Sieve script, it is necessary to declare the extension `vnd.stalwart.expressions` at the beginning of the script. This declaration allows the use of extended functions provided by Stalwart, including those related to AI integration.

The `llm_prompt` function is available by default in [trusted scripts](/docs/sieve/interpreter/trusted), which are scripts executed with administrator privileges during the SMTP data stages. For security reasons, if users wish to utilize the `llm_prompt` function in[ untrusted scripts](/docs/sieve/interpreter/untrusted) (those created and managed by individual users), the associated user account must have the `ai-model-interact` [permission](/docs/auth/authorization/permissions) enabled. This ensures that only authorized users can access and interact with AI models, maintaining control over the system’s resources and privacy.

The `llm_prompt` function has the syntax `llm_prompt("model_name", "prompt", temperature)` where:

- The first parameter, `"model_name"`, is a string representing the ID of one of the [AI models](/docs/server/ai-models) configured in Stalwart. This must match one of the AI model IDs set up in the configuration.
- The second parameter, `"prompt"`, is the text or query sent to the AI model for processing. This is typically crafted to request specific information or a response based on the content of an incoming email.
- The third parameter, `temperature`, is a floating-point number between 0.0 and 1.0 that controls the randomness of the AI model's response. A lower value produces more deterministic and focused responses, while a higher value encourages more creative or varied outputs.

The function returns the response provided by the AI model, which can then be used within the Sieve script to perform further actions, such as filtering, categorizing, or flagging emails. If an error occurs during the interaction with the AI model, the function will return `false`, and detailed error information will be logged for troubleshooting purposes.

By incorporating the `llm_prompt` function into Sieve scripts, administrators and users can leverage powerful AI tools to create more intelligent and dynamic email processing rules.

## Caveats

Enabling the `llm_prompt` function within Sieve scripts brings significant power to email processing workflows, but it also introduces important performance and cost considerations, particularly when allowing users to interact with AI models directly.

### Performance Considerations

When the `llm_prompt` function is invoked from a Sieve script, each call requires the system to send a request to the configured AI model, whether it is self-hosted or cloud-based. In environments where many users or scripts frequently access this function, the volume of requests can lead to increased load on the server. If self-hosting AI models without sufficient hardware, particularly without GPU acceleration, this can result in significant delays in email processing. Passing each message or prompt through an LLM is computationally intensive, and without proper optimization, such as running on dedicated GPUs, users may experience slowdowns in receiving emails as the AI model processes requests. 

Administrators should carefully consider the hardware capabilities when deciding to allow wide access to AI models, especially for user-created scripts, as performance bottlenecks could degrade the overall email service.

### Cost Implications

When using cloud-based AI models from providers like OpenAI or Anthropic, each invocation of the `llm_prompt` function contributes to the total token usage, which directly impacts costs. Since cloud providers typically charge based on the number of tokens processed (both input and output), granting users the ability to call AI models from their Sieve scripts could lead to a rapid increase in API usage, and therefore, costs. 

For organizations with many users or a high volume of email traffic, the cumulative effect of frequent AI requests can quickly escalate. It is important to set clear policies on how and when users can interact with AI models and to monitor usage carefully. Administrators may also consider setting limits on API usage for user scripts or restricting access to the `llm_prompt` function to certain users or scenarios where it provides the most value.

### Managing Performance and Costs

To mitigate these challenges, administrators should evaluate both the infrastructure and financial impact before enabling AI model interaction for user scripts. Restricting usage to specific scenarios, ensuring efficient AI model hosting with the appropriate hardware, and closely monitoring cloud-based API costs are essential to maintaining a balance between functionality, performance, and budget. Properly managing user access to AI models helps ensure that the integration remains scalable and cost-effective.

## Example

The following example demonstrates how to use the `llm_prompt` function in a Sieve script to analyze the content of an incoming email and categorize it based on the response from an AI model. In this case, the script sends the email subject and body to the AI model for classification, then processes the response to determine the mailbox to which the email should be delivered.

```sieve
require ["fileinto", "vnd.stalwart.expressions"];

# Base prompt for email classification
let "prompt" '''You are an AI assistant tasked with classifying personal emails into specific folders. 
Your job is to analyze the email's subject and body, then determine the most appropriate folder for filing. 
Use only the folder names provided in your response.
If the category is not clear, respond with "Inbox".

Classification Rules:
- Family:
   * File here if the message is signed by a Doe family member
   * The recipient's name is John Doe
- Cycling:
   * File here if the message is related to cycling
   * File here if the message mentions the term "MAMIL"
- Work:
   * File here if the message mentions "Dunder Mifflin Paper Company, Inc." or any part of this name
   * File here if the message is related to paper supplies
   * Only classify as Work if it seems to be part of an existing sales thread or directly related to the company's operations
- Junk Mail:
   * File here if the message is trying to sell something and is not work-related
   * Remember that John lives a minimalistic lifestyle and is not interested in purchasing items
- Inbox:
   * Use this if the message doesn't clearly fit into any of the above categories

Analyze the following email and respond with only one of these folder names: Family, Cycling, Work, Junk Mail, or Inbox.
''';

# Prepare the base Subject and Body
let "subject" "thread_name(header.subject)";
let "body" "body.to_text";

# Send the prompt, subject, and body to the AI model
let "llm_response" "llm_prompt('gpt-4', prompt + '\n\nSubject: ' + subject + '\n\n' + body, 0.6)";

# Set the folder name
if eval "contains(['Family', 'Cycling', 'Work', 'Junk Mail'], llm_response)" {
    fileinto "llm_response";
}

```