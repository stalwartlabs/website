---
sidebar_position: 4
title: "LLM classifier"
---

The LLM classifier extends Stalwart's spam filtering by using a large language model to detect unsolicited, commercial, or harmful messages. It integrates with any configured [AI model](/docs/server/ai-models) and analyses message subjects and bodies through natural language processing, complementing the statistical classifier with higher-level semantic reasoning.

The LLM classifier sends a customisable prompt to the AI model, along with the subject and body of the message. The default prompt asks the model to assign one of four categories (Unsolicited, Commercial, Harmful, or Legitimate) and a confidence level (High, Medium, or Low). The returned category and confidence are combined into a tag, which is assigned to the message and contributes to the overall spam score through the [Scores](/docs/spamfilter/settings/scores) configuration. For example, `LLM_UNSOLICITED_HIGH` carries a default score of 3.0, while `LLM_LEGITIMATE_HIGH` carries −3.0.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Caveats

Integrating an LLM into spam filtering has performance and cost implications, especially under high message volumes.

### Performance considerations

When self-hosting AI models, throughput depends heavily on the hardware. Without dedicated hardware (in particular GPUs designed for machine-learning workloads), classifying every message with the LLM can introduce significant latency, because each call runs a substantial inference workload. CPU-only deployments in particular may see email intake slow down noticeably. Sites that self-host should ensure they have hardware headroom, preferably with GPU acceleration, before enabling the LLM classifier in production.

### Cost implications

For cloud-hosted AI models (such as those offered by OpenAI or Anthropic), the primary concern is cost rather than latency. Providers typically charge per token processed. Each message submitted to the model consumes tokens in proportion to the subject, body, and returned response, so costs scale with message volume. Sites using cloud-based models should estimate usage against the provider's pricing before enabling the LLM classifier on high-traffic servers.

In either case there is a trade-off between performance, cost, and the incremental accuracy the LLM adds over the statistical classifier.

## Configuration

The LLM classifier is configured on the [SpamLlm](/docs/ref/object/spam-llm) singleton (found in the WebUI under <!-- breadcrumb:SpamLlm --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › LLM Classifier<!-- /breadcrumb:SpamLlm -->). SpamLlm is a multi-variant object: the `Disable` variant turns the classifier off (the default), and the `Enable` variant activates it and carries the configuration fields.

### Model

The `Enable` variant requires an [`modelId`](/docs/ref/object/spam-llm#modelid) field referring to an [AiModel](/docs/ref/object/ai-model) object. For example, to use an AI model with id `chat`:

```json
{
  "@type": "Enable",
  "modelId": "chat"
}
```

### Prompt

The [`prompt`](/docs/ref/object/spam-llm#prompt) field carries the instructions sent to the AI model alongside each message. Administrators can rewrite the prompt to match local classification needs, for example:

```json
{
  "@type": "Enable",
  "modelId": "chat",
  "prompt": "You are an AI assistant specialized in analyzing email content to detect unsolicited, commercial, or harmful messages. Your task is to examine the provided email, including its subject line, and determine if it falls into any of these categories. Please follow these steps:\n\n- Carefully read the entire email content, including the subject line.\n- Look for indicators of unsolicited messages, such as:\n   * Lack of prior relationship or consent\n   * Mass-mailing characteristics\n   * Vague or misleading sender information\n- Identify commercial content by checking for:\n   * Promotional language\n   * Product or service offerings\n   * Call-to-action for purchases\n- Detect potentially harmful content by searching for:\n   * Phishing attempts (requests for personal information, suspicious links)\n   * Malware indicators (suspicious attachments, urgent calls to action)\n   * Scams or fraudulent schemes\n- Analyze the overall tone, intent, and legitimacy of the email.\n- Determine the most appropriate single category for the email: Unsolicited, Commercial, Harmful, or Legitimate.\n- Assess your confidence level in this determination: High, Medium, or Low.\n- Provide a brief explanation for your determination.\n- Format your response as follows, separated by commas: Category,Confidence,Explanation\n  * Example: Unsolicited,High,The email contains mass-mailing characteristics without any prior relationship context.\n\nHere's the email to analyze, please provide your analysis based on the above instructions, ensuring your response is in the specified comma-separated format:"
}
```

### Temperature

The [`temperature`](/docs/ref/object/spam-llm#temperature) field sets the sampling temperature used by the AI model. Lower values produce more deterministic responses, higher values introduce more variation. The default is `0.5`, which balances diversity and coherence.

### Responses

Response parsing extracts the category, confidence level, and explanation from the AI model's output. The category and confidence are concatenated with an underscore to form the tag assigned to the message; for example, an Unsolicited classification with High confidence produces the tag `LLM_UNSOLICITED_HIGH`.

The relevant fields are:

- [`separator`](/docs/ref/object/spam-llm#separator): the character used to split the AI model's response into fields. Default `,`.
- [`responsePosCategory`](/docs/ref/object/spam-llm#responseposcategory): zero-based index of the category in the response. Default `0`.
- [`responsePosConfidence`](/docs/ref/object/spam-llm#responseposconfidence): zero-based index of the confidence in the response. Default `1`.
- [`responsePosExplanation`](/docs/ref/object/spam-llm#responseposexplanation): zero-based index of the explanation in the response. Default `2`.
- [`categories`](/docs/ref/object/spam-llm#categories): accepted category labels. Responses outside this list are ignored. Default `["Unsolicited", "Commercial", "Harmful", "Legitimate"]`.
- [`confidence`](/docs/ref/object/spam-llm#confidence): accepted confidence labels. Responses outside this list are ignored. Default `["High", "Medium", "Low"]`.

Example showing the defaults explicitly:

```json
{
  "@type": "Enable",
  "modelId": "chat",
  "separator": ",",
  "categories": ["Unsolicited", "Commercial", "Harmful", "Legitimate"],
  "confidence": ["High", "Medium", "Low"],
  "responsePosCategory": 0,
  "responsePosConfidence": 1,
  "responsePosExplanation": 2
}
```

### Headers

When the LLM classifier is enabled, the `X-Spam-LLM` header is added to each analysed message and reports the category, confidence, and explanation returned by the AI model. The header is added unconditionally under its fixed name.
