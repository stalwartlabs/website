---
sidebar_position: 3
---

# Response

The response object is a JSON structure that specifies the action to be taken by the SMTP server after processing the request. It may include instructions on how to modify the message or the SMTP transaction.

## Action

The `action` field specifies the action the SMTP server should take. Possible values are:
- **accept**: Accept the message for delivery.
- **discard**: Discard the message without further processing.
- **reject**: Reject the message and return an error to the client.
- **quarantine**: Quarantine the message for further inspection.

## Response

The `response` object is optional and provides details on how the SMTP server should reply to the client.

- **status**: The SMTP status code to return (e.g., 250 for success).
- **enhancedStatus**: The enhanced status code to return (e.g., 2.0.0 for success).
- **message**: The message to return to the client.
- **disconnect**: A boolean indicating whether the client should be disconnected after the response.

## Modifications

The `modifications` array contains a list of modifications that should be applied to the message or transaction. Each modification is an object with a specific type and relevant fields.

The following modification types are supported:

### changeFrom

This modification changes the sender address of the email message. It contains the following fields:

- **value**: The new sender address.
- **parameters**: Additional parameters associated with the sender (optional).

### addRcpt

This modification adds a new recipient to the email message. It contains the following fields:

- **value**: The email address of the new recipient.
- **parameters**: Additional parameters associated with the recipient (optional).

### deleteRcpt

This modification deletes a recipient from the email message. It contains the following field:

- **value**: The email address of the recipient to be deleted.

### replaceContents

This modification replaces the body of the email message. It contains the following field:

- **value**: The new body of the email message.

### addHeader

This modification adds a new header to the email message. It contains the following fields:

- **name**: The name of the header to be added.
- **value**: The value of the header to be added.

### insertHeader

This modification inserts a new header at a specific position in the list of headers. It contains the following fields:

- **index**: The position at which the header should be inserted.
- **name**: The name of the header to be inserted.
- **value**: The value of the header to be inserted.

### changeHeader

This modification changes the value of a header in the email message. It contains the following fields:

- **index**: The position of the header to be changed.
- **name**: The name of the header to be changed.
- **value**: The new value of the header.

### deleteHeader

- **index**: The position of the header to be deleted.
- **name**: The name of the header to be deleted.

## Example

Below is an example of a response object:

```json
{
    "action": "accept",
    "response": {
        "status": 250,
        "enhancedStatus": "2.0.0",
        "message": "Message accepted",
        "disconnect": false
    },
    "modifications": [
        {
            "type": "changeFrom",
            "value": "new@example.com",
            "parameters": {
                "size": 54321
            }
        },
        {
            "type": "addRecipient",
            "value": "tom@example.com",
            "parameters": null
        },
        {
            "type": "deleteRecipient",
            "value": "jane@foobar.com"
        },
        {
            "type": "replaceContents",
            "value": "This is the new body\r\n"
        },
        {
            "type": "addHeader",
            "name": "X-Spam-Status",
            "value": "No"
        },
        {
            "type": "insertHeader",
            "index": 1,
            "name": "X-Filtered-By",
            "value": "Custom Filter v1.1"
        },
        {
            "type": "changeHeader",
            "index": 4,
            "name": "Subject",
            "value": "This is the new subject"
        },
        {
            "type": "deleteHeader",
            "index": 1,
            "name": "X-Mailer"
        }
    ]
}
```
